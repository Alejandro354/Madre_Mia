import client from './client'

export function getVacancies() {
  return client.get('/api/vacancies')
}

export function getVacancy(id) {
  return client.get(`/api/vacancies/${id}`)
}
