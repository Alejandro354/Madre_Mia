import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { adminErrors } from '../../api/adminClient'
import { getReporte, getTipos } from '../../api/reportes'
import Alert from '../../components/Alert'
import Topbar from '../../components/Topbar'
import DateRangeFilter from '../../components/admin/DateRangeFilter'
import DownloadButton from '../../components/admin/DownloadButton'
import Pagination from '../../components/admin/Pagination'
import ReportSelector, { reportLabel } from '../../components/admin/ReportSelector'
import ReportTable from '../../components/admin/ReportTable'

const DEFAULT_TIPOS = [
  'practicantes',
  'postulaciones',
  'vacantes',
  'documentos',
  'promedios',
  'mensajes',
]
const LIMIT = 10
const DOMAIN_TYPES = {
  practicantes: ['practicantes', 'documentos', 'promedios'],
  practicaya: ['postulaciones', 'vacantes', 'mensajes'],
}

export default function Reports({ domain }) {
  const domainTypes = domain ? DOMAIN_TYPES[domain] : DEFAULT_TIPOS
  const [tipos, setTipos] = useState(domainTypes)
  const [tipo, setTipo] = useState(domainTypes[0])
  const [range, setRange] = useState({ fecha_inicio: '', fecha_fin: '' })
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Carga la lista de tipos disponibles desde el backend (fuente de verdad).
  useEffect(() => {
    getTipos()
      .then((res) => {
        const available = domain
          ? res.data.tipos.filter((reportType) => domainTypes.includes(reportType))
          : res.data.tipos
        setTipos(available)
        if (!available.includes(tipo)) setTipo(available[0])
      })
      .catch(() => {})
  }, [domain])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getReporte(tipo, { ...range, page, limit: LIMIT })
      setResult(res.data)
    } catch (err) {
      setError(adminErrors(err).general)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [tipo, range, page])

  useEffect(() => {
    load()
  }, [load])

  // Al cambiar tipo o filtros, vuelve a la página 1.
  function handleTipo(t) {
    setTipo(t)
    setPage(1)
  }
  function handleRange(r) {
    setRange(r)
    setPage(1)
  }

  return (
    <>
      <Topbar
        title={domain === 'practicantes' ? 'Reportes de practicantes' : domain === 'practicaya' ? 'Reportes de Practicaya' : 'Reportes'}
        subtitle="Explora los datos del dominio seleccionado y exporta sus resultados."
        showUserMenu={false}
      />

      <div className="page page--wide">
        <Alert message={error} />

        <div className="admin-back-row">
          <Link className="admin-back-link" to="/admin/dashboard">
            <span aria-hidden="true">←</span> Volver al Dashboard
          </Link>
        </div>

        <div className="panel">
          <ReportSelector tipos={tipos} value={tipo} onChange={handleTipo} />

          <div className="report-toolbar">
            <DateRangeFilter value={range} onChange={handleRange} />
            <DownloadButton tipo={tipo} filters={range} onError={setError} />
          </div>

          <p className="report-title">{reportLabel(tipo)}</p>

          <ReportTable
            columnas={result?.columnas || []}
            datos={result?.datos || []}
            loading={loading}
          />

          {result && (
            <Pagination
              page={result.pagina_actual}
              totalPaginas={result.total_paginas}
              total={result.total_registros}
              onChange={setPage}
            />
          )}
        </div>
      </div>
    </>
  )
}
