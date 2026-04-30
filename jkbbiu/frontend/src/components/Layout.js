import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard', testId: 'nav-dashboard' },
    { path: '/pos', icon: '🛒', label: 'Satış (POS)', testId: 'nav-pos' },
    { path: '/products', icon: '📦', label: 'Ürünler', testId: 'nav-products' },
    { path: '/customers', icon: '👥', label: 'Müşteriler', testId: 'nav-customers' },
    { path: '/reports', icon: '📈', label: 'Raporlar', testId: 'nav-reports' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && <h2 className="text-xl font-bold">Market Otomasyonu</h2>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-gray-700 p-2 rounded"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="mt-6">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              data-testid={item.testId}
              className={`flex items-center px-4 py-3 hover:bg-gray-700 transition ${
                location.pathname === item.path ? 'bg-gray-700 border-l-4 border-blue-500' : ''
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          {sidebarOpen && (
            <div className="mb-3">
              <div className="text-sm text-gray-400">Hoş geldiniz</div>
              <div className="font-semibold">{user?.fullName}</div>
              <div className="text-xs text-gray-400">{user?.role === 0 ? 'Admin' : user?.role === 1 ? 'Müdür' : 'Kasiyer'}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-white font-semibold"
          >
            {sidebarOpen ? 'Çıkış Yap' : '🚪'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Market Yönetim Sistemi</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;