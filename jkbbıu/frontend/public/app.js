// Market Otomasyonu - JavaScript
// LocalStorage Data Management

// Global Variables
let currentUser = null;
let cart = [];
let currentPaymentMethod = 'cash';

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    setupEventListeners();
    checkAuth();
});

// Initialize Demo Data
function initializeData() {
    if (!localStorage.getItem('users')) {
        const users = [
            { id: '1', username: 'admin', password: 'admin123', fullName: 'Admin Kullanıcı', role: 'admin' }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }

    if (!localStorage.getItem('categories')) {
        const categories = [
            { id: '1', name: 'İçecekler' },
            { id: '2', name: 'Gıda' },
            { id: '3', name: 'Temizlik' },
            { id: '4', name: 'Kırtasiye' }
        ];
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    if (!localStorage.getItem('products')) {
        const products = [
            { id: '1', name: 'Coca Cola 330ml', barcode: '8690504000019', categoryId: '1', purchasePrice: 8.50, salePrice: 15.00, taxRate: 18, stock: 100, unit: 'Adet' },
            { id: '2', name: 'Ekmek', barcode: '1111111111111', categoryId: '2', purchasePrice: 2.50, salePrice: 5.00, taxRate: 8, stock: 50, unit: 'Adet' },
            { id: '3', name: 'Süt 1L', barcode: '2222222222222', categoryId: '2', purchasePrice: 15.00, salePrice: 25.00, taxRate: 8, stock: 30, unit: 'Adet' },
            { id: '4', name: 'Deterjan', barcode: '3333333333333', categoryId: '3', purchasePrice: 45.00, salePrice: 75.00, taxRate: 18, stock: 25, unit: 'Adet' }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }

    if (!localStorage.getItem('customers')) {
        const customers = [
            { id: '1', name: 'Ahmet Yılmaz', phone: '05551234567', email: 'ahmet@example.com', address: 'İstanbul', totalPurchases: 0 },
            { id: '2', name: 'Ayşe Demir', phone: '05559876543', email: 'ayse@example.com', address: 'Ankara', totalPurchases: 0 }
        ];
        localStorage.setItem('customers', JSON.stringify(customers));
    }

    if (!localStorage.getItem('sales')) {
        localStorage.setItem('sales', JSON.stringify([]));
    }
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('productForm').addEventListener('submit', handleProductSave);
    document.getElementById('customerForm').addEventListener('submit', handleCustomerSave);
    document.getElementById('barcodeInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addProductToCart();
        }
    });
    
    // Update date
    updateCurrentDate();
    setInterval(updateCurrentDate, 60000);
}

// Auth Functions
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showMainApp();
    } else {
        showLoginPage();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainApp();
    } else {
        document.getElementById('loginError').textContent = 'Kullanıcı adı veya şifre hatalı!';
        document.getElementById('loginError').classList.remove('hidden');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    location.reload();
}

function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('currentUserName').textContent = currentUser.fullName;
    showPage('dashboard');
}

// Navigation
function showPage(pageName) {
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(page => page.classList.add('hidden'));
    
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => link.classList.remove('bg-gray-700'));
    
    const currentPage = document.getElementById(pageName + 'Page');
    if (currentPage) {
        currentPage.classList.remove('hidden');
    }
    
    // Update active link
    event.target.closest('.nav-link')?.classList.add('bg-gray-700');
    
    // Load page data
    switch(pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'pos':
            loadPOS();
            break;
        case 'products':
            loadProducts();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('mainContent');
    const icon = document.getElementById('toggleIcon');
    
    sidebar.classList.toggle('collapsed');
    content.classList.toggle('expanded');
    icon.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
}

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('tr-TR', options);
}

