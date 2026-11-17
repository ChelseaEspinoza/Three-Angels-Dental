// Envío de eventos a Google Analytics 4 (gtag.js se carga en index.html).
// Si el ID todavía es G-XXXXXXXXXX, los eventos simplemente no se registran.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(evento: string, parametros: Record<string, unknown> = {}) {
  window.gtag?.('event', evento, parametros);
}

/** Página vista: se llama en cada cambio de ruta (la web no recarga). */
export function trackPageView(path: string, title: string) {
  track('page_view', { page_path: path, page_title: title, page_location: window.location.href });
}
