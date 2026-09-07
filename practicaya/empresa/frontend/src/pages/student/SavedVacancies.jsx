import React, { useState, useEffect } from 'react';
import { MapPin, Bookmark, Loader } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const SavedVacancies = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState(new Set());
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_URL}/api/student/saved_vacancies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVacancies(data);
        }
      })
      .catch(err => console.error('Error fetching saved vacancies:', err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRemove = async (vacancyId) => {
    if (removingIds.has(vacancyId)) return;
    setRemovingIds(prev => new Set(prev).add(vacancyId));

    try {
      const res = await fetch(`${API_URL}/api/student/saved_vacancies?vacancy_id=${vacancyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setVacancies(prev => prev.filter(v => v.id !== vacancyId));
      }
    } catch (err) {
      console.error('Error removing saved vacancy:', err);
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(vacancyId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
        <Loader size={24} className="spin" color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {vacancies.length} vacante{vacancies.length !== 1 ? 's' : ''} guardada{vacancies.length !== 1 ? 's' : ''}
        </p>
      </div>

      {vacancies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Bookmark size={48} color="var(--text-disabled)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No tienes vacantes guardadas</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Guarda vacantes que te interesen para revisarlas más tarde.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {vacancies.map((vacancy) => (
            <div key={vacancy.id} className="vacancy-card">
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {vacancy.logo_url ? (
                  <div className="company-logo-box" style={{ background: '#F8F9FB', border: '1px solid #E9EBF4' }}>
                    <img src={vacancy.logo_url.startsWith('http') ? vacancy.logo_url : `${API_URL}${vacancy.logo_url}`} alt={vacancy.company} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="company-logo-box" style={{ background: '#2563EB' }}>
                    {vacancy.company ? vacancy.company.charAt(0).toUpperCase() : 'E'}
                  </div>
                )}
                
                <div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{vacancy.title}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {vacancy.company}
                  </div>
                  <div style={{ color: '#A0A4B8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <MapPin size={12} /> {vacancy.location || 'Remoto'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span className="tag">{vacancy.type1}</span>
                <span className="tag">{vacancy.type2}</span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1 }}>
                {vacancy.description}
              </p>

              <div style={{ fontSize: '0.75rem', color: '#A0A4B8', marginTop: '1rem', marginBottom: '1.5rem' }}>
                Publicado el {vacancy.published}
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  className="btn-icon"
                  onClick={() => handleRemove(vacancy.id)}
                  disabled={removingIds.has(vacancy.id)}
                  style={{
                    color: 'var(--color-primary)',
                    opacity: removingIds.has(vacancy.id) ? 0.5 : 1
                  }}
                >
                  <Bookmark size={18} fill="var(--color-primary)" />
                </button>
                
                <button className="btn btn-primary" style={{ flex: 1 }}>
                  Ver detalles
                </button>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedVacancies;
