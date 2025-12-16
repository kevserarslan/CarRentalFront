import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import carService from '../services/carService';
import categoryService from '../services/categoryService';
import currencyService from '../services/currencyService';
import reservationService from '../services/reservationService';
import { useAuth } from '../context/AuthContext';
import './Cars.css';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(32);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('category') || '',
    status: '',
    searchTerm: '',
  });
  const [selectedCar, setSelectedCar] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationData, setReservationData] = useState({
    startDate: '',
    endDate: '',
    notes: '',
  });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [carsRes, categoriesRes] = await Promise.all([
        carService.getAllCars(),
        categoryService.getAllCategories(),
      ]);

      if (carsRes.success) setCars(carsRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);

      try {
        const rateRes = await currencyService.getExchangeRate('USD', 'TRY');
        if (rateRes.success) setExchangeRate(rateRes.data.rate);
      } catch (error) {
        console.error('Exchange rate error:', error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filteredCars = cars.filter((car) => {
    const matchesCategory = !filters.categoryId || car.categoryId === parseInt(filters.categoryId);
    const matchesStatus = !filters.status || car.status === filters.status;
    const matchesSearch = !filters.searchTerm || 
      car.brand.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleReservationClick = (car) => {
    if (!isAuthenticated()) {
      alert('Rezervasyon yapmak için giriş yapmalısınız.');
      navigate('/login');
      return;
    }

    if (car.status !== 'AVAILABLE') {
      alert('Bu araç şu anda müsait değil.');
      return;
    }

    setSelectedCar(car);
    setShowReservationModal(true);
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();

    if (!reservationData.startDate || !reservationData.endDate) {
      alert('Lütfen başlangıç ve bitiş tarihlerini seçin.');
      return;
    }

    const startDate = new Date(reservationData.startDate);
    const endDate = new Date(reservationData.endDate);

    if (endDate <= startDate) {
      alert('Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
      return;
    }

    try {
      const response = await reservationService.createReservation({
        carId: selectedCar.id,
        startDate: reservationData.startDate,
        endDate: reservationData.endDate,
        notes: reservationData.notes,
      });

      if (response.success) {
        alert('Rezervasyon başarıyla oluşturuldu!');
        setShowReservationModal(false);
        setReservationData({ startDate: '', endDate: '', notes: '' });
        setSelectedCar(null);
        navigate('/my-reservations');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      alert(error.response?.data?.message || 'Rezervasyon oluşturulurken bir hata oluştu.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="badge badge-success">Müsait</span>;
      case 'RENTED':
        return <span className="badge badge-danger">Kirada</span>;
      case 'MAINTENANCE':
        return <span className="badge badge-warning">Bakımda</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  const calculateDays = () => {
    if (!reservationData.startDate || !reservationData.endDate) return 0;
    const start = new Date(reservationData.startDate);
    const end = new Date(reservationData.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    const days = calculateDays();
    return days > 0 ? (selectedCar?.dailyPrice || 0) * days : 0;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Araçlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="cars-page">
      <div className="container">
        <div className="page-header">
          <h1>🚗 Araçlarımız</h1>
          <p>Geniş araç filomuzdan size uygun olanı seçin</p>
        </div>

        {/* Filters */}
        <div className="filters-card">
          <div className="filters-grid">
            <div className="form-group">
              <label className="form-label">Ara</label>
              <input
                type="text"
                name="searchTerm"
                className="form-input"
                placeholder="Marka veya model ara..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select
                name="categoryId"
                className="form-select"
                value={filters.categoryId}
                onChange={handleFilterChange}
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Durum</label>
              <select
                name="status"
                className="form-select"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">Tüm Durumlar</option>
                <option value="AVAILABLE">Müsait</option>
                <option value="RENTED">Kirada</option>
                <option value="MAINTENANCE">Bakımda</option>
              </select>
            </div>
          </div>

          <div className="filter-results">
            <p>{filteredCars.length} araç bulundu</p>
            <small>Güncel Kur: 1 USD = {exchangeRate.toFixed(2)} TL</small>
          </div>
        </div>

        {/* Cars Grid */}
        {filteredCars.length === 0 ? (
          <div className="empty-state">
            <p>Seçtiğiniz kriterlere uygun araç bulunamadı.</p>
            <button onClick={() => setFilters({ categoryId: '', status: '', searchTerm: '' })} className="btn btn-outline">
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="cars-grid">
            {filteredCars.map((car) => (
              <div key={car.id} className="car-card">
                <div className="car-image">
                  {car.imageUrl ? (
                    <img 
                      src={car.imageUrl} 
                      alt={`${car.brand} ${car.model}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="car-placeholder" 
                    style={{ display: car.imageUrl ? 'none' : 'flex' }}
                  >
                    🚗 {car.brand}
                  </div>
                </div>

                <div className="car-details">
                  <div className="car-header">
                    <h3>{car.brand} {car.model}</h3>
                    {getStatusBadge(car.status)}
                  </div>

                  <div className="car-info">
                    <span>📅 {car.year}</span>
                    <span>⛽ {car.fuelType || 'Benzin'}</span>
                    <span>⚙️ {car.transmissionType || 'Otomatik'}</span>
                    {car.seatCount && <span>👥 {car.seatCount} kişi</span>}
                  </div>

                  {car.description && (
                    <p className="car-description">{car.description}</p>
                  )}

                  <div className="car-footer">
                    <div className="car-price">
                      <span className="price">{car.dailyPrice} TL</span>
                      <span className="price-unit">/ gün</span>
                      <br />
                      <span className="price-converted">
                        ≈ {(car.dailyPrice / exchangeRate).toFixed(2)} USD
                      </span>
                    </div>
                    <span className="category-badge">{car.categoryName}</span>
                  </div>

                  {car.status === 'AVAILABLE' && (
                    <button
                      onClick={() => handleReservationClick(car)}
                      className="btn btn-primary btn-block"
                    >
                      📅 Rezervasyon Yap
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {showReservationModal && selectedCar && (
        <div className="modal-overlay" onClick={() => setShowReservationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚗 Rezervasyon Yap</h2>
              <button onClick={() => setShowReservationModal(false)} className="modal-close">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="selected-car-info">
                <h3>{selectedCar.brand} {selectedCar.model}</h3>
                <p>{selectedCar.year} • {selectedCar.fuelType} • {selectedCar.transmissionType}</p>
                <p className="car-price-info">
                  <strong>{selectedCar.dailyPrice} TL</strong> / gün
                </p>
              </div>

              <form onSubmit={handleReservationSubmit}>
                <div className="form-group">
                  <label className="form-label">Başlangıç Tarihi *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={reservationData.startDate}
                    onChange={(e) => setReservationData({ ...reservationData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bitiş Tarihi *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={reservationData.endDate}
                    onChange={(e) => setReservationData({ ...reservationData, endDate: e.target.value })}
                    min={reservationData.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Not (Opsiyonel)</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Özel istekleriniz varsa buraya yazabilirsiniz..."
                    value={reservationData.notes}
                    onChange={(e) => setReservationData({ ...reservationData, notes: e.target.value })}
                  ></textarea>
                </div>

                {reservationData.startDate && reservationData.endDate && (
                  <div className="price-summary">
                    <div className="summary-row">
                      <span>Kiralama Süresi:</span>
                      <strong>{calculateDays()} gün</strong>
                    </div>
                    <div className="summary-row">
                      <span>Günlük Fiyat:</span>
                      <strong>{selectedCar.dailyPrice} TL</strong>
                    </div>
                    <div className="summary-row total">
                      <span>Toplam Tutar:</span>
                      <strong>{calculateTotalPrice()} TL</strong>
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    ✅ Rezervasyonu Onayla
                  </button>
                  <button type="button" onClick={() => setShowReservationModal(false)} className="btn btn-secondary">
                    ❌ İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cars;
