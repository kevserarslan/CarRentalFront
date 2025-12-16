import api from './api';

const categoryService = {
  // Tüm kategoriler
  getAllCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  // Kategori detayı
  getCategoryById: async (id) => {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  },

  // Kategori oluştur (Admin)
  createCategory: async (categoryData) => {
    const response = await api.post('/api/categories', categoryData);
    return response.data;
  },

  // Kategori güncelle (Admin)
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/api/categories/${id}`, categoryData);
    return response.data;
  },

  // Kategori sil (Admin)
  deleteCategory: async (id) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
