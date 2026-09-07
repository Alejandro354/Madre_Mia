import { useContent } from '../../data/useContent.js'
import './StatsBar.css'

function StatsBar() {
  const { stats } = useContent()

  return (
    <section className="stats-bar">
      <div className="container stats-bar__grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stats-bar__item">
            <span className="stats-bar__value">{stat.value}</span>
            <span className="stats-bar__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StatsBar
