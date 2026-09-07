// =========================================================
// Contenido de PrácticaYa — portal de vacantes y seguimiento
// de postulaciones para estudiantes de la Fundación.
// =========================================================

export const brand = { name: 'PrácticaYa' }

export const sidebarNav = [
  { key: 'vacantes', label: 'Vacantes', icon: 'briefcase', path: '/practicaya/vacantes' },
  { key: 'postulaciones', label: 'Mis postulaciones', icon: 'checklist', path: '/practicaya/postulaciones' },
  { key: 'guardados', label: 'Guardados', icon: 'bookmark', path: '/practicaya/guardados' },
]

export const currentUser = {
  name: 'Thomas Anree',
  role: 'Estudiante',
  initials: 'TA',
}

export const filters = [
  { key: 'categoria', label: 'Todas las categorías' },
  { key: 'ubicacion', label: 'Ubicación' },
  { key: 'tipo', label: 'Tipo de empleado' },
  { key: 'fecha', label: 'Fecha de publicación' },
]

export const sortOption = { key: 'orden', label: 'Más reciente' }

export const savedJobs = [
  {
    id: 1,
    logoInitial: 'D',
    logoColor: '#FF7A1A',
    title: 'Desarrollador UX/UI',
    company: 'Tech Solutions',
    location: 'Medellín, Colombia',
    tags: ['Presencial', 'Medio tiempo'],
    description: 'Desarrolla interfaces modernas y escalables con las mejores tecnologías.',
    postedLabel: 'Publicado hoy',
    applied: false,
  },
  {
    id: 2,
    logoInitial: '◎',
    logoColor: '#8B5CF6',
    title: 'Diseñador Gráfico',
    company: 'Creative studio',
    location: 'Santa Fe de Antioquia, Colombia',
    tags: ['Presencial', 'Medio tiempo'],
    description: 'Únete a nuestro equipo creativo y desarrolla piezas visuales increíbles.',
    postedLabel: 'Publicado hoy',
    applied: true,
  },
  {
    id: 3,
    logoInitial: 'DS',
    logoColor: '#4C6FFF',
    title: 'Analista de Datos',
    company: 'DataSmart',
    location: 'Medellín, Colombia',
    tags: ['Presencial', 'Medio tiempo'],
    description: 'Analiza datos y genera insights que ayuden a la toma de decisiones.',
    postedLabel: 'Publicado hoy',
    applied: false,
  },
]

export const emptyStates = {
  vacantes: 'Aún no hay vacantes publicadas para mostrar.',
  postulaciones: 'Todavía no te has postulado a ninguna vacante.',
  guardados: 'No tienes vacantes guardadas por ahora.',
}
