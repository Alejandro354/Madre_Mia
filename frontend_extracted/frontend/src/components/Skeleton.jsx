export function SkeletonLine({ width = '100%', height = 14, style, className = '' }) {
  return (
    <span
      className={`sk sk--line${className ? ` ${className}` : ''}`}
      style={{ width, height, ...style }}
    />
  )
}

export function SkeletonBlock({ width = '100%', height = 40, radius = 9, style, className = '' }) {
  return (
    <span
      className={`sk sk--block${className ? ` ${className}` : ''}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

export function SkeletonCircle({ size = 46, style, className = '' }) {
  return (
    <span
      className={`sk sk--circle${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, ...style }}
    />
  )
}

export function SkeletonChip({ width = 72, height = 24, style, className = '' }) {
  return (
    <span
      className={`sk sk--chip${className ? ` ${className}` : ''}`}
      style={{ width, height, ...style }}
    />
  )
}
