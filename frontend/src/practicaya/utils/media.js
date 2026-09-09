// El backend guarda algunas imágenes como data URL/URL completa (logo/banner
// de empresa) y otras como el nombre de archivo subido a /uploads (foto de
// estudiante, portafolio). Esta función normaliza cualquiera de los dos casos
// a algo que sirva directo como `src`/`href`.
export function resolveMediaUrl(value) {
  if (!value) return null;
  if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/practicaya/uploads/')) {
    return value;
  }
  return `/practicaya/uploads/${value}`;
}
