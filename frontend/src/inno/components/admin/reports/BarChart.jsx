/**
 * Gráfico de barras verticales en SVG puro (sin dependencias externas).
 * data: [{ label, value }]. Responsivo mediante viewBox.
 */
export default function BarChart({ data = [], color = 'var(--color-primary)', height = 280 }) {
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

  const guides = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img">
      {guides.map((g) => {
        const y = padTop + chartH * (1 - g)
        return (
          <line key={g} x1={padX} x2={width - padX} y1={y} y2={y} stroke="var(--color-border)" strokeWidth="1" />
        )
      })}

      {data.map((d, i) => {
        const value = Number(d.value) || 0
        const barH = max ? (value / max) * chartH : 0
        const x = padX + slot * i + (slot - barW) / 2
        const y = padTop + chartH - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={color} />
            <text x={x + barW / 2} y={padTop + chartH + 18} textAnchor="middle" fontSize="11" fill="var(--color-text-secondary)">
              {String(d.label).length > 12 ? `${String(d.label).slice(0, 11)}…` : d.label}
            </text>
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-text-primary)">
              {value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
