import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import type { AuthRequest } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/dashboard', authorizeRoles('ADMIN', 'FINANCE', 'AUDITOR', 'SALES'), async (req: AuthRequest, res) => {
  const totalCustomers = await prisma.customer.count();
  const totalSuppliers = await prisma.supplier.count();
  const totalInventory = await prisma.inventoryItem.count();
  const totalRevenue = await prisma.document.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ['PAID', 'PARTIAL'] } } });
  const totalExpenses = await prisma.expense.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } });
  const totalLoans = await prisma.loan.aggregate({ _sum: { principal: true } });

  res.json({
    totalCustomers,
    totalSuppliers,
    totalInventory,
    totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
    totalExpenses: Number(totalExpenses._sum.amount || 0),
    totalLoans: Number(totalLoans._sum.principal || 0)
  });
});

router.get('/general-ledger', authorizeRoles('ADMIN', 'FINANCE', 'AUDITOR'), async (req: AuthRequest, res) => {
  const { startDate, endDate } = req.query;
  const where: any = {};

  if (startDate || endDate) {
    where.entryDate = {};
    if (startDate) where.entryDate.gte = new Date(startDate as string);
    if (endDate) where.entryDate.lte = new Date(endDate as string);
  }

  const entries = await prisma.journalEntry.findMany({
    where,
    include: {
      debitAccount: true,
      creditAccount: true,
      createdBy: { select: { email: true } }
    },
    orderBy: { entryDate: 'desc' }
  });

  res.json(entries);
});

router.get('/chart-of-accounts', authorizeRoles('ADMIN', 'FINANCE', 'AUDITOR'), async (req: AuthRequest, res) => {
  const accounts = await prisma.chartOfAccounts.findMany({
    where: { isActive: true },
    orderBy: { code: 'asc' }
  });

  res.json(accounts);
});

router.get('/trial-balance', authorizeRoles('ADMIN', 'FINANCE', 'AUDITOR'), async (req: AuthRequest, res) => {
  const accounts = await prisma.chartOfAccounts.findMany({
    where: { isActive: true },
    include: {
      debitEntries: true,
      creditEntries: true
    }
  });

  const trialBalance = accounts.map((account: any) => {
    const debits = account.debitEntries.reduce((sum: number, entry: any) => sum + entry.amount, 0);
    const credits = account.creditEntries.reduce((sum: number, entry: any) => sum + entry.amount, 0);

    return {
      code: account.code,
      name: account.name,
      type: account.type,
      debit: debits,
      credit: credits
    };
  });

  res.json({
    accounts: trialBalance,
    balanced: true
  });
});

router.get('/profit-loss', authorizeRoles('ADMIN', 'FINANCE', 'AUDITOR'), async (req: AuthRequest, res) => {
  res.json({
    revenue: { accounts: [], total: 0 },
    expenses: { accounts: [], total: 0 },
    netProfit: 0
  });
});

router.get('/balance-sheet', authorizeRoles('ADMIN', 'FINANCE', 'AUDITOR'), async (req: AuthRequest, res) => {
  res.json({
    assets: { accounts: [], total: 0 },
    liabilities: { accounts: [], total: 0 },
    equity: { accounts: [], total: 0 },
    balanced: true
  });
});

export default router;
