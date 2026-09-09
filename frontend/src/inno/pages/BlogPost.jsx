import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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

function BlogPost() {
  const { slug } = useParams()
  const { news, ui } = useContent()
  const [dynamicPost, setDynamicPost] = useState(null)
  const [dynamicLoading, setDynamicLoading] = useState(false)

  const staticPost = news.items.find((item) => item.slug === slug)
  const post = staticPost || dynamicPost

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    if (staticPost) {
      setDynamicPost(null)
      return
    }
    setDynamicLoading(true)
    fetch(`/api/blog/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDynamicPost(data))
      .catch(() => setDynamicPost(null))
      .finally(() => setDynamicLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, staticPost])

  if (!post) {
    if (dynamicLoading) return null

    return (
      <>
        <Navbar />
        <main className="blog-post">
          <div className="container blog-post__missing">
            <h1>{ui.articleNotFound}</h1>
            <Link to="/blog" className="blog-post__back">← {ui.backToBlog}</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const usedVideoSlots = new Set(
    (post.content || [])
      .filter((p) => p && typeof p === 'object' && (p.video === 1 || p.video === 2))
      .map((p) => p.video)
  )
  const consumedVideoUrls = new Set()
  if (usedVideoSlots.has(1) && post.video) consumedVideoUrls.add(post.video)
  if (usedVideoSlots.has(2) && post.video2) consumedVideoUrls.add(post.video2)

  const heroImage = (post.heroImage || post.image) && !post.videos?.length && (
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
  )
  const heroAtBottom = post.imagePlacement === 'bottom'

  return (
    <>
      <Navbar />
      <main className="blog-post">
        <article className="container blog-post__article">
          <div className="blog-post__top-row">
            <Link to="/blog" className="blog-post__back">← {ui.backToBlog}</Link>
          </div>

          <span className="blog-post__tag">{post.tag}</span>
          <h1>{post.title}</h1>

          {!heroAtBottom && heroImage}

          <div className="blog-post__body">
            {post.content.map((paragraph, i) => {
              if (typeof paragraph === 'string') {
                return <p key={i}>{paragraph}</p>
              }
              const videoSrc = paragraph.video === 1 ? post.video : paragraph.video === 2 ? post.video2 : null
              return (
                <div key={i} className="blog-post__paragraph">
                  {paragraph.heading && (
                    <span className="blog-post__paragraph-heading">{paragraph.heading}</span>
                  )}
                  {paragraph.image && paragraph.imagePosition === 'above' && (
                    <img className="blog-post__paragraph-image" src={paragraph.image} alt="" />
                  )}
                  <p>{paragraph.text}</p>
                  {paragraph.image && paragraph.imagePosition !== 'above' && (
                    <img className="blog-post__paragraph-image" src={paragraph.image} alt="" />
                  )}
                  {videoSrc && <VideoBlock item={{ video: videoSrc, preview: post.image }} ui={ui} />}
                </div>
              )
            })}
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

          {post.videos
            ?.filter((item) => !consumedVideoUrls.has(item.video))
            .map((item, i) => (
              <VideoBlock key={i} item={item} ui={ui} />
            ))}

          {post.video && !post.videos?.length && !consumedVideoUrls.has(post.video) && (
            <VideoBlock item={{ video: post.video, preview: post.image }} ui={ui} />
          )}

          {heroAtBottom && <div className="blog-post__hero-bottom">{heroImage}</div>}
        </article>
      </main>
      <Footer />
    </>
  )
}

export default BlogPost
