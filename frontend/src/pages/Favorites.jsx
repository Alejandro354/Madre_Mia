import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getFavorites, removeFavorite } from '../api/favorites'
import Button from '../components/Button'
import Topbar from '../components/Topbar'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function Favorites() {
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    getFavorites()
      .then((res) => setVacancies(res.data.vacancies))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleRemove(vacancyId) {
    await removeFavorite(vacancyId)
    load()
  }

  if (loading) {
    return <div className="page-loading">Cargando...</div>
  }

  if (vacancies.length === 0) {
    return (
      <>
        <Topbar title="Guardados" subtitle="Las vacantes que marcaste para después." />
        <div className="page">
          <div className="empty-state">
            No tienes vacantes guardadas. <Link to="/vacantes">Ver vacantes</Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar title="Guardados" subtitle="Las vacantes que marcaste para después." />
      <div className="page">
        <div className="vacancy-list">
          {vacancies.map((v) => (
            <div className="vacancy-card" key={v.id}>
              <div className="vacancy-card-top">
                <Link to={`/vacantes/${v.id}`} className="vacancy-cargo">
                  {v.cargo}
                </Link>
                <span className="vacancy-date">{formatDate(v.fecha_publicacion)}</span>
              </div>
              <div className="vacancy-empresa">{v.empresa}</div>
              <div className="vacancy-ubicacion">{v.ubicacion}</div>
              <div className="inline-actions">
                <Button variant="secondary" onClick={() => handleRemove(v.id)}>
                  Quitar de guardados
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
