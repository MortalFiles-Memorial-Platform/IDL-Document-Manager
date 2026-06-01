import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';

const router = Router();
router.use(authenticateToken);

router.get('/dashboard', authorizeRoles('ADMIN', 'FINANCE', 'AUDITOR', 'SALES'), async (req, res) => {
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

export default router;
