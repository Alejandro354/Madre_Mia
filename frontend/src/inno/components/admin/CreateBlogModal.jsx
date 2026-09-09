import { useState } from 'react'
import Button from '../ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import './CreateBlogModal.css'

const MAX_TITLE_LEN = 120
const MAX_PARAGRAPH_LEN = 800
const MAX_PARAGRAPHS = 6
const MAX_HEADING_LEN = 150

function toParagraphState(content) {
  if (!content?.length) return [{ heading: '', text: '', video: '' }]
  return content.map((p) =>
    typeof p === 'string'
      ? { heading: '', text: p, video: '' }
      : { heading: p.heading || '', text: p.text || '', video: p.video ? String(p.video) : '' }
  )
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

function FileDropField({ label, hint, accept, preview, isVideo, onChange, onClear }) {
  return (
    <div className="create-blog__file">
      <span className="create-blog__file-label">{label}</span>
      <div className={`create-blog__file-drop ${preview ? 'create-blog__file-drop--filled' : ''}`}>
        {preview ? (
          isVideo ? (
            <video src={preview} className="create-blog__preview-media" muted />
          ) : (
            <img src={preview} alt="" className="create-blog__preview-media" />
          )
        ) : (
          <span className="create-blog__file-placeholder">
            <UploadIcon />
            {hint}
          </span>
        )}
        <input type="file" accept={accept} onChange={onChange} className="create-blog__file-input" />
        {preview && (
          <button
            type="button"
            className="create-blog__file-remove"
            onClick={(event) => {
              event.stopPropagation()
              onClear()
            }}
            aria-label="Quitar archivo"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

function CreateBlogModal({ post, onClose, onSaved }) {
  const isEditing = Boolean(post)
  const { token } = useAuth()
  const [title, setTitle] = useState(post?.title || '')
  const [tag, setTag] = useState(post?.tag || '')
  const [paragraphs, setParagraphs] = useState(toParagraphState(post?.content))
  const [quote, setQuote] = useState(post?.quote || '')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(post?.image || '')
  const [video, setVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState(post?.video || '')
  const [video2, setVideo2] = useState(null)
  const [video2Preview, setVideo2Preview] = useState(post?.video2 || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateParagraph = (index, field, value) => {
    setParagraphs((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  const addParagraph = () => {
    setParagraphs((prev) =>
      prev.length >= MAX_PARAGRAPHS ? prev : [...prev, { heading: '', text: '', video: '' }]
    )
  }

  const removeParagraph = (index) => {
    setParagraphs((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0] || null
    if (!file) return
    setVideo(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const handleVideo2Change = (event) => {
    const file = event.target.files?.[0] || null
    if (!file) return
    setVideo2(file)
    setVideo2Preview(URL.createObjectURL(file))
  }

  const validate = () => {
    if (!title.trim()) return 'El título es obligatorio.'
    if (title.length > MAX_TITLE_LEN) return `El título no puede superar ${MAX_TITLE_LEN} caracteres.`
    if (!tag.trim()) return 'La categoría es obligatoria.'
    const cleanParagraphs = paragraphs.map((p) => p.text.trim()).filter(Boolean)
    if (cleanParagraphs.length === 0) return 'Agregá al menos un párrafo.'
    if (cleanParagraphs.length > MAX_PARAGRAPHS) return `Máximo ${MAX_PARAGRAPHS} párrafos.`
    for (const p of paragraphs) {
      if (p.text.length > MAX_PARAGRAPH_LEN) return `Cada párrafo debe tener máximo ${MAX_PARAGRAPH_LEN} caracteres.`
      if (p.heading.length > MAX_HEADING_LEN) return `Cada subtítulo debe tener máximo ${MAX_HEADING_LEN} caracteres.`
    }
    if (!isEditing && !image) return 'La imagen es obligatoria.'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setLoading(true)

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('tag', tag.trim())
    const contentPayload = paragraphs
      .filter((p) => p.text.trim())
      .map((p) => {
        const heading = p.heading.trim()
        const videoSlot = p.video ? Number(p.video) : null
        if (!heading && !videoSlot) return p.text.trim()
        const item = { text: p.text.trim() }
        if (heading) item.heading = heading
        if (videoSlot) item.video = videoSlot
        return item
      })
    formData.append('content', JSON.stringify(contentPayload))
    formData.append('quote', quote.trim())
    if (image) formData.append('image', image)
    if (video) formData.append('video', video)
    if (video2) formData.append('video2', video2)

    try {
      const res = await fetch(isEditing ? `/api/blog/${post.slug}` : '/api/blog', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo guardar el blog')
      }
      onSaved?.(data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-blog__backdrop" onClick={onClose}>
      <div className="create-blog" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="create-blog__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <span className="create-blog__eyebrow">{isEditing ? 'Editar historia' : 'Nueva historia'}</span>
        <h2>{isEditing ? 'Editar blog' : 'Crear blog'}</h2>
        <p className="create-blog__subtitle">
          {isEditing ? 'Actualizá los datos de esta historia.' : 'Publicá una nueva historia en el sitio.'}
        </p>

        <form onSubmit={handleSubmit} className="create-blog__form">
          <label>
            <span className="create-blog__label-row">
              Título
              <span className="create-blog__counter">{title.length}/{MAX_TITLE_LEN}</span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={MAX_TITLE_LEN}
              placeholder="Ej: Jornada de limpieza en el Bosque Seco Tropical"
              required
            />
          </label>

          <label>
            Categoría / etiqueta
            <input
              type="text"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              placeholder="Ej: Voluntariado"
              required
            />
          </label>

          <div className="create-blog__media-row">
            <FileDropField
              label="Imagen"
              hint="Subir imagen"
              accept="image/*"
              preview={imagePreview}
              onChange={handleImageChange}
              onClear={() => {
                setImage(null)
                setImagePreview('')
              }}
            />
            <FileDropField
              label="Video 1 (opcional)"
              hint="Subir video"
              accept="video/*"
              preview={videoPreview}
              isVideo
              onChange={handleVideoChange}
              onClear={() => {
                setVideo(null)
                setVideoPreview('')
              }}
            />
            <FileDropField
              label="Video 2 (opcional)"
              hint="Subir video"
              accept="video/*"
              preview={video2Preview}
              isVideo
              onChange={handleVideo2Change}
              onClear={() => {
                setVideo2(null)
                setVideo2Preview('')
              }}
            />
          </div>

          <div className="create-blog__paragraphs">
            <span className="create-blog__label-row">
              Párrafos
              <span className="create-blog__counter">{paragraphs.length}/{MAX_PARAGRAPHS}</span>
            </span>

            {paragraphs.map((paragraph, index) => (
              <div key={index} className="create-blog__paragraph">
                <input
                  type="text"
                  className="create-blog__paragraph-heading"
                  value={paragraph.heading}
                  onChange={(event) => updateParagraph(index, 'heading', event.target.value)}
                  maxLength={MAX_HEADING_LEN}
                  placeholder="Subtítulo en gris (opcional)"
                />
                <textarea
                  value={paragraph.text}
                  onChange={(event) => updateParagraph(index, 'text', event.target.value)}
                  maxLength={MAX_PARAGRAPH_LEN}
                  rows={3}
                  placeholder={`Párrafo ${index + 1}`}
                />
                <select
                  className="create-blog__paragraph-video"
                  value={paragraph.video}
                  onChange={(event) => updateParagraph(index, 'video', event.target.value)}
                >
                  <option value="">Sin video después de este párrafo</option>
                  <option value="1">Video 1 después de este párrafo</option>
                  <option value="2">Video 2 después de este párrafo</option>
                </select>
                <div className="create-blog__paragraph-footer">
                  <span className="create-blog__counter">{paragraph.text.length}/{MAX_PARAGRAPH_LEN}</span>
                  {paragraphs.length > 1 && (
                    <button type="button" className="create-blog__remove" onClick={() => removeParagraph(index)}>
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            ))}

            {paragraphs.length < MAX_PARAGRAPHS && (
              <button type="button" className="create-blog__add" onClick={addParagraph}>
                + Agregar párrafo
              </button>
            )}
          </div>

          <label>
            Frase destacada (opcional)
            <textarea
              value={quote}
              onChange={(event) => setQuote(event.target.value)}
              rows={2}
              placeholder="Una frase corta para resaltar dentro del artículo"
            />
          </label>

          {error && <p className="create-blog__error">{error}</p>}

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Publicar'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default CreateBlogModal
