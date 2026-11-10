import React, { useState } from 'react';

export default function App() {
  const [nombre, setNombre] = useState('');
  const [servicio, setServicio] = useState('Limpieza Dental');
  const [fecha, setFecha] = useState('');

  const handleWhatsAppBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const telefono = '59178666840';
    const mensaje = `Hola, deseo agendar una cita en Three Angels Dental.%0A*Nombre:* ${nombre}%0A*Servicio:* ${servicio}%0A*Fecha:* ${fecha}`;
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#1e293b', backgroundColor: '#f3e8ff', minHeight: '100vh', margin: 0 }}>
      {/* Cabecera con los colores del logo (Morado y Celeste) */}
      <header style={{ background: 'linear-gradient(135deg, #581c87 0%, #0e7490 100%)', color: 'white', padding: '3rem 1rem', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '2.8rem', fontWeight: 'bold' }}>Three Angels Dental</h1>
        <p style={{ margin: '0.8rem 0 0 0', fontSize: '1.3rem', color: '#67e8f9' }}>Centro Odontológico - Sucre, Bolivia</p>
      </header>

      <main style={{ maxWidth: '950px', margin: '2.5rem auto', padding: '0 1rem' }}>
        {/* Servicios */}
        <section style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', marginBottom: '2rem', borderTop: '5px solid #581c87' }}>
          <h2 style={{ color: '#581c87', marginTop: 0, fontSize: '1.8rem' }}>✨ Nuestros Servicios Especializados</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ background: '#faf5ff', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #06b6d4' }}>
              <h3 style={{ color: '#581c87', margin: '0 0 0.5rem 0' }}>Limpieza Dental</h3>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>Ultrasonido y profilaxis avanzada para una salud bucal impecable.</p>
            </div>
            <div style={{ background: '#faf5ff', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #06b6d4' }}>
              <h3 style={{ color: '#581c87', margin: '0 0 0.5rem 0' }}>Ortodoncia Avanzada</h3>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>Brackets estéticos y metálicos alineados a tu medida.</p>
            </div>
            <div style={{ background: '#faf5ff', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #06b6d4' }}>
              <h3 style={{ color: '#581c87', margin: '0 0 0.5rem 0' }}>Endodoncia</h3>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>Tratamientos especializados sin dolor y restauración segura.</p>
            </div>
          </div>
        </section>

        {/* Formulario de Citas / WhatsApp */}
        <section style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', marginBottom: '2rem', borderTop: '5px solid #06b6d4' }}>
          <h2 style={{ color: '#0e7490', marginTop: 0, fontSize: '1.8rem' }}>📅 Reserva tu Cita en Línea</h2>
          <p style={{ color: '#475569' }}>Completa tus datos para coordinar tu atención de inmediato mediante nuestro canal de WhatsApp:</p>
          
          <form onSubmit={handleWhatsAppBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '550px', marginTop: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', color: '#581c87' }}>Nombre completo:</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
                placeholder="Ej. María Gómez"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', color: '#581c87' }}>Servicio requerido:</label>
              <select 
                value={servicio} 
                onChange={(e) => setServicio(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', backgroundColor: 'white' }}
              >
                <option value="Limpieza Dental">Limpieza Dental</option>
                <option value="Ortodoncia">Ortodoncia</option>
                <option value="Endodoncia">Endodoncia</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', color: '#581c87' }}>Fecha de la cita:</label>
              <input 
                type="date" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            <button 
              type="submit" 
              style={{ background: '#25D366', color: 'white', padding: '0.9rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 4px 6px rgba(37, 211, 102, 0.3)', transition: 'background 0.2s' }}
            >
              💬 Enviar Solicitud por WhatsApp
            </button>
          </form>
        </section>
      </main>

      {/* Botón flotante permanente */}
      <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 1000 }}>
        <a 
          href="https://wa.me/59178666840?text=Hola,%20deseo%20más%20información%20sobre%20Three%20Angels%20Dental" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ background: '#25D366', color: 'white', padding: '14px 22px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}
        >
          💬 WhatsApp
        </a>
      </div>

      <footer style={{ background: '#581c87', color: 'white', textAlign: 'center', padding: '1.8rem', marginTop: '3rem', borderTop: '4px solid #06b6d4' }}>
        <p style={{ margin: 0 }}>&copy; 2026 Three Angels Dental - Todos los derechos reservados. Sucre, Bolivia.</p>
      </footer>
    </div>
  );
}