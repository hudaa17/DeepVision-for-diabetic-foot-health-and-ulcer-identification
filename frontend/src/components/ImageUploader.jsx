import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, Check } from 'lucide-react';

export const ImageUploader = ({ onFileSelected, previewUrl: initialPreviewUrl, label = "Upload patient clinical foot image" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl || null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid format! Please upload a JPEG or PNG image.");
      return false;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxSize) {
      alert("Image is too large. Max size allowed is 5MB.");
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        processFile(file);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        processFile(file);
      }
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    if (onFileSelected) {
      onFileSelected(file);
    }
  };

  const removeFile = (e) => {
    e.preventDefault();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileSelected) {
      onFileSelected(null);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleChange}
        accept="image/jpeg, image/png, image/jpg"
      />

      {!previewUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          style={{
            border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: '16px',
            backgroundColor: dragActive ? 'var(--color-hover-bg)' : '#FFFFFF',
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseLeave={(e) => {
            if (!dragActive) e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            marginBottom: '4px'
          }}>
            <Upload size={24} />
          </div>
          <div>
            <h4 style={{
              fontSize: '15px',
              fontFamily: 'var(--font-secondary)',
              color: 'var(--color-text-primary)',
              marginBottom: '4px'
            }}>
              {label}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Drag & Drop file here, or <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Browse files</span>
            </p>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            Accepts PNG, JPG or JPEG up to 5MB
          </span>
        </div>
      ) : (
        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '16px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Preview Thumbnail */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            flexShrink: 0
          }}>
            <img
              src={previewUrl}
              alt="Patient Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FileImage size={18} style={{ color: 'var(--color-primary)' }} />
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {selectedFile ? selectedFile.name : 'Selected Image File'}
              </span>
            </div>
            {selectedFile && (
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', marginTop: '4px', fontSize: '12px', fontWeight: 500 }}>
              <Check size={14} /> File loaded successfully
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={removeFile}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              border: 'none',
              background: '#F1F5F9',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
              e.currentTarget.style.color = 'var(--color-high-risk)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F1F5F9';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
