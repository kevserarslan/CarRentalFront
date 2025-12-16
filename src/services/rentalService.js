import api from './api';

const rentalService = {
  // Kiralama oluştur (Admin)
  createRental: async (rentalData) => {
    const response = await api.post('/api/rentals', rentalData);
    return response.data;
  },

  // Kiralama detayı
  getRentalById: async (id) => {
    const response = await api.get(`/api/rentals/${id}`);
    return response.data;
  },

  // Rezervasyona göre kiralama
  getRentalByReservationId: async (reservationId) => {
    const response = await api.get(`/api/rentals/reservation/${reservationId}`);
    return response.data;
  },

  // Tüm kiralamalar (Admin)
  getAllRentals: async () => {
    const response = await api.get('/api/rentals');
    return response.data;
  },

  // Kullanıcıya göre kiralamalar
  getRentalsByUserId: async (userId) => {
    const response = await api.get(`/api/rentals/user/${userId}`);
    return response.data;
  },

  // Duruma göre kiralamalar
  getRentalsByStatus: async (status) => {
    const response = await api.get(`/api/rentals/status/${status}`);
    return response.data;
  },

  // Gecikmiş kiralamalar
  getOverdueRentals: async () => {
    const response = await api.get('/api/rentals/overdue');
    return response.data;
  },

  // Araç iadesi (Admin)
  returnCar: async (id, rentalData) => {
    const response = await api.put(`/api/rentals/${id}/return`, rentalData);
    return response.data;
  },

  // Kiralama sil (Admin)
  deleteRental: async (id) => {
    const response = await api.delete(`/api/rentals/${id}`);
    return response.data;
  },
};

export default rentalService;
