import React, { useState, useEffect, useRef } from 'react';
import { getProductByBarcode, getProducts, createSale, getCustomers } from '../services/api';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(0);
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const barcodeRef = useRef(null);

  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getProducts(true);
      setProducts(response.data);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await getCustomers(true);
      setCustomers(response.data);
    } catch (error) {
      console.error('Müşteriler yüklenemedi:', error);
    }
  };

  const addProductToCart = (product) => {
    if (product.stockQuantity <= 0) {
      setMessage({ type: 'error', text: `${product.name} stokta yok!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stockQuantity) {
        setMessage({ type: 'error', text: `${product.name} için yeterli stok yok!` });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        return;
      }
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        barcode: product.barcode,
        price: product.salePrice,
        taxRate: product.taxRate,
        quantity: 1,
        maxStock: product.stockQuantity
      }]);
    }

    setMessage({ type: 'success', text: `${product.name} sepete eklendi!` });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    try {
      const response = await getProductByBarcode(barcode);
      addProductToCart(response.data);
      setBarcode('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Ürün bulunamadı!' });
      setBarcode('');
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      const item = cart.find(i => i.productId === productId);
      if (item?.maxStock && newQuantity > item.maxStock) {
        setMessage({ type: 'error', text: 'Yeterli stok yok!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        return;
      }
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = cart.reduce((sum, item) => {
      const itemSubtotal = item.price * item.quantity;
      return sum + (itemSubtotal * (item.taxRate / 100));
    }, 0);
    const total = subtotal + tax - discount;
    return { subtotal, tax, total };
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setMessage({ type: 'error', text: 'Sepet boş!' });
      return;
    }

    const { total } = calculateTotals();
    const paid = parseFloat(paidAmount) || 0;

    if (paid < total) {
      setMessage({ type: 'error', text: 'Ödenen miktar yetersiz!' });
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        customerId: selectedCustomer || null,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        discount: discount,
        paymentMethod: paymentMethod,
        paidAmount: paid,
        notes: ''
      };

      const response = await createSale(saleData);
      
      setMessage({ 
        type: 'success', 
        text: `Satış tamamlandı! Fatura No: ${response.data.invoiceNumber}` 
      });

      // Sepeti temizle
      setCart([]);
      setSelectedCustomer('');
      setPaidAmount('');
      setDiscount(0);
      loadProducts();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Satış gerçekleştirilemedi!' 
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();
  const change = parseFloat(paidAmount || 0) - total;

  const filteredProducts = products.filter(product => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      product.name?.toLowerCase().includes(query) ||
      product.barcode?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-screen flex flex-col" data-testid="pos-page">
      <div className="bg-blue-600 text-white px-6 py-4">
        <h1 className="text-2xl font-bold">🛒 Satış Noktası (POS)</h1>
      </div>

      {message.text && (
        <div className={`px-6 py-3 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Product Entry */}
        <div className="w-2/3 p-6 overflow-y-auto">
          <form onSubmit={handleBarcodeSubmit} className="mb-6">
            <label className="block text-lg font-semibold mb-2">Barkod Okut / Gir</label>
            <div className="flex gap-2">
              <input
                ref={barcodeRef}
                type="text"
                data-testid="barcode-input"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Barkod numarasını girin..."
                autoFocus
              />
              <button
                type="submit"
                data-testid="add-product-button"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
              >
                Ekle
              </button>
            </div>
          </form>

          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">Ürünler (MongoDB)</label>
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-3"
              placeholder="Ürün adı veya barkod ile ara..."
              data-testid="product-search-input"
            />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-6">
                  Aktif ürün bulunamadı.
                </div>
              ) : (
                filteredProducts.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProductToCart(product)}
                    disabled={product.stockQuantity <= 0}
                    data-testid={`pos-product-${product.id}`}
                    className="text-left bg-white border rounded-lg p-3 hover:border-blue-500 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-semibold truncate">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.barcode}</div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="font-bold text-blue-600">₺{product.salePrice.toFixed(2)}</span>
                      <span className={product.stockQuantity <= product.minimumStockLevel ? 'text-red-600' : 'text-gray-600'}>
                        Stok: {product.stockQuantity}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="bg-gray-100 px-4 py-3 font-semibold grid grid-cols-6 gap-2">
              <div className="col-span-2">Ürün</div>
              <div>Fiyat</div>
              <div>Miktar</div>
              <div>Toplam</div>
              <div>İşlem</div>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Sepet boş. Ürün eklemek için barkod okutun.
                </div>
              ) : (
                cart.map((item, index) => {
                  const itemTotal = item.price * item.quantity;
                  return (
                    <div key={index} className="grid grid-cols-6 gap-2 p-4 items-center hover:bg-gray-50">
                      <div className="col-span-2 font-medium">{item.name}</div>
                      <div>₺{item.price.toFixed(2)}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="bg-red-500 text-white w-8 h-8 rounded hover:bg-red-600"
                          data-testid={`decrease-quantity-${item.productId}`}
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="bg-green-500 text-white w-8 h-8 rounded hover:bg-green-600"
                          data-testid={`increase-quantity-${item.productId}`}
                        >
                          +
                        </button>
                      </div>
                      <div className="font-semibold">₺{itemTotal.toFixed(2)}</div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                        data-testid={`remove-item-${item.productId}`}
                      >
                        Sil
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Payment */}
        <div className="w-1/3 bg-gray-50 p-6 border-l overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Ödeme Bilgileri</h3>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Müşteri (Opsiyonel)</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="customer-select"
              >
                <option value="">Müşteri Seçin</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName}{customer.phone ? ` - ${customer.phone}` : ''}
                  </option>
                ))}
              </select>
              {customers.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">Aktif müşteri bulunamadı.</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Ödeme Yöntemi</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod(0)}
                  className={`flex-1 py-2 rounded-lg font-semibold ${paymentMethod === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  data-testid="cash-payment-button"
                >
                  Nakit
                </button>
                <button
                  onClick={() => setPaymentMethod(1)}
                  className={`flex-1 py-2 rounded-lg font-semibold ${paymentMethod === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  data-testid="card-payment-button"
                >
                  Kart
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">İndirim (₺)</label>
              <input
                type="number"
                data-testid="discount-input"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
                step="0.01"
              />
            </div>

            <div className="mb-6">
              <label className="block font-semibold mb-2">Ödenen Miktar (₺)</label>
              <input
                type="number"
                data-testid="paid-amount-input"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-lg"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="border-t pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Ara Toplam:</span>
                <span className="font-semibold">₺{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>KDV:</span>
                <span className="font-semibold">₺{tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>İndirim:</span>
                  <span className="font-semibold">-₺{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold text-blue-600 pt-2 border-t">
                <span>TOPLAM:</span>
                <span data-testid="total-amount">₺{total.toFixed(2)}</span>
              </div>
              {paidAmount && change >= 0 && (
                <div className="flex justify-between text-lg font-semibold text-green-600">
                  <span>Para Üstü:</span>
                  <span data-testid="change-amount">₺{change.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={loading || cart.length === 0}
              data-testid="complete-sale-button"
              className="w-full bg-green-500 text-white py-4 rounded-lg text-xl font-bold hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'İşleniyor...' : 'Satışı Tamamla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
