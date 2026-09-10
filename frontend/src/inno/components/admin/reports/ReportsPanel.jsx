import { useCallback, useEffect, useState } from 'react'

import { reportsErrors } from '../../../api/reportsClient.js'
import { getEstadisticas, getResumen } from '../../../api/dashboardApi.js'
import { getReporte, getTipos } from '../../../api/reportesApi.js'
import BarChart from './BarChart.jsx'
import ChartCard from './ChartCard.jsx'
import DateRangeFilter from './DateRangeFilter.jsx'
import DonutChart from './DonutChart.jsx'
import DownloadButton from './DownloadButton.jsx'
import Pagination from './Pagination.jsx'
import ReportSelector, { reportLabel } from './ReportSelector.jsx'
import ReportTable from './ReportTable.jsx'
import StatCard from './StatCard.jsx'
import './reports.css'

const EMPTY_RANGE = { fecha_inicio: '', fecha_fin: '' }
const REPORT_LIMIT = 10
const DOMAIN_TYPES = {
  practicantes: ['practicantes', 'documentos', 'promedios'],
  practicaya: ['postulaciones', 'vacantes', 'mensajes'],
}

function DomainChooser({ onSelect }) {
  return (
    <div className="reports-domain-grid">
      <button type="button" className="reports-domain-card" onClick={() => onSelect('practicantes')}>
        <span className="reports-domain-index">01</span>
        <span className="reports-domain-title">Practicantes</span>
        <span className="reports-domain-description">Seguimiento académico, documentos y rendimiento.</span>
        <span className="reports-domain-action">Abrir panel →</span>
      </button>
      <button
        type="button"
        className="reports-domain-card reports-domain-card--blue"
        onClick={() => onSelect('practicaya')}
      >
        <span className="reports-domain-index">02</span>
        <span className="reports-domain-title">Practicaya</span>
        <span className="reports-domain-description">Vacantes, postulaciones y comunicación.</span>
        <span className="reports-domain-action">Abrir panel →</span>
      </button>
    </div>
  )
}

