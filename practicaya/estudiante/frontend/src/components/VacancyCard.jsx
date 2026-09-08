import { tileColor, tileInitial } from '../utils/tileColor'
import { BookmarkIcon, CheckIcon, PinIcon } from './icons'

/** "Publicado hoy" / "Publicado ayer" / "Publicado hace N días". */
function publishedLabel(iso) {
  if (!iso) return ''
  const published = new Date(iso)
  if (Number.isNaN(published.getTime())) return ''

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(published)) / (24 * 60 * 60 * 1000),
  )

  if (days <= 0) return 'Publicado hoy'
  if (days === 1) return 'Publicado ayer'
  if (days < 30) return `Publicado hace ${days} días`
  return `Publicado el ${published.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}`
}

export default function VacancyCard({ vacancy, busy, onOpen, onApply, onFavorite }) {
  const { cargo, empresa, ubicacion, modalidad, jornada, descripcion, guardada, aplicada } =
    vacancy

  return (
    <article className="vac-card">
      <button
        type="button"
        className="vac-card-main"
        onClick={onOpen}
        aria-label={`Ver detalle de ${cargo}`}
      >
        <div className="vac-card-head">
          <span className="vac-card-logo" style={{ backgroundColor: tileColor(empresa) }}>
            {tileInitial(empresa)}
          </span>
          <div className="vac-card-headings">
            <h3 className="vac-card-cargo">{cargo}</h3>
            <p className="vac-card-empresa">{empresa}</p>
            <p className="vac-card-ubicacion">
              <PinIcon className="vac-card-pin" />
              {ubicacion}
            </p>
          </div>
        </div>

        {(modalidad || jornada) && (
          <div className="vac-card-tags">
            {modalidad && <span className="tag">{modalidad}</span>}
            {jornada && <span className="tag">{jornada}</span>}
          </div>
        )}

        {descripcion && <p className="vac-card-desc">{descripcion}</p>}

        <span className="vac-card-date">{publishedLabel(vacancy.fecha_publicacion)}</span>
      </button>

      <div className="vac-card-footer">
        <button
          type="button"
          className={`vac-card-save${guardada ? ' vac-card-save--on' : ''}`}
          onClick={onFavorite}
          title={guardada ? 'Quitar de guardados' : 'Guardar'}
          aria-label={guardada ? 'Quitar de guardados' : 'Guardar'}
          aria-pressed={Boolean(guardada)}
        >
          <BookmarkIcon filled={Boolean(guardada)} />
        </button>

        {aplicada ? (
          <button type="button" className="vac-card-apply vac-card-apply--done" disabled>
            <CheckIcon />
            Postulado
          </button>
        ) : (
          <button
            type="button"
            className="vac-card-apply"
            onClick={onApply}
            disabled={busy}
          >
            {busy ? 'Enviando...' : 'Postularme'}
          </button>
        )}
      </div>
    </article>
  )
}
