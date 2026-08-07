import api from './api';

export const imageService = {
  async uploadImage(patientId, file) {
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('file', file);
    
    const response = await api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async getImageMetadata(imageId) {
    const response = await api.get(`/images/${imageId}`);
    return response.data;
  },

  async deleteImage(imageId) {
    const response = await api.delete(`/images/${imageId}`);
    return response.data;
  }
};

export default imageService;
