import React, { useState } from 'react';
import { Calendar, Phone, Award, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';

export const Doctors = () => {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  const doctors = [
    {
      name: "Dr. Alexander Fleming",
      dept: "Endocrinology & Diabetic Care",
      email: "fleming@curavision.org",
      phone: "+1 (555) 019-2831",
      patients: 14,
      cases: 48,
      success: "98%",
      avail: "Active",
      schedule: [
        { time: "09:30 AM", type: "Regular Triage", patient: "Registry Patient (PAT-001)" },
        { time: "11:00 AM", type: "Vascular Review", patient: "Arthur Dent (PAT-902)" }
      ]
    },
    {
      name: "Dr. Grace Hopper",
      dept: "Wound Care Triage Clinic",
      email: "hopper@curavision.org",
      phone: "+1 (555) 021-9876",
      patients: 22,
      cases: 86,
      success: "95%",
      avail: "Active",
      schedule: [
        { time: "10:30 AM", type: "Ulcer Dressing", patient: "Ford Prefect (PAT-403)" }
      ]
    },
    {
      name: "Dr. Elizabeth Blackwell",
      dept: "Podiatry Operations",
      email: "blackwell@curavision.org",
      phone: "+1 (555) 088-2345",
      patients: 9,
      cases: 31,
      success: "100%",
      avail: "On Call",
      schedule: [
        { time: "03:00 PM", type: "Emergency Consultation", patient: "Tricia McMillan (PAT-500)" }
      ]
    }
  ];

  const selectedDoc = doctors[selectedDocIndex];

  return (
    <div className="page-container" style={{ animation: 'fadeIn var(--transition-normal)' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="title-large" style={{ fontFamily: 'var(--font-secondary)', fontWeight: 700 }}>
          Clinicians Registry
        </h1>
        <p className="subtitle" style={{ margin: 0 }}>
          Manage available doctors, review active clinical schedules, and trace workloads.
        </p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1.8fr', gap: '32px' }}>
        
        {/* Left Column: Doctor list cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {doctors.map((doc, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedDocIndex(idx)}
              className="card card-lift glow-border"
              style={{
                cursor: 'pointer',
                borderColor: selectedDocIndex === idx ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: selectedDocIndex === idx ? 'var(--color-hover-bg)' : 'var(--color-card-bg)',
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                🩺
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{doc.name}</h4>
                  <span className={`badge ${doc.avail === 'Active' ? 'badge-normal' : 'badge-mild'}`}>
                    {doc.avail}
                  </span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px' }}>{doc.dept}</span>
                
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <span>Patients: <strong>{doc.patients}</strong></span>
                  <span>Reviewed: <strong>{doc.cases}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Sliding/Detail panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-secondary)' }}>
              {selectedDoc.name}
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{selectedDoc.dept}</span>
          </div>

          {/* Details list */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <Mail size={16} style={{ color: 'var(--color-primary)' }} />
              <span>{selectedDoc.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <Phone size={16} style={{ color: 'var(--color-primary)' }} />
              <span>{selectedDoc.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <Award size={16} style={{ color: 'var(--color-gold)' }} />
              <span>Inference Success: <strong>{selectedDoc.success}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--color-secondary)' }} />
              <span>HIPAA Certified Node</span>
            </div>
          </div>

          {/* Schedule timeline */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} /> Clinical Schedule Today
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedDoc.schedule.map((sch, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '13px'
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{sch.time} - {sch.type}</span>
                    <strong>{sch.patient}</strong>
                  </div>
                  <span className="badge badge-normal" style={{ fontSize: '11px' }}>Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Doctors;
