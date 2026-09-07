import Illustration from '../ui/Illustration.jsx'
import { useContent } from '../../data/useContent.js'
import './News.css'

function News() {
  const { news } = useContent()

  return (
    <section className="news">
      <div className="container">
        <div className="news__grid">
          {news.items.map((item) => (
            <article key={item.title} id={item.slug} className="news-card">
              <a href={`#/blog/${item.slug}`} className="news-card__link">
                <div className="news-card__thumb">
                  {item.image ? (
                    <img
                      className="news-card__image"
                      src={item.image}
                      alt={item.title}
                      style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
                    />
                  ) : (
                    <Illustration />
                  )}
                </div>
                <div className="news-card__body">
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  {item.tag && (
                    <span className="news-card__pill">{item.tag}</span>
                  )}
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default News
