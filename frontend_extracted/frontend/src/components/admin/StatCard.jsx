// Tarjeta de indicador reutilizable. `hint` muestra un desglose secundario.
export default function StatCard({ label, value, hint, accent = 'var(--primary)' }) {
  return (
    <div className="stat-card">
      <span className="stat-card-bar" style={{ backgroundColor: accent }} />
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value ?? 0}</p>
        {hint && <p className="stat-card-hint">{hint}</p>}
      </div>
    </div>
  )
}
