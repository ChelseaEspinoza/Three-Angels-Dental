// =====================================================================
//  API de Three Angels Dental
//  - Pública: catálogo, registro de pedidos y citas
//  - Administración (/admin/*): requiere iniciar sesión
//  Nginx publica esta API en https://tu-dominio/api/...
// =====================================================================
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const seed = require('./seed.json');
const { calcular } = require('./estadisticas');

const app = express();
// 10 MB para permitir subir imágenes (llegan como texto base64 desde el panel).
app.use(express.json({ limit: '10mb' }));

// Carpeta donde se guardan las imágenes subidas (en Docker es un volumen persistente).
const CARPETA_IMAGENES = process.env.CARPETA_IMAGENES || path.join(__dirname, 'uploads');
fs.mkdirSync(CARPETA_IMAGENES, { recursive: true });
app.use(cors());

const PORT = process.env.PORT || 5000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ThreeAngels2026!';
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_HORAS = 12;
const ZONA = process.env.ZONA_HORARIA || 'America/La_Paz';
/** Fecha de hoy en Bolivia (AAAA-MM-DD), aunque el servidor esté en UTC. */
const hoyLocal = () => new Date().toLocaleDateString('en-CA', { timeZone: ZONA });

if (!process.env.TOKEN_SECRET) {
  console.warn('⚠️  TOKEN_SECRET no definido: las sesiones de administrador se cerrarán al reiniciar el servidor.');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'database',
  user: process.env.DB_USER || 'dental_user',
  password: process.env.DB_PASSWORD || 'dental_password',
  database: process.env.DB_NAME || 'dental_db',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

const q = async (sql, params = []) => (await pool.query(sql, params))[0];

// ---------------------------------------------------------------------
// Base de datos: crea las tablas y carga datos iniciales si están vacías
// ---------------------------------------------------------------------
const ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS admins (
     id INT AUTO_INCREMENT PRIMARY KEY,
     usuario VARCHAR(60) NOT NULL UNIQUE,
     password_hash VARCHAR(200) NOT NULL,
     creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS productos (
     id VARCHAR(60) PRIMARY KEY,
     nombre VARCHAR(120) NOT NULL,
     categoria VARCHAR(60) NOT NULL,
     precio DECIMAL(10,2) NOT NULL,
     descripcion TEXT,
     icono VARCHAR(20),
     imagen VARCHAR(255),
     destacado TINYINT DEFAULT 0,
     stock INT DEFAULT 0,
     activo TINYINT DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS servicios (
     id VARCHAR(60) PRIMARY KEY,
     nombre VARCHAR(120) NOT NULL,
     categoria VARCHAR(60) NOT NULL,
     precio DECIMAL(10,2) NOT NULL,
     desde TINYINT DEFAULT 0,
     duracion VARCHAR(40),
     resumen TEXT,
     incluye TEXT,
     imagen VARCHAR(255),
     alt VARCHAR(255),
     orden INT DEFAULT 0,
     activo TINYINT DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS pedidos (
     id INT AUTO_INCREMENT PRIMARY KEY,
     cliente VARCHAR(120) NOT NULL,
     telefono VARCHAR(40) NOT NULL,
     direccion VARCHAR(255),
     ubicacion VARCHAR(255),
     items TEXT NOT NULL,
     total_bs DECIMAL(10,2) NOT NULL,
     metodo VARCHAR(20) NOT NULL,
     paypal_id VARCHAR(80),
     estado VARCHAR(20) NOT NULL DEFAULT 'nuevo',
     creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS ajustes (
     clave VARCHAR(60) PRIMARY KEY,
     valor TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS citas (
     id INT AUTO_INCREMENT PRIMARY KEY,
     servicio_id VARCHAR(60),
     servicio VARCHAR(120) NOT NULL,
     fecha DATE NOT NULL,
     hora VARCHAR(5) NOT NULL,
     paciente VARCHAR(120) NOT NULL,
     telefono VARCHAR(40) NOT NULL,
     email VARCHAR(120),
     primera_vez TINYINT DEFAULT 0,
     notas TEXT,
     monto_bs DECIMAL(10,2) DEFAULT 0,
     metodo VARCHAR(20) NOT NULL,
     paypal_id VARCHAR(80),
     estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
     creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
];

async function iniciarBase() {
  for (const sql of ESQUEMA) await q(sql);

  if ((await q('SELECT COUNT(*) AS n FROM admins'))[0].n == 0) {
    await q('INSERT INTO admins (usuario, password_hash) VALUES (?, ?)', [ADMIN_USER, hashPassword(ADMIN_PASSWORD)]);
    console.log(`👤 Administrador creado: usuario "${ADMIN_USER}". Cambia la contraseña desde el panel.`);
  }
  if ((await q('SELECT COUNT(*) AS n FROM productos'))[0].n == 0) {
    for (const p of seed.productos) await guardarProducto(p, true);
    console.log(`📦 ${seed.productos.length} productos iniciales cargados.`);
  }
  if ((await q('SELECT COUNT(*) AS n FROM servicios'))[0].n == 0) {
    let orden = 0;
    for (const s of seed.servicios) await guardarServicio({ ...s, orden: orden++ }, true);
    console.log(`🦷 ${seed.servicios.length} servicios iniciales cargados.`);
  }
}

// ---------------------------------------------------------------------
// Seguridad: contraseñas (scrypt) y sesiones firmadas (HMAC)
// ---------------------------------------------------------------------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}

function verificarPassword(password, guardado) {
  const [salt, hash] = String(guardado).split(':');
  if (!salt || !hash) return false;
  const calc = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(calc, Buffer.from(hash, 'hex'));
}

const b64 = (s) => Buffer.from(s).toString('base64url');
const firmar = (data) => crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('base64url');

function crearToken(usuario) {
  const datos = b64(JSON.stringify({ u: usuario, exp: Date.now() + TOKEN_HORAS * 3600e3 }));
  return `${datos}.${firmar(datos)}`;
}

function leerToken(token) {
  const [datos, firma] = String(token || '').split('.');
  if (!datos || !firma) return null;
  const esperada = firmar(datos);
  if (firma.length !== esperada.length || !crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))) return null;
  const payload = JSON.parse(Buffer.from(datos, 'base64url').toString());
  return payload.exp > Date.now() ? payload : null;
}

function soloAdmin(req, res, next) {
  const sesion = leerToken((req.headers.authorization || '').replace(/^Bearer /, ''));
  if (!sesion) return res.status(401).json({ error: 'Sesión vencida. Vuelve a iniciar sesión.' });
  req.admin = sesion.u;
  next();
}

// Límite de intentos de inicio de sesión: 5 cada 15 minutos por IP.
const intentos = new Map();
const ipDe = (req) => req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
function limiteLogin(req, res, next) {
  const ip = ipDe(req);
  const ahora = Date.now();
  const lista = (intentos.get(ip) || []).filter((t) => ahora - t < 15 * 60e3);
  if (lista.length >= 5) return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos.' });
  lista.push(ahora);
  intentos.set(ip, lista);
  next();
}

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
const texto = (v, max = 255) => (v == null ? null : String(v).trim().slice(0, max) || null);
const numero = (v) => (Number.isFinite(Number(v)) ? Number(v) : NaN);
const slug = (s) =>
  String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

const ruta = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Error interno del servidor' });
  });

function error(status, message) {
  return Object.assign(new Error(message), { status });
}

const productoDeFila = (r) => ({
  id: r.id, nombre: r.nombre, categoria: r.categoria, precio: Number(r.precio), descripcion: r.descripcion || '',
  icono: r.icono || '🦷', imagen: r.imagen || undefined, destacado: !!r.destacado,
  stock: r.stock == null ? null : Number(r.stock), activo: !!r.activo,
});

const servicioDeFila = (r) => ({
  id: r.id, nombre: r.nombre, categoria: r.categoria, precio: Number(r.precio), desde: !!r.desde,
  duracion: r.duracion || '', resumen: r.resumen || '', incluye: JSON.parse(r.incluye || '[]'),
  imagen: r.imagen || '/3.jpeg', alt: r.alt || r.nombre, orden: Number(r.orden || 0), activo: !!r.activo,
});

async function guardarProducto(p, nuevo) {
  if (!texto(p.nombre) || !texto(p.categoria) || !(numero(p.precio) >= 0)) throw error(400, 'Nombre, categoría y precio son obligatorios.');
  const fila = [
    texto(p.nombre, 120), texto(p.categoria, 60), numero(p.precio), texto(p.descripcion, 2000), texto(p.icono, 20),
    texto(p.imagen), p.destacado ? 1 : 0, Number.isInteger(Number(p.stock)) ? Number(p.stock) : 0, p.activo === false ? 0 : 1,
  ];
  if (nuevo) {
    const id = texto(p.id, 60) || slug(p.nombre);
    if ((await q('SELECT id FROM productos WHERE id = ?', [id])).length) throw error(409, 'Ya existe un producto con ese código.');
    await q('INSERT INTO productos (nombre, categoria, precio, descripcion, icono, imagen, destacado, stock, activo, id) VALUES (?,?,?,?,?,?,?,?,?,?)', [...fila, id]);
    return id;
  }
  await q('UPDATE productos SET nombre=?, categoria=?, precio=?, descripcion=?, icono=?, imagen=?, destacado=?, stock=?, activo=? WHERE id=?', [...fila, p.id]);
  return p.id;
}

async function guardarServicio(s, nuevo) {
  if (!texto(s.nombre) || !texto(s.categoria) || !(numero(s.precio) >= 0)) throw error(400, 'Nombre, categoría y precio son obligatorios.');
  const incluye = Array.isArray(s.incluye) ? s.incluye.map((x) => texto(x, 120)).filter(Boolean) : [];
  const fila = [
    texto(s.nombre, 120), texto(s.categoria, 60), numero(s.precio), s.desde ? 1 : 0, texto(s.duracion, 40),
    texto(s.resumen, 2000), JSON.stringify(incluye), texto(s.imagen), texto(s.alt), Number(s.orden) || 0, s.activo === false ? 0 : 1,
  ];
  if (nuevo) {
    const id = texto(s.id, 60) || slug(s.nombre);
    if ((await q('SELECT id FROM servicios WHERE id = ?', [id])).length) throw error(409, 'Ya existe un servicio con ese código.');
    await q('INSERT INTO servicios (nombre, categoria, precio, desde, duracion, resumen, incluye, imagen, alt, orden, activo, id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [...fila, id]);
    return id;
  }
  await q('UPDATE servicios SET nombre=?, categoria=?, precio=?, desde=?, duracion=?, resumen=?, incluye=?, imagen=?, alt=?, orden=?, activo=? WHERE id=?', [...fila, s.id]);
  return s.id;
}

// =====================================================================
//  RUTAS PÚBLICAS (las usa la página del cliente)
// =====================================================================
app.get('/', (req, res) => res.send('API de Three Angels Dental funcionando correctamente'));
app.get('/salud', ruta(async (req, res) => { await q('SELECT 1'); res.json({ ok: true }); }));

app.get('/productos', ruta(async (req, res) => {
  res.json((await q('SELECT * FROM productos WHERE activo = 1 ORDER BY destacado DESC, nombre')).map(productoDeFila));
}));

app.get('/servicios', ruta(async (req, res) => {
  res.json((await q('SELECT * FROM servicios WHERE activo = 1 ORDER BY orden, nombre')).map(servicioDeFila));
}));

// Registra un pedido de la tienda. El total se recalcula con los precios de la base
// (no se confía en el precio enviado por el navegador) y se descuenta el stock.
app.post('/pedidos', ruta(async (req, res) => {
  const { cliente, telefono, direccion, ubicacion, items, metodo, paypalId } = req.body || {};
  if (!texto(cliente) || !texto(telefono)) throw error(400, 'Nombre y teléfono son obligatorios.');
  if (!['paypal', 'whatsapp'].includes(metodo)) throw error(400, 'Método de pago no válido.');
  if (!Array.isArray(items) || !items.length || items.length > 50) throw error(400, 'El pedido no tiene productos.');

  const detalle = [];
  for (const it of items) {
    const cantidad = Math.floor(numero(it.cantidad));
    if (!(cantidad > 0 && cantidad <= 99)) throw error(400, 'Cantidad no válida.');
    const [p] = await q('SELECT * FROM productos WHERE id = ? AND activo = 1', [it.id]);
    if (!p) throw error(400, `El producto ${it.id} ya no está disponible.`);
    if (p.stock != null && Number(p.stock) < cantidad) throw error(409, `Solo quedan ${p.stock} unidades de ${p.nombre}.`);
    detalle.push({ id: p.id, nombre: p.nombre, precio: Number(p.precio), cantidad });
  }
  const total = detalle.reduce((s, d) => s + d.precio * d.cantidad, 0);
  const r = await q(
    'INSERT INTO pedidos (cliente, telefono, direccion, ubicacion, items, total_bs, metodo, paypal_id, estado) VALUES (?,?,?,?,?,?,?,?,?)',
    [texto(cliente, 120), texto(telefono, 40), texto(direccion), texto(ubicacion), JSON.stringify(detalle), total, metodo,
     texto(paypalId, 80), metodo === 'paypal' ? 'pagado' : 'nuevo'],
  );
  for (const d of detalle) await q('UPDATE productos SET stock = stock - ? WHERE id = ? AND stock IS NOT NULL', [d.cantidad, d.id]);
  res.status(201).json({ id: r.insertId, total });
}));

// Horas ya reservadas en una fecha (para no ofrecerlas de nuevo).
app.get('/citas/ocupadas', ruta(async (req, res) => {
  const fecha = String(req.query.fecha || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw error(400, 'Fecha no válida.');
  const filas = await q("SELECT hora FROM citas WHERE fecha = ? AND estado <> 'cancelada'", [fecha]);
  res.json(filas.map((f) => f.hora));
}));

app.post('/citas', ruta(async (req, res) => {
  const { servicioId, fecha, hora, paciente, telefono, email, primeraVez, notas, metodo, paypalId, montoBs } = req.body || {};
  if (!texto(paciente) || !texto(telefono)) throw error(400, 'Nombre y teléfono son obligatorios.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !/^\d{2}:\d{2}$/.test(hora || '')) throw error(400, 'Fecha u hora no válida.');
  if (!['paypal', 'whatsapp'].includes(metodo)) throw error(400, 'Método de pago no válido.');
  const [s] = await q('SELECT * FROM servicios WHERE id = ?', [servicioId]);
  if (!s) throw error(400, 'Especialidad no válida.');
  const ocupada = await q("SELECT id FROM citas WHERE fecha = ? AND hora = ? AND estado <> 'cancelada'", [fecha, hora]);
  if (ocupada.length) throw error(409, 'Ese horario acaba de ser reservado. Elige otra hora.');
  const r = await q(
    'INSERT INTO citas (servicio_id, servicio, fecha, hora, paciente, telefono, email, primera_vez, notas, monto_bs, metodo, paypal_id, estado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [s.id, s.nombre, fecha, hora, texto(paciente, 120), texto(telefono, 40), texto(email, 120), primeraVez ? 1 : 0, texto(notas, 2000),
     metodo === 'paypal' ? numero(montoBs) || 0 : 0, metodo, texto(paypalId, 80), metodo === 'paypal' ? 'confirmada' : 'pendiente'],
  );
  res.status(201).json({ id: r.insertId });
}));

// =====================================================================
//  RUTAS DE ADMINISTRACIÓN
// =====================================================================
app.post('/admin/login', limiteLogin, ruta(async (req, res) => {
  const { usuario, password } = req.body || {};
  const [a] = await q('SELECT * FROM admins WHERE usuario = ?', [texto(usuario, 60)]);
  if (!a || !verificarPassword(String(password || ''), a.password_hash)) throw error(401, 'Usuario o contraseña incorrectos.');
  intentos.delete(ipDe(req)); // login correcto: se reinicia el contador
  res.json({ token: crearToken(a.usuario), usuario: a.usuario });
}));

app.use('/admin', soloAdmin);

app.put('/admin/password', ruta(async (req, res) => {
  const { actual, nueva } = req.body || {};
  const [a] = await q('SELECT * FROM admins WHERE usuario = ?', [req.admin]);
  if (!a || !verificarPassword(String(actual || ''), a.password_hash)) throw error(400, 'La contraseña actual no es correcta.');
  if (String(nueva || '').length < 8) throw error(400, 'La nueva contraseña debe tener al menos 8 caracteres.');
  await q('UPDATE admins SET password_hash = ? WHERE id = ?', [hashPassword(String(nueva)), a.id]);
  res.json({ ok: true });
}));

app.get('/admin/resumen', ruta(async (req, res) => {
  const hoy = hoyLocal();
  const mes = hoy.slice(0, 7);
  const [pn] = await q("SELECT COUNT(*) AS n FROM pedidos WHERE estado IN ('nuevo','pagado')");
  const [cp] = await q("SELECT COUNT(*) AS n FROM citas WHERE fecha >= ? AND estado IN ('pendiente','confirmada')", [hoy]);
  const [vm] = await q("SELECT COALESCE(SUM(total_bs),0) AS t, COUNT(*) AS n FROM pedidos WHERE estado <> 'cancelado' AND creado >= ?", [`${mes}-01`]);
  const bajoStock = await q('SELECT id, nombre, stock FROM productos WHERE activo = 1 AND stock IS NOT NULL AND stock <= 5 ORDER BY stock');
  const proximas = await q("SELECT * FROM citas WHERE fecha >= ? AND estado IN ('pendiente','confirmada') ORDER BY fecha, hora LIMIT 5", [hoy]);
  res.json({
    pedidosPendientes: Number(pn.n), citasProximas: Number(cp.n), ventasMesBs: Number(vm.t), pedidosMes: Number(vm.n),
    bajoStock, proximas,
  });
}));

// Estadísticas: pacientes atendidos, ventas, servicios y productos más pedidos.
app.get('/admin/estadisticas', ruta(async (req, res) => {
  const dias = [7, 30, 90, 365].includes(Number(req.query.dias)) ? Number(req.query.dias) : 30;
  const hoy = hoyLocal();
  const inicio = new Date(Date.now() - (dias + 1) * 864e5).toISOString().slice(0, 10);
  const citas = await q('SELECT * FROM citas WHERE fecha >= ? AND fecha <= ?', [inicio, hoy]);
  const pedidos = (await q('SELECT * FROM pedidos WHERE creado >= ?', [inicio])).map((p) => ({ ...p, items: JSON.parse(p.items) }));
  // "creado" se guarda en UTC; se convierte a la fecha local de Bolivia.
  const fechaLocalDe = (s) => new Date(String(s).replace(' ', 'T') + (String(s).includes('Z') ? '' : 'Z')).toLocaleDateString('en-CA', { timeZone: ZONA });
  res.json(calcular(citas, pedidos, dias, hoy, fechaLocalDe));
}));

// ---------------------------------------------------------------------
// Imágenes: el panel envía la imagen (ya reducida) y aquí se guarda en disco.
// Se publican en /api/uploads/<archivo>.
// ---------------------------------------------------------------------
const TIPOS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
app.post('/admin/imagenes', ruta(async (req, res) => {
  const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(String((req.body || {}).data || ''));
  if (!m || !TIPOS[m[1]]) throw error(400, 'Formato no permitido. Usa JPG, PNG, WEBP o GIF.');
  const bytes = Buffer.from(m[2], 'base64');
  if (bytes.length > 6 * 1024 * 1024) throw error(400, 'La imagen pesa más de 6 MB.');
  const nombre = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${TIPOS[m[1]]}`;
  fs.writeFileSync(path.join(CARPETA_IMAGENES, nombre), bytes);
  res.status(201).json({ url: `/api/uploads/${nombre}` });
}));

// ---------------------------------------------------------------------
// Videos subidos desde la compu: llegan como archivo directo (no base64).
// Límite 95 MB: Cloudflare (plan gratuito) no deja pasar envíos de más de 100 MB.
// ---------------------------------------------------------------------
const TIPOS_VIDEO = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };
const MAX_VIDEO = 95 * 1024 * 1024;
app.post('/admin/videos-archivo', (req, res) => {
  const tipo = String(req.headers['content-type'] || '').split(';')[0].trim();
  if (!TIPOS_VIDEO[tipo]) return res.status(400).json({ error: 'Formato no permitido. Usa MP4, WEBM o MOV.' });
  if (Number(req.headers['content-length']) > MAX_VIDEO) return res.status(413).json({ error: 'El video pesa más de 95 MB. Comprímelo o súbelo a YouTube.' });
  const nombre = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${TIPOS_VIDEO[tipo]}`;
  const destino = path.join(CARPETA_IMAGENES, nombre);
  const salida = fs.createWriteStream(destino);
  let bytes = 0, cortado = false;
  const fallar = (status, mensaje) => {
    if (cortado) return;
    cortado = true;
    req.unpipe(salida);
    salida.destroy();
    fs.rm(destino, { force: true }, () => {});
    res.status(status).json({ error: mensaje });
  };
  req.on('data', (trozo) => { bytes += trozo.length; if (bytes > MAX_VIDEO) fallar(413, 'El video pesa más de 95 MB.'); });
  req.on('aborted', () => fallar(400, 'La subida se interrumpió.'));
  salida.on('error', () => fallar(500, 'No se pudo guardar el video.'));
  salida.on('finish', () => { if (!cortado) res.status(201).json({ url: `/api/uploads/${nombre}`, bytes }); });
  req.pipe(salida);
});

// Sirve imágenes y videos subidos. Para videos responde por partes (Range),
// así el navegador puede adelantar y el iPhone/Safari lo reproduce.
const TIPO_POR_EXT = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' };
app.get('/uploads/:archivo', (req, res) => {
  const archivo = String(req.params.archivo);
  const tipo = TIPO_POR_EXT[path.extname(archivo).slice(1)];
  const destino = path.join(CARPETA_IMAGENES, archivo);
  if (!/^[\w-]+\.(jpg|png|webp|gif|mp4|webm|mov)$/.test(archivo) || !tipo || !fs.existsSync(destino)) {
    res.statusCode = 404;
    return res.end('No encontrado');
  }
  const total = fs.statSync(destino).size;
  res.setHeader('Content-Type', tipo);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  const rango = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || ''));
  if (rango && (rango[1] || rango[2])) {
    let inicio = rango[1] ? Number(rango[1]) : total - Number(rango[2]);
    let fin = rango[1] && rango[2] ? Number(rango[2]) : total - 1;
    inicio = Math.max(0, inicio); fin = Math.min(fin, total - 1);
    if (inicio > fin) { res.statusCode = 416; res.setHeader('Content-Range', `bytes */${total}`); return res.end(); }
    res.statusCode = 206;
    res.setHeader('Content-Range', `bytes ${inicio}-${fin}/${total}`);
    res.setHeader('Content-Length', fin - inicio + 1);
    return fs.createReadStream(destino, { start: inicio, end: fin }).pipe(res);
  }
  res.setHeader('Content-Length', total);
  fs.createReadStream(destino).pipe(res);
});

// ---------------------------------------------------------------------
// Ajustes editables desde el panel: videos de YouTube/TikTok y enlaces de redes.
// ---------------------------------------------------------------------
const AJUSTES_VACIOS = { videosYoutube: [], videosTiktok: [], videosPropios: [], redes: {} };
async function leerAjustes() {
  const [fila] = await q("SELECT valor FROM ajustes WHERE clave = 'sitio'");
  return fila ? { ...AJUSTES_VACIOS, ...JSON.parse(fila.valor) } : null;
}
app.get('/ajustes', ruta(async (req, res) => {
  const a = await leerAjustes();
  // "guardado" indica si ya se configuró desde el panel; si no, la web usa config.js.
  res.json(a ? { ...a, guardado: true } : { ...AJUSTES_VACIOS, guardado: false });
}));
app.put('/admin/ajustes', ruta(async (req, res) => {
  const b = req.body || {};
  const videos = (lista, patron) => (Array.isArray(lista) ? lista : [])
    .filter((v) => patron.test(String(v.id || '')))
    .slice(0, 24)
    .map((v) => ({ id: String(v.id), titulo: texto(v.titulo, 120) || '' }));
  const redes = {};
  for (const k of ['facebook', 'instagram', 'youtube', 'tiktok', 'messenger', 'telegram']) {
    const url = texto((b.redes || {})[k]);
    if (url && /^https?:\/\//.test(url)) redes[k] = url;
  }
  const videosPropios = (Array.isArray(b.videosPropios) ? b.videosPropios : [])
    .filter((v) => /^\/api\/uploads\/[\w-]+\.(mp4|webm|mov)$/.test(String(v.url || '')))
    .slice(0, 24)
    .map((v) => ({ url: String(v.url), titulo: texto(v.titulo, 120) || '' }));
  const valor = { videosYoutube: videos(b.videosYoutube, /^[\w-]{6,20}$/), videosTiktok: videos(b.videosTiktok, /^\d{8,25}$/), videosPropios, redes };
  const existe = await leerAjustes();
  if (existe) await q("UPDATE ajustes SET valor = ? WHERE clave = 'sitio'", [JSON.stringify(valor)]);
  else await q("INSERT INTO ajustes (clave, valor) VALUES ('sitio', ?)", [JSON.stringify(valor)]);
  res.json({ ...valor, guardado: true });
}));

// Pedidos
const ESTADOS_PEDIDO = ['nuevo', 'pagado', 'confirmado', 'enviado', 'entregado', 'cancelado'];
app.get('/admin/pedidos', ruta(async (req, res) => {
  const filas = await q('SELECT * FROM pedidos ORDER BY id DESC LIMIT 500');
  res.json(filas.map((f) => ({ ...f, total_bs: Number(f.total_bs), items: JSON.parse(f.items) })));
}));
app.put('/admin/pedidos/:id', ruta(async (req, res) => {
  const { estado } = req.body || {};
  if (!ESTADOS_PEDIDO.includes(estado)) throw error(400, 'Estado no válido.');
  const [p] = await q('SELECT * FROM pedidos WHERE id = ?', [req.params.id]);
  if (!p) throw error(404, 'Pedido no encontrado.');
  // Al cancelar se devuelve el stock; al reactivar un pedido cancelado se vuelve a descontar.
  const items = JSON.parse(p.items);
  const signo = estado === 'cancelado' && p.estado !== 'cancelado' ? 1 : p.estado === 'cancelado' && estado !== 'cancelado' ? -1 : 0;
  if (signo) for (const it of items) await q('UPDATE productos SET stock = stock + ? WHERE id = ? AND stock IS NOT NULL', [signo * it.cantidad, it.id]);
  await q('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, p.id]);
  res.json({ ok: true });
}));

// Citas
const ESTADOS_CITA = ['pendiente', 'confirmada', 'atendida', 'cancelada', 'no_asistio'];
app.get('/admin/citas', ruta(async (req, res) => {
  res.json(await q('SELECT * FROM citas ORDER BY fecha DESC, hora DESC LIMIT 500'));
}));
app.put('/admin/citas/:id', ruta(async (req, res) => {
  const { estado } = req.body || {};
  if (!ESTADOS_CITA.includes(estado)) throw error(400, 'Estado no válido.');
  await q('UPDATE citas SET estado = ? WHERE id = ?', [estado, req.params.id]);
  res.json({ ok: true });
}));

// Productos
app.get('/admin/productos', ruta(async (req, res) => {
  res.json((await q('SELECT * FROM productos ORDER BY categoria, nombre')).map(productoDeFila));
}));
app.post('/admin/productos', ruta(async (req, res) => res.status(201).json({ id: await guardarProducto(req.body || {}, true) })));
app.put('/admin/productos/:id', ruta(async (req, res) => res.json({ id: await guardarProducto({ ...req.body, id: req.params.id }, false) })));
app.delete('/admin/productos/:id', ruta(async (req, res) => {
  await q('DELETE FROM productos WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
}));

// Servicios
app.get('/admin/servicios', ruta(async (req, res) => {
  res.json((await q('SELECT * FROM servicios ORDER BY orden, nombre')).map(servicioDeFila));
}));
app.post('/admin/servicios', ruta(async (req, res) => res.status(201).json({ id: await guardarServicio(req.body || {}, true) })));
app.put('/admin/servicios/:id', ruta(async (req, res) => res.json({ id: await guardarServicio({ ...req.body, id: req.params.id }, false) })));
app.delete('/admin/servicios/:id', ruta(async (req, res) => {
  await q('DELETE FROM servicios WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------------
// Arranque: espera a que MySQL esté listo (en Docker tarda unos segundos)
// ---------------------------------------------------------------------
async function arrancar(intento = 1) {
  try {
    await iniciarBase();
    app.listen(PORT, () => console.log(`✅ API corriendo en el puerto ${PORT}`));
  } catch (err) {
    console.error(`Base de datos no disponible (intento ${intento}): ${err.message}. Reintentando en 5 s...`);
    setTimeout(() => arrancar(intento + 1), 5000);
  }
}
arrancar();
