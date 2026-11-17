// Piezas reutilizables del panel.
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAdmin } from './session';

/** Carga datos de la API de administración y permite recargarlos. */
export function useDatos<T>(ruta: string) {
  const { llamar } = useAdmin();
  const [datos, setDatos] = useState<T>();
  const [error, setError] = useState('');
  const recargar = useCallback(() => {
    setError('');
    llamar<T>(ruta).then(setDatos).catch((e: Error) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruta]);
  useEffect(recargar, [recargar]);
  return { datos, error, recargar, setDatos };
}

export function Estado({ cargando, error, vacio, children }: { cargando: boolean; error?: string; vacio?: boolean; children: ReactNode }) {
  if (error) return <p className="adm-error">⚠️ {error}</p>;
  if (cargando) return <p className="adm-muted">Cargando…</p>;
  if (vacio) return <p className="adm-vacio">No hay registros todavía.</p>;
  return <>{children}</>;
}

/** Fecha local de hoy en formato AAAA-MM-DD. */
export const hoyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const fechaCorta = (s: string) => {
  // "2026-11-19" se interpreta como fecha local (no UTC) para no correr un día.
  const [y, m, dd] = s.slice(0, 10).split('-').map(Number);
  const d = new Date(y, m - 1, dd);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const fechaHora = (s: string) => {
  const d = new Date(s.replace(' ', 'T') + (s.includes('T') || s.endsWith('Z') ? '' : 'Z'));
  return isNaN(d.getTime()) ? s : d.toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const whatsapp = (tel: string) => `https://wa.me/${tel.replace(/\D/g, '').replace(/^(?!591)(\d{8})$/, '591$1')}`;

/** Botón que pide una segunda confirmación antes de una acción irreversible. */
export function BotonConfirmar({ onConfirmar, children }: { onConfirmar: () => void; children: ReactNode }) {
  const [seguro, setSeguro] = useState(false);
  if (!seguro) return <button className="adm-btn adm-btn-sm adm-btn-danger-ghost" onClick={() => setSeguro(true)}>{children}</button>;
  return (
    <span className="adm-confirm">
      ¿Seguro?
      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => { setSeguro(false); onConfirmar(); }}>Sí</button>
      <button className="adm-btn adm-btn-sm" onClick={() => setSeguro(false)}>No</button>
    </span>
  );
}

export function Modal({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: ReactNode }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onCerrar]);
  return (
    <div className="adm-modal-fondo" onClick={onCerrar}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-head">
          <h2>{titulo}</h2>
          <button className="adm-x" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
