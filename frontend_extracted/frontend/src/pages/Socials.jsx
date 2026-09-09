import { useEffect, useState } from 'react'

import { extractErrors } from '../api/client'
import { deleteSocial, getSocials, saveSocial } from '../api/socials'
import Alert from '../components/Alert'
import Button from '../components/Button'
import { UnlinkIcon } from '../components/icons'
import Input from '../components/Input'
import { validateSocialUrl } from '../utils/validators'

const NETWORKS = [
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/usuario' },
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/usuario' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/usuario' },
]

export default function SocialsSection() {
  const [socials, setSocials] = useState({})
  const [values, setValues] = useState({ linkedin: '', github: '', instagram: '' })
  const [errors, setErrors] = useState({})
  const [general, setGeneral] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSocials()
      .then((res) => {
        const map = {}
        const vals = { linkedin: '', github: '', instagram: '' }
        for (const s of res.data.socials) {
          map[s.red] = s.url
          vals[s.red] = s.url
        }
        setSocials(map)
        setValues(vals)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleChange(red, value) {
    setValues({ ...values, [red]: value })
  }

  async function handleSave(red) {
    setGeneral('')
    setSuccess('')
    const err = validateSocialUrl(red, values[red])
    setErrors({ [red]: err })
    if (err) return

    try {
      await saveSocial({ red, url: values[red] })
      setSocials({ ...socials, [red]: values[red] })
      setSuccess('Red social guardada')
    } catch (e) {
      const apiErrors = extractErrors(e)
      setErrors({ [red]: apiErrors.url || '' })
      setGeneral(apiErrors.general || '')
    }
  }

  async function handleDelete(red) {
    setGeneral('')
    setSuccess('')
    try {
      await deleteSocial(red)
      const next = { ...socials }
      delete next[red]
      setSocials(next)
      setValues({ ...values, [red]: '' })
      setSuccess('Red social desvinculada')
    } catch (e) {
      setGeneral(extractErrors(e).general || '')
    }
  }

  if (loading) {
    return null
  }

  return (
    <div className="card pv-card">
      <h3 className="pv-card-title">Redes sociales</h3>
      <Alert message={general} />
      <Alert message={success} type="success" />
      {NETWORKS.map((net) => (
        <div className="social-row" key={net.key}>
          <span className={`pv-social-badge${socials[net.key] ? '' : ' pv-social-badge--off'}`}>
            {net.label.charAt(0)}
          </span>
          <span className="social-label">{net.label}</span>
          <div className="social-field">
            <Input
              placeholder={net.placeholder}
              value={values[net.key]}
              onChange={(e) => handleChange(net.key, e.target.value)}
              error={errors[net.key]}
            />
          </div>
          <div className="social-actions">
            <Button variant="secondary" onClick={() => handleSave(net.key)}>
              Guardar
            </Button>
            {socials[net.key] && (
              <button
                type="button"
                className="pf-action pf-action--danger"
                onClick={() => handleDelete(net.key)}
                title="Desvincular"
                aria-label="Desvincular"
              >
                <UnlinkIcon />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
