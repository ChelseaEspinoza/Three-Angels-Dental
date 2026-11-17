// Gráficas del panel, dibujadas en SVG/HTML sin librerías externas.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export const COLOR_1 = '#7c3aed'; // morado de la marca
export const COLOR_2 = '#0891b2'; // turquesa de la marca

export type Punto = { etiqueta: string; detalle: string; valor: number };

/** Ancho real del contenedor (para dibujar a tamaño exacto). */
function useAncho<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [ancho, setAncho] = useState(600);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setAncho(Math.max(240, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, ancho };
}

/** Máximo "redondo" del eje y 4 marcas. */
function escala(max: number, enteros: boolean) {
  if (max <= 0) return { tope: 4, marcas: [0, 1, 2, 3, 4] };
  const paso0 = max / 4;
  const mag = 10 ** Math.floor(Math.log10(paso0));
  const multiplos = enteros ? [1, 2, 5, 10] : [1, 2, 2.5, 5, 10];
  const paso = multiplos.map((m) => m * mag).find((p) => p >= paso0)!;
  const pasoFinal = enteros ? Math.max(1, Math.round(paso)) : paso;
  return { tope: pasoFinal * 4, marcas: [0, 1, 2, 3, 4].map((i) => i * pasoFinal) };
}

/**
 * Serie en el tiempo: columnas (conteos) o línea con área (montos).
 * Incluye cuadrícula tenue, etiquetas del eje reducidas y tooltip al pasar el mouse.
 */
export function GraficaTiempo({ datos, tipo, color, formato, nombre }: {
  datos: Punto[]; tipo: 'columnas' | 'linea'; color: string; formato: (n: number) => string; nombre: string;
}) {
  const { ref, ancho } = useAncho<HTMLDivElement>();
  const [activo, setActivo] = useState<number | null>(null);
  const H = 230, izq = 44, der = 12, arr = 12, abj = 28;
  const w = ancho - izq - der, h = H - arr - abj;
  const { tope, marcas } = escala(Math.max(...datos.map((d) => d.valor), 0), tipo === 'columnas');
  const paso = w / Math.max(datos.length, 1);
  const x = (i: number) => izq + paso * i + paso / 2;
  const y = (v: number) => arr + h - (v / tope) * h;
  const cadaN = Math.ceil(datos.length / Math.max(2, Math.floor(w / 70)));
  const anchoBarra = Math.max(2, Math.min(36, paso - 2));

  useEffect(() => setActivo(null), [datos]);

  const linea = datos.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.valor).toFixed(1)}`).join('');
  const area = `${linea}L${x(datos.length - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;

  return (
    <div ref={ref} className="gr-wrap">
      <svg width={ancho} height={H} role="img" aria-label={`${nombre}: gráfica de ${datos.length} periodos`}>
        {marcas.map((m) => (
          <g key={m}>
            <line x1={izq} x2={ancho - der} y1={y(m)} y2={y(m)} stroke="#ece7f6" strokeWidth={m === 0 ? 1.5 : 1} />
            <text x={izq - 8} y={y(m) + 4} textAnchor="end" className="gr-eje">{formato(m)}</text>
          </g>
        ))}
        {datos.map((d, i) => i % cadaN === 0 && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="gr-eje">{d.etiqueta}</text>
        ))}
        {tipo === 'columnas' ? (
          datos.map((d, i) => {
            const alto = Math.max(0, y(0) - y(d.valor));
            const r = Math.min(4, anchoBarra / 2, alto);
            const x0 = x(i) - anchoBarra / 2, y0 = y(d.valor);
            return alto > 0 ? (
              <path key={i} opacity={activo == null || activo === i ? 1 : 0.45}
                d={`M${x0},${y(0)}V${y0 + r}Q${x0},${y0} ${x0 + r},${y0}H${x0 + anchoBarra - r}Q${x0 + anchoBarra},${y0} ${x0 + anchoBarra},${y0 + r}V${y(0)}Z`}
                fill={color} />
            ) : null;
          })
        ) : (
          <>
            <path d={area} fill={color} opacity={0.12} />
            <path d={linea} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
            {activo != null && (
              <>
                <line x1={x(activo)} x2={x(activo)} y1={arr} y2={y(0)} stroke="#94a3b8" strokeDasharray="3 3" />
                <circle cx={x(activo)} cy={y(datos[activo].valor)} r={5} fill={color} stroke="#fff" strokeWidth={2} />
              </>
            )}
          </>
        )}
        {/* Zonas invisibles para el mouse/dedo, más anchas que la marca */}
        {datos.map((d, i) => (
          <rect key={i} x={izq + paso * i} y={arr} width={paso} height={h} fill="transparent"
            onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)} onTouchStart={() => setActivo(i)}>
            <title>{`${d.detalle}: ${formato(d.valor)}`}</title>
          </rect>
        ))}
      </svg>
      {activo != null && (
        <div className="gr-tip" style={{ left: Math.min(Math.max(x(activo), 70), ancho - 70), top: Math.max(y(datos[activo].valor) - 12, 0) }}>
          <span>{datos[activo].detalle}</span>
          <strong><i style={{ background: color }} />{formato(datos[activo].valor)}</strong>
        </div>
      )}
      <details className="gr-tabla">
        <summary>Ver datos en tabla</summary>
        <table>
          <thead><tr><th>Periodo</th><th className="num">{nombre}</th></tr></thead>
          <tbody>{datos.map((d) => <tr key={d.detalle}><td>{d.detalle}</td><td className="num">{formato(d.valor)}</td></tr>)}</tbody>
        </table>
      </details>
    </div>
  );
}

/** Barras horizontales ordenadas (ranking). */
export function Ranking({ filas, color, formato, vacio }: { filas: { nombre: string; valor: number; extra?: string }[]; color: string; formato: (n: number) => string; vacio: string }) {
  if (!filas.length) return <p className="adm-muted">{vacio}</p>;
  const max = Math.max(...filas.map((f) => f.valor));
  return (
    <ul className="gr-rank">
      {filas.map((f) => (
        <li key={f.nombre}>
          <div className="gr-rank-top"><span>{f.nombre}</span><strong>{formato(f.valor)}{f.extra && <small> · {f.extra}</small>}</strong></div>
          <div className="gr-rank-track"><div style={{ width: `${(f.valor / max) * 100}%`, background: color }} /></div>
        </li>
      ))}
    </ul>
  );
}

/** Reparto en dos partes (barra 100 %) con leyenda y etiquetas directas. */
export function Reparto({ partes }: { partes: { nombre: string; valor: number; color: string }[] }) {
  const total = partes.reduce((s, p) => s + p.valor, 0);
  if (!total) return <p className="adm-muted">Sin pedidos en este periodo.</p>;
  return (
    <div>
      <div className="gr-split">
        {partes.filter((p) => p.valor).map((p) => (
          <div key={p.nombre} style={{ flexGrow: p.valor, background: p.color }} title={`${p.nombre}: ${p.valor}`} />
        ))}
      </div>
      <ul className="gr-leyenda">
        {partes.map((p) => (
          <li key={p.nombre}><i style={{ background: p.color }} />{p.nombre} <strong>{Math.round((p.valor / total) * 100)} %</strong> <span>({p.valor})</span></li>
        ))}
      </ul>
    </div>
  );
}
