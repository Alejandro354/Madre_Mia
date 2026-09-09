import client from './client'

export function getProfile() {
  return client.get('/api/student/profile')
}

export function saveProfile(payload) {
  return client.put('/api/student/profile', payload)
}

export function uploadPhoto(file) {
  const formData = new FormData()
  formData.append('file', file)
  return client.post('/api/student/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
