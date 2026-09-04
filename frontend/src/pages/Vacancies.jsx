import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { apply } from '../api/applications'
import { addFavorite, removeFavorite } from '../api/favorites'
import { getVacancies } from '../api/vacancies'
import Alert from '../components/Alert'
import PerfNote from '../components/PerfNote'
import Topbar from '../components/Topbar'
import VacancyCard from '../components/VacancyCard'
import { SearchIcon } from '../components/icons'
import { now, takeLoginTime } from '../utils/perf'

const ALL = ''

/** Valores únicos de un campo, ordenados, para poblar los selectores. */
function optionsFor(vacancies, field) {
  return [...new Set(vacancies.map((v) => v[field]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  )
}

export default function Vacancies() {
  const navigate = useNavigate()
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)
  const [general, setGeneral] = useState('')
  const [success, setSuccess] = useState('')
  const [missingProfile, setMissingProfile] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const [query, setQuery] = useState('')
  const [empresa, setEmpresa] = useState(ALL)
  const [ubicacion, setUbicacion] = useState(ALL)
  const [jornada, setJornada] = useState(ALL)
  const [modalidad, setModalidad] = useState(ALL)
  const [orden, setOrden] = useState('reciente')

  // Criterio 3.4: se mide desde antes de pedir los datos hasta que las
  // tarjetas quedan pintadas, no solo la petición HTTP.
  const t0 = useRef(now())
  const [loadMs, setLoadMs] = useState(null)
  // Inicializador de useState: se ejecuta una sola vez y consume el valor
  // guardado por Login.jsx (leerlo lo borra).
  const [loginMs] = useState(takeLoginTime)

  useEffect(() => {
    getVacancies()
      .then((res) => setVacancies(res.data.vacancies))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading || loadMs !== null) return
    // rAF corre después del pintado, así el número incluye el render.
    const id = requestAnimationFrame(() => setLoadMs(now() - t0.current))
    return () => cancelAnimationFrame(id)
  }, [loading, loadMs])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = vacancies.filter((v) => {
      if (q && !`${v.cargo} ${v.empresa}`.toLowerCase().includes(q)) return false
      if (empresa && v.empresa !== empresa) return false
      if (ubicacion && v.ubicacion !== ubicacion) return false
      if (jornada && v.jornada !== jornada) return false
      if (modalidad && v.modalidad !== modalidad) return false
      return true
    })
    return filtered.sort((a, b) => {
      const da = new Date(a.fecha_publicacion)
      const db = new Date(b.fecha_publicacion)
      return orden === 'reciente' ? db - da : da - db
    })
  }, [vacancies, query, empresa, ubicacion, jornada, modalidad, orden])

  function patch(id, changes) {
    setVacancies((prev) => prev.map((v) => (v.id === id ? { ...v, ...changes } : v)))
  }

  async function handleFavorite(vacancy) {
    setGeneral('')
    setSuccess('')
    // Optimista: el botón responde de inmediato y se revierte si falla.
    patch(vacancy.id, { guardada: !vacancy.guardada })
    try {
      if (vacancy.guardada) {
        await removeFavorite(vacancy.id)
      } else {
        await addFavorite(vacancy.id)
      }
    } catch {
      patch(vacancy.id, { guardada: vacancy.guardada })
      setGeneral('Ocurrió un error. Intenta de nuevo.')
    }
  }

  async function handleApply(vacancy) {
    setGeneral('')
    setSuccess('')
    setMissingProfile(false)
    setBusyId(vacancy.id)
    try {
      await apply(vacancy.id)
      patch(vacancy.id, { aplicada: true })
      setSuccess('Postulación enviada con éxito')
    } catch (err) {
      const payload = err.response?.data
      if (err.response?.status === 409) {
        patch(vacancy.id, { aplicada: true })
        setGeneral('Ya te has postulado a esta vacante')
      } else if (payload?.errors?.missing_section) {
        setMissingProfile(true)
      } else {
        setGeneral(payload?.errors?.general || 'Ocurrió un error. Intenta de nuevo.')
      }
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <div className="page-loading">Cargando...</div>
  }

  return (
    <>
      <Topbar title="Vacantes" subtitle="Encuentra oportunidades que impulsen tu futuro.">
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
            aria-label="Buscar vacantes"
          />
        </div>
      </Topbar>

      <div className="page page--wide">
        <Alert message={general} />
        <Alert message={success} type="success" />
        {missingProfile && (
          <Alert
            message={
              <>
                Completa tu perfil antes de postularte. <Link to="/perfil">Ir a mi perfil</Link>
              </>
            }
            type="error"
          />
        )}

        <div className="panel">
          <div className="vac-filters">
            <select
              className="vac-select"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              aria-label="Filtrar por empresa"
            >
              <option value={ALL}>Todas las categorías</option>
              {optionsFor(vacancies, 'empresa').map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            <select
              className="vac-select"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              aria-label="Filtrar por ubicación"
            >
              <option value={ALL}>Ubicación</option>
              {optionsFor(vacancies, 'ubicacion').map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            <select
              className="vac-select"
              value={jornada}
              onChange={(e) => setJornada(e.target.value)}
              aria-label="Filtrar por tipo de empleo"
            >
              <option value={ALL}>Tipo de empleo</option>
              {optionsFor(vacancies, 'jornada').map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            <select
              className="vac-select"
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              aria-label="Filtrar por modalidad"
            >
              <option value={ALL}>Modalidad</option>
              {optionsFor(vacancies, 'modalidad').map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            <select
              className="vac-select vac-select--sort"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              aria-label="Ordenar"
            >
              <option value="reciente">Más reciente</option>
              <option value="antigua">Más antigua</option>
            </select>
          </div>

          <PerfNote
            items={[
              { label: 'cargadas en', ms: loadMs },
              { label: 'sesión iniciada en', ms: loginMs },
            ]}
          >
            {visible.length} {visible.length === 1 ? 'vacante' : 'vacantes'}
          </PerfNote>

          {visible.length === 0 ? (
            <div className="empty-state">
              {vacancies.length === 0
                ? 'No hay vacantes disponibles en este momento'
                : 'Ninguna vacante coincide con los filtros'}
            </div>
          ) : (
            <div className="vac-grid">
              {visible.map((v) => (
                <VacancyCard
                  key={v.id}
                  vacancy={v}
                  busy={busyId === v.id}
                  onOpen={() => navigate(`/vacantes/${v.id}`)}
                  onApply={() => handleApply(v)}
                  onFavorite={() => handleFavorite(v)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
