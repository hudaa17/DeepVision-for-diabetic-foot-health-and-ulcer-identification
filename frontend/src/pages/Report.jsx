import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reportService from '../services/reportService';
import predictionService from '../services/predictionService';
import patientService from '../services/patientService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FileText, Printer, Share2, FileDown, ArrowLeft, 
  CheckCircle, User, Activity, AlertTriangle 
} from 'lucide-react';

export const Report = () => {
  const { id } = useParams(); // prediction_id
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [patient, setPatient] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 1. Get prediction data
        const predData = await predictionService.getPrediction(id);
        setPrediction(predData);

        // 2. Get patient profile
        const patData = await patientService.getPatient(predData.patient_id);
        setPatient(patData);

        // 3. Get report metadata
        const reportData = await reportService.getReport(id);
        setReport(reportData);
        
      } catch (err) {
        console.error(err);
        setError("Could not compile report sheet. Ensure observations are saved first.");
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, [id]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await reportService.downloadReport(id);
    } catch (e) {
      console.error(e);
      alert("Failed to download PDF document.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Clinical document URL copied to clipboard.");
  };

  if (loading) return <LoadingSpinner progress={50} message="Retrieving document indexes..." inline={false} />;

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
          <button onClick={() => navigate(`/predictions/${id}`)} className="btn btn-outline" style={{ border: 'none', color: '#991B1B', textDecoration: 'underline', padding: 0 }}>
            Return to assessment details to generate a report first.
          </button>
        </div>
      </div>
    );
  }

  const risk = prediction?.risk_level || 'unknown';

  return (
    <div className="page-container printable-report" style={{ animation: 'fadeIn var(--transition-normal)', maxWidth: '900px' }}>
      
      {/* Back Button (Hidden on Print) */}
      <div className="no-print" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate(`/predictions/${id}`)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
          <ArrowLeft size={16} /> Back to Workstation
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleShare} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Share2 size={16} /> Share Link
          </button>
          <button onClick={handlePrint} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Printer size={16} /> Print Report
          </button>
          <button onClick={handleDownload} disabled={downloading} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <FileDown size={16} /> {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="card" style={{ padding: '40px', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
        
        {/* Hospital Header Branding */}
        <div className="flex-between" style={{ borderBottom: '2px solid var(--color-dark-navy)', paddingBottom: '20px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-secondary)', color: 'var(--color-dark-navy)', fontWeight: 700 }}>
              CuraVision
            </h1>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500, display: 'block' }}>
              AI-Powered Intelligent Diabetic Foot Risk Assessment
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
              Hospital-grade AI Clinical Decision Support System
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Assessment ID: {id.substring(0, 8).toUpperCase()}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Date: {new Date(report.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Patient Info grid */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-secondary)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '14px', letterSpacing: '0.05em' }}>
            Patient Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Full Name</span>
              <strong style={{ fontSize: '14px' }}>{patient.medical_history?.full_name || 'Registry Patient'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Patient Code</span>
              <strong style={{ fontSize: '14px', fontFamily: 'monospace' }}>{patient.patient_code}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Date of Birth</span>
              <strong style={{ fontSize: '14px' }}>{patient.date_of_birth || 'N/A'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Gender</span>
              <strong style={{ fontSize: '14px' }}>{patient.gender || 'N/A'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Phone Number</span>
              <strong style={{ fontSize: '14px' }}>{patient.phone || 'N/A'}</strong>
            </div>
          </div>
        </div>

        {/* Diagnostic Assessment Summary */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-secondary)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '14px', letterSpacing: '0.05em' }}>
            AI Diagnostic Assessment Summary
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <div>
              <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Predicted Risk Classification</span>
              <span className={`badge ${
                risk === 'severe' ? 'badge-severe' : risk === 'mild' ? 'badge-mild' : 'badge-normal'
              }`} style={{ padding: '6px 16px', fontSize: '14px', fontWeight: 'bold' }}>
                {risk.toUpperCase()} RISK
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Model Confidence</span>
              <strong style={{ fontSize: '20px', color: 'var(--color-primary)' }}>
                {(prediction.confidence_score * 100).toFixed(1)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Structured recommendations */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-secondary)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '14px', letterSpacing: '0.05em' }}>
            Structured Care Protocol
          </h3>
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '20px',
            borderRadius: '12px',
            color: '#1E3A8A'
          }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Care Guidelines (Urgency Level: {prediction.recommendations?.urgency?.toUpperCase()})
            </strong>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              {prediction.recommendations?.actions?.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
            {prediction.recommendations?.follow_up && (
              <p style={{ marginTop: '12px', fontSize: '13px', borderTop: '1px solid #BFDBFE', paddingTop: '10px', fontStyle: 'italic' }}>
                Follow-up instructions: {prediction.recommendations.follow_up}
              </p>
            )}
          </div>
        </div>

        {/* Doctor Notes */}
        {report.doctor_notes && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-secondary)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '14px', letterSpacing: '0.05em' }}>
              Clinician Observations & Notes
            </h3>
            <p style={{
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--color-text-primary)',
              backgroundColor: '#FFFDF5',
              border: '1px solid #FDE047',
              padding: '16px',
              borderRadius: '12px',
              whiteSpace: 'pre-wrap'
            }}>
              {report.doctor_notes}
            </p>
          </div>
        )}

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '30px', borderTop: '1px dotted var(--color-border)' }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ height: '40px' }}></div>
            <div style={{ borderBottom: '1px solid var(--color-text-secondary)', marginBottom: '6px' }}></div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Clinician Signature</span>
          </div>
          
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ height: '40px', fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✓ Automatically Signed
            </div>
            <div style={{ borderBottom: '1px solid var(--color-text-secondary)', marginBottom: '6px' }}></div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>DeepVision AI Engine Node</span>
          </div>
        </div>

      </div>

      {/* CSS Stylesheet Injector for print layout */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: #FFFFFF !important;
            padding: 0 !important;
          }
          .page-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .card {
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Report;
