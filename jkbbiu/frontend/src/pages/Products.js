import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    categoryId: '',
    purchasePrice: '',
    salePrice: '',
    taxRate: 18,
    stockQuantity: '',
    minimumStockLevel: 10,
    unit: 'Adet',
    description: ''
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'İşlem başarısız!');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode,
      categoryId: product.categoryId,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      taxRate: product.taxRate,
      stockQuantity: product.stockQuantity,
      minimumStockLevel: product.minimumStockLevel,
      unit: product.unit,
      description: product.description
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (error) {
        alert('Silme işlemi başarısız!');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      barcode: '',
      categoryId: '',
      purchasePrice: '',
      salePrice: '',
      taxRate: 18,
      stockQuantity: '',
      minimumStockLevel: 10,
      unit: 'Adet',
      description: ''
    });
  };

  return (
    <div data-testid="products-page">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📦 Ürün Yönetimi</h1>
        <button
          onClick={() => { setShowModal(true); setEditingProduct(null); resetForm(); }}
          data-testid="add-product-btn"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
        >
          + Yeni Ürün
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Ürün Adı</th>
              <th className="px-4 py-3 text-left">Barkod</th>
              <th className="px-4 py-3 text-left">Stok</th>
              <th className="px-4 py-3 text-left">Alış</th>
              <th className="px-4 py-3 text-left">Satış</th>
              <th className="px-4 py-3 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.barcode}</td>
                <td className="px-4 py-3">
                  <span className={product.stockQuantity <= product.minimumStockLevel ? 'text-red-600 font-bold' : ''}>
                    {product.stockQuantity} {product.unit}
                  </span>
                </td>
                <td className="px-4 py-3">₺{product.purchasePrice.toFixed(2)}</td>
                <td className="px-4 py-3">₺{product.salePrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                    data-testid={`edit-product-${product.id}`}
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-800"
                    data-testid={`delete-product-${product.id}`}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Ürün Adı *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                    data-testid="product-name-input"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Barkod *</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                    data-testid="product-barcode-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Kategori *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  required
                  data-testid="product-category-select"
                >
                  <option value="">Seçin</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Alış Fiyatı *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                    data-testid="product-purchase-price-input"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Satış Fiyatı *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                    data-testid="product-sale-price-input"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">KDV (%) *</label>
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({...formData, taxRate: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Stok Miktarı *</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                    data-testid="product-stock-input"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Min Stok</label>
                  <input
                    type="number"
                    value={formData.minimumStockLevel}
                    onChange={(e) => setFormData({...formData, minimumStockLevel: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Birim</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingProduct(null); }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  data-testid="save-product-btn"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
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

export default Products;
