// VIDEOS SUBIDOS DESDE LA COMPU (archivo nuevo).
// Arrastra un video (MP4, WEBM o MOV, hasta 95 MB) o elígelo; se sube con barra de progreso.
import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { API_URL } from '../lib/api';
import type { VideoPropio } from '../lib/sitio';
import { useAdmin } from './session';

const MAX_MB = 95;

export default function ListaVideosPropios({ videos, onCambio }: { videos: VideoPropio[]; onCambio: (v: VideoPropio[]) => void }) {
  const { sesion, salir } = useAdmin();
  const input = useRef<HTMLInputElement>(null);
  const [titulo, setTitulo] = useState('');
  const [encima, setEncima] = useState(false);
  const [progreso, setProgreso] = useState<number | null>(null);
  const [error, setError] = useState('');

  const subir = (archivo?: File | null) => {
    if (!archivo) return;
    setError('');
    if (!/^video\/(mp4|webm|quicktime)$/.test(archivo.type)) return setError('Formato no permitido. Usa un video MP4, WEBM o MOV.');
    if (archivo.size > MAX_MB * 1024 * 1024) {
      return setError(`El video pesa ${(archivo.size / 1048576).toFixed(0)} MB y el máximo es ${MAX_MB} MB. Comprímelo (por ejemplo con HandBrake o CapCut) o súbelo a YouTube y pega el enlace.`);
    }
    // XMLHttpRequest permite mostrar el porcentaje de subida.
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/admin/videos-archivo`);
    xhr.setRequestHeader('Content-Type', archivo.type);
    xhr.setRequestHeader('Authorization', `Bearer ${sesion?.token}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && setProgreso(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      setProgreso(null);
      let r: { url?: string; error?: string } = {};
      try { r = JSON.parse(xhr.responseText); } catch { /* respuesta no JSON */ }
      if (xhr.status === 401) return salir();
      if (xhr.status === 413) return setError('El video es demasiado grande para el servidor (máx. 95 MB).');
      if (xhr.status >= 400 || !r.url) return setError(r.error || 'No se pudo subir el video.');
      onCambio([...videos, { url: r.url, titulo: titulo.trim() || archivo.name.replace(/\.[^.]+$/, '') }]);
      setTitulo('');
    };
    xhr.onerror = () => { setProgreso(null); setError('Se cortó la conexión mientras se subía el video.'); };
    setProgreso(0);
    xhr.send(archivo);
  };

  const soltar = (e: DragEvent) => { e.preventDefault(); setEncima(false); subir(e.dataTransfer.files[0]); };
  const mover = (i: number, d: number) => { const v = [...videos]; [v[i], v[i + d]] = [v[i + d], v[i]]; onCambio(v); };

  return (
    <section className="adm-card">
      <h2>Videos subidos desde tu compu</h2>
      <div className="adm-form adm-form-1 vid-form">
        <label>Título que se mostrará<input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Conoce nuestra clínica" maxLength={120} /></label>
        <div
          className={`sub-zona ${encima ? 'encima' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setEncima(true); }}
          onDragLeave={() => setEncima(false)}
          onDrop={soltar}
          onClick={() => progreso == null && input.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Subir video: arrastra el archivo o haz clic para elegirlo"
        >
          <div className="sub-texto">
            {progreso != null ? (
              <>
                <span>⏳ Subiendo… {progreso} %</span>
                <div className="vid-barra"><div style={{ width: `${progreso}%` }} /></div>
                <small>No cierres esta página hasta que termine.</small>
              </>
            ) : (
              <>
                <span>🎬 Arrastra aquí un video</span>
                <small>o haz clic para elegirlo · MP4, WEBM o MOV · hasta {MAX_MB} MB</small>
              </>
            )}
          </div>
        </div>
        <input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => { subir(e.target.files?.[0]); e.target.value = ''; }} />
        {error && <p className="adm-error">{error}</p>}
      </div>
      {videos.length ? (
        <ul className="vid-lista">
          {videos.map((v, i) => (
            <li key={v.url}>
              <video src={v.url} className="vid-mini" preload="metadata" muted />
              <div>
                <input value={v.titulo} onChange={(e) => onCambio(videos.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x)))} aria-label="Título del video" />
                <a href={v.url} target="_blank" rel="noopener noreferrer">Ver video ↗</a>
              </div>
              <span className="vid-acc">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir">▲</button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === videos.length - 1} aria-label="Bajar">▼</button>
                <button type="button" className="vid-x" onClick={() => onCambio(videos.filter((_, j) => j !== i))} aria-label="Quitar video">✕</button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="adm-muted">Aún no subiste videos.</p>
      )}
      <p className="adm-muted vid-nota">Después de subir o quitar videos, pulsa <strong>Guardar cambios</strong>.</p>
    </section>
  );
}
