// Placeholder shown the instant a tab is tapped, while the server prepares
// the screen (loading.tsx files). Shapes echo a title, a hero and a list.
export default function LoadingBlocks() {
  return (
    <div className="rp-stack" role="status" aria-label="Cargando">
      <div className="rp-skeleton" style={{ minHeight: 40, width: "55%" }} />
      <div className="rp-skeleton" style={{ minHeight: 190 }} />
      <div className="rp-skeleton" />
    </div>
  );
}
