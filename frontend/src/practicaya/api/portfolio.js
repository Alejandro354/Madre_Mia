import client from './client'

export function getPortfolio() {
  return client.get('/api/portfolio')
}

export function createPortfolio(payload) {
  return client.post('/api/portfolio', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function updatePortfolio(id, payload) {
  return client.put(`/api/portfolio/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function deletePortfolio(id, force = false) {
  return client.delete(`/api/portfolio/${id}`, {
    params: force ? { force: 'true' } : {},
  })
}
