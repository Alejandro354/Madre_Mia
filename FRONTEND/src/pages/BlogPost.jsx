import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import CreateBlogModal from '../components/admin/CreateBlogModal.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { useContent } from '../data/useContent.js'
import { useAuth } from '../context/AuthContext.jsx'
import { notifyBlogPostCreated } from '../hooks/useBlogPosts.js'
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
  const { isAuthenticated, token } = useAuth()
  const [dynamicPost, setDynamicPost] = useState(null)
  const [dynamicLoading, setDynamicLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const staticPost = news.items.find((item) => item.slug === slug)
  const post = staticPost || dynamicPost
  const canManage = isAuthenticated && post?.source === 'dynamic'

  const handleDelete = async () => {
    setDeleteError('')
    setDeleting(true)
    try {
      const res = await fetch(`/api/blog/${post.slug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'No se pudo eliminar')
      }
      notifyBlogPostCreated()
      window.location.hash = '#/blog'
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

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
          <div className="blog-post__top-row">
            <a href="#/blog" className="blog-post__back">← {ui.backToBlog}</a>

            {canManage && (
              <div className="blog-post__admin-actions">
                <button type="button" onClick={() => setEditOpen(true)}>
                  Editar
                </button>
                <button type="button" onClick={() => setConfirmDeleteOpen(true)}>
                  Eliminar
                </button>
              </div>
            )}
          </div>

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

          {post.video && !post.videos?.length && (
            <VideoBlock item={{ video: post.video, preview: post.image }} ui={ui} />
          )}
        </article>
      </main>
      <Footer />

      {editOpen && canManage && (
        <CreateBlogModal
          post={post}
          onClose={() => setEditOpen(false)}
          onSaved={(data) => {
            setDynamicPost(data)
            notifyBlogPostCreated()
          }}
        />
      )}

      {confirmDeleteOpen && (
        <ConfirmDialog
          title="Eliminar historia"
          message="¿Seguro que querés eliminar esta historia? Esta acción no se puede deshacer."
          error={deleteError}
          confirmLabel="Eliminar"
          danger
          loading={deleting}
          onCancel={() => {
            setConfirmDeleteOpen(false)
            setDeleteError('')
          }}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}

export default BlogPost
