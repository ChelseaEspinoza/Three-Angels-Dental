import { Fragment, useState } from 'react';
import { bs, normalizar } from '../lib/format';
import { useAdmin } from './session';
import { Estado, fechaHora, useDatos, whatsapp } from './ui';

type Pedido = {
  id: number;
  cliente: string;
  telefono: string;
  direccion: string | null;
  ubicacion: string | null;
  items: { id: string; nombre: string; precio: number; cantidad: number }[];
  total_bs: number;
  metodo: 'paypal' | 'whatsapp';
  paypal_id: string | null;
  estado: string;
  creado: string;
};

const ESTADOS = ['nuevo', 'pagado', 'confirmado', 'enviado', 'entregado', 'cancelado'];

export default function Pedidos() {
  const { llamar } = useAdmin();
  const { datos, error, setDatos, recargar } = useDatos<Pedido[]>('/pedidos');
  const [filtro, setFiltro] = useState('pendientes');
  const [buscar, setBuscar] = useState('');
  const [abierto, setAbierto] = useState<number | null>(null);
  const [aviso, setAviso] = useState('');

  const cambiarEstado = async (p: Pedido, estado: string) => {
    setAviso('');
    try {
      await llamar(`/pedidos/${p.id}`, { method: 'PUT', body: { estado } });
      setDatos(datos!.map((x) => (x.id === p.id ? { ...x, estado } : x)));
    } catch (e) {
      setAviso((e as Error).message);
    }
  };

  const lista = (datos || []).filter((p) => {
    if (filtro === 'pendientes' && !['nuevo', 'pagado', 'confirmado', 'enviado'].includes(p.estado)) return false;
    if (filtro !== 'pendientes' && filtro !== 'todos' && p.estado !== filtro) return false;
    const t = normalizar(buscar);
    return !t || normalizar(`${p.id} ${p.cliente} ${p.telefono}`).includes(t);
  });

  return (
    <>
      <div className="adm-toolbar">
        <div className="adm-chips">
          {['pendientes', 'todos', ...ESTADOS].map((f) => (
            <button key={f} className={filtro === f ? 'activo' : ''} onClick={() => setFiltro(f)}>{f}</button>
          ))}
        </div>
        <input className="adm-search" placeholder="Buscar por N.º, cliente o teléfono" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <button className="adm-btn" onClick={recargar}>↻ Actualizar</button>
      </div>
      {aviso && <p className="adm-error">{aviso}</p>}
      <Estado cargando={!datos} error={error} vacio={!lista.length}>
        <div className="adm-card adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>N.º</th><th>Fecha</th><th>Cliente</th><th>Productos</th><th className="num">Total</th><th>Pago</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <Fragment key={p.id}>
                  <tr className="adm-row" onClick={() => setAbierto(abierto === p.id ? null : p.id)}>
                    <td data-l="N.º"><strong>#{p.id}</strong></td>
                    <td data-l="Fecha">{fechaHora(p.creado)}</td>
                    <td data-l="Cliente">
                      {p.cliente}
                      <br />
                      <a href={whatsapp(p.telefono)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>💬 {p.telefono}</a>
                    </td>
                    <td data-l="Productos">{p.items.reduce((s, i) => s + i.cantidad, 0)} u. · {p.items[0]?.nombre}{p.items.length > 1 ? ` y ${p.items.length - 1} más` : ''}</td>
                    <td data-l="Total" className="num"><strong>{bs(p.total_bs)}</strong></td>
                    <td data-l="Pago"><span className={`adm-badge m-${p.metodo}`}>{p.metodo === 'paypal' ? 'PayPal' : 'Contra entrega'}</span></td>
                    <td data-l="Estado" onClick={(e) => e.stopPropagation()}>
                      <select className={`adm-select e-${p.estado}`} value={p.estado} onChange={(e) => cambiarEstado(p, e.target.value)} aria-label={`Estado del pedido ${p.id}`}>
                        {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                  </tr>
                  {abierto === p.id && (
                    <tr className="adm-detalle">
                      <td colSpan={7}>
                        <div className="adm-detalle-grid">
                          <div>
                            <h3>Productos</h3>
                            <ul>
                              {p.items.map((i) => <li key={i.id}>{i.cantidad} × {i.nombre} — {bs(i.precio * i.cantidad)}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h3>Entrega</h3>
                            <p>{p.direccion || 'Sin dirección escrita'}</p>
                            {p.ubicacion && <p><a href={p.ubicacion} target="_blank" rel="noopener noreferrer">📍 Ver ubicación GPS</a></p>}
                            {p.paypal_id && <p>Transacción PayPal: <code>{p.paypal_id}</code></p>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Estado>
    </>
  );
}
