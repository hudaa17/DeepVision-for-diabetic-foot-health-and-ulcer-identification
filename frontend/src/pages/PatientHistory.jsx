import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Stethoscope, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  Eye, 
  FileText, 
  Plus, 
  Share2, 
  Printer, 
  Edit3, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ChevronRight,
  PenTool
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import baselineImg from '../assets/baseline_foot_ulcer.jpg';
import currentImg from '../assets/clinical_foot_ulcer.jpg';

export const PatientHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timeline');
  const [showGradCamComparison, setShowGradCamComparison] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [encounterNotes, setEncounterNotes] = useState([
    {
      date: 'October 24, 2024 • 09:45 AM',
      author: 'Signed Electronically by Dr. Ananya Rao, MD',
      text: 'Wound area enlarged by 14.1% over past 30 days with purulent slough accumulating centrally. Patient admits omitting offloading boot inside residence. Advised urgent sharp debridement to clean non-viable edges. Ordered wound swab culture & X-Ray of left foot to rule out underlying osteomyelitis.'
    },
    {
      date: 'October 10, 2024 • 03:15 PM',
      author: 'Signed Electronically by Dr. Ananya Rao, MD',
      text: 'Slight increase in peri-wound maceration. Changed secondary absorbent pad. Re-emphasized evening elevation and tight glycemic target (HbA1c last logged at 8.4%). Next appointment confirmed in 14 days.'
    }
  ]);

  const handleAppendNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setEncounterNotes([
      {
        date: 'Today • Just Now',
        author: 'Signed Electronically by Dr. Ananya Rao, MD',
        text: newNote.trim()
      },
      ...encounterNotes
    ]);
    setNewNote('');
  };

  // Dual-Axis Chart Data: Wound Surface Area vs Granulation %
  const woundDynamicsData = {
    labels: ["Aug 15 (1.45 cm²)", "Aug 29 (1.82 cm²)", "Sep 12 (2.15 cm²)", "Sep 26 (2.40 cm²)", "Oct 10 (2.97 cm²)", "Oct 24 (Today 3.42 cm²)"],
    datasets: [
      {
        label: "Surface Area (cm²)",
        data: [1.45, 1.82, 2.15, 2.40, 2.97, 3.42],
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointBackgroundColor: '#0d9488',
        pointRadius: 5,
        yAxisID: 'y'
      },
      {
        label: "Granulation %",
        data: [72, 68, 62, 52, 41, 38],
        borderColor: '#f59e0b',
        borderDash: [5, 4],
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        pointRadius: 5,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Area (cm²)', font: { size: 10 } },
        grid: { color: '#f1f5f9' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Granulation %', font: { size: 10 } },
        grid: { drawOnChartArea: false },
        min: 0,
        max: 100
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#64748b' }
      }
    }
  };

  return (
    <div className="page-container" style={{ paddingBottom: '70px' }}>
      
      {/* 1. Patient Header & Quick Demographic Card */}
      <div className="clinical-panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Identity & Contact Details */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--color-text-title)'
            }}>
              RS
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-title)' }}>Rahul Sharma</h2>
                <span className="pill-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                  #CV-8921
                </span>
              </div>
              
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                <span>Male, 58 Yrs</span> • <span>DOB: 14-Aug-1966</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={13} /> +1 (555) 234-8921
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={13} /> r.sharma@example.com
                </span>
                <span>👤 Caregiver: Anita Sharma (Wife)</span>
              </div>

              <div style={{ marginTop: '6px', fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                🩺 Assigned: <strong>Dr. Ananya Rao, MD</strong> • Diabetic Wound & Podiatric Surgery
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn-clinical-secondary" style={{ fontSize: '12px' }}>
              <Edit3 size={13} />
              <span>Edit Demographics</span>
            </button>
            <button className="btn-clinical-secondary" style={{ fontSize: '12px' }}>
              <Share2 size={13} />
              <span>Share Care Team</span>
            </button>
            <button className="btn-clinical-secondary" style={{ fontSize: '12px' }}>
              <Printer size={13} />
              <span>Print Summary</span>
            </button>
            <button onClick={() => navigate('/upload')} className="btn-clinical-primary" style={{ fontSize: '12px' }}>
              <Plus size={14} />
              <span>Start New Analysis</span>
            </button>
          </div>
        </div>

        {/* Clinical Indicators Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--color-border-light)' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', alignSelf: 'center', marginRight: '4px' }}>
            Clinical Indicators:
          </span>
          <span className="pill-badge pill-high" style={{ fontSize: '11px' }}>● Type 2 Diabetes (14 yrs)</span>
          <span className="pill-badge pill-critical" style={{ fontSize: '11px' }}>● Peripheral Neuropathy (10g Monofilament Loss)</span>
          <span className="pill-badge" style={{ backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', fontSize: '11px' }}>
            ● PAD (ABPI R: 0.82 / L: 0.76)
          </span>
          <span className="pill-badge" style={{ backgroundColor: '#faf5ff', color: '#6b21a8', border: '1px solid #e9d5ff', fontSize: '11px' }}>
            ● Nephropathy Stage 2
          </span>
          <span className="pill-badge pill-verified" style={{ fontSize: '11px' }}>● DeepVision CDSS Monitored</span>
        </div>
      </div>

      {/* 2. Five KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '22px' }}>
        
        {/* Overall Risk Level */}
        <div className="kpi-card" style={{ padding: '14px 16px' }}>
          <span className="kpi-card-title">Overall Risk Level</span>
          <div style={{ marginTop: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626' }}>High Risk</span>
          </div>
          <span className="pill-badge pill-critical" style={{ fontSize: '10px', width: 'fit-content' }}>
            Trajectory: Worsening
          </span>
          <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Elevated infection likelihood</span>
        </div>

        {/* Ulcer Classification */}
        <div className="kpi-card" style={{ padding: '14px 16px' }}>
          <span className="kpi-card-title">Ulcer Classification</span>
          <div style={{ marginTop: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-title)' }}>Wagner Gr. 3</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Texas II-B (Deep / Infected)</span>
          <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>VGG16 Conf: 96.8%</span>
        </div>

        {/* Active Site & Area */}
        <div className="kpi-card" style={{ padding: '14px 16px' }}>
          <span className="kpi-card-title">Active Site & Area</span>
          <div style={{ marginTop: '8px', marginBottom: '6px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-title)' }}>3.42</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>cm²</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>L. Plantar 1st Metatarsal</span>
          <span style={{ fontSize: '10.5px', color: '#dc2626', fontWeight: 600, marginTop: '4px' }}>+0.45 cm² vs last visit</span>
        </div>

        {/* Healing Velocity */}
        <div className="kpi-card" style={{ padding: '14px 16px' }}>
          <span className="kpi-card-title">Healing Velocity</span>
          <div style={{ marginTop: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626' }}>-15.2%</span>
          </div>
          <span className="pill-badge pill-critical" style={{ fontSize: '10px', width: 'fit-content' }}>Alert</span>
          <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Under 40% target threshold</span>
        </div>

        {/* Care Progression */}
        <div className="kpi-card" style={{ padding: '14px 16px' }}>
          <span className="kpi-card-title">Care Progression</span>
          <div style={{ marginTop: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-title)' }}>Day 42</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Next: Oct 28, 2024</span>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginTop: '6px' }}>
            <div style={{ width: '60%', height: '100%', backgroundColor: 'var(--teal-750)', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--color-border)', marginBottom: '22px' }}>
        {[
          { id: 'timeline', label: 'Longitudinal Progression & Timeline' },
          { id: 'labs', label: 'Clinical History & Labs' },
          { id: 'biometrics', label: 'Biometric Wound Logs' },
          { id: 'notes', label: 'Clinical Notes' },
          { id: 'careteam', label: 'Care Team & Orders' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--teal-850)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === tab.id ? '3px solid var(--teal-850)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Wound Surface Area & Granulation Dynamic Chart */}
      <div className="clinical-panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="panel-title">Wound Surface Area & Granulation Dynamic</h3>
              <span className="pill-badge pill-verified" style={{ fontSize: '10.5px' }}>6 Encounters</span>
            </div>
            <p className="panel-subtitle">Longitudinal biometry: Left Plantar Hallux Metatarsal (Aug 15 - Oct 24, 2024)</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="pill-badge pill-moderate" style={{ fontSize: '10.5px' }}>
              Offloading Non-Compliance: DVI
            </span>
          </div>
        </div>

        <div style={{ height: '240px', width: '100%', marginTop: '8px' }}>
          <Line data={woundDynamicsData} options={chartOptions} />
        </div>
      </div>

      {/* 5. Longitudinal Visual Comparator (Baseline vs Current Visit) */}
      <div className="clinical-panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="panel-title">Longitudinal Visual Comparator</h3>
              <span className="pill-badge pill-critical" style={{ fontSize: '10.5px' }}>
                Progressive Deterioration Detected
              </span>
            </div>
            <p className="panel-subtitle">Baseline Scan (Day 1) calibrated against Current Visit (Day 42)</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setShowGradCamComparison(!showGradCamComparison)}
              className="btn-clinical-secondary" 
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              <Sparkles size={13} />
              <span>Toggle Grad-CAM Heatmap</span>
            </button>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>IoU Alignment: 0.942</span>
          </div>
        </div>

        {/* Side-by-Side Images */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', margin: '14px 0' }}>
          
          {/* Baseline Left */}
          <div style={{
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: '#0b1120'
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              color: '#ffffff',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>BASELINE: 15-Aug-2024</span>
              <span style={{ color: '#38bdf8' }}>Wagner 1 • 1.45 cm²</span>
            </div>
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={baselineImg} 
                alt="Baseline Ulcer" 
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{
              backgroundColor: '#0f172a',
              color: '#94a3b8',
              padding: '6px 12px',
              fontSize: '11px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Granulation: 72% • Slough: 20%</span>
              <span>Intake Registered</span>
            </div>
          </div>

          {/* Current Right */}
          <div style={{
            border: '2px solid #dc2626',
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: '#0b1120',
            position: 'relative'
          }}>
            <div style={{
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>CURRENT VISIT: 24-Oct-2024</span>
              <span>Wagner 3 • 3.42 cm²</span>
            </div>
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={currentImg} 
                alt="Current Ulcer" 
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{
              backgroundColor: '#0f172a',
              color: '#f87171',
              padding: '6px 12px',
              fontSize: '11px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Granulation: 38% • Slough: 54% • Necrotic: 8%</span>
              <span style={{ fontWeight: 700 }}>⚠ Subcutaneous Extension</span>
            </div>
          </div>
        </div>

        {/* Delta Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', paddingTop: '10px' }}>
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Area Expansion</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>+1.97 cm² (+135.8%)</div>
          </div>

          <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '10px 12px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#9a3412', textTransform: 'uppercase' }}>Granulation Delta</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>-34.0% (Loss of viable matrix)</div>
          </div>

          <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '10px 12px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>Clinical Triage</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f766e', marginTop: '2px' }}>Urgent Debridement Req.</div>
          </div>
        </div>
      </div>

      {/* 6. Longitudinal Diagnostic Timeline */}
      <div className="clinical-panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Longitudinal Diagnostic Timeline</h3>
            <p className="panel-subtitle">Sequential deep learning segmentations and clinical milestones</p>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Sort: Newest First</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          
          {/* Timeline Item 1: Oct 24, 2024 */}
          <div style={{
            display: 'flex',
            gap: '16px',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '14px 16px',
            backgroundColor: '#ffffff'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <img src={currentImg} alt="Oct 24" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pill-badge pill-critical">Wagner Gr. 3</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>24-Oct-2024 (Today)</h4>
                  <span className="pill-badge pill-pending" style={{ fontSize: '10px' }}>Clinician Review Pending</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => navigate('/predictions/current')}
                    className="btn-clinical-primary" 
                    style={{ fontSize: '11.5px', padding: '4px 10px' }}
                  >
                    View Scan & Grad-CAM
                  </button>
                  <button 
                    onClick={() => navigate('/reports/current')}
                    className="btn-clinical-secondary" 
                    style={{ fontSize: '11.5px', padding: '4px 10px' }}
                  >
                    Open Full Report
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '14px', marginBottom: '6px' }}>
                <span>Area: <strong style={{ color: '#dc2626' }}>3.42 cm²</strong></span>
                <span>Confidence: <strong>96.8%</strong></span>
                <span>Depth: <strong>Stage II-B</strong></span>
              </div>

              <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                <strong>AI Recommendation:</strong> Surgical debridement indicated for slough removal. Immediate offloading pressure redistribution suggested. Probe-to-bone evaluation recommended.
              </p>
            </div>
          </div>

          {/* Timeline Item 2: Oct 10, 2024 */}
          <div style={{
            display: 'flex',
            gap: '16px',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: '14px 16px',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, opacity: 0.9 }}>
              <img src={currentImg} alt="Oct 10" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pill-badge pill-moderate">Wagner Gr. 2</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>10-Oct-2024 (14 Days Ago)</h4>
                  <span className="pill-badge pill-verified" style={{ fontSize: '10px' }}>Completed & Signed</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-clinical-secondary" style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                    View Scan
                  </button>
                  <button className="btn-clinical-secondary" style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                    View Report
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '14px', marginBottom: '6px' }}>
                <span>Area: <strong>2.97 cm²</strong></span>
                <span>Confidence: <strong>94.2%</strong></span>
                <span>Granulation: <strong>41%</strong></span>
              </div>

              <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                <strong>Dr. Ananya Rao:</strong> Peri-wound erythema extending &gt;4mm beyond margins. Prescribed antimicrobial silver dressing and reinforced wheelchair offloading protocol.
              </p>
            </div>
          </div>

          {/* Timeline Item 3: Sep 26, 2024 */}
          <div style={{
            display: 'flex',
            gap: '16px',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: '14px 16px',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, opacity: 0.85 }}>
              <img src={baselineImg} alt="Sep 26" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pill-badge pill-low">Wagner Gr. 1</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>26-Sep-2024 (4 Weeks Ago)</h4>
                  <span className="pill-badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '10px' }}>Routine Follow-up</span>
                </div>
                
                <button className="btn-clinical-secondary" style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                  View Scan
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '14px', marginBottom: '6px' }}>
                <span>Area: <strong>2.40 cm²</strong></span>
                <span>Confidence: <strong>92.5%</strong></span>
                <span>Granulation: <strong>52%</strong></span>
              </div>

              <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                <strong>Dr. Ananya Rao:</strong> Minor callus breakdown noted at plantar aspect. Patient reported occasional weight bearing without therapeutic boot.
              </p>
            </div>
          </div>

          {/* Timeline Item 4: Aug 15, 2024 */}
          <div style={{
            display: 'flex',
            gap: '16px',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: '14px 16px',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, opacity: 0.8 }}>
              <img src={baselineImg} alt="Aug 15" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pill-badge pill-low">Baseline Gr. 1</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>15-Aug-2024 (Baseline Intake)</h4>
                  <span className="pill-badge pill-verified" style={{ fontSize: '10px' }}>Intake Registered</span>
                </div>
                
                <button className="btn-clinical-secondary" style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                  View Baseline
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '14px', marginBottom: '6px' }}>
                <span>Area: <strong>1.45 cm²</strong></span>
                <span>Confidence: <strong>99.1%</strong></span>
                <span>Granulation: <strong>72%</strong></span>
              </div>

              <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                Initial referral from endocrinology clinic. Superficial ulcer over prior neuropathic callosity. Monofilament exam confirms loss of protective sensation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Bottom Two Columns: Active Care Protocol & Physician Encounter Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '24px' }}>
        
        {/* Left Column: Active Care Protocol */}
        <div className="clinical-panel">
          <div className="panel-header">
            <h3 className="panel-title">Active Care Protocol</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '10px 12px'
            }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-title)' }}>
                Hydrogel with Ionic Silver Dressing
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Apply q48h following sterile saline cleansing.
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '10px 12px'
            }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-title)' }}>
                Rigid Offloading Boot (24/7 Offloading)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Mandatory for all ambulatory steps (100% compliance target).
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '10px 12px'
            }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-title)' }}>
                Daily Foot Temp Telemetry
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Alert threshold: &gt;2.2°C asymmetry between contralateral limbs.
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '10px 12px'
            }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-title)' }}>
                Surgical Consultation
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Scheduled for Oct 25, 2024 at 10:00 AM (OR Suite 3).
              </div>
            </div>
          </div>

          <button className="btn-clinical-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            Update Prescribed Protocol
          </button>
        </div>

        {/* Right Column: Physician Encounter Log */}
        <div className="clinical-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Physician Encounter Log</h3>
              <p className="panel-subtitle">Entries authenticated by Dr. Ananya Rao, MD</p>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>License: #POD-91822</span>
          </div>

          {/* Historical Log Entries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {encounterNotes.map((note, idx) => (
              <div key={idx} style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: 'var(--teal-850)', marginBottom: '4px' }}>
                  <span>{note.date}</span>
                  <span style={{ color: '#059669' }}>Signed Electronically</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                  "{note.text}"
                </p>
              </div>
            ))}
          </div>

          {/* Append Note Input Form */}
          <form onSubmit={handleAppendNote} style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
              Add Append Note / Triage Remark
            </span>
            <textarea
              rows={3}
              placeholder="Document clinical impressions, offloading compliance checks, or debridement recommendations..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '12.5px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                marginBottom: '10px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => setNewNote('')}
                className="btn-clinical-secondary" 
                style={{ fontSize: '12px' }}
              >
                Discard
              </button>
              <button 
                type="submit" 
                className="btn-clinical-primary" 
                style={{ fontSize: '12px' }}
              >
                <PenTool size={13} />
                <span>Sign & Append Note</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
