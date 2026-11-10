import React from 'react';

export default function App() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
      <header style={{ background: '#0284c7', color: 'white', padding: '2rem', textAlign: 'center' }}>
        <h1>Three Angels Dental</h1>
        <p>Tu sonrisa en las mejores manos - Sucre, Bolivia</p>
      </header>

      <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2>Nuestros Servicios</h2>
          <ul>
            <li><strong>Limpieza Dental Profesional:</strong> Ultrasonido y profilaxis.</li>
            <li><strong>Ortodoncia Avanzada:</strong> Brackets estéticos y metálicos.</li>
            <li><strong>Endodoncia y Restauración:</strong> Tratamientos sin dolor.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Métodos de Pago y Citas</h2>
          <p>Aceptamos pagos seguros en línea mediante <strong>PayPal</strong> y reservas directas por WhatsApp.</p>
        </section>
      </main>

      <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <a href="https://wa.me/59178666840?text=Hola,%20deseo%20agendar%20una%20cita%20en%20Three%20Angels%20Dental" 
           target="_blank" 
           rel="noopener noreferrer"
           style={{ background: '#25D366', color: 'white', padding: '12px 20px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          💬 Chat a WhatsApp
        </a>
      </div>

      <footer style={{ background: '#1e293b', color: 'white', textAlign: 'center', padding: '1rem', marginTop: '3rem' }}>
        <p>&copy; 2026 Three Angels Dental - Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}