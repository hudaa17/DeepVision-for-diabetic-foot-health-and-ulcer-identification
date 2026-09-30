import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  LayoutGrid, 
  Users, 
  Scan, 
  Crosshair, 
  FileText, 
  Bot, 
  BarChart3, 
  Cpu, 
  SlidersHorizontal,
  HelpCircle,
  LogOut,
  Stethoscope
} from 'lucide-react';
import doctorAvatar from '../assets/doctor_ananya_rao.jpg';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} /> },
    { path: '/patients', label: 'Patients', icon: <Users size={18} /> },
    { path: '/upload', label: 'Image Analysis', icon: <Scan size={18} /> },
    { path: '/predictions/current', label: 'Predictions & Grad-CAM', icon: <Crosshair size={18} /> },
    { path: '/reports/current', label: 'Reports', icon: <FileText size={18} /> },
    { path: '#ai-assistant', label: 'AI Assistant', icon: <Bot size={18} />, isAction: true },
    { path: '/dashboard#analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { path: '/settings#model', label: 'Model & System', icon: <Cpu size={18} /> },
    { path: '/settings', label: 'Settings', icon: <SlidersHorizontal size={18} /> }
  ];

  return (
    <aside className="clinical-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Stethoscope size={20} strokeWidth={2.4} />
        </div>
        <div className="brand-text-block">
          <span className="brand-title">CuraVision</span>
          <span className="brand-subtitle">DEEPVISION AI CDSS</span>
        </div>
      </div>

      {/* Main Nav Items */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path.startsWith('/predictions') && location.pathname.startsWith('/predictions')) ||
            (item.path.startsWith('/reports') && location.pathname.startsWith('/reports'));

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      <div className="sidebar-footer">
        <div className="sidebar-help-link">
          <HelpCircle size={15} />
          <span>Help & Clinical Support</span>
        </div>

        {/* System Status Box */}
        <div className="system-status-box">
          <div className="status-header">
            <span>SYSTEM STATUS</span>
            <span className="status-percent">99.98%</span>
          </div>
          <div className="status-indicator-line">
            <span className="status-live-dot"></span>
            <span>All inference clusters online</span>
          </div>
        </div>

        {/* User Card */}
        <div className="clinician-profile-card">
          <img 
            src={doctorAvatar} 
            alt="Dr. Ananya Rao" 
            className="clinician-avatar" 
          />
          <div className="clinician-info">
            <span className="clinician-name">
              {user?.full_name || 'Dr. Ananya Rao, MD'}
            </span>
            <span className="clinician-role">Lead Podiatrist</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn-logout-icon"
            title="Log out of clinical session"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
