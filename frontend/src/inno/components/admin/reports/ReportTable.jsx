function humanize(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function renderCell(value) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export default function ReportTable({ columnas = [], datos = [], loading }) {
  if (loading) {
    return <div className="report-loading">Cargando…</div>
  }
  if (!datos.length) {
    return <div className="report-empty">No hay registros para los filtros aplicados.</div>
  }

  return (
    <div className="report-table-wrap">
      <table className="report-table">
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c}>{humanize(c)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map((row, i) => (
            <tr key={row.id ?? row.practicante_id ?? row.aplicacion_id ?? i}>
              {columnas.map((c) => (
                <td key={c}>{renderCell(row[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
