import { useEffect, useState } from 'react'

import { getSocials } from '../api/socials'
import { CameraIcon, MailIcon, PencilIcon, PinIcon } from './icons'

const NETWORKS = [
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'github', label: 'GitHub' },
  { key: 'instagram', label: 'Instagram' },
]

function Field({ label, value }) {
  return (
    <div className="pv-field">
      <span className="pv-field-label">{label}</span>
      <span className="pv-field-value">{value || '—'}</span>
    </div>
  )
}

export default function ProfileView({ user, form, fotoUrl, onEdit, onPhotoClick }) {
  const [socials, setSocials] = useState({})

  useEffect(() => {
    getSocials()
      .then((res) => {
        const map = {}
        for (const s of res.data.socials) {
          map[s.red] = s.url
        }
        setSocials(map)
      })
      .catch(() => {})
  }, [])

  const ubicacion = form.ciudad ? `${form.ciudad}, Colombia` : 'Sin ciudad registrada'

  return (
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
              onClick={onPhotoClick}
              title="Cambiar foto de perfil"
              aria-label="Cambiar foto de perfil"
            >
              <CameraIcon />
            </button>
          </div>

          <h2 className="pv-name">{user?.nombre_completo}</h2>
          {form.programa && <p className="pv-role">{form.programa}</p>}

          <ul className="pv-meta">
            <li className="pv-meta-item">
              <PinIcon />
              <span>{ubicacion}</span>
            </li>
            <li className="pv-meta-item">
              <MailIcon />
              <span>{user?.email}</span>
            </li>
          </ul>
        </div>

        <div className="card pv-card">
          <h3 className="pv-card-title">Redes sociales</h3>
          <ul className="pv-socials">
            {NETWORKS.map((net) => {
              const url = socials[net.key]
              return (
                <li className="pv-social" key={net.key}>
                  <span className={`pv-social-badge${url ? '' : ' pv-social-badge--off'}`}>
                    {net.label.charAt(0)}
                  </span>
                  {url ? (
                    <a
                      className="pv-social-link"
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {net.label}
                    </a>
                  ) : (
                    <span className="pv-social-link pv-social-link--off">Sin vincular</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      <div className="split-view-main">
        <div className="pv-main-top">
          <button type="button" className="pv-edit-btn" onClick={onEdit}>
            <PencilIcon />
            Editar perfil
          </button>
        </div>

        <section className="card pv-card">
          <h3 className="pv-card-title">Datos personales</h3>
          <div className="pv-grid">
            <Field label="Nombre completo" value={user?.nombre_completo} />
            <Field label="Fecha de nacimiento" value={form.fecha_nacimiento} />
            <Field label="Teléfono" value={form.telefono} />
            <Field label="Correo electrónico" value={user?.email} />
            <Field label="Ciudad" value={form.ciudad} />
          </div>
        </section>

        <section className="card pv-card">
          <h3 className="pv-card-title">Datos académicos</h3>
          <div className="pv-grid">
            <Field label="Institución educativa" value={form.institucion} />
            <Field label="Programa académico" value={form.programa} />
            <Field label="Semestre" value={form.semestre} />
          </div>
        </section>

        <section className="card pv-card">
          <h3 className="pv-card-title">Descripción profesional</h3>
          {form.descripcion ? (
            <p className="pv-desc">{form.descripcion}</p>
          ) : (
            <p className="pv-desc pv-desc--empty">
              Aún no has escrito una descripción. Edita tu perfil para agregarla.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
