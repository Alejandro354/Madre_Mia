import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { extractErrors } from '../api/client'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Input from '../components/Input'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { now, stashLoginTime } from '../utils/perf'
import { validateLogin } from '../utils/validators'

const initial = { email: '', password: '' }

export default function Login() {
  const { login } = useAuth()
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
    const clientErrors = validateLogin(form)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    setLoading(true)
    setGeneral('')
    // Criterio 2.1: desde el clic hasta redirigir al panel. Se guarda porque
    // esta pantalla se desmonta al navegar; lo muestra /vacantes.
    const t0 = now()
    try {
      await login(form)
      stashLoginTime(now() - t0)
      navigate('/vacantes')
    } catch (err) {
      const apiErrors = extractErrors(err)
      setErrors(apiErrors)
      if (
        apiErrors.general === 'Correo o contraseña incorrectos' &&
        err.response?.data?.account_exists
      ) {
        setGeneral(
          'Correo o contraseña incorrectos. Después de 5 intentos fallidos la cuenta se bloqueará por 5 minutos.',
        )
      } else {
        setGeneral(apiErrors.general || '')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Iniciar sesión</h1>
        <p className="auth-subtitle">Accede a tu cuenta de estudiante</p>
        <Alert message={general} />
        <form onSubmit={handleSubmit} noValidate>
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </Button>
        </form>
        <p className="auth-switch">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}
