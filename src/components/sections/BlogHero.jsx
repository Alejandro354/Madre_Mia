import { useContent } from '../../data/useContent.js'
import './BlogHero.css'

function BlogHero() {
  const { blogPage } = useContent()

  return (
    <section className="blog-hero">
      <div className="container blog-hero__top">
        <h1>
          {blogPage.heading} <span className="blog-hero__accent">{blogPage.headingAccent}</span>
        </h1>
        <p>{blogPage.description}</p>
      </div>
    </section>
  )
}

export default BlogHero
