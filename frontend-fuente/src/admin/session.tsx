// Sesión del administrador (token guardado en el navegador).
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { api, ApiError } from '../lib/api';

const KEY = 'three_angels_admin';

type Sesion = { token: string; usuario: string } | null;
type AdminValue = {
  sesion: Sesion;
  entrar: (usuario: string, password: string) => Promise<void>;
  salir: () => void;
  /** Llama a la API de administración con el token; si la sesión venció, cierra sesión. */
  llamar: <T>(ruta: string, opciones?: { method?: string; body?: unknown }) => Promise<T>;
};

const AdminContext = createContext<AdminValue | null>(null);

function leer(): Sesion {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion>(leer);

  const guardar = (s: Sesion) => {
    setSesion(s);
    try {
      if (s) localStorage.setItem(KEY, JSON.stringify(s));
      else localStorage.removeItem(KEY);
    } catch {
      /* ignorar */
    }
  };

  const value: AdminValue = {
    sesion,
    entrar: async (usuario, password) => {
      const r = await api<{ token: string; usuario: string }>('/admin/login', { body: { usuario, password } });
      guardar(r);
    },
    salir: () => guardar(null),
    llamar: async (ruta, opciones = {}) => {
      try {
        return await api('/admin' + ruta, { ...opciones, token: sesion?.token });
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) guardar(null);
        throw e;
      }
    },
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin debe usarse dentro de <AdminProvider>');
  return ctx;
}
