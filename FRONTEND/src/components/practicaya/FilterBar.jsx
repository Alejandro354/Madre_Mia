import Icon from '../ui/Icon.jsx'
import { filters, sortOption } from '../../data/practicaYaContent.js'
import './FilterBar.css'

function FilterBar() {
  return (
    <div className="pya-filterbar">
      <div className="pya-filterbar__group">
        {filters.map((filter) => (
          <button key={filter.key} type="button" className="pya-filterbar__pill">
            <span>{filter.label}</span>
            <Icon name="chevron-down" size={15} />
          </button>
        ))}
      </div>

      <button type="button" className="pya-filterbar__pill pya-filterbar__pill--sort">
        <span>{sortOption.label}</span>
        <Icon name="chevron-down" size={15} />
      </button>
    </div>
  )
}

export default FilterBar