// Dashboard Functions
function loadDashboard() {
    const sales = JSON.parse(localStorage.getItem('sales'));
    const products = JSON.parse(localStorage.getItem('products'));
    const customers = JSON.parse(localStorage.getItem('customers'));
    
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
    
    const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
    const todayCount = todaySales.length;
    const lowStock = products.filter(p => p.stock <= 10).length;
    
    document.getElementById('todayTotal').textContent = `₺${todayTotal.toFixed(2)}`;
    document.getElementById('todayCount').textContent = `${todayCount} işlem`;
    document.getElementById('productCount').textContent = products.length;
    document.getElementById('lowStockCount').textContent = lowStock;
    document.getElementById('customerCount').textContent = customers.length;
    
    // Recent sales
    const recentSales = sales.slice(-5).reverse();
    let html = '<div class="space-y-2">';
    if (recentSales.length === 0) {
        html += '<p class="text-gray-500">Henüz satış yok.</p>';
    } else {
        recentSales.forEach(sale => {
            html += `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                        <div class="font-semibold">${sale.invoiceNumber}</div>
                        <div class="text-sm text-gray-600">${new Date(sale.date).toLocaleString('tr-TR')}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-blue-600">₺${sale.total.toFixed(2)}</div>
                        <div class="text-sm text-gray-600">${sale.items.length} ürün</div>
                    </div>
                </div>
            `;
        });
    }
    html += '</div>';
    document.getElementById('recentSalesList').innerHTML = html;
}

// POS Functions
function loadPOS() {
    cart = [];
    updateCartDisplay();
    loadCustomersSelect();
    document.getElementById('barcodeInput').value = '';
    document.getElementById('barcodeInput').focus();
}

function loadCustomersSelect() {
    const customers = JSON.parse(localStorage.getItem('customers'));
    const select = document.getElementById('saleCustomer');
    select.innerHTML = '<option value="">Seçiniz</option>';
    customers.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });
}

function addProductToCart() {
    const input = document.getElementById('barcodeInput').value.trim();
    if (!input) return;
    
    const products = JSON.parse(localStorage.getItem('products'));
    const product = products.find(p => 
        p.barcode === input || 
        p.name.toLowerCase().includes(input.toLowerCase())
    );
    
    if (product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.salePrice,
                taxRate: product.taxRate,
                quantity: 1
            });
        }
        updateCartDisplay();
        document.getElementById('barcodeInput').value = '';
    } else {
        alert('Ürün bulunamadı!');
    }
}

