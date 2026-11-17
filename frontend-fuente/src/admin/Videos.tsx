// VIDEOS Y REDES: pega el enlace del video y aparece en la web, sin tocar código.
import { useEffect, useState } from 'react';
import { REDES } from '../config';
import { api } from '../lib/api';
import type { Redes, Video, VideoPropio } from '../lib/sitio';
import ListaVideosPropios from './SubirVideo';
import { useAdmin } from './session';

type Ajustes = { redes: Partial<Redes>; videosYoutube: Video[]; videosTiktok: Video[]; videosPropios?: VideoPropio[]; guardado: boolean };

/** Saca el ID de cualquier enlace de YouTube (watch, youtu.be, shorts, embed, live). */
export function idYoutube(texto: string) {
  const t = texto.trim();
  const m = /(?:[?&]v=|youtu\.be\/|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/.exec(t);
  return m ? m[1] : /^[\w-]{11}$/.test(t) ? t : '';
}

/** Saca el número de un enlace de TikTok (…/video/7312345678901234567). */
export function idTiktok(texto: string) {
  const t = texto.trim();
  const m = /\/video\/(\d{8,25})/.exec(t);
  return m ? m[1] : /^\d{8,25}$/.test(t) ? t : '';
}

const NOMBRES_REDES: [keyof Redes, string, string][] = [
  ['facebook', 'Facebook', 'https://www.facebook.com/tu-pagina'],
  ['instagram', 'Instagram', 'https://www.instagram.com/tu-usuario'],
  ['youtube', 'Canal de YouTube', 'https://www.youtube.com/@tu-canal'],
  ['tiktok', 'TikTok', 'https://www.tiktok.com/@tu-usuario'],
  ['messenger', 'Messenger', 'https://m.me/tu-pagina'],
  ['telegram', 'Telegram', 'https://t.me/tu-usuario'],
];

export default function Videos() {
  const { llamar } = useAdmin();
  const [a, setA] = useState<Ajustes>();
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    api<Ajustes>('/ajustes')
      .then((r) => setA(r.guardado ? r : {
        guardado: false,
        redes: Object.fromEntries(Object.entries(REDES).filter(([, v]) => !String(v).includes('TU_USUARIO'))),
        videosYoutube: [],
        videosTiktok: [],
      }))
      .catch((e: Error) => setMsg({ error: e.message }));
  }, []);

  if (!a) return msg.error ? <p className="adm-error">{msg.error}</p> : <p className="adm-muted">Cargando…</p>;

  const cambiar = (parcial: Partial<Ajustes>) => { setA({ ...a, ...parcial }); setMsg({}); };

  const guardar = async () => {
    setGuardando(true);
    try {
      const r = await llamar<Ajustes>('/ajustes', { method: 'PUT', body: a });
      setA(r);
      setMsg({ ok: '✅ Guardado. Los cambios ya se ven en la web.' });
    } catch (e) {
      setMsg({ error: (e as Error).message });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="vid-grid">
        <ListaVideosPropios videos={a.videosPropios || []} onCambio={(v) => cambiar({ videosPropios: v })} />
        <ListaVideos
          titulo="Videos de YouTube"
          ayuda="Pega el enlace del video o del Short, por ejemplo https://www.youtube.com/watch?v=… o https://youtube.com/shorts/…"
          extraer={idYoutube}
          errorEnlace="No reconozco ese enlace de YouTube. Copia la dirección completa del video."
          miniatura={(id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`}
          ver={(id) => `https://www.youtube.com/watch?v=${id}`}
          videos={a.videosYoutube}
          onCambio={(v) => cambiar({ videosYoutube: v })}
        />
        <ListaVideos
          titulo="Videos de TikTok"
          ayuda="Abre el video en el navegador de tu compu y copia la dirección completa: https://www.tiktok.com/@usuario/video/…"
          extraer={idTiktok}
          errorEnlace="No encuentro el número del video. Los enlaces cortos (vm.tiktok.com) no sirven: abre el video en el navegador y copia la dirección completa."
          ver={(id) => `https://www.tiktok.com/video/${id}`}
          videos={a.videosTiktok}
          onCambio={(v) => cambiar({ videosTiktok: v })}
        />
        <section className="adm-card adm-form vid-redes">
          <h2>Enlaces de redes sociales</h2>
          <p className="adm-muted">Se usan en el pie de página, en Contacto, en Redes y videos y en el botón de chat. <strong>Deja vacío lo que no uses</strong> (por ejemplo Messenger o Telegram): no se mostrará en la web.</p>
          {NOMBRES_REDES.map(([k, nombre, ejemplo]) => (
            <label key={k}>
              {nombre}
              <input type="url" placeholder={ejemplo} value={a.redes[k] || ''} onChange={(e) => cambiar({ redes: { ...a.redes, [k]: e.target.value } })} />
            </label>
          ))}
        </section>
      </div>
      <div className="adm-guardar">
        {msg.ok && <span className="adm-ok">{msg.ok}</span>}
        {msg.error && <span className="adm-error">{msg.error}</span>}
        <button className="adm-btn adm-btn-primary" onClick={guardar} disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
      </div>
    </>
  );
}

function ListaVideos(props: {
  titulo: string; ayuda: string; errorEnlace: string; videos: Video[];
  extraer: (t: string) => string; miniatura?: (id: string) => string; ver: (id: string) => string;
  onCambio: (v: Video[]) => void;
}) {
  const { titulo, ayuda, errorEnlace, videos, extraer, miniatura, ver, onCambio } = props;
  const [enlace, setEnlace] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  const agregar = () => {
    const id = extraer(enlace);
    if (!id) return setError(errorEnlace);
    if (videos.some((v) => v.id === id)) return setError('Ese video ya está en la lista.');
    onCambio([...videos, { id, titulo: nombre.trim() || 'Video de Three Angels Dental' }]);
    setEnlace('');
    setNombre('');
    setError('');
  };
  const mover = (i: number, d: number) => {
    const v = [...videos];
    [v[i], v[i + d]] = [v[i + d], v[i]];
    onCambio(v);
  };

  return (
    <section className="adm-card">
      <h2>{titulo}</h2>
      <div className="adm-form adm-form-1 vid-form">
        <label>Enlace del video<input value={enlace} onChange={(e) => { setEnlace(e.target.value); setError(''); }} placeholder="Pega aquí el enlace" /></label>
        <label>Título que se mostrará<input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Cómo usar hilo dental" maxLength={120} /></label>
        <small className="adm-muted">{ayuda}</small>
        {error && <p className="adm-error">{error}</p>}
        <button type="button" className="adm-btn" onClick={agregar} disabled={!enlace.trim()}>+ Agregar video</button>
      </div>
      {videos.length ? (
        <ul className="vid-lista">
          {videos.map((v, i) => (
            <li key={v.id}>
              {miniatura ? <img src={miniatura(v.id)} alt="" /> : <span className="vid-tt">♪</span>}
              <div>
                <input value={v.titulo} onChange={(e) => onCambio(videos.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x)))} aria-label="Título del video" />
                <a href={ver(v.id)} target="_blank" rel="noopener noreferrer">Ver original ↗</a>
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
        <p className="adm-muted">Aún no hay videos. Esta sección no aparece en la web hasta que agregues uno.</p>
      )}
    </section>
  );
}
