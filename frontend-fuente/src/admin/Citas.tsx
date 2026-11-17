import { useState } from 'react';
import { bs, normalizar } from '../lib/format';
import { useAdmin } from './session';
import { Estado, fechaCorta, hoyLocal as hoy, useDatos, whatsapp } from './ui';

export type Cita = {
  id: number;
  servicio: string;
  fecha: string;
  hora: string;
  paciente: string;
  telefono: string;
  email: string | null;
  primera_vez: number;
  notas: string | null;
  monto_bs: number;
  metodo: 'paypal' | 'whatsapp';
  paypal_id: string | null;
  estado: string;
};

const ESTADOS = ['pendiente', 'confirmada', 'atendida', 'cancelada', 'no_asistio'];

export default function Citas() {
  const { llamar } = useAdmin();
  const { datos, error, setDatos, recargar } = useDatos<Cita[]>('/citas');
  const [filtro, setFiltro] = useState('proximas');
  const [buscar, setBuscar] = useState('');
  const [aviso, setAviso] = useState('');

  const cambiarEstado = async (c: Cita, estado: string) => {
    setAviso('');
    try {
      await llamar(`/citas/${c.id}`, { method: 'PUT', body: { estado } });
      setDatos(datos!.map((x) => (x.id === c.id ? { ...x, estado } : x)));
    } catch (e) {
      setAviso((e as Error).message);
    }
  };

  let lista = (datos || []).filter((c) => {
    if (filtro === 'proximas' && (c.fecha < hoy() || ['cancelada', 'atendida', 'no_asistio'].includes(c.estado))) return false;
    if (filtro === 'pasadas' && c.fecha >= hoy()) return false;
    const t = normalizar(buscar);
    return !t || normalizar(`${c.paciente} ${c.telefono} ${c.servicio}`).includes(t);
  });
  // Las próximas se muestran de la más cercana a la más lejana.
  if (filtro === 'proximas') lista = [...lista].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  return (
    <>
      <div className="adm-toolbar">
        <div className="adm-chips">
          {[['proximas', 'Próximas'], ['pasadas', 'Pasadas'], ['todas', 'Todas']].map(([f, l]) => (
            <button key={f} className={filtro === f ? 'activo' : ''} onClick={() => setFiltro(f)}>{l}</button>
          ))}
        </div>
        <input className="adm-search" placeholder="Buscar paciente, teléfono o servicio" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <button className="adm-btn" onClick={recargar}>↻ Actualizar</button>
      </div>
      {aviso && <p className="adm-error">{aviso}</p>}
      <Estado cargando={!datos} error={error} vacio={!lista.length}>
        <div className="adm-card adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Especialidad</th><th>Pago</th><th>Notas</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id} className={c.fecha === hoy() ? 'adm-hoy' : ''}>
                  <td data-l="Fecha"><strong>{fechaCorta(c.fecha)}</strong>{c.fecha === hoy() && <em className="adm-badge e-confirmada"> hoy</em>}</td>
                  <td data-l="Hora">{c.hora}</td>
                  <td data-l="Paciente">
                    {c.paciente} {c.primera_vez ? <em className="adm-badge e-nuevo">1.ª vez</em> : null}
                    <br />
                    <a href={whatsapp(c.telefono)} target="_blank" rel="noopener noreferrer">💬 {c.telefono}</a>
                  </td>
                  <td data-l="Especialidad">{c.servicio}</td>
                  <td data-l="Pago">
                    {c.metodo === 'paypal' ? <span className="adm-badge m-paypal">PayPal {bs(Number(c.monto_bs))}</span> : <span className="adm-badge m-whatsapp">En consultorio</span>}
                  </td>
                  <td data-l="Notas" className="adm-notas">{c.notas || '—'}</td>
                  <td data-l="Estado">
                    <select className={`adm-select e-${c.estado}`} value={c.estado} onChange={(e) => cambiarEstado(c, e.target.value)} aria-label={`Estado de la cita de ${c.paciente}`}>
                      {ESTADOS.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Estado>
    </>
  );
}
