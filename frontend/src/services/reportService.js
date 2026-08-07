import api from './api';

export const reportService = {
  async generateReport(predictionId, doctorNotes) {
    const response = await api.post(`/reports/${predictionId}`, {
      doctor_notes: doctorNotes
    });
    return response.data;
  },

  async getReport(predictionId) {
    const response = await api.get(`/reports/${predictionId}`);
    return response.data;
  },

  async downloadReport(predictionId) {
    const response = await api.get(`/reports/download/${predictionId}`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `diabetic_foot_report_${predictionId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  }
};

export default reportService;
