import './Button.css'

function Button({ children, variant = 'primary', href, onClick, disabled = false, type = 'button' }) {
  const className = `btn btn--${variant}`

  if (href && !disabled) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    )
  }

  return (
    <button className={className} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
