import { useEffect, useRef, useState } from 'react'

import { extractErrors } from '../api/client'
import {
  createPortfolio,
  deletePortfolio,
  getPortfolio,
  updatePortfolio,
} from '../api/portfolio'
import Alert from '../components/Alert'
import Button from '../components/Button'
import ConfirmModal from '../components/ConfirmModal'
import { DocIcon, FolderIcon, LinkIcon, PencilIcon, TrashIcon, UploadIcon } from '../components/icons'
import Input from '../components/Input'
import { PortfolioSkeleton } from '../components/Loaders'

const PORTFOLIO_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE = 10 * 1024 * 1024

export default function PortfolioSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [general, setGeneral] = useState('')
  const [success, setSuccess] = useState('')
  const [titulo, setTitulo] = useState('')
  const [enlace, setEnlace] = useState('')
  const [file, setFile] = useState(null)
  const [fieldError, setFieldError] = useState('')

  const [editing, setEditing] = useState(null)
  const [editTitulo, setEditTitulo] = useState('')
  const [editEnlace, setEditEnlace] = useState('')
  const [editFile, setEditFile] = useState(null)
  const [editError, setEditError] = useState('')

  const [deleteItem, setDeleteItem] = useState(null)
  const [deleteWarning, setDeleteWarning] = useState('')

  const addFileRef = useRef(null)
  const editFileRef = useRef(null)

  function load() {
    getPortfolio()
      .then((res) => setItems(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function clearAdd() {
    setTitulo('')
    setEnlace('')
    setFile(null)
    setFieldError('')
    if (addFileRef.current) addFileRef.current.value = ''
  }

  async function handleAdd(e) {
    e.preventDefault()
    setGeneral('')
    setSuccess('')
    setFieldError('')

    if (!titulo.trim()) {
      setFieldError('El título es obligatorio')
      return
    }
    if (!file && !enlace.trim()) {
      setFieldError('Adjunta un archivo o ingresa un enlace')
      return
    }

    const formData = new FormData()
    formData.append('titulo', titulo.trim())
    if (file) {
      if (!PORTFOLIO_TYPES.includes(file.type) || file.size > MAX_SIZE) {
        setFieldError('Formato no soportado. Usa PDF, JPG, PNG o un enlace válido')
        return
      }
      formData.append('file', file)
    } else {
      formData.append('enlace', enlace.trim())
    }

    try {
      await createPortfolio(formData)
      clearAdd()
      setSuccess('Portafolio guardado correctamente')
      load()
    } catch (err) {
      const apiErrors = extractErrors(err)
      setFieldError(apiErrors.titulo || apiErrors.file || apiErrors.enlace || '')
      setGeneral(apiErrors.general || '')
    }
  }

  function startEdit(item) {
    setEditing(item.id)
    setEditTitulo(item.titulo)
    setEditEnlace(item.enlace_url || '')
    setEditFile(null)
    setEditError('')
    if (editFileRef.current) editFileRef.current.value = ''
  }

  async function handleEdit(e) {
    e.preventDefault()
    setGeneral('')
    setSuccess('')
    setEditError('')

    if (!editTitulo.trim()) {
      setEditError('El título es obligatorio')
      return
    }
    if (!editFile && !editEnlace.trim()) {
      setEditError('Adjunta un archivo o ingresa un enlace')
      return
    }

    const formData = new FormData()
    formData.append('titulo', editTitulo.trim())
    if (editFile) {
      if (!PORTFOLIO_TYPES.includes(editFile.type) || editFile.size > MAX_SIZE) {
        setEditError('Formato no soportado. Usa PDF, JPG, PNG o un enlace válido')
        return
      }
      formData.append('file', editFile)
    } else {
      formData.append('enlace', editEnlace.trim())
    }

    try {
      await updatePortfolio(editing, formData)
      setEditing(null)
      setSuccess('Portafolio guardado correctamente')
      load()
    } catch (err) {
      const apiErrors = extractErrors(err)
      setEditError(apiErrors.titulo || apiErrors.file || apiErrors.enlace || '')
      setGeneral(apiErrors.general || '')
    }
  }

  function confirmDelete(item) {
    setDeleteItem(item)
    setDeleteWarning('')
  }

  async function handleDelete(force) {
    const item = deleteItem
    try {
      await deletePortfolio(item.id, force)
      setDeleteItem(null)
      setDeleteWarning('')
      setSuccess('Documento eliminado')
      load()
    } catch (err) {
      const payload = err.response?.data
      if (err.response?.status === 409 && payload?.warning) {
        setDeleteWarning(payload.warning)
      } else {
        setDeleteItem(null)
        setDeleteWarning('')
        setGeneral(extractErrors(err).general || '')
      }
    }
  }

  if (loading) {
    return <PortfolioSkeleton />
  }

  const total = items.length

  return (
    <>
      <Alert message={general} />
      <Alert message={success} type="success" />

      <div className="split-view">
        <aside className="split-view-aside">
          <div className="card pv-card pv-identity">
            <div className="pf-hero-icon">
              <FolderIcon />
            </div>
            <h2 className="pv-name">Portafolio</h2>
            <p className="pf-count">
              {total === 0
                ? 'Sin elementos'
                : `${total} ${total === 1 ? 'elemento' : 'elementos'}`}
            </p>
          </div>

          <div className="card pv-card">
            <h3 className="pv-card-title">Agregar elemento</h3>
            {fieldError && <Alert message={fieldError} />}
            <form className="pf-form" onSubmit={handleAdd}>
              <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              <Input
                label="Enlace (Behance, Drive...)"
                value={enlace}
                onChange={(e) => setEnlace(e.target.value)}
              />
              <div className="field">
                <label className="field-label">Archivo</label>
                <button
                  type="button"
                  className="pf-file-btn"
                  onClick={() => addFileRef.current?.click()}
                >
                  <UploadIcon />
                  <span className="pf-file-name">{file ? file.name : 'Seleccionar archivo'}</span>
                </button>
                <input
                  ref={addFileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <span className="pf-hint">PDF, JPG o PNG · máximo 10 MB</span>
              </div>
              <Button type="submit">Guardar</Button>
            </form>
          </div>
        </aside>

        <div className="split-view-main">
          <div className="pv-main-top pv-main-top--split">
            <h3 className="pv-main-heading">Mis documentos</h3>
          </div>

          {total === 0 ? (
            <div className="card pv-card pf-empty">
              <div className="pf-empty-icon">
                <FolderIcon />
              </div>
              <p className="pf-empty-title">Tu portafolio está vacío</p>
              <p className="pf-empty-text">
                Aún no has agregado elementos a tu portafolio
              </p>
            </div>
          ) : (
            <div className="pf-list">
              {items.map((item) => (
                <div className="card pv-card pf-item" key={item.id}>
                  {editing === item.id ? (
                    <form className="pf-form pf-item-body" onSubmit={handleEdit}>
                      {editError && <Alert message={editError} />}
                      <div className="pv-grid">
                        <Input
                          label="Título"
                          value={editTitulo}
                          onChange={(e) => setEditTitulo(e.target.value)}
                        />
                        <Input
                          label="Enlace"
                          value={editEnlace}
                          onChange={(e) => setEditEnlace(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label className="field-label">Reemplazar archivo</label>
                        <button
                          type="button"
                          className="pf-file-btn"
                          onClick={() => editFileRef.current?.click()}
                        >
                          <UploadIcon />
                          <span className="pf-file-name">
                            {editFile ? editFile.name : 'Seleccionar archivo'}
                          </span>
                        </button>
                        <input
                          ref={editFileRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: 'none' }}
                          onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      <div className="inline-actions">
                        <Button type="submit">Guardar</Button>
                        <Button variant="secondary" onClick={() => setEditing(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="pf-item-icon">
                        {item.tipo === 'archivo' ? <DocIcon /> : <LinkIcon />}
                      </div>
                      <div className="pf-item-body">
                        <div className="pf-item-top">
                          <h4 className="pf-item-title">{item.titulo}</h4>
                          <span className="tag">
                            {item.tipo === 'archivo' ? 'Archivo' : 'Enlace'}
                          </span>
                        </div>
                        {item.enlace_url ? (
                          <a
                            href={item.enlace_url}
                            target="_blank"
                            rel="noreferrer"
                            className="pf-item-link"
                          >
                            {item.enlace_url}
                          </a>
                        ) : (
                          <a
                            href={item.archivo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="pf-item-link"
                          >
                            Ver documento
                          </a>
                        )}
                      </div>
                      <div className="pf-item-actions">
                        <button
                          type="button"
                          className="pf-action"
                          onClick={() => startEdit(item)}
                          title="Editar"
                          aria-label="Editar"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className="pf-action pf-action--danger"
                          onClick={() => confirmDelete(item)}
                          title="Eliminar"
                          aria-label="Eliminar"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteItem && (
        <ConfirmModal
          title={deleteWarning ? 'Advertencia' : 'Eliminar documento'}
          message={deleteWarning || '¿Seguro que deseas eliminar este documento?'}
          confirmText={deleteWarning ? 'Eliminar de todos modos' : 'Eliminar'}
          onConfirm={() => handleDelete(!!deleteWarning)}
          onCancel={() => {
            setDeleteItem(null)
            setDeleteWarning('')
          }}
        />
      )}
    </>
  )
}
