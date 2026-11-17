// Página RESERVAR CITA ("/citas"): formulario por pasos + pago (PayPal o en consultorio).
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import PageHeader from '../components/PageHeader';
import PaymentOptions from '../components/PaymentOptions';
import type { ResultadoPago } from '../components/PaymentOptions';
import { ANTICIPO_CITA_PORCENTAJE, CLINICA, DURACION_CITA_MIN, HORARIOS } from '../config';
import { track } from '../lib/analytics';
import { api } from '../lib/api';
import { useCatalog } from '../lib/catalog';
import { bs } from '../lib/format';
import { Link, useRouter } from '../lib/router';
import { useSeo } from '../lib/seo';

const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const aMinutos = (h: string) => {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
};
const aHora = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/** Horas disponibles para una fecha según los HORARIOS de config.ts. */
function horasDisponibles(fechaISO: string, ocupadas: string[] = []): string[] {
  if (!fechaISO) return [];
  const [y, m, d] = fechaISO.split('-').map(Number);
  const dia = new Date(y, m - 1, d).getDay();
  const horario = HORARIOS.find((h) => h.dias.includes(dia));
  if (!horario) return [];
  const ahora = new Date();
  const esHoy = fechaISO === hoyISO();
  const minimo = ahora.getHours() * 60 + ahora.getMinutes() + 60; // al menos 1 h de anticipación
  const horas: string[] = [];
  for (const [ini, fin] of horario.bloques) {
    for (let t = aMinutos(ini); t + DURACION_CITA_MIN <= aMinutos(fin); t += DURACION_CITA_MIN) {
      if ((!esHoy || t >= minimo) && !ocupadas.includes(aHora(t))) horas.push(aHora(t));
    }
  }
  return horas;
}

const fechaLarga = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

type Paso = 1 | 2 | 3;

