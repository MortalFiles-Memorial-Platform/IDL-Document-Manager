import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import { logAudit } from '../utils/audit';

const router = Router();
router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'PROCUREMENT', 'FINANCE', 'AUDITOR'), async (req, res) => {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  res.json(suppliers);
});

router.post('/', authorizeRoles('ADMIN', 'PROCUREMENT'), async (req, res) => {
  const { name, contactEmail, phone, address, tin, notes } = req.body;
  const supplier = await prisma.supplier.create({ data: { name, contactEmail, phone, address, tin, notes } });
  await logAudit('CREATE_SUPPLIER', 'Supplier', supplier.id, req.user?.id, `Created supplier ${supplier.name}`);
  res.status(201).json(supplier);
});

router.put('/:id', authorizeRoles('ADMIN', 'PROCUREMENT', 'FINANCE'), async (req, res) => {
  const id = Number(req.params.id);
  const { name, contactEmail, phone, address, tin, notes } = req.body;
  const supplier = await prisma.supplier.update({ where: { id }, data: { name, contactEmail, phone, address, tin, notes } });
  await logAudit('UPDATE_SUPPLIER', 'Supplier', id, req.user?.id, `Updated supplier ${supplier.name}`);
  res.json(supplier);
});

router.delete('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  await prisma.supplier.delete({ where: { id } });
  await logAudit('DELETE_SUPPLIER', 'Supplier', id, req.user?.id, `Deleted supplier ${id}`);
  res.status(204).send();
});

export default router;
