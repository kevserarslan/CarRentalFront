import api from './api';

const userService = {
  // Tüm kullanıcılar (Admin)
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Kullanıcı detayı (Admin)
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Kullanıcı güncelle
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Kendi profilini güncelle
  updateCurrentUser: async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  // Kullanıcı sil (Admin)
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
