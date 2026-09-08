export default function Loading() {
  return (
    <div className="rp-stack" role="status" aria-label="Cargando tu plataforma">
      <div className="rp-skeleton" style={{ minHeight: 50, width: "65%" }} />
      <div className="rp-skeleton" />
      <div className="rp-skeleton" />
    </div>
  );
}
