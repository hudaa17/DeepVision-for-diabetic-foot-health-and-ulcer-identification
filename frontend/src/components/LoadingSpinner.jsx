import React from 'react';

export const LoadingSpinner = ({ progress = 0, message = "Analyzing image assets...", inline = false }) => {
  const containerStyle = inline ? {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    gap: '16px'
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    backdropFilter: 'blur(4px)',
    zIndex: 999,
    gap: '24px'
  };

  return (
    <div style={containerStyle}>
      {/* Premium Circular Progress Spinner */}
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '6px solid var(--color-border)',
          position: 'absolute',
          top: 0,
          left: 0
        }}></div>
        <div className="animate-pulse-ai" style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '6px solid transparent',
          borderTopColor: 'var(--color-primary)',
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '14px',
          fontWeight: 700,
          fontFamily: 'var(--font-secondary)',
          color: 'var(--color-primary)'
        }}>
          {progress > 0 ? `${progress}%` : 'AI'}
        </div>
      </div>

      <div style={{ textAlign: 'center', maxWidth: '300px' }}>
        <h4 style={{
          fontSize: '16px',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-secondary)',
          marginBottom: '6px'
        }}>
          CuraVision AI is analyzing your medical image...
        </h4>
        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.4,
          fontStyle: 'italic'
        }}>
          {message}
        </p>
      </div>

      {progress > 0 && (
        <div style={{
          width: '200px',
          height: '6px',
          backgroundColor: 'var(--color-border)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginTop: '-8px'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: 'var(--color-primary)',
            transition: 'width 0.4s ease',
            borderRadius: '3px'
          }}></div>
        </div>
      )}

      {/* Insert keyframe style tag inside React render to keep things fully modular */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
