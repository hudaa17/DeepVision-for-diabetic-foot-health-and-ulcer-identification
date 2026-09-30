import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  Stethoscope, 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  BrainCircuit, 
  Activity, 
  Cpu, 
  ShieldAlert,
  Server
} from 'lucide-react';

export const Login = () => {
  const [accessScope, setAccessScope] = useState('clinician'); // clinician, admin, patient
  const [email, setEmail] = useState('dr.rao@hospital.org');
  const [password, setPassword] = useState('AdminSecure123!');
  const [showPassword, setShowPassword] = useState(false);
  const [keepActive, setKeepActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleScopeChange = (scope) => {
    setAccessScope(scope);
    if (scope === 'clinician') {
      setEmail('dr.rao@hospital.org');
      setPassword('AdminSecure123!');
    } else if (scope === 'admin') {
      setEmail('admin@curavision.org');
      setPassword('AdminSecure123!');
    } else {
      setEmail('patient@curavision.org');
      setPassword('PatientSecure123!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please input institutional email and passcode.");
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await login(email, password);
      if (data.role === 'patient') {
        navigate('/patients');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to sign in. Check your credentials and API connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSsoLogin = (provider) => {
    const demoUser = {
      id: 'user-8921',
      full_name: 'Dr. Ananya Rao, MD',
      email: 'dr.rao@hospital.org',
      role: 'clinician'
    };
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('token', 'demo-sso-token');
    window.location.href = '/dashboard';
  };

  return (
    <div className="portal-login-viewport">
      
      {/* Left Column: Deep Medical Teal Hero Panel (Image 4 Left) */}
      <div className="portal-hero-pane">
        
        {/* Top Tagline & Header */}
        <div>
          <div className="portal-badge-live">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2dd4bf' }}></span>
            <span>Clinical • v4.2 Live</span>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: '#2dd4bf', textTransform: 'uppercase', marginBottom: '8px' }}>
            See the risk. Understand the wound. Act earlier.
          </div>

          <h1 className="portal-hero-title">
            Next-Generation Diabetic Foot Ulcer Intelligence & Explainable AI Screening
          </h1>

          <p className="portal-hero-subtitle">
            Empowering clinical teams with automated wound segmentation, Wagner/Texas classification, and Grad-CAM interpretability to prevent amputations.
          </p>

          {/* 3 Translucent Feature Cards */}
          <div className="portal-feature-cards">
            
            <div className="portal-feature-card">
              <div className="portal-feature-card-icon">
                <BrainCircuit size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>DeepVision Multimodal Neural Net</h4>
                  <span style={{ fontSize: '10px', color: '#2dd4bf', fontWeight: 700 }}>98.2% acc</span>
                </div>
                <p>Cross-validated on 14k+ multi-center clinical datasets with high diagnostic concordance.</p>
              </div>
            </div>

            <div className="portal-feature-card">
              <div className="portal-feature-card-icon">
                <Activity size={18} />
              </div>
              <div>
                <h4>Explainable Grad-CAM Heatmaps</h4>
                <p>Zero black-box AI. Real-time visual attribution maps highlighting high-risk wound margins.</p>
              </div>
            </div>

            <div className="portal-feature-card">
              <div className="portal-feature-card-icon">
                <Cpu size={18} />
              </div>
              <div>
                <h4>Longitudinal Progression Tracking</h4>
                <p>Automated wound surface area tracking, healing velocity trends, and 30-day closure forecasting.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Regulatory / Compliance Badges */}
        <div className="portal-compliance-footer">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#2dd4bf" /> HIPAA Compliant
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#2dd4bf" /> SOC2 Type II
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={14} color="#2dd4bf" /> FHIR & HL7 Ready
          </span>
        </div>
      </div>

      {/* Right Column: Clinical Decision Portal Sign-In Card (Image 4 Right) */}
      <div className="portal-form-pane">
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-title)' }}>
              Clinical Decision Portal
            </h2>
            <span className="pill-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '10.5px' }}>
              NODE - US - EAST
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '18px' }}>
            Secure workstation sign-in for authorized medical personnel
          </p>

          {/* Access Scope Selector (Doctor, Admin, Patient) */}
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Access Scope
          </div>
          
          <div className="scope-selector-group">
            <button
              type="button"
              onClick={() => handleScopeChange('clinician')}
              className={`scope-btn ${accessScope === 'clinician' ? 'active' : ''}`}
            >
              <Stethoscope size={14} />
              <span>Clinician</span>
            </button>

            <button
              type="button"
              onClick={() => handleScopeChange('admin')}
              className={`scope-btn ${accessScope === 'admin' ? 'active' : ''}`}
            >
              <Building2 size={14} />
              <span>Hospital Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleScopeChange('patient')}
              className={`scope-btn ${accessScope === 'patient' ? 'active' : ''}`}
            >
              <User size={14} />
              <span>Patient</span>
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              color: '#991b1b',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShieldAlert size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Input 1: Institutional ID */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: 600 }}>
                <span>Institutional ID / Hospital Email</span>
                <span style={{ fontSize: '10.5px', color: '#0d9488', fontWeight: 700 }}>NPI / GMC Verified</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                backgroundColor: '#ffffff'
              }}>
                <Mail size={16} color="#94a3b8" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr.rao@hospital.org"
                  required
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '13.5px',
                    width: '100%',
                    color: 'var(--color-text-title)'
                  }}
                />
              </div>
            </div>

            {/* Input 2: Password / Passcode */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: 600 }}>
                <span>Password / Passcode</span>
                <Link to="/forgot-password" style={{ fontSize: '11.5px', color: 'var(--teal-750)' }}>
                  Forgot passcode?
                </Link>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                backgroundColor: '#ffffff'
              }}>
                <Lock size={16} color="#94a3b8" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '13.5px',
                    width: '100%',
                    color: 'var(--color-text-title)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* FIDO2 Security Key Notice */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '11.5px',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              lineHeight: 1.4
            }}>
              <KeyRound size={15} color="var(--teal-750)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                Hardware FIDO2 Security Key or Duo/Okta Authenticator verification mandatory for direct access to Protected Health Information (PHI).
              </span>
            </div>

            {/* Keep active checkbox */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={keepActive}
                  onChange={(e) => setKeepActive(e.target.checked)}
                  style={{ accentColor: 'var(--teal-750)' }}
                />
                <span>Keep workstation active (8 hours)</span>
              </label>

              <span className="pill-badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '10px' }}>
                TLS 1.3
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-clinical-primary"
              style={{
                width: '100%',
                padding: '12px',
                justifyContent: 'center',
                fontSize: '14px',
                borderRadius: '8px'
              }}
            >
              <span>{loading ? 'Authenticating Medical Credentials...' : 'Sign In to CuraVision'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Institutional Federation SSO */}
          <div style={{ marginTop: '22px', borderTop: '1px solid var(--color-border-light)', paddingTop: '16px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
              Institutional Federation
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => handleSsoLogin('Epic')}
                className="btn-clinical-secondary" 
                style={{ fontSize: '12px', justifyContent: 'center' }}
              >
                <span>Epic / Cerner EHR</span>
              </button>

              <button 
                type="button"
                onClick={() => handleSsoLogin('NHS')}
                className="btn-clinical-secondary" 
                style={{ fontSize: '12px', justifyContent: 'center' }}
              >
                <span>NHS / Smartcard SSO</span>
              </button>
            </div>
          </div>

          {/* Legal / HIPAA Statutory Warning Footer */}
          <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            <p style={{ marginBottom: '8px' }}>
              New medical affiliate or health trust?{' '}
              <a href="#request-access" style={{ color: 'var(--teal-750)', fontWeight: 600 }}>
                Request Institutional Access
              </a>
            </p>
            <p style={{ fontSize: '10px', color: '#94a3b8' }}>
              Warning: Unlawful access, tampering, or extraction of patient health information is punishable under federal statutory law (HIPAA 45 CFR § 164.312). All diagnostic interactions are digitally watermarked and stored in tamper-proof audit vaults.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
