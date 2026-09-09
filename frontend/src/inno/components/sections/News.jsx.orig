import { Link } from 'react-router-dom'
import Illustration from '../ui/Illustration.jsx'
import { useContent } from '../../data/useContent.js'
import { useBlogPosts } from '../../hooks/useBlogPosts.js'
import './News.css'

function News() {
  const { news } = useContent()
  const { posts } = useBlogPosts()
  const items = [...posts, ...news.items]

  return (
    <section className="news">
      <div className="container">
        <div className="news__grid">
          {items.map((item) => (
            <article key={item.slug} id={item.slug} className="news-card">
              <Link to={`/blog/${item.slug}`} className="news-card__link">
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
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default News
