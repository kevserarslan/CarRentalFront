import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);

    if (result.success) {
      // Admin ise Admin Paneline, normal kullanıcı ise Araçlar sayfasına yönlendir
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/cars');
      }
    } else {
      setError(result.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Giriş Yap</h1>
          <p>Hesabınıza giriş yapın</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i>⚠️</i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="ornek@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span> Giriş yapılıyor...
              </>
            ) : (
              <>
                <i>🔐</i> Giriş Yap
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Hesabınız yok mu?{' '}
            <Link to="/register" className="auth-link">
              Kayıt Ol
            </Link>
          </p>
        </div>

        <div className="demo-credentials">
          <h4>Demo Hesaplar:</h4>
          <p><strong>Admin:</strong> admin@test.com / 123456</p>
          <p><strong>Kullanıcı:</strong> user@test.com / 123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
