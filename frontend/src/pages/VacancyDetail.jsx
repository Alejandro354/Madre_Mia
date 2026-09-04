import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { apply } from '../api/applications'
import { addFavorite, removeFavorite } from '../api/favorites'
import { getVacancy } from '../api/vacancies'
import Alert from '../components/Alert'
import Topbar from '../components/Topbar'
import {
  ArrowLeftIcon,
  BookmarkIcon,
  CalendarIcon,
  ClockIcon,
  PinIcon,
  ScreenIcon,
  SparkIcon,
} from '../components/icons'
import { splitItems, splitSentences } from '../utils/text'
import { tileColor, tileInitial } from '../utils/tileColor'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** "Publicada hoy" / "Publicada ayer" / "Publicada hace N días". */
function publishedLabel(iso) {
  if (!iso) return ''
  const published = new Date(iso)
  if (Number.isNaN(published.getTime())) return ''

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(published)) / (24 * 60 * 60 * 1000),
  )

  if (days <= 0) return 'Publicada hoy'
  if (days === 1) return 'Publicada ayer'
  if (days < 30) return `Publicada hace ${days} días`
  return `Publicada el ${formatDate(iso)}`
}

function RoleFact({ Icon, label, value }) {
  if (!value) return null
  return (
    <div className="vd-fact">
      <span className="vd-fact-icon">
        <Icon />
      </span>
      <div>
        <span className="vd-fact-label">{label}</span>
        <span className="vd-fact-value">{value}</span>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="vd-info-row">
      <span className="vd-info-label">{label}</span>
      <span className="vd-info-value">{value}</span>
    </div>
  )
}

