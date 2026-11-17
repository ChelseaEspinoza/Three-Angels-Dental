// Videos y enlaces de redes: se editan en el panel (/admin → Videos y redes).
// Mientras no se hayan guardado desde el panel, se usan los de config.js.
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { REDES, VIDEOS_TIKTOK, VIDEOS_YOUTUBE } from '../config';
import { api } from './api';

export type Video = { id: string; titulo: string };
export type Redes = typeof REDES;
export type VideoPropio = { url: string; titulo: string };
export type Sitio = { redes: Redes; videosYoutube: Video[]; videosTiktok: Video[]; videosPropios: VideoPropio[] };

const INICIAL: Sitio = { redes: REDES, videosYoutube: VIDEOS_YOUTUBE, videosTiktok: VIDEOS_TIKTOK, videosPropios: [] };
const SitioContext = createContext<Sitio>(INICIAL);

export function SitioProvider({ children }: { children: ReactNode }) {
  const [sitio, setSitio] = useState<Sitio>(INICIAL);
  useEffect(() => {
    api<{ guardado: boolean; redes: Partial<Redes>; videosYoutube: Video[]; videosTiktok: Video[]; videosPropios?: VideoPropio[] }>('/ajustes')
      .then((a) => {
        if (!a.guardado) return;
        setSitio({ redes: { ...REDES, ...a.redes }, videosYoutube: a.videosYoutube, videosTiktok: a.videosTiktok, videosPropios: a.videosPropios || [] });
      })
      .catch(() => {
        /* sin servidor: se queda config.js */
      });
  }, []);
  return <SitioContext.Provider value={sitio}>{children}</SitioContext.Provider>;
}

export const useSitio = () => useContext(SitioContext);
