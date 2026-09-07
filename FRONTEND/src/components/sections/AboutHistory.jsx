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
          <Illustration caption={history.mediaCaptions[0]} className="history__media-main" />
          <Illustration caption={history.mediaCaptions[1]} variant="dark" className="history__media-secondary" />
        </div>
      </div>
    </section>
  )
}

export default AboutHistory
