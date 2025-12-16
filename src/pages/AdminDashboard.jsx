import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import carService from '../services/carService';
import reservationService from '../services/reservationService';
import userService from '../services/userService';
import categoryService from '../services/categoryService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    totalUsers: 0,
    totalReservations: 0,
    totalCategories: 0,
    pendingReservations: 0,
    availableCars: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Her endpoint'i ayrı ayrı çağır, biri hata verse bile diğerleri çalışsın
      let cars = [];
      let users = [];
      let reservations = [];
      let categories = [];

      try {
        const carsRes = await carService.getAllCars();
        console.log('Cars Response:', carsRes);
        cars = carsRes.success && carsRes.data ? carsRes.data : [];
      } catch (error) {
        console.error('Error fetching cars:', error);
      }

      try {
        const usersRes = await userService.getAllUsers();
        console.log('Users Response:', usersRes);
        users = usersRes.success && usersRes.data ? usersRes.data : [];
      } catch (error) {
        console.error('Error fetching users:', error);
      }

      try {
        const reservationsRes = await reservationService.getAllReservations();
        console.log('Reservations Response:', reservationsRes);
        reservations = reservationsRes.success && reservationsRes.data ? reservationsRes.data : [];
      } catch (error) {
        console.error('Error fetching reservations:', error);
        console.error('Reservations error details:', error.response?.data);
        console.error('Reservations error message:', error.response?.data?.message);
        // Rezervasyonlar alınamazsa boş array kullan
        reservations = [];
      }

      try {
        const categoriesRes = await categoryService.getAllCategories();
        console.log('Categories Response:', categoriesRes);
        categories = categoriesRes.success && categoriesRes.data ? categoriesRes.data : [];
      } catch (error) {
        console.error('Error fetching categories:', error);
      }

      console.log('Admin Dashboard - Parsed Data:', {
        cars,
        users,
        reservations,
        categories
      });

      setStats({
        totalCars: cars.length,
        totalUsers: users.length,
        totalReservations: reservations.length,
        totalCategories: categories.length,
        pendingReservations: reservations.filter(r => r.status === 'PENDING').length,
        availableCars: cars.filter(c => c.status === 'AVAILABLE').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
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
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>👨‍💼 Admin Paneli</h1>
          <p>Sistem yönetimi ve istatistikler</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">🚗</div>
            <div className="stat-info">
              <h3>{stats.totalCars}</h3>
              <p>Toplam Araç</p>
              <span className="stat-detail">{stats.availableCars} müsait</span>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Kullanıcı</p>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">📁</div>
            <div className="stat-info">
              <h3>{stats.totalCategories}</h3>
              <p>Kategori</p>
            </div>
          </div>

          {/* Rezervasyon istatistikleri - Backend role sorunu çözülene kadar gizli */}
          {stats.totalReservations > 0 && (
            <div className="stat-card purple">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <h3>{stats.totalReservations}</h3>
                <p>Rezervasyon</p>
                <span className="stat-detail">{stats.pendingReservations} beklemede</span>
              </div>
            </div>
          )}
        </div>

        <div className="admin-menu">
          <Link to="/admin/cars" className="admin-menu-card">
            <div className="menu-icon">🚗</div>
            <h3>Araç Yönetimi</h3>
            <p>Araçları görüntüle, ekle, düzenle veya sil</p>
          </Link>

          <Link to="/admin/reservations" className="admin-menu-card">
            <div className="menu-icon">📅</div>
            <h3>Rezervasyon Yönetimi</h3>
            <p>Rezervasyonları görüntüle ve yönet</p>
          </Link>

          <Link to="/admin/rentals" className="admin-menu-card">
            <div className="menu-icon">🔑</div>
            <h3>Kiralama Yönetimi</h3>
            <p>Araç teslim/iade işlemlerini yönet</p>
          </Link>

          <Link to="/admin/users" className="admin-menu-card">
            <div className="menu-icon">👥</div>
            <h3>Kullanıcı Yönetimi</h3>
            <p>Kullanıcıları görüntüle ve düzenle</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
