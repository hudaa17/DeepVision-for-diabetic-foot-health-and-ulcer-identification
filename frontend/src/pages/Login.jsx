import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Mail, Lock, ShieldAlert, User, Shield, Activity, Sparkles, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import logo from '../logo.jpg';

export const Login = () => {
  const [roleMode, setRoleMode] = useState(null); // null (card selector), clinician, patient, admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please input email and password.");
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
      console.error(err);
      setError(err.response?.data?.detail || "Incorrect email or password. Please verify.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role) => {
    setRoleMode(role);
    if (role === 'admin') {
      setEmail('admin@curavision.org');
      setPassword('AdminSecure123!');
    } else if (role === 'clinician') {
      setEmail('clinician@curavision.org');
      setPassword('ClinicianSecure123!');
    } else {
      setEmail('patient@curavision.org');
      setPassword('PatientSecure123!');
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      animation: 'fadeIn var(--transition-normal)'
    }}>
      
      {/* Left Column: Visual AI Graphic panel */}
      <div className="no-print" style={{
        flex: 1,
        background: 'linear-gradient(135deg, var(--color-dark-navy) 0%, #1E293B 100%)',
        padding: '64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'var(--color-white)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Gradient Blob background */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '-15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(20,184,166,0.05) 50%, rgba(0,0,0,0) 80%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          animation: 'float 8s ease-in-out infinite'
        }}></div>

        {/* Top Header */}
        <div style={{ zIndex: 2 }}>
          <img src={logo} alt="CuraVision Logo" style={{ height: '56px', borderRadius: '12px', objectFit: 'contain' }} />
        </div>

        {/* Center illustration: Pulsing ECG line */}
        <div style={{ maxWidth: '480px', margin: 'auto 0', zIndex: 2 }}>
          
          <div className="animate-ecg" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            padding: '6px 14px',
            borderRadius: '9999px',
            color: '#C7D2FE',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '24px'
          }}>
            <Heart size={16} style={{ color: 'var(--color-secondary)' }} /> Heartbeat ECG Monitor Active
          </div>

          <h2 style={{ fontSize: '40px', color: 'var(--color-white)', fontWeight: 800, lineHeight: 1.2, marginBottom: '20px' }}>
            Clinical Neural Triage Network.
          </h2>

          <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
            Access the hospital cloud workstation to execute image validations, OpenCV contour segmentations, and MobileNetV2 diabetic risk classifications.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94A3B8' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)' }}></span>
              <span>Grad-CAM Explainable</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94A3B8' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></span>
              <span>OpenCV Morphology</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div style={{ fontSize: '12px', color: '#64748B', zIndex: 2 }}>
          &copy; {new Date().getFullYear()} CuraVision Systems Inc. HIPAA Encrypted workstation node.
        </div>
      </div>

      {/* Right Column: Glassmorphic Cards & Form */}
      <div style={{
        width: '560px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: 'var(--color-bg)',
        zIndex: 2
      }}>
        
        {/* Outer card wrapper */}
        <div className="card glass-panel" style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          boxShadow: 'var(--shadow-premium)',
          borderRadius: '24px'
        }}>

          {!roleMode ? (
            // Card Selector View
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Welcome to CuraVision
                </h2>
                <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                  AI-Powered Intelligent Diabetic Foot Risk Assessment
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Patient Role Card */}
                <div 
                  onClick={() => handleSelectRole('patient')}
                  className="card card-lift glow-border-ai"
                  style={{ cursor: 'pointer', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    👤
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Patient</h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                      Upload and monitor your diabetic foot health.
                    </p>
                  </div>
                </div>

                {/* Doctor Role Card */}
                <div 
                  onClick={() => handleSelectRole('clinician')}
                  className="card card-lift glow-border-ai"
                  style={{ cursor: 'pointer', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#EEF2FF',
                    color: 'var(--color-ai-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    🩺
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Doctor</h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                      Review AI-assisted diagnoses and manage patients.
                    </p>
                  </div>
                </div>

                {/* Admin Role Card */}
                <div 
                  onClick={() => handleSelectRole('admin')}
                  className="card card-lift glow-border-ai"
                  style={{ cursor: 'pointer', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF9C3',
                    color: 'var(--color-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    🛡️
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Admin</h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                      Manage the healthcare system and monitor analytics.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            // Credential Form Input View
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              
              {/* Back Button */}
              <button 
                onClick={() => setRoleMode(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  padding: 0
                }}
              >
                <ArrowLeft size={16} /> Back to Role Selection
              </button>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>
                  Enter credentials
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Logging in as a classified <strong style={{ color: 'var(--color-primary)' }}>{roleMode}</strong>.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" style={{ padding: '12px', marginBottom: '20px', fontSize: '13px' }}>
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      placeholder="user@cura-vision.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Mail size={16} style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-secondary)'
                    }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Password</label>
                    <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
                      Forgot password?
                    </Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Lock size={16} style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-secondary)'
                    }} />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '12px' }}
                  disabled={loading}
                >
                  {loading ? "Authenticating Session..." : "Secure Sign In"}
                </button>
              </form>

              {roleMode === 'patient' && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)'
                }}>
                  Need a patient account?{' '}
                  <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    Register profile
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Login;
