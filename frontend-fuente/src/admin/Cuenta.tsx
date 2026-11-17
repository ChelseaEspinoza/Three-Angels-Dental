import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAdmin } from './session';

export default function Cuenta() {
  const { llamar, salir, sesion } = useAdmin();
  const [f, setF] = useState({ actual: '', nueva: '', repetir: '' });
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});

  const cambiar = async (e: FormEvent) => {
    e.preventDefault();
    if (f.nueva !== f.repetir) return setMsg({ error: 'Las contraseñas nuevas no coinciden.' });
    try {
      await llamar('/password', { method: 'PUT', body: { actual: f.actual, nueva: f.nueva } });
      setF({ actual: '', nueva: '', repetir: '' });
      setMsg({ ok: 'Contraseña actualizada correctamente.' });
    } catch (err) {
      setMsg({ error: (err as Error).message });
    }
  };

  return (
    <div className="adm-grid2">
      <form className="adm-card adm-form adm-form-1" onSubmit={cambiar}>
        <h2>Cambiar contraseña</h2>
        <p className="adm-muted">Usuario: <strong>{sesion?.usuario}</strong></p>
        <label>Contraseña actual<input type="password" value={f.actual} onChange={(e) => setF({ ...f, actual: e.target.value })} autoComplete="current-password" required /></label>
        <label>Nueva contraseña (mínimo 8 caracteres)<input type="password" minLength={8} value={f.nueva} onChange={(e) => setF({ ...f, nueva: e.target.value })} autoComplete="new-password" required /></label>
        <label>Repetir nueva contraseña<input type="password" minLength={8} value={f.repetir} onChange={(e) => setF({ ...f, repetir: e.target.value })} autoComplete="new-password" required /></label>
        {msg.ok && <p className="adm-ok">{msg.ok}</p>}
        {msg.error && <p className="adm-error">{msg.error}</p>}
        <button className="adm-btn adm-btn-primary">Guardar contraseña</button>
      </form>
      <div className="adm-card">
        <h2>Sesión</h2>
        <p className="adm-muted">Por seguridad, la sesión se cierra sola después de 12 horas.</p>
        <button className="adm-btn" onClick={salir}>Cerrar sesión</button>
      </div>
    </div>
  );
}
