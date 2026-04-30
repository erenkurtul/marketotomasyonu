import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getDashboard, getSalesReport, getTopProducts } from '../services/api';

const toInputDate = (date) => date.toISOString().slice(0, 10);

const Reports = () => {
  const [dashboard, setDashboard] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [startDate, setStartDate] = useState(toInputDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)));
  const [endDate, setEndDate] = useState(toInputDate(new Date()));

  const reportParams = useMemo(
    () => ({
      start: new Date(startDate).toISOString(),
      end: new Date(`${endDate}T23:59:59`).toISOString(),
    }),
    [startDate, endDate],
  );

  const loadAll = useCallback(async () => {
    try {
      const [dashboardRes, topRes, salesRes] = await Promise.all([
        getDashboard(),
        getTopProducts(10),
        getSalesReport(reportParams.start, reportParams.end),
      ]);
      setDashboard(dashboardRes.data);
      setTopProducts(topRes.data || []);
      setSalesReport(salesRes.data);
    } catch (error) {
      console.error('Raporlar yuklenemedi:', error);
    }
  }, [reportParams.end, reportParams.start]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refreshSalesReport = async () => {
    try {
      const response = await getSalesReport(reportParams.start, reportParams.end);
      setSalesReport(response.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Satis raporu alinamadi.');
    }
  };

  return (
    <div data-testid="reports-page">
      <h1 className="text-3xl font-bold mb-6">Raporlar</h1>

      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Bugunku Satis</div>
            <div className="text-2xl font-bold">₺{(dashboard.todaySales?.total || 0).toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Islem Sayisi</div>
            <div className="text-2xl font-bold">{dashboard.todaySales?.transactions || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Toplam Urun</div>
            <div className="text-2xl font-bold">{dashboard.inventory?.totalProducts || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Toplam Musteri</div>
            <div className="text-2xl font-bold">{dashboard.customers?.total || 0}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">En Cok Satan Urunler (30 gun)</h2>
          <div className="space-y-2">
            {topProducts.length === 0 && <div className="text-gray-500">Veri yok.</div>}
            {topProducts.map((item) => (
              <div key={`${item.productId}-${item.productName}`} className="flex justify-between border-b py-2">
                <span>{item.productName}</span>
                <span className="font-semibold">₺{(item.totalRevenue || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Satis Raporu</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded"
            />
            <button onClick={refreshSalesReport} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Getir
            </button>
          </div>

          {salesReport ? (
            <div className="space-y-2">
              <div>Toplam Satis: <strong>₺{(salesReport.totalSales || 0).toFixed(2)}</strong></div>
              <div>Toplam Islem: <strong>{salesReport.totalTransactions || 0}</strong></div>
              <div>Toplam KDV: <strong>₺{(salesReport.totalTax || 0).toFixed(2)}</strong></div>
              <div>Toplam Indirim: <strong>₺{(salesReport.totalDiscount || 0).toFixed(2)}</strong></div>
            </div>
          ) : (
            <div className="text-gray-500">Rapor verisi yok.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
