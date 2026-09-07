import logoImg from '../../assets/logo-cdn.png'
import './Logo.css'

function Logo({ variant = 'light', size = 'md' }) {
  return (
    <span className={`logo logo--${variant} logo--${size}`}>
      <img src={logoImg} alt="CDN Social" className="logo__image" />
    </span>
  )
}

export default Logo
