import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CartProvider } from './lib/cart';
import { CatalogProvider } from './lib/catalog';
import { SitioProvider } from './lib/sitio';
import { RouterProvider } from './lib/router';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider>
      <CatalogProvider>
        <SitioProvider>
        <CartProvider>
          <App />
        </CartProvider>
        </SitioProvider>
      </CatalogProvider>
    </RouterProvider>
  </StrictMode>,
);
