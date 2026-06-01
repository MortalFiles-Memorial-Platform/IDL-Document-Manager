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

  useEffect(() => {
    api.get('/reports/dashboard').then((response) => setData(response.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Customers</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalCustomers ?? '––'}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Suppliers</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalSuppliers ?? '––'}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Inventory items</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalInventory ?? '––'}</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Revenue (NGN)</p>
          <p className="mt-4 text-4xl font-semibold text-brand-600">{data?.totalRevenue.toLocaleString() ?? '––'}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Expenses (NGN)</p>
          <p className="mt-4 text-4xl font-semibold text-rose-600">{data?.totalExpenses.toLocaleString() ?? '––'}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Loan principal (NGN)</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalLoans.toLocaleString() ?? '––'}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Business Intelligence</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Review document status, audit readiness, and approval pipeline for Interior Duct Ltd.</p>
            </div>
            <Button onClick={() => location.reload()}>Refresh</Button>
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
    </div>
  );
}
