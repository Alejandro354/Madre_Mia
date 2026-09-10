export default function ChartCard({ title, subtitle, children, empty }) {
  return (
    <div className="chart-card">
      <div className="chart-card-head">
        <h3 className="chart-card-title">{title}</h3>
        {subtitle && <span className="chart-card-subtitle">{subtitle}</span>}
      </div>
      {empty ? (
        <div className="chart-empty">Sin datos para el rango seleccionado</div>
      ) : (
        <div className="chart-card-body">{children}</div>
      )}
    </div>
  )
}
