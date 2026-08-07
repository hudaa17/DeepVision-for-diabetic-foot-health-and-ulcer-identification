import React from 'react';

export const Footer = () => {
  return (
    <footer className="no-print" style={{
      padding: '24px 32px',
      borderTop: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '13px',
      color: 'var(--color-text-secondary)',
      marginTop: 'auto',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div>
        <strong>&copy; 2026 CuraVision</strong> - AI-Powered Intelligent Diabetic Foot Risk Assessment System
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <span style={{ cursor: 'pointer' }}>Privacy</span>
        <span style={{ cursor: 'pointer' }}>Terms</span>
        <span style={{ cursor: 'pointer' }}>Support</span>
        <span style={{ cursor: 'pointer' }}>Contact</span>
      </div>
    </footer>
  );
};

export default Footer;
