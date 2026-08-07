import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import patientService from '../services/patientService';
import predictionService from '../services/predictionService';
import LoadingSpinner from '../components/LoadingSpinner';
import PredictionCard from '../components/PredictionCard';
import { Activity, Clipboard, ShieldCheck, Heart, ArrowRight, ShieldAlert, Award, FileText, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const patients = await patientService.getPatients();
        const matched = patients.find(p => p.medical_history?.email === user.email);
        if (matched) {
          setProfile(matched);
          const allPreds = await predictionService.getPredictions();
          const filtered = allPreds.filter(pred => pred.patient_id === matched.id);
          setPredictions(filtered);
        }
      } catch (err) {
        console.error("Could not load patient dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [user.email]);

  if (loading) return <LoadingSpinner progress={40} message="Syncing patient records..." inline={false} />;

  // Calculate health score dynamically
  const latestPrediction = predictions[0];
  const latestRisk = latestPrediction?.risk_level || 'normal';
  const score = latestRisk === 'severe' ? 42 : latestRisk === 'mild' ? 73 : 94;

  const healthTips = [
    "Inspect both feet daily for blister redness, cuts, or swelling.",
    "Wash your feet in lukewarm water daily, and dry them thoroughly between toes.",
    "Never walk barefoot, always wear supportive protective footwear.",
    "Keep skin smooth by applying cream, but avoid application between toes."
  ];

  return (
    <div className="page-container" style={{ animation: 'fadeIn var(--transition-normal)' }}>
      
      {/* Welcome Banner */}
      <div className="card" style={{
        padding: '32px',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #1D4ED8 100%)',
        color: 'var(--color-white)',
        border: 'none',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--color-white)', fontWeight: 700, margin: '0 0 8px' }}>
            Hello, {profile?.medical_history?.full_name || user.full_name || 'Patient'}
          </h1>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '14px' }}>
            Access your AI screening health score, medical history logs, and diagnostic files.
          </p>
        </div>
        <button 
          onClick={() => navigate('/patients')} 
          className="btn btn-secondary"
          style={{ backgroundColor: 'var(--color-white)', color: 'var(--color-primary)', border: 'none' }}
        >
          View Health Logs <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '1.2fr 1.8fr', gap: '32px' }}>
        
        {/* Left Column: AI Health score and tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* AI Health Score Card */}
          <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: 'var(--color-ai-accent)' }} /> AI Foot Health Score
            </h3>
            
            <div style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              border: '6px solid var(--color-bg)',
              borderTopColor: score > 80 ? 'var(--color-success)' : score > 50 ? 'var(--color-warning)' : 'var(--color-high-risk)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{score}</span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>optimal</span>
            </div>

            <span className={`badge ${
              score > 80 ? 'badge-normal' : score > 50 ? 'badge-mild' : 'badge-severe'
            }`} style={{ padding: '6px 16px', fontSize: '13px' }}>
              {score > 80 ? 'Optimal Condition' : score > 50 ? 'Observation Advised' : 'High Risk Alert'}
            </span>
          </div>

          {/* Clinician Advice */}
          <div className="card">
            <h3 className="card-title" style={{ color: 'var(--color-secondary)' }}>
              <Heart size={18} /> Preventive Care Tips
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '16px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              {healthTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>

        </div>

        {/* Right Column: History & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Predictions logs */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-secondary)' }}>
              Recent Ulcer Screening Details
            </h3>
            {predictions.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                  No screening records logged. Contact your podiatrist to schedule an assessment.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {predictions.map(pred => (
                  <div key={pred.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                          Plantar Photograph Assessment
                        </strong>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          Classified on {new Date(pred.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className={`badge ${
                        pred.risk_level === 'severe' ? 'badge-severe' : pred.risk_level === 'mild' ? 'badge-mild' : 'badge-normal'
                      }`}>
                        {pred.risk_level}
                      </span>
                      <button onClick={() => navigate(`/predictions/${pred.id}`)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}>
                        View Result
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline details */}
          <div className="card">
            <h3 className="card-title">
              <Calendar size={18} style={{ color: 'var(--color-primary)' }} /> Upcoming Care Calendar
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <div>
                  <strong style={{ display: 'block' }}>Routine Podiatry Triage</strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Dr. Alexander Fleming</span>
                </div>
                <span className="badge badge-normal">Aug 24, 2026</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
