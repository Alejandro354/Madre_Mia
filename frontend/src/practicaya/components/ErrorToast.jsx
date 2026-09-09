import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorToast = ({ message }) => (
  <div className="toast-overlay toast-overlay-error">
    <div className="toast-card">
      <span className="toast-icon toast-icon-error">
        <AlertCircle size={15} />
      </span>
      {message}
    </div>
  </div>
);

export default ErrorToast;
