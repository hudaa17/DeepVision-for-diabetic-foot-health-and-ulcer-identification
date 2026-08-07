import api from './api';

export const predictionService = {
  async runPrediction(imageId, patientId) {
    const response = await api.post(`/predict/${imageId}?patient_id=${patientId}`);
    return response.data;
  },

  async getStatus(predictionId) {
    const response = await api.get(`/predictions/status/${predictionId}`);
    return response.data;
  },

  async getPrediction(predictionId) {
    const response = await api.get(`/predictions/${predictionId}`);
    return response.data;
  },

  async listPredictions(params = {}) {
    const response = await api.get('/predictions', { params });
    return response.data;
  },

  async deletePrediction(predictionId) {
    const response = await api.delete(`/predictions/${predictionId}`);
    return response.data;
  },

  getAssetUrl(key) {
    if (!key) return '';
    return `/api/v1/predictions/files/${key}`;
  }
};

export default predictionService;
