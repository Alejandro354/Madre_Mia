import { useState } from 'react'
import Button from '../ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import './CreateCompanyModal.css'

function CreateCompanyModal({ onClose, onCreated }) {
  const { token } = useAuth()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!nombre.trim()) return 'El nombre de la empresa es obligatorio.'
    if (!email.trim()) return 'El correo es obligatorio.'
    if (password.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.'
    if (password !== confirmPassword) return 'Las contraseñas no coinciden.'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: nombre.trim(), email: email.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo crear la empresa')
      }
      setSuccess('Empresa creada exitosamente. Ya puede iniciar sesión en PracticaYa.')
      setNombre('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      onCreated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-company__backdrop" onClick={onClose}>
      <div className="create-company" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="create-company__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <span className="create-company__eyebrow">Nueva cuenta</span>
        <h2>Crear empresa</h2>
        <p className="create-company__subtitle">
          Da de alta una cuenta de empresa en PracticaYa.
        </p>

        <form onSubmit={handleSubmit} className="create-company__form">
          <label>
            Nombre de la empresa
            <input
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ej: Tech Solutions S.A."
              required
            />
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="empresa@correo.com"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres, letras y números"
              required
            />
          </label>

          <label>
            Confirmar contraseña
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="create-company__error">{error}</p>}
          {success && <p className="create-company__success">{success}</p>}

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creando…' : 'Crear empresa'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default CreateCompanyModal
