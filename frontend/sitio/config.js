// =====================================================================
//  CONFIGURACIÓN DE THREE ANGELS DENTAL
//  Edita este archivo y vuelve a desplegar: NO hace falta compilar nada.
//  (El ID de Google Analytics está en index.html)
// =====================================================================
window.THREE_ANGELS = {
  // ---- 1) PAYPAL ----------------------------------------------------
  // Client ID de developer.paypal.com → Apps & Credentials.
  // El de la pestaña "Sandbox" hace pagos de prueba; el de "Live", pagos reales.
  paypalClientId: 'BAAvKNwX6fIa1y8dPvd9LImnIR4Qe7Q04O22iInNiTDhqSjW8_sT7M0bkjqKlZYv0YW3JNyjJgZbWr2Hj0',
  tipoCambioBsPorUsd: 6.96,     // para mostrar y cobrar el equivalente en USD
  anticipoCitaPorcentaje: 100,  // % del precio de la cita que se cobra online (100 = completo)

  // ---- 2) DATOS DE CONTACTO ----------------------------------------
  clinica: {
    nombre: 'Three Angels Dental',
    ciudad: 'Sucre, Bolivia',
    directora: 'Dra. Jesmil Deby Espinoza Jimenez',
    whatsapp: '59178666840',            // código de país + número, sin "+" ni espacios
    telefonoVisible: '+591 786 66840',
    email: '',                          // opcional
    direccion: 'Sucre, Bolivia',        // dirección exacta (calle y número)
    googleMapsLink: 'https://maps.app.goo.gl/qQF4A1pcWAM8pWhp7?g_st=aw',
    // Google Maps → Compartir → "Insertar un mapa" → copia solo la URL de src="..."
    googleMapsEmbed: 'https://www.google.com/maps?q=Three+Angels+Dental+Sucre+Bolivia&output=embed',
  },

  // Horarios (0 = domingo, 1 = lunes … 6 = sábado). Se usan en Contacto y en Reservar Cita.
  horarios: [
    { dias: [1, 2, 3, 4, 5], etiqueta: 'Lunes a Viernes', bloques: [['08:30', '12:30'], ['14:30', '19:30']] },
    { dias: [6], etiqueta: 'Sábado', bloques: [['09:00', '13:00']] },
  ],
  duracionCitaMin: 30,

  // ---- 3) REDES SOCIALES Y CHAT ------------------------------------
  redes: {
    facebook: 'https://www.facebook.com/share/1CjuDVDn86/',
    instagram: 'https://www.instagram.com/three.angels.sucre',
    youtube: 'https://www.youtube.com/@TU_USUARIO',
    tiktok: 'https://www.tiktok.com/@TU_USUARIO',
    messenger: 'https://m.me/TU_USUARIO',
    telegram: 'https://t.me/TU_USUARIO',
  },

  // ---- 4) VIDEOS (se reproducen dentro de la web) -------------------
  // YouTube: solo el ID → https://www.youtube.com/watch?v=dQw4w9WgXcQ → 'dQw4w9WgXcQ'
  // TikTok:  solo el número → https://www.tiktok.com/@clinica/video/7312345678901234567
  videosYoutube: [
    { id: '', titulo: 'Cómo cepillarte correctamente los dientes' },
    { id: '', titulo: 'Conoce nuestra clínica en Sucre' },
    { id: '', titulo: 'Ortodoncia: preguntas frecuentes' },
  ],
  videosTiktok: [
    { id: '', titulo: 'Tip rápido de higiene bucal' },
    { id: '', titulo: 'Promoción del mes' },
    { id: '', titulo: 'Un día en Three Angels Dental' },
  ],
};
