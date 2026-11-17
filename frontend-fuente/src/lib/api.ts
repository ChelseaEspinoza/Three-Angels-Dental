// Comunicación con el backend. Nginx redirige /api/... al contenedor "backend".
export const API_URL = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(ruta: string, opciones: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  const res = await fetch(API_URL + ruta, {
    method: opciones.method || (opciones.body ? 'POST' : 'GET'),
    headers: {
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opciones.token ? { Authorization: `Bearer ${opciones.token}` } : {}),
    },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, datos.error || 'No se pudo conectar con el servidor.');
  return datos as T;
}
