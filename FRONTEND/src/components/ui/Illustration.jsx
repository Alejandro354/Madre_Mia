import './Illustration.css'

function Illustration({ caption, variant = 'primary', className = '', image, imageAlt = '' }) {
  return (
    <div className={`illustration illustration--${variant} ${className}`}>
      {image ? (
        <img src={image} alt={imageAlt} className="illustration__image" />
      ) : (
        <svg viewBox="0 0 400 260" className="illustration__svg" preserveAspectRatio="xMidYMax slice">
          <circle cx="200" cy="90" r="42" className="illustration__sun" />
          <polygon points="60,230 200,110 340,230" className="illustration__peak-back" />
          <polygon points="140,230 230,140 320,230" className="illustration__peak-front" />
        </svg>
      )}
      {caption && <span className="illustration__caption">{caption}</span>}
    </div>
  )
}

export default Illustration