function DomainDashboard({ domain, onBack, onViewReports }) {
  const [range, setRange] = useState(EMPTY_RANGE)
  const [resumen, setResumen] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (r) => {
    setLoading(true)
    setError('')
    try {
      const [resR, statR] = await Promise.all([getResumen(r), getEstadisticas(r)])
      setResumen(resR.data)
      setStats(statR.data)
    } catch (err) {
      setError(reportsErrors(err).general)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(range)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  const isPracticantes = domain === 'practicantes'
  const prac = resumen?.practicantes
  const vac = resumen?.vacantes
  const post = resumen?.postulaciones
  const docs = resumen?.documentos
  const prom = stats?.promedios?.global

  return (
    <div>
      <button type="button" className="reports-back-link" onClick={onBack}>
        <span aria-hidden="true">←</span> Volver al selector
      </button>

      <div className="reports-toolbar-row">
        <DateRangeFilter value={range} onChange={setRange} />
        <button type="button" className="reports-link" onClick={onViewReports}>
          Ver reportes detallados <span aria-hidden="true">→</span>
        </button>
      </div>

      {error && <div className="reports-alert">{error}</div>}

      <div className="stat-grid">
        {isPracticantes ? (
          <>
            <StatCard label="Practicantes" value={prac?.total} hint={`${prac?.activos ?? 0} activos · ${prac?.inactivos ?? 0} inactivos`} accent="#FF1837" />
            <StatCard label="Documentos" value={docs?.total} hint={prom?.promedio_global != null ? `Promedio académico: ${prom.promedio_global}` : 'Sin evaluaciones'} accent="#F59E0B" />
            <StatCard label="Promedio general" value={prom?.promedio_global ?? '—'} hint={`${prom?.total_evaluados ?? 0} practicantes evaluados`} accent="#EC4899" />
          </>
        ) : (
          <>
            <StatCard label="Vacantes activas" value={vac?.activas} hint={`${vac?.total ?? 0} en total`} accent="#6366F1" />
            <StatCard label="Postulaciones" value={post?.total} hint={`${post?.por_estado?.length ?? 0} estados`} accent="#10B981" />
          </>
        )}
      </div>

      {loading && <p className="reports-note">Actualizando datos…</p>}

      <div className="chart-grid">
        {isPracticantes ? (
          <>
            <ChartCard title="Practicantes por cohorte" empty={!stats?.practicantes_por_cohorte?.length}><BarChart data={stats?.practicantes_por_cohorte || []} color="#6366F1" /></ChartCard>
            <ChartCard title="Practicantes por estado" empty={!stats?.practicantes_por_estado?.length}><BarChart data={stats?.practicantes_por_estado || []} color="#10B981" /></ChartCard>
            <ChartCard title="Documentos por periodo" subtitle="Por mes" empty={!stats?.documentos_por_periodo?.length}><BarChart data={stats?.documentos_por_periodo || []} color="#F59E0B" /></ChartCard>
            <ChartCard title="Promedio académico por cohorte" empty={!stats?.promedios?.por_cohorte?.length}><BarChart data={stats?.promedios?.por_cohorte || []} color="#EC4899" /></ChartCard>
          </>
        ) : (
          <>
            <ChartCard title="Postulaciones por estado" empty={!stats?.postulaciones_por_estado?.length}><DonutChart data={stats?.postulaciones_por_estado || []} /></ChartCard>
            <ChartCard title="Postulaciones por empresa" subtitle="Top 10" empty={!stats?.postulaciones_por_empresa?.length}><BarChart data={stats?.postulaciones_por_empresa || []} color="#0EA5E9" /></ChartCard>
          </>
        )}
      </div>
    </div>
  )
}

function DomainReports({ domain, onBack }) {
  const domainTypes = DOMAIN_TYPES[domain]
  const [tipos, setTipos] = useState(domainTypes)
  const [tipo, setTipo] = useState(domainTypes[0])
  const [range, setRange] = useState(EMPTY_RANGE)
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getTipos()
      .then((res) => {
        const available = res.data.tipos.filter((t) => domainTypes.includes(t))
        setTipos(available)
        if (!available.includes(tipo)) setTipo(available[0])
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getReporte(tipo, { ...range, page, limit: REPORT_LIMIT })
      setResult(res.data)
    } catch (err) {
      setError(reportsErrors(err).general)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [tipo, range, page])

  useEffect(() => {
    load()
  }, [load])

  function handleTipo(t) {
    setTipo(t)
    setPage(1)
  }
  function handleRange(r) {
    setRange(r)
    setPage(1)
  }

  return (
    <div>
      <button type="button" className="reports-back-link" onClick={onBack}>
        <span aria-hidden="true">←</span> Volver al panel
      </button>

      {error && <div className="reports-alert">{error}</div>}

      <ReportSelector tipos={tipos} value={tipo} onChange={handleTipo} />

      <div className="reports-toolbar-row">
        <DateRangeFilter value={range} onChange={handleRange} />
        <DownloadButton tipo={tipo} filters={range} onError={setError} />
      </div>

      <p className="report-title">{reportLabel(tipo)}</p>

      <ReportTable columnas={result?.columnas || []} datos={result?.datos || []} loading={loading} />

      {result && (
        <Pagination
          page={result.pagina_actual}
          totalPaginas={result.total_paginas}
          total={result.total_registros}
          onChange={setPage}
        />
      )}
    </div>
  )
}

export default function ReportsPanel() {
  const [domain, setDomain] = useState(null)
  const [view, setView] = useState('dashboard')

  if (!domain) {
    return (
      <div className="reports-panel">
        <p className="reports-panel__intro">Selecciona el sistema que quieres explorar.</p>
        <DomainChooser onSelect={(d) => { setDomain(d); setView('dashboard') }} />
      </div>
    )
  }

  return (
    <div className="reports-panel">
      {view === 'dashboard' ? (
        <DomainDashboard
          domain={domain}
          onBack={() => setDomain(null)}
          onViewReports={() => setView('reportes')}
        />
      ) : (
        <DomainReports domain={domain} onBack={() => setView('dashboard')} />
      )}
    </div>
  )
}
