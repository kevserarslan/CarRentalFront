import api from './api';

const userService = {
  // Tüm kullanıcılar (Admin)
  getAllUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },

  // Kullanıcı detayı (Admin)
  getUserById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  // Kullanıcı güncelle
  updateUser: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  // Kendi profilini güncelle
  updateCurrentUser: async (userData) => {
    const response = await api.put('/api/users/me', userData);
    return response.data;
  },

  // Kullanıcı sil (Admin)
  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
};

export default userService;
