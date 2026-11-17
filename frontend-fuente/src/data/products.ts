// Catálogo de la Tienda de Higiene Bucal. Edita, agrega o quita productos aquí.
// "imagen" es opcional: pon la foto en frontend/public/productos/ y escribe la ruta,
// por ejemplo imagen: '/productos/cepillo-bambu.jpg'. Sin foto se muestra un ícono.
export const CATEGORIAS = [
  'Cepillos',
  'Pastas dentales',
  'Enjuagues',
  'Hilo e interdentales',
  'Ortodoncia',
  'Kits',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export type Producto = {
  id: string;
  nombre: string;
  categoria: Categoria;
  precio: number; // en Bolivianos
  descripcion: string;
  icono: string;
  imagen?: string;
  destacado?: boolean;
  stock?: number | null; // unidades disponibles (lo controla el panel de administración)
};

export const PRODUCTOS: Producto[] = [
  { id: 'cep-suave', nombre: 'Cepillo dental suave', categoria: 'Cepillos', precio: 18, icono: '🪥', descripcion: 'Cerdas ultra suaves para encías sensibles. Cabezal compacto.' },
  { id: 'cep-medio', nombre: 'Cepillo dental medio', categoria: 'Cepillos', precio: 15, icono: '🪥', descripcion: 'Limpieza diaria eficaz con cerdas de dureza media.' },
  { id: 'cep-bambu', nombre: 'Cepillo de bambú ecológico', categoria: 'Cepillos', precio: 22, icono: '🎋', descripcion: 'Mango biodegradable de bambú y cerdas suaves con carbón.', destacado: true },
  { id: 'cep-electrico', nombre: 'Cepillo eléctrico recargable', categoria: 'Cepillos', precio: 280, icono: '⚡', descripcion: 'Vibración sónica, 3 modos de limpieza y temporizador de 2 minutos.', destacado: true },
  { id: 'cep-infantil', nombre: 'Cepillo infantil con personajes', categoria: 'Cepillos', precio: 16, icono: '🧸', descripcion: 'Cerdas extra suaves y mango ergonómico para niños de 2 a 8 años.' },
  { id: 'pasta-blanq', nombre: 'Pasta blanqueadora', categoria: 'Pastas dentales', precio: 32, icono: '✨', descripcion: 'Remueve manchas superficiales de café y té. Con flúor.' },
  { id: 'pasta-sens', nombre: 'Pasta para dientes sensibles', categoria: 'Pastas dentales', precio: 38, icono: '🧊', descripcion: 'Alivia la sensibilidad al frío y al calor desde la primera semana.', destacado: true },
  { id: 'pasta-fluor', nombre: 'Pasta con flúor protección total', categoria: 'Pastas dentales', precio: 20, icono: '🛡️', descripcion: 'Previene caries y fortalece el esmalte. Uso familiar.' },
  { id: 'pasta-kids', nombre: 'Pasta infantil sabor fresa', categoria: 'Pastas dentales', precio: 19, icono: '🍓', descripcion: 'Flúor en concentración adecuada para niños. Sabor suave.' },
  { id: 'enj-clasico', nombre: 'Enjuague bucal menta 500 ml', categoria: 'Enjuagues', precio: 35, icono: '🌿', descripcion: 'Aliento fresco por 12 horas y reducción de placa.' },
  { id: 'enj-sin-alcohol', nombre: 'Enjuague sin alcohol 500 ml', categoria: 'Enjuagues', precio: 40, icono: '💧', descripcion: 'Fórmula suave que no arde. Ideal para encías sensibles.' },
  { id: 'enj-clorhex', nombre: 'Enjuague con clorhexidina', categoria: 'Enjuagues', precio: 45, icono: '🧪', descripcion: 'Antiséptico para uso post tratamiento según indicación.' },
  { id: 'hilo', nombre: 'Hilo dental encerado 50 m', categoria: 'Hilo e interdentales', precio: 18, icono: '🧵', descripcion: 'Se desliza fácil entre los dientes sin deshilacharse.' },
  { id: 'hilo-arcos', nombre: 'Arcos de hilo dental (x50)', categoria: 'Hilo e interdentales', precio: 25, icono: '🎯', descripcion: 'Prácticos para llevar; ideales para niños y adultos.' },
  { id: 'interdental', nombre: 'Cepillos interdentales (x6)', categoria: 'Hilo e interdentales', precio: 30, icono: '🔹', descripcion: 'Limpian espacios entre dientes, puentes e implantes.' },
  { id: 'cera-orto', nombre: 'Cera de ortodoncia', categoria: 'Ortodoncia', precio: 12, icono: '🟣', descripcion: 'Evita roces y llagas causados por los brackets.' },
  { id: 'cep-orto', nombre: 'Cepillo para ortodoncia', categoria: 'Ortodoncia', precio: 24, icono: '🦷', descripcion: 'Cerdas en forma de V para limpiar alrededor de los brackets.' },
  { id: 'kit-orto', nombre: 'Kit de ortodoncia completo', categoria: 'Kits', precio: 85, icono: '🎒', descripcion: 'Cepillo en V, interdentales, cera, hilo enhebrador y estuche.', destacado: true },
  { id: 'kit-viaje', nombre: 'Kit de higiene de viaje', categoria: 'Kits', precio: 45, icono: '🧳', descripcion: 'Cepillo plegable, pasta mini, hilo dental y estuche.' },
  { id: 'kit-familiar', nombre: 'Kit familiar de higiene bucal', categoria: 'Kits', precio: 120, icono: '👨‍👩‍👧', descripcion: '4 cepillos, 2 pastas, enjuague y hilo dental para toda la familia.' },
];
