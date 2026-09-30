import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Search, Bell, Plus, ChevronRight } from 'lucide-react';
import doctorAvatar from '../assets/doctor_ananya_rao.jpg';

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`/patients?search=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  return (
    <header className="clinical-navbar">
      {/* Left: Clinical Breadcrumbs & Active Model Pill */}
      <div className="nav-breadcrumbs">
        <Link to="/dashboard" className="crumb-link">CuraVision</Link>
        <span className="separator"><ChevronRight size={14} /></span>
        <span className="crumb-link">Clinical CDSS</span>
        
        <div className="active-model-pill">
          <span className="status-dot"></span>
          <span>VGG16-DFU v1.4 Active • High Precision Mode</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="nav-search-bar">
        <Search size={15} />
        <input 
          type="text" 
          placeholder="Search MRN, patient, scan ID..."
          onKeyDown={handleSearchKeyPress}
        />
        <span className="kbd-shortcut">Ctrl+K</span>
      </div>

      {/* Right: Actions, Notifications & Avatar */}
      <div className="nav-actions">
        {/* Notification Bell */}
        <button className="nav-icon-btn" title="Pending clinical alerts">
          <Bell size={17} />
          <span className="nav-badge-count">2</span>
        </button>

        {/* Start New Analysis CTA Button */}
        <button 
          onClick={() => navigate('/upload')} 
          className="btn-clinical-primary"
        >
          <Plus size={16} strokeWidth={2.4} />
          <span>Start New Analysis</span>
        </button>

        {/* Doctor Avatar */}
        <Link to="/profile" title="View clinician profile">
          <img 
            src={doctorAvatar} 
            alt={user?.full_name || "Dr. Ananya Rao"} 
            className="clinician-avatar"
            style={{ width: '36px', height: '36px', cursor: 'pointer' }}
          />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
