import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '24px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#FEF2F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-high-risk)',
        marginBottom: '12px'
      }}>
        <ShieldAlert size={40} />
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-secondary)' }}>
        403 - Access Denied
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '460px', margin: 0, lineHeight: 1.5 }}>
        You do not possess the necessary clearance or role badges required to view this clinical workstation module.
      </p>
      <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '12px' }}>
        <ArrowLeft size={16} /> Return to Home
      </button>
    </div>
  );
};

export default AccessDenied;
