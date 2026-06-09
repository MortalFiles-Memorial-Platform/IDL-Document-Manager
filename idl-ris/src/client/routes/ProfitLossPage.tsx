import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import BackButton from '../components/BackButton';

interface ProfitLossReport {
  revenue: {
    accounts: Array<{ code: string; name: string; amount: number }>;
    total: number;
  };
  expenses: {
    accounts: Array<{ code: string; name: string; amount: number }>;
    total: number;
  };
  netProfit: number;
  startDate?: string;
  endDate?: string;
}

export default function ProfitLossPage() {
  const [report, setReport] = useState<ProfitLossReport | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const response = await api.get(`/reports/profit-loss?${params}`);
      setReport(response.data);
    } catch (error) {
      console.error('Failed to fetch P&L report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      <BackButton label="Back to Dashboard" to="/dashboard" />
      <div className="flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <Button onClick={fetchReport} disabled={loading}>
          {loading ? 'Loading...' : 'Generate'}
        </Button>
      </div>

      {report && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Profit & Loss Statement</h2>
            {report.startDate && report.endDate && (
              <p className="text-sm text-slate-500 mb-4">
                For period: {new Date(report.startDate).toLocaleDateString()} to {new Date(report.endDate).toLocaleDateString()}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Revenue</h3>
                <div className="space-y-2 ml-4">
                  {report.revenue.accounts.map((acc) => (
                    <div key={acc.code} className="flex justify-between text-slate-600">
                      <span>{acc.code} - {acc.name}</span>
                      <span>{acc.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold text-slate-900">
                    <span>Total Revenue</span>
                    <span className="text-brand-600">
                      {report.revenue.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Expenses</h3>
                <div className="space-y-2 ml-4">
                  {report.expenses.accounts.map((acc) => (
                    <div key={acc.code} className="flex justify-between text-slate-600">
                      <span>{acc.code} - {acc.name}</span>
                      <span>{acc.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold text-slate-900">
                    <span>Total Expenses</span>
                    <span className="text-rose-600">
                      {report.expenses.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Profit/(Loss)</span>
                  <span className={report.netProfit >= 0 ? 'text-brand-600' : 'text-rose-600'}>
                    {report.netProfit.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
