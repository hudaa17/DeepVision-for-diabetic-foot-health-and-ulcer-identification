import React, { useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Search, Sun, Moon } from 'lucide-react';
import logo from '../logo.jpg';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(document.documentElement.getAttribute('data-theme') === 'dark');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const toggleTheme = () => {
    const nextTheme = darkMode ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    setDarkMode(!darkMode);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Redirect to patients lists with query
      navigate(`/patients?search=${encodeURIComponent(e.target.value)}`);
    }
  };

  if (!user) return null;

  return (
    <nav className="navbar" style={{
      height: '70px',
      backgroundColor: 'var(--color-white)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      
      {/* Left: Branding & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignSelf: 'center', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="CuraVision Logo" style={{
            height: '48px',
            borderRadius: '8px',
            objectFit: 'contain'
          }} />
        </div>

        {/* Global Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid var(--color-border)',
          borderRadius: '10px',
          padding: '6px 12px',
          backgroundColor: 'var(--color-bg)',
          width: '260px'
        }}>
          <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            placeholder="Search registry patients..."
            onKeyDown={handleSearchKeyPress}
            style={{
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '13px',
              width: '100%',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>
      </div>

      {/* Profile & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* System Health Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success)',
            boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)'
          }}></span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Active
          </span>
        </div>

        {/* Notifications */}
        <button style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          borderRadius: '8px',
          transition: 'background var(--transition-fast)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Bell size={20} />
        </button>

        {/* Divider */}
        <span style={{ height: '24px', width: '1px', backgroundColor: 'var(--color-border)' }}></span>

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            fontWeight: 'bold'
          }}>
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {user.full_name || 'System User'}
            </span>
            <span className={`badge ${
              user.role === 'admin' ? 'badge-gold' : user.role === 'clinician' ? 'badge-ai' : 'badge-normal'
            }`} style={{ padding: '2px 8px', fontSize: '10px', width: 'fit-content', marginTop: '2px' }}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FEF2F2';
            e.currentTarget.style.transform = 'translateX(2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'none';
          }}
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
