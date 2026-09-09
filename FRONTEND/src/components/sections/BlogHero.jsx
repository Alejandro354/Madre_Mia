import Illustration from '../ui/Illustration.jsx'
import { useContent } from '../../data/useContent.js'
import { useBlogPosts } from '../../hooks/useBlogPosts.js'
import './BlogHero.css'

function BlogHero() {
  const { blogPage, news, ui } = useContent()
  const { posts } = useBlogPosts()
  const featured = [...posts, ...news.items][0]

  if (!featured) {
    return (
      <section className="blog-hero blog-hero--empty">
        <div className="container blog-hero__top">
          <h1>
            {blogPage.heading} <span className="blog-hero__accent">{blogPage.headingAccent}</span>
          </h1>
          <p>{blogPage.description}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="blog-hero">
      <div className="container">
        <a href={`#/blog/${featured.slug}`} className="blog-featured">
          <div className="blog-featured__media">
            {featured.image ? (
              <img
                className="blog-featured__image"
                src={featured.image}
                alt={featured.title}
                style={featured.imagePosition ? { objectPosition: featured.imagePosition } : undefined}
              />
            ) : (
              <Illustration variant="dark" />
            )}
          </div>
          <div className="blog-featured__overlay">
            <div className="blog-featured__content">
              <span className="blog-featured__badge">{ui.featuredBadge}</span>
              <h1>{featured.title}</h1>
              <p>{featured.excerpt}</p>
              <span className="blog-featured__link">
                {ui.readArticle}
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </div>
        </a>
      </div>
    </section>
  )
}

export default BlogHero
