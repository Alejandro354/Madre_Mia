import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, MessageSquare, ChevronDown, User, LogOut, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Topbar = ({ onMenuClick = () => {} }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem('user') || '{"email":"", "role":""}');

  const [profilePic, setProfilePic] = useState(localStorage.getItem('userProfilePic') || 'https://randomuser.me/api/portraits/men/32.jpg');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || (user.role === 'empresa' ? 'Mi Empresa' : 'Estudiante'));
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://127.0.0.1:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const name = res.data.profile?.nombre_empresa || res.data.profile?.nombre || 'Usuario';
        setUserName(name);
        localStorage.setItem('userName', name);

        const photo = res.data.profile?.logo_url || res.data.profile?.foto_url;
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
        const res = await axios.get('http://127.0.0.1:5000/api/chat/unread-count', {
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

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
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
    };
  }, []);

  // Refresh unread count whenever the user navigates to the chat page
  useEffect(() => {
    if (!location.pathname.includes('/chat')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const timeout = setTimeout(() => {
      axios.get('http://127.0.0.1:5000/api/chat/unread-count', {
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
        {!location.pathname.includes('/perfil') && !location.pathname.includes('/portafolio') && !location.pathname.includes('/chat') && !location.pathname.includes('/empresa/candidatos') && !location.pathname.includes('/empresa/estudiantes') && location.pathname !== '/empresa' && (
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
          <button style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)', 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer' 
          }}>
            <Bell size={20} />
          </button>
        </div>
        
        {/* Profile with Dropdown */}
        <div 
          className="profile-widget" 
          ref={dropdownRef}
          style={{ position: 'relative', cursor: 'pointer', gap: '1rem' }}
          onClick={() => setDropdownOpen(!dropdownOpen)}
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
