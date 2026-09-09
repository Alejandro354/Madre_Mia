import React from 'react';
import { X } from 'lucide-react';

const ConfirmModal = ({
  title,
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
      <div className="modal-header">
        <h3 className="modal-title">{title}</h3>
        <button className="modal-close" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>
      <div className="modal-body">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{message}</p>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          {cancelText}
        </button>
        <button type="button" className="btn btn-primary" onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
