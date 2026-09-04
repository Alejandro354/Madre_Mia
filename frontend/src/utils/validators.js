export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
export const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
export const PHONE_RE = /^\+?[0-9\s\-()]{7,15}$/

const SOCIAL_DOMAINS = {
  linkedin: ['linkedin.com', 'www.linkedin.com'],
  github: ['github.com', 'www.github.com'],
  instagram: ['instagram.com', 'www.instagram.com'],
}

export function validateSocialUrl(red, url) {
  if (!url) return 'El enlace ingresado no es válido'
  try {
    const parsed = new URL(url)
    const isHttps = parsed.protocol === 'https:'
    const domain = parsed.hostname.toLowerCase()
    const valid = isHttps && SOCIAL_DOMAINS[red]?.includes(domain)
    return valid ? '' : 'El enlace ingresado no es válido'
  } catch {
    return 'El enlace ingresado no es válido'
  }
}

export function validateRegister({ nombre_completo, email, password, confirm_password }) {
  const errors = {}
  if (!nombre_completo?.trim()) errors.nombre_completo = 'Este campo es obligatorio'
  if (!email?.trim()) errors.email = 'Este campo es obligatorio'
  else if (!EMAIL_RE.test(email)) errors.email = 'Formato de correo inválido'
  if (!password) errors.password = 'Este campo es obligatorio'
  else if (!PASSWORD_RE.test(password))
    errors.password = 'La contraseña debe tener mínimo 8 caracteres, incluyendo letras y números'
  if (!confirm_password) errors.confirm_password = 'Este campo es obligatorio'
  else if (confirm_password !== password) errors.confirm_password = 'Las contraseñas no coinciden'
  return errors
}

export function validateLogin({ email, password }) {
  const errors = {}
  if (!email?.trim()) errors.email = 'Este campo es obligatorio'
  if (!password) errors.password = 'Este campo es obligatorio'
  return errors
}

export function validateProfile(form) {
  const errors = {}

  if (!form.fecha_nacimiento?.trim()) {
    errors.fecha_nacimiento = 'Este campo es obligatorio'
  } else {
    const fecha = new Date(form.fecha_nacimiento)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    if (Number.isNaN(fecha.getTime())) {
      errors.fecha_nacimiento = 'Fecha de nacimiento inválida'
    } else if (fecha > hoy) {
      errors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura'
    }
  }

  if (!form.telefono?.trim()) {
    errors.telefono = 'Este campo es obligatorio'
  } else if (!PHONE_RE.test(form.telefono.trim())) {
    errors.telefono = 'El teléfono debe contener solo números y tener entre 7 y 15 dígitos'
  }

  if (!form.institucion?.trim()) errors.institucion = 'Este campo es obligatorio'
  if (!form.programa?.trim()) errors.programa = 'Este campo es obligatorio'

  if (!form.semestre?.trim()) {
    errors.semestre = 'Este campo es obligatorio'
  } else {
    const num = Number(form.semestre)
    if (!Number.isInteger(num) || num < 1 || num > 12) {
      errors.semestre = 'El semestre debe ser un número entre 1 y 12'
    }
  }

  if (!form.ciudad?.trim()) errors.ciudad = 'Este campo es obligatorio'

  return errors
}
