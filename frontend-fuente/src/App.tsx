// Estructura general: barra fija + página según la URL + pie + widgets flotantes.
import ChatWidget from './components/ChatWidget';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Appointments from './pages/Appointments';
import Community from './pages/Community';
import Contact from './pages/Contact';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Services from './pages/Services';
import Shop from './pages/Shop';
import Admin from './admin/Admin';
import { useRouter } from './lib/router';

// Tabla de rutas: URL → página.
const PAGINAS: Record<string, () => JSX.Element> = {
  '/': Home,
  '/servicios': Services,
  '/tienda': Shop,
  '/citas': Appointments,
  '/comunidad': Community,
  '/contacto': Contact,
};

export default function App() {
  const { path } = useRouter();
  const ruta = path.length > 1 ? path.replace(/\/+$/, '') : path; // tolera "/tienda/"
  const Pagina = PAGINAS[ruta] ?? NotFound;

  // El panel de administración tiene su propio diseño (sin barra ni pie del sitio).
  if (ruta === '/admin' || ruta.startsWith('/admin/')) return <Admin />;

  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <Navbar />
      <main id="contenido" key={ruta} className="page-enter">
        <Pagina />
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </>
  );
}
