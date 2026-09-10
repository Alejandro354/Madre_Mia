/**
 * Gráfico de dona en SVG puro con leyenda. data: [{ label, value }].
 */
const PALETTE = ['#FF1837', '#6366F1', '#10B981', '#F59E0B', '#0EA5E9', '#EC4899', '#8B5CF6']

function polar(cx, cy, r, angle) {
  const a = (angle - 90) * (Math.PI / 180)
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

function arcPath(cx, cy, r, start, end) {
  const [x1, y1] = polar(cx, cy, r, start)
  const [x2, y2] = polar(cx, cy, r, end)
  const large = end - start > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

export default function DonutChart({ data = [] }) {
  const items = data.filter((d) => Number(d.value) > 0)
  const total = items.reduce((sum, d) => sum + Number(d.value), 0)
  if (!total) return null

  const size = 240
  const cx = size / 2
  const cy = size / 2
  const r = 92

  const segments = items.map((d, i) => {
    const value = Number(d.value)
    const prev = items.slice(0, i).reduce((sum, x) => sum + Number(x.value), 0)
    return { ...d, value, start: (prev / total) * 360, sweep: (value / total) * 360 }
  })

  return (
    <div className="donut">
      <svg viewBox={`0 0 ${size} ${size}`} width="240" height="240" role="img">
        {segments.map((s, i) => (
          <path
            key={i}
            d={arcPath(cx, cy, r, s.start, s.start + Math.min(s.sweep, 359.999))}
            fill="none"
            stroke={PALETTE[i % PALETTE.length]}
            strokeWidth="30"
            strokeLinecap="butt"
          >
            <title>{`${s.label}: ${s.value}`}</title>
          </path>
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="32" fontWeight="700" fill="var(--color-text-primary)">
          {total}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fontSize="15" fill="var(--color-text-secondary)">
          Total
        </text>
      </svg>

      <ul className="donut-legend">
        {items.map((d, i) => (
          <li key={i}>
            <span className="donut-dot" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
            <span className="donut-legend-label">{d.label}</span>
            <span className="donut-legend-value">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
