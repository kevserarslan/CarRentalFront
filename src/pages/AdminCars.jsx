import React, { useState, useEffect } from 'react';
import carService from '../services/carService';
import categoryService from '../services/categoryService';
import './AdminCars.css';

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plate: '',
    description: '',
    dailyPrice: '',
    status: 'AVAILABLE',
    imageUrl: '',
    fuelType: 'Benzin',
    transmissionType: 'Otomatik',
    seatCount: 5,
    categoryId: '',
  });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (car = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        brand: car.brand,
        model: car.model,
        year: car.year,
        plate: car.plate,
        description: car.description || '',
        dailyPrice: car.dailyPrice,
        status: car.status,
        imageUrl: car.imageUrl || '',
        fuelType: car.fuelType || 'Benzin',
        transmissionType: car.transmissionType || 'Otomatik',
        seatCount: car.seatCount || 5,
        categoryId: car.categoryId,
      });
    } else {
      setEditingCar(null);
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        plate: '',
        description: '',
        dailyPrice: '',
        status: 'AVAILABLE',
        imageUrl: '',
        fuelType: 'Benzin',
        transmissionType: 'Otomatik',
        seatCount: 5,
        categoryId: categories[0]?.id || '',
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCar(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' || name === 'seatCount' || name === 'categoryId' 
        ? parseInt(value) 
        : name === 'dailyPrice' 
        ? parseFloat(value) 
        : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      if (editingCar) {
        response = await carService.updateCar(editingCar.id, formData);
      } else {
        response = await carService.createCar(formData);
      }

      if (response.success) {
        alert(editingCar ? 'Araç başarıyla güncellendi!' : 'Araç başarıyla oluşturuldu!');
        handleCloseModal();
        fetchData();
      }
    } catch (error) {
      console.error('Error saving car:', error);
      setError(error.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await carService.deleteCar(id);
      if (response.success) {
        alert('Araç başarıyla silindi!');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      alert(error.response?.data?.message || 'Araç silinirken bir hata oluştu.');
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

  const filteredCars = cars.filter((car) =>
    car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1>🚗 Araç Yönetimi</h1>
            <p>Toplam {cars.length} araç</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            ➕ Yeni Araç Ekle
          </button>
        </div>

        <div className="admin-filters">
          <input
            type="text"
            className="form-input"
            placeholder="Araç ara (marka, model, plaka)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Marka & Model</th>
                <th>Plaka</th>
                <th>Yıl</th>
                <th>Kategori</th>
                <th>Günlük Fiyat</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    Araç bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => (
                  <tr key={car.id}>
                    <td>
                      <strong>{car.brand} {car.model}</strong>
                      <br />
                      <small>{car.fuelType} • {car.transmissionType}</small>
                    </td>
                    <td>{car.plate}</td>
                    <td>{car.year}</td>
                    <td>{car.categoryName}</td>
                    <td><strong>{car.dailyPrice} TL</strong></td>
                    <td>{getStatusBadge(car.status)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleOpenModal(car)}
                          className="btn-icon btn-edit"
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(car.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCar ? '✏️ Araç Düzenle' : '➕ Yeni Araç Ekle'}</h2>
              <button onClick={handleCloseModal} className="modal-close">✕</button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger">
                  <i>⚠️</i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Marka *</label>
                    <input
                      type="text"
                      name="brand"
                      className="form-input"
                      value={formData.brand}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Model *</label>
                    <input
                      type="text"
                      name="model"
                      className="form-input"
                      value={formData.model}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Yıl *</label>
                    <input
                      type="number"
                      name="year"
                      className="form-input"
                      value={formData.year}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Plaka *</label>
                    <input
                      type="text"
                      name="plate"
                      className="form-input"
                      value={formData.plate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kategori *</label>
                    <select
                      name="categoryId"
                      className="form-select"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seçiniz</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Günlük Fiyat (TL) *</label>
                    <input
                      type="number"
                      name="dailyPrice"
                      className="form-input"
                      value={formData.dailyPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Yakıt Tipi</label>
                    <select
                      name="fuelType"
                      className="form-select"
                      value={formData.fuelType}
                      onChange={handleChange}
                    >
                      <option value="Benzin">Benzin</option>
                      <option value="Dizel">Dizel</option>
                      <option value="Elektrik">Elektrik</option>
                      <option value="Hibrit">Hibrit</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vites Tipi</label>
                    <select
                      name="transmissionType"
                      className="form-select"
                      value={formData.transmissionType}
                      onChange={handleChange}
                    >
                      <option value="Otomatik">Otomatik</option>
                      <option value="Manuel">Manuel</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Koltuk Sayısı</label>
                    <input
                      type="number"
                      name="seatCount"
                      className="form-input"
                      value={formData.seatCount}
                      onChange={handleChange}
                      min="2"
                      max="50"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Durum</label>
                    <select
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="AVAILABLE">Müsait</option>
                      <option value="RENTED">Kirada</option>
                      <option value="MAINTENANCE">Bakımda</option>
                      <option value="UNAVAILABLE">Kullanım Dışı</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Görsel URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    className="form-input"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Açıklama</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Araç hakkında detaylı bilgi..."
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingCar ? '💾 Güncelle' : '✅ Oluştur'}
                  </button>
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
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

export default AdminCars;
