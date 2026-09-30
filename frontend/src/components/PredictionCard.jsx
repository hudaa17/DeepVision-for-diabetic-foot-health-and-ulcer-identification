import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Calendar, ArrowRight, ShieldAlert, Award } from 'lucide-react';

export const PredictionCard = ({ prediction }) => {
  const navigate = useNavigate();
  const { id, created_at, status, risk_level, confidence_score } = prediction;

  const dateStr = new Date(created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getRiskBadge = (risk) => {
    const r = (risk || '').toLowerCase();
    if (r.includes('grade 4') || r === 'severe') {
      return <span className="badge badge-severe">Grade 4 (Severe)</span>;
    } else if (r.includes('grade 3')) {
      return <span className="badge badge-severe">Grade 3 (High)</span>;
    } else if (r.includes('grade 2') || r === 'mild') {
      return <span className="badge badge-mild">Grade 2 (Mild)</span>;
    } else if (r.includes('grade 1') || r === 'normal') {
      return <span className="badge badge-normal">Grade 1 (Low)</span>;
    } else {
      return <span className="badge" style={{ backgroundColor: '#F1F5F9', color: 'var(--color-text-secondary)' }}>{risk || 'Unknown'}</span>;
    }
  };

  const getStatusBadge = (s) => {
    if (s === 'pending') {
      return <span className="badge badge-ai animate-pulse-ai">Processing...</span>;
    } else if (s === 'failed') {
      return <span className="badge" style={{ backgroundColor: '#FEE2E2', color: 'var(--color-high-risk)' }}>Failed</span>;
    }
    return null;
  };

  return (
    <div 
      className="card"
      onClick={() => navigate(`/predictions/${id}`)}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '180px'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <Activity size={20} />
          </div>
          {status === 'completed' ? getRiskBadge(risk_level) : getStatusBadge(status)}
        </div>

        <h4 style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '8px',
          fontWeight: 500
        }}>
          Assessment ID: <span style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)', fontWeight: 600 }}>{id.substring(0, 8)}</span>
        </h4>

        {status === 'completed' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <Award size={16} style={{ color: 'var(--color-ai-accent)' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Confidence: {(confidence_score * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--color-border)',
        paddingTop: '12px',
        marginTop: '12px'
      }}>
        <span style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Calendar size={14} />
          {dateStr}
        </span>
        
        <span style={{
          fontSize: '13px',
          color: 'var(--color-primary)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          View Report <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
};

export default PredictionCard;
