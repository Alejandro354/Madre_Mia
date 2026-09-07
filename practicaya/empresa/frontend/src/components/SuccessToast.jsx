import React from 'react';
import { Check } from 'lucide-react';

const SuccessToast = ({ message }) => (
  <div className="toast-overlay">
    <div className="toast-card">
      <span className="toast-icon">
        <Check size={15} />
      </span>
      {message}
    </div>
  </div>
);

export default SuccessToast;
