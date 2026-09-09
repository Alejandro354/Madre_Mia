import Illustration from '../ui/Illustration.jsx'
import { useContent } from '../../data/useContent.js'
import './AboutHistory.css'

function AboutHistory() {
  const { history } = useContent()

  return (
    <section className="history">
      <div className="container history__grid">
        <div className="history__content">
          <h2>{history.title}</h2>
          <p className="history__paragraph">{history.paragraph}</p>
          <ul className="history__list">
            {history.bullets.map((item) => (
              <li key={item}>
                <span className="history__dot" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="history__media">
          <Illustration
            className="history__media-main"
            image={history.mainImage}
            imageAlt={history.title}
          />
          <Illustration
            variant="dark"
            className="history__media-secondary"
            image={history.secondaryImage}
            imageAlt={history.title}
          />
        </div>
      </div>
    </section>
  )
}

export default AboutHistory
