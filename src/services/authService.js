import api from './api';

const authService = {
  // Kullanıcı kaydı
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Kullanıcı girişi
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Admin kaydı
  registerAdmin: async (userData) => {
    const response = await api.post('/auth/register-admin', userData);
    return response.data;
  },

  // Mevcut kullanıcı bilgisi
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

export default authService;
