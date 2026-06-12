import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface DashboardData {
  totalCustomers: number;
  totalSuppliers: number;
  totalInventory: number;
  totalRevenue: number;
  totalExpenses: number;
  totalLoans: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/reports/dashboard');
      setData(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-3xl bg-rose-50 p-4 border border-rose-200">
          <p className="text-sm text-rose-700 font-medium">Error: {error}</p>
          <Button onClick={fetchDashboardData} className="mt-3 bg-rose-600 hover:bg-rose-700">
            Retry
          </Button>
        </div>
      )}

      {loading && !error && (
        <div className="text-center py-12">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="h-8 w-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="text-slate-600">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Customers</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalCustomers ?? '0'}</p>
            </Card>
            <Card>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Suppliers</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalSuppliers ?? '0'}</p>
            </Card>
            <Card>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Inventory items</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalInventory ?? '0'}</p>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Revenue (NGN)</p>
              <p className="mt-4 text-4xl font-semibold text-brand-600">{(data?.totalRevenue ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </Card>
            <Card>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Expenses (NGN)</p>
              <p className="mt-4 text-4xl font-semibold text-rose-600">{(data?.totalExpenses ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </Card>
            <Card>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Loan principal (NGN)</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{(data?.totalLoans ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Business Intelligence</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Review document status, audit readiness, and approval pipeline for Interior Duct Ltd.</p>
                </div>
                <Button onClick={fetchDashboardData}>Refresh</Button>
              </div>
            </Card>
            <Card>
              <h2 className="text-xl font-semibold text-slate-900">Compliance Summary</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>• VAT-ready templates for Nigerian tax compliance</li>
                <li>• Audit trails captured on every document action</li>
                <li>• Role-based access for finance, sales, procurement and auditors</li>
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
