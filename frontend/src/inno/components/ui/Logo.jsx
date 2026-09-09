import logoImg from '../../assets/LogoOficial1.png'
import logoImgWhite from '../../assets/LogoOficial1White.png'
import './Logo.css'

function Logo({ variant = 'light', size = 'md' }) {
  const src = variant === 'footer' ? logoImgWhite : logoImg
  return (
    <span className={`logo logo--${variant} logo--${size}`}>
      <img src={src} alt="CDN Social" className="logo__image" />
    </span>
  )
}

export default Logo
