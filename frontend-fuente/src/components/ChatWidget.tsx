// Botón flotante de chat: WhatsApp, Messenger y Telegram.
import { useState } from 'react';
import { CLINICA } from '../config';
import { enlaceValido, useSitio } from '../lib/sitio';
import { track } from '../lib/analytics';
import { IconMessenger, IconTelegram, IconWhatsapp } from './Icons';

const MENSAJE = 'Hola Three Angels Dental 👋, deseo más información.';

export default function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const { redes: REDES } = useSitio();
  const canales = [
    { nombre: 'WhatsApp', clase: 'wa', href: `https://wa.me/${CLINICA.whatsapp}?text=${encodeURIComponent(MENSAJE)}`, Icono: IconWhatsapp },
    { nombre: 'Messenger', clase: 'ms', href: REDES.messenger, Icono: IconMessenger },
    { nombre: 'Telegram', clase: 'tg', href: REDES.telegram, Icono: IconTelegram },
  ].filter((c) => enlaceValido(c.href)); // sin enlace = no se muestra

  return (
    <div className={`chat ${abierto ? 'abierto' : ''}`}>
      <div className="chat-panel" aria-hidden={!abierto}>
        <p className="chat-title">
          <strong>¿Hablamos?</strong>
          <small>Respondemos en minutos en horario de atención</small>
        </p>
        {canales.map(({ nombre, clase, href, Icono }) => (
          <a
            key={nombre}
            className={`chat-op ${clase}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={abierto ? 0 : -1}
            onClick={() => track(nombre === 'WhatsApp' ? 'whatsapp_click' : 'chat_click', { canal: nombre, origen: 'widget' })}
          >
            <Icono size={20} /> {nombre}
          </a>
        ))}
      </div>
      <button className="chat-fab" onClick={() => setAbierto(!abierto)} aria-label={abierto ? 'Cerrar chat' : 'Abrir chat'} aria-expanded={abierto}>
        {abierto ? '✕' : <IconWhatsapp size={28} />}
        {!abierto && <span className="pulse" />}
      </button>
    </div>
  );
}
