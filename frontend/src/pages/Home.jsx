import React from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Cpu, Clipboard, FileText, User, 
  Activity, Sparkles, Award, BarChart3, Database, Layers, CheckCircle2 
} from 'lucide-react';
import logo from '../logo.jpg';

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'patient') {
      navigate('/patients');
    } else {
      navigate('/dashboard');
    }
  };

  const stats = [
    { label: "Patients Screened", value: "14,820+", sub: "Across 8 hospitals" },
    { label: "AI Model Accuracy", value: "94.2%", sub: "F1-Score benchmark" },
    { label: "Reports Compiled", value: "8,940+", sub: "Secure PDF downloads" }
  ];

  const workflow = [
    {
      title: "Image Upload",
      description: "Plantar photograph of the foot is captured and validated for perspective.",
      icon: <Clipboard size={22} />
    },
    {
      title: "Segmentation contouring",
      description: "FastAPI triggers OpenCV edge Watershed filtering to isolate ulcer edges.",
      icon: <Layers size={22} />
    },
    {
      title: "Neural Classification",
      description: "MobileNetV2 outputs probability scores for Normal, Mild, or Severe risks.",
      icon: <Cpu size={22} />
    },
    {
      title: "Grad-CAM Activation Grid",
      description: "Explainable heatmaps highlight deep-layer network activations on ulcer nodes.",
      icon: <Activity size={22} />
    }
  ];

  const technologies = [
    { name: "MobileNetV2", desc: "CNN base weights trained on diabetic datasets.", icon: <Cpu /> },
    { name: "Grad-CAM", desc: "Gradient-weighted class activation mapping.", icon: <Sparkles /> },
    { name: "OpenCV", desc: "Image thresholding and morphological filters.", icon: <Layers /> },
    { name: "FastAPI", desc: "Asynchronous API endpoints with Uvicorn execution.", icon: <Database /> }
  ];

  return (
    <div className="page-container" style={{ animation: 'fadeIn var(--transition-normal)' }}>
      
      {/* Hero Header Split Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '32px',
        marginBottom: '40px',
        alignItems: 'center'
      }}>
        
        {/* Left Column: Text & CTA */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-hover-bg)',
            padding: '6px 14px',
            borderRadius: '9999px',
            color: 'var(--color-primary)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            <Sparkles size={16} /> Clinical Diagnostic Node Active
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <img src={logo} alt="CuraVision Logo" style={{ height: '80px', borderRadius: '16px', objectFit: 'contain' }} />
            <h1 style={{
              fontSize: '48px',
              fontFamily: 'var(--font-secondary)',
              color: 'var(--color-text-primary)',
              fontWeight: 800,
              lineHeight: 1.15,
              margin: 0
            }}>
              CuraVision
            </h1>
          </div>
          
          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '600px'
          }}>
            AI-Powered Intelligent Diabetic Foot Risk Assessment System. Helping clinicians and patients through intelligent AI-assisted diagnosis and early intervention.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleStart}
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '15px' }}
            >
              Start Screening <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="btn btn-outline"
              style={{ padding: '14px 28px', fontSize: '15px' }}
            >
              Explore Features
            </button>
          </div>
        </div>

        {/* Right Column: Animated Medical Neural Network Illustration (SVG/HTML) */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '360px',
          width: '100%',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--color-dark-navy) 0%, #1E293B 100%)',
          overflow: 'hidden'
        }}>
          {/* Pulsing Background circles */}
          <div className="animate-ecg" style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            border: '2px dashed rgba(99, 102, 241, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="animate-pulse-ai" style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '2px dashed rgba(20, 184, 166, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-white)'
              }}>
                <Cpu size={40} className="animate-float" style={{ color: 'var(--color-ai-accent)' }} />
              </div>
            </div>
          </div>

          {/* Floating diagnostic icons */}
          <div className="animate-float" style={{ position: 'absolute', top: '15%', left: '15%', color: '#6366F1' }}>
            <Award size={28} />
          </div>
          <div className="animate-float-delayed" style={{ position: 'absolute', bottom: '15%', right: '20%', color: '#14B8A6' }}>
            <Activity size={28} />
          </div>
          <div className="animate-float" style={{ position: 'absolute', top: '25%', right: '15%', color: '#EF4444' }}>
            <Sparkles size={24} />
          </div>
        </div>

      </div>

      {/* Row 2: Statistics Counters */}
      <div className="grid-3" style={{ marginBottom: '48px' }}>
        {stats.map((st, i) => (
          <div className="card" key={i} style={{ textAlign: 'center', padding: '32px 24px' }}>
            <h3 style={{ fontSize: '38px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '8px' }}>
              {st.value}
            </h3>
            <strong style={{ display: 'block', fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              {st.label}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {st.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Row 3: How it works timeline */}
      <div style={{ marginBottom: '56px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-secondary)' }}>
            About CuraVision
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            A standard triage step-by-step loop processed in real time by the backend cluster.
          </p>
        </div>

        <div className="grid-4">
          {workflow.map((flow, idx) => (
            <div className="card glow-border" key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '24px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px',
                boxShadow: 'var(--shadow-md)'
              }}>
                {idx + 1}
              </div>
              
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-hover-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                marginTop: '8px'
              }}>
                {flow.icon}
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {flow.title}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {flow.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Technologies Section */}
      <div style={{ marginBottom: '56px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', fontFamily: 'var(--font-secondary)' }}>
          Underlying Technology Stack
        </h3>
        <div className="grid-4">
          {technologies.map((tech, idx) => (
            <div className="card" key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {tech.icon}
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-text-primary)' }}>{tech.name}</strong>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px' }}>{tech.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 5: SDG Goals & Trust compliance */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        
        {/* UN SDG Card */}
        <div className="card" style={{
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '32px'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>
              🇺🇳 UN SDG Goal 3 Alignment
            </h3>
            <p style={{ fontSize: '13.5px', color: '#1E3A8A', lineHeight: 1.6, margin: 0 }}>
              CuraVision actively supports <strong>UN Goal 3: Good Health and Well-being</strong>. By offering AI-assisted, instant diabetic ulcer detection metrics, we strive to reduce the global burden of preventable amputations in remote clinics.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', marginTop: '20px' }}>
            GLOBAL HEALTH TARGET 3.4
          </span>
        </div>

        {/* Security Compliance */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifycontent: 'space-between', padding: '32px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--color-success)' }} /> HIPAA Secure Operations
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              All diagnostics records, plantar images, and clinical notes are logged with complete cryptographic hashes under CuraVision guidelines.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <span className="badge badge-normal" style={{ fontSize: '11px' }}>TLS 1.3</span>
            <span className="badge badge-normal" style={{ fontSize: '11px' }}>AES-256</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Home;
