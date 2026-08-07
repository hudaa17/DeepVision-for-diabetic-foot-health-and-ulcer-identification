import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export const ServerError = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '24px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#FFFBEB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-warning)',
        marginBottom: '12px'
      }}>
        <AlertOctagon size={40} />
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-secondary)' }}>
        500 - Server Error
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '460px', margin: 0, lineHeight: 1.5 }}>
        The administrative backend node returned an unexpected response. The cluster services may be undergoing maintenance.
      </p>
      <button onClick={handleRetry} className="btn btn-primary" style={{ marginTop: '12px' }}>
        <RefreshCw size={16} /> Retry Session
      </button>
    </div>
  );
};

export default ServerError;
