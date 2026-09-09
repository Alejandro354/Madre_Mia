import React, { useEffect, useState } from 'react';
import { Briefcase, FileText, UserCheck } from 'lucide-react';
import { StatTile, VacancyBarChart, StatusBarChart, TrendChart } from '../../components/charts/DashboardCharts';

const API_URL = '/practicaya';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_URL}/api/company/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar estadísticas');
        return res.json();
      })
      .then(data => setStats(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Cargando estadísticas...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1rem' }}>
        No se pudieron cargar las estadísticas del panel.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      {/* KPI row */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <StatTile
          label="Vacantes activas"
          value={stats.vacantes_activas}
          icon={<Briefcase size={20} />}
        />
        <StatTile
          label="Postulaciones recibidas"
          value={stats.postulaciones_totales}
          icon={<FileText size={20} />}
          accent="#2a78d6"
        />
        <StatTile
          label="Candidatos seleccionados"
          value={stats.candidatos_seleccionados}
          icon={<UserCheck size={20} />}
          accent="#0ca30c"
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
        <div style={{
          flex: '1 1 380px',
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Postulaciones por vacante</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Qué vacantes están atrayendo más candidatos
          </p>
          <VacancyBarChart
            data={stats.postulaciones_por_vacante}
            emptyMessage="Aún no has publicado vacantes."
          />
        </div>

        <div style={{
          flex: '1 1 380px',
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Estado de postulaciones</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            En qué etapa del proceso están tus candidatos
          </p>
          <StatusBarChart data={stats.estado_postulaciones} />
        </div>
      </div>

      <div style={{
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Postulaciones en los últimos 30 días</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Actividad de postulaciones recibidas día a día
        </p>
        <TrendChart data={stats.postulaciones_por_dia} />
      </div>
    </div>
  );
};

export default Dashboard;
