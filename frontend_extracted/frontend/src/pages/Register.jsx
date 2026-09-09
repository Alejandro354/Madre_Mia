import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { extractErrors } from '../api/client'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Input from '../components/Input'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { validateRegister } from '../utils/validators'

const initial = { nombre_completo: '', email: '', password: '', confirm_password: '' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [general, setGeneral] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const clientErrors = validateRegister(form)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    setLoading(true)
    setGeneral('')
    try {
      await register(form)
      navigate('/perfil')
    } catch (err) {
      const apiErrors = extractErrors(err)
      setErrors(apiErrors)
      setGeneral(apiErrors.general || '')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-subtitle">Regístrate para crear tu perfil y postularte a vacantes</p>
        <Alert message={general} />
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Nombre completo"
            name="nombre_completo"
            value={form.nombre_completo}
            onChange={handleChange}
            error={errors.nombre_completo}
          />
          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <PasswordInput
            label="Contraseña"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <PasswordInput
            label="Confirmar contraseña"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            error={errors.confirm_password}
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Registrarme'}
          </Button>
        </form>
        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
