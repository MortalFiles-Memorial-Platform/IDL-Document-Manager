import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import BackButton from '../components/BackButton';

interface JournalEntry {
  id: number;
  reference: string;
  description: string;
  entryDate: string;
  amount: number;
  debitAccount: { code: string; name: string };
  creditAccount: { code: string; name: string };
  createdBy: { email: string };
}

export default function GeneralLedgerPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const response = await api.get(`/reports/general-ledger?${params}`);
      setEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
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
        <Button onClick={fetchLedger} disabled={loading}>
          {loading ? 'Loading...' : 'Filter'}
        </Button>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">General Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Reference</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Description</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Debit Account</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-900">Debit</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Credit Account</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-900">Credit</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-900">{entry.reference}</td>
                  <td className="px-4 py-2 text-slate-600">{entry.description}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {entry.debitAccount.code} - {entry.debitAccount.name}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-900 font-medium">
                    {entry.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {entry.creditAccount.code} - {entry.creditAccount.name}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-900 font-medium">
                    {entry.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {new Date(entry.entryDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entries.length === 0 && !loading && (
          <p className="mt-4 text-center text-slate-500">No journal entries found</p>
        )}
      </Card>
    </div>
  );
}
