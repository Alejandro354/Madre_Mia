import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const statusConfig = {
  'Enviada': { icon: Clock, color: '#638FE9', bg: '#EEF2FF', label: 'Enviada' },
  'En revisión': { icon: AlertCircle, color: '#F59E0B', bg: '#FFFBEB', label: 'En revisión' },
  'Aceptada': { icon: CheckCircle, color: '#10B981', bg: '#ECFDF5', label: 'Aceptada' },
  'Rechazada': { icon: XCircle, color: '#EF4444', bg: '#FEF2F2', label: 'Rechazada' },
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_URL}/api/student/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setApplications(data);
        }
      })
      .catch(err => console.error('Error fetching applications:', err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
        <Loader size={24} className="spin" color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {applications.length} postulación{applications.length !== 1 ? 'es' : ''} enviada{applications.length !== 1 ? 's' : ''}
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Clock size={48} color="var(--text-disabled)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No tienes postulaciones aún</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Explora las vacantes disponibles y postúlate a las que más te interesen.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map((app) => {
            const status = statusConfig[app.estado] || statusConfig['Enviada'];
            const StatusIcon = status.icon;
            
            return (
              <div key={app.id} className="card" style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
                transition: 'box-shadow 0.2s ease',
                cursor: 'default'
              }}>
                {/* Company Logo */}
                {app.logo_url ? (
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0,
                    border: '1px solid var(--border-color)'
                  }}>
                    <img 
                      src={app.logo_url.startsWith('http') ? app.logo_url : `${API_URL}${app.logo_url}`} 
                      alt={app.company} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                ) : (
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', background: '#2563EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0
                  }}>
                    {app.company?.[0]?.toUpperCase() || 'E'}
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>{app.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span>{app.company}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {app.location || 'Remoto'}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Postulado el {app.fecha_postulacion}
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    background: status.bg,
                    color: status.color
                  }}>
                    <StatusIcon size={14} />
                    {status.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
