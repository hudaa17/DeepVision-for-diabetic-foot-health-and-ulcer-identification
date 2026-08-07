import React, { useState } from 'react';
import { useAuth } from '../App';
import { User, Mail, Phone, Award, Shield, Save, Edit3, MapPin } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || 'Dr. Alexander Fleming');
  const [email, setEmail] = useState(user?.email || 'alexander@citygeneral.org');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 019-2834');
  const [hospital, setHospital] = useState('City General Hospital');
  const [department, setDepartment] = useState('Endocrinology & Wound Care');

  const handleSave = (e) => {
    e.preventDefault();
    setEditing(false);
    // Simulate saving profile data
    alert("Profile changes saved locally. System node updated.");
  };

  return (
    <div className="page-container" style={{ animation: 'fadeIn var(--transition-normal)' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="title-large" style={{ fontFamily: 'var(--font-secondary)', fontWeight: 700 }}>
          Clinician Profile
        </h1>
        <p className="subtitle" style={{ margin: 0 }}>
          Manage your secure system credentials and hospital nodes.
        </p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Left Card: Avatar Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content' }}>
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            border: '3px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {fullName.charAt(0).toUpperCase()}
          </div>
          
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            {fullName}
          </h3>
          
          <span className={`badge ${
            user?.role === 'admin' ? 'badge-gold' : user?.role === 'clinician' ? 'badge-ai' : 'badge-normal'
          }`} style={{ padding: '4px 12px', fontSize: '11px', marginBottom: '20px' }}>
            {user?.role || 'Clinician'}
          </span>

          <div style={{
            width: '100%',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '20px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '13px',
            color: 'var(--color-text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} />
              <span>{hospital}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} />
              <span>Node: Secure-WS-291</span>
            </div>
          </div>
        </div>

        {/* Right Card: Profile Form */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Secure Settings</h3>
            {!editing ? (
              <button 
                onClick={() => setEditing(true)}
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSave}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!editing}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!editing}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hospital Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  disabled={!editing}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Department / Clinic Name</label>
              <input
                type="text"
                className="form-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={!editing}
                required
              />
            </div>

            {editing && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditing(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
