// Página TIENDA ("/tienda"): catálogo de higiene bucal con buscador en vivo y carrito.
import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { CATEGORIAS } from '../data/products';
import type { Categoria, Producto } from '../data/products';
import { track } from '../lib/analytics';
import { useCart } from '../lib/cart';
import { useCatalog } from '../lib/catalog';
import { bs, normalizar, usd } from '../lib/format';
import { useSeo } from '../lib/seo';

type Orden = 'relevancia' | 'menor' | 'mayor';

export default function Shop() {
  useSeo(
    'Tienda de higiene bucal',
    'Compra productos de higiene bucal en Sucre: cepillos dentales eléctricos y de bambú, pastas blanqueadoras, enjuagues, hilo dental y kits de ortodoncia. Delivery y pago contra entrega.',
  );
  const { agregar, lineas, cantidadTotal, totalBs, abrirPanel } = useCart();
  const { productos } = useCatalog();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<Categoria | 'Todas'>('Todas');
  const [orden, setOrden] = useState<Orden>('relevancia');
  const [recien, setRecien] = useState<string | null>(null);

  // Filtrado en tiempo real: se recalcula en cada tecla.
  const resultados = useMemo(() => {
    const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean);
    const lista = productos.filter((p) => {
      if (categoria !== 'Todas' && p.categoria !== categoria) return false;
      const texto = normalizar(`${p.nombre} ${p.descripcion} ${p.categoria}`);
      return terminos.every((t) => texto.includes(t));
    });
    if (orden === 'menor') return [...lista].sort((a, b) => a.precio - b.precio);
    if (orden === 'mayor') return [...lista].sort((a, b) => b.precio - a.precio);
    return [...lista].sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado));
  }, [busqueda, categoria, orden, productos]);

  const enCarrito = (id: string) => lineas.find((l) => l.producto.id === id)?.cantidad || 0;

  const onAgregar = (p: Producto) => {
    agregar(p);
    setRecien(p.id);
    window.setTimeout(() => setRecien((r) => (r === p.id ? null : r)), 1200);
  };

  return (
    <>
      <PageHeader
        eyebrow="Tienda"
        titulo="Tienda de higiene bucal"
        texto="Productos recomendados por nuestros especialistas, con delivery en Sucre."
      />

      <section className="section container">
        {/* BUSCADOR */}
        <div className="buscador card">
          <label htmlFor="buscar" className="sr-only">Buscar productos</label>
          <span aria-hidden>🔍</span>
          <input
            id="buscar"
            type="search"
            placeholder="Busca cepillos, pastas, enjuagues, kits…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onBlur={() => busqueda && track('search', { search_term: busqueda })}
            autoComplete="off"
          />
          {busqueda && <button className="icon-btn" onClick={() => setBusqueda('')} aria-label="Borrar búsqueda">✕</button>}
        </div>

        <div className="tienda-filtros">
          <div className="chips" role="group" aria-label="Filtrar por categoría">
            {(['Todas', ...CATEGORIAS] as const).map((c) => (
              <button key={c} className={`chip ${categoria === c ? 'activo' : ''}`} onClick={() => setCategoria(c)} aria-pressed={categoria === c}>
                {c}
              </button>
            ))}
          </div>
          <label className="orden">
            Ordenar:
            <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
              <option value="relevancia">Destacados</option>
              <option value="menor">Menor precio</option>
              <option value="mayor">Mayor precio</option>
            </select>
          </label>
        </div>

        <p className="muted resultados" aria-live="polite">
          {resultados.length} {resultados.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          {busqueda && <> para “{busqueda}”</>}
        </p>

        {resultados.length === 0 ? (
          <div className="card vacio-box">
            <p>😕 No encontramos productos con esa búsqueda.</p>
            <button className="btn btn-ghost" onClick={() => { setBusqueda(''); setCategoria('Todas'); }}>Ver todo el catálogo</button>
          </div>
        ) : (
          <div className="grid-4 productos">
            {resultados.map((p) => (
              <article key={p.id} className="card producto">
                <div className="producto-img" data-cat={p.categoria}>
                  {p.imagen ? (
                    <img src={p.imagen} alt={`${p.nombre} – ${p.categoria}`} loading="lazy" />
                  ) : (
                    <span role="img" aria-label={`Imagen referencial de ${p.nombre}`}>{p.icono}</span>
                  )}
                  {p.destacado && <span className="tag">Recomendado</span>}
                </div>
                <div className="producto-body">
                  <small className="categoria">{p.categoria}</small>
                  <h2>{p.nombre}</h2>
                  <p>{p.descripcion}</p>
                  <div className="producto-foot">
                    <div>
                      <strong className="precio">{bs(p.precio)}</strong>
                      <small className="muted">{usd(p.precio)}</small>
                    </div>
                    {p.stock === 0 || (p.stock != null && enCarrito(p.id) >= p.stock) ? (
                      <button className="btn btn-ghost btn-sm" disabled>{p.stock === 0 ? 'Agotado' : 'Sin más stock'}</button>
                    ) : (
                      <button className={`btn btn-primary btn-sm ${recien === p.id ? 'ok' : ''}`} onClick={() => onAgregar(p)} aria-label={`Agregar ${p.nombre} al carrito`}>
                        {recien === p.id ? '✓ Agregado' : enCarrito(p.id) ? `+ Agregar (${enCarrito(p.id)})` : '+ Agregar'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* BARRA FIJA DEL CARRITO */}
      {cantidadTotal > 0 && (
        <button className="cart-bar" onClick={() => abrirPanel(true)}>
          🛒 {cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'} · <strong>{bs(totalBs)}</strong>
          <span>Ver carrito y pagar →</span>
        </button>
      )}
    </>
  );
}
