import './PageHeader.css'

function PageHeader({ eyebrow, title, titleLines, tagline, subtitle, description, image, imageAlt, imageCaption, stats }) {
  const heading = (
    <>
      {eyebrow && <span className="page-header__eyebrow">{eyebrow}</span>}

      {titleLines ? (
        <h1 className="page-header__title page-header__title--stacked">
          {titleLines.map((line) => (
            <span
              key={line.text}
              className={`page-header__title-line ${line.accent ? 'page-header__title-line--accent' : ''}`}
            >
              {line.text}
            </span>
          ))}
        </h1>
      ) : (
        <h1 className="page-header__title">{title}</h1>
      )}

      {tagline && <p className="page-header__tagline">{tagline}</p>}
      {(subtitle || description) && (
        <p className="page-header__subtitle">{subtitle || description}</p>
      )}

      {stats && (
        <div className="page-header__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="page-header__stat">
              <span className="page-header__stat-value">{stat.value}</span>
              <span className="page-header__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )

  if (image) {
    return (
      <section className="page-header page-header--split">
        <div className="container page-header__grid">
          <div className="page-header__content">
            {heading}
          </div>
          <div className="page-header__media">
            <img src={image} alt={imageAlt} className="page-header__image" />
            {imageCaption && <span className="page-header__image-caption">&ldquo;{imageCaption}&rdquo;</span>}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page-header">
      <div className="container">
        {heading}
      </div>
    </section>
  )
}

export default PageHeader
