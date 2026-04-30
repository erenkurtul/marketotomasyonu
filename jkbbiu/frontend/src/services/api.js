import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Products
export const getProducts = () => 
  axios.get(`${API_URL}/api/products`, { headers: getAuthHeader() });

export const getProductByBarcode = (barcode) => 
  axios.get(`${API_URL}/api/products/barcode/${barcode}`, { headers: getAuthHeader() });

export const createProduct = (data) => 
  axios.post(`${API_URL}/api/products`, data, { headers: getAuthHeader() });

export const updateProduct = (id, data) => 
  axios.put(`${API_URL}/api/products/${id}`, data, { headers: getAuthHeader() });

export const deleteProduct = (id) => 
  axios.delete(`${API_URL}/api/products/${id}`, { headers: getAuthHeader() });

export const getLowStockProducts = () => 
  axios.get(`${API_URL}/api/products/low-stock`, { headers: getAuthHeader() });

// Categories
export const getCategories = () => 
  axios.get(`${API_URL}/api/categories`, { headers: getAuthHeader() });

export const createCategory = (data) => 
  axios.post(`${API_URL}/api/categories`, data, { headers: getAuthHeader() });

export const updateCategory = (id, data) => 
  axios.put(`${API_URL}/api/categories/${id}`, data, { headers: getAuthHeader() });

export const deleteCategory = (id) => 
  axios.delete(`${API_URL}/api/categories/${id}`, { headers: getAuthHeader() });

// Sales
export const createSale = (data) => 
  axios.post(`${API_URL}/api/sales`, data, { headers: getAuthHeader() });

export const getSales = (startDate, endDate) => 
  axios.get(`${API_URL}/api/sales`, { 
    headers: getAuthHeader(),
    params: { startDate, endDate }
  });

export const getSale = (id) => 
  axios.get(`${API_URL}/api/sales/${id}`, { headers: getAuthHeader() });

export const refundSale = (id) => 
  axios.post(`${API_URL}/api/sales/${id}/refund`, {}, { headers: getAuthHeader() });

export const getDailySummary = (date) => 
  axios.get(`${API_URL}/api/sales/daily-summary`, { 
    headers: getAuthHeader(),
    params: { date }
  });

// Customers
export const getCustomers = () => 
  axios.get(`${API_URL}/api/customers`, { headers: getAuthHeader() });

export const createCustomer = (data) => 
  axios.post(`${API_URL}/api/customers`, data, { headers: getAuthHeader() });

export const updateCustomer = (id, data) => 
  axios.put(`${API_URL}/api/customers/${id}`, data, { headers: getAuthHeader() });

export const deleteCustomer = (id) => 
  axios.delete(`${API_URL}/api/customers/${id}`, { headers: getAuthHeader() });

// Cash Register
export const openCashRegister = (openingBalance) => 
  axios.post(`${API_URL}/api/cashregister/open`, openingBalance, { headers: getAuthHeader() });

export const closeCashRegister = () => 
  axios.post(`${API_URL}/api/cashregister/close`, {}, { headers: getAuthHeader() });

export const getCurrentCashRegister = () => 
  axios.get(`${API_URL}/api/cashregister/current`, { headers: getAuthHeader() });

export const getCashRegisterHistory = (startDate, endDate) => 
  axios.get(`${API_URL}/api/cashregister/history`, { 
    headers: getAuthHeader(),
    params: { startDate, endDate }
  });

// Reports
export const getDashboard = () => 
  axios.get(`${API_URL}/api/reports/dashboard`, { headers: getAuthHeader() });

export const getSalesReport = (startDate, endDate) => 
  axios.get(`${API_URL}/api/reports/sales-report`, { 
    headers: getAuthHeader(),
    params: { startDate, endDate }
  });

export const getTopProducts = (limit = 10) => 
  axios.get(`${API_URL}/api/reports/top-products`, { 
    headers: getAuthHeader(),
    params: { limit }
  });