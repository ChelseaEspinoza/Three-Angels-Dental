import { useState } from 'react';
import type { FormEvent } from 'react';
import { CATEGORIAS } from '../data/products';
import type { Producto } from '../data/products';
import { bs, normalizar } from '../lib/format';
import { useAdmin } from './session';
import SubirImagen from './SubirImagen';
import { BotonConfirmar, Estado, Modal, useDatos } from './ui';

type ProductoAdmin = Producto & { activo: boolean };

const VACIO: ProductoAdmin = { id: '', nombre: '', categoria: 'Cepillos', precio: 0, descripcion: '', icono: '🦷', imagen: '', destacado: false, stock: 10, activo: true };

export default function Productos() {
  const { llamar } = useAdmin();
  const { datos, error, recargar } = useDatos<ProductoAdmin[]>('/productos');
  const [editando, setEditando] = useState<{ p: ProductoAdmin; nuevo: boolean } | null>(null);
  const [buscar, setBuscar] = useState('');
  const [aviso, setAviso] = useState('');

  const eliminar = async (p: ProductoAdmin) => {
    try {
      await llamar(`/productos/${p.id}`, { method: 'DELETE' });
      recargar();
    } catch (e) {
      setAviso((e as Error).message);
    }
  };

  const lista = (datos || []).filter((p) => normalizar(`${p.nombre} ${p.categoria}`).includes(normalizar(buscar)));

  return (
    <>
      <div className="adm-toolbar">
        <input className="adm-search" placeholder="Buscar producto o categoría" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <button className="adm-btn adm-btn-primary" onClick={() => setEditando({ p: VACIO, nuevo: true })}>+ Nuevo producto</button>
      </div>
      {aviso && <p className="adm-error">{aviso}</p>}
      <Estado cargando={!datos} error={error} vacio={!lista.length}>
        <div className="adm-card adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th></th><th>Producto</th><th>Categoría</th><th className="num">Precio</th><th className="num">Stock</th><th>Visible</th><th></th></tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id} className={p.activo ? '' : 'adm-inactivo'}>
                  <td className="adm-icono">{p.imagen ? <img src={p.imagen} alt="" /> : p.icono}</td>
                  <td data-l="Producto"><strong>{p.nombre}</strong>{p.destacado && <em className="adm-badge e-confirmada">Recomendado</em>}<br /><small className="adm-muted">{p.id}</small></td>
                  <td data-l="Categoría">{p.categoria}</td>
                  <td data-l="Precio" className="num">{bs(p.precio)}</td>
                  <td data-l="Stock" className={`num ${p.stock === 0 ? 'adm-warn' : ''}`}>{p.stock ?? '—'}</td>
                  <td data-l="Visible">{p.activo ? '✅ Sí' : '🚫 Oculto'}</td>
                  <td className="adm-acciones">
                    <button className="adm-btn adm-btn-sm" onClick={() => setEditando({ p, nuevo: false })}>Editar</button>
                    <BotonConfirmar onConfirmar={() => eliminar(p)}>Eliminar</BotonConfirmar>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Estado>
      {editando && (
        <EditorProducto
          inicial={editando.p}
          nuevo={editando.nuevo}
          onCerrar={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null);
            recargar();
          }}
        />
      )}
    </>
  );
}

function EditorProducto({ inicial, nuevo, onCerrar, onGuardado }: { inicial: ProductoAdmin; nuevo: boolean; onCerrar: () => void; onGuardado: () => void }) {
  const { llamar } = useAdmin();
  const [p, setP] = useState<ProductoAdmin>(inicial);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const set = <K extends keyof ProductoAdmin>(k: K, v: ProductoAdmin[K]) => setP((x) => ({ ...x, [k]: v }));

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      await llamar(nuevo ? '/productos' : `/productos/${p.id}`, { method: nuevo ? 'POST' : 'PUT', body: p });
      onGuardado();
    } catch (err) {
      setError((err as Error).message);
      setGuardando(false);
    }
  };

  return (
    <Modal titulo={nuevo ? 'Nuevo producto' : `Editar: ${inicial.nombre}`} onCerrar={onCerrar}>
      <form className="adm-form" onSubmit={guardar}>
        <label className="full">Nombre *<input value={p.nombre} onChange={(e) => set('nombre', e.target.value)} required maxLength={120} /></label>
        <label>Categoría *
          <select value={p.categoria} onChange={(e) => set('categoria', e.target.value as Producto['categoria'])}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Precio (Bs.) *<input type="number" min={0} step="0.5" value={p.precio} onChange={(e) => set('precio', Number(e.target.value))} required /></label>
        <label>Stock (unidades)<input type="number" min={0} step={1} value={p.stock ?? 0} onChange={(e) => set('stock', Number(e.target.value))} /></label>
        <label>Ícono (emoji)<input value={p.icono} onChange={(e) => set('icono', e.target.value)} maxLength={8} /></label>
        <label className="full">Descripción<textarea rows={3} value={p.descripcion} onChange={(e) => set('descripcion', e.target.value)} maxLength={500} /></label>
        <div className="full">
          <span className="adm-label">Foto del producto (opcional)</span>
          <SubirImagen valor={p.imagen} onCambio={(url) => set('imagen', url)} />
          {!p.imagen && <small className="adm-muted">Sin foto, la tienda muestra el ícono.</small>}
        </div>
        {nuevo && (
          <label className="full">Código (opcional)
            <input value={p.id} onChange={(e) => set('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="Se genera a partir del nombre" maxLength={50} />
          </label>
        )}
        <label className="adm-check"><input type="checkbox" checked={!!p.destacado} onChange={(e) => set('destacado', e.target.checked)} /> Marcar como recomendado</label>
        <label className="adm-check"><input type="checkbox" checked={p.activo} onChange={(e) => set('activo', e.target.checked)} /> Visible en la tienda</label>
        {error && <p className="adm-error full">{error}</p>}
        <div className="adm-form-foot full">
          <button type="button" className="adm-btn" onClick={onCerrar}>Cancelar</button>
          <button className="adm-btn adm-btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  );
}
