// Encabezado de cada página interna (con su único <h1>).
export default function PageHeader({ eyebrow, titulo, texto }: { eyebrow: string; titulo: string; texto: string }) {
  return (
    <section className="page-header">
      <div className="blob b1" />
      <div className="container">
        <span className="chip chip-light">{eyebrow}</span>
        <h1>{titulo}</h1>
        <p>{texto}</p>
      </div>
    </section>
  );
}
