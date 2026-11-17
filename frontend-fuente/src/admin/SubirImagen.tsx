// Subir una imagen arrastrándola, eligiéndola de la compu o pegándola (Ctrl+V).
// Antes de enviarla se reduce a 1200 px como máximo para que la web cargue rápido.
import { useRef, useState } from 'react';
import type { ClipboardEvent, DragEvent } from 'react';
import { useAdmin } from './session';

const MAX_LADO = 1200;

/** Reduce la imagen en el navegador y la devuelve como texto base64. */
async function preparar(archivo: File): Promise<string> {
  if (archivo.type === 'image/gif') return leerComoTexto(archivo); // los GIF animados se suben tal cual
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => mal(new Error('No se pudo leer la imagen.'));
      i.src = url;
    });
    const escala = Math.min(1, MAX_LADO / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * escala);
    canvas.height = Math.round(img.naturalHeight * escala);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const webp = canvas.toDataURL('image/webp', 0.85);
    return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function leerComoTexto(archivo: File): Promise<string> {
  return new Promise((ok, mal) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => mal(new Error('No se pudo leer el archivo.'));
    r.readAsDataURL(archivo);
  });
}

export default function SubirImagen({ valor, onCambio, texto = 'Arrastra aquí una foto' }: { valor?: string; onCambio: (url: string) => void; texto?: string }) {
  const { llamar } = useAdmin();
  const input = useRef<HTMLInputElement>(null);
  const [encima, setEncima] = useState(false);
  const [estado, setEstado] = useState<{ subiendo?: boolean; error?: string }>({});

  const subir = async (archivo?: File | null) => {
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) return setEstado({ error: 'Ese archivo no es una imagen.' });
    if (archivo.size > 25 * 1024 * 1024) return setEstado({ error: 'La imagen es demasiado grande (máx. 25 MB).' });
    setEstado({ subiendo: true });
    try {
      const data = await preparar(archivo);
      const { url } = await llamar<{ url: string }>('/imagenes', { body: { data } });
      onCambio(url);
      setEstado({});
    } catch (e) {
      setEstado({ error: (e as Error).message });
    }
  };

  const soltar = (e: DragEvent) => {
    e.preventDefault();
    setEncima(false);
    subir(e.dataTransfer.files[0]);
  };
  const pegar = (e: ClipboardEvent) => {
    const archivo = Array.from(e.clipboardData.files).find((f) => f.type.startsWith('image/'));
    if (archivo) {
      e.preventDefault();
      subir(archivo);
    }
  };

  return (
    <div className="sub">
      <div
        className={`sub-zona ${encima ? 'encima' : ''} ${valor ? 'con-foto' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setEncima(true); }}
        onDragLeave={() => setEncima(false)}
        onDrop={soltar}
        onPaste={pegar}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Subir imagen: arrastra, haz clic para elegir o pega con Ctrl+V"
      >
        {valor && <img src={valor} alt="Vista previa" />}
        <div className="sub-texto">
          {estado.subiendo ? (
            <span>⏳ Subiendo…</span>
          ) : (
            <>
              <span>🖼️ {valor ? 'Arrastra otra foto para cambiarla' : texto}</span>
              <small>o haz clic para elegirla de tu compu · también puedes pegarla con Ctrl+V</small>
            </>
          )}
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { subir(e.target.files?.[0]); e.target.value = ''; }} />
      {valor && !estado.subiendo && (
        <button type="button" className="adm-btn adm-btn-sm adm-btn-danger-ghost" onClick={() => onCambio('')}>Quitar foto</button>
      )}
      {estado.error && <p className="adm-error">{estado.error}</p>}
    </div>
  );
}
