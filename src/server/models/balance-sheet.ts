export interface BalanceSheet {
  period: Date;
  assets: { current: number; fixed: number; total: number };
  liabilities: { current: number; longTerm: number; total: number };
  equity: number;
}
