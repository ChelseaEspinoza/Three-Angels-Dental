// Barra de navegación fija y responsiva.
import { useEffect, useState } from 'react';
import { Link, useRouter } from '../lib/router';
import { useCart } from '../lib/cart';

export const RUTAS = [
  { to: '/', label: 'Inicio' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/comunidad', label: 'Redes y Videos' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const { path } = useRouter();
  const { cantidadTotal, abrirPanel } = useCart();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <nav className="nav-inner" aria-label="Navegación principal">
        <Link to="/" className="brand" aria-label="Three Angels Dental, ir al inicio">
          <img src="/logo.png" alt="Logo de Three Angels Dental" width={44} height={44} />
          <span>Three Angels Dental</span>
        </Link>

        <ul className={`nav-links ${menu ? 'abierto' : ''}`}>
          {RUTAS.map((r) => (
            <li key={r.to}>
              <Link to={r.to} className={path === r.to ? 'activo' : ''} aria-current={path === r.to ? 'page' : undefined}>
                {r.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/citas" className={`btn btn-primary btn-sm ${path === '/citas' ? 'activo' : ''}`}>
              📅 Reservar Cita
            </Link>
          </li>
        </ul>

        <div className="nav-actions">
          <button className="cart-btn" onClick={() => abrirPanel(true)} aria-label={`Abrir carrito, ${cantidadTotal} productos`}>
            🛒{cantidadTotal > 0 && <span className="badge">{cantidadTotal}</span>}
          </button>
          <button className="burger" onClick={() => setMenu(!menu)} aria-label="Abrir menú" aria-expanded={menu}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  );
}
