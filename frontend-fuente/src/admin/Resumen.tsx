import { bs } from '../lib/format';
import { Link } from '../lib/router';
import { Estado, fechaCorta, useDatos } from './ui';
import type { Cita } from './Citas';

type Resumen = {
  pedidosPendientes: number;
  citasProximas: number;
  ventasMesBs: number;
  pedidosMes: number;
  bajoStock: { id: string; nombre: string; stock: number }[];
  proximas: Cita[];
};

export default function Resumen() {
  const { datos, error } = useDatos<Resumen>('/resumen');
  return (
    <Estado cargando={!datos} error={error}>
      {datos && (
        <>
          <div className="adm-kpis">
            <Link to="/admin/pedidos" className="adm-card adm-kpi">
              <span>Pedidos por atender</span>
              <strong>{datos.pedidosPendientes}</strong>
            </Link>
            <Link to="/admin/citas" className="adm-card adm-kpi">
              <span>Citas próximas</span>
              <strong>{datos.citasProximas}</strong>
            </Link>
            <div className="adm-card adm-kpi">
              <span>Ventas de la tienda este mes</span>
              <strong>{bs(datos.ventasMesBs)}</strong>
              <small>{datos.pedidosMes} pedidos</small>
            </div>
            <Link to="/admin/productos" className="adm-card adm-kpi">
              <span>Productos con poco stock</span>
              <strong className={datos.bajoStock.length ? 'adm-warn' : ''}>{datos.bajoStock.length}</strong>
            </Link>
          </div>

          <div className="adm-grid2">
            <section className="adm-card">
              <h2>Próximas citas</h2>
              {datos.proximas.length ? (
                <ul className="adm-lista">
                  {datos.proximas.map((c) => (
                    <li key={c.id}>
                      <strong>{fechaCorta(c.fecha)} · {c.hora}</strong>
                      <span>{c.paciente} — {c.servicio}</span>
                      <em className={`adm-badge e-${c.estado}`}>{c.estado}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="adm-muted">No hay citas próximas.</p>
              )}
            </section>
            <section className="adm-card">
              <h2>Stock bajo (5 o menos)</h2>
              {datos.bajoStock.length ? (
                <ul className="adm-lista">
                  {datos.bajoStock.map((p) => (
                    <li key={p.id}>
                      <span>{p.nombre}</span>
                      <em className={`adm-badge ${p.stock === 0 ? 'e-cancelado' : 'e-pendiente'}`}>{p.stock === 0 ? 'Agotado' : `${p.stock} u.`}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="adm-muted">Todo el inventario está en orden.</p>
              )}
            </section>
          </div>
        </>
      )}
    </Estado>
  );
}
