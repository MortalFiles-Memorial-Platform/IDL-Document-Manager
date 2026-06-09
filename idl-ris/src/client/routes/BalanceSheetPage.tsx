import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card } from '../../ui/card';
import BackButton from '../components/BackButton';

interface BalanceSheetReport {
  assets: {
    accounts: Array<{ code: string; name: string; balance: number }>;
    total: number;
  };
  liabilities: {
    accounts: Array<{ code: string; name: string; balance: number }>;
    total: number;
  };
  equity: {
    accounts: Array<{ code: string; name: string; balance: number }>;
    total: number;
  };
  balanced: boolean;
}

export default function BalanceSheetPage() {
  const [report, setReport] = useState<BalanceSheetReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get('/reports/balance-sheet');
        setReport(response.data);
      } catch (error) {
        console.error('Failed to fetch balance sheet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) return <div className="text-slate-600">Loading...</div>;

  return (
    <div className="space-y-6">
      <BackButton label="Back to Dashboard" to="/dashboard" />
      {report && (
        <>
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Balance Sheet</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {report.balanced && <span className="text-brand-600 font-medium">✓ Balanced</span>}
                  {!report.balanced && <span className="text-rose-600 font-medium">✗ Not Balanced</span>}
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Assets</h3>
                <div className="space-y-2">
                  {report.assets.accounts.map((acc) => (
                    <div key={acc.code} className="flex justify-between text-slate-600">
                      <span>{acc.code} - {acc.name}</span>
                      <span>{acc.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold text-slate-900 mt-4">
                    <span>Total Assets</span>
                    <span className="text-brand-600">
                      {report.assets.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Liabilities & Equity</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-700 mb-2">Liabilities</h4>
                    <div className="space-y-2 ml-2">
                      {report.liabilities.accounts.map((acc) => (
                        <div key={acc.code} className="flex justify-between text-slate-600 text-sm">
                          <span>{acc.code} - {acc.name}</span>
                          <span>{acc.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-100 pt-2 flex justify-between font-medium text-slate-700 text-sm">
                        <span>Total Liabilities</span>
                        <span>{report.liabilities.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-700 mb-2">Equity</h4>
                    <div className="space-y-2 ml-2">
                      {report.equity.accounts.map((acc) => (
                        <div key={acc.code} className="flex justify-between text-slate-600 text-sm">
                          <span>{acc.code} - {acc.name}</span>
                          <span>{acc.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-100 pt-2 flex justify-between font-medium text-slate-700 text-sm">
                        <span>Total Equity</span>
                        <span>{report.equity.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4 flex justify-between font-semibold text-slate-900">
                    <span>Total Liabilities & Equity</span>
                    <span className="text-brand-600">
                      {(report.liabilities.total + report.equity.total).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
