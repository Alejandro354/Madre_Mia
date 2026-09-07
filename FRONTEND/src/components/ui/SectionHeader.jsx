import './SectionHeader.css'

function SectionHeader({ eyebrow, title, description, align = 'left' }) {
  return (
    <div className={`section-header section-header--${align}`}>
      {eyebrow && <span className="section-header__eyebrow">{eyebrow}</span>}
      <h2 className="section-header__title">{title}</h2>
      {description && <p className="section-header__description">{description}</p>}
    </div>
  )
}

export default SectionHeader
