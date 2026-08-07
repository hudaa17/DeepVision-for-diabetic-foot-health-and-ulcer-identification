import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '24px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-secondary)',
        marginBottom: '12px'
      }}>
        <HelpCircle size={40} />
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-secondary)' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '460px', margin: 0, lineHeight: 1.5 }}>
        The clinical node or portal route you are attempting to access does not exist or has been relocated.
      </p>
      <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '12px' }}>
        <ArrowLeft size={16} /> Return to Home
      </button>
    </div>
  );
};

export default NotFound;
