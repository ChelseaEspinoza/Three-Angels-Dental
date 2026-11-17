// Página de INICIO ("/"): portada, propuesta de valor, accesos y testimonios.
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Reveal from '../components/Reveal';
import { VideoSubido, YouTubeVideo } from '../components/Videos';
import { CLINICA } from '../config';
import { useSitio } from '../lib/sitio';
import { useCatalog } from '../lib/catalog';
import { bs } from '../lib/format';
import { Link } from '../lib/router';
import { useSeo } from '../lib/seo';

const BENEFICIOS = [
  { icono: '😌', titulo: 'Atención sin dolor', texto: 'Técnicas modernas y trato cálido en cada tratamiento.' },
  { icono: '🧼', titulo: 'Bioseguridad estricta', texto: 'Instrumental esterilizado y protocolos certificados.' },
  { icono: '👶', titulo: 'Especialistas en niños', texto: 'Ambiente divertido y manejo de conducta sin traumas.' },
  { icono: '💳', titulo: 'Pago fácil', texto: 'Paga online con PayPal o en consultorio con efectivo/QR.' },
];

const ACCESOS = [
  { to: '/servicios', icono: '🦷', titulo: 'Tratamientos', texto: 'Precios claros en Bolivianos' },
  { to: '/citas', icono: '📅', titulo: 'Reserva tu cita', texto: 'Elige fecha, hora y especialidad' },
  { to: '/tienda', icono: '🛍️', titulo: 'Tienda de higiene', texto: 'Delivery en Sucre' },
  { to: '/comunidad', icono: '🎬', titulo: 'Tips en video', texto: 'YouTube y TikTok' },
];

type Testimonio = { nombre: string; comentario: string };
const KEY = 'three_angels_testimonios';
const INICIALES: Testimonio[] = [
  { nombre: 'Carla Mendoza', comentario: 'La atención para mis hijos en Odontopediatría fue fantástica. Tienen muchísima paciencia y un ambiente genial.' },
  { nombre: 'Rodrigo Valdivia', comentario: 'Me hice la cirugía de cordales y todo salió perfecto, cero dolor y tecnología de primera en Sucre.' },
  { nombre: 'Daniela Rojas', comentario: 'Mi tratamiento de ortodoncia va excelente. Siempre puntuales y muy profesionales.' },
];

function leerTestimonios(): Testimonio[] {
  try {
    const guardado = localStorage.getItem(KEY);
    if (guardado) return JSON.parse(guardado);
  } catch {
    /* sin acceso a localStorage */
  }
  return INICIALES;
}

