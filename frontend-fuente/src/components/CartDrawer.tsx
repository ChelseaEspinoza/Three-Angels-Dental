// Carrito lateral: cantidades, totales en Bs./USD y pago (PayPal o WhatsApp).
import { useEffect, useState } from 'react';
import { useCart } from '../lib/cart';
import { track } from '../lib/analytics';
import { api } from '../lib/api';
import { aUsd, bs, usd } from '../lib/format';
import { Link } from '../lib/router';
import PaymentOptions from './PaymentOptions';
import type { ResultadoPago } from './PaymentOptions';

type Paso = 'carrito' | 'datos' | 'listo';

export default function CartDrawer() {
  const { lineas, totalBs, cambiarCantidad, quitar, vaciar, panelAbierto, abrirPanel } = useCart();
  const [paso, setPaso] = useState<Paso>('carrito');
  const [cliente, setCliente] = useState({ nombre: '', telefono: '', direccion: '' });
  const [resultado, setResultado] = useState<ResultadoPago>();
  const [registro, setRegistro] = useState<{ id?: number; error?: string }>({});

  useEffect(() => {
    document.body.style.overflow = panelAbierto ? 'hidden' : '';
    if (!panelAbierto && paso === 'listo') setPaso('carrito');
  }, [panelAbierto, paso]);

  const cerrar = () => abrirPanel(false);
  const datosOk = cliente.nombre.trim().length > 2 && cliente.telefono.trim().length >= 7;

  const mensaje = (ubicacion?: string) =>
    [
      '🛒 *NUEVO PEDIDO – Tienda Three Angels Dental*',
      '',
      ...lineas.map((l) => `• ${l.cantidad} x ${l.producto.nombre} — ${bs(l.producto.precio * l.cantidad)}`),
      '',
      `*TOTAL: ${bs(totalBs)}*`,
      '',
      `👤 Nombre: ${cliente.nombre}`,
      `📞 Teléfono: ${cliente.telefono}`,
      cliente.direccion ? `🏠 Dirección / zona: ${cliente.direccion}` : null,
      ubicacion ? `📍 Mi ubicación: ${ubicacion}` : '📍 Ahora te envío mi ubicación actual por este chat.',
      '',
      'Deseo envío a domicilio en Sucre y *pago contra entrega* (efectivo o QR).',
    ]
      .filter((x) => x !== null)
      .join('\n');

  // Guarda el pedido en la base de datos para que aparezca en el panel de administración.
  const completado = (r: ResultadoPago) => {
    const pedido = {
      cliente: cliente.nombre,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      ubicacion: r.metodo === 'whatsapp' ? r.ubicacion : undefined,
      items: lineas.map((l) => ({ id: l.producto.id, cantidad: l.cantidad })),
      metodo: r.metodo,
      paypalId: r.metodo === 'paypal' ? r.idTransaccion : undefined,
    };
    setRegistro({});
    api<{ id: number }>('/pedidos', { body: pedido })
      .then(({ id }) => setRegistro({ id }))
      .catch((e: Error) => setRegistro({ error: e.message }));
    setResultado(r);
    setPaso('listo');
    vaciar();
  };

  return (
    <>
      <div className={`overlay ${panelAbierto ? 'visible' : ''}`} onClick={cerrar} />
      <aside className={`drawer ${panelAbierto ? 'abierto' : ''}`} aria-label="Carrito de compras" aria-hidden={!panelAbierto}>
        <div className="drawer-head">
          <h2>{paso === 'datos' ? 'Finalizar compra' : 'Tu carrito'}</h2>
          <button className="icon-btn" onClick={cerrar} aria-label="Cerrar carrito">✕</button>
        </div>

        {paso === 'listo' && resultado ? (
          <div className="drawer-body center">
            <div className="check">✓</div>
            {resultado.metodo === 'paypal' ? (
              <>
                <h3>¡Pago recibido!</h3>
                <p>Gracias, {resultado.pagador}. Tu pago de US$ {resultado.montoUsd} fue aprobado.</p>
                <p className="comprobante">
                  N.º de transacción PayPal:<br />
                  <strong>{resultado.idTransaccion}</strong>
                </p>
                <p className="muted">Te contactaremos por WhatsApp para coordinar la entrega.</p>
              </>
            ) : (
              <>
                <h3>¡Pedido enviado!</h3>
                <p>Termina de enviar el mensaje en WhatsApp y compártenos tu ubicación. Pagas al recibir.</p>
              </>
            )}
            {registro.id && <p className="muted">Pedido registrado con el N.º <strong>{registro.id}</strong>.</p>}
            {registro.error && <p className="aviso">No pudimos registrar el pedido en el sistema ({registro.error}). Igual te atenderemos por WhatsApp.</p>}
            <button className="btn btn-primary" onClick={cerrar}>Seguir comprando</button>
          </div>
        ) : lineas.length === 0 ? (
          <div className="drawer-body center">
            <div className="vacio">🛒</div>
            <p>Tu carrito está vacío.</p>
            <Link to="/tienda" className="btn btn-primary" onClick={cerrar}>Ir a la tienda</Link>
          </div>
        ) : paso === 'carrito' ? (
          <>
            <ul className="drawer-body lineas">
              {lineas.map(({ producto: p, cantidad }) => (
                <li key={p.id} className="linea">
                  <span className="linea-icono" aria-hidden>{p.icono}</span>
                  <div className="linea-info">
                    <strong>{p.nombre}</strong>
                    <small>{bs(p.precio)} c/u</small>
                    <div className="qty">
                      <button onClick={() => cambiarCantidad(p.id, cantidad - 1)} aria-label={`Quitar uno de ${p.nombre}`}>−</button>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={cantidad}
                        onChange={(e) => cambiarCantidad(p.id, Number(e.target.value) || 1)}
                        aria-label={`Cantidad de ${p.nombre}`}
                      />
                      <button onClick={() => cambiarCantidad(p.id, cantidad + 1)} aria-label={`Agregar uno de ${p.nombre}`}>+</button>
                    </div>
                  </div>
                  <div className="linea-total">
                    <strong>{bs(p.precio * cantidad)}</strong>
                    <button className="link-btn" onClick={() => quitar(p.id)}>Quitar</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <div className="fila"><span>Subtotal</span><span>{bs(totalBs)}</span></div>
              <div className="fila"><span>Envío en Sucre</span><span>A coordinar</span></div>
              <div className="fila total"><span>Total</span><span>{bs(totalBs)}</span></div>
              <div className="fila muted"><span>Equivalente PayPal</span><span>{usd(totalBs)}</span></div>
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  setPaso('datos');
                  track('begin_checkout', { value: aUsd(totalBs), currency: 'USD' });
                }}
              >
                Finalizar compra →
              </button>
            </div>
          </>
        ) : (
          <div className="drawer-body">
            <button className="link-btn" onClick={() => setPaso('carrito')}>← Volver al carrito</button>
            <form className="form" onSubmit={(e) => e.preventDefault()}>
              <label>
                Nombre completo *
                <input value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} autoComplete="name" required />
              </label>
              <label>
                Teléfono / WhatsApp *
                <input type="tel" value={cliente.telefono} onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })} autoComplete="tel" required />
              </label>
              <label>
                Dirección o zona en Sucre
                <input value={cliente.direccion} onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })} placeholder="Ej. Zona Central, calle…" autoComplete="street-address" />
              </label>
            </form>
            {datosOk ? (
              <PaymentOptions
                tipo="tienda"
                montoBs={totalBs}
                descripcionPaypal={`Tienda Three Angels Dental – ${lineas.length} producto(s) – ${cliente.nombre}`}
                mensajeWhatsApp={mensaje}
                textoBotonWhatsApp="💬 Pedir por WhatsApp y pagar al recibir"
                notaWhatsApp="Se abrirá WhatsApp con el resumen de tu pedido. Envíanos tu ubicación actual para el delivery en Sucre y paga en efectivo o QR al recibir."
                onCompletado={completado}
              />
            ) : (
              <p className="aviso">Completa tu nombre y teléfono para elegir el método de pago.</p>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
