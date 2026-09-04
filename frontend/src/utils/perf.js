// Instrumentación de los criterios de tiempo del backlog:
//   2.1 — iniciar sesión y redirigir al panel en menos de 3 s
//   3.4 — el listado de vacantes debe cargar en máximo 3 s
//
// No es una función para el estudiante: es evidencia visible para QA.

const LOGIN_KEY = 'perf:login'

export function now() {
  return performance.now()
}

/** "840 ms" por debajo de 1 s, "1,24 s" por encima. */
export function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return ''
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} s`
}

/**
 * Login.jsx se desmonta al redirigir, así que el tiempo se mide allí pero se
 * muestra en el panel — que es justo lo que pide el criterio 2.1 ("iniciar
 * sesión y redirigir al panel").
 */
export function stashLoginTime(ms) {
  try {
    sessionStorage.setItem(LOGIN_KEY, String(ms))
  } catch {
    // Modo privado o almacenamiento bloqueado: la medición no es crítica.
  }
}

/** Lee y borra: el dato se muestra una sola vez, tras iniciar sesión. */
export function takeLoginTime() {
  try {
    const raw = sessionStorage.getItem(LOGIN_KEY)
    if (raw === null) return null
    sessionStorage.removeItem(LOGIN_KEY)
    const ms = Number(raw)
    return Number.isFinite(ms) ? ms : null
  } catch {
    return null
  }
}
