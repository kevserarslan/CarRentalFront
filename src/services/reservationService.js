import api from './api';

const reservationService = {
  // Rezervasyon oluştur
  createReservation: async (reservationData) => {
    const response = await api.post('/api/reservations', reservationData);
    return response.data;
  },

  // Rezervasyon detayı
  getReservationById: async (id) => {
    const response = await api.get(`/api/reservations/${id}`);
    return response.data;
  },

  // Kendi rezervasyonlarım
  getMyReservations: async () => {
    const response = await api.get('/api/reservations/my');
    return response.data;
  },

  // Tüm rezervasyonlar (Admin)
  getAllReservations: async () => {
    const response = await api.get('/api/reservations');
    return response.data;
  },

  // Kullanıcıya göre rezervasyonlar (Admin)
  getReservationsByUserId: async (userId) => {
    const response = await api.get(`/api/reservations/user/${userId}`);
    return response.data;
  },

  // Araca göre rezervasyonlar (Admin)
  getReservationsByCarId: async (carId) => {
    const response = await api.get(`/api/reservations/car/${carId}`);
    return response.data;
  },

  // Rezervasyonu onayla (Admin)
  confirmReservation: async (id) => {
    const response = await api.put(`/api/reservations/${id}/confirm`);
    return response.data;
  },

  // Rezervasyonu iptal et
  cancelReservation: async (id) => {
    const response = await api.put(`/api/reservations/${id}/cancel`);
    return response.data;
  },

  // Rezervasyon sil (Admin)
  deleteReservation: async (id) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },
};

export default reservationService;
