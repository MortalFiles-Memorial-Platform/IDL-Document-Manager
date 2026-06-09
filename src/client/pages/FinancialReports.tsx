import React from 'react';
import GeneralLedger from '../components/reports/GeneralLedger';
import ProfitLossStatement from '../components/reports/ProfitLossStatement';
import BalanceSheetReport from '../components/reports/BalanceSheet';

export default function FinancialReportsPage() {
  return (
    <div className="space-y-6">
      <h1>Financial Reports</h1>
      <GeneralLedger />
      <ProfitLossStatement />
      <BalanceSheetReport />
    </div>
  );
}
