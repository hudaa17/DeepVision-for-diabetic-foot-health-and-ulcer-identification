import api from './api';

export const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  async getPatientDashboard() {
    const response = await api.get('/dashboard/history');
    return response.data;
  },

  async getSummary() {
    const response = await api.get('/dashboard');
    return response.data;
  }
};

export default dashboardService;
