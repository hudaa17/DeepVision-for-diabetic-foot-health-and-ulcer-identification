import api from './api';

export const adminService = {
  async listUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateUserRole(userId, role) {
    const response = await api.put(`/admin/users/${userId}`, { role });
    return response.data;
  },

  async deactivateUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async uploadDataset(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/dataset', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async triggerRetraining(datasetVersion) {
    const formData = new URLSearchParams();
    formData.append('dataset_version', datasetVersion);
    const response = await api.post('/admin/retrain', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },

  async getAuditLogs(params = {}) {
    const response = await api.get('/admin/logs', { params });
    return response.data;
  },

  async getSystemMonitoring() {
    const response = await api.get('/admin/monitoring');
    return response.data;
  }
};

export default adminService;
