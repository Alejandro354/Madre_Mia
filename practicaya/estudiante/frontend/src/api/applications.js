import client from './client'

export function getApplications() {
  return client.get('/api/applications')
}

export function apply(vacancyId) {
  return client.post('/api/applications', { vacancy_id: vacancyId })
}

export function deleteApplication(applicationId) {
  return client.delete(`/api/applications/${applicationId}`)
}
