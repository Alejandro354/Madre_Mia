import { useState } from 'react'
import Button from '../ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import './CreateBlogModal.css'

const MAX_TITLE_LEN = 120
const MAX_PARAGRAPH_LEN = 800
const MAX_PARAGRAPHS = 6
const MAX_HEADING_LEN = 150

function emptyParagraph() {
  return {
    heading: '', text: '', headingEn: '', textEn: '',
    video: '', imageFile: null, imagePreview: '', imagePosition: 'below',
  }
}

function toParagraphState(content, contentEn) {
  if (!content?.length) return [emptyParagraph()]
  return content.map((p, i) => {
    const en = contentEn?.[i]
    const enHeading = (en && typeof en === 'object' && en.heading) || ''
    const enText = (en && typeof en === 'object' ? en.text : typeof en === 'string' ? en : '') || ''
    return typeof p === 'string'
      ? { ...emptyParagraph(), text: p, headingEn: enHeading, textEn: enText }
      : {
          heading: p.heading || '',
          text: p.text || '',
          headingEn: enHeading,
          textEn: enText,
          video: p.video ? String(p.video) : '',
          imageFile: null,
          imagePreview: p.image || '',
          imagePosition: p.imagePosition || 'below',
        }
  })
}

function truncateText(text, limit) {
  const trimmed = text.trim()
  if (trimmed.length <= limit) return trimmed
  return `${trimmed.slice(0, limit).trimEnd()}…`
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
  const [titleEn, setTitleEn] = useState(post?.titleEn || '')
  const [tag, setTag] = useState(post?.tag || '')
  const [tagEn, setTagEn] = useState(post?.tagEn || '')
  const [paragraphs, setParagraphs] = useState(toParagraphState(post?.content, post?.contentEn))
  const [expandedParagraphs, setExpandedParagraphs] = useState(() => new Set())
  const [quote, setQuote] = useState(post?.quote || '')
  const [quoteEn, setQuoteEn] = useState(post?.quoteEn || '')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(post?.image || '')
  const [imagePlacement, setImagePlacement] = useState(post?.imagePlacement || 'top')
  const [video, setVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState(post?.video || '')
  const [removeVideo, setRemoveVideo] = useState(false)
  const [video2, setVideo2] = useState(null)
  const [video2Preview, setVideo2Preview] = useState(post?.video2 || '')
  const [removeVideo2, setRemoveVideo2] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateParagraph = (index, field, value) => {
    setParagraphs((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  const addParagraph = () => {
    if (paragraphs.length >= MAX_PARAGRAPHS) return
    const newIndex = paragraphs.length
    setParagraphs((prev) => [...prev, emptyParagraph()])
    setExpandedParagraphs((prev) => new Set(prev).add(newIndex))
  }

  const removeParagraph = (index) => {
    if (paragraphs.length <= 1) return
    setParagraphs((prev) => prev.filter((_, i) => i !== index))
    setExpandedParagraphs((prev) => {
      const next = new Set()
      prev.forEach((i) => {
        if (i < index) next.add(i)
        else if (i > index) next.add(i - 1)
      })
      return next
    })
  }

  const toggleParagraph = (index) => {
    setExpandedParagraphs((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
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
    setRemoveVideo(false)
  }

  const handleParagraphImageChange = (index, event) => {
    const file = event.target.files?.[0] || null
    if (!file) return
    setParagraphs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, imageFile: file, imagePreview: URL.createObjectURL(file) } : p))
    )
  }

  const clearParagraphImage = (index) => {
    setParagraphs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, imageFile: null, imagePreview: '' } : p))
    )
  }

  const handleVideo2Change = (event) => {
    const file = event.target.files?.[0] || null
    if (!file) return
    setVideo2(file)
    setVideo2Preview(URL.createObjectURL(file))
    setRemoveVideo2(false)
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
    formData.append('titleEn', titleEn.trim())
    formData.append('tag', tag.trim())
    formData.append('tagEn', tagEn.trim())

    const contentPayload = []
    const contentEnPayload = []
    const paragraphImageFiles = []
    paragraphs
      .filter((p) => p.text.trim())
      .forEach((p) => {
        const heading = p.heading.trim()
        const videoSlot = p.video ? Number(p.video) : null
        const hasImage = Boolean(p.imageFile || p.imagePreview)
        if (!heading && !videoSlot && !hasImage) {
          contentPayload.push(p.text.trim())
        } else {
          const item = { text: p.text.trim() }
          if (heading) item.heading = heading
          if (videoSlot) item.video = videoSlot
          if (hasImage) {
            if (p.imagePreview && !p.imageFile) item.image = p.imagePreview
            item.imagePosition = p.imagePosition || 'below'
          }
          const index = contentPayload.length
          contentPayload.push(item)
          if (p.imageFile) paragraphImageFiles.push({ index, file: p.imageFile })
        }

        const textEn = p.textEn.trim()
        const headingEn = p.headingEn.trim()
        if (!textEn) {
          contentEnPayload.push('')
        } else if (headingEn) {
          contentEnPayload.push({ text: textEn, heading: headingEn })
        } else {
          contentEnPayload.push(textEn)
        }
      })
    formData.append('content', JSON.stringify(contentPayload))
    formData.append('contentEn', JSON.stringify(contentEnPayload))
    paragraphImageFiles.forEach(({ index, file }) => {
      formData.append(`paragraph_image_${index}`, file)
    })
    formData.append('quote', quote.trim())
    formData.append('quoteEn', quoteEn.trim())
    formData.append('imagePlacement', imagePlacement)
    if (image) formData.append('image', image)
    if (video) formData.append('video', video)
    else if (removeVideo) formData.append('removeVideo', '1')
    if (video2) formData.append('video2', video2)
    else if (removeVideo2) formData.append('removeVideo2', '1')

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
                setRemoveVideo(true)
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
                setRemoveVideo2(true)
              }}
            />
          </div>

          <div className="create-blog__placement">
            <span>Posición de la imagen principal en el artículo</span>
            <div className="create-blog__placement-options">
              <button
                type="button"
                className={imagePlacement === 'top' ? 'create-blog__placement-btn--active' : ''}
                onClick={() => setImagePlacement('top')}
              >
                Arriba del artículo
              </button>
              <button
                type="button"
                className={imagePlacement === 'bottom' ? 'create-blog__placement-btn--active' : ''}
                onClick={() => setImagePlacement('bottom')}
              >
                Abajo del artículo
              </button>
            </div>
          </div>

          <div className="create-blog__paragraphs">
            <span className="create-blog__label-row">
              Párrafos
              <span className="create-blog__counter">{paragraphs.length}/{MAX_PARAGRAPHS}</span>
            </span>

            {paragraphs.map((paragraph, index) => {
              const isExpanded = expandedParagraphs.has(index)
              return (
                <div
                  key={index}
                  className={`create-blog__paragraph ${isExpanded ? 'create-blog__paragraph--open' : ''}`}
                >
                  <button
                    type="button"
                    className="create-blog__paragraph-toggle"
                    onClick={() => toggleParagraph(index)}
                    aria-expanded={isExpanded}
                  >
                    <span className="create-blog__paragraph-toggle-text">
                      Párrafo {index + 1}{paragraph.heading ? ` · ${paragraph.heading}` : ''}
                    </span>
                    <span className="create-blog__paragraph-chevron" aria-hidden="true">
                      {isExpanded ? '−' : '+'}
                    </span>
                  </button>

                  {!isExpanded && paragraph.text && (
                    <p className="create-blog__paragraph-preview">{truncateText(paragraph.text, 110)}</p>
                  )}

                  {isExpanded && (
                    <div className="create-blog__paragraph-body">
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

                      <div className="create-blog__translation-field">
                        <input
                          type="text"
                          className="create-blog__paragraph-heading"
                          value={paragraph.headingEn}
                          onChange={(event) => updateParagraph(index, 'headingEn', event.target.value)}
                          maxLength={MAX_HEADING_LEN}
                          placeholder="Subtítulo en inglés (opcional)"
                        />
                        <textarea
                          value={paragraph.textEn}
                          onChange={(event) => updateParagraph(index, 'textEn', event.target.value)}
                          maxLength={MAX_PARAGRAPH_LEN}
                          rows={3}
                          placeholder={`Paragraph ${index + 1} in English (optional)`}
                        />
                      </div>

                      <select
                        className="create-blog__paragraph-video"
                        value={paragraph.video}
                        onChange={(event) => updateParagraph(index, 'video', event.target.value)}
                      >
                        <option value="">Sin video después de este párrafo</option>
                        <option value="1">Video 1 después de este párrafo</option>
                        <option value="2">Video 2 después de este párrafo</option>
                      </select>

                      <div className="create-blog__paragraph-image">
                        <FileDropField
                          label="Imagen del párrafo (opcional)"
                          hint="Subir imagen"
                          accept="image/*"
                          preview={paragraph.imagePreview}
                          onChange={(event) => handleParagraphImageChange(index, event)}
                          onClear={() => clearParagraphImage(index)}
                        />
                        {paragraph.imagePreview && (
                          <div className="create-blog__paragraph-position">
                            <span>Posición</span>
                            <div className="create-blog__paragraph-position-options">
                              <button
                                type="button"
                                className={paragraph.imagePosition === 'above' ? 'create-blog__paragraph-position-btn--active' : ''}
                                onClick={() => updateParagraph(index, 'imagePosition', 'above')}
                              >
                                Arriba del texto
                              </button>
                              <button
                                type="button"
                                className={paragraph.imagePosition === 'below' ? 'create-blog__paragraph-position-btn--active' : ''}
                                onClick={() => updateParagraph(index, 'imagePosition', 'below')}
                              >
                                Abajo del texto
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="create-blog__paragraph-footer">
                        <span className="create-blog__counter">{paragraph.text.length}/{MAX_PARAGRAPH_LEN}</span>
                        {paragraphs.length > 1 && (
                          <button type="button" className="create-blog__remove" onClick={() => removeParagraph(index)}>
                            Eliminar párrafo
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

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
