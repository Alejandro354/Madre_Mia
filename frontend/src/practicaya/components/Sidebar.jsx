import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Bookmark,
  Inbox,
  Zap,
  LayoutDashboard,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const Sidebar = ({ mobileOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mocks user if not in local storage for preview purposes
  const user = JSON.parse(localStorage.getItem('user') || '{"role":"estudiante"}');

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === null ? true : saved === 'true';
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isStudent = user.role === 'estudiante';

  // El detalle de un estudiante (/empresa/estudiantes/:id) se puede abrir desde
  // Candidatos, Seleccionados o Postulaciones. Para que el sidebar resalte la
  // sección de la que en verdad vienes (y coincida con lo que hace la flechita
  // de "volver"), usamos el origen que cada página pasa por navigate(..., {state}).
  const isCandidateDetail = /^\/empresa\/estudiantes\/[^/]+/.test(location.pathname);
  const isVacancyApplicants = /^\/empresa\/vacantes\/[^/]+\/postulantes/.test(location.pathname);
  // El detalle de una vacante (/estudiante/vacantes/:id) se puede abrir desde
  // Vacantes, Mis postulaciones o Guardados; misma lógica que arriba.
  const isVacancyDetail = /^\/estudiante\/vacantes\/[^/]+/.test(location.pathname);
  const effectivePath = isCandidateDetail
    ? (location.state?.from || '/empresa/estudiantes')
    : isVacancyApplicants
      ? '/empresa/postulaciones'
      : isVacancyDetail
        ? (location.state?.from || '/estudiante/vacantes')
        : location.pathname;

  return (
    <>
      {/* Backdrop shown only on mobile when the drawer is open */}
      <div className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`} onClick={onClose} />

      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon-slot">
            <div style={{ background: 'var(--color-primary)', color: 'white', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={20} fill="currentColor" />
            </div>
          </span>
          <span className="sidebar-logo-label">PrácticaYa</span>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1 }}>
          {isStudent ? (
            <>
              <NavItem to="/estudiante/vacantes" icon={<Briefcase size={20} />} label="Vacantes" currentPath={effectivePath} collapsed={collapsed} />
              <NavItem to="/estudiante/postulaciones" icon={<Bookmark size={20} />} label="Mis postulaciones" currentPath={effectivePath} collapsed={collapsed} />
              <NavItem to="/estudiante/guardados" icon={<Bookmark size={20} />} label="Guardados" currentPath={effectivePath} collapsed={collapsed} />
            </>
          ) : (
            <>
              <NavItem to="/empresa" icon={<LayoutDashboard size={20} />} label="Dashboard" currentPath={effectivePath} exact collapsed={collapsed} />
              <NavItem to="/empresa/postulaciones" icon={<Inbox size={20} />} label="Postulaciones" currentPath={effectivePath} collapsed={collapsed} />
              <NavItem to="/empresa/estudiantes" icon={<Users size={20} />} label="Candidatos" currentPath={effectivePath} collapsed={collapsed} />
              <NavItem to="/empresa/candidatos" icon={<Bookmark size={20} />} label="Seleccionados" currentPath={effectivePath} collapsed={collapsed} />
            </>
          )}
        </nav>

        <button
          className="sidebar-toggle"
          onClick={toggleCollapsed}
          data-tooltip={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <span className="nav-icon-slot">
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </span>
          <span className="sidebar-toggle-label">Colapsar menú</span>
        </button>
      </div>
    </>
  );
};

const NavItem = ({ to, icon, label, currentPath, exact, collapsed }) => {
  // Check if active (exact match for index routes, prefix match otherwise)
  const isActive = exact ? currentPath === to : currentPath.includes(to);

  return (
    <NavLink
      to={to}
      end={exact}
      className={() => `nav-item ${isActive ? 'active' : ''}`}
      data-tooltip={collapsed ? label : undefined}
    >
      <span className="nav-icon-slot">{icon}</span>
      <span className="nav-label">{label}</span>
    </NavLink>
  );
};

export default Sidebar;
