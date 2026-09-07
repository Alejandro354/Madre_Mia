import Icon from '../../components/ui/Icon.jsx'
import FilterBar from '../../components/practicaya/FilterBar.jsx'
import { emptyStates } from '../../data/practicaYaContent.js'
import './practicaya-pages.css'

function Vacantes() {
  return (
    <section className="pya-page">
      <FilterBar />
      <div className="pya-page__placeholder">
        <Icon name="briefcase" size={32} />
        <p>{emptyStates.vacantes}</p>
      </div>
    </section>
  )
}

export default Vacantes
