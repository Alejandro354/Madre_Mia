export default function Pagination({ page, totalPaginas, total, onChange }) {
  if (totalPaginas <= 1) {
    return <p className="pagination-info">{total} registro(s)</p>
  }
  return (
    <div className="pagination">
      <span className="pagination-info">{total} registro(s)</span>
      <div className="pagination-controls">
        <button type="button" className="btn-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Anterior
        </button>
        <span className="pagination-page">
          Página {page} de {totalPaginas}
        </span>
        <button type="button" className="btn-ghost" disabled={page >= totalPaginas} onClick={() => onChange(page + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  )
}
