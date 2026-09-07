import './Badge.css'

function Badge({ children, variant = 'tag' }) {
  return <span className={`badge badge--${variant}`}>{children}</span>
}

export default Badge
