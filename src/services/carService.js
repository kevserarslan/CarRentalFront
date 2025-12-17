import api from './api';

const carService = {
  // Tüm araçları getir
  getAllCars: async () => {
    const response = await api.get('/cars');
    return response.data;
  },

  // Araç detayı
  getCarById: async (id) => {
    const response = await api.get(`/cars/${id}`);
    return response.data;
  },

  // Kategoriye göre araçlar
  getCarsByCategory: async (categoryId) => {
    const response = await api.get(`/cars/category/${categoryId}`);
    return response.data;
  },

  // Duruma göre araçlar
  getCarsByStatus: async (status) => {
    const response = await api.get(`/cars/status/${status}`);
    return response.data;
  },

  // Müsait araçlar
  getAvailableCars: async (startDate, endDate) => {
    const response = await api.get('/cars/available', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Araç oluştur (Admin)
  createCar: async (carData) => {
    const response = await api.post('/cars', carData);
    return response.data;
  },

  // Araç güncelle (Admin)
  updateCar: async (id, carData) => {
    const response = await api.put(`/cars/${id}`, carData);
    return response.data;
  },

  // Araç sil (Admin)
  deleteCar: async (id) => {
    const response = await api.delete(`/cars/${id}`);
    return response.data;
  },
};

export default carService;
