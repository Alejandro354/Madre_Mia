import { useState } from 'react'
import Icon from '../../ui/Icon.jsx'
import { descargarReporte } from '../../../api/reportesApi.js'

export default function DownloadButton({ tipo, filters, onError }) {
  const [busy, setBusy] = useState(false)

  async function handle() {
    setBusy(true)
    try {
      await descargarReporte(tipo, 'pdf', filters)
    } catch {
      onError?.('No se pudo generar la descarga. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" className="download-btn" disabled={busy} onClick={handle}>
      <Icon name="checklist" size={16} />
      {busy ? 'Generando…' : 'Exportar PDF'}
    </button>
  )
}
