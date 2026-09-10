import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Eye, EyeOff, Zap } from 'lucide-react';

const Login = () => {
  const [roleMode, setRoleMode] = useState('estudiante'); // 'estudiante' or 'empresa'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor llena todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/practicaya/api/auth/login', {
        email,
        password
      });

      if (response.data.access_token) {
        const actualRole = response.data.user.role;

        if (actualRole !== roleMode) {
          setError(
            actualRole === 'empresa'
              ? 'Esta cuenta es de una empresa. Selecciona "Soy empresa" para iniciar sesión.'
              : 'Esta cuenta es de un estudiante. Selecciona "Soy estudiante" para iniciar sesión.'
          );
          return;
        }

        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Clear cached display data from any previous session so the topbar
        // never briefly shows a stale name/photo from a different account.
        localStorage.removeItem('userName');
        localStorage.removeItem('userProfilePic');

        // Redirect based on role returned from DB
        if (actualRole === 'estudiante') {
          navigate('/estudiante/vacantes');
        } else {
          navigate('/empresa');
        }
      }
    } catch (err) {
      if (err.response && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Ocurrió un error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F4F5FA',
      position: 'relative',
      padding: '1rem'
    }}>
      {/* Top Left: back link + Logo */}
      <div style={{ position: 'absolute', top: '2rem', left: '3rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', textDecoration: 'none' }}
        >
          <ArrowLeft size={16} />
          Volver a inicio
        </Link>
        <div className="auth-logo-placeholder" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--color-primary)', color: 'white', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={20} fill="currentColor" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>PrácticaYa</span>
        </div>
      </div>

      <div className="auth-card" style={{
        background: 'white',
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.03)'
      }}>
        
        {/* Segmented Control */}
        <div style={{
          display: 'flex',
          background: '#F4F5FA',
          padding: '4px',
          borderRadius: '50px',
          marginBottom: '2.5rem'
        }}>
          <button 
            type="button"
            onClick={() => setRoleMode('estudiante')}
            style={{
              flex: 1,
              padding: '0.6rem 0',
              border: 'none',
              borderRadius: '50px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: roleMode === 'estudiante' ? 'white' : 'transparent',
              color: roleMode === 'estudiante' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: roleMode === 'estudiante' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Soy estudiantes
          </button>
          <button 
            type="button"
            onClick={() => setRoleMode('empresa')}
            style={{
              flex: 1,
              padding: '0.6rem 0',
              border: 'none',
              borderRadius: '50px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: roleMode === 'empresa' ? 'white' : 'transparent',
              color: roleMode === 'empresa' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: roleMode === 'empresa' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Soy empresa
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            ¡Bienvenido de nuevo!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Inicia sesión para continuar
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'var(--bg-tag)', 
            color: 'var(--color-primary)', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Correo Electronico*
            </label>
            <input 
              type="email" 
              placeholder="Ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Contraseña*
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 3rem 0.75rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-disabled)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <a href="#" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              ¿Olvidaste Tu Contraseña?
            </a>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '40px', padding: '0 1rem', fontSize: '0.875rem' }}
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Regístrate para obtener acceso </span>
          <Link to="/register" style={{ fontWeight: '600', color: 'var(--color-primary)', textDecoration: 'none' }}>
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
