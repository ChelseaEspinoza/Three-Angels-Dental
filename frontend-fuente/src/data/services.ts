// Catálogo de tratamientos. Edita precios, textos o agrega nuevos aquí.
// Los precios marcados "referencial" son de ejemplo: ajústalos a tus tarifas reales.
export type Servicio = {
  id: string;
  nombre: string;
  categoria: 'Prevención' | 'Especialidades' | 'Estética' | 'Niños';
  precio: number; // en Bolivianos
  desde?: boolean; // muestra "Desde Bs. ..." si el precio final depende del caso
  duracion: string;
  resumen: string;
  incluye: string[];
  imagen: string; // ruta dentro de frontend/public
  alt: string;
  orden?: number;
};

export const SERVICIOS: Servicio[] = [
  {
    id: 'limpieza',
    nombre: 'Limpieza Dental',
    categoria: 'Prevención',
    precio: 150,
    duracion: '45 min',
    resumen: 'Profilaxis profesional con ultrasonido para eliminar sarro y manchas.',
    incluye: ['Revisión completa', 'Destartraje con ultrasonido', 'Pulido y aplicación de flúor'],
    imagen: '/3.jpeg',
    alt: 'Limpieza dental profesional en Three Angels Dental, Sucre',
  },
  {
    id: 'odontopediatria',
    nombre: 'Odontopediatría',
    categoria: 'Niños',
    precio: 100,
    duracion: '30 min',
    resumen: 'Atención infantil sin miedo, con manejo de conducta y ambiente divertido.',
    incluye: ['Prevención de caries', 'Selladores de fosas y fisuras', 'Ortodoncia interceptiva temprana'],
    imagen: '/5.jpeg',
    alt: 'Odontopediatría: atención dental para niños en Sucre',
  },
  {
    id: 'cordales',
    nombre: 'Cirugía de Cordales',
    categoria: 'Especialidades',
    precio: 350,
    desde: true,
    duracion: '60 min',
    resumen: 'Extracción segura de terceros molares con técnica mínimamente invasiva.',
    incluye: ['Evaluación radiográfica', 'Anestesia local', 'Control post operatorio'],
    imagen: '/2.jpeg',
    alt: 'Cirugía de cordales (muelas del juicio) en Sucre',
  },
  {
    id: 'ortodoncia',
    nombre: 'Ortodoncia',
    categoria: 'Especialidades',
    precio: 1700,
    desde: true,
    duracion: 'Tratamiento',
    resumen: 'Brackets metálicos y estéticos para una sonrisa perfectamente alineada.',
    incluye: ['Estudio y plan de tratamiento', 'Instalación de brackets', 'Controles mensuales'],
    imagen: '/4.jpeg',
    alt: 'Ortodoncia con brackets en Sucre, Bolivia',
  },
  {
    id: 'protesis',
    nombre: 'Prótesis Dental',
    categoria: 'Especialidades',
    precio: 1200,
    desde: true,
    duracion: 'Tratamiento',
    resumen: 'Restauración estética y funcional de piezas dentales perdidas.',
    incluye: ['Prótesis fija o removible', 'Toma de impresiones', 'Ajustes y controles'],
    imagen: '/6.jpeg',
    alt: 'Prótesis dental fija y removible en Sucre',
  },
  {
    id: 'endodoncia',
    nombre: 'Endodoncia',
    categoria: 'Especialidades',
    precio: 500, // referencial
    desde: true,
    duracion: '60–90 min',
    resumen: 'Tratamiento de conducto para salvar tu pieza dental y eliminar el dolor.',
    incluye: ['Diagnóstico', 'Tratamiento de conductos', 'Sellado y control'],
    imagen: '/2.jpeg',
    alt: 'Endodoncia o tratamiento de conducto en Sucre',
  },
  {
    id: 'blanqueamiento',
    nombre: 'Blanqueamiento Dental',
    categoria: 'Estética',
    precio: 800, // referencial
    duracion: '60 min',
    resumen: 'Aclara varios tonos tu sonrisa de forma segura y supervisada.',
    incluye: ['Evaluación de sensibilidad', 'Blanqueamiento en consultorio', 'Kit de mantenimiento'],
    imagen: '/3.jpeg',
    alt: 'Blanqueamiento dental en Sucre, Bolivia',
  },
];
