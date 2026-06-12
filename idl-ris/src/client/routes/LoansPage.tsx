import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import BackButton from '../components/BackButton';

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [form, setForm] = useState({ borrower: '', principal: 0, interestRate: 0, dueDate: '', currency: 'NGN' });

  useEffect(() => {
    api.get('/loans').then((response) => setLoans(response.data)).catch(console.error);
  }, []);

  const handleSave = async () => {
    await api.post('/loans', { ...form });
    const response = await api.get('/loans');
    setLoans(response.data);
    setForm({ borrower: '', principal: 0, interestRate: 0, dueDate: '', currency: 'NGN' });
  };

  return (
    <div className="space-y-6">
      <BackButton label="Back to Dashboard" to="/dashboard" />
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Loan Tracking</h2>
        <p className="mt-2 text-sm text-slate-500">Manage working capital loans, repayment schedules, and auditing documents for financing operations.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input placeholder="Borrower name" value={form.borrower} onChange={(event) => setForm({ ...form, borrower: event.target.value })} />
          <Input placeholder="Currency (e.g., NGN, USD)" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} />
          <Input placeholder="Principal amount (e.g., 500000.00)" type="number" value={form.principal} onChange={(event) => setForm({ ...form, principal: Number(event.target.value) })} min="0" step="0.01" />
          <Input placeholder="Interest rate (e.g., 12.5)" type="number" value={form.interestRate} onChange={(event) => setForm({ ...form, interestRate: Number(event.target.value) })} min="0" step="0.01" />
          <Input placeholder="Due date" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
        </div>
        <div className="mt-4">
          <Button type="button" onClick={handleSave}>Create Loan</Button>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Active Loans</h2>
        <div className="mt-4 space-y-3">
          {loans.map((loan) => (
            <div key={loan.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{loan.borrower}</p>
                  <p className="text-sm text-slate-600">Principal: NGN {Number(loan.principal).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">Status: {loan.status}</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">Outstanding: NGN {Number(loan.outstanding).toFixed(2)} • Due {new Date(loan.dueDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
