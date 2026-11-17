// Página REDES Y VIDEOS ("/comunidad"): redes oficiales y videos embebidos.
import { IconFacebook, IconInstagram, IconTiktok, IconYoutube } from '../components/Icons';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { TikTokVideo, VideoSubido, YouTubeVideo } from '../components/Videos';
import { useSitio } from '../lib/sitio';
import type { Redes } from '../lib/sitio';
import { track } from '../lib/analytics';
import { useSeo } from '../lib/seo';

const canales = (REDES: Redes) => [
  { nombre: 'Facebook', texto: 'Novedades, promociones y fotos de la clínica.', href: REDES.facebook, Icono: IconFacebook, clase: 'fb', cta: 'Seguir' },
  { nombre: 'Instagram', texto: 'Antes y después, historias y tips diarios.', href: REDES.instagram, Icono: IconInstagram, clase: 'ig', cta: 'Seguir' },
  { nombre: 'YouTube', texto: 'Videos explicativos sobre tratamientos.', href: REDES.youtube, Icono: IconYoutube, clase: 'yt', cta: 'Suscribirme' },
  { nombre: 'TikTok', texto: 'Tips rápidos de higiene bucal y humor dental.', href: REDES.tiktok, Icono: IconTiktok, clase: 'tt', cta: 'Seguir' },
];

export default function Community() {
  const sitio = useSitio();
  const { redes, videosPropios } = sitio;
  // Solo se muestran los videos que tienen enlace; las secciones vacías no aparecen.
  const VIDEOS_YOUTUBE = sitio.videosYoutube.filter((v) => v.id);
  const VIDEOS_TIKTOK = sitio.videosTiktok.filter((v) => v.id);
  useSeo(
    'Redes y videos',
    'Videos de Three Angels Dental en YouTube y TikTok: tips de higiene bucal, ortodoncia y promociones de nuestra clínica dental en Sucre.',
  );

  return (
    <>
      <PageHeader eyebrow="Comunidad" titulo="Redes y videos" texto="Tips de salud bucal, promociones y el día a día de nuestra clínica." />

      <section className="section container">
        <div className="grid-4">
          {canales(redes).map(({ nombre, texto, href, Icono, clase, cta }, i) => (
            <Reveal key={nombre} delay={i * 80}>
              <a className={`card canal ${clase}`} href={href} target="_blank" rel="noopener noreferrer" onClick={() => track('social_click', { red: nombre, origen: 'comunidad' })}>
                <span className="canal-icono"><Icono size={30} /></span>
                <h2>{nombre}</h2>
                <p>{texto}</p>
                <span className="link-arrow">{cta} →</span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {videosPropios.length > 0 && (
        <section className="section container" aria-labelledby="propios-titulo">
          <div className="section-head">
            <span className="eyebrow">Three Angels Dental</span>
            <h2 id="propios-titulo">Nuestros videos</h2>
          </div>
          <div className="grid-3">
            {videosPropios.map((v, i) => (
              <Reveal key={v.url} delay={i * 80}><VideoSubido {...v} /></Reveal>
            ))}
          </div>
        </section>
      )}

      {VIDEOS_YOUTUBE.length > 0 && (
      <section className="section section-tinted" aria-labelledby="yt-titulo">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">YouTube</span>
            <h2 id="yt-titulo">Videos destacados</h2>
          </div>
          <div className="grid-3">
            {VIDEOS_YOUTUBE.map((v, i) => (
              <Reveal key={`${v.id}-${i}`} delay={i * 80}><YouTubeVideo {...v} /></Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {VIDEOS_TIKTOK.length > 0 && (
      <section className="section container" aria-labelledby="tt-titulo">
        <div className="section-head">
          <span className="eyebrow">TikTok</span>
          <h2 id="tt-titulo">Tips en 60 segundos</h2>
        </div>
        <div className="grid-3 tiktoks">
          {VIDEOS_TIKTOK.map((v, i) => (
            <Reveal key={`${v.id}-${i}`} delay={i * 80}><TikTokVideo {...v} /></Reveal>
          ))}
        </div>
      </section>
      )}
    </>
  );
}
