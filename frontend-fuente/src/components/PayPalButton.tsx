// Botones oficiales de PayPal (Smart Payment Buttons).
// El modo Sandbox o Producción depende del Client ID pegado en src/config.ts.
import { useEffect, useRef, useState } from 'react';
import { PAYPAL_CLIENT_ID, PAYPAL_MONEDA } from '../config';
import { loadScript } from '../lib/loadScript';

export type PagoPayPal = { idTransaccion: string; pagador: string; montoUsd: string };

type PayPalActions = {
  order: {
    create: (orden: unknown) => Promise<string>;
    capture: () => Promise<{
      id: string;
      payer?: { name?: { given_name?: string; surname?: string } };
      purchase_units?: { payments?: { captures?: { id: string }[] } }[];
    }>;
  };
};

type PayPalSdk = {
  Buttons: (opciones: Record<string, unknown>) => { render: (el: HTMLElement) => Promise<void>; close?: () => void };
};

declare global {
  interface Window {
    paypal?: PayPalSdk;
  }
}

export const paypalConfigurado = () => !!PAYPAL_CLIENT_ID && !PAYPAL_CLIENT_ID.startsWith('PEGA_AQUI');

type Props = {
  montoUsd: number;
  descripcion: string;
  onAprobado: (pago: PagoPayPal) => void;
};

export default function PayPalButton({ montoUsd, descripcion, onAprobado }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const callback = useRef(onAprobado);
  callback.current = onAprobado;
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const valor = montoUsd.toFixed(2);

  useEffect(() => {
    if (!paypalConfigurado()) return;
    let cancelado = false;
    let botones: ReturnType<PayPalSdk['Buttons']> | undefined;
    const sdk = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=${PAYPAL_MONEDA}&intent=capture`;

    loadScript(sdk)
      .then(() => {
        if (cancelado || !contenedor.current || !window.paypal) return;
        contenedor.current.innerHTML = '';
        botones = window.paypal.Buttons({
          style: { layout: 'vertical', shape: 'pill', label: 'pay', height: 45 },
          createOrder: (_datos: unknown, actions: PayPalActions) =>
            actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  description: descripcion.slice(0, 120),
                  amount: { currency_code: PAYPAL_MONEDA, value: valor },
                },
              ],
            }),
          onApprove: async (_datos: unknown, actions: PayPalActions) => {
            const detalle = await actions.order.capture();
            const captura = detalle.purchase_units?.[0]?.payments?.captures?.[0]?.id;
            const nombre = [detalle.payer?.name?.given_name, detalle.payer?.name?.surname].filter(Boolean).join(' ');
            callback.current({ idTransaccion: captura || detalle.id, pagador: nombre || 'Cliente PayPal', montoUsd: valor });
          },
          onError: () => setEstado('error'),
        });
        return botones.render(contenedor.current).then(() => !cancelado && setEstado('listo'));
      })
      .catch(() => !cancelado && setEstado('error'));

    return () => {
      cancelado = true;
      botones?.close?.();
    };
  }, [valor, descripcion]);

  if (!paypalConfigurado()) {
    return (
      <div className="aviso">
        ⚙️ PayPal aún no está activado. Pega tu <strong>Client ID</strong> en <code>src/config.ts</code> para mostrar
        los botones de pago.
      </div>
    );
  }

  return (
    <div>
      {estado === 'cargando' && <p className="muted">Cargando PayPal…</p>}
      {estado === 'error' && (
        <div className="aviso aviso-error">No se pudo procesar el pago con PayPal. Inténtalo de nuevo o usa WhatsApp.</div>
      )}
      <div ref={contenedor} className="paypal-box" />
    </div>
  );
}
