import './ConfirmDialog.css'

function ConfirmDialog({ title, message, error, confirmLabel = 'Aceptar', cancelLabel = 'Cancelar', danger, loading, onConfirm, onCancel }) {
  return (
    <div className="confirm-dialog__backdrop" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(event) => event.stopPropagation()}>
        <h2>{title}</h2>
        <p className="confirm-dialog__message">{message}</p>
        {error && <p className="confirm-dialog__error">{error}</p>}

        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__cancel" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-dialog__confirm ${danger ? 'confirm-dialog__confirm--danger' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Un momento…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
