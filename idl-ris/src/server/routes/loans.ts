import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import { logAudit } from '../utils/audit';
import type { AuthRequest } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'FINANCE', 'AUDITOR'), async (req: AuthRequest, res) => {
  const loans = await prisma.loan.findMany({ include: { repayments: true }, orderBy: { createdAt: 'desc' } });
  res.json(loans);
});

router.post('/', authorizeRoles('ADMIN', 'FINANCE'), async (req: AuthRequest, res) => {
  const { borrower, principal, interestRate, dueDate, currency } = req.body;
  const loan = await prisma.loan.create({
    data: {
      borrower,
      principal: Number(principal),
      outstanding: Number(principal),
      interestRate: Number(interestRate),
      currency: currency || 'NGN',
      dueDate: new Date(dueDate)
    }
  });
  await logAudit('CREATE_LOAN', 'Loan', loan.id, req.user?.id, `Created loan for ${loan.borrower}`);
  res.status(201).json(loan);
});

router.post('/:id/repay', authorizeRoles('ADMIN', 'FINANCE'), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { amount, receiptRef } = req.body;
  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) {
    return res.status(404).json({ message: 'Loan not found.' });
  }

  const paidAmount = Number(amount);
  const newOutstanding = Number(loan.outstanding) - paidAmount;
  const status = newOutstanding <= 0 ? 'CLOSED' : loan.status;

  await prisma.loanRepayment.create({ data: { loanId: id, amount: paidAmount, receiptRef } });
  const updated = await prisma.loan.update({ where: { id }, data: { outstanding: newOutstanding, status } });
  await logAudit('LOAN_REPAYMENT', 'Loan', id, req.user?.id, `Recorded repayment ${paidAmount} for loan ${id}`);
  res.json(updated);
});

export default router;
