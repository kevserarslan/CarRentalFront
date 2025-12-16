import React, { useState, useEffect } from 'react';
import rentalService from '../services/rentalService';
import reservationService from '../services/reservationService';
import './AdminCars.css';

const AdminRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [confirmedReservations, setConfirmedReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    reservationId: '',
    initialMileage: '',
    notes: '',
  });
  const [returnFormData, setReturnFormData] = useState({
    finalMileage: '',
    additionalCharges: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Tüm kiralamaları getir
      const rentalsRes = await rentalService.getAllRentals();
      if (rentalsRes.success) {
        setRentals(rentalsRes.data);
      }

      // Onaylanmış rezervasyonları getir (kiralama için hazır)
      const reservationsRes = await reservationService.getAllReservations();
      if (reservationsRes.success) {
        const confirmed = reservationsRes.data.filter(r => r.status === 'CONFIRMED');
        // Sadece henüz kiralama oluşturulmamış rezervasyonları göster
        const withoutRental = confirmed.filter(res => 
          !rentals.some(rental => rental.reservationId === res.id)
        );
        setConfirmedReservations(withoutRental);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRental = async (e) => {
    e.preventDefault();

    try {
      const response = await rentalService.createRental(createFormData);
      if (response.success) {
        alert('Araç teslim edildi!');
        setShowCreateModal(false);
        setCreateFormData({ reservationId: '', initialMileage: '', notes: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating rental:', error);
      alert(error.response?.data?.message || 'Kiralama oluşturulamadı.');
    }
  };

  const handleReturnCar = async (e) => {
    e.preventDefault();

    if (!selectedRental) return;

    try {
      const response = await rentalService.returnCar(selectedRental.id, returnFormData);
      if (response.success) {
        alert('Araç iade alındı!');
        setShowReturnModal(false);
        setSelectedRental(null);
        setReturnFormData({ finalMileage: '', additionalCharges: 0 });
        fetchData();
      }
    } catch (error) {
      console.error('Error returning car:', error);
      alert(error.response?.data?.message || 'İade işlemi başarısız.');
    }
  };

  const openCreateModal = (reservation) => {
    setSelectedReservation(reservation);
    setCreateFormData({
      reservationId: reservation.id,
      initialMileage: '',
      notes: '',
    });
    setShowCreateModal(true);
  };

  const openReturnModal = (rental) => {
    setSelectedRental(rental);
    setReturnFormData({
      finalMileage: '',
      additionalCharges: 0,
    });
    setShowReturnModal(true);
  };

  const filteredRentals = rentals.filter(rental => {
    if (filter === 'ALL') return true;
    return rental.status === filter;
  });

  const stats = {
    total: rentals.length,
    pickedUp: rentals.filter(r => r.status === 'PICKED_UP').length,
    returned: rentals.filter(r => r.status === 'RETURNED').length,
    overdue: rentals.filter(r => r.status === 'OVERDUE').length,
    awaitingPickup: confirmedReservations.length,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="admin-cars-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>🚗 Kiralama Yönetimi</h1>
            <p>Aktif kiralamalar ve araç teslim/iade işlemleri</p>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-mini" onClick={() => setFilter('ALL')}>
            <span className="stat-label">Toplam Kiralama</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-mini warning" onClick={() => setFilter('PICKED_UP')}>
            <span className="stat-label">Aktif Kiralama</span>
            <span className="stat-value">{stats.pickedUp}</span>
          </div>
          <div className="stat-mini success" onClick={() => setFilter('RETURNED')}>
            <span className="stat-label">İade Edildi</span>
            <span className="stat-value">{stats.returned}</span>
          </div>
          <div className="stat-mini danger">
            <span className="stat-label">Gecikmiş</span>
            <span className="stat-value">{stats.overdue}</span>
          </div>
          <div className="stat-mini info">
            <span className="stat-label">Teslim Bekliyor</span>
            <span className="stat-value">{stats.awaitingPickup}</span>
          </div>
        </div>

        {/* Teslim Bekleyen Rezervasyonlar */}
        {confirmedReservations.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px' }}>📋 Araç Teslimi Bekleyen Rezervasyonlar</h2>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Müşteri</th>
                    <th>Araç</th>
                    <th>Tarih Aralığı</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>#{reservation.id}</td>
                      <td>{reservation.userName}</td>
                      <td>
                        <strong>{reservation.carBrand} {reservation.carModel}</strong>
                        <br />
                        <small>{reservation.carPlate}</small>
                      </td>
                      <td>
                        {new Date(reservation.startDate).toLocaleDateString('tr-TR')} - 
                        {new Date(reservation.endDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td>
                        <button 
                          className="btn btn-success"
                          onClick={() => openCreateModal(reservation)}
                        >
                          🚗 Araç Teslim Et
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filtre */}
        <div className="admin-filters">
          <select 
            className="form-input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">Tüm Kiralamalar</option>
            <option value="PICKED_UP">Aktif Kiralamalar</option>
            <option value="RETURNED">İade Edilenler</option>
            <option value="OVERDUE">Gecikmiş</option>
          </select>
        </div>

        {/* Kiralama Listesi */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Müşteri</th>
                <th>Araç</th>
                <th>Teslim Tarihi</th>
                <th>Beklenen İade</th>
                <th>Başlangıç KM</th>
                <th>Bitiş KM</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    Kiralama bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((rental) => (
                  <tr key={rental.id}>
                    <td>#{rental.id}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                      {rental.pickupDate 
                        ? new Date(rental.pickupDate).toLocaleString('tr-TR')
                        : '-'}
                    </td>
                    <td>
                      {rental.returnDate 
                        ? new Date(rental.returnDate).toLocaleString('tr-TR')
                        : '-'}
                    </td>
                    <td>{rental.initialMileage || '-'} km</td>
                    <td>{rental.finalMileage || '-'} km</td>
                    <td>
                      <span className={`badge badge-${
                        rental.status === 'PICKED_UP' ? 'warning' :
                        rental.status === 'RETURNED' ? 'success' :
                        'danger'
                      }`}>
                        {rental.status === 'PICKED_UP' ? '🚗 Kullanımda' :
                         rental.status === 'RETURNED' ? '✅ İade Edildi' :
                         '⚠️ Gecikmiş'}
                      </span>
                    </td>
                    <td>
                      {rental.status === 'PICKED_UP' && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => openReturnModal(rental)}
                        >
                          🔙 İade Al
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Araç Teslim Modalı */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚗 Araç Teslim Et</h2>
              <button onClick={() => setShowCreateModal(false)} className="modal-close">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {selectedReservation && (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <p><strong>Müşteri:</strong> {selectedReservation.userName}</p>
                  <p><strong>Araç:</strong> {selectedReservation.carBrand} {selectedReservation.carModel}</p>
                  <p><strong>Plaka:</strong> {selectedReservation.carPlate}</p>
                </div>
              )}

              <form onSubmit={handleCreateRental}>
                <div className="form-group">
                  <label className="form-label">Başlangıç Kilometre *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="50000"
                    value={createFormData.initialMileage}
                    onChange={(e) => setCreateFormData({ ...createFormData, initialMileage: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notlar (Opsiyonel)</label>
                  <textarea
                    className="form-input"
                    placeholder="Araç teslim notları..."
                    rows="3"
                    value={createFormData.notes}
                    onChange={(e) => setCreateFormData({ ...createFormData, notes: e.target.value })}
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn btn-success">
                    ✅ Aracı Teslim Et
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                    ❌ İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Araç İade Modalı */}
      {showReturnModal && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔙 Araç İade Al</h2>
              <button onClick={() => setShowReturnModal(false)} className="modal-close">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {selectedRental && (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <p><strong>Başlangıç KM:</strong> {selectedRental.initialMileage} km</p>
                  <p><strong>Teslim Tarihi:</strong> {new Date(selectedRental.pickupDate).toLocaleDateString('tr-TR')}</p>
                </div>
              )}

              <form onSubmit={handleReturnCar}>
                <div className="form-group">
                  <label className="form-label">Bitiş Kilometre *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="50800"
                    value={returnFormData.finalMileage}
                    onChange={(e) => setReturnFormData({ ...returnFormData, finalMileage: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ek Ücretler (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={returnFormData.additionalCharges}
                    onChange={(e) => setReturnFormData({ ...returnFormData, additionalCharges: e.target.value })}
                  />
                  <small style={{ color: '#666' }}>Hasar, gecikme veya diğer ek ücretler</small>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    ✅ İadeyi Tamamla
                  </button>
                  <button type="button" onClick={() => setShowReturnModal(false)} className="btn btn-secondary">
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

export default AdminRentals;
