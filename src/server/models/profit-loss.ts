export interface ProfitLossStatement {
  period: { start: Date; end: Date };
  revenue: number;
  costOfGoods: number;
  grossProfit: number;
  operatingExpenses: number;
  netIncome: number;
}
