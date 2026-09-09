import client from './client'

export function getSocials() {
  return client.get('/api/socials')
}

export function saveSocial(payload) {
  return client.post('/api/socials', payload)
}

export function deleteSocial(red) {
  return client.delete(`/api/socials/${red}`)
}
