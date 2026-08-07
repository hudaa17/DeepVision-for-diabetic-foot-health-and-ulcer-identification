import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { LayoutDashboard, Users, Upload, Home, Shield, User, Settings, Stethoscope } from 'lucide-react';
import logo from '../logo.jpg';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isClinicianOrAdmin = ['clinician', 'admin'].includes(user.role);

  const menuItems = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    ...(isClinicianOrAdmin ? [
      { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { path: '/upload', label: 'Inference Upload', icon: <Upload size={18} /> }
    ] : []),
    { path: '/patients', label: 'Patient Registry', icon: <Users size={18} /> },
    { path: '/doctors', label: 'Clinicians', icon: <Stethoscope size={18} /> },
    { path: '/profile', label: 'Profile', icon: <User size={18} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={18} /> }
  ];

  return (
    <aside className="sidebar" style={{
      width: '260px',
      backgroundColor: 'var(--color-dark-navy)',
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--color-white)',
      padding: '32px 16px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 101,
      borderRight: '1px solid #1E293B',
      flexShrink: 0
    }}>
      {/* Header Branding */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', padding: '0 8px' }}>
        <img src={logo} alt="CuraVision" style={{
          width: '100%',
          maxWidth: '180px',
          borderRadius: '12px',
          objectFit: 'contain'
        }} />
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                color: isActive ? 'var(--color-white)' : '#94A3B8',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                transition: 'all var(--transition-fast)',
                borderLeft: isActive ? '4px solid var(--color-white)' : '4px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#1E293B';
                  e.currentTarget.style.color = 'var(--color-white)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Hospital Node / Security Info Footer */}
      <div style={{
        marginTop: 'auto',
        backgroundColor: '#1E293B',
        padding: '16px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        border: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981' }}>
          <Shield size={16} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>HIPAA Secured</span>
        </div>
        <p style={{ fontSize: '10px', color: '#94A3B8', lineHeight: 1.4 }}>
          This node is running in encrypted clinical sandbox mode. All events are logged.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
