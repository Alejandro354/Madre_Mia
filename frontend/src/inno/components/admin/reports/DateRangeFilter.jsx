import { useState } from 'react'

function iso(d) {
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

function computePreset(key) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  switch (key) {
    case 'hoy':
      return { fecha_inicio: iso(now), fecha_fin: iso(now) }
    case '7d': {
      const from = new Date(now)
      from.setDate(now.getDate() - 6)
      return { fecha_inicio: iso(from), fecha_fin: iso(now) }
    }
    case '30d': {
      const from = new Date(now)
      from.setDate(now.getDate() - 29)
      return { fecha_inicio: iso(from), fecha_fin: iso(now) }
    }
    case 'mes':
      return { fecha_inicio: iso(new Date(y, m, 1)), fecha_fin: iso(new Date(y, m + 1, 0)) }
    case 'mesAnterior':
      return { fecha_inicio: iso(new Date(y, m - 1, 1)), fecha_fin: iso(new Date(y, m, 0)) }
    case 'anio':
      return { fecha_inicio: iso(new Date(y, 0, 1)), fecha_fin: iso(new Date(y, 11, 31)) }
    default:
      return { fecha_inicio: '', fecha_fin: '' }
  }
}

const PRESETS = [
  { key: 'hoy', label: 'Hoy' },
  { key: '7d', label: 'Últimos 7 días' },
  { key: '30d', label: 'Últimos 30 días' },
  { key: 'mes', label: 'Este mes' },
  { key: 'mesAnterior', label: 'Mes anterior' },
  { key: 'anio', label: 'Este año' },
]

export default function DateRangeFilter({ value, onChange }) {
  const [active, setActive] = useState('')

  function applyPreset(key) {
    setActive(key)
    onChange(computePreset(key))
  }

  function applyField(field, val) {
    setActive('')
    onChange({ ...value, [field]: val })
  }

  function clear() {
    setActive('')
    onChange({ fecha_inicio: '', fecha_fin: '' })
  }

  return (
    <div className="date-filter">
      <div className="date-filter-presets">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`date-chip${active === p.key ? ' date-chip--active' : ''}`}
            onClick={() => applyPreset(p.key)}
          >
            {p.label}
          </button>
        ))}
        <button type="button" className="date-chip date-chip--ghost" onClick={clear}>
          Limpiar
        </button>
      </div>

      <div className="date-filter-fields">
        <label className="date-field">
          <span>Desde</span>
          <input
            type="date"
            value={value.fecha_inicio || ''}
            max={value.fecha_fin || undefined}
            onChange={(e) => applyField('fecha_inicio', e.target.value)}
          />
        </label>
        <label className="date-field">
          <span>Hasta</span>
          <input
            type="date"
            value={value.fecha_fin || ''}
            min={value.fecha_inicio || undefined}
            onChange={(e) => applyField('fecha_fin', e.target.value)}
          />
        </label>
      </div>
    </div>
  )
}
