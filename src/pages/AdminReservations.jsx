import React, { useState, useEffect } from 'react';
import reservationService from '../services/reservationService';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getAllReservations();
      
      if (response.success) {
        setReservations(response.data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    if (!window.confirm('Bu rezervasyonu onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await reservationService.confirmReservation(id);
      if (response.success) {
        alert('Rezervasyon onaylandı!');
        fetchReservations();
      }
    } catch (error) {
      console.error('Error confirming reservation:', error);
      alert(error.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await reservationService.cancelReservation(id);
      if (response.success) {
        alert('Rezervasyon iptal edildi!');
        fetchReservations();
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert(error.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await reservationService.deleteReservation(id);
      if (response.success) {
        alert('Rezervasyon silindi!');
        fetchReservations();
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert(error.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning">Beklemede</span>;
      case 'CONFIRMED':
        return <span className="badge badge-success">Onaylandı</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">İptal Edildi</span>;
      case 'COMPLETED':
        return <span className="badge badge-info">Tamamlandı</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredReservations = reservations.filter((res) => {
    if (filter === 'ALL') return true;
    return res.status === filter;
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
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
            <h1>📅 Rezervasyon Yönetimi</h1>
            <p>Toplam {reservations.length} rezervasyon</p>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-mini" onClick={() => setFilter('ALL')}>
            <span className="stat-label">Toplam</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-mini warning" onClick={() => setFilter('PENDING')}>
            <span className="stat-label">Beklemede</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
          <div className="stat-mini success" onClick={() => setFilter('CONFIRMED')}>
            <span className="stat-label">Onaylandı</span>
            <span className="stat-value">{stats.confirmed}</span>
          </div>
          <div className="stat-mini danger" onClick={() => setFilter('CANCELLED')}>
            <span className="stat-label">İptal</span>
            <span className="stat-value">{stats.cancelled}</span>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Kullanıcı</th>
                <th>Araç</th>
                <th>Tarih</th>
                <th>Gün</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    Rezervasyon bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => (
                  <tr key={res.id}>
                    <td>#{res.id}</td>
                    <td>
                      <strong>{res.userName}</strong>
                    </td>
                    <td>
                      {res.carBrand} {res.carModel}
                      <br />
                      <small>{res.carPlate}</small>
                    </td>
                    <td>
                      <small>
                        {res.startDate} → {res.endDate}
                      </small>
                    </td>
                    <td>{calculateDays(res.startDate, res.endDate)}</td>
                    <td><strong>{res.totalPrice} TL</strong></td>
                    <td>{getStatusBadge(res.status)}</td>
                    <td>
                      <div className="action-buttons">
                        {res.status === 'PENDING' && (
                          <button
                            onClick={() => handleConfirm(res.id)}
                            className="btn-icon btn-success"
                            title="Onayla"
                          >
                            ✅
                          </button>
                        )}
                        {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleCancel(res.id)}
                            className="btn-icon btn-warning"
                            title="İptal Et"
                          >
                            ❌
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="btn-icon btn-delete"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReservations;
