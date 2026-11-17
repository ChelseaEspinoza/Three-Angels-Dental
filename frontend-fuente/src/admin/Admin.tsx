// PANEL DE ADMINISTRACIÓN ("/admin"): pedidos, citas, productos, servicios y cuenta.
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useRouter } from '../lib/router';
import { AdminProvider, useAdmin } from './session';
import Resumen from './Resumen';
import Estadisticas from './Estadisticas';
import Pedidos from './Pedidos';
import Citas from './Citas';
import Productos from './Productos';
import Servicios from './Servicios';
import Videos from './Videos';
import Cuenta from './Cuenta';
import './admin.css';

const SECCIONES = [
  { id: '', label: 'Resumen', icono: '📊', Comp: Resumen },
  { id: 'estadisticas', label: 'Estadísticas', icono: '📈', Comp: Estadisticas },
  { id: 'pedidos', label: 'Pedidos', icono: '🛒', Comp: Pedidos },
  { id: 'citas', label: 'Citas', icono: '📅', Comp: Citas },
  { id: 'productos', label: 'Productos', icono: '🪥', Comp: Productos },
  { id: 'servicios', label: 'Servicios', icono: '🦷', Comp: Servicios },
  { id: 'videos', label: 'Videos y redes', icono: '🎬', Comp: Videos },
  { id: 'cuenta', label: 'Mi cuenta', icono: '🔐', Comp: Cuenta },
];

export default function Admin() {
  useEffect(() => {
    document.title = 'Administración | Three Angels Dental';
    // El panel no debe aparecer en Google.
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <AdminProvider>
      <Panel />
    </AdminProvider>
  );
}

function Panel() {
  const { sesion, salir } = useAdmin();
  const { path } = useRouter();
  const [menu, setMenu] = useState(false);
  if (!sesion) return <Login />;

  const actual = path.replace(/^\/admin\/?/, '').split('/')[0];
  const seccion = SECCIONES.find((s) => s.id === actual) ?? SECCIONES[0];
  const Comp = seccion.Comp;

  return (
    <div className="adm">
      <aside className={`adm-side ${menu ? 'abierto' : ''}`}>
        <div className="adm-brand">
          <img src="/logo.png" alt="Logo de Three Angels Dental" width={40} height={40} />
          <div>
            <strong>Three Angels</strong>
            <small>Administración</small>
          </div>
        </div>
        <nav aria-label="Secciones del panel">
          {SECCIONES.map((s) => (
            <Link key={s.id} to={`/admin${s.id ? '/' + s.id : ''}`} className={s === seccion ? 'activo' : ''} onClick={() => setMenu(false)}>
              <span aria-hidden>{s.icono}</span> {s.label}
            </Link>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noopener">↗ Ver sitio web</a>
          <button onClick={salir}>Cerrar sesión</button>
        </div>
      </aside>
      <div className="adm-main">
        <header className="adm-top">
          <button className="adm-burger" onClick={() => setMenu(!menu)} aria-label="Abrir menú del panel">☰</button>
          <h1>{seccion.icono} {seccion.label}</h1>
          <span className="adm-user">👤 {sesion.usuario}</span>
        </header>
        <main className="adm-content">
          <Comp />
        </main>
      </div>
      {menu && <div className="adm-overlay" onClick={() => setMenu(false)} />}
    </div>
  );
}

function Login() {
  const { entrar } = useAdmin();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      await entrar(usuario, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="adm-login">
      <form className="adm-card adm-login-box" onSubmit={enviar}>
        <img src="/logo.png" alt="Logo de Three Angels Dental" width={72} height={72} />
        <h1>Panel de administración</h1>
        <p className="adm-muted">Three Angels Dental</p>
        <label>
          Usuario
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" required autoFocus />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn adm-btn-primary" disabled={cargando}>{cargando ? 'Ingresando…' : 'Ingresar'}</button>
        <Link to="/" className="adm-link">← Volver al sitio</Link>
      </form>
    </div>
  );
}
