// Paleta fija para los tiles de empresa. El índice sale de un hash del nombre,
// así una misma empresa siempre recibe el mismo color (no hay campo de logo).
const TILE_COLORS = [
  '#F97316',
  '#6366F1',
  '#8B5CF6',
  '#0EA5E9',
  '#10B981',
  '#EC4899',
  '#F59E0B',
  '#EF4444',
]

export function tileColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 100000
  }
  return TILE_COLORS[hash % TILE_COLORS.length]
}

export function tileInitial(name = '') {
  return (name || '?').charAt(0).toUpperCase()
}
