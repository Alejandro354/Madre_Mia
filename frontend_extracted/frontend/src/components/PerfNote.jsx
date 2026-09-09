import { formatDuration } from '../utils/perf'

/**
 * Línea de evidencia para QA: muestra los tiempos medidos de los criterios
 * 2.1 y 3.4. `items` es una lista de { label, ms }; las entradas sin medición
 * (ms null/undefined) se omiten.
 */
export default function PerfNote({ items = [], children }) {
  const parts = items.filter((i) => Number.isFinite(i?.ms))
  if (parts.length === 0 && !children) return null

  return (
    <p className="perf-note">
      {children}
      {parts.map((item, i) => (
        <span key={item.label}>
          {(children || i > 0) && ' · '}
          {item.label} {formatDuration(item.ms)}
        </span>
      ))}
    </p>
  )
}
