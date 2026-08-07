import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';
import imageService from '../services/imageService';
import predictionService from '../services/predictionService';
import ImageUploader from '../components/ImageUploader';
import AIBrainPipeline from '../components/AIBrainPipeline';
import { ArrowRight, User, ShieldAlert, Cpu } from 'lucide-react';

export const Upload = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(10);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const list = await patientService.listPatients();
        setPatients(list);
        if (list.length > 0) {
          setSelectedPatientId(list[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load patient profiles. Ensure database migrations are updated.");
      }
    };
    loadPatients();
  }, []);

  const handleFileSelected = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleTriggerInference = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError("Please select a patient profile.");
      return;
    }
    if (!file) {
      setError("Please upload a clinical image file.");
      return;
    }

    try {
      setLoading(true);
      setError('');
      setProgress(10);

      // Simple animation helper for visual wow
      const progressTimer = setInterval(() => {
        setProgress(p => (p < 90 ? p + 10 : p));
      }, 400);
      
      // Step 1: Upload Image Binary
      const uploadRes = await imageService.uploadImage(selectedPatientId, file);
      const imageId = uploadRes.image.id;
      setProgress(40);
      
      // Step 2: Trigger Inference Task
      const predRes = await predictionService.runPrediction(imageId, selectedPatientId);
      setProgress(80);
      
      clearInterval(progressTimer);
      setProgress(100);
      
      // Wait for user to see completed state briefly
      setTimeout(() => {
        navigate(`/predictions/${predRes.id}`);
      }, 500);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Assessment pipeline failed. Verify image format.");
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ animation: 'fadeIn var(--transition-normal)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="title-large" style={{ fontFamily: 'var(--font-secondary)', fontWeight: 700 }}>
          Inference Workstation
        </h1>
        <p className="subtitle" style={{ margin: 0 }}>
          Upload patient plantar surface photos to run AI risk assessments.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: '20px' }}>
          <AIBrainPipeline progress={progress} message="Executing neural network..." />
        </div>
      ) : (
        <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
          {/* Left Column: Config Form */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 className="card-title" style={{ marginBottom: '20px' }}>
              Assessment Configuration
            </h3>
            
            <form onSubmit={handleTriggerInference}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="patientSelect">
                  Select Patient Profile
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="patientSelect"
                    className="form-input form-select"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                    disabled={loading}
                    required
                  >
                    {patients.length === 0 ? (
                      <option value="">-- No Patients Found --</option>
                    ) : (
                      patients.map((pat) => (
                        <option key={pat.id} value={pat.id}>
                          {pat.full_name} ({pat.patient_code})
                        </option>
                      ))
                    )}
                  </select>
                  <User size={18} style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-secondary)'
                  }} />
                </div>
                <p className="form-helper">
                  Image metadata will be permanently mapped to the selected patient profile.
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
                disabled={loading || patients.length === 0}
              >
                <Cpu size={18} />
                Initiate AI Diagnostics
              </button>
            </form>
          </div>

          {/* Right Column: File Drag & Drop */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '20px' }}>
              Clinical Foot Image Upload
            </h3>
            <ImageUploader onFileSelected={handleFileSelected} label="Select plantar view foot image file" />
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Upload;
