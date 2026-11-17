// Carga un <script> externo una sola vez (se usa para el SDK de PayPal).
const cache = new Map<string, Promise<void>>();

export function loadScript(src: string): Promise<void> {
  if (!cache.has(src)) {
    cache.set(
      src,
      new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => {
          cache.delete(src);
          reject(new Error('No se pudo cargar ' + src));
        };
        document.body.appendChild(s);
      }),
    );
  }
  return cache.get(src)!;
}
