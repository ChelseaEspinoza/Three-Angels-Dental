// Página de SERVICIOS ("/servicios"): catálogo interactivo con precios en Bs.
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import type { Servicio } from '../data/services';
import { useCatalog } from '../lib/catalog';
import { bs, usd } from '../lib/format';
import { Link } from '../lib/router';
import { useSeo } from '../lib/seo';

const FILTROS = ['Todos', 'Prevención', 'Especialidades', 'Estética', 'Niños'] as const;

export default function Services() {
  useSeo(
    'Servicios y precios',
    'Tratamientos odontológicos en Sucre con precios en Bolivianos: limpieza dental, ortodoncia, odontopediatría, cirugía de cordales, prótesis, endodoncia y blanqueamiento.',
  );
  const { servicios: SERVICIOS } = useCatalog();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>('Todos');
  const [abierto, setAbierto] = useState<string | null>(null);
  const lista = filtro === 'Todos' ? SERVICIOS : SERVICIOS.filter((s) => s.categoria === filtro);

  return (
    <>
      <PageHeader
        eyebrow="Servicios"
        titulo="Tratamientos odontológicos en Sucre"
        texto="Precios transparentes en Bolivianos. Reserva online y paga con PayPal o en consultorio."
      />
      <section className="section container">
        <div className="chips" role="group" aria-label="Filtrar por categoría">
          {FILTROS.map((f) => (
            <button key={f} className={`chip ${filtro === f ? 'activo' : ''}`} onClick={() => setFiltro(f)} aria-pressed={filtro === f}>
              {f}
            </button>
          ))}
        </div>

        <div className="grid-3">
          {lista.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 80}>
              <TarjetaServicio servicio={s} abierto={abierto === s.id} alternar={() => setAbierto(abierto === s.id ? null : s.id)} />
            </Reveal>
          ))}
        </div>

        <p className="nota">* Los tratamientos marcados “desde” pueden variar según la evaluación clínica.</p>
      </section>
    </>
  );
}

function TarjetaServicio({ servicio: s, abierto, alternar }: { servicio: Servicio; abierto: boolean; alternar: () => void }) {
  return (
    <article className={`card servicio ${abierto ? 'abierto' : ''}`}>
      <div className="servicio-img">
        <img src={s.imagen} alt={s.alt} loading="lazy" />
        <span className="chip chip-light">{s.categoria}</span>
      </div>
      <div className="servicio-body">
        <h2>{s.nombre}</h2>
        <p>{s.resumen}</p>
        <div className="servicio-meta">
          <span className="precio">
            {s.desde && <small>Desde </small>}
            {bs(s.precio)}
          </span>
          <span className="muted">⏱ {s.duracion}</span>
        </div>
        <small className="muted">{usd(s.precio)}</small>
        <button className="link-btn" onClick={alternar} aria-expanded={abierto}>
          {abierto ? 'Ocultar detalles ▲' : 'Ver qué incluye ▼'}
        </button>
        {abierto && (
          <ul className="checklist small">
            {s.incluye.map((x) => <li key={x}>{x}</li>)}
          </ul>
        )}
        <Link to={`/citas?servicio=${s.id}`} className="btn btn-primary btn-block">📅 Reservar cita</Link>
      </div>
    </article>
  );
}
