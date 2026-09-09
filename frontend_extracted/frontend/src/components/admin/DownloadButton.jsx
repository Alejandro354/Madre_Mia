import { useState } from 'react'

import { descargarReporte } from '../../api/reportes'
import { DocIcon } from '../icons'

/**
 * Descarga el reporte PDF respetando los mismos filtros de la tabla.
 * `filters` incluye rango de fechas y filtros de categoría (sin page/limit).
 */
export default function DownloadButton({ tipo, filters, onError }) {
  const [busy, setBusy] = useState('')

  async function handle(formato) {
    setBusy(formato)
    try {
      await descargarReporte(tipo, formato, filters)
    } catch {
      onError?.('No se pudo generar la descarga. Intenta de nuevo.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="download-group">
      <button
        type="button"
        className="btn btn--secondary download-btn"
        disabled={busy}
        onClick={() => handle('pdf')}
      >
        <DocIcon />
        {busy === 'pdf' ? 'Generando…' : 'PDF'}
      </button>
    </div>
  )
}
