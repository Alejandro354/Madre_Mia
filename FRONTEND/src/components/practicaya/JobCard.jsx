import Icon from '../ui/Icon.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import './JobCard.css'

function JobCard({ job, saved = true, onToggleSave, onRemove }) {
  return (
    <article className="job-card">
      <button className="job-card__remove" type="button" aria-label="Quitar" onClick={onRemove}>
        <Icon name="close" size={14} />
      </button>

      <span className="job-card__logo" style={{ background: job.logoColor }}>
        {job.logoInitial}
      </span>

      <h3 className="job-card__title">{job.title}</h3>
      <p className="job-card__company">{job.company}</p>
      <p className="job-card__location">
        <Icon name="pin" size={14} />
        {job.location}
      </p>

      <div className="job-card__tags">
        {job.tags.map((tag) => (
          <Badge key={tag} variant="tag">
            {tag}
          </Badge>
        ))}
      </div>

      <p className="job-card__description">{job.description}</p>
      <span className="job-card__posted">{job.postedLabel}</span>

      <div className="job-card__footer">
        <button
          className={`job-card__save ${saved ? 'job-card__save--active' : ''}`}
          type="button"
          aria-label={saved ? 'Quitar de guardados' : 'Guardar'}
          onClick={onToggleSave}
        >
          <Icon name="bookmark" size={17} filled={saved} />
        </button>

        {job.applied ? (
          <Button variant="primary" disabled>
            ✓ Postulado
          </Button>
        ) : (
          <Button variant="primary">Postularme</Button>
        )}
      </div>
    </article>
  )
}

export default JobCard
