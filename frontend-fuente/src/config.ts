// Lee la configuración de public/config.js (window.THREE_ANGELS).
// Para cambiar datos, edita config.js; este archivo solo pone valores por defecto.
type Bloque = [string, string];
type Horario = { dias: number[]; etiqueta: string; bloques: Bloque[] };
type Video = { id: string; titulo: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const C: Record<string, any> = (window as unknown as { THREE_ANGELS?: Record<string, unknown> }).THREE_ANGELS || {};

// Client ID de PayPal (Sandbox = pagos de prueba). Si config.js trae otro ID real, se usa ese.
const PAYPAL_POR_DEFECTO = 'TDhqSjW8_sT7M0bkjqKlZYv0YW3JNyjJgZbWr2Hj0';
const paypalConfig = String(C.paypalClientId || '');
export const PAYPAL_CLIENT_ID: string = paypalConfig && !paypalConfig.startsWith('PEGA_AQUI') ? paypalConfig : PAYPAL_POR_DEFECTO;
export const PAYPAL_MONEDA = 'USD'; // PayPal no acepta Bolivianos
export const TIPO_CAMBIO_BS_POR_USD: number = C.tipoCambioBsPorUsd ?? 6.96;
export const ANTICIPO_CITA_PORCENTAJE: number = C.anticipoCitaPorcentaje ?? 100;

export const CLINICA: {
  nombre: string; ciudad: string; directora: string; whatsapp: string; telefonoVisible: string;
  email: string; direccion: string; googleMapsLink: string; googleMapsEmbed: string;
} = {
  nombre: 'Three Angels Dental',
  ciudad: 'Sucre, Bolivia',
  directora: 'Dra. Jesmil Deby Espinoza Jimenez',
  whatsapp: '59178666840',
  telefonoVisible: '+591 786 66840',
  email: '',
  direccion: 'Sucre, Bolivia',
  googleMapsLink: 'https://maps.app.goo.gl/qQF4A1pcWAM8pWhp7?g_st=aw',
  googleMapsEmbed: 'https://www.google.com/maps?q=Three+Angels+Dental+Sucre+Bolivia&output=embed',
  ...(C.clinica || {}),
};

export const HORARIOS: Horario[] = C.horarios ?? [
  { dias: [1, 2, 3, 4, 5], etiqueta: 'Lunes a Viernes', bloques: [['08:30', '12:30'], ['14:30', '19:30']] },
  { dias: [6], etiqueta: 'Sábado', bloques: [['09:00', '13:00']] },
];
export const DURACION_CITA_MIN: number = C.duracionCitaMin ?? 30;

export const REDES: { facebook: string; instagram: string; youtube: string; tiktok: string; messenger: string; telegram: string } = {
  facebook: 'https://www.facebook.com/share/1CjuDVDn86/',
  instagram: 'https://www.instagram.com/three.angels.sucre',
  youtube: 'https://www.youtube.com/',
  tiktok: 'https://www.tiktok.com/',
  messenger: 'https://m.me/',
  telegram: 'https://t.me/',
  ...(C.redes || {}),
};

export const VIDEOS_YOUTUBE: Video[] = C.videosYoutube ?? [];
export const VIDEOS_TIKTOK: Video[] = C.videosTiktok ?? [];

// Chat en vivo (tawk.to). Se puede cambiar en config.js con:
//   chatEnVivo: { propiedad: '...', widget: '...' }   (o propiedad: '' para quitar el chat)
export const CHAT_EN_VIVO: { propiedad: string; widget: string } = {
  propiedad: '6afd0a04aba2d83cc2da1cb2',
  widget: '1k7m6u997',
  ...(C.chatEnVivo || {}),
};
