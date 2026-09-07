import { useState } from 'react'
import Button from '../ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import './LoginModal.css'

function LoginModal({ onClose }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      onClose()
      window.location.hash = '/admin'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-modal__backdrop" onClick={onClose}>
      <div className="login-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="login-modal__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <h2>Iniciar sesión</h2>
        <p className="login-modal__subtitle">Acceso exclusivo para administrar el blog.</p>

        <form onSubmit={handleSubmit} className="login-modal__form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoFocus
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="login-modal__error">{error}</p>}

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
