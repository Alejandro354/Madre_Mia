import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, MessageSquare, ChevronDown, User, LogOut, Menu, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { resolveMediaUrl } from '../utils/media';

const Topbar = ({ onMenuClick = () => {} }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{"email":"", "role":""}');

  const [profilePic, setProfilePic] = useState(localStorage.getItem('userProfilePic') || 'https://randomuser.me/api/portraits/men/32.jpg');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || (user.role === 'empresa' ? 'Mi Empresa' : 'Estudiante'));
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('/practicaya/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profile = res.data.user?.profile;
        const name = profile?.nombre_empresa || profile?.nombre || 'Usuario';
        setUserName(name);
        localStorage.setItem('userName', name);

        const photo = resolveMediaUrl(profile?.logo_url || profile?.foto_url);
        if (photo) {
          setProfilePic(photo);
          localStorage.setItem('userProfilePic', photo);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('/practicaya/api/chat/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(res.data.unread_count || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnreadCount();
    const unreadInterval = setInterval(fetchUnreadCount, 10000);
    window.addEventListener('messagesRead', fetchUnreadCount);

    const fetchUnreadNotifCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('/practicaya/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadNotifCount(res.data.unread_count || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnreadNotifCount();
    const notifInterval = setInterval(fetchUnreadNotifCount, 15000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handlePicUpdate = () => {
      setProfilePic(localStorage.getItem('userProfilePic'));
    };
    const handleNameUpdate = () => {
      setUserName(localStorage.getItem('userName') || userName);
    };
    window.addEventListener('profilePicUpdated', handlePicUpdate);
    window.addEventListener('profileNameUpdated', handleNameUpdate);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('profilePicUpdated', handlePicUpdate);
      window.removeEventListener('profileNameUpdated', handleNameUpdate);
      window.removeEventListener('messagesRead', fetchUnreadCount);
      clearInterval(unreadInterval);
      clearInterval(notifInterval);
    };
  }, []);

  // Refresh unread count whenever the user navigates to the chat page
  useEffect(() => {
    if (!location.pathname.includes('/chat')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const timeout = setTimeout(() => {
      axios.get('/practicaya/api/chat/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setUnreadCount(res.data.unread_count || 0)).catch(err => console.error(err));
    }, 800);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userProfilePic');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('/practicaya/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotif = () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    setDropdownOpen(false);
    if (opening) fetchNotifications();
  };

  const handleNotificationClick = async (notification) => {
    setNotifOpen(false);
    const token = localStorage.getItem('token');
    if (!notification.leido) {
      try {
        await axios.put(`/practicaya/api/notifications/${notification.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadNotifCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      await axios.put('/practicaya/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
      setUnreadNotifCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const timeAgo = (iso) => {
    if (!iso) return '';
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} d`;
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    if (user.role === 'estudiante') {
      navigate('/estudiante/perfil');
    } else {
      navigate('/empresa/perfil');
    }
  };

  const getPageInfo = () => {
    if (location.pathname.includes('/estudiante/vacantes')) {
      return { title: 'Vacantes', subtitle: '' };
    }
    if (location.pathname.includes('/estudiante/perfil') || location.pathname.includes('/estudiante/portafolio') || location.pathname.includes('/empresa/perfil')) {
      return { title: 'Mi perfil', subtitle: 'Mantén tu información actualizada para destacar entre los candidatos' };
    }
    if (location.pathname.includes('/estudiante/postulaciones')) {
      return { title: 'Mis postulaciones', subtitle: 'Haz seguimiento a tus procesos' };
    }
    if (location.pathname.includes('/estudiante/guardados')) {
      return { title: 'Guardados', subtitle: 'Vacantes que guardaste para revisar después' };
    }
    if (location.pathname.includes('/empresa/estudiantes')) {
      return { title: 'Candidatos', subtitle: 'Descubre y contacta al mejor talento para tu equipo' };
    }
    if (location.pathname.includes('/empresa/candidatos')) {
      return { title: 'Seleccionados', subtitle: 'Candidatos que has guardado para seguir de cerca' };
    }
    if (location.pathname.includes('/empresa/vacantes')) {
      return { title: 'Postulantes', subtitle: 'Revisa, acepta o rechaza a quienes se postularon' };
    }
    if (location.pathname.includes('/empresa/postulaciones')) {
      return { title: 'Postulaciones', subtitle: 'Revisa, acepta o rechaza a quienes se postularon a tus vacantes' };
    }
    if (location.pathname.includes('/chat')) {
      return { title: 'Mensaje', subtitle: 'Comunicación directa con candidatos' };
    }
    if (location.pathname === '/empresa') {
      return { title: 'Dashboard', subtitle: 'Resumen general de tu actividad como empresa' };
    }
    return { title: 'Panel', subtitle: 'Bienvenido a PrácticaYa' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
          <p className="topbar-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {!location.pathname.includes('/perfil') && !location.pathname.includes('/portafolio') && !location.pathname.includes('/chat') && !location.pathname.includes('/empresa/candidatos') && !location.pathname.includes('/empresa/estudiantes') && !location.pathname.includes('/empresa/postulaciones') && !location.pathname.includes('/empresa/vacantes') && location.pathname !== '/empresa' && (
          <div className="search-input">
            <Search size={18} color="var(--text-disabled)" />
            <input type="text" placeholder="Label" />
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate(`/${user.role}/chat`)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: location.pathname.includes('/chat') ? 'var(--color-primary)' : 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                borderRadius: '9px',
                background: 'var(--color-primary)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                border: '2px solid white'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={handleToggleNotif}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: notifOpen ? 'var(--color-primary)' : 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Bell size={20} />
              {unreadNotifCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-8px',
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 4px',
                  borderRadius: '9px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  border: '2px solid white'
                }}>
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="profile-dropdown" style={{ top: '140%', right: '-1rem', width: '340px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Notificaciones</span>
                  {unreadNotifCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none',
                        color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0,
                      }}
                    >
                      <Check size={13} /> Marcar todas
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <p style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      No tienes notificaciones
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '100%', textAlign: 'left',
                          padding: '0.75rem 1rem', border: 'none', borderBottom: '1px solid var(--border-color)',
                          background: n.leido ? 'transparent' : 'var(--bg-tag)', cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: n.leido ? 500 : 700, lineHeight: 1.4 }}>
                          {n.mensaje}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>{timeAgo(n.created_at)}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Profile with Dropdown */}
        <div 
          className="profile-widget" 
          ref={dropdownRef}
          style={{ position: 'relative', cursor: 'pointer', gap: '1rem' }}
          onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
        >
          <div className="profile-info" style={{ textAlign: 'right' }}>
            <div className="profile-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
              {userName}
            </div>
            <div className="profile-role" style={{ textTransform: 'capitalize' }}>{user.role}</div>
          </div>
          <img 
            src={profilePic} 
            alt="Profile Avatar" 
            className="profile-avatar"
          />
          <ChevronDown size={16} color="var(--text-secondary)" />

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="profile-dropdown" style={{ top: '120%' }}>
              <button className="dropdown-item" onClick={handleProfile}>
                <User size={18} />
                Mi perfil
              </button>
              <button className="dropdown-item" onClick={handleLogout} style={{ borderTop: '1px solid var(--border-color)' }}>
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
