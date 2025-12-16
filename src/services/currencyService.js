import api from './api';

const currencyService = {
  // Para birimi çevirme
  convertCurrency: async (amount, from, to) => {
    const response = await api.get('/api/currency/convert', {
      params: { amount, from, to }
    });
    return response.data;
  },

  // Döviz kurları
  getExchangeRates: async (base = 'USD') => {
    const response = await api.get('/api/currency/rates', {
      params: { base }
    });
    return response.data;
  },

  // İki para birimi arası kur
  getExchangeRate: async (from, to) => {
    const response = await api.get('/api/currency/rate', {
      params: { from, to }
    });
    return response.data;
  },
};

export default currencyService;
