import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import { logAudit } from '../utils/audit';

const router = Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'SALES', 'FINANCE', 'AUDITOR'), async (req, res) => {
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
  res.json(customers);
});

router.post('/', authorizeRoles('ADMIN', 'SALES', 'PROCUREMENT'), async (req, res) => {
  const { name, contactEmail, phone, address, tin, notes } = req.body;
  const customer = await prisma.customer.create({ data: { name, contactEmail, phone, address, tin, notes } });
  await logAudit('CREATE_CUSTOMER', 'Customer', customer.id, req.user?.id, `Created customer ${customer.name}`);
  res.status(201).json(customer);
});

router.put('/:id', authorizeRoles('ADMIN', 'SALES', 'FINANCE'), async (req, res) => {
  const id = Number(req.params.id);
  const { name, contactEmail, phone, address, tin, notes } = req.body;
  const customer = await prisma.customer.update({ where: { id }, data: { name, contactEmail, phone, address, tin, notes } });
  await logAudit('UPDATE_CUSTOMER', 'Customer', id, req.user?.id, `Updated customer ${customer.name}`);
  res.json(customer);
});

router.delete('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  await prisma.customer.delete({ where: { id } });
  await logAudit('DELETE_CUSTOMER', 'Customer', id, req.user?.id, `Deleted customer ${id}`);
  res.status(204).send();
});

export default router;
