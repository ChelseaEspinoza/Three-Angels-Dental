// Íconos de redes sociales oficiales.
import { enlaceValido, useSitio } from '../lib/sitio';
import type { Redes } from '../lib/sitio';
import { track } from '../lib/analytics';
import { IconFacebook, IconInstagram, IconTiktok, IconYoutube } from './Icons';

export const listaRedes = (REDES: Redes) => [
  { nombre: 'Facebook', href: REDES.facebook, Icono: IconFacebook, clase: 'fb' },
  { nombre: 'Instagram', href: REDES.instagram, Icono: IconInstagram, clase: 'ig' },
  { nombre: 'YouTube', href: REDES.youtube, Icono: IconYoutube, clase: 'yt' },
  { nombre: 'TikTok', href: REDES.tiktok, Icono: IconTiktok, clase: 'tt' },
];

export default function SocialLinks({ size = 20 }: { size?: number }) {
  return (
    <div className="social">
      {listaRedes(useSitio().redes).filter((r) => enlaceValido(r.href)).map(({ nombre, href, Icono, clase }) => (
        <a
          key={nombre}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`social-btn ${clase}`}
          aria-label={`Three Angels Dental en ${nombre}`}
          title={nombre}
          onClick={() => track('social_click', { red: nombre })}
        >
          <Icono size={size} />
        </a>
      ))}
    </div>
  );
}
