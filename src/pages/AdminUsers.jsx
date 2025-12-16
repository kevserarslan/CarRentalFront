import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      alert('Kendi hesabınızı silemezsiniz!');
      return;
    }

    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await userService.deleteUser(id);
      if (response.success) {
        alert('Kullanıcı silindi!');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    users: users.filter(u => u.role === 'USER').length,
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
            <h1>👥 Kullanıcı Yönetimi</h1>
            <p>Toplam {users.length} kullanıcı</p>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-mini">
            <span className="stat-label">Toplam</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-mini info">
            <span className="stat-label">Admin</span>
            <span className="stat-value">{stats.admins}</span>
          </div>
          <div className="stat-mini success">
            <span className="stat-label">Kullanıcı</span>
            <span className="stat-value">{stats.users}</span>
          </div>
        </div>

        <div className="admin-filters">
          <input
            type="text"
            className="form-input"
            placeholder="Kullanıcı ara (ad, email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Rol</th>
                <th>Kayıt Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>
                      <strong>{user.name}</strong>
                      {user.id === currentUser?.id && (
                        <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '10px' }}>
                          Siz
                        </span>
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      {user.role === 'ADMIN' ? (
                        <span className="badge badge-warning">👨‍💼 Admin</span>
                      ) : (
                        <span className="badge badge-success">👤 Kullanıcı</span>
                      )}
                    </td>
                    <td>
                      <small>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                      </small>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn-icon btn-delete"
                          title="Sil"
                          disabled={user.id === currentUser?.id}
                          style={{ 
                            opacity: user.id === currentUser?.id ? 0.5 : 1,
                            cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer'
                          }}
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

export default AdminUsers;
