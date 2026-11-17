// Selector de método de pago reutilizable (Tienda y Citas):
//  A) Pago online con PayPal
//  B) Pedido por WhatsApp y pago al recibir / en consultorio
import { useState } from 'react';
import { CLINICA } from '../config';
import { track } from '../lib/analytics';
import { abrirWhatsApp, aUsd, bs, usd } from '../lib/format';
import PayPalButton from './PayPalButton';
import type { PagoPayPal } from './PayPalButton';

export type ResultadoPago =
  | ({ metodo: 'paypal' } & PagoPayPal)
  | { metodo: 'whatsapp'; ubicacion?: string };

type Props = {
  montoBs: number;
  descripcionPaypal: string;
  /** Arma el texto que se envía por WhatsApp (recibe el link de ubicación GPS, si se adjuntó). */
  mensajeWhatsApp: (ubicacion?: string) => string;
  textoBotonWhatsApp: string;
  notaWhatsApp: string;
  tipo: 'tienda' | 'cita';
  onCompletado: (r: ResultadoPago) => void;
};

export default function PaymentOptions(props: Props) {
  const { montoBs, descripcionPaypal, mensajeWhatsApp, textoBotonWhatsApp, notaWhatsApp, tipo, onCompletado } = props;
  const [metodo, setMetodo] = useState<'paypal' | 'whatsapp'>('paypal');
  const [ubicacion, setUbicacion] = useState<string>();
  const [gps, setGps] = useState<'idle' | 'buscando' | 'error'>('idle');

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) return setGps('error');
    setGps('buscando');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion(`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`);
        setGps('idle');
      },
      () => setGps('error'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const enviarWhatsApp = () => {
    track(tipo === 'tienda' ? 'whatsapp_order' : 'whatsapp_appointment', { value: aUsd(montoBs), currency: 'USD' });
    abrirWhatsApp(CLINICA.whatsapp, mensajeWhatsApp(ubicacion));
    onCompletado({ metodo: 'whatsapp', ubicacion });
  };

  return (
    <div className="pago">
      <div className="pago-total">
        <span>Total a pagar</span>
        <strong>{bs(montoBs)}</strong>
        <small>{usd(montoBs)} (PayPal cobra en dólares)</small>
      </div>

      <div className="pago-tabs" role="tablist">
        <button role="tab" aria-selected={metodo === 'paypal'} className={metodo === 'paypal' ? 'activo' : ''} onClick={() => setMetodo('paypal')}>
          💳 Pagar online
          <small>PayPal o tarjeta</small>
        </button>
        <button role="tab" aria-selected={metodo === 'whatsapp'} className={metodo === 'whatsapp' ? 'activo' : ''} onClick={() => setMetodo('whatsapp')}>
          {tipo === 'tienda' ? '🛵 Pagar al recibir' : '🏥 Pagar en consultorio'}
          <small>Coordinación por WhatsApp</small>
        </button>
      </div>

      {metodo === 'paypal' ? (
        <PayPalButton
          montoUsd={aUsd(montoBs)}
          descripcion={descripcionPaypal}
          onAprobado={(pago) => {
            track('purchase', { transaction_id: pago.idTransaccion, value: Number(pago.montoUsd), currency: 'USD', tipo });
            onCompletado({ metodo: 'paypal', ...pago });
          }}
        />
      ) : (
        <div className="pago-wa">
          <p className="muted">{notaWhatsApp}</p>
          {tipo === 'tienda' && (
            <div className="gps">
              <button type="button" className="btn btn-ghost" onClick={obtenerUbicacion} disabled={gps === 'buscando'}>
                📍 {ubicacion ? 'Ubicación adjuntada ✓' : gps === 'buscando' ? 'Obteniendo ubicación…' : 'Adjuntar mi ubicación actual (opcional)'}
              </button>
              {gps === 'error' && <small className="error">No se pudo obtener la ubicación. Podrás enviarla desde WhatsApp.</small>}
            </div>
          )}
          <button type="button" className="btn btn-whatsapp btn-block" onClick={enviarWhatsApp}>
            {textoBotonWhatsApp}
          </button>
        </div>
      )}
    </div>
  );
}
