// Título y descripción por página (SEO + vista previa al compartir).
import { useEffect } from 'react';
import { trackPageView } from './analytics';

function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

export function useSeo(titulo: string, descripcion: string) {
  useEffect(() => {
    const full = `${titulo} | Three Angels Dental Sucre`;
    document.title = full;
    setMeta('meta[name="description"]', 'name', 'description', descripcion);
    setMeta('meta[property="og:title"]', 'property', 'og:title', full);
    setMeta('meta[property="og:description"]', 'property', 'og:description', descripcion);
    setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;
    trackPageView(window.location.pathname, full);
  }, [titulo, descripcion]);
}