function updateCartDisplay() {
    const tbody = document.getElementById('cartItems');
    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Sepet boş. Ürün ekleyin.</td></tr>';
    } else {
        let html = '';
        cart.forEach((item, index) => {
            const total = item.price * item.quantity;
            html += `
                <tr>
                    <td class="px-4 py-3">${item.name}</td>
                    <td class="px-4 py-3">₺${item.price.toFixed(2)}</td>
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                            <button onclick="updateCartQuantity(${index}, -1)" class="bg-red-500 text-white w-8 h-8 rounded hover:bg-red-600">-</button>
                            <span class="w-12 text-center font-semibold">${item.quantity}</span>
                            <button onclick="updateCartQuantity(${index}, 1)" class="bg-green-500 text-white w-8 h-8 rounded hover:bg-green-600">+</button>
                        </div>
                    </td>
                    <td class="px-4 py-3 font-semibold">₺${total.toFixed(2)}</td>
                    <td class="px-4 py-3 text-center">
                        <button onclick="removeFromCart(${index})" class="text-red-600 hover:text-red-800">Sil</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }
    updateCartTotals();
}

function updateCartQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = cart.reduce((sum, item) => {
        const itemSubtotal = item.price * item.quantity;
        return sum + (itemSubtotal * (item.taxRate / 100));
    }, 0);
    
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const total = subtotal + tax - discount;
    const paid = parseFloat(document.getElementById('paidAmount').value) || 0;
    const change = paid - total;
    
    document.getElementById('cartSubtotal').textContent = `₺${subtotal.toFixed(2)}`;
    document.getElementById('cartTax').textContent = `₺${tax.toFixed(2)}`;
    document.getElementById('cartDiscount').textContent = `₺${discount.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `₺${total.toFixed(2)}`;
    document.getElementById('cartChange').textContent = `₺${change >= 0 ? change.toFixed(2) : '0.00'}`;
}

function setPaymentMethod(method) {
    currentPaymentMethod = method;
    document.getElementById('btnCash').className = method === 'cash' ? 
        'flex-1 py-2 rounded-lg font-semibold bg-blue-500 text-white' : 
        'flex-1 py-2 rounded-lg font-semibold bg-gray-200';
    document.getElementById('btnCard').className = method === 'card' ? 
        'flex-1 py-2 rounded-lg font-semibold bg-blue-500 text-white' : 
        'flex-1 py-2 rounded-lg font-semibold bg-gray-200';
}

function completeSale() {
    if (cart.length === 0) {
        alert('Sepet boş!');
        return;
    }
    
    const total = parseFloat(document.getElementById('cartTotal').textContent.replace('₺', ''));
    const paid = parseFloat(document.getElementById('paidAmount').value) || 0;
    
    if (paid < total) {
        alert('Ödenen miktar yetersiz!');
        return;
    }
    
    const customerId = document.getElementById('saleCustomer').value;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    
    const sale = {
        id: Date.now().toString(),
        invoiceNumber: 'FTR-' + Date.now(),
        date: new Date().toISOString(),
        customerId: customerId || null,
        items: cart.map(item => ({...item})),
        subtotal: parseFloat(document.getElementById('cartSubtotal').textContent.replace('₺', '')),
        tax: parseFloat(document.getElementById('cartTax').textContent.replace('₺', '')),
        discount: discount,
        total: total,
        paymentMethod: currentPaymentMethod,
        paidAmount: paid,
        change: paid - total
    };
    
    const sales = JSON.parse(localStorage.getItem('sales'));
    sales.push(sale);
    localStorage.setItem('sales', JSON.stringify(sales));
    
    // Update stock
    const products = JSON.parse(localStorage.getItem('products'));
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.stock -= item.quantity;
        }
    });
    localStorage.setItem('products', JSON.stringify(products));
    
    // Update customer
    if (customerId) {
        const customers = JSON.parse(localStorage.getItem('customers'));
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            customer.totalPurchases++;
            localStorage.setItem('customers', JSON.stringify(customers));
        }
    }
    
    alert(`Satış tamamlandı!\nFatura No: ${sale.invoiceNumber}\nToplam: ₺${total.toFixed(2)}\nPara Üstü: ₺${sale.change.toFixed(2)}`);
    
    loadPOS();
}