export default function Home() {
  useSeo(
    'Clínica dental en Sucre',
    'Three Angels Dental: clínica odontológica en Sucre, Bolivia. Ortodoncia, limpieza dental, odontopediatría y tienda de higiene bucal. Reserva tu cita online.',
  );

  const { servicios: SERVICIOS } = useCatalog();
  const [testimonios, setTestimonios] = useState<Testimonio[]>(leerTestimonios);
  const [nuevo, setNuevo] = useState<Testimonio>({ nombre: '', comentario: '' });
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(testimonios));
    } catch {
      /* ignorar */
    }
  }, [testimonios]);

  const publicar = (e: FormEvent) => {
    e.preventDefault();
    if (!nuevo.nombre.trim() || !nuevo.comentario.trim()) return;
    setTestimonios([...testimonios, nuevo]);
    setNuevo({ nombre: '', comentario: '' });
    setEnviado(true);
  };

  // Video destacado: primero un video subido; si no hay, el primero de YouTube que tenga enlace.
  const sitio = useSitio();
  const videoPropio = sitio.videosPropios[0];
  const videoDestacado = sitio.videosYoutube.find((v) => v.id);

  return (
    <>
      {/* PORTADA / HERO */}
      <section className="hero" aria-labelledby="hero-titulo">
        <div className="hero-bg" role="img" aria-label="Consultorio de Three Angels Dental en Sucre" />
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="container hero-inner">
          <span className="chip chip-light">✨ Centro Odontológico Especializado en {CLINICA.ciudad}</span>
          <h1 id="hero-titulo">
            La sonrisa que <span className="script">va contigo</span>
          </h1>
          <p className="hero-sub">
            Tecnología avanzada, calidez humana y atención especializada para toda la familia, en un solo lugar.
          </p>
          <div className="hero-ctas">
            <Link to="/citas" className="btn btn-white btn-lg">📅 Reserva tu cita</Link>
            <Link to="/servicios" className="btn btn-outline-light btn-lg">Ver tratamientos</Link>
          </div>
          <dl className="hero-stats">
            <div><dt>+7</dt><dd>Especialidades</dd></div>
            <div><dt>100%</dt><dd>Bioseguridad</dd></div>
            <div><dt>⭐ 5.0</dt><dd>Pacientes felices</dd></div>
          </dl>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="section container" aria-labelledby="beneficios-titulo">
        <h2 id="beneficios-titulo" className="sr-only">Beneficios de atenderte con nosotros</h2>
        <div className="grid-4 beneficios">
          {BENEFICIOS.map((b, i) => (
            <Reveal key={b.titulo} delay={i * 80}>
              <article className="card beneficio">
                <span className="beneficio-icono" aria-hidden>{b.icono}</span>
                <h3>{b.titulo}</h3>
                <p>{b.texto}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRESENTACIÓN */}
      <section className="section container split" aria-labelledby="nosotros-titulo">
        <Reveal className="split-img">
          <img src="/5.jpeg" alt="Odontóloga atendiendo a un paciente en Three Angels Dental" loading="lazy" />
          <div className="floating-card">
            <strong>{CLINICA.directora}</strong>
            <small>Directora clínica</small>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <span className="eyebrow">Sobre nosotros</span>
          <h2 id="nosotros-titulo">Transformamos vidas a través de sonrisas sanas</h2>
          <p>
            En el corazón de Sucre ofrecemos una atención odontológica de excelencia para grandes y pequeños, bajo la
            dirección de la {CLINICA.directora}. Combinamos un trato humano y cálido con instalaciones modernas y
            estrictos protocolos de bioseguridad.
          </p>
          <ul className="checklist">
            <li>Diagnóstico claro y presupuesto sin sorpresas</li>
            <li>Área infantil con indumentaria especializada</li>
            <li>Planes para pacientes viajeros en Bolivia</li>
          </ul>
          <Link to="/servicios" className="btn btn-primary">Conoce nuestros servicios →</Link>
        </Reveal>
      </section>

      {/* SERVICIOS DESTACADOS */}
      <section className="section section-tinted" aria-labelledby="destacados-titulo">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Tratamientos</span>
            <h2 id="destacados-titulo">Los más solicitados</h2>
          </div>
          <div className="grid-3">
            {SERVICIOS.slice(0, 3).map((s, i) => (
              <Reveal key={s.id} delay={i * 100}>
                <Link to={`/citas?servicio=${s.id}`} className="card mini-servicio">
                  <img src={s.imagen} alt={s.alt} loading="lazy" />
                  <div>
                    <h3>{s.nombre}</h3>
                    <p className="precio">{s.desde ? 'Desde ' : ''}{bs(s.precio)}</p>
                    <span className="link-arrow">Reservar →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ACCESOS DIRECTOS */}
      <section className="section container" aria-labelledby="accesos-titulo">
        <div className="section-head">
          <span className="eyebrow">Explora</span>
          <h2 id="accesos-titulo">¿Qué necesitas hoy?</h2>
        </div>
        <div className="grid-4">
          {ACCESOS.map((a, i) => (
            <Reveal key={a.to} delay={i * 80}>
              <Link to={a.to} className="card acceso">
                <span aria-hidden>{a.icono}</span>
                <h3>{a.titulo}</h3>
                <p>{a.texto}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* VIDEO DESTACADO */}
      {(videoPropio || videoDestacado) && (
        <section className="section container split" aria-labelledby="video-titulo">
          <Reveal>
            <span className="eyebrow">Tips de salud bucal</span>
            <h2 id="video-titulo">Aprende a cuidar tu sonrisa</h2>
            <p>Mira nuestros videos con consejos de higiene, respuestas a dudas frecuentes y promociones del mes.</p>
            <Link to="/comunidad" className="btn btn-primary">Ver todos los videos →</Link>
          </Reveal>
          <Reveal delay={120}>
            {videoPropio ? <VideoSubido {...videoPropio} /> : <YouTubeVideo id={videoDestacado!.id} titulo={videoDestacado!.titulo} />}
          </Reveal>
        </section>
      )}

      {/* TESTIMONIOS */}
      <section className="section section-tinted" aria-labelledby="testimonios-titulo">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Testimonios</span>
            <h2 id="testimonios-titulo">Lo que opinan nuestros pacientes</h2>
          </div>
          <div className="grid-3">
            {testimonios.map((t, i) => (
              <Reveal key={`${t.nombre}-${i}`} delay={(i % 3) * 80}>
                <blockquote className="card testimonio">
                  <div className="stars" aria-label="5 de 5 estrellas">★★★★★</div>
                  <p>“{t.comentario}”</p>
                  <cite>— {t.nombre}</cite>
                </blockquote>
              </Reveal>
            ))}
          </div>

          <div className="card gradient-card testimonio-form">
            <h3>💬 Déjanos tu experiencia</h3>
            {enviado && <p className="ok-msg">¡Gracias! Tu comentario se publicó correctamente.</p>}
            <form onSubmit={publicar} className="form form-inline">
              <input placeholder="Tu nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} required aria-label="Tu nombre" />
              <input placeholder="Escribe tu comentario…" value={nuevo.comentario} onChange={(e) => setNuevo({ ...nuevo, comentario: e.target.value })} required aria-label="Tu comentario" />
              <button className="btn btn-white" type="submit">Publicar</button>
            </form>
          </div>
        </div>
      </section>

      {/* LLAMADO FINAL */}
      <section className="cta-band">
        <div className="container cta-inner">
          <h2>¿Listo para tu nueva sonrisa?</h2>
          <p>Reserva en menos de un minuto y paga online o en consultorio.</p>
          <Link to="/citas" className="btn btn-white btn-lg">Reservar mi cita</Link>
        </div>
      </section>
    </>
  );
}
