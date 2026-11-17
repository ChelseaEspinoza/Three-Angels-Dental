// ESTADÍSTICAS: pacientes atendidos, asistencia, ventas, especialidades y productos.
// Los datos los calcula el backend (backend/estadisticas.js).
import { useState } from 'react';
import { bs } from '../lib/format';
import { COLOR_1, COLOR_2, GraficaTiempo, Ranking, Reparto } from './Graficas';
import type { Punto } from './Graficas';
import { Estado, useDatos } from './ui';

type Grupo = { etiqueta: string; atendidos: number; citas: number; ventasBs: number; pedidos: number };
type Stats = {
  periodo: { dias: number; desde: string; hasta: string; agrupado: 'dia' | 'semana' | 'mes' };
  totales: {
    pacientesAtendidos: number; pacientesNuevos: number; citas: number; canceladas: number; noAsistieron: number;
    tasaAsistencia: number | null; ventasBs: number; pedidos: number; ticketPromedioBs: number; ingresosCitasOnlineBs: number;
  };
  serie: Grupo[];
  topServicios: { nombre: string; citas: number }[];
  topProductos: { nombre: string; unidades: number; bs: number }[];
  porDiaSemana: { dia: string; citas: number }[];
  porHora: { hora: string; citas: number }[];
  metodos: { paypal: number; whatsapp: number };
};

const PERIODOS = [
  { dias: 7, label: '7 días' },
  { dias: 30, label: '30 días' },
  { dias: 90, label: '3 meses' },
  { dias: 365, label: '1 año' },
];
const UNIDAD = { dia: 'por día', semana: 'por semana', mes: 'por mes' };
const entero = (n: number) => Math.round(n).toLocaleString('es-BO');
const bsCorto = (n: number) => (n >= 1000 ? `${(n / 1000).toLocaleString('es-BO', { maximumFractionDigits: 1 })} mil` : entero(n));

export default function Estadisticas() {
  const [dias, setDias] = useState(30);
  const { datos, error } = useDatos<Stats>(`/estadisticas?dias=${dias}`);
  const s = datos?.periodo.dias === dias ? datos : undefined;

  const serie = (campo: 'atendidos' | 'ventasBs'): Punto[] =>
    (s?.serie || []).map((g) => ({
      etiqueta: g.etiqueta,
      detalle: s!.periodo.agrupado === 'semana' ? `Semana del ${g.etiqueta}` : g.etiqueta,
      valor: g[campo],
    }));

  return (
    <>
      <div className="adm-toolbar">
        <div className="adm-chips sin-cap" role="group" aria-label="Periodo">
          {PERIODOS.map((p) => (
            <button key={p.dias} className={dias === p.dias ? 'activo' : ''} onClick={() => setDias(p.dias)}>Últimos {p.label}</button>
          ))}
        </div>
      </div>
      <Estado cargando={!s} error={error}>
        {s && (
          <>
            <div className="adm-kpis">
              <div className="adm-card adm-kpi">
                <span>Pacientes atendidos</span>
                <strong>{s.totales.pacientesAtendidos}</strong>
                <small>{s.totales.pacientesNuevos} de primera vez</small>
              </div>
              <div className="adm-card adm-kpi">
                <span>Asistencia a las citas</span>
                <strong>{s.totales.tasaAsistencia == null ? '—' : `${s.totales.tasaAsistencia} %`}</strong>
                <small>{s.totales.noAsistieron} no asistieron · {s.totales.canceladas} canceladas</small>
              </div>
              <div className="adm-card adm-kpi">
                <span>Ventas de la tienda</span>
                <strong>{bs(s.totales.ventasBs)}</strong>
                <small>{s.totales.pedidos} pedidos · promedio {bs(s.totales.ticketPromedioBs)}</small>
              </div>
              <div className="adm-card adm-kpi">
                <span>Citas pagadas en línea</span>
                <strong>{bs(s.totales.ingresosCitasOnlineBs)}</strong>
                <small>{s.totales.citas} citas en el periodo</small>
              </div>
            </div>

            <div className="adm-grid2">
              <section className="adm-card">
                <h2>Pacientes atendidos {UNIDAD[s.periodo.agrupado]}</h2>
                <GraficaTiempo datos={serie('atendidos')} tipo="columnas" color={COLOR_1} formato={entero} nombre="Pacientes atendidos" />
              </section>
              <section className="adm-card">
                <h2>Ventas de la tienda {UNIDAD[s.periodo.agrupado]} (Bs.)</h2>
                <GraficaTiempo datos={serie('ventasBs')} tipo="linea" color={COLOR_2} formato={bsCorto} nombre="Ventas en Bs." />
              </section>
              <section className="adm-card">
                <h2>Citas por día de la semana</h2>
                <GraficaTiempo
                  datos={s.porDiaSemana.map((d) => ({ etiqueta: d.dia, detalle: d.dia, valor: d.citas }))}
                  tipo="columnas" color={COLOR_1} formato={entero} nombre="Citas"
                />
              </section>
              <section className="adm-card">
                <h2>Horas más pedidas</h2>
                {s.porHora.length ? (
                  <GraficaTiempo
                    datos={s.porHora.map((h) => ({ etiqueta: h.hora, detalle: `${h.hora} a ${h.hora.slice(0, 2)}:59`, valor: h.citas }))}
                    tipo="columnas" color={COLOR_1} formato={entero} nombre="Citas"
                  />
                ) : (
                  <p className="adm-muted">Sin citas en este periodo.</p>
                )}
              </section>
              <section className="adm-card">
                <h2>Especialidades más solicitadas</h2>
                <Ranking filas={s.topServicios.map((x) => ({ nombre: x.nombre, valor: x.citas }))} color={COLOR_1} formato={(n) => `${entero(n)} citas`} vacio="Sin citas en este periodo." />
              </section>
              <section className="adm-card">
                <h2>Productos más vendidos</h2>
                <Ranking filas={s.topProductos.map((p) => ({ nombre: p.nombre, valor: p.unidades, extra: bs(p.bs) }))} color={COLOR_2} formato={(n) => `${entero(n)} u.`} vacio="Sin ventas en este periodo." />
              </section>
              <section className="adm-card">
                <h2>Cómo pagan los clientes de la tienda</h2>
                <Reparto partes={[
                  { nombre: 'Contra entrega (WhatsApp)', valor: s.metodos.whatsapp, color: COLOR_1 },
                  { nombre: 'PayPal', valor: s.metodos.paypal, color: COLOR_2 },
                ]} />
              </section>
            </div>
            <p className="adm-muted gr-nota">
              Del {s.periodo.desde.split('-').reverse().join('/')} al {s.periodo.hasta.split('-').reverse().join('/')}.
              “Atendidos” son las citas marcadas como <em>atendida</em> en la sección Citas; las ventas no incluyen pedidos cancelados.
            </p>
          </>
        )}
      </Estado>
    </>
  );
}
