import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Scan, 
  ArrowUpRight, 
  TrendingDown, 
  Eye, 
  FileText, 
  Download, 
  Filter, 
  Search, 
  ChevronDown, 
  Plus, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import testDatasetManifest from '../data/testDatasetManifest.json';
import defaultFootImg from '../assets/clinical_foot_ulcer.jpg';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTrajectoryTab, setActiveTrajectoryTab] = useState('velocity');
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tableGradeFilter, setTableGradeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Chart data for Ulcer Healing Trajectory vs Risk Recurrence
  const trajectoryChartData = {
    labels: ["May '24", "Jun '24", "Jul '24", "Aug '24", "Sep '24", "Oct '24 (Current)"],
    datasets: [
      {
        label: "Standard Healing Plan (>0.42 cm²/wk)",
        data: [1.2, 2.5, 3.8, 4.4, 4.8, 5.2],
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#0d9488',
        pointRadius: 4,
      },
      {
        label: "Secondary Risk Recurrence",
        data: [1.1, 1.8, 2.2, 2.4, 2.0, 1.4],
        borderColor: '#ea580c',
        borderDash: [5, 4],
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: '#ea580c',
        pointRadius: 4,
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
        labels: {
          boxWidth: 12,
          usePointStyle: false,
          font: { size: 11, family: 'Inter', weight: '500' },
          color: '#64748b'
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 }, color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#94a3b8' }
      }
    }
  };

  // Build screening history from all 71 dataset test images
  const screeningHistory = testDatasetManifest.map((item, idx) => {
    const isCritical = item.actual_grade === 'Grade 4' || item.actual_grade === 'Grade 3';
    const isModerate = item.actual_grade === 'Grade 2';
    const initials = item.patient_name.split(' ').map(n => n[0]).join('');

    return {
      id: item.mrn || `#CV-${8100 + idx}`,
      testId: item.id,
      name: item.patient_name,
      initials: initials,
      date: item.scan_date,
      time: item.scan_time,
      podiatrist: idx % 3 === 0 ? 'Dr. A. Rao' : (idx % 3 === 1 ? 'Dr. M. Jenkins' : 'Dr. K. Patel'),
      risk: item.risk_level,
      riskClass: isCritical ? 'pill-critical' : isModerate ? 'pill-moderate' : 'pill-low',
      wagner: item.wagner,
      wagnerClass: isCritical ? 'pill-critical' : isModerate ? 'pill-moderate' : 'pill-low',
      actual_grade: item.actual_grade,
      predicted_grade: item.predicted_grade,
      confidence: item.confidence,
      area: item.estimated_area,
      status: idx < 14 ? 'Review Pending' : 'Verified',
      statusClass: idx < 14 ? 'pill-pending' : 'pill-verified',
      predictionId: item.id,
      image_url: item.image_url,
      site: item.site
    };
  });

  const filteredHistory = screeningHistory.filter(item => {
    const query = searchTableQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(query) || 
                          item.id.toLowerCase().includes(query) ||
                          item.site.toLowerCase().includes(query) ||
                          item.actual_grade.toLowerCase().includes(query);
    const matchesRisk = riskFilter === 'ALL' || item.risk.toUpperCase().includes(riskFilter);
    const matchesGrade = tableGradeFilter === 'ALL' || item.actual_grade === tableGradeFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status.toUpperCase().includes(statusFilter);
    return matchesSearch && matchesRisk && matchesGrade && matchesStatus;
  });

  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage) || 1;
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="page-container">
      {/* Top Clinical Header */}
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              color: 'var(--teal-750)', 
              letterSpacing: '0.06em', 
              textTransform: 'uppercase',
              backgroundColor: '#e6f4f5',
              padding: '3px 8px',
              borderRadius: '4px'
            }}>
              Diabetic Wound Care CDSS • Ward 4B Active
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-title)', lineHeight: 1.2 }}>
            Good morning, Dr. Ananya Rao, MD
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Here's your diabetic foot ulcer clinical risk overview and review queue for today, Oct 24, 2024.
          </p>
        </div>

        {/* Right Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn-clinical-secondary">
            <span>Ward: Diabetic Wound Center 4B</span>
            <ChevronDown size={14} />
          </button>
          
          <button className="btn-clinical-secondary">
            <Download size={14} />
            <span>Export Roster</span>
          </button>

          <button onClick={() => navigate('/upload')} className="btn-clinical-primary">
            <Plus size={15} strokeWidth={2.4} />
            <span>Start New Analysis</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Metric Cards */}
      <div className="kpi-metrics-grid">
        {/* Total Dataset Scans Evaluated */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Test Scans Evaluated</span>
            <div className="kpi-icon-box kpi-icon-teal">
              <Scan size={18} />
            </div>
          </div>
          <div className="kpi-value-block">
            <span className="kpi-value">71 Scans</span>
            <span className="kpi-unit-label">Dataset Test Suite</span>
          </div>
          <div className="kpi-footer-stats">
            <span style={{ color: '#0d9488', fontWeight: 600 }}>Grades 1 to 4</span>
            <span>•</span>
            <span>100% evaluated</span>
          </div>
        </div>

        {/* Requiring Review */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Requiring Review</span>
            <div className="kpi-icon-box kpi-icon-orange">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value-block">
            <span className="kpi-value">14 Scans</span>
            <span className="kpi-unit-label">Pending sign-off</span>
          </div>
          <div className="kpi-footer-stats">
            <span className="pill-badge pill-pending" style={{ fontSize: '10.5px', padding: '1px 7px' }}>
              Attention Required
            </span>
            <span>&lt; 3h SLA</span>
          </div>
        </div>

        {/* High / Critical Risk DFU */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">High / Critical Risk DFU</span>
            <div className="kpi-icon-box kpi-icon-red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value-block">
            <span className="kpi-value kpi-value-red">35 Cases</span>
          </div>
          <div className="kpi-footer-stats">
            <span className="pill-badge pill-critical" style={{ fontSize: '10.5px', padding: '1px 7px' }}>
              Grades 3 & 4
            </span>
            <span>Immediate Offloading</span>
          </div>
        </div>

        {/* AI Model Diagnostic Precision */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">AI Model Accuracy</span>
            <div className="kpi-icon-box kpi-icon-blue">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="kpi-value-block">
            <span className="kpi-value">94.4%</span>
            <span className="kpi-unit-label">VGG16-DFU v1.4</span>
          </div>
          <div className="kpi-footer-stats">
            <span className="pill-badge pill-verified" style={{ fontSize: '10.5px', padding: '1px 7px' }}>
              67 / 71 Matched
            </span>
            <span>42ms latency</span>
          </div>
        </div>
      </div>

      {/* Middle Two-Column Grid: Stratification & Trajectory + Urgent Queue */}
      <div className="dashboard-split-grid">
        {/* Left Column: Stratification Breakdown & Healing Trajectory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Patient Risk Stratification Breakdown */}
          <div className="clinical-panel">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Patient Risk Stratification Breakdown</h3>
                <p className="panel-subtitle">Automated clinical risk categorization across current patient roster (N=1,248)</p>
              </div>
              <button className="btn-clinical-secondary" style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                Wagner Grading System
              </button>
            </div>

            {/* Segmented Risk Bar */}
            <div className="stratification-bar">
              <div className="strat-seg-low" style={{ width: '62%' }} title="Low Risk 62%"></div>
              <div className="strat-seg-mod" style={{ width: '24%' }} title="Moderate Risk 24%"></div>
              <div className="strat-seg-high" style={{ width: '11%' }} title="High Risk 11%"></div>
              <div className="strat-seg-crit" style={{ width: '3%' }} title="Critical 3%"></div>
            </div>

            {/* 4 Stat Items Underneath */}
            <div className="strat-legend-grid">
              <div className="strat-stat-item">
                <div className="strat-stat-header">
                  <span className="strat-stat-dot" style={{ backgroundColor: '#0d9488' }}></span>
                  <span>Low Risk</span>
                </div>
                <span className="strat-stat-percent">62%</span>
                <span className="strat-stat-sub">774 patients • Gr. 0</span>
              </div>

              <div className="strat-stat-item">
                <div className="strat-stat-header">
                  <span className="strat-stat-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                  <span>Moderate</span>
                </div>
                <span className="strat-stat-percent">24%</span>
                <span className="strat-stat-sub">300 patients • Gr. 1</span>
              </div>

              <div className="strat-stat-item">
                <div className="strat-stat-header">
                  <span className="strat-stat-dot" style={{ backgroundColor: '#ea580c' }}></span>
                  <span>High Risk</span>
                </div>
                <span className="strat-stat-percent">11%</span>
                <span className="strat-stat-sub">137 patients • Gr. 2-3</span>
              </div>

              <div className="strat-stat-item">
                <div className="strat-stat-header">
                  <span className="strat-stat-dot" style={{ backgroundColor: '#dc2626' }}></span>
                  <span>Critical</span>
                </div>
                <span className="strat-stat-percent" style={{ color: '#dc2626' }}>3%</span>
                <span className="strat-stat-sub">37 cases • Gr. 4+</span>
              </div>
            </div>
          </div>

          {/* Card 2: Ulcer Healing Trajectory vs Risk Recurrence */}
          <div className="clinical-panel">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Ulcer Healing Trajectory vs Risk Recurrence</h3>
                <p className="panel-subtitle">Cohort longitudinal tracking across 6 months clinical management</p>
              </div>

              {/* Trajectory Tab Switches */}
              <div style={{ display: 'flex', backgroundColor: 'var(--color-bg)', padding: '3px', borderRadius: '8px', gap: '3px' }}>
                {['velocity', 'granulation', 'escalations'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTrajectoryTab(tab)}
                    style={{
                      border: 'none',
                      background: activeTrajectoryTab === tab ? 'var(--color-surface)' : 'transparent',
                      color: activeTrajectoryTab === tab ? 'var(--teal-900)' : 'var(--color-text-secondary)',
                      fontWeight: activeTrajectoryTab === tab ? 700 : 500,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      boxShadow: activeTrajectoryTab === tab ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    {tab === 'velocity' ? 'Healing Velocity' : tab === 'granulation' ? 'Granulation %' : 'Escalations'}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Chart */}
            <div style={{ height: '220px', width: '100%', marginTop: '6px' }}>
              <Line data={trajectoryChartData} options={chartOptions} />
            </div>

            {/* Bottom Callout Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderRadius: '8px',
              padding: '10px 14px',
              marginTop: '16px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e' }}>
                <TrendingDown size={16} />
                <span>
                  Mean cohort healing velocity is currently <strong>18.4% faster</strong> when Grad-CAM guided debridement is deployed.
                </span>
              </div>
              <button 
                onClick={() => navigate('/patients')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--teal-750)', 
                  fontWeight: 700, 
                  fontSize: '12px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Full Analytics →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Urgent Action Queue */}
        <div className="clinical-panel">
          <div className="panel-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }}></span>
                <h3 className="panel-title">Urgent Action Queue</h3>
                <span className="pill-badge pill-critical" style={{ fontSize: '10.5px', padding: '2px 8px' }}>
                  3 High Priority
                </span>
              </div>
              <p className="panel-subtitle">Patients flagged by DeepVision AI requiring clinician validation today.</p>
            </div>
          </div>

          {/* Patient Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            
            {/* Card 1: Rahul Sharma */}
            <div className="urgent-queue-card">
              <div className="queue-patient-row">
                <div className="queue-patient-id-block">
                  <div className="patient-avatar-box">RS</div>
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-title)' }}>Rahul Sharma</h4>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>#CV-8921</span>
                  </div>
                </div>
                <span className="pill-badge pill-critical">Grade 3 Wagner</span>
              </div>
              <p className="queue-patient-meta">Age 58 • Type 2 Diabetes (14 yrs) • Male</p>

              <div className="queue-clinical-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontWeight: 600, marginBottom: '2px' }}>
                  <AlertTriangle size={13} />
                  <span>Plantar Hallux Ulceration • 96.8% AI Conf.</span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  Area: <strong>3.4 cm²</strong>, deep tissue involvement detected. Margins indicate peripheral ischemia.
                </p>
              </div>

              <div className="queue-actions-row">
                <button 
                  onClick={() => navigate('/predictions/current')}
                  className="btn-clinical-primary" 
                  style={{ flex: 1, fontSize: '12px', padding: '6px 12px' }}
                >
                  Review AI Results
                </button>
                <button 
                  onClick={() => navigate('/patients')}
                  className="btn-clinical-secondary" 
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Confirm Plan
                </button>
              </div>
            </div>

            {/* Card 2: Meera Nair */}
            <div className="urgent-queue-card">
              <div className="queue-patient-row">
                <div className="queue-patient-id-block">
                  <div className="patient-avatar-box" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>MN</div>
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-title)' }}>Meera Nair</h4>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>#CV-7740</span>
                  </div>
                </div>
                <span className="pill-badge pill-moderate">Grade 2 Wagner</span>
              </div>
              <p className="queue-patient-meta">Age 62 • Neuropathy Comorbidity • Female</p>

              <div className="queue-clinical-banner moderate">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400e', fontWeight: 600, marginBottom: '2px' }}>
                  <AlertTriangle size={13} />
                  <span>Dorsal Forefoot Erythema • 91.4% AI Conf.</span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  Callus breakdown with suspected underlying tissue maceration. Offloading recommended.
                </p>
              </div>

              <div className="queue-actions-row">
                <button 
                  onClick={() => navigate('/predictions/current')}
                  className="btn-clinical-primary" 
                  style={{ flex: 1, fontSize: '12px', padding: '6px 12px' }}
                >
                  Review AI Results
                </button>
                <button 
                  onClick={() => navigate('/patients')}
                  className="btn-clinical-secondary" 
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Schedule Offload
                </button>
              </div>
            </div>

            {/* Card 3: Arjun Kumar */}
            <div className="urgent-queue-card">
              <div className="queue-patient-row">
                <div className="queue-patient-id-block">
                  <div className="patient-avatar-box" style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}>AK</div>
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-title)' }}>Arjun Kumar</h4>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>#CV-6519</span>
                  </div>
                </div>
                <span className="pill-badge pill-low">Improving (Gr 1)</span>
              </div>
              <p className="queue-patient-meta">Age 69 • Post-debridement Wk 4 • Male</p>

              <div className="queue-clinical-banner improving">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 600, marginBottom: '2px' }}>
                  <TrendingDown size={13} />
                  <span>-22% Area Reduction • 1.1 cm² Remaining</span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  Healthy re-epithelialization confirmed along dorsal border. Dressing adjustment pending.
                </p>
              </div>

              <div className="queue-actions-row">
                <button 
                  onClick={() => navigate('/patients')}
                  className="btn-clinical-secondary" 
                  style={{ flex: 1, fontSize: '12px', padding: '6px 12px' }}
                >
                  View Trend
                </button>
                <button 
                  className="btn-clinical-primary" 
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Sign Off
                </button>
              </div>
            </div>

            {/* Bottom Queue Link */}
            <button 
              onClick={() => navigate('/patients')}
              className="btn-clinical-secondary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '6px', fontSize: '12px' }}
            >
              View All 14 In-Queue Patients →
            </button>
          </div>
        </div>
      </div>

      {/* Test Suite Evaluation Banner */}
      <div style={{
        backgroundColor: '#042f2e',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        color: '#ffffff',
        border: '1px solid #115e59'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: 'rgba(20, 184, 166, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2dd4bf',
            flexShrink: 0
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px 0', color: '#ffffff' }}>
              Full Dataset Evaluation: All 71 Test Images Available
            </h3>
            <p style={{ fontSize: '12.5px', margin: 0, color: '#99f6e4' }}>
              The model evaluates all 71 images in the dataset test suite across Grade 1 (21), Grade 2 (15), Grade 3 (5), and Grade 4 (30) with Grad-CAM explainability.
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/predictions')}
          style={{
            backgroundColor: '#0d9488',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.4)',
            transition: 'background-color 0.15s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0f766e'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
        >
          <span>Open All 71 Test Images Matrix</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Bottom Section: Recent Analyses & Screening History */}
      <div className="clinical-table-wrapper">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Test Dataset Analyses & Screening History</h3>
            <p className="panel-subtitle">Evaluated machine learning inferences and wound segmentations across all 71 test dataset scans</p>
          </div>

          {/* Filter Bar Controls */}
          <div className="table-filter-bar" style={{ margin: 0 }}>
            <div className="table-search-input">
              <Search size={14} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Filter patient, site or MRN..." 
                value={searchTableQuery}
                onChange={(e) => { setSearchTableQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <select 
              className="table-dropdown-select"
              value={tableGradeFilter}
              onChange={(e) => { setTableGradeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Grades (71)</option>
              <option value="Grade 1">Grade 1 (21 scans)</option>
              <option value="Grade 2">Grade 2 (15 scans)</option>
              <option value="Grade 3">Grade 3 (5 scans)</option>
              <option value="Grade 4">Grade 4 (30 scans)</option>
            </select>

            <select 
              className="table-dropdown-select"
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            <select 
              className="table-dropdown-select"
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>All (71 scans)</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="clinical-data-table">
            <thead>
              <tr>
                <th>Patient & Scan Preview</th>
                <th>Scan Date & Time</th>
                <th>Anatomical Site</th>
                <th>AI Detected Risk</th>
                <th>Wagner Classification</th>
                <th>Model Confidence</th>
                <th>Segmented Area</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={row.image_url} 
                        alt="" 
                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--color-border)', flexShrink: 0 }}
                        onError={(e) => { e.target.src = defaultFootImg; }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-title)' }}>{row.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{row.id} • {row.testId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{row.date}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{row.time}</div>
                  </td>
                  <td style={{ fontWeight: 500, fontSize: '12.5px' }}>{row.site}</td>
                  <td>
                    <span className={`pill-badge ${row.riskClass}`}>
                      {row.risk}
                    </span>
                  </td>
                  <td>
                    <span className={`pill-badge ${row.wagnerClass} pill-wagner`}>
                      {row.wagner}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Sparkles size={13} color="var(--teal-600)" />
                      <span>{row.confidence}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.area}</td>
                  <td>
                    <span className={`pill-badge ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions-cell">
                      <button 
                        onClick={() => navigate(`/predictions/${row.testId}`)}
                        className="table-action-icon-btn" 
                        title="View Detailed Scan & Grad-CAM"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => navigate(`/reports/${row.testId}`)}
                        className="table-action-icon-btn" 
                        title="Open Clinical Report"
                      >
                        <FileText size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination & Status Footer */}
        <div className="table-pagination-footer">
          <span>
            Showing {filteredHistory.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredHistory.length)} of {filteredHistory.length} test dataset scans • VGG16 Model v1.4 Active
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              className="btn-clinical-secondary" 
              style={{ padding: '3px 8px', fontSize: '11.5px' }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map(pageNum => (
              <button 
                key={pageNum}
                className={currentPage === pageNum ? "btn-clinical-primary" : "btn-clinical-secondary"}
                style={{ padding: '3px 9px', fontSize: '11.5px' }}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button 
              className="btn-clinical-secondary" 
              style={{ padding: '3px 8px', fontSize: '11.5px' }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
