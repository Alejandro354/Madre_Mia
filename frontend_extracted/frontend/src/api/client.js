import axios from 'axios'

export const ACCESS_KEY = 'access_token'
export const REFRESH_KEY = 'refresh_token'

const client = axios.create({
  baseURL: '/',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing = null

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthRequest = ['/api/auth/login', '/api/auth/refresh'].includes(
      original?.url,
    )
    if (error.response?.status === 401 && !original._retry && !isAuthRequest) {
      original._retry = true
      const refreshToken = localStorage.getItem(REFRESH_KEY)
      if (refreshToken) {
        try {
          refreshing =
            refreshing ||
            axios.post('/api/auth/refresh', {}, {
              headers: { Authorization: `Bearer ${refreshToken}` },
            })
          const { data } = await refreshing
          localStorage.setItem(ACCESS_KEY, data.access_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return client(original)
        } catch (e) {
          localStorage.removeItem(ACCESS_KEY)
          localStorage.removeItem(REFRESH_KEY)
          window.location.href = '/login'
          return Promise.reject(e)
        } finally {
          refreshing = null
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function extractErrors(error) {
  const payload = error.response?.data?.errors
  if (payload) return payload
  return { general: 'Ocurrió un error. Intenta de nuevo.' }
}

export default client
