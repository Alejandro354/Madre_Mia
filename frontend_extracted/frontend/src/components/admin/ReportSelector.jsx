// Etiquetas legibles para cada tipo de reporte que expone el backend.
const LABELS = {
  practicantes: 'Practicantes',
  postulaciones: 'Postulaciones',
  vacantes: 'Vacantes activas',
  documentos: 'Documentos',
  promedios: 'Promedios / Rendimiento',
  mensajes: 'Mensajes',
}

export default function ReportSelector({ tipos = [], value, onChange }) {
  return (
    <div className="report-selector">
      {tipos.map((t) => (
        <button
          key={t}
          type="button"
          className={`tab${value === t ? ' tab--active' : ''}`}
          onClick={() => onChange(t)}
        >
          {LABELS[t] || t}
        </button>
      ))}
    </div>
  )
}

export function reportLabel(tipo) {
  return LABELS[tipo] || tipo
}
