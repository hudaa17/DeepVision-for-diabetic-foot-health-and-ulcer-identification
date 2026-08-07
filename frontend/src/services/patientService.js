import api from './api';

export const patientService = {
  async createPatient(patientData) {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  async listPatients(params = {}) {
    const response = await api.get('/patients', { params });
    return response.data;
  },

  async getPatient(patientId) {
    const response = await api.get(`/patients/${patientId}`);
    return response.data;
  },

  async updatePatient(patientId, patientData) {
    const response = await api.put(`/patients/${patientId}`, patientData);
    return response.data;
  },

  async deletePatient(patientId) {
    const response = await api.delete(`/patients/${patientId}`);
    return response.data;
  }
};

export default patientService;
