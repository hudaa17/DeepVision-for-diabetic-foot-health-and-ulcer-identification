import React, { useState } from 'react';
import { Download, FileText, Calendar, FileDown, PlusCircle } from 'lucide-react';
import reportService from '../services/reportService';

export const ReportViewer = ({ report, predictionId }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await reportService.downloadReport(predictionId);
    } catch (e) {
      console.error("Failed to download PDF report:", e);
      alert("Failed to download report PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const formattedDate = report.created_at ? new Date(report.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'N/A';

  return (
    <div className="card" style={{ padding: '32px' }}>
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <FileText size={24} />
          </div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontFamily: 'var(--font-secondary)',
              color: 'var(--color-text-primary)'
            }}>
              Diabetic Foot Ulcer Risk Assessment Report
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Calendar size={12} /> Generated: {formattedDate}
            </span>
          </div>
        </div>

        <button 
          onClick={handleDownload} 
          disabled={downloading}
          className="btn btn-primary"
        >
          {downloading ? (
            <>
              <div className="skeleton" style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid white' }}></div>
              Compiling...
            </>
          ) : (
            <>
              <FileDown size={18} />
              Download Clinical Report PDF
            </>
          )}
        </button>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h4 style={{
          fontSize: '14px',
          fontFamily: 'var(--font-secondary)',
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
          fontWeight: 600
        }}>
          PDF Document Metadata
        </h4>
        <div className="grid-2" style={{ gap: '12px 24px' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Document ID: <span style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)', fontWeight: 600 }}>{report.id}</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Patient ID: <span style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{report.patient_id}</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Status: <span className="badge badge-normal" style={{ fontSize: '11px' }}>signed & uploaded</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Storage Path: <span style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)', fontSize: '11px' }}>{report.report_storage_key}</span>
          </div>
        </div>
      </div>

      {report.doctor_notes && (
        <div>
          <h4 style={{
            fontSize: '15px',
            fontFamily: 'var(--font-secondary)',
            color: 'var(--color-text-primary)',
            marginBottom: '10px',
            fontWeight: 600
          }}>
            Clinician Notes & Observations
          </h4>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.6,
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
    </div>
  );
};

export default ReportViewer;
