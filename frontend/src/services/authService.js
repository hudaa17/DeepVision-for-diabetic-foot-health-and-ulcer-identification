import api from './api';

export const authService = {
  async register({ email, password, full_name, role }) {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name,
      role
    });
    return response.data;
  },

  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, refresh_token, role } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    
    // Fetch profile details
    const profile = await this.getCurrentUser();
    localStorage.setItem('user', JSON.stringify(profile));
    
    return { user: profile, token: access_token, role };
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout API failed, forcing local session clear:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export default authService;
