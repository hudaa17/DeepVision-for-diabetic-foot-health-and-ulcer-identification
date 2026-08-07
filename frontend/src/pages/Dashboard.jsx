import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, FileSpreadsheet, AlertOctagon, TrendingUp, Calendar, ArrowRight, ShieldAlert, FileText, Search, Plus } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title
);

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Could not load dashboard statistics. Please verify backend connections.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner progress={30} message="Syncing clinical telemetry..." inline={false} />;

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

  const { total_patients, total_predictions, risk_distribution, monthly_trends, recent_predictions } = stats || {};

  const doughnutData = {
    labels: ['Normal Risk', 'Mild Risk', 'Severe Risk'],
    datasets: [
      {
        data: [risk_distribution?.normal || 0, risk_distribution?.mild || 0, risk_distribution?.severe || 0],
        backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
        borderWidth: 1,
        borderColor: ['#fff', '#fff', '#fff']
      },
    ],
  };

  const barData = {
    labels: monthly_trends?.length > 0 ? monthly_trends.map(t => t.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Assessments',
        data: monthly_trends?.length > 0 ? monthly_trends.map(t => t.count) : [12, 19, 3, 5, 2, 3],
        backgroundColor: '#2563EB',
        borderRadius: 6,
      },
    ],
  };

  const filteredPredictions = recent_predictions?.filter(pred => 
    pred.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pred.risk_level.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="page-container" style={{ animation: 'fadeIn var(--transition-normal)' }}>
      
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="title-large" style={{ fontFamily: 'var(--font-secondary)', fontWeight: 700 }}>
            Workstation Dashboard
          </h1>
          <p className="subtitle" style={{ margin: 0 }}>
            Operational overview of AI-assisted patient risk assessment metrics.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: '6px 12px',
            backgroundColor: 'var(--color-white)'
          }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Quick search registry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', width: '160px' }}
            />
          </div>
          <button 
            onClick={() => navigate('/upload')}
            className="btn btn-primary"
          >
            <Plus size={16} /> New Assessment
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--color-primary)', padding: '10px' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Patients</span>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{total_patients}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--color-ai-accent)', padding: '10px' }}>
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Predictions</span>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{total_predictions}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--color-high-risk)', padding: '10px' }}>
            <AlertOctagon size={24} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>High Risk Alert</span>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-high-risk)' }}>{risk_distribution?.severe || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#FEF9C3', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--color-gold)', padding: '10px' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Active Model</span>
            <h3 style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>v_mobilenet_v2</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Workload & Calendar */}
      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
        
        {/* Left Column: Charts and Patient list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="grid-2">
            {/* Donut chart */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 className="card-title" style={{ alignSelf: 'flex-start', fontSize: '15px' }}>Risk Distribution</h3>
              <div style={{ width: '100%', maxWidth: '180px', marginTop: '16px' }}>
                <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>

            {/* Monthly Trend bar chart */}
            <div className="card">
              <h3 className="card-title" style={{ fontSize: '15px' }}>Monthly Assessments</h3>
              <div style={{ height: '180px' }}>
                <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>

          {/* Recent list queue */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '16px' }}>Pending AI Triage Queue</h3>
            {filteredPredictions.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No active patients matched.
              </div>
            ) : (
              <div className="table-container" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Patient Code</th>
                      <th>Risk Level</th>
                      <th>Confidence</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPredictions.map(pred => (
                      <tr key={pred.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{pred.patient_id.substring(0, 8)}</td>
                        <td>
                          <span className={`badge ${
                            pred.risk_level === 'severe' ? 'badge-severe' : pred.risk_level === 'mild' ? 'badge-mild' : 'badge-normal'
                          }`}>
                            {pred.risk_level}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{(pred.confidence_score * 100).toFixed(1)}%</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => navigate(`/predictions/${pred.id}`)}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
                          >
                            Triage <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Calendar & Schedules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="card">
            <h3 className="card-title" style={{ color: 'var(--color-primary)' }}>
              <Calendar size={18} /> Care Calendar
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>10:30 AM - Podiatry Triage</span>
                <strong style={{ fontSize: '13.5px' }}>Registry Patient (PAT-021)</strong>
              </div>
              <div style={{ borderLeft: '3px solid var(--color-secondary)', paddingLeft: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>02:00 PM - Ulcer Dressing</span>
                <strong style={{ fontSize: '13.5px' }}>Arthur Dent (PAT-902)</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">HIPAA Node Information</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Workstation connected to PACS server locally. Auto HIPAA logout timer set to 15 minutes.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
