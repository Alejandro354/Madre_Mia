import axios from 'axios'

const adminClient = axios.create({ baseURL: '/' })

export function adminErrors(error) {
  return error.response?.data?.errors || { general: 'Ocurrió un error. Intenta de nuevo.' }
}

export default adminClient
