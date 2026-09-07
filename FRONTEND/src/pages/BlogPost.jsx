import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useContent } from '../data/useContent.js'
import './BlogPost.css'

function VideoBlock({ item, ui }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  return (
    <>
      <div className="blog-post__video-card" style={{ aspectRatio: item.aspectRatio || '16 / 9' }}>
        {item.video ? (
          <video
            ref={videoRef}
            className="blog-post__video-media"
            src={item.video}
            playsInline
            preload="metadata"
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
          />
        ) : (
          <img className="blog-post__video-media" src={item.preview} alt={item.caption || ''} />
        )}

        {item.video && (
          <button
            type="button"
            className={`blog-post__video-play ${isPlaying ? 'blog-post__video-play--hidden' : ''}`}
            aria-label={isPlaying ? ui.pauseVideo : ui.playVideo}
            onClick={togglePlay}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M8 5v14l11-7-11-7Z" />
            </svg>
          </button>
        )}
      </div>

      {item.content && (
        <div className="blog-post__body blog-post__body--video">
          {item.caption && <h2>{item.caption}</h2>}
          {item.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}
    </>
  )
}

function BlogPost({ slug }) {
  const { news, ui } = useContent()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const post = news.items.find((item) => item.slug === slug)

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="blog-post">
          <div className="container blog-post__missing">
            <h1>{ui.articleNotFound}</h1>
            <a href="#/blog" className="blog-post__back">← {ui.backToBlog}</a>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="blog-post">
        <article className="container blog-post__article">
          <a href="#/blog" className="blog-post__back">← {ui.backToBlog}</a>

          <span className="blog-post__tag">{post.tag}</span>
          <h1>{post.title}</h1>

          {(post.heroImage || post.image) && !post.videos?.length && (
            <img
              className={`blog-post__hero ${post.heroCompact ? 'blog-post__hero--compact' : ''}`}
              src={post.heroImage || post.image}
              alt={post.title}
              style={
                post.heroImage
                  ? post.heroImagePosition ? { objectPosition: post.heroImagePosition } : undefined
                  : post.imagePosition ? { objectPosition: post.imagePosition } : undefined
              }
            />
          )}

          <div className="blog-post__body">
            {post.content.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {post.quote && (
            <blockquote className="blog-post__quote">{post.quote}</blockquote>
          )}

          {post.secondaryHeading && (
            <div className="blog-post__body blog-post__body--secondary">
              <h2>{post.secondaryHeading}</h2>
              {post.secondaryContent?.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          {post.highlights && (
            <div className="blog-post__body">
              {post.highlights.map((highlight, i) => (
                <div key={i}>
                  <h3>{highlight.title}</h3>
                  <p>{highlight.description}</p>
                </div>
              ))}
            </div>
          )}

          {post.videos?.map((item, i) => (
            <VideoBlock key={i} item={item} ui={ui} />
          ))}
        </article>
      </main>
      <Footer />
    </>
  )
}

export default BlogPost