export default function Appointments() {
  useSeo(
    'Reservar cita',
    'Agenda tu cita odontológica en Sucre en línea: elige especialidad, fecha y hora. Paga con PayPal o en consultorio.',
  );
  const { search } = useRouter();
  const { servicios: SERVICIOS } = useCatalog();
  const inicial = new URLSearchParams(search).get('servicio');
  const [paso, setPaso] = useState<Paso>(1);
  const [form, setForm] = useState({
    servicio: SERVICIOS.some((s) => s.id === inicial) ? inicial! : SERVICIOS[0].id,
    fecha: '',
    hora: '',
    nombre: '',
    telefono: '',
    email: '',
    primeraVez: true,
    notas: '',
  });
  const [resultado, setResultado] = useState<ResultadoPago>();
  const [ocupadas, setOcupadas] = useState<string[]>([]);
  const [registro, setRegistro] = useState<{ id?: number; error?: string }>({});

  // Horas ya reservadas por otros pacientes en la fecha elegida.
  useEffect(() => {
    setOcupadas([]);
    if (!form.fecha) return;
    api<string[]>(`/citas/ocupadas?fecha=${form.fecha}`).then(setOcupadas).catch(() => {});
  }, [form.fecha]);

  // Si el catálogo llega del servidor y el servicio elegido no existe, se usa el primero.
  useEffect(() => {
    if (!SERVICIOS.some((s) => s.id === form.servicio)) setForm((f) => ({ ...f, servicio: SERVICIOS[0].id }));
  }, [SERVICIOS, form.servicio]);

  const servicio = SERVICIOS.find((s) => s.id === form.servicio) ?? SERVICIOS[0];
  const horas = useMemo(() => horasDisponibles(form.fecha, ocupadas), [form.fecha, ocupadas]);
  const monto = Math.round((servicio.precio * ANTICIPO_CITA_PORCENTAJE) / 100);
  const maxFecha = new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const continuar = (e: FormEvent) => {
    e.preventDefault();
    if (!form.hora) return;
    setPaso(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    track('begin_checkout', { tipo: 'cita', servicio: servicio.nombre });
  };

  const mensaje = () =>
    [
      '📅 *SOLICITUD DE CITA – Three Angels Dental*',
      '',
      `🦷 Especialidad: ${servicio.nombre}`,
      `🗓️ Fecha: ${fechaLarga(form.fecha)}`,
      `⏰ Hora: ${form.hora}`,
      '',
      `👤 Paciente: ${form.nombre}`,
      `📞 Teléfono: ${form.telefono}`,
      form.email ? `✉️ Correo: ${form.email}` : null,
      `Primera visita: ${form.primeraVez ? 'Sí' : 'No'}`,
      form.notas ? `📝 Notas: ${form.notas}` : null,
      '',
      `💰 Precio referencial: ${servicio.desde ? 'desde ' : ''}${bs(servicio.precio)}`,
      'Pagaré en el consultorio (efectivo o QR). Quedo atento(a) a la confirmación. ¡Gracias!',
    ]
      .filter((x) => x !== null)
      .join('\n');

  const completado = (r: ResultadoPago) => {
    // Guarda la cita en la base de datos (aparece en el panel de administración).
    setRegistro({});
    api<{ id: number }>('/citas', {
      body: {
        servicioId: servicio.id, fecha: form.fecha, hora: form.hora, paciente: form.nombre, telefono: form.telefono,
        email: form.email, primeraVez: form.primeraVez, notas: form.notas, metodo: r.metodo,
        paypalId: r.metodo === 'paypal' ? r.idTransaccion : undefined, montoBs: monto,
      },
    })
      .then(({ id }) => setRegistro({ id }))
      .catch((e: Error) => setRegistro({ error: e.message }));
    setResultado(r);
    setPaso(3);
    track('generate_lead', { tipo: 'cita', servicio: servicio.nombre, metodo: r.metodo });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHeader eyebrow="Reservar cita" titulo="Agenda tu cita en minutos" texto="Elige especialidad, fecha y hora. Confirmamos tu cita por WhatsApp." />

      <section className="section container citas">
        <ol className="pasos" aria-label="Pasos de la reserva">
          {['Tus datos', 'Pago', 'Confirmación'].map((t, i) => (
            <li key={t} className={paso === i + 1 ? 'actual' : paso > i + 1 ? 'hecho' : ''}>
              <span>{paso > i + 1 ? '✓' : i + 1}</span> {t}
            </li>
          ))}
        </ol>

        {paso === 1 && (
          <form className="card form citas-form" onSubmit={continuar}>
            <fieldset>
              <legend>1. Especialidad</legend>
              <div className="servicios-radio">
                {SERVICIOS.map((s) => (
                  <label key={s.id} className={`radio-card ${form.servicio === s.id ? 'activo' : ''}`}>
                    <input type="radio" name="servicio" value={s.id} checked={form.servicio === s.id} onChange={() => set('servicio', s.id)} />
                    <strong>{s.nombre}</strong>
                    <small>{s.desde ? 'Desde ' : ''}{bs(s.precio)}</small>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>2. Fecha y hora</legend>
              <label>
                Fecha *
                <input
                  type="date"
                  min={hoyISO()}
                  max={maxFecha}
                  value={form.fecha}
                  onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value, hora: '' }))}
                  required
                />
              </label>
              {form.fecha && (
                horas.length ? (
                  <div className="horas" role="group" aria-label="Horas disponibles">
                    {horas.map((h) => (
                      <button type="button" key={h} className={`hora ${form.hora === h ? 'activo' : ''}`} onClick={() => set('hora', h)} aria-pressed={form.hora === h}>
                        {h}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="aviso">No atendemos ese día o ya no quedan horarios. Elige otra fecha.</p>
                )
              )}
            </fieldset>

            <fieldset>
              <legend>3. Datos del paciente</legend>
              <div className="form-grid">
                <label>
                  Nombre completo *
                  <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} autoComplete="name" required minLength={3} />
                </label>
                <label>
                  Teléfono / WhatsApp *
                  <input type="tel" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} autoComplete="tel" required pattern="[0-9+ ]{7,}" title="Ingresa un número válido" />
                </label>
                <label>
                  Correo (opcional)
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
                </label>
                <label className="check-label">
                  <input type="checkbox" checked={form.primeraVez} onChange={(e) => set('primeraVez', e.target.checked)} />
                  Es mi primera visita
                </label>
              </div>
              <label>
                Motivo o comentarios
                <textarea rows={3} value={form.notas} onChange={(e) => set('notas', e.target.value)} placeholder="Ej. dolor en una muela, consulta para mi hijo de 6 años…" />
              </label>
            </fieldset>

            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={!form.hora}>
              {form.hora ? 'Continuar al pago →' : 'Elige fecha y hora para continuar'}
            </button>
          </form>
        )}

        {paso === 2 && (
          <div className="citas-pago">
            <div className="card resumen">
              <h2>Resumen de tu cita</h2>
              <dl>
                <dt>Especialidad</dt><dd>{servicio.nombre}</dd>
                <dt>Fecha</dt><dd className="capitalize">{fechaLarga(form.fecha)}</dd>
                <dt>Hora</dt><dd>{form.hora}</dd>
                <dt>Paciente</dt><dd>{form.nombre}</dd>
                <dt>Teléfono</dt><dd>{form.telefono}</dd>
                <dt>Precio</dt><dd>{servicio.desde ? 'Desde ' : ''}{bs(servicio.precio)}</dd>
              </dl>
              {ANTICIPO_CITA_PORCENTAJE < 100 && (
                <p className="muted">Online se cobra un anticipo del {ANTICIPO_CITA_PORCENTAJE}% para asegurar tu horario.</p>
              )}
              <button className="link-btn" onClick={() => setPaso(1)}>← Modificar datos</button>
            </div>
            <div className="card">
              <PaymentOptions
                tipo="cita"
                montoBs={monto}
                descripcionPaypal={`Cita ${servicio.nombre} – ${form.fecha} ${form.hora} – ${form.nombre}`}
                mensajeWhatsApp={mensaje}
                textoBotonWhatsApp="💬 Confirmar por WhatsApp y pagar en consultorio"
                notaWhatsApp="Se abrirá WhatsApp con los datos de tu cita. Pagas el día de tu atención en efectivo o QR."
                onCompletado={completado}
              />
            </div>
          </div>
        )}

        {paso === 3 && resultado && (
          <div className="card confirmacion">
            <div className="check">✓</div>
            <h2>{resultado.metodo === 'paypal' ? '¡Cita pagada y reservada!' : '¡Solicitud enviada!'}</h2>
            <p>
              {servicio.nombre} · <span className="capitalize">{fechaLarga(form.fecha)}</span> · {form.hora}
            </p>
            {resultado.metodo === 'paypal' ? (
              <p className="comprobante">
                Comprobante PayPal: <strong>{resultado.idTransaccion}</strong>
                <br />Pagador: {resultado.pagador} · Monto: US$ {resultado.montoUsd}
              </p>
            ) : (
              <p>Termina de enviar el mensaje en WhatsApp. Te confirmaremos el horario por ese medio.</p>
            )}
            {registro.id && <p className="muted">Reserva registrada con el N.º <strong>{registro.id}</strong>.</p>}
            {registro.error && <p className="aviso">{registro.error}</p>}
            <p className="muted">¿Dudas? Escríbenos al {CLINICA.telefonoVisible}.</p>
            <div className="hero-ctas">
              <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Imprimir</button>
              <Link to="/" className="btn btn-primary">Volver al inicio</Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
