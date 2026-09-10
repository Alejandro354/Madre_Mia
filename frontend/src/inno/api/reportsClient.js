import axios from 'axios'

const TOKEN_KEY = 'cdn-admin-token'

// Las rutas del panel de reportes viven bajo /panel (ver gateway/run.py y
// vite.config.js), separado de /api (innovacion-social) y /practicaya, /practicantes.
const reportsClient = axios.create({ baseURL: '/panel' })

reportsClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function reportsErrors(error) {
  return error.response?.data?.errors || { general: 'Ocurrió un error. Intenta de nuevo.' }
}

export default reportsClient
