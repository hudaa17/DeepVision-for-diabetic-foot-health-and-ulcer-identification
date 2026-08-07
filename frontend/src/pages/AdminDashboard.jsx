import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Shield, Users, Activity, Play, RefreshCw, 
  Terminal, ShieldCheck, Cpu, HardDrive, BarChart3, Clock, AlertTriangle, Database, CheckCircle2 
} from 'lucide-react';

export const AdminDashboard = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState('');

  const loadAdminTelemetry = async () => {
    try {
      setLoading(true);
      const metrics = await adminService.getSystemMonitoring();
      setTelemetry(metrics);
      
      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error("Could not fetch admin monitoring state", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminTelemetry();
  }, []);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      setRetrainSuccess('');
      const res = await adminService.triggerRetrain();
      setRetrainSuccess(`Retraining triggered successfully! Job ID: ${res.job_id || 'JOB-902'}`);
      loadAdminTelemetry();
    } catch (err) {
      console.error(err);
      alert("Failed to start retraining job on backend cluster.");
    } finally {
      setRetraining(false);
    }
  };

  const doctors = [
    { name: "Dr. Alexander Fleming", dept: "Endocrinology", patients: 14, cases: 48, success: "98%", avail: "Active" },
    { name: "Dr. Grace Hopper", dept: "Wound Care Clinic", patients: 22, cases: 86, success: "95%", avail: "Active" },
    { name: "Dr. Elizabeth Blackwell", dept: "Podiatry Triage", patients: 9, cases: 31, success: "100%", avail: "On Call" }
  ];

  if (loading) return <LoadingSpinner progress={75} message="Loading cluster orchestration states..." inline={false} />;

  return (
    <div className="page-container" style={{ animation: 'fadeIn var(--transition-normal)' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="title-large" style={{ fontFamily: 'var(--font-secondary)', fontWeight: 700 }}>
          Cluster Administration Control
        </h1>
        <p className="subtitle" style={{ margin: 0 }}>
          Manage neural model retraining, trace active HIPAA nodes, and monitor hospital telemetry.
        </p>
      </div>

      {/* Stats Cards Row 1 */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card">
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Doctors</span>
          <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>3</h3>
        </div>
        <div className="card">
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Patients</span>
          <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>45</h3>
        </div>
        <div className="card">
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Model Accuracy</span>
          <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>94.2%</h3>
        </div>
        <div className="card">
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>High-Risk cases</span>
          <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-high-risk)', marginTop: '4px' }}>4</h3>
        </div>
      </div>

      {/* Row 2: Resource telemetry & status badges */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        {/* System Resource utilization */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="card-title" style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>Resource Utilization</h3>
          <div>
            <div className="flex-between" style={{ fontSize: '12px', marginBottom: '4px' }}>
              <span>CPU Core Load</span>
              <strong>{telemetry?.cpu_utilization_pct || 14}%</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${telemetry?.cpu_utilization_pct || 14}%`, height: '100%', backgroundColor: 'var(--color-primary)' }}></div>
            </div>
          </div>
          <div>
            <div className="flex-between" style={{ fontSize: '12px', marginBottom: '4px' }}>
              <span>RAM Allocation</span>
              <strong>{telemetry?.memory_utilization_pct || 42}%</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${telemetry?.memory_utilization_pct || 42}%`, height: '100%', backgroundColor: 'var(--color-secondary)' }}></div>
            </div>
          </div>
        </div>

        {/* Database Statuses */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="card-title" style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>System Node Status</h3>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><Database size={16} /> PostgreSQL</span>
            <span className="badge badge-normal" style={{ fontSize: '11px' }}>Connected</span>
          </div>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><Cpu size={16} /> Redis Cache</span>
            <span className="badge badge-normal" style={{ fontSize: '11px' }}>Connected</span>
          </div>
          <div className="flex-between">
            <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} /> MobileNetV2</span>
            <span className="badge badge-ai" style={{ fontSize: '11px' }}>Active</span>
          </div>
        </div>

        {/* Disk space utilization */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
          <h3 className="card-title" style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: 0 }}>Storage Utilization</h3>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '24px', fontWeight: 800 }}>8.4 GB / 100 GB</h4>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>PACS DICOM Clinical Storage Space</p>
          </div>
        </div>
      </div>

      {/* Row 3: Doctors Management cards */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-secondary)' }}>
          Assigned Doctor Operational Metrics
        </h3>
        <div className="grid-3">
          {doctors.map((doc, idx) => (
            <div className="card card-lift glow-border" key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '28px' }}>🩺</span>
                <span className={`badge ${doc.avail === 'Active' ? 'badge-normal' : 'badge-mild'}`}>
                  {doc.avail}
                </span>
              </div>
              
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{doc.name}</h4>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{doc.dept}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block' }}>PATIENTS</span>
                  <strong style={{ fontSize: '14px' }}>{doc.patients} assigned</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block' }}>REVIEWS</span>
                  <strong style={{ fontSize: '14px' }}>{doc.cases} reviewed</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <span>Success Rate:</span>
                <strong style={{ color: 'var(--color-primary)' }}>{doc.success}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Retraining & Terminal logs */}
      <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* ML controls */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="card-title" style={{ color: 'var(--color-primary)' }}>
            <Shield size={18} /> Model Retraining
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '12px 0 20px' }}>
            Trigger a dataset consolidation job. The pipeline will query recent patient photos, label changes, and run a retraining step on MobileNetV2.
          </p>

          {retrainSuccess && (
            <div className="alert alert-success" style={{ fontSize: '12px', padding: '10px', marginBottom: '16px' }}>
              {retrainSuccess}
            </div>
          )}

          <button 
            onClick={handleRetrain} 
            disabled={retraining} 
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <RefreshCw size={16} className={retraining ? 'animate-spin' : ''} />
            {retraining ? 'Running Retrain Job...' : 'Retrain MobileNetV2'}
          </button>
        </div>

        {/* Audit Logs */}
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} /> Recent Security Audit Trail
          </h3>
          
          <div style={{
            marginTop: '16px',
            maxHeight: '220px',
            overflowY: 'auto',
            backgroundColor: '#1E293B',
            color: '#34D399',
            fontFamily: 'monospace',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '12px',
            lineHeight: 1.5,
            border: '1px solid var(--color-border)'
          }}>
            {auditLogs.length === 0 ? (
              <span style={{ color: '#94A3B8' }}>No recent admin audit logs.</span>
            ) : (
              auditLogs.map((log, idx) => (
                <div key={idx} style={{ marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
                  <span style={{ color: '#F472B6' }}>[{new Date(log.created_at).toLocaleTimeString()}]</span>{' '}
                  <span style={{ color: '#60A5FA', fontWeight: 'bold' }}>{log.action}</span>{' '}
                  <span style={{ color: '#94A3B8' }}>{log.details ? JSON.stringify(log.details) : ''}</span> - <span style={{ color: '#FBBF24' }}>IP: {log.ip_address || '127.0.0.1'}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
