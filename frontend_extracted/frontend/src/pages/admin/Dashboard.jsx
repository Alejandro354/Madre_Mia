import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'

import { adminErrors } from '../../api/adminClient'
import { getEstadisticas, getResumen } from '../../api/dashboard'
import Alert from '../../components/Alert'
import Topbar from '../../components/Topbar'
import BarChart from '../../components/admin/BarChart'
import ChartCard from '../../components/admin/ChartCard'
import DateRangeFilter from '../../components/admin/DateRangeFilter'
import DonutChart from '../../components/admin/DonutChart'
import StatCard from '../../components/admin/StatCard'

const emptyRange = { fecha_inicio: '', fecha_fin: '' }

export default function Dashboard({ domain }) {
  const [range, setRange] = useState(emptyRange)
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
      setError(adminErrors(err).general)
    } finally {
      setLoading(false)
    }
  }, [])

  // Recarga indicadores, gráficos y tablas al cambiar el rango (sin refrescar).
  useEffect(() => {
    load(range)
  }, [range, load])

  const prac = resumen?.practicantes
  const vac = resumen?.vacantes
  const post = resumen?.postulaciones
  const docs = resumen?.documentos
  const prom = stats?.promedios?.global

  if (!domain) {
    return (
      <>
        <Topbar
          title="Centro de reportes"
          subtitle="Selecciona el sistema que quieres explorar."
          showUserMenu={false}
        />
        <div className="page page--wide">
          <div className="domain-chooser">
            <div className="domain-chooser-copy">
              <span className="domain-chooser-kicker">ANÁLISIS OPERATIVO</span>
              <h1>Elige una base de datos</h1>
              <p>Abre una vista dedicada con indicadores, gráficos y reportes ampliados.</p>
            </div>
            <div className="domain-chooser-grid">
              <Link className="domain-card domain-card--red" to="/admin/practicantes">
                <span className="domain-card-index">01</span>
                <span className="domain-card-title">Practicantes</span>
                <span className="domain-card-description">Seguimiento académico, documentos y rendimiento.</span>
                <span className="domain-card-action">Abrir panel →</span>
              </Link>
              <Link className="domain-card domain-card--blue" to="/admin/practicaya">
                <span className="domain-card-index">02</span>
                <span className="domain-card-title">Practicaya</span>
                <span className="domain-card-description">Vacantes, postulaciones y comunicación.</span>
                <span className="domain-card-action">Abrir panel →</span>
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const isPracticantes = domain === 'practicantes'

  return (
    <>
      <Topbar
        title={isPracticantes ? 'Panel de practicantes' : 'Panel de Practicaya'}
        subtitle={isPracticantes ? 'Rendimiento académico y documentación.' : 'Actividad de vacantes y postulaciones.'}
        showUserMenu={false}
      />

      <div className="page page--wide">
        <Alert message={error} />

        <div className="admin-back-row">
          <Link className="admin-back-link" to="/admin/dashboard">
            <span aria-hidden="true">←</span> Volver al Dashboard
          </Link>
        </div>

        <DateRangeFilter value={range} onChange={setRange} />

        <div className="domain-page-actions">
          <Link className="domain-report-link" to={`/admin/${domain}/reportes`}>
            Ver reportes detallados <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* --- Indicadores --- */}
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

        {loading && <p className="perf-note">Actualizando datos…</p>}

        {/* --- Gráficos --- */}
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
    </>
  )
}
