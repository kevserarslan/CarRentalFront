import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    driverLicense: user?.driverLicense || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = { ...formData };
      
      // Şifre boşsa göndermeme
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await userService.updateCurrentUser(updateData);

      if (response.success) {
        setMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' });
        setIsEditing(false);
        
        // User bilgisini localStorage'da güncelle
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Profil güncellenirken bir hata oluştu.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      driverLicense: user?.driverLicense || '',
      password: '',
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              <span>{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <h1>{user?.name}</h1>
            <p className="profile-role">
              {user?.role === 'ADMIN' ? '👨‍💼 Admin' : '👤 Kullanıcı'}
            </p>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
              <i>{message.type === 'success' ? '✅' : '⚠️'}</i> {message.text}
            </div>
          )}

          <div className="profile-card">
            {!isEditing ? (
              <div className="profile-info">
                <div className="info-row">
                  <span className="label">E-posta:</span>
                  <span className="value">{user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Ad Soyad:</span>
                  <span className="value">{user?.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Telefon:</span>
                  <span className="value">{user?.phone}</span>
                </div>
                <div className="info-row">
                  <span className="label">Adres:</span>
                  <span className="value">{user?.address}</span>
                </div>
                <div className="info-row">
                  <span className="label">Sürücü Belgesi:</span>
                  <span className="value">{user?.driverLicense || 'Belirtilmemiş'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Kayıt Tarihi:</span>
                  <span className="value">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>

                <div className="profile-actions">
                  <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                    ✏️ Profili Düzenle
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Ad Soyad</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adres</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sürücü Belgesi</label>
                  <input
                    type="text"
                    name="driverLicense"
                    className="form-input"
                    value={formData.driverLicense}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Yeni Şifre (Opsiyonel)</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="Değiştirmek istemiyorsanız boş bırakın"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? '💾 Kaydediliyor...' : '💾 Kaydet'}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn btn-secondary">
                    ❌ İptal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
