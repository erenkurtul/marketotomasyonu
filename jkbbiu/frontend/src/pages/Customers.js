import React, { useEffect, useState } from 'react';
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../services/api';

const emptyForm = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  loyaltyPoints: 0,
  totalDebt: 0,
  totalPurchases: 0,
  isActive: true,
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const loadCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error('Musteriler yuklenemedi:', error);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      setShowModal(false);
      setEditingCustomer(null);
      setFormData(emptyForm);
      loadCustomers();
    } catch (error) {
      alert(error.response?.data?.message || 'Islem basarisiz!');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      fullName: customer.fullName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      loyaltyPoints: customer.loyaltyPoints || 0,
      totalDebt: customer.totalDebt || 0,
      totalPurchases: customer.totalPurchases || 0,
      isActive: customer.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu musteriyi silmek istediginizden emin misiniz?')) {
      return;
    }
    try {
      await deleteCustomer(id);
      loadCustomers();
    } catch (error) {
      alert(error.response?.data?.message || 'Silme islemi basarisiz!');
    }
  };

  return (
    <div data-testid="customers-page">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Musteri Yonetimi</h1>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setFormData(emptyForm);
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
        >
          + Yeni Musteri
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Ad Soyad</th>
              <th className="px-4 py-3 text-left">Telefon</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Toplam Alisveris</th>
              <th className="px-4 py-3 text-left">Borc</th>
              <th className="px-4 py-3 text-center">Islemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{customer.fullName}</td>
                <td className="px-4 py-3">{customer.phone || '-'}</td>
                <td className="px-4 py-3">{customer.email || '-'}</td>
                <td className="px-4 py-3">{customer.totalPurchases ?? 0}</td>
                <td className="px-4 py-3">₺{(customer.totalDebt ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:text-blue-800 mr-3">
                    Duzenle
                  </button>
                  <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-800">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">{editingCustomer ? 'Musteri Duzenle' : 'Yeni Musteri Ekle'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Telefon"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Adres"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Iptal
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
