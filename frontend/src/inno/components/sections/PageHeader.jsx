import './PageHeader.css'

function PageHeader({ eyebrow, title, titleLines, tagline, subtitle, description, image, imageAlt, imageCaption, stats }) {
  const heading = (
    <>
      {eyebrow && <span className="cdn-page-header__eyebrow">{eyebrow}</span>}

      {titleLines ? (
        <h1 className="cdn-page-header__title cdn-page-header__title--stacked">
          {titleLines.map((line) => (
            <span
              key={line.text}
              className={`cdn-page-header__title-line ${line.accent ? 'cdn-page-header__title-line--accent' : ''}`}
            >
              {line.text}
            </span>
          ))}
        </h1>
      ) : (
        <h1 className="cdn-page-header__title">{title}</h1>
      )}

      {tagline && <p className="cdn-page-header__tagline">{tagline}</p>}
      {(subtitle || description) && (
        <p className="cdn-page-header__subtitle">{subtitle || description}</p>
      )}

      {stats && (
        <div className="cdn-page-header__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="cdn-page-header__stat">
              <span className="cdn-page-header__stat-value">{stat.value}</span>
              <span className="cdn-page-header__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )

  if (image) {
    return (
      <section className="cdn-page-header cdn-page-header--split">
        <div className="container cdn-page-header__grid">
          <div className="cdn-page-header__content">
            {heading}
          </div>
          <div className="cdn-page-header__media">
            <img src={image} alt={imageAlt} className="cdn-page-header__image" />
            {imageCaption && <span className="cdn-page-header__image-caption">&ldquo;{imageCaption}&rdquo;</span>}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="cdn-page-header">
      <div className="container">
        {heading}
      </div>
    </section>
  )
}

export default PageHeader
