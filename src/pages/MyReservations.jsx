import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reservationService from '../services/reservationService';
import { format } from 'date-fns';
import './MyReservations.css';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getMyReservations();
      
      if (response.success) {
        setReservations(response.data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Rezervasyonlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await reservationService.cancelReservation(id);
      
      if (response.success) {
        alert('Rezervasyon başarıyla iptal edildi.');
        fetchMyReservations();
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Rezervasyon iptal edilirken bir hata oluştu.');
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    <div className="my-reservations-page">
      <div className="container">
        <div className="page-header">
          <h1>📅 Rezervasyonlarım</h1>
          <p>Tüm rezervasyonlarınızı buradan görüntüleyebilirsiniz</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i>⚠️</i> {error}
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Henüz rezervasyonunuz yok</h3>
            <p>Araçlarımıza göz atın ve rezervasyon yapın!</p>
            <a href="http://localhost:8080/cars-page" className="btn btn-primary">
              Araçları İncele
            </a>
          </div>
        ) : (
          <div className="reservations-grid">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-header">
                  <h3>🚗 {reservation.carBrand} {reservation.carModel}</h3>
                  {getStatusBadge(reservation.status)}
                </div>

                <div className="reservation-details">
                  <div className="detail-row">
                    <span className="label">Plaka:</span>
                    <span className="value">{reservation.carPlate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Başlangıç:</span>
                    <span className="value">{reservation.startDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Bitiş:</span>
                    <span className="value">{reservation.endDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Süre:</span>
                    <span className="value">
                      {calculateDays(reservation.startDate, reservation.endDate)} gün
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Toplam Fiyat:</span>
                    <span className="value price">{reservation.totalPrice} TL</span>
                  </div>
                  {reservation.notes && (
                    <div className="detail-row">
                      <span className="label">Not:</span>
                      <span className="value">{reservation.notes}</span>
                    </div>
                  )}
                </div>

                <div className="reservation-actions">
                  {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="btn btn-danger btn-sm"
                    >
                      ❌ İptal Et
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
