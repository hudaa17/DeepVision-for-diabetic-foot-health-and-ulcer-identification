import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import predictionService from '../services/predictionService';
import imageService from '../services/imageService';
import reportService from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import ReportViewer from '../components/ReportViewer';
import AIBrainPipeline from '../components/AIBrainPipeline';
import { useAuth } from '../App';
import { 
  ShieldAlert, Activity, FileText, Download, CheckCircle, 
  Cpu, FileCode, CornerDownRight, Save, RotateCcw, ZoomIn, ZoomOut, Share2, Upload 
} from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';

export const Prediction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [report, setReport] = useState(null);
  const [pollingStatus, setPollingStatus] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [notes, setNotes] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Grad-CAM Controls
  const [zoom, setZoom] = useState(1.0);
  const [opacity, setOpacity] = useState(0.6);

  useEffect(() => {
    let pollInterval = null;

    const fetchInitialData = async () => {
      try {
        setError('');
        const predData = await predictionService.getPrediction(id);
        setPrediction(predData);

        if (predData.status === 'completed') {
          const imgData = await imageService.getImageMetadata(predData.image_id);
          setImageMeta(imgData);
          
          try {
            const existingReport = await reportService.getReport(id);
            setReport(existingReport);
            setNotes(existingReport.doctor_notes || '');
          } catch {
            setReport(null);
          }
          setLoading(false);
        } else if (predData.status === 'failed') {
          setError("Prediction pipeline failed. Verify image format and parameters.");
          setLoading(false);
        } else {
          setLoading(false);
          pollInterval = setInterval(async () => {
            try {
              const statusData = await predictionService.getStatus(id);
              setPollingStatus(statusData);
              
              if (statusData.status === 'completed') {
                clearInterval(pollInterval);
                const updatedPred = await predictionService.getPrediction(id);
                setPrediction(updatedPred);
                const imgData = await imageService.getImageMetadata(updatedPred.image_id);
                setImageMeta(imgData);
                setPollingStatus(null);
              } else if (statusData.status === 'failed') {
                clearInterval(pollInterval);
                setError("Execution failed during ML processing pipeline.");
                setPollingStatus(null);
              }
            } catch (err) {
              console.error("Polling error:", err);
            }
          }, 2000);
        }
      } catch (err) {
        console.error(err);
        setError("Assessment record not found or inaccessible.");
        setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [id]);

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const reportData = await reportService.generateReport(id, notes);
      setReport(reportData);
      alert("Clinical report compiled successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to compile report. Make sure database write permissions are enabled.");
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) return <LoadingSpinner progress={10} message="Accessing workstation database..." inline={false} />;

  if (pollingStatus) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', minHeight: '80vh' }}>
        <div style={{ width: '100%', maxWidth: '900px', margin: 'auto' }}>
          <AIBrainPipeline progress={pollingStatus.progress || 10} message={pollingStatus.message} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const origUrl = imageMeta ? predictionService.getAssetUrl(imageMeta.storage_key) : '';
  const ext = imageMeta ? imageMeta.storage_key.split('.').pop() : 'jpg';
  const segmentedKey = imageMeta ? `segmented/${prediction.patient_id}/${prediction.id}_segmented.${ext}` : '';
  const segmentedUrl = predictionService.getAssetUrl(segmentedKey);
  const heatmapUrl = prediction?.heatmap_storage_key ? predictionService.getAssetUrl(prediction.heatmap_storage_key) : '';

  // Doughnut probability chart
  const doughnutData = {
    labels: ['Normal', 'Mild', 'Severe'],
    datasets: [
      {
        data: [
          prediction?.probability_normal || 0,
          prediction?.probability_mild || 0,
          prediction?.probability_severe || 0
        ],
        backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
        borderWidth: 1,
        borderColor: ['#fff', '#fff', '#fff']
      }
    ]
  };

  const risk = prediction?.risk_level || 'unknown';
  const isClinicianOrAdmin = ['clinician', 'admin'].includes(user?.role);

  return (
    <div className="page-container" style={{ animation: 'fadeIn var(--transition-normal)' }}>
      
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="title-large" style={{ fontFamily: 'var(--font-secondary)' }}>
            Assessment Record Detail
          </h1>
          <p className="subtitle" style={{ margin: 0 }}>
            Inference details and explainability metrics for prediction{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-primary)' }}>{id.substring(0, 8)}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/upload')} className="btn btn-outline">
            <Upload size={16} /> New Upload
          </button>
          <button onClick={() => navigate('/patients')} className="btn btn-outline">
            <RotateCcw size={16} /> Registry
          </button>
        </div>
      </div>

      {/* Three Panel display */}
      <div className="card" style={{ marginBottom: '32px', padding: '24px' }}>
        <h3 className="card-title" style={{ marginBottom: '20px' }}>
          Multi-Panel Visual Preprocessing & Grad-CAM Analysis
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {/* Panel 1: Original */}
          <div>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              Original Clinical Photo
            </span>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', height: '260px' }}>
              <img src={origUrl} alt="Original" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#090D16' }} />
            </div>
          </div>
          
          {/* Panel 2: Segmented */}
          <div>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              Watershed Segmentation
            </span>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', height: '260px' }}>
              <img src={segmentedUrl} alt="Segmented" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#090D16' }} />
            </div>
          </div>
          
          {/* Panel 3: Interactive Overlay */}
          <div>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              Grad-CAM Heatmap Overlay
            </span>
            <div style={{ 
              border: '1px solid var(--color-border)', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              height: '260px', 
              position: 'relative',
              backgroundColor: '#090D16' 
            }}>
              <img 
                src={origUrl} 
                alt="Base Original" 
                style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.15s ease-out' 
                }} 
              />
              <img 
                src={heatmapUrl} 
                alt="Grad-CAM Overlay" 
                style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain', 
                  opacity: opacity,
                  mixBlendMode: 'screen',
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.15s ease-out'
                }} 
              />
            </div>
          </div>
        </div>

        {/* Grad-CAM Interactive controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--color-border)',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Opacity slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '220px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              Heatmap Opacity: {Math.round(opacity * 100)}%
            </span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={opacity} 
              onChange={(e) => setOpacity(parseFloat(e.target.value))} 
              style={{ width: '100%', accentColor: 'var(--color-primary)' }} 
            />
          </div>

          {/* Zoom controls */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setZoom(z => Math.min(z + 0.1, 2.5))}
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
            >
              <ZoomIn size={14} /> Zoom In
            </button>
            <button 
              onClick={() => setZoom(z => Math.max(z - 0.1, 0.8))}
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
            >
              <ZoomOut size={14} /> Zoom Out
            </button>
            <button 
              onClick={() => setZoom(1.0)}
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Risk Metrics & Recommendation details */}
      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.2fr', gap: '32px' }}>
        
        {/* Left Column: Risk Gauge & Donut Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '24px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Probability distribution</h3>
              <span className={`badge ${
                risk === 'severe' ? 'badge-severe' : risk === 'mild' ? 'badge-mild' : 'badge-normal'
              }`} style={{ padding: '6px 16px', fontSize: '13px' }}>
                {risk.toUpperCase()} Risk Alert
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'center' }}>
              <div style={{ height: '160px' }}>
                <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>SEVERE RISK</span>
                  <strong style={{ fontSize: '16px', color: 'var(--color-high-risk)' }}>{(prediction?.probability_severe * 100).toFixed(1)}%</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>MILD RISK</span>
                  <strong style={{ fontSize: '16px', color: 'var(--color-warning)' }}>{(prediction?.probability_mild * 100).toFixed(1)}%</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>NORMAL RISK</span>
                  <strong style={{ fontSize: '16px', color: 'var(--color-success)' }}>{(prediction?.probability_normal * 100).toFixed(1)}%</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">AI Assessment Explanation</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              The MobileNetV2 classification engine analyzed plantar image details. The Grad-CAM heatmap identifies localized tissue variations corresponding to an ulcer. The confidence rating is estimated at {((prediction?.confidence_score || 0.94) * 100).toFixed(1)}%.
            </p>
          </div>

        </div>

        {/* Right Column: Recommendations & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: '1px' }}>
            <h3 className="card-title" style={{ color: 'var(--color-primary)' }}>
              🩺 Clinical Care Guidelines
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
              <p style={{ fontSize: '14px', color: '#1E3A8A', fontWeight: 600 }}>
                Urgency Level: <span style={{ textTransform: 'uppercase', color: risk === 'severe' ? 'var(--color-high-risk)' : 'inherit' }}>
                  {prediction?.recommendations?.urgency || 'low'}
                </span>
              </p>
              
              <div style={{ fontSize: '13px', color: '#1E3A8A', lineHeight: 1.5 }}>
                <strong>Actions Recommended:</strong>
                <ul style={{ paddingLeft: '20px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {prediction?.recommendations?.actions?.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {isClinicianOrAdmin && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '14px' }}>
                Clinician Observations & Diagnosis Notes
              </h3>
              <div className="form-group">
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Record clinician observations here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={generatingReport}
                />
              </div>
              <button
                onClick={handleGenerateReport}
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={generatingReport}
              >
                <Save size={16} /> Save Diagnosis & Compile PDF
              </button>
            </div>
          )}

        </div>

      </div>

      {report && <ReportViewer report={report} predictionId={prediction.id} />}

    </div>
  );
};

export default Prediction;
