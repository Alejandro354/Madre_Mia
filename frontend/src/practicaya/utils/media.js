// El backend guarda las imágenes en tres formas distintas: como data URL o URL
// completa (logo y banner de empresa), como el nombre del archivo subido (foto
// de estudiante, portafolio) y en algunos registros viejos como la ruta
// "/uploads/...". Esta función normaliza las tres a algo que sirva directo como
// `src`/`href`, agregando el prefijo /practicaya con el que el gateway sirve
// este backend.
export function resolveMediaUrl(value) {
  if (!value) return null;
  if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  if (value.startsWith('/practicaya/uploads/')) return value;
  if (value.startsWith('/uploads/')) return `/practicaya${value}`;
  return `/practicaya/uploads/${value}`;
}
