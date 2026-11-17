// Página CONTACTO ("/contacto"): mapa, horarios, formulario y canales directos.
import { useState } from 'react';
import type { FormEvent } from 'react';
import { IconMessenger, IconTelegram, IconWhatsapp } from '../components/Icons';
import PageHeader from '../components/PageHeader';
import SocialLinks from '../components/SocialLinks';
import { CLINICA, HORARIOS } from '../config';
import { useSitio } from '../lib/sitio';
import { track } from '../lib/analytics';
import { abrirWhatsApp } from '../lib/format';
import { useSeo } from '../lib/seo';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function Contact() {
  useSeo(
    'Contacto y ubicación',
    'Ubicación de Three Angels Dental en Sucre, Bolivia. Horarios de atención, WhatsApp, Messenger, Telegram y formulario de contacto.',
  );
  const { redes: REDES } = useSitio();
  const [form, setForm] = useState({ nombre: '', telefono: '', mensaje: '' });
  const hoy = new Date().getDay();

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    track('generate_lead', { tipo: 'contacto' });
    abrirWhatsApp(
      CLINICA.whatsapp,
      `📩 *Mensaje desde la web*\n\n👤 ${form.nombre}\n📞 ${form.telefono}\n\n${form.mensaje}`,
    );
  };

  return (
    <>
      <PageHeader eyebrow="Contacto" titulo="Contacto y ubicación" texto={`Te esperamos en ${CLINICA.ciudad}. Escríbenos por el canal que prefieras.`} />

      <section className="section container contacto">
        <div className="mapa card">
          <iframe
            src={CLINICA.googleMapsEmbed}
            title="Mapa de ubicación de Three Angels Dental en Sucre, Bolivia"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="mapa-foot">
            <span>📍 {CLINICA.direccion}</span>
            <a href={CLINICA.googleMapsLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" onClick={() => track('map_click')}>
              Cómo llegar →
            </a>
          </div>
        </div>

        <div className="contacto-side">
          <div className="card">
            <h2>🕒 Horarios de atención</h2>
            <ul className="horario">
              {DIAS.map((nombre, i) => {
                const h = HORARIOS.find((x) => x.dias.includes(i));
                return (
                  <li key={nombre} className={i === hoy ? 'hoy' : ''}>
                    <span>{nombre}{i === hoy && ' (hoy)'}</span>
                    <span>{h ? h.bloques.map((b) => b.join('–')).join(' · ') : 'Cerrado'}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card">
            <h2>💬 Canales directos</h2>
            <div className="canales-directos">
              <a className="chat-op wa" href={`https://wa.me/${CLINICA.whatsapp}`} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_click', { origen: 'contacto' })}>
                <IconWhatsapp size={20} /> WhatsApp {CLINICA.telefonoVisible}
              </a>
              <a className="chat-op ms" href={REDES.messenger} target="_blank" rel="noopener noreferrer"><IconMessenger size={20} /> Messenger</a>
              <a className="chat-op tg" href={REDES.telegram} target="_blank" rel="noopener noreferrer"><IconTelegram size={20} /> Telegram</a>
            </div>
            <SocialLinks />
          </div>
        </div>

        <form className="card form contacto-form" onSubmit={enviar}>
          <h2>✉️ Escríbenos</h2>
          <div className="form-grid">
            <label>
              Nombre *
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required autoComplete="name" />
            </label>
            <label>
              Teléfono *
              <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required autoComplete="tel" />
            </label>
          </div>
          <label>
            Mensaje *
            <textarea rows={4} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} required />
          </label>
          <button className="btn btn-primary" type="submit">Enviar por WhatsApp</button>
          {CLINICA.email && (
            <a className="link-btn" href={`mailto:${CLINICA.email}?subject=${encodeURIComponent('Consulta desde la web')}&body=${encodeURIComponent(form.mensaje)}`}>
              o envíalo por correo
            </a>
          )}
        </form>
      </section>
    </>
  );
}
