// Carrito de compras global (se guarda en el navegador con localStorage).
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Producto } from '../data/products';
import { track } from './analytics';
import { aUsd } from './format';
import { useCatalog } from './catalog';

export type LineaCarrito = { producto: Producto; cantidad: number };

type CartValue = {
  lineas: LineaCarrito[];
  totalBs: number;
  cantidadTotal: number;
  agregar: (p: Producto) => void;
  cambiarCantidad: (id: string, cantidad: number) => void;
  quitar: (id: string) => void;
  vaciar: () => void;
  panelAbierto: boolean;
  abrirPanel: (abierto: boolean) => void;
};

const CartContext = createContext<CartValue | null>(null);
const KEY = 'three_angels_carrito';

function leerGuardado(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Se guarda solo { idProducto: cantidad }; los datos del producto salen del catálogo.
  const [items, setItems] = useState<Record<string, number>>(leerGuardado);
  const [panelAbierto, abrirPanel] = useState(false);
  const { productos } = useCatalog();

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* navegador en modo privado: se ignora */
    }
  }, [items]);

  const value = useMemo<CartValue>(() => {
    const lineas = Object.entries(items)
      .map(([id, cantidad]) => ({ producto: productos.find((p) => p.id === id)!, cantidad }))
      .filter((l) => l.producto && l.cantidad > 0);
    return {
      lineas,
      totalBs: lineas.reduce((s, l) => s + l.producto.precio * l.cantidad, 0),
      cantidadTotal: lineas.reduce((s, l) => s + l.cantidad, 0),
      agregar: (p) => {
        setItems((prev) => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }));
        track('add_to_cart', {
          currency: 'USD',
          value: aUsd(p.precio),
          items: [{ item_id: p.id, item_name: p.nombre, item_category: p.categoria, price: aUsd(p.precio) }],
        });
      },
      cambiarCantidad: (id, cantidad) =>
        setItems((prev) => {
          const next = { ...prev };
          if (cantidad <= 0) delete next[id];
          else next[id] = Math.min(cantidad, 99);
          return next;
        }),
      quitar: (id) =>
        setItems((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        }),
      vaciar: () => setItems({}),
      panelAbierto,
      abrirPanel,
    };
  }, [items, panelAbierto, productos]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
