import client from './client'

export function getFavorites() {
  return client.get('/api/favorites')
}

export function addFavorite(vacancyId) {
  return client.post('/api/favorites', { vacancy_id: vacancyId })
}

export function removeFavorite(vacancyId) {
  return client.delete(`/api/favorites/${vacancyId}`)
}
