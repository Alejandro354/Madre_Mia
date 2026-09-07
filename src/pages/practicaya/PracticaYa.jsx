import Sidebar from '../../components/practicaya/Sidebar.jsx'
import TopBar from '../../components/practicaya/TopBar.jsx'
import Vacantes from './Vacantes.jsx'
import MisPostulaciones from './MisPostulaciones.jsx'
import Guardados from './Guardados.jsx'
import './PracticaYa.css'

const pages = {
  vacantes: {
    key: 'vacantes',
    title: 'Vacantes',
    subtitle: 'Explora las oportunidades disponibles para ti.',
    Component: Vacantes,
  },
  postulaciones: {
    key: 'postulaciones',
    title: 'Mis postulaciones',
    subtitle: 'Revisa el estado de tus postulaciones.',
    Component: MisPostulaciones,
  },
  guardados: {
    key: 'guardados',
    title: 'Guardados',
    subtitle: 'Seguimiento de tus postulaciones guardadas.',
    Component: Guardados,
  },
}

function PracticaYa({ path }) {
  const segment = path.split('/')[2] || 'guardados'
  const page = pages[segment] ?? pages.guardados
  const { Component } = page

  return (
    <div className="pya-layout">
      <Sidebar activeKey={page.key} />
      <main className="pya-layout__main">
        <TopBar title={page.title} subtitle={page.subtitle} />
        <Component />
      </main>
    </div>
  )
}

export default PracticaYa
