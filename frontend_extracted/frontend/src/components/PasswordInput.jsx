import { useState } from 'react'

export default function PasswordInput({ label, error, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className="field-input-wrap">
        <input
          className={`field-input${error ? ' field-input--error' : ''}`}
          type={visible ? 'text' : 'password'}
          {...props}
        />
        <button
          type="button"
          className="field-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
