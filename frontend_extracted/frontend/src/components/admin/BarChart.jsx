/**
 * Gráfico de barras verticales en SVG puro (sin dependencias externas).
 * data: [{ label, value }]. Responsivo mediante viewBox.
 */
export default function BarChart({ data = [], color = 'var(--primary)', height = 280 }) {
  if (!data.length) return null

  const width = 640
  const padX = 40
  const padTop = 20
  const padBottom = 56
  const chartH = height - padTop - padBottom
  const chartW = width - padX * 2
  const max = Math.max(...data.map((d) => Number(d.value) || 0), 1)
  const slot = chartW / data.length
  const barW = Math.min(slot * 0.6, 64)

  // Líneas guía horizontales (4 divisiones).
  const guides = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      preserveAspectRatio="xMidYMid meet"
    >
      {guides.map((g) => {
        const y = padTop + chartH * (1 - g)
        return (
          <g key={g}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="var(--border)" strokeWidth="1" />
            <text x={padX - 8} y={y + 5} textAnchor="end" fontSize="15" fill="var(--text-secondary)">
              {Math.round(max * g)}
            </text>
          </g>
        )
      })}

      {data.map((d, i) => {
        const value = Number(d.value) || 0
        const h = (value / max) * chartH
        const x = padX + slot * i + (slot - barW) / 2
        const y = padTop + chartH - h
        const label = String(d.label ?? '')
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx="5" fill={color}>
              <title>{`${label}: ${value}`}</title>
            </rect>
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize="16"
              fontWeight="600"
              fill="var(--text-primary)"
            >
              {value}
            </text>
            <text
              x={x + barW / 2}
              y={height - padBottom + 18}
              textAnchor="middle"
              fontSize="14"
              fill="var(--text-secondary)"
            >
              {label.length > 12 ? `${label.slice(0, 11)}…` : label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
