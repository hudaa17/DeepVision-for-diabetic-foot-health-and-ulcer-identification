import React, { useState } from 'react';
import { useAuth } from '../App';
import { 
  Settings as SettingsIcon, Bell, Shield, Globe, Monitor, 
  Lock, Key, RefreshCw, AlertTriangle 
} from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  
  // Theme State
  const [theme, setTheme] = useState('light');
  
  // Notification Configs
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyReport, setNotifyReport] = useState(true);
  const [notifyRetrain, setNotifyRetrain] = useState(false);

  // Security Configs
  const [mfa, setMfa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30'); // minutes

  const handleSaveSettings = (e) => {
    e.preventDefault();
    alert("System node configuration successfully updated. Settings saved.");
  };

  return (
    <div className="page-container" style={{ animation: 'fadeIn var(--transition-normal)' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="title-large" style={{ fontFamily: 'var(--font-secondary)', fontWeight: 700 }}>
          Workstation Settings
        </h1>
        <p className="subtitle" style={{ margin: 0 }}>
          Configure medical portal features, notifications, and security protocols.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Row 1: Workspace & General */}
        <div className="grid-2">
          
          {/* Card: Theme & Language */}
          <div className="card">
            <h3 className="card-title" style={{ color: 'var(--color-primary)' }}>
              <Monitor size={18} /> General Preferences
            </h3>
            
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Theme Mode</label>
              <select 
                className="form-input form-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">System Light Mode (Default)</option>
                <option value="dark">Clinical Dark Mode</option>
                <option value="high-contrast">High Contrast Medical Layout</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">System Language</label>
              <select className="form-input form-select">
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          {/* Card: Notifications */}
          <div className="card">
            <h3 className="card-title" style={{ color: 'var(--color-secondary)' }}>
              <Bell size={18} /> Notification Config
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={notifyEmail} 
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 600 }}>Email Assessments</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Send copy of predictions to doctor inbox.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={notifyReport} 
                  onChange={(e) => setNotifyReport(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 600 }}>Report Confirmations</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Log event summaries on successful PDF generation.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={notifyRetrain} 
                  onChange={(e) => setNotifyRetrain(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 600 }}>Retraining Indicators</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Notify admin when validation accuracy changes.</span>
                </div>
              </label>

            </div>
          </div>

        </div>

        {/* Row 2: Security */}
        <div className="card">
          <h3 className="card-title" style={{ color: 'var(--color-ai-accent)' }}>
            <Shield size={18} /> HIPAA & Security Protocols
          </h3>

          <div className="grid-2" style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label className="form-label">Local Session Inactivity Timeout</label>
              <select 
                className="form-input form-select"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
              >
                <option value="15">15 Minutes (Strictest)</option>
                <option value="30">30 Minutes (Recommended)</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={mfa} 
                  onChange={(e) => setMfa(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 600 }}>Multi-Factor Authentication (MFA)</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Enforce MFA verification on all clinician logins.</span>
                </div>
              </label>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertTriangle size={18} style={{ color: 'var(--color-high-risk)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#991B1B', marginBottom: '2px' }}>
                HIPAA Compliant Node Logging
              </h4>
              <p style={{ fontSize: '12px', color: '#991B1B', lineHeight: 1.4 }}>
                All config actions are logged under audit-trail logs with trace references. Modifying MFA values requires administrative consensus.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button type="button" className="btn btn-outline">Restore Defaults</button>
          <button type="submit" className="btn btn-primary">Save Workstation Configuration</button>
        </div>

      </form>
    </div>
  );
};

export default Settings;
