import { CLINICA, HORARIOS } from '../config';
import { Link } from '../lib/router';
import { RUTAS } from './Navbar';
import SocialLinks from './SocialLinks';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <img src="/logo.png" alt="Logo de Three Angels Dental" width={48} height={48} loading="lazy" />
            <strong>Three Angels Dental</strong>
          </div>
          <p>La sonrisa que va contigo. Clínica odontológica integral en {CLINICA.ciudad}.</p>
          <SocialLinks />
        </div>
        <nav aria-label="Enlaces del pie de página">
          <h3>Navegación</h3>
          <ul>
            {[...RUTAS, { to: '/citas', label: 'Reservar Cita' }].map((r) => (
              <li key={r.to}><Link to={r.to}>{r.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <h3>Horarios</h3>
          <ul>
            {HORARIOS.map((h) => (
              <li key={h.etiqueta}>
                <strong>{h.etiqueta}:</strong> {h.bloques.map((b) => b.join(' – ')).join(' y ')}
              </li>
            ))}
          </ul>
        </div>
        <address>
          <h3>Contacto</h3>
          <p>📍 {CLINICA.direccion}</p>
          <p>📞 <a href={`https://wa.me/${CLINICA.whatsapp}`} target="_blank" rel="noopener noreferrer">{CLINICA.telefonoVisible}</a></p>
          {CLINICA.email && <p>✉️ <a href={`mailto:${CLINICA.email}`}>{CLINICA.email}</a></p>}
        </address>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} Three Angels Dental · Todos los derechos reservados.</p>
    </footer>
  );
}
