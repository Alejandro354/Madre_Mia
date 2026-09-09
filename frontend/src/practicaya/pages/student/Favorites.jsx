import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../../api/favorites';
import { apply } from '../../api/applications';
import VacancyCard from '../../components/VacancyCard';
import SuccessToast from '../../components/SuccessToast';
import ErrorToast from '../../components/ErrorToast';

const Favorites = () => {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    getFavorites()
      .then((res) => setVacancies(res.data.vacancies.map((v) => ({ ...v, guardada: true }))))
      .catch(() => setError('No se pudieron cargar tus vacantes guardadas'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRemove(vacancy) {
    try {
      await removeFavorite(vacancy.id);
      setVacancies((prev) => prev.filter((v) => v.id !== vacancy.id));
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
      setTimeout(() => setError(''), 2600);
    }
  }

  async function handleApply(vacancy) {
    setBusyId(vacancy.id);
    try {
      await apply(vacancy.id);
      setVacancies((prev) => prev.map((v) => (v.id === vacancy.id ? { ...v, aplicada: true } : v)));
      setSuccess('Postulación enviada con éxito');
      setTimeout(() => setSuccess(''), 1600);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 409) {
        setVacancies((prev) => prev.map((v) => (v.id === vacancy.id ? { ...v, aplicada: true } : v)));
        setError('Ya te has postulado a esta vacante');
      } else if (data?.missing_section) {
        setError('Completa tu perfil antes de postularte');
      } else {
        setError(data?.msg || 'Ocurrió un error. Intenta de nuevo.');
      }
      setTimeout(() => setError(''), 2600);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      {loading ? (
        <p>Cargando...</p>
      ) : vacancies.length === 0 ? (
        <p>No tienes vacantes guardadas. <Link to="/estudiante/vacantes">Ver vacantes</Link></p>
      ) : (
        <div className="grid-cards">
          {vacancies.map((v) => (
            <VacancyCard
              key={v.id}
              vacancy={v}
              busy={busyId === v.id}
              onOpen={() => navigate(`/estudiante/vacantes/${v.id}`, { state: { from: '/estudiante/guardados' } })}
              onApply={() => handleApply(v)}
              onFavorite={() => handleRemove(v)}
            />
          ))}
        </div>
      )}

      {success && <SuccessToast message={success} />}
      {error && <ErrorToast message={error} />}
    </div>
  );
};

export default Favorites;