// Products Functions
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products'));
    const categories = JSON.parse(localStorage.getItem('categories'));
    
    let html = '';
    if (products.length === 0) {
        html = '<tr><td colspan="6" class="text-center py-8 text-gray-500">Henüz ürün yok.</td></tr>';
    } else {
        products.forEach(product => {
            const category = categories.find(c => c.id === product.categoryId);
            const stockClass = product.stock <= 10 ? 'text-red-600 font-bold' : '';
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">${product.name}</td>
                    <td class="px-4 py-3">${product.barcode}</td>
                    <td class="px-4 py-3">${category?.name || '-'}</td>
                    <td class="px-4 py-3 ${stockClass}">${product.stock} ${product.unit}</td>
                    <td class="px-4 py-3">₺${product.salePrice.toFixed(2)}</td>
                    <td class="px-4 py-3 text-center">
                        <button onclick="editProduct('${product.id}')" class="text-blue-600 hover:text-blue-800 mr-3">Düzenle</button>
                        <button onclick="deleteProduct('${product.id}')" class="text-red-600 hover:text-red-800">Sil</button>
                    </td>
                </tr>
            `;
        });
    }
    document.getElementById('productsList').innerHTML = html;
}

function showProductModal(productId = null) {
    const categories = JSON.parse(localStorage.getItem('categories'));
    const categorySelect = document.getElementById('productCategory');
    categorySelect.innerHTML = '';
    categories.forEach(c => {
        categorySelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });
    
    if (productId) {
        const products = JSON.parse(localStorage.getItem('products'));
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('productModalTitle').textContent = 'Ürün Düzenle';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productBarcode').value = product.barcode;
            document.getElementById('productCategory').value = product.categoryId;
            document.getElementById('productUnit').value = product.unit;
            document.getElementById('productPurchasePrice').value = product.purchasePrice;
            document.getElementById('productSalePrice').value = product.salePrice;
            document.getElementById('productTax').value = product.taxRate;
            document.getElementById('productStock').value = product.stock;
        }
    } else {
        document.getElementById('productModalTitle').textContent = 'Yeni Ürün Ekle';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
    }
    
    document.getElementById('productModal').classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    document.getElementById('productForm').reset();
}

function handleProductSave(e) {
    e.preventDefault();
    
    const products = JSON.parse(localStorage.getItem('products'));
    const productId = document.getElementById('productId').value;
    
    const productData = {
        name: document.getElementById('productName').value,
        barcode: document.getElementById('productBarcode').value,
        categoryId: document.getElementById('productCategory').value,
        unit: document.getElementById('productUnit').value,
        purchasePrice: parseFloat(document.getElementById('productPurchasePrice').value),
        salePrice: parseFloat(document.getElementById('productSalePrice').value),
        taxRate: parseFloat(document.getElementById('productTax').value),
        stock: parseInt(document.getElementById('productStock').value)
    };
    
    if (productId) {
        const index = products.findIndex(p => p.id === productId);
        products[index] = { ...products[index], ...productData };
    } else {
        productData.id = Date.now().toString();
        products.push(productData);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    closeProductModal();
    loadProducts();
}

function editProduct(id) {
    showProductModal(id);
}

function deleteProduct(id) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        const products = JSON.parse(localStorage.getItem('products'));
        const filtered = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(filtered));
        loadProducts();
    }
}

// Customers Functions
function loadCustomers() {
    const customers = JSON.parse(localStorage.getItem('customers'));
    
    let html = '';
    if (customers.length === 0) {
        html = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Henüz müşteri yok.</td></tr>';
    } else {
        customers.forEach(customer => {
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">${customer.name}</td>
                    <td class="px-4 py-3">${customer.phone}</td>
                    <td class="px-4 py-3">${customer.email || '-'}</td>
                    <td class="px-4 py-3">${customer.totalPurchases}</td>
                    <td class="px-4 py-3 text-center">
                        <button onclick="editCustomer('${customer.id}')" class="text-blue-600 hover:text-blue-800 mr-3">Düzenle</button>
                        <button onclick="deleteCustomer('${customer.id}')" class="text-red-600 hover:text-red-800">Sil</button>
                    </td>
                </tr>
            `;
        });
    }
    document.getElementById('customersList').innerHTML = html;
}

function showCustomerModal(customerId = null) {
    if (customerId) {
        const customers = JSON.parse(localStorage.getItem('customers'));
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            document.getElementById('customerId').value = customer.id;
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerPhone').value = customer.phone;
            document.getElementById('customerEmail').value = customer.email || '';
            document.getElementById('customerAddress').value = customer.address || '';
        }
    } else {
        document.getElementById('customerForm').reset();
        document.getElementById('customerId').value = '';
    }
    
    document.getElementById('customerModal').classList.remove('hidden');
}

function closeCustomerModal() {
    document.getElementById('customerModal').classList.add('hidden');
    document.getElementById('customerForm').reset();
}

function handleCustomerSave(e) {
    e.preventDefault();
    
    const customers = JSON.parse(localStorage.getItem('customers'));
    const customerId = document.getElementById('customerId').value;
    
    const customerData = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value,
        address: document.getElementById('customerAddress').value
    };
    
    if (customerId) {
        const index = customers.findIndex(c => c.id === customerId);
        customers[index] = { ...customers[index], ...customerData };
    } else {
        customerData.id = Date.now().toString();
        customerData.totalPurchases = 0;
        customers.push(customerData);
    }
    
    localStorage.setItem('customers', JSON.stringify(customers));
    closeCustomerModal();
    loadCustomers();
}

