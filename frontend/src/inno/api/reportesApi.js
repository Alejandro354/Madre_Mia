import reportsClient from './reportsClient'

// Construye el objeto de params limpiando valores vacíos/undefined.
function cleanParams(filters = {}) {
  const params = {}
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) params[k] = v
  })
  return params
}

export function getTipos() {
  return reportsClient.get('/api/reportes/tipos')
}

export function getReporte(tipo, filters) {
  return reportsClient.get(`/api/reportes/${tipo}`, { params: cleanParams(filters) })
}

/**
 * Descarga el reporte respetando los mismos filtros usando una respuesta blob.
 */
export async function descargarReporte(tipo, formato = 'pdf', filters) {
  const res = await reportsClient.get(`/api/reportes/${tipo}/exportar`, {
    params: cleanParams({ ...filters, formato }),
    responseType: 'blob',
  })

  const disp = res.headers['content-disposition'] || ''
  const match = disp.match(/filename="?([^"]+)"?/)
  const filename = match ? match[1] : `reporte_${tipo}.pdf`

  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
