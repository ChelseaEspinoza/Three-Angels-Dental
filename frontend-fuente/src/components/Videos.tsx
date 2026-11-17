// Reproductores embebidos de YouTube y TikTok (se reproducen dentro de la web).
import { useState } from 'react';
import { track } from '../lib/analytics';
import { IconTiktok, IconYoutube } from './Icons';

/** YouTube "liviano": muestra la miniatura y carga el reproductor al hacer clic. */
export function YouTubeVideo({ id, titulo }: { id: string; titulo: string }) {
  const [activo, setActivo] = useState(false);
  if (!id) return <VideoPendiente plataforma="YouTube" titulo={titulo} />;
  return (
    <figure className="video video-yt">
      <div className="video-frame">
        {activo ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            className="video-poster"
            onClick={() => {
              setActivo(true);
              track('video_play', { plataforma: 'youtube', video_id: id, titulo });
            }}
            aria-label={`Reproducir video: ${titulo}`}
          >
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={`Miniatura del video ${titulo}`} loading="lazy" />
            <span className="play">▶</span>
          </button>
        )}
      </div>
      <figcaption>
        <IconYoutube size={16} /> {titulo}
      </figcaption>
    </figure>
  );
}

/** Video de TikTok embebido (formato vertical). */
export function TikTokVideo({ id, titulo }: { id: string; titulo: string }) {
  if (!id) return <VideoPendiente plataforma="TikTok" titulo={titulo} vertical />;
  return (
    <figure className="video video-tt">
      <div className="video-frame vertical">
        <iframe
          src={`https://www.tiktok.com/embed/v2/${id}`}
          title={titulo}
          loading="lazy"
          allow="encrypted-media; fullscreen"
          allowFullScreen
        />
      </div>
      <figcaption>
        <IconTiktok size={16} /> {titulo}
      </figcaption>
    </figure>
  );
}

function VideoPendiente({ plataforma, titulo, vertical }: { plataforma: string; titulo: string; vertical?: boolean }) {
  return (
    <figure className="video">
      <div className={`video-frame pendiente ${vertical ? 'vertical' : ''}`}>
        <span>🎬</span>
        <p>
          Video de {plataforma} próximamente
          <small>Pega el ID en src/config.ts</small>
        </p>
      </div>
      <figcaption>{titulo}</figcaption>
    </figure>
  );
}

/** Video subido desde el panel (archivo propio). */
export function VideoSubido({ url, titulo }: { url: string; titulo: string }) {
  return (
    <figure className="video">
      <div className="video-frame">
        <video
          src={url}
          controls
          preload="metadata"
          playsInline
          onPlay={() => track('video_play', { plataforma: 'propio', video_url: url, titulo })}
        />
      </div>
      <figcaption>🎬 {titulo}</figcaption>
    </figure>
  );
}
