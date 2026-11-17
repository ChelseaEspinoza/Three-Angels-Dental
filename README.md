# Three Angels Dental - Documentación del Proyecto

## 1. Tema y Modelo de Ingreso
* **Tema:** Clínica Odontológica Integral "Three Angels Dental".
* **Modelo de Ingreso:** Prestación de servicios dentales especializados (Ortodoncia, Limpieza, Endodoncia) y venta de productos de higiene dental mediante pasarela de pago (PayPal).

## 2 y 3. Instalación, Dominio y SSL
* Desplegado sobre CMS / Servidor CWP con dominio `threeangelsdental.si.com.bo` y certificado SSL activo.

## 4 al 6. Analítica y SEO
* Integración con Google Analytics, optimización SEO on-page y conexión con redes sociales (Facebook e Instagram sin pauta publicitaria).

## 7 al 9. Plugins y Social Media
* Incorporación de widgets flotantes para WhatsApp, Messenger y TikTok.

## 10 al 14. Pagos, Redes de Video y Contenido Final
* Pasarela de pago con PayPal configurada, canal de difusión en YouTube y TikTok, y contenidos finales publicados en la web.
---

# Versión multipágina (2026)

## Estructura del proyecto

```
threeangels-app/
├── docker-compose.yml      ← frontend (nginx) + backend (Node.js) + base de datos (MySQL)
├── frontend/               ← LO QUE SE PUBLICA: solo NGINX
│   ├── Dockerfile          ← FROM nginx:alpine (no usa Node ni Vite)
│   ├── nginx.conf          ← sirve la web y envía /api al backend
│   └── sitio/              ← la web ya compilada
│       ├── index.html      ← Google Analytics, SEO, Open Graph
│       ├── config.js       ← ⭐ TUS DATOS: PayPal, WhatsApp, redes, videos, horarios, mapa
│       ├── assets/         ← app.js y app.css (la aplicación compilada)
│       └── *.jpeg, logo.png, robots.txt, sitemap.xml
├── backend/                ← API Node.js + Express (pedidos, citas, panel admin)
└── frontend-fuente/        ← código fuente React/TypeScript (solo para programar cambios)
```

| URL | Página |
|---|---|
| `/` | Inicio |
| `/servicios` | Servicios y precios |
| `/tienda` | Tienda de higiene bucal (buscador + carrito) |
| `/citas` | Reservar cita |
| `/comunidad` | Redes y videos |
| `/contacto` | Contacto y ubicación |
| `/admin` | Panel de administración |

## Guía rápida de configuración (sin compilar nada)

| Qué | Archivo | Línea |
|---|---|---|
| ID de Google Analytics (`G-…`) | `frontend/sitio/index.html` | **11** y **17** (las dos) |
| Client ID de PayPal | `frontend/sitio/config.js` | **10** |
| Tipo de cambio Bs./USD | `frontend/sitio/config.js` | 11 |
| % que se cobra online por cita | `frontend/sitio/config.js` | 12 |
| Correo y dirección exacta | `frontend/sitio/config.js` | 21–22 |
| Mapa embebido de Google Maps | `frontend/sitio/config.js` | 25 |
| Horarios de atención | `frontend/sitio/config.js` | 29 |
| Enlaces de YouTube, TikTok, Messenger, Telegram | `frontend/sitio/config.js` | 36 |
| Videos de YouTube (solo el ID) | `frontend/sitio/config.js` | 48 |
| Videos de TikTok (solo el número) | `frontend/sitio/config.js` | 53 |
| Productos, precios, stock y servicios | Panel `/admin` | — |

Después de editar, `git push` y Redeploy en Coolify.

**PayPal:** el Client ID de *Sandbox* hace pagos de prueba; el de *Live*, pagos reales.
**YouTube:** de `https://www.youtube.com/watch?v=dQw4w9WgXcQ` se pega `dQw4w9WgXcQ`.
**TikTok:** de `https://www.tiktok.com/@clinica/video/7312345678901234567` se pega `7312345678901234567`.
**Fotos de productos:** colócalas en `frontend/sitio/productos/` y escribe `/productos/archivo.jpg` en el campo Foto del panel.

## Modificar el diseño o las páginas (solo si cambias código)

El código fuente está en `frontend-fuente/`. Para probar y volver a compilar:

```bash
cd frontend-fuente
npm install
npm run dev      # prueba en http://localhost:5173
npm run build    # compila en frontend-fuente/dist
```
Luego copia el contenido de `frontend-fuente/dist/` a `frontend/sitio/` (sin reemplazar tu `config.js`) y publica.

---

# Panel de administración

Dirección: **`https://tu-dominio/admin`** (no aparece en el menú del sitio ni en Google).

| Sección | Qué permite |
|---|---|
| Resumen | Pedidos por atender, citas próximas, ventas del mes y productos con poco stock |
| Pedidos | Ver cada pedido (productos, dirección, ubicación GPS, pago) y cambiar su estado: nuevo → confirmado → enviado → entregado, o cancelado (devuelve el stock) |
| Citas | Agenda de próximas citas y cambio de estado: pendiente, confirmada, atendida, cancelada, no asistió |
| Productos | Crear, editar, ocultar o eliminar productos; precio, stock, foto y "recomendado" |
| Servicios | Crear, editar, ocultar o eliminar tratamientos, sus precios y su orden |
| Mi cuenta | Cambiar la contraseña |

**Primer ingreso:** usuario `admin`, contraseña `ThreeAngels2026!`. Cámbiala apenas entres (Mi cuenta).
Antes del primer deploy puedes definir en Coolify → Environment Variables: `ADMIN_USER`, `ADMIN_PASSWORD` y `TOKEN_SECRET` (un texto largo al azar). El usuario solo se crea la primera vez, cuando la base está vacía.

**Cómo funciona:** al arrancar, el backend crea las tablas en MySQL (`admins`, `productos`, `servicios`, `pedidos`, `citas`) y carga el catálogo inicial desde `backend/seed.json`. Desde ese momento la tienda y los servicios se leen de la base de datos; si la API no responde, la web muestra el catálogo de respaldo incluido en la web compilada.
Cada compra y cada reserva se guarda en la base (además del mensaje de WhatsApp). El servidor recalcula el total con los precios de la base, descuenta stock y no permite reservar dos citas en la misma hora.

## Fotos y videos desde el panel

- **Fotos:** en Productos o Servicios → Editar → arrastra la foto al recuadro (o haz clic para elegirla, o pégala con Ctrl+V). Se reduce sola a 1200 px y se guarda en el volumen `uploads` del backend; se publica en `/api/uploads/...`.
- **Videos y redes:** sección 🎬 del panel. Pega el enlace completo del video de YouTube o TikTok y guarda. Mientras no se guarde nada ahí, la web usa los videos y redes de `config.js`.