export default function VacancyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vacancy, setVacancy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [general, setGeneral] = useState('')
  const [success, setSuccess] = useState('')
  const [missingSection, setMissingSection] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getVacancy(id)
      .then((res) => setVacancy(res.data.vacancy))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  async function handleFavorite() {
    setGeneral('')
    setSuccess('')
    try {
      if (vacancy.guardada) {
        await removeFavorite(vacancy.id)
        setSuccess('Vacante quitada de guardados')
      } else {
        await addFavorite(vacancy.id)
        setSuccess('Vacante guardada')
      }
      setVacancy({ ...vacancy, guardada: !vacancy.guardada })
    } catch {
      setGeneral('Ocurrió un error. Intenta de nuevo.')
    }
  }

  async function handleApply() {
    setGeneral('')
    setSuccess('')
    setMissingSection(null)
    setBusy(true)
    try {
      await apply(vacancy.id)
      setSuccess('Postulación enviada con éxito')
      setVacancy({ ...vacancy, aplicada: true })
    } catch (err) {
      const payload = err.response?.data
      if (err.response?.status === 409) {
        setGeneral('Ya te has postulado a esta vacante')
        setVacancy({ ...vacancy, aplicada: true })
      } else if (payload?.errors?.missing_section) {
        setMissingSection(payload.errors.missing_section)
        setGeneral('Completa tu perfil antes de postularte')
      } else {
        setGeneral(payload?.errors?.general || 'Ocurrió un error. Intenta de nuevo.')
      }
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="page-loading">Cargando...</div>
  }

  if (!vacancy) {
    return (
      <>
        <Topbar title="Vacantes" subtitle="Encuentra oportunidades que impulsen tu futuro." />
        <div className="page page--wide">
          <div className="empty-state">
            Vacante no encontrada. <Link to="/vacantes">Ver vacantes</Link>
          </div>
        </div>
      </>
    )
  }

  const requisitos = splitSentences(vacancy.requisitos)
  const beneficios = splitItems(vacancy.beneficios)
  const skills = vacancy.skills || []

  return (
    <>
      <Topbar title="Vacantes" subtitle="Encuentra oportunidades que impulsen tu futuro." />

      <div className="page page--wide">
        <nav className="vd-crumbs" aria-label="Ruta de navegación">
          <button
            type="button"
            className="vd-back"
            onClick={() => navigate('/vacantes')}
            aria-label="Volver a vacantes"
          >
            <ArrowLeftIcon />
          </button>
          <Link to="/vacantes">Vacantes</Link>
          <span className="vd-crumbs-sep">/</span>
          <span className="vd-crumbs-current">{vacancy.cargo}</span>
        </nav>

        <Alert message={general} />
        <Alert message={success} type="success" />
        {missingSection && (
          <Alert
            message={
              <>
                Completa tu {missingSection === 'perfil' ? 'perfil' : 'portafolio'} antes de
                postularte. <Link to="/perfil">Ir a mi perfil</Link>
              </>
            }
            type="error"
          />
        )}

        <div className="split-view split-view--main-first">
          <div className="split-view-main">
            <article className="card pv-card vd-main">
              <header className="vd-head">
                <span
                  className="vd-logo"
                  style={{ backgroundColor: tileColor(vacancy.empresa) }}
                >
                  {tileInitial(vacancy.empresa)}
                </span>

                <div className="vd-head-text">
                  <h2 className="vd-cargo">{vacancy.cargo}</h2>
                  <p className="vd-empresa">{vacancy.empresa}</p>
                  <p className="vd-ubicacion">
                    <PinIcon className="vd-pin" />
                    {vacancy.ubicacion}
                    <span className="vd-published">
                      {publishedLabel(vacancy.fecha_publicacion)}
                    </span>
                  </p>
                </div>

                <div className="vd-head-actions">
                  <button
                    type="button"
                    className={`vac-card-save${vacancy.guardada ? ' vac-card-save--on' : ''}`}
                    onClick={handleFavorite}
                    title={vacancy.guardada ? 'Quitar de guardados' : 'Guardar'}
                    aria-label={vacancy.guardada ? 'Quitar de guardados' : 'Guardar'}
                    aria-pressed={Boolean(vacancy.guardada)}
                  >
                    <BookmarkIcon filled={Boolean(vacancy.guardada)} />
                  </button>

                  <button
                    type="button"
                    className={`vd-apply${vacancy.aplicada ? ' vd-apply--done' : ''}`}
                    onClick={handleApply}
                    disabled={vacancy.aplicada || busy}
                  >
                    {vacancy.aplicada
                      ? 'Ya te has postulado'
                      : busy
                        ? 'Enviando...'
                        : 'Postularme'}
                  </button>
                </div>
              </header>

              {(vacancy.modalidad || vacancy.jornada) && (
                <div className="vd-tags">
                  {vacancy.modalidad && <span className="tag">{vacancy.modalidad}</span>}
                  {vacancy.jornada && <span className="tag">{vacancy.jornada}</span>}
                </div>
              )}

              <hr className="vd-rule" />

              <section className="vd-section">
                <h3 className="vd-section-title">Descripción del cargo</h3>
                <p className="vd-text">{vacancy.descripcion}</p>
              </section>

              {requisitos.length > 0 && (
                <section className="vd-section">
                  <h3 className="vd-section-title">Requisitos</h3>
                  <ul className="vd-list">
                    {requisitos.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="vd-panel-inner">
                <h3 className="vd-section-title">Sobre el rol</h3>
                <div className="vd-facts">
                  <RoleFact Icon={ClockIcon} label="Jornada" value={vacancy.jornada} />
                  <RoleFact Icon={ScreenIcon} label="Modalidad" value={vacancy.modalidad} />
                  <RoleFact
                    Icon={CalendarIcon}
                    label="Fecha límite"
                    value={formatDate(vacancy.fecha_limite)}
                  />
                </div>

                {skills.length > 0 && (
                  <>
                    <h3 className="vd-section-title vd-section-title--spaced">
                      Skills que te harán exitoso/a
                    </h3>
                    <div className="vd-skills">
                      {skills.map((s) => (
                        <span className="vd-skill" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </article>
          </div>

          <aside className="split-view-aside">
            <section className="card pv-card">
              <h3 className="pv-card-title">Lo que necesitas saber</h3>
              <div className="vd-info">
                <InfoRow label="Publicado" value={publishedLabel(vacancy.fecha_publicacion)} />
                <InfoRow label="Experiencia" value={vacancy.experiencia} />
                <InfoRow label="Nivel de estudios" value={vacancy.nivel_estudios} />
                <InfoRow label="Área" value={vacancy.area} />
                <InfoRow label="Industria" value={vacancy.industria} />
              </div>
            </section>

            {beneficios.length > 0 && (
              <section className="card pv-card">
                <h3 className="pv-card-title">Beneficios</h3>
                <div className="vd-benefits">
                  {beneficios.map((b) => (
                    <span className="vd-benefit" key={b}>
                      <SparkIcon />
                      {b}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