function editCustomer(id) {
    showCustomerModal(id);
}

function deleteCustomer(id) {
    if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
        const customers = JSON.parse(localStorage.getItem('customers'));
        const filtered = customers.filter(c => c.id !== id);
        localStorage.setItem('customers', JSON.stringify(filtered));
        loadCustomers();
    }
}

// Reports Functions
function loadReports() {
    const sales = JSON.parse(localStorage.getItem('sales'));
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
    
    // Daily Sales Report
    let dailyHtml = '<div class="space-y-2">';
    dailyHtml += `<p class="text-lg"><span class="font-semibold">Toplam Satış:</span> ₺${todaySales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}</p>`;
    dailyHtml += `<p><span class="font-semibold">İşlem Sayısı:</span> ${todaySales.length}</p>`;
    dailyHtml += `<p><span class="font-semibold">Nakit:</span> ₺${todaySales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0).toFixed(2)}</p>`;
    dailyHtml += `<p><span class="font-semibold">Kart:</span> ₺${todaySales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0).toFixed(2)}</p>`;
    dailyHtml += '</div>';
    document.getElementById('dailySalesReport').innerHTML = dailyHtml;
    
    // Top Products
    const productSales = {};
    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = { quantity: 0, revenue: 0 };
            }
            productSales[item.name].quantity += item.quantity;
            productSales[item.name].revenue += item.price * item.quantity;
        });
    });
    
    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5);
    
    let topHtml = '<div class="space-y-2">';
    if (topProducts.length === 0) {
        topHtml += '<p class="text-gray-500">Henüz veri yok.</p>';
    } else {
        topProducts.forEach(([name, data]) => {
            topHtml += `
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span class="font-medium">${name}</span>
                    <div class="text-right">
                        <div class="font-bold text-blue-600">₺${data.revenue.toFixed(2)}</div>
                        <div class="text-sm text-gray-600">${data.quantity} adet</div>
                    </div>
                </div>
            `;
        });
    }
    topHtml += '</div>';
    document.getElementById('topProductsReport').innerHTML = topHtml;
    
    // All Sales
    let allSalesHtml = '<div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-100"><tr>';
    allSalesHtml += '<th class="px-4 py-2 text-left">Fatura No</th>';
    allSalesHtml += '<th class="px-4 py-2 text-left">Tarih</th>';
    allSalesHtml += '<th class="px-4 py-2 text-left">Ürün Sayısı</th>';
    allSalesHtml += '<th class="px-4 py-2 text-left">Ödeme</th>';
    allSalesHtml += '<th class="px-4 py-2 text-right">Toplam</th>';
    allSalesHtml += '</tr></thead><tbody>';
    
    if (sales.length === 0) {
        allSalesHtml += '<tr><td colspan="5" class="text-center py-8 text-gray-500">Henüz satış yok.</td></tr>';
    } else {
        sales.slice().reverse().slice(0, 50).forEach(sale => {
            allSalesHtml += `
                <tr class="hover:bg-gray-50 border-b">
                    <td class="px-4 py-2">${sale.invoiceNumber}</td>
                    <td class="px-4 py-2">${new Date(sale.date).toLocaleString('tr-TR')}</td>
                    <td class="px-4 py-2">${sale.items.length}</td>
                    <td class="px-4 py-2">${sale.paymentMethod === 'cash' ? 'Nakit' : 'Kart'}</td>
                    <td class="px-4 py-2 text-right font-bold text-blue-600">₺${sale.total.toFixed(2)}</td>
                </tr>
            `;
        });
    }
    
    allSalesHtml += '</tbody></table></div>';
    document.getElementById('allSalesReport').innerHTML = allSalesHtml;
}
