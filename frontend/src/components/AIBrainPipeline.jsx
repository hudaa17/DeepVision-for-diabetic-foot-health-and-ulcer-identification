import React from 'react';
import { Cpu, CheckCircle2, Circle } from 'lucide-react';

export const AIBrainPipeline = ({ progress = 10, message = "Executing neural network..." }) => {
  const steps = [
    { label: "Upload Image", threshold: 10 },
    { label: "Image Validation", threshold: 20 },
    { label: "Image Preprocessing", threshold: 30 },
    { label: "Watershed Segmentation", threshold: 40 },
    { label: "CNN Feature Extraction", threshold: 50 },
    { label: "MobileNetV2 Inference", threshold: 60 },
    { label: "Confidence Score Triangulation", threshold: 70 },
    { label: "Grad-CAM Activation Mapping", threshold: 80 },
    { label: "Recommendation Engine", threshold: 90 },
    { label: "PDF Report Generation", threshold: 100 }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: '32px',
      padding: '40px',
      borderRadius: '24px',
      backgroundColor: 'var(--color-card-bg)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-premium)',
      animation: 'fadeIn var(--transition-normal)'
    }}>
      
      {/* Left Column: Visual AI Brain Neural Node Network */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-dark-navy) 0%, #1E293B 100%)',
        borderRadius: '16px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'var(--color-white)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '380px'
      }}>
        {/* Glowing aura */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          backgroundColor: 'rgba(99, 102, 241, 0.25)',
          filter: 'blur(40px)',
          animation: 'pulse-indigo 2s infinite'
        }}></div>

        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            padding: '6px 14px',
            borderRadius: '9999px',
            color: '#C7D2FE',
            fontSize: '12px',
            fontWeight: 600
          }}>
            <Cpu size={14} className="animate-spin" /> CuraVision GPU Inference
          </span>
          
          <h3 style={{ fontSize: '22px', color: 'var(--color-white)', marginTop: '20px', fontWeight: 800 }}>
            Processing Pipeline Active
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.5, marginTop: '8px' }}>
            The AI workspace is conducting edge contours and gradient maps. Do not disconnect session.
          </p>
        </div>

        {/* Global Progress Dial */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '48px', fontWeight: 800 }}>{progress}%</span>
          <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>COMPLETED</span>
        </div>
      </div>

      {/* Right Column: Step-by-Step Pipeline list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
        {steps.map((step, idx) => {
          const isDone = progress > step.threshold;
          const isActive = progress >= step.threshold && progress < step.threshold + 10;
          
          return (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: isActive ? 'var(--color-hover-bg)' : 'transparent',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isDone ? (
                  <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />
                ) : isActive ? (
                  <div className="animate-pulse-ai" style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '3px solid var(--color-primary)',
                    backgroundColor: 'var(--color-white)'
                  }}></div>
                ) : (
                  <Circle size={18} style={{ color: 'var(--color-border)' }} />
                )}
                
                <span style={{
                  fontSize: '13.5px',
                  fontWeight: isActive ? 700 : 500,
                  color: isDone || isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  transition: 'color var(--transition-fast)'
                }}>
                  {step.label}
                </span>
              </div>

              {isActive && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  backgroundColor: 'var(--color-selected-bg)',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}>
                  Running
                </span>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default AIBrainPipeline;
