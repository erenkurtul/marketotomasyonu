import React, { useState, useEffect } from 'react';
import { getDashboard, getLowStockProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashRes, stockRes] = await Promise.all([
        getDashboard(),
        getLowStockProducts()
      ]);
      setDashboard(dashRes.data);
      setLowStock(stockRes.data);
    } catch (error) {
      console.error('Dashboard yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hoş Geldiniz, {user?.fullName}!</h1>
        <p className="text-gray-600 mt-2">Günün özeti ve işletme durumu</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">💵</div>
            <div className="text-2xl font-bold">₺{dashboard?.todaySales?.total?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="text-blue-100">Bugünkü Satış</div>
          <div className="text-sm text-blue-200 mt-1">{dashboard?.todaySales?.transactions || 0} işlem</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">💳</div>
            <div className="text-2xl font-bold">₺{dashboard?.todaySales?.cardSales?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="text-green-100">Kart ile Satış</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">💰</div>
            <div className="text-2xl font-bold">₺{dashboard?.todaySales?.cashSales?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="text-yellow-100">Nakit Satış</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">👥</div>
            <div className="text-2xl font-bold">{dashboard?.customers?.total || 0}</div>
          </div>
          <div className="text-purple-100">Toplam Müşteri</div>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📦 Stok Durumu</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-gray-800">{dashboard?.inventory?.totalProducts || 0}</div>
              <div className="text-gray-600">Toplam Ürün</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500">{dashboard?.inventory?.lowStockProducts || 0}</div>
              <div className="text-gray-600">Düşük Stok</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Düşük Stoklu Ürünler</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {lowStock.length > 0 ? (
              lowStock.slice(0, 5).map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-medium text-gray-800">{product.name}</span>
                  <span className="text-red-600 font-bold">Stok: {product.stockQuantity}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">Tüm ürünler yeterli stokta</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;