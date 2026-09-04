import { useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'

import { extractErrors } from '../api/client'
import { getProfile, saveProfile, uploadPhoto } from '../api/profile'
import Alert from '../components/Alert'
import Button from '../components/Button'
import { CameraIcon } from '../components/icons'
import Input from '../components/Input'
import ProfileView from '../components/ProfileView'
import Topbar from '../components/Topbar'
import { useAuth } from '../context/AuthContext'
import { validateProfile } from '../utils/validators'
import PortfolioSection from './Portfolio'
import SocialsSection from './Socials'

const emptyForm = {
  fecha_nacimiento: '',
  telefono: '',
  institucion: '',
  programa: '',
  semestre: '',
  ciudad: '',
  descripcion: '',
}

export default function Profile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [general, setGeneral] = useState('')
  const [fotoUrl, setFotoUrl] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('perfil')
  const [editing, setEditing] = useState(false)
  const fileRef = useRef(null)

  const blocker = useBlocker(dirty)

  useEffect(() => {
    getProfile()
      .then((res) => {
        if (res.data.profile) {
          const p = res.data.profile
          setForm({
            fecha_nacimiento: p.fecha_nacimiento || '',
            telefono: p.telefono || '',
            institucion: p.institucion || '',
            programa: p.programa || '',
            semestre: p.semestre || '',
            ciudad: p.ciudad || '',
            descripcion: p.descripcion || '',
          })
          setFotoUrl(p.foto_url)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function onBeforeUnload(e) {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setDirty(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validateProfile(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setGeneral('')
    setSuccess('')
    try {
      await saveProfile(form)
      setDirty(false)
      setEditing(false)
      setSuccess('Perfil actualizado correctamente')
      setErrors({})
    } catch (err) {
      const apiErrors = extractErrors(err)
      setErrors(apiErrors)
      setGeneral(apiErrors.general || '')
    }
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const isImage = ['image/jpeg', 'image/png'].includes(file.type)
    if (!isImage || file.size > 5 * 1024 * 1024) {
      setGeneral('Formato no válido o archivo demasiado pesado. Usa JPG o PNG de máximo 5 MB')
      setSuccess('')
      return
    }

    setGeneral('')
    try {
      const res = await uploadPhoto(file)
      setFotoUrl(res.data.foto_url)
      setUser((prev) => (prev ? { ...prev } : prev))
      setSuccess('Foto de perfil actualizada')
    } catch (err) {
      const apiErrors = extractErrors(err)
      setGeneral(apiErrors.file || apiErrors.general || '')
      setSuccess('')
    }
  }

  if (loading) {
    return <div className="page-loading">Cargando...</div>
  }

  const hasProfile = Boolean(form.fecha_nacimiento || form.telefono || form.institucion)

  return (
    <>
      <Topbar title="Mi Perfil" subtitle="Tu información y tu portafolio." />
      <div className="page page--wide">
        <div className="tabs">
        <button
          type="button"
          className={`tab${tab === 'perfil' ? ' tab--active' : ''}`}
          onClick={() => setTab('perfil')}
        >
          Perfil
        </button>
        <button
          type="button"
          className={`tab${tab === 'portafolio' ? ' tab--active' : ''}`}
          onClick={() => setTab('portafolio')}
        >
          Portafolio
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={handlePhoto}
      />

      {tab === 'perfil' && (
        <>
          <Alert message={general} />
          <Alert message={success} type="success" />
        </>
      )}

      {tab === 'perfil' && hasProfile && !editing && (
        <ProfileView
          user={user}
          form={form}
          fotoUrl={fotoUrl}
          onEdit={() => setEditing(true)}
          onPhotoClick={() => fileRef.current?.click()}
        />
      )}

      {tab === 'perfil' && (hasProfile === false || editing) && (
        <div className="split-view">
          <aside className="split-view-aside">
            <div className="card pv-card pv-identity">
              <div className="pv-avatar-wrap">
                {fotoUrl ? (
                  <img className="pv-avatar" src={fotoUrl} alt="Foto de perfil" />
                ) : (
                  <div className="pv-avatar pv-avatar--empty">Sin foto</div>
                )}
                <button
                  type="button"
                  className="pv-avatar-btn"
                  onClick={() => fileRef.current?.click()}
                  title="Cambiar foto de perfil"
                  aria-label="Cambiar foto de perfil"
                >
                  <CameraIcon />
                </button>
              </div>

              <h2 className="pv-name">{user?.nombre_completo}</h2>
              <p className="pv-role">{user?.email}</p>
              <button
                type="button"
                className="pf-file-btn pf-file-btn--center"
                onClick={() => fileRef.current?.click()}
              >
                Cambiar foto
              </button>
              <span className="pf-hint">JPG o PNG · máximo 5 MB</span>
            </div>
          </aside>

          <div className="split-view-main">
            <form onSubmit={handleSubmit} noValidate>
              <div className="pv-main-top pv-main-top--split">
                <h3 className="pv-main-heading">
                  {editing ? 'Editar perfil' : 'Completa tu perfil'}
                </h3>
                <div className="pv-main-actions">
                  {editing && (
                    <Button variant="secondary" onClick={() => setEditing(false)}>
                      Cancelar
                    </Button>
                  )}
                  <Button type="submit">Guardar perfil</Button>
                </div>
              </div>

              <section className="card pv-card">
                <h3 className="pv-card-title">Datos personales</h3>
                <div className="pv-grid">
                  <Input
                    label="Fecha de nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    value={form.fecha_nacimiento}
                    onChange={handleChange}
                    error={errors.fecha_nacimiento}
                  />
                  <Input
                    label="Teléfono"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    error={errors.telefono}
                  />
                  <Input
                    label="Ciudad"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    error={errors.ciudad}
                  />
                </div>
              </section>

              <section className="card pv-card">
                <h3 className="pv-card-title">Datos académicos</h3>
                <div className="pv-grid">
                  <Input
                    label="Institución"
                    name="institucion"
                    value={form.institucion}
                    onChange={handleChange}
                    error={errors.institucion}
                  />
                  <Input
                    label="Programa"
                    name="programa"
                    value={form.programa}
                    onChange={handleChange}
                    error={errors.programa}
                  />
                  <Input
                    label="Semestre"
                    name="semestre"
                    value={form.semestre}
                    onChange={handleChange}
                    error={errors.semestre}
                  />
                </div>
              </section>

              <section className="card pv-card">
                <h3 className="pv-card-title">Descripción profesional</h3>
                <div className="field">
                  <textarea
                    className="field-input"
                    name="descripcion"
                    rows="5"
                    placeholder="Cuéntanos un poco sobre ti"
                    value={form.descripcion}
                    onChange={handleChange}
                  />
                </div>
              </section>
            </form>

            <SocialsSection />
          </div>
        </div>
      )}

        {tab === 'portafolio' && <PortfolioSection />}

        {blocker.state === 'blocked' && (
          <div className="modal-overlay">
            <div className="modal">
              <h3 className="modal-title">Cambios sin guardar</h3>
              <p className="modal-text">Tienes cambios sin guardar. ¿Seguro que deseas salir?</p>
              <div className="modal-actions">
                <Button variant="secondary" onClick={() => blocker.reset()}>
                  Cancelar
                </Button>
                <Button onClick={() => blocker.proceed()}>Descartar y salir</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
