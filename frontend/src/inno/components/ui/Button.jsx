import SmartLink from './SmartLink.jsx'
import './Button.css'

function Button({ children, variant = 'primary', href, onClick, disabled = false, type = 'button' }) {
  const className = `cdn-btn cdn-btn--${variant}`

  if (href && !disabled) {
    return (
      <SmartLink className={className} href={href}>
        {children}
      </SmartLink>
    )
  }

  return (
    <button className={className} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
