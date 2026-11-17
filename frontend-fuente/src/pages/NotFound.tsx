import PageHeader from '../components/PageHeader';
import { Link } from '../lib/router';
import { useSeo } from '../lib/seo';

export default function NotFound() {
  useSeo('Página no encontrada', 'La página que buscas no existe en Three Angels Dental.');
  return (
    <>
      <PageHeader eyebrow="Error 404" titulo="Página no encontrada" texto="Puede que el enlace haya cambiado." />
      <section className="section container center">
        <Link to="/" className="btn btn-primary btn-lg">Volver al inicio</Link>
      </section>
    </>
  );
}
