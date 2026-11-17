// Catálogo de productos y servicios.
// Se carga desde la base de datos (lo que edita el administrador). Si el servidor no
// responde, se usan los datos de respaldo de src/data para que la web nunca quede vacía.
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { PRODUCTOS } from '../data/products';
import type { Producto } from '../data/products';
import { SERVICIOS } from '../data/services';
import type { Servicio } from '../data/services';
import { api } from './api';

type Catalogo = { productos: Producto[]; servicios: Servicio[]; desdeServidor: boolean };

const CatalogContext = createContext<Catalogo>({ productos: PRODUCTOS, servicios: SERVICIOS, desdeServidor: false });

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalogo, setCatalogo] = useState<Catalogo>({ productos: PRODUCTOS, servicios: SERVICIOS, desdeServidor: false });

  useEffect(() => {
    Promise.all([api<Producto[]>('/productos'), api<Servicio[]>('/servicios')])
      .then(([productos, servicios]) => {
        if (Array.isArray(productos) && Array.isArray(servicios) && servicios.length) {
          setCatalogo({ productos, servicios, desdeServidor: true });
        }
      })
      .catch(() => {
        /* sin servidor: se quedan los datos de respaldo */
      });
  }, []);

  return <CatalogContext.Provider value={catalogo}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
