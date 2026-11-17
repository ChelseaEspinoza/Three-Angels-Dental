import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Servicio } from '../data/services';
import { bs } from '../lib/format';
import { useAdmin } from './session';
import SubirImagen from './SubirImagen';
import { BotonConfirmar, Estado, Modal, useDatos } from './ui';

type ServicioAdmin = Servicio & { activo: boolean; orden: number };

const CATEGORIAS: Servicio['categoria'][] = ['Prevención', 'Especialidades', 'Estética', 'Niños'];
const IMAGENES = ['/2.jpeg', '/3.jpeg', '/4.jpeg', '/5.jpeg', '/6.jpeg'];
const VACIO: ServicioAdmin = {
  id: '', nombre: '', categoria: 'Prevención', precio: 0, desde: false, duracion: '30 min', resumen: '', incluye: [],
  imagen: '/3.jpeg', alt: '', orden: 99, activo: true,
};

export default function Servicios() {
  const { llamar } = useAdmin();
  const { datos, error, recargar } = useDatos<ServicioAdmin[]>('/servicios');
  const [editando, setEditando] = useState<{ s: ServicioAdmin; nuevo: boolean } | null>(null);
  const [aviso, setAviso] = useState('');

  const eliminar = async (s: ServicioAdmin) => {
    try {
      await llamar(`/servicios/${s.id}`, { method: 'DELETE' });
      recargar();
    } catch (e) {
      setAviso((e as Error).message);
    }
  };

  return (
    <>
      <div className="adm-toolbar">
        <p className="adm-muted">Los servicios aparecen en la página Servicios y en el formulario de citas, en el orden indicado.</p>
        <button className="adm-btn adm-btn-primary" onClick={() => setEditando({ s: VACIO, nuevo: true })}>+ Nuevo servicio</button>
      </div>
      {aviso && <p className="adm-error">{aviso}</p>}
      <Estado cargando={!datos} error={error} vacio={!datos?.length}>
        <div className="adm-card adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th className="num">Orden</th><th>Servicio</th><th>Categoría</th><th className="num">Precio</th><th>Duración</th><th>Visible</th><th></th></tr>
            </thead>
            <tbody>
              {(datos || []).map((s) => (
                <tr key={s.id} className={s.activo ? '' : 'adm-inactivo'}>
                  <td data-l="Orden" className="num">{s.orden}</td>
                  <td data-l="Servicio"><strong>{s.nombre}</strong><br /><small className="adm-muted">{s.resumen}</small></td>
                  <td data-l="Categoría">{s.categoria}</td>
                  <td data-l="Precio" className="num">{s.desde ? 'Desde ' : ''}{bs(s.precio)}</td>
                  <td data-l="Duración">{s.duracion}</td>
                  <td data-l="Visible">{s.activo ? '✅ Sí' : '🚫 Oculto'}</td>
                  <td className="adm-acciones">
                    <button className="adm-btn adm-btn-sm" onClick={() => setEditando({ s, nuevo: false })}>Editar</button>
                    <BotonConfirmar onConfirmar={() => eliminar(s)}>Eliminar</BotonConfirmar>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Estado>
      {editando && (
        <EditorServicio
          inicial={editando.s}
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

function EditorServicio({ inicial, nuevo, onCerrar, onGuardado }: { inicial: ServicioAdmin; nuevo: boolean; onCerrar: () => void; onGuardado: () => void }) {
  const { llamar } = useAdmin();
  const [s, setS] = useState<ServicioAdmin>(inicial);
  const [incluye, setIncluye] = useState(inicial.incluye.join('\n'));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const set = <K extends keyof ServicioAdmin>(k: K, v: ServicioAdmin[K]) => setS((x) => ({ ...x, [k]: v }));

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    const cuerpo = { ...s, alt: s.alt || `${s.nombre} en Three Angels Dental, Sucre`, incluye: incluye.split('\n').map((x) => x.trim()).filter(Boolean) };
    try {
      await llamar(nuevo ? '/servicios' : `/servicios/${s.id}`, { method: nuevo ? 'POST' : 'PUT', body: cuerpo });
      onGuardado();
    } catch (err) {
      setError((err as Error).message);
      setGuardando(false);
    }
  };

  return (
    <Modal titulo={nuevo ? 'Nuevo servicio' : `Editar: ${inicial.nombre}`} onCerrar={onCerrar}>
      <form className="adm-form" onSubmit={guardar}>
        <label className="full">Nombre *<input value={s.nombre} onChange={(e) => set('nombre', e.target.value)} required maxLength={120} /></label>
        <label>Categoría *
          <select value={s.categoria} onChange={(e) => set('categoria', e.target.value as Servicio['categoria'])}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Precio (Bs.) *<input type="number" min={0} step={1} value={s.precio} onChange={(e) => set('precio', Number(e.target.value))} required /></label>
        <label>Duración<input value={s.duracion} onChange={(e) => set('duracion', e.target.value)} placeholder="Ej. 45 min" maxLength={40} /></label>
        <label>Orden en la lista<input type="number" min={0} value={s.orden} onChange={(e) => set('orden', Number(e.target.value))} /></label>
        <label className="full">Resumen<textarea rows={2} value={s.resumen} onChange={(e) => set('resumen', e.target.value)} maxLength={300} /></label>
        <label className="full">Qué incluye (uno por línea)<textarea rows={3} value={incluye} onChange={(e) => setIncluye(e.target.value)} /></label>
        <div className="full">
          <span className="adm-label">Imagen</span>
          <SubirImagen valor={IMAGENES.includes(s.imagen) ? undefined : s.imagen} onCambio={(url) => set('imagen', url || '/3.jpeg')} texto="Arrastra aquí tu propia foto" />
          <small className="adm-muted">o elige una de las fotos de la clínica:</small>
          <div className="adm-imgs">
            {IMAGENES.map((src) => (
              <button type="button" key={src} className={s.imagen === src ? 'activo' : ''} onClick={() => set('imagen', src)} aria-label={`Usar imagen ${src}`}>
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>
        <label className="adm-check"><input type="checkbox" checked={!!s.desde} onChange={(e) => set('desde', e.target.checked)} /> Mostrar “Desde” antes del precio</label>
        <label className="adm-check"><input type="checkbox" checked={s.activo} onChange={(e) => set('activo', e.target.checked)} /> Visible en la web</label>
        {error && <p className="adm-error full">{error}</p>}
        <div className="adm-form-foot full">
          <button type="button" className="adm-btn" onClick={onCerrar}>Cancelar</button>
          <button className="adm-btn adm-btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  );
}
