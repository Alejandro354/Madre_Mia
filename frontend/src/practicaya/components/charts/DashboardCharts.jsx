import React, { useRef, useState } from 'react';

// Validated data-viz tokens (see dataviz skill palette). Chart-only, not global CSS vars.
const CHART_SEQUENTIAL = '#2a78d6'; // blue — magnitude comparison (postulaciones por vacante)
const CHART_INK = '#1A1A1A';
const CHART_MUTED = '#9A9FB5';
const CHART_GRID = '#E9EBF4';
const CHART_SURFACE = '#FFFFFF';

const STATUS_COLORS = {
  'Enviada': { color: '#9A9FB5', icon: '✉' },       // neutral gray — submitted, no verdict yet
  'En revisión': { color: '#fab219', icon: '⏱' },   // warning
  'Aceptada': { color: '#0ca30c', icon: '✓' },       // good
  'Rechazada': { color: '#d03b3b', icon: '✕' },      // critical
};

function formatCompact(n) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
  return String(n);
}

// ---------- Stat tile ----------
export const StatTile = ({ label, value, icon, accent }) => (
  <div style={{
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
    minWidth: '220px'
  }}>
    <div style={{
      width: '44px',
      height: '44px',
      borderRadius: '10px',
      background: accent ? `${accent}1A` : 'var(--bg-tag)',
      color: accent || 'var(--color-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
        {formatCompact(value)}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
        {label}
      </div>
    </div>
  </div>
);

// ---------- Horizontal bar chart: postulaciones por vacante ----------
export const VacancyBarChart = ({ data, emptyMessage }) => {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(1, ...data.map(d => d.count));

  if (!data.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        const isHovered = hovered === i;
        return (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            tabIndex={0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', outline: 'none' }}
          >
            <div style={{
              width: '150px',
              flexShrink: 0,
              fontSize: '12px',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }} title={d.vacante}>
              {d.vacante}
            </div>
            <div style={{ flex: 1, position: 'relative', height: '22px', background: CHART_GRID, borderRadius: '4px' }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${Math.max(pct, d.count > 0 ? 3 : 0)}%`,
                background: CHART_SEQUENTIAL,
                borderRadius: '0 4px 4px 0',
                opacity: isHovered ? 0.85 : 1,
                outline: isHovered ? `2px solid ${CHART_SEQUENTIAL}` : 'none',
                outlineOffset: '1px',
                transition: 'opacity 0.15s'
              }} />
            </div>
            <div style={{ width: '28px', flexShrink: 0, textAlign: 'right', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {d.count}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Status breakdown bar chart ----------
export const StatusBarChart = ({ data }) => {
  const [hovered, setHovered] = useState(null);
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const max = Math.max(1, ...entries.map(([, v]) => v));

  if (total === 0) {
    return <EmptyState message="Aún no has recibido postulaciones." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {entries.map(([status, count], i) => {
        const meta = STATUS_COLORS[status] || { color: CHART_MUTED, icon: '' };
        const pct = (count / max) * 100;
        const isHovered = hovered === i;
        return (
          <div
            key={status}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            tabIndex={0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', outline: 'none' }}
          >
            <div style={{
              width: '130px',
              flexShrink: 0,
              fontSize: '12px',
              color: 'var(--text-primary)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <span style={{ color: meta.color, fontSize: '0.85rem' }}>{meta.icon}</span>
              {status}
            </div>
            <div style={{ flex: 1, position: 'relative', height: '22px', background: CHART_GRID, borderRadius: '4px' }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${Math.max(pct, count > 0 ? 3 : 0)}%`,
                background: meta.color,
                borderRadius: '0 4px 4px 0',
                opacity: isHovered ? 0.85 : 1,
                outline: isHovered ? `2px solid ${meta.color}` : 'none',
                outlineOffset: '1px',
                transition: 'opacity 0.15s'
              }} />
            </div>
            <div style={{ width: '28px', flexShrink: 0, textAlign: 'right', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {count}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Trend line/area chart: postulaciones en el tiempo ----------
const TREND_W = 640;
const TREND_H = 200;
const PAD_L = 32;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 28;

export const TrendChart = ({ data }) => {
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  const total = data.reduce((s, d) => s + d.count, 0);
  const max = Math.max(1, ...data.map(d => d.count));
  const innerW = TREND_W - PAD_L - PAD_R;
  const innerH = TREND_H - PAD_T - PAD_B;

  const xFor = (i) => PAD_L + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2);
  const yFor = (v) => PAD_T + innerH - (v / max) * innerH;

  const linePoints = data.map((d, i) => `${xFor(i)},${yFor(d.count)}`).join(' ');
  const areaPoints = `${PAD_L},${PAD_T + innerH} ${linePoints} ${xFor(data.length - 1)},${PAD_T + innerH}`;

  const yTicks = [0, Math.ceil(max / 2), max].filter((v, i, arr) => arr.indexOf(v) === i);

  const handleMove = (e) => {
    const svg = svgRef.current;
    if (!svg || data.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = TREND_W / rect.width;
    const svgX = (e.clientX - rect.left) * scaleX;
    let nearest = 0;
    let best = Infinity;
    data.forEach((d, i) => {
      const dist = Math.abs(xFor(i) - svgX);
      if (dist < best) { best = dist; nearest = i; }
    });
    setHoverIdx(nearest);
  };

  if (total === 0) {
    return <EmptyState message="No hay postulaciones en los últimos 30 días." />;
  }

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;
  const tooltipLeft = hoverIdx !== null ? (xFor(hoverIdx) / TREND_W) * 100 : 0;
  const flipTooltip = tooltipLeft > 70;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${TREND_W} ${TREND_H}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Gridlines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={TREND_W - PAD_R} y1={yFor(t)} y2={yFor(t)} stroke={CHART_GRID} strokeWidth="1" />
            <text x={PAD_L - 8} y={yFor(t) + 3} textAnchor="end" fontSize="10" fill={CHART_MUTED}>{t}</text>
          </g>
        ))}

        {/* X labels: first, middle, last */}
        {[0, Math.floor((data.length - 1) / 2), data.length - 1].map((i, k) => (
          <text key={k} x={xFor(i)} y={TREND_H - 8} textAnchor="middle" fontSize="9" fill={CHART_MUTED}>
            {new Date(data[i].date + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
          </text>
        ))}

        {/* Area fill */}
        <polygon points={areaPoints} fill={CHART_SEQUENTIAL} opacity="0.1" />

        {/* Line */}
        <polyline points={linePoints} fill="none" stroke={CHART_SEQUENTIAL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Crosshair */}
        {hovered && (
          <>
            <line x1={xFor(hoverIdx)} x2={xFor(hoverIdx)} y1={PAD_T} y2={PAD_T + innerH} stroke={CHART_MUTED} strokeWidth="1" strokeDasharray="2,2" />
            <circle cx={xFor(hoverIdx)} cy={yFor(hovered.count)} r="5" fill={CHART_SEQUENTIAL} stroke={CHART_SURFACE} strokeWidth="2" />
          </>
        )}

        {/* End marker */}
        <circle cx={xFor(data.length - 1)} cy={yFor(data[data.length - 1].count)} r="4" fill={CHART_SEQUENTIAL} stroke={CHART_SURFACE} strokeWidth="2" />
      </svg>

      {hovered && (
        <div style={{
          position: 'absolute',
          top: '4px',
          left: `${tooltipLeft}%`,
          transform: flipTooltip ? 'translateX(-100%)' : 'translateX(0)',
          background: CHART_INK,
          color: 'white',
          padding: '0.4rem 0.6rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ fontWeight: 700 }}>{hovered.count} postulación{hovered.count !== 1 ? 'es' : ''}</div>
          <div style={{ opacity: 0.8 }}>
            {new Date(hovered.date + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div style={{
    padding: '2rem 1rem',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem'
  }}>
    {message}
  </div>
);
