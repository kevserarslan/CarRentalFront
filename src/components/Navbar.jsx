import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
const BACKEND_WEB = import.meta.env.VITE_API_URL.replace(/\/api$/, '');


const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <i className="car-icon">🚗</i>
            <span>Car Rental</span>
          </Link>

          <div className="navbar-menu">
            {/* Giriş yapmamışsa Thymeleaf linkleri göster */}
            {!isAuthenticated() && (
              <>
                <a href={`${BACKEND_WEB}/api`} className="nav-link">Ana Sayfa</a>
                <a href={`${BACKEND_WEB}/api/cars-page`} className="nav-link">Araçlar</a>
                
              </>
            )}

            {/* Giriş yapmışsa React linkleri göster */}
            {isAuthenticated() && (
              <>
                <Link to="/cars" className="nav-link">Araçlar</Link>
                
                {isAdmin() && (
                  <Link to="/admin" className="nav-link admin-link">
                    <i>👨‍💼</i> Admin Panel
                  </Link>
                )}
                
                {isAdmin() ? (
                  <Link to="/admin/reservations" className="nav-link">Rezervasyon Yönetimi</Link>
                ) : (
                  <Link to="/my-reservations" className="nav-link">Rezervasyonlarım</Link>
                )}
                
                <Link to="/profile" className="nav-link">
                  <i>👤</i> {user?.name}
                </Link>
              </>
            )}

            {/* Giriş/Kayıt veya Çıkış butonları */}
            {isAuthenticated() ? (
              <button onClick={handleLogout} className="btn btn-outline">
                Çıkış Yap
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">Giriş Yap</Link>
                <Link to="/register" className="btn btn-primary">Kayıt Ol</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
