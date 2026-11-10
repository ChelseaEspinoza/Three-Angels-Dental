import React, { useState, useEffect } from 'react';

export default function App() {
  const [nombre, setNombre] = useState('');
  const [servicio, setServicio] = useState('Limpieza Dental');
  const [fecha, setFecha] = useState('');

  const [testimonioNombre, setTestimonioNombre] = useState('');
  const [testimonioComentario, setTestimonioComentario] = useState('');

  // Testimonios con persistencia en localStorage
  const [testimoniosLista, setTestimoniosLista] = useState(() => {
    const savedTestimonials = localStorage.getItem('three_angels_testimonios');
    if (savedTestimonials) {
      try {
        return JSON.parse(savedTestimonials);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { nombre: 'Carla Mendoza', comentario: 'La atención para mis hijos en Odontopediatría fue fantástica. Tienen muchísima paciencia y un ambiente genial.' },
      { nombre: 'Rodrigo Valdivia', comentario: 'Me hice la cirugía de cordales y todo salió perfecto, cero dolor y tecnología de primera en Sucre.' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('three_angels_testimonios', JSON.stringify(testimoniosLista));
  }, [testimoniosLista]);

  const handleWhatsAppBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const telefono = '59178666840';
    const mensaje = `Hola, deseo agendar una cita en Three Angels Dental.%0A*Nombre:* ${nombre}%0A*Servicio:* ${servicio}%0A*Fecha:* ${fecha}`;
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
  };

  const handlePayPalPayment = () => {
    if (!nombre || !fecha) {
      alert('Por favor completa tu nombre y la fecha de tu cita antes de realizar el pago.');
      return;
    }

    // Definimos los precios reales en Bolivianos según el servicio seleccionado
    const precios: { [key: string]: number } = {
      'Limpieza Dental': 150,
      'Odontopediatria (Atencion Infantil)': 100,
      'Cirugia de Cordales': 350,
      'Ortodoncia': 1700,
      'Protesis Dental': 1200
    };

    const montoBs = precios[servicio] || 150;

    alert(`¡Redirección segura a PayPal iniciada para ${nombre}!\n\nServicio: ${servicio}\nFecha: ${fecha}\n\nMonto a Pagar: ${montoBs} Bs\n\n(Simulación de pasarela de pago completada con éxito para la clínica Three Angels Dental).`);
  };

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (testimonioNombre && testimonioComentario) {
      const nuevaLista = [...testimoniosLista, { nombre: testimonioNombre, comentario: testimonioComentario }];
      setTestimoniosLista(nuevaLista);
      setTestimonioNombre('');
      setTestimonioComentario('');
      alert('¡Gracias por compartir tu experiencia! Tu comentario se ha publicado correctamente.');
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b', backgroundColor: '#fdf4ff', minHeight: '100vh', margin: 0, overflowX: 'hidden' }}>
      
      {/* 1. HEADER / NAVEGACIÓN CON TU LOGO OFICIAL */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, 
        background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(10px)', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '0.8rem 2.5rem', boxShadow: '0 4px 20px rgba(88, 28, 135, 0.08)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <img 
            src="/logo.png" 
            alt="Three Angels Dental Logo" 
            style={{ fontFamily: '"Pacifico", "Brush Script MT", cursive', width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #581c87' }} 
          />
          <span style={{ fontFamily: '"Pacifico", "Brush Script MT", cursive', fontWeight: '800', fontSize: '1.2rem', background: 'linear-gradient(135deg, #581c87, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Three Angels Dental
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          <a href="#inicio" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600' }}>Inicio</a>
          <a href="#nosotros" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600' }}>Nosotros</a>
          <a href="#servicios" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600' }}>Tratamientos</a>
          <a href="#ninos" style={{ textDecoration: 'none', color: '#0284c7', fontWeight: '800' }}>👶 Odontopediatría</a>
          <a href="#testimonios" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600' }}>Testimonios</a>
          <a href="#agendar" style={{ 
            background: 'linear-gradient(135deg, #581c87 0%, #06b6d4 100%)', 
            color: 'white', padding: '0.6rem 1.2rem', borderRadius: '30px', 
            textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(88, 28, 135, 0.3)'
          }}>
            Agendar Cita
          </a>
        </div>
      </nav>

      {/* 2. HERO SECTION CON FOTOGRAFÍA DE FONDO Y DEGRADADO SEMITRANSPARENTE */}
      <section id="inicio" style={{ 
        position: 'relative',
        backgroundImage: 'linear-gradient(135deg, rgba(88, 28, 135, 0.85) 0%, rgba(124, 58, 237, 0.8) 50%, rgba(6, 182, 212, 0.85) 100%), url("/3.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white', 
        padding: '11rem 1rem 7rem 1rem', 
        textAlign: 'center', 
        clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(255, 255, 255, 0.25)', padding: '0.4rem 1.2rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600', backdropFilter: 'blur(5px)' }}>
            ✨ Centro Odontológico Especializado en Sucre, Bolivia
          </span>
          <h1 style={{ 
            fontFamily: '"Pacifico", "Brush Script MT", cursive', 
            fontSize: '3.5rem', 
            fontWeight: '900', 
            margin: '1.2rem 0', 
            lineHeight: '1.2', 
            textShadow: '0 2px 10px rgba(0,0,0,0.3)' 
          }}>
            La sonrisa que va contigo
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#e0f2fe', marginBottom: '2rem', fontWeight: '400', textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>
            Tecnología avanzada, calidez humana e indumentaria especializada para toda la familia en un solo lugar.
          </p>
          <a href="#agendar" style={{ 
            background: 'white', color: '#581c87', padding: '1rem 2.5rem', 
            borderRadius: '35px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'inline-block'
          }}>
            Reserva tu Cita Ahora
          </a>
        </div>
      </section>

      {/* 3. SECCIÓN SOBRE NOSOTROS */}
      <section id="nosotros" style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(88, 28, 135, 0.06)', borderLeft: '8px solid #581c87' }}>
          <h2 style={{ fontFamily: '"Pacifico", "Brush Script MT", cursive',color: '#581c87', fontSize: '2.2rem', marginTop: 0, fontWeight: '800' }}>Sobre Nosotros</h2>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.8' }}>
            En el corazón de Sucre, transformamos vidas a través de sonrisas saludables y radiantes para grandes y pequeños. Bajo la dirección y liderazgo de la Dra. Jesmil Deby Espinoza Jimenez, nuestra clínica se distingue por ofrecer una atención de excelencia, combinando un trato humano, cálido y absolutamente sin dolor.
            <br /><br />
            Creemos que la salud bucal de calidad va de la mano con un entorno impecable. Por ello, nuestras modernas instalaciones están diseñadas bajo los más altos estándares de sofisticación, pulcritud y estrictos protocolos de bioseguridad, garantizando un espacio estéril, seguro y confiable para ti y tu familia.
          </p>
        </div>
      </section>

      {/* 4. SECCIÓN ESPECIALIZADA EN NIÑOS (ODONTOPEDIATRÍA) */}
      <section id="ninos" style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #faf5ff 100%)', padding: '3rem', borderRadius: '24px', boxShadow: '0 15px 35px rgba(6, 182, 212, 0.1)', border: '2px solid #06b6d4', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 450px' }}>
            <span style={{ background: '#06b6d4', color: 'white', padding: '0.3rem 1rem', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold' }}>Área Infantil</span>
            <h2 style={{ fontFamily: '"Pacifico", "Brush Script MT", cursive',color: '#0e7490', fontSize: '2.2rem', margin: '0.8rem 0', fontWeight: '800' }}>Atención Especializada en Niños</h2>
            <p style={{ color: '#334155', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              Sabemos que la primera visita al dentista marca la diferencia. Por eso, contamos con <strong>indumentaria colorida, especializada y un manejo psicológico infantil</strong> único. Creamos un ambiente divertido y libre de miedo para que tus hijos disfruten cuidar sus dientes desde pequeños.
            </p>
            <ul style={{ paddingLeft: '1.2rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              <li>Prevención de caries y aplicación de selladores.</li>
              <li>Ortodoncia interceptiva temprana.</li>
              <li>Técnicas de manejo de conducta sin traumas.</li>
            </ul>
            <a href="#agendar" style={{ background: '#0e7490', color: 'white', padding: '0.8rem 1.8rem', borderRadius: '25px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', boxShadow: '0 4px 12px rgba(14, 116, 144, 0.3)' }}>
              Agendar Cita Infantil
            </a>
          </div>
          <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
            <img src="/5.jpeg" alt="Atención en Niños Odontopediatría" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
          </div>
        </div>
      </section>

      {/* 5. GALERÍA DE TRATAMIENTOS Y ATENCIONES */}
      <section id="servicios" style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <h2 style={{ fontFamily: '"Pacifico", "Brush Script MT", cursive',textAlign: 'center', color: '#581c87', fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem' }}>Nuestros Tratamientos y Especialidades</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2.5rem' }}>Conoce la variedad de servicios profesionales que ofrecemos en Sucre.</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', width: '280px' }}>
            <img src="/2.jpeg" alt="Cirugía de Cordales" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
            <h3 style={{ color: '#581c87', margin: '0 0 0.5rem 0' }}>Cirugía de Cordales</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Extracción segura y especializada sin complicaciones.</p>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', width: '280px' }}>
            <img src="/3.jpeg" alt="Paciente Viajero" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
            <h3 style={{ color: '#581c87', margin: '0 0 0.5rem 0' }}>Paciente Viajero</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Planes de atención exprés para pacientes de tránsito en Bolivia.</p>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', width: '280px' }}>
            <img src="/4.jpeg" alt="Ortodoncia" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
            <h3 style={{ color: '#581c87', margin: '0 0 0.5rem 0' }}>Ortodoncia</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Brackets metálicos y estéticos para una alineación perfecta.</p>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', width: '280px' }}>
            <img src="/6.jpeg" alt="Prótesis Dental" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
            <h3 style={{ color: '#581c87', margin: '0 0 0.5rem 0' }}>Prótesis Dental</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Restauración estética y funcional de piezas dentales.</p>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIOS Y FORMULARIO DE OPINIONES */}
      <section id="testimonios" style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <h2 style={{ fontFamily: '"Pacifico", "Brush Script MT", cursive',textAlign: 'center', color: '#581c87', fontSize: '2.2rem', fontWeight: '800', marginBottom: '2.5rem' }}>Lo que opinan nuestros pacientes</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {testimoniosLista.map((t: { nombre: string; comentario: string }, index: number) => (
            <div key={index} style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', borderTop: '4px solid #06b6d4' }}>
              <div style={{ color: '#f59e0b', fontSize: '1.2rem', marginBottom: '0.8rem' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontStyle: 'italic', color: '#334155', lineHeight: '1.6', marginBottom: '1rem' }}>"{t.comentario}"</p>
              <p style={{ fontWeight: 'bold', color: '#581c87', margin: 0 }}>— {t.nombre}</p>
            </div>
          ))}
        </div>

        {/* Formulario para dejar comentario */}
        <div style={{ background: 'linear-gradient(135deg, #581c87 0%, #06b6d4 100%)', padding: '2.5rem', borderRadius: '24px', color: 'white', boxShadow: '0 15px 35px rgba(88, 28, 135, 0.2)' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.6rem' }}>💬 Déjanos tu experiencia</h3>
          <p style={{ color: '#e0f2fe', marginBottom: '1.5rem' }}>Tu opinión nos ayuda a seguir mejorando cada día.</p>
          
          <form onSubmit={handleAddTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
            <input 
              type="text" 
              placeholder="Tu nombre completo" 
              value={testimonioNombre} 
              onChange={(e) => setTestimonioNombre(e.target.value)} 
              required
              style={{ padding: '0.9rem', borderRadius: '10px', border: 'none', fontSize: '1rem', outline: 'none' }}
            />
            <textarea 
              placeholder="Escribe tu comentario aquí..." 
              value={testimonioComentario} 
              onChange={(e) => setTestimonioComentario(e.target.value)} 
              required
              rows={3}
              style={{ padding: '0.9rem', borderRadius: '10px', border: 'none', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
            />
            <button type="submit" style={{ background: 'white', color: '#581c87', padding: '0.9rem', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              Publicar Comentario
            </button>
          </form>
        </div>
      </section>

      {/* 7. FORMULARIO DE AGENDAR CITA (WHATSAPP) Y PAGO CON PAYPAL */}
      <section id="agendar" style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', borderTop: '6px solid #581c87' }}>
          <h2 style={{ fontFamily: '"Pacifico", "Brush Script MT", cursive',color: '#581c87', fontSize: '2.2rem', marginTop: 0, fontWeight: '800' }}>📅 Reserva tu Cita Online y Pago</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Completa tus datos para agendar por WhatsApp o realiza tu pago seguro en línea con PayPal:</p>
          
          <form onSubmit={handleWhatsAppBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '600px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', color: '#475569' }}>Nombre completo:</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
                placeholder="Ej. Juan Pérez"
                style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', color: '#475569' }}>Servicio requerido:</label>
              <select 
                value={servicio} 
                onChange={(e) => setServicio(e.target.value)}
                style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', backgroundColor: 'white' }}
              >
                <option value="Limpieza Dental">Limpieza Dental</option>
                <option value="Odontopediatria (Atencion Infantil)">Odontopediatría (Atención Infantil)</option>
                <option value="Cirugia de Cordales">Cirugía de Cordales</option>
                <option value="Ortodoncia">Ortodoncia</option>
                <option value="Protesis Dental">Prótesis Dental</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', color: '#475569' }}>Fecha deseada:</label>
              <input 
                type="date" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            {/* Botones de Acción: WhatsApp y PayPal */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button 
                type="submit" 
                style={{ flex: 1, background: '#25D366', color: 'white', padding: '1rem', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem', boxShadow: '0 6px 15px rgba(37, 211, 102, 0.3)' }}
              >
                💬 Agendar por WhatsApp
              </button>
              
              <button 
                type="button" 
                onClick={handlePayPalPayment}
                style={{ flex: 1, background: '#0070ba', color: 'white', padding: '1rem', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem', boxShadow: '0 6px 15px rgba(0, 112, 186, 0.3)' }}
              >
                💳 Pagar con PayPal
              </button>
            </div>
          </form>

          {/* Sección de Ubicación con la foto real */}
          <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
            <div style={{ flex: '1 1 350px' }}>
              <h3 style={{ color: '#581c87', marginTop: 0, fontSize: '1.5rem' }}>📍 Nuestra Ubicación en Sucre</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>Ven a visitarnos a nuestras instalaciones ubicadas en Sucre, Bolivia. ¡Te esperamos!</p>
              <a 
                href="https://maps.app.goo.gl/qQF4A1pcWAM8pWhp7?g_st=aw" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'inline-block', background: 'linear-gradient(135deg, #581c87 0%, #06b6d4 100%)', color: 'white', padding: '0.8rem 2rem', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              >
                🗺️ Abrir en Google Maps
              </a>
            </div>
            <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
              <img src="/ubicacion.jfif" alt="Ubicación Three Angels Dental" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
        <a 
          href="https://wa.me/59178666840?text=Hola,%20deseo%20más%20información%20sobre%20Three%20Angels%20Dental" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ background: '#25D366', color: 'white', padding: '15px 24px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}
        >
          💬 Chat WhatsApp
        </a>
      </div>

      {/* 8. FOOTER COMPLETO CON REDES SOCIALES */}
      <footer style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '3.5rem 1rem', borderTop: '5px solid #06b6d4', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h3 style={{ color: '#67e8f9', fontSize: '1.6rem', marginBottom: '0.5rem', fontWeight: '800' }}>Three Angels Dental</h3>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Tu sonrisa en las mejores manos. Sucre, Bolivia.</p>

          {/* Iconos de Redes Sociales */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginBottom: '2.5rem' }}>
            <a href="https://www.facebook.com/share/1CjuDVDn86/" target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(135deg, #581c87, #7c3aed)', color: 'white', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} title="Facebook">f</a>
            <a href="https://www.instagram.com/three.angels.sucre?vrfl=dXZ6MnU5cTdvYW5n" target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(135deg, #581c87, #06b6d4)', color: 'white', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} title="Instagram">ig</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(135deg, #0e7490, #06b6d4)', color: 'white', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} title="YouTube">yt</a>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>&copy; 2026 Three Angels Dental - Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}