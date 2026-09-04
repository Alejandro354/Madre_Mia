import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { deleteApplication, getApplications } from '../api/applications'
import { extractErrors } from '../api/client'
import Alert from '../components/Alert'
import ConfirmModal from '../components/ConfirmModal'
import { ApplicationsSkeleton } from '../components/Loaders'
import Topbar from '../components/Topbar'
import { ChevronRightIcon, SearchIcon, TrashIcon } from '../components/icons'
import { tileColor, tileInitial } from '../utils/tileColor'

/**
 * El backend guarda `estado` como texto libre (por defecto "Enviada") y todavía
 * no hay flujo que lo cambie. Agrupamos los valores conocidos en tres cubos para
 * las pestañas; lo no resuelto cuenta como "en revisión".
 */
const TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'review', label: 'En revisión' },
  { key: 'accepted', label: 'Aceptadas' },
  { key: 'rejected', label: 'Rechazadas' },
]

function bucketOf(estado = '') {
  const e = estado.toLowerCase()
  if (e.startsWith('acepta')) return 'accepted'
  if (e.startsWith('rechaza')) return 'rejected'
  return 'review'
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function Applications() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [general, setGeneral] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteItem, setDeleteItem] = useState(null)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState('todas')
  const [query, setQuery] = useState('')

  useEffect(() => {
    getApplications()
      .then((res) => setApplications(res.data.applications))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return applications.filter((a) => {
      if (tab !== 'todas' && bucketOf(a.estado) !== tab) return false
      if (q && !`${a.cargo} ${a.empresa}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [applications, tab, query])

  async function handleDelete() {
    setGeneral('')
    setSuccess('')
    setBusy(true)
    try {
      await deleteApplication(deleteItem.id)
      setApplications((prev) => prev.filter((a) => a.id !== deleteItem.id))
      setDeleteItem(null)
      setSuccess('Postulación eliminada')
    } catch (err) {
      setDeleteItem(null)
      setGeneral(extractErrors(err).general || 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <ApplicationsSkeleton />
  }

  return (
    <>
      <Topbar title="Mis postulaciones" subtitle="Sigue el estado de tus postulaciones.">
        <div className="search-field">
          <span className="search-field-icon">
            <SearchIcon />
          </span>
          <input
            className="search-field-input"
            type="search"
            placeholder="Buscar por cargo o empresa"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar postulaciones"
          />
        </div>
      </Topbar>

      <div className="page page--wide">
        <Alert message={general} />
        <Alert message={success} type="success" />

        <div className="panel">
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`tab${tab === t.key ? ' tab--active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              Aún no te has postulado a ninguna vacante.{' '}
              <Link to="/vacantes">Ver vacantes</Link>
            </div>
          ) : visible.length === 0 ? (
            <div className="empty-state">Ninguna postulación coincide con este filtro</div>
          ) : (
            <div className="app-rows">
              {visible.map((a) => (
                <div className="app-row" key={a.id}>
                  <span
                    className="app-row-logo"
                    style={{
                      backgroundColor: `${tileColor(a.empresa)}1A`,
                      color: tileColor(a.empresa),
                    }}
                  >
                    {tileInitial(a.empresa)}
                  </span>

                  <div className="app-row-body">
                    <h3 className="app-row-cargo">{a.cargo}</h3>
                    <p className="app-row-meta">
                      {a.empresa} · Postulado el {formatDate(a.created_at)}
                    </p>
                  </div>

                  <div className="app-row-actions">
                    <span className={`status-pill status-pill--${bucketOf(a.estado)}`}>
                      {a.estado}
                    </span>
                    <button
                      type="button"
                      className="pf-action pf-action--danger"
                      onClick={() => setDeleteItem(a)}
                      title="Eliminar postulación"
                      aria-label="Eliminar postulación"
                    >
                      <TrashIcon />
                    </button>
                    <button
                      type="button"
                      className="app-row-go"
                      onClick={() => navigate(`/vacantes/${a.vacancy_id}`)}
                      title="Ver vacante"
                      aria-label={`Ver la vacante ${a.cargo}`}
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {deleteItem && (
          <ConfirmModal
            title="Eliminar postulación"
            message={`¿Seguro que deseas eliminar tu postulación a "${deleteItem.cargo}" en ${deleteItem.empresa}? Podrás volver a postularte más adelante.`}
            confirmText={busy ? 'Eliminando...' : 'Eliminar'}
            onConfirm={handleDelete}
            onCancel={() => setDeleteItem(null)}
          />
        )}
      </div>
    </>
  )
}
