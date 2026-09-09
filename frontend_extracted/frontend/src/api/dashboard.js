import adminClient from './adminClient'

// Serializa el rango de fechas a query params, omitiendo los vacíos.
function dateParams({ fecha_inicio, fecha_fin } = {}) {
  const params = {}
  if (fecha_inicio) params.fecha_inicio = fecha_inicio
  if (fecha_fin) params.fecha_fin = fecha_fin
  return params
}

export function getResumen(range) {
  return adminClient.get('/api/dashboard/resumen', { params: dateParams(range) })
}

export function getEstadisticas(range) {
  return adminClient.get('/api/dashboard/estadisticas', { params: dateParams(range) })
}
