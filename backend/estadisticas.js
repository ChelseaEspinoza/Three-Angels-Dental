// =====================================================================
//  Cálculo de estadísticas para el panel de administración.
//  Función pura: recibe citas y pedidos y devuelve totales y series.
// =====================================================================
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const desdeIso = (s) => {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

/**
 * @param {object[]} citas    filas de la tabla citas
 * @param {object[]} pedidos  filas de la tabla pedidos (items ya convertido a arreglo)
 * @param {number}   dias     periodo: 7, 30, 90 o 365
 * @param {string}   hoy      fecha local de hoy, AAAA-MM-DD
 * @param {(s: string) => string} fechaLocalDe  convierte el "creado" de un pedido (UTC) a AAAA-MM-DD local
 */
function calcular(citas, pedidos, dias, hoy, fechaLocalDe) {
  const fin = desdeIso(hoy);
  const inicio = new Date(fin);
  inicio.setDate(inicio.getDate() - (dias - 1));
  const desde = iso(inicio);

  // Agrupación: por día (hasta 31 días), por semana (hasta 90) o por mes.
  const modo = dias <= 31 ? 'dia' : dias <= 92 ? 'semana' : 'mes';
  const grupos = [];
  const claveDe = (fecha) => {
    const d = desdeIso(fecha);
    if (modo === 'dia') return fecha;
    if (modo === 'mes') return fecha.slice(0, 7);
    const lunes = new Date(d);
    lunes.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return iso(lunes);
  };
  const vistos = new Set();
  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    const k = claveDe(iso(d));
    if (vistos.has(k)) continue;
    vistos.add(k);
    const fd = desdeIso(k.length === 7 ? `${k}-01` : k);
    const etiqueta =
      modo === 'mes' ? `${MESES[fd.getMonth()]} ${String(fd.getFullYear()).slice(2)}`
      : modo === 'semana' ? `${fd.getDate()} ${MESES[fd.getMonth()]}`
      : `${fd.getDate()}/${fd.getMonth() + 1}`;
    grupos.push({ clave: k, etiqueta, atendidos: 0, citas: 0, ventasBs: 0, pedidos: 0 });
  }
  const grupo = (fecha) => grupos.find((g) => g.clave === claveDe(fecha));

  // ---- Citas del periodo (por fecha de la cita, sin contar las futuras) ----
  const citasP = citas.filter((c) => c.fecha >= desde && c.fecha <= hoy);
  const porEstado = {};
  const porServicio = {};
  const porDiaSemana = DIAS_SEMANA.map((d) => ({ dia: d, citas: 0 }));
  const porHora = {};
  let nuevos = 0;
  for (const c of citasP) {
    porEstado[c.estado] = (porEstado[c.estado] || 0) + 1;
    const g = grupo(c.fecha);
    if (g) {
      g.citas += 1;
      if (c.estado === 'atendida') g.atendidos += 1;
    }
    if (c.estado !== 'cancelada') {
      porServicio[c.servicio] = (porServicio[c.servicio] || 0) + 1;
      porDiaSemana[desdeIso(c.fecha).getDay()].citas += 1;
      porHora[c.hora.slice(0, 2)] = (porHora[c.hora.slice(0, 2)] || 0) + 1;
    }
    if (c.estado === 'atendida' && Number(c.primera_vez)) nuevos += 1;
  }
  const atendidos = porEstado.atendida || 0;
  const ausentes = porEstado.no_asistio || 0;
  const canceladas = porEstado.cancelada || 0;
  const cerradas = atendidos + ausentes; // citas cuyo resultado ya se sabe

  // ---- Pedidos del periodo (por fecha de creación) ----
  const productos = {};
  const metodos = { paypal: 0, whatsapp: 0 };
  let ventasBs = 0;
  let numPedidos = 0;
  for (const p of pedidos) {
    if (p.estado === 'cancelado') continue;
    const fecha = fechaLocalDe(p.creado);
    if (fecha < desde || fecha > hoy) continue;
    const total = Number(p.total_bs);
    ventasBs += total;
    numPedidos += 1;
    metodos[p.metodo] = (metodos[p.metodo] || 0) + 1;
    const g = grupo(fecha);
    if (g) {
      g.ventasBs += total;
      g.pedidos += 1;
    }
    for (const it of p.items) {
      const x = (productos[it.nombre] = productos[it.nombre] || { nombre: it.nombre, unidades: 0, bs: 0 });
      x.unidades += Number(it.cantidad);
      x.bs += Number(it.precio) * Number(it.cantidad);
    }
  }
  // Ingresos por citas pagadas en línea (las de consultorio no se registran con monto).
  const ingresosCitasOnline = citasP.filter((c) => c.metodo === 'paypal' && c.estado !== 'cancelada').reduce((s, c) => s + Number(c.monto_bs || 0), 0);

  return {
    periodo: { dias, desde, hasta: hoy, agrupado: modo },
    totales: {
      pacientesAtendidos: atendidos,
      pacientesNuevos: nuevos,
      citas: citasP.length,
      canceladas,
      noAsistieron: ausentes,
      tasaAsistencia: cerradas ? Math.round((atendidos / cerradas) * 100) : null,
      ventasBs: Math.round(ventasBs * 100) / 100,
      pedidos: numPedidos,
      ticketPromedioBs: numPedidos ? Math.round((ventasBs / numPedidos) * 100) / 100 : 0,
      ingresosCitasOnlineBs: ingresosCitasOnline,
    },
    serie: grupos.map(({ clave, ...g }) => ({ ...g, ventasBs: Math.round(g.ventasBs * 100) / 100 })),
    topServicios: Object.entries(porServicio).map(([nombre, citas]) => ({ nombre, citas })).sort((a, b) => b.citas - a.citas).slice(0, 7),
    topProductos: Object.values(productos).sort((a, b) => b.unidades - a.unidades).slice(0, 7),
    porDiaSemana: [...porDiaSemana.slice(1), porDiaSemana[0]], // de lunes a domingo
    porHora: Object.entries(porHora).map(([hora, citas]) => ({ hora: `${hora}:00`, citas })).sort((a, b) => a.hora.localeCompare(b.hora)),
    porEstado,
    metodos,
  };
}

module.exports = { calcular };
