import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';
import predictionService from '../services/predictionService';
import dashboardService from '../services/dashboardService';
import { useAuth } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users, UserPlus, Search, Calendar, Phone, Activity, 
  FileText, ShieldAlert, ChevronRight, Plus, Eye 
} from 'lucide-react';

export const PatientHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [predictions, setPredictions] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');
  
  // Registration Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientCode, setPatientCode] = useState('');
  const [fullName, setFullName] = useState(''); // Used if we want to create it
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [diaType, setDiaType] = useState('Type 2');
  const [diaYear, setDiaYear] = useState('2018');
  const [saving, setSaving] = useState(false);

  const isClinicianOrAdmin = ['clinician', 'admin'].includes(user?.role);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        if (user.role === 'patient') {
          // Fetch specific patient history
          const patientDashboard = await dashboardService.getPatientDashboard();
          const patData = await patientService.getPatient(patientDashboard.patient_id);
          setSelectedPatient(patData);
          setPredictions(patientDashboard.prediction_history || []);
        } else {
          // Fetch all patients
          const list = await patientService.listPatients();
          setPatients(list);
          if (list.length > 0) {
            handleSelectPatient(list[0]);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Inaccessible resource registry. Check clinical credentials.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [user]);

  const handleSelectPatient = async (patient) => {
    try {
      setLoadingHistory(true);
      setSelectedPatient(patient);
      const history = await predictionService.listPredictions({ patient_id: patient.id });
      setPredictions(history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const list = await patientService.listPatients({ search_term: searchTerm });
      setPatients(list);
      if (list.length > 0) {
        handleSelectPatient(list[0]);
      } else {
        setSelectedPatient(null);
        setPredictions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!patientCode || !dob || !phone) {
      alert("Please fill in required fields.");
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        patient_code: patientCode,
        date_of_birth: dob,
        gender: gender,
        phone: phone,
        medical_history: {
          diabetes_type: diaType,
          diagnosis_year: parseInt(diaYear) || 2020,
          full_name: fullName // Store fullname in history
        }
      };

      const newPat = await patientService.createPatient(payload);
      setPatients([newPat, ...patients]);
      handleSelectPatient(newPat);
      setShowAddModal(false);
      
      // Reset Form
      setPatientCode('');
      setFullName('');
      setDob('');
      setPhone('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to create patient profile. Check uniqueness of Patient Code.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && patients.length === 0 && !selectedPatient) {
    return <LoadingSpinner progress={50} message="Loading Patient registries..." inline={false} />;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="title-large" style={{ fontFamily: 'var(--font-secondary)', fontWeight: 700 }}>
            {user.role === 'patient' ? 'My Health History' : 'Patient Registry'}
          </h1>
          <p className="subtitle" style={{ margin: 0 }}>
            {user.role === 'patient' 
              ? 'View details of your past diagnostics and clinical reports.' 
              : 'Search patient records, create diagnostic mappings, and view prediction histories.'}
          </p>
        </div>
        {isClinicianOrAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <UserPlus size={18} />
            Register Patient
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {user.role === 'patient' ? (
        /* Patient Portal View */
        <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 2fr', gap: '32px' }}>
          {/* Patient Card info */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 className="card-title" style={{ color: 'var(--color-primary)' }}>My Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ fontSize: '14px' }}>
                <span style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Patient Code
                </span>
                <strong style={{ fontFamily: 'monospace', fontSize: '15px' }}>{selectedPatient?.patient_code}</strong>
              </div>
              <div style={{ fontSize: '14px' }}>
                <span style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Date of Birth
                </span>
                <strong>{selectedPatient?.date_of_birth || 'N/A'}</strong>
              </div>
              <div style={{ fontSize: '14px' }}>
                <span style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Gender
                </span>
                <strong>{selectedPatient?.gender || 'N/A'}</strong>
              </div>
              <div style={{ fontSize: '14px' }}>
                <span style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Phone Number
                </span>
                <strong>{selectedPatient?.phone || 'N/A'}</strong>
              </div>
              {selectedPatient?.medical_history && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', fontSize: '13px' }}>
                  <span style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                    Clinical History Details
                  </span>
                  <div>Diabetes: {selectedPatient.medical_history.diabetes_type || 'N/A'}</div>
                  <div>Diagnosis Year: {selectedPatient.medical_history.diagnosis_year || 'N/A'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Predictions History */}
          <div className="card">
            <h3 className="card-title">My Diagnostic Assessments</h3>
            <div className="table-container" style={{ marginTop: '20px', boxShadow: 'none', border: '1px solid var(--color-border)' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Assessment ID</th>
                    <th>Risk classification</th>
                    <th>Confidence</th>
                    <th>Date Generated</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        No diagnostic history found.
                      </td>
                    </tr>
                  ) : (
                    predictions.map((pred) => (
                      <tr key={pred.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {pred.id.substring(0, 8)}
                        </td>
                        <td>
                          <span className={`badge ${
                            pred.risk_level === 'severe' ? 'badge-severe' : pred.risk_level === 'mild' ? 'badge-mild' : 'badge-normal'
                          }`}>
                            {pred.risk_level}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {(pred.confidence_score * 100).toFixed(1)}%
                        </td>
                        <td>
                          {new Date(pred.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => navigate(`/predictions/${pred.id}`)}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Clinician Registry split layout */
        <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 2fr', gap: '32px' }}>
          {/* Left Column: Patient List Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Registry Search</h3>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by Code or Phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                  <Search size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-secondary)'
                  }} />
                </div>
                <button type="submit" className="btn btn-outline" style={{ padding: '12px 16px' }}>
                  Filter
                </button>
              </form>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                  Patient Entries ({patients.length})
                </h4>
              </div>
              
              <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {patients.length === 0 ? (
                  <p className="text-muted" style={{ padding: '24px', textAlign: 'center' }}>No patient entries found.</p>
                ) : (
                  patients.map((pat) => (
                    <div 
                      key={pat.id}
                      onClick={() => handleSelectPatient(pat)}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        backgroundColor: selectedPatient?.id === pat.id ? 'var(--color-hover-bg)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)', display: 'block' }}>
                          {pat.medical_history?.full_name || `Patient Profile`}
                        </strong>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                          Code: {pat.patient_code}
                        </span>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--color-text-secondary)' }} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Patient Profile details & Assessments list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {selectedPatient ? (
              <>
                <div className="card">
                  <div className="flex-between" style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>
                      Profile: {selectedPatient.medical_history?.full_name || 'Patient Details'}
                    </h3>
                    <button 
                      onClick={() => navigate(`/upload`)} 
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
                    >
                      <Plus size={12} /> Run Assessment
                    </button>
                  </div>
                  
                  <div className="grid-3" style={{ gap: '16px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Registry Code
                      </span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px' }}>
                        {selectedPatient.patient_code}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Date of Birth
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedPatient.date_of_birth || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Gender / Phone
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedPatient.gender || 'N/A'} | {selectedPatient.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {selectedPatient.medical_history && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', fontSize: '13px' }}>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                        Clinical History Metrics
                      </span>
                      <div>Diabetes: {selectedPatient.medical_history.diabetes_type || 'N/A'}</div>
                      <div>Diagnosis Year: {selectedPatient.medical_history.diagnosis_year || 'N/A'}</div>
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3 className="card-title">Historical Assessments</h3>
                  
                  {loadingHistory ? (
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                      <div className="skeleton animate-pulse-ai" style={{ width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto' }}></div>
                    </div>
                  ) : (
                    <div className="table-container" style={{ marginTop: '20px', boxShadow: 'none', border: '1px solid var(--color-border)' }}>
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Assessment ID</th>
                            <th>Risk classification</th>
                            <th>Confidence</th>
                            <th>Date Generated</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predictions.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                No past assessments recorded for this patient.
                              </td>
                            </tr>
                          ) : (
                            predictions.map((pred) => (
                              <tr key={pred.id}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                  {pred.id.substring(0, 8)}
                                </td>
                                <td>
                                  <span className={`badge ${
                                    pred.risk_level === 'severe' ? 'badge-severe' : pred.risk_level === 'mild' ? 'badge-mild' : 'badge-normal'
                                  }`}>
                                    {pred.risk_level}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>
                                  {(pred.confidence_score * 100).toFixed(1)}%
                                </td>
                                <td>
                                  {new Date(pred.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <button
                                    onClick={() => navigate(`/predictions/${pred.id}`)}
                                    className="btn btn-outline"
                                    style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="card flex-center" style={{ minHeight: '260px' }}>
                <p className="text-muted">Select or register a patient profile to begin assessments.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Register Patient Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '32px' }}>
            <h3 className="card-title" style={{ marginBottom: '24px' }}>Register Patient Record</h3>
            
            <form onSubmit={handleCreatePatient}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Alexander Fleming"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Patient Code (Unique ID)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="PAT-12892"
                    value={patientCode}
                    onChange={(e) => setPatientCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-input form-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Diabetes Classification</label>
                  <select
                    className="form-input form-select"
                    value={diaType}
                    onChange={(e) => setDiaType(e.target.value)}
                  >
                    <option value="Type 1">Type 1 Diabetes</option>
                    <option value="Type 2">Type 2 Diabetes</option>
                    <option value="Pre-diabetic">Pre-diabetic</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Diagnosis Year</label>
                  <input
                    type="number"
                    className="form-input"
                    value={diaYear}
                    onChange={(e) => setDiaYear(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Creating record...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
