// Enrutador multipágina liviano (sin dependencias externas).
// Usa la History API del navegador: cada página tiene su propia URL real
// (/servicios, /tienda, ...), funciona con los botones Atrás/Adelante y con
// enlaces directos (nginx devuelve index.html para cualquier ruta).
import { createContext, useContext, useEffect, useState } from 'react';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';

type RouterValue = { path: string; search: string; navigate: (to: string) => void };

const RouterContext = createContext<RouterValue>({ path: '/', search: '', navigate: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState({ path: window.location.pathname, search: window.location.search });

  useEffect(() => {
    const onPop = () => setLoc({ path: window.location.pathname, search: window.location.search });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    const url = new URL(to, window.location.origin);
    if (url.pathname + url.search !== window.location.pathname + window.location.search) {
      window.history.pushState({}, '', url.pathname + url.search + url.hash);
    }
    setLoc({ path: url.pathname, search: url.search });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  return <RouterContext.Provider value={{ ...loc, navigate }}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

/** Enlace interno: cambia de página sin recargar el sitio. */
export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
