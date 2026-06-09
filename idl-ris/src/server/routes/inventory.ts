import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import { logAudit } from '../utils/audit';
import type { AuthRequest } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'INVENTORY', 'PROCUREMENT', 'AUDITOR'), async (req: AuthRequest, res) => {
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  res.json(items);
});

router.post('/', authorizeRoles('ADMIN', 'INVENTORY', 'PROCUREMENT'), async (req: AuthRequest, res) => {
  const { sku, name, category, unit, unitPrice, quantity, reorderLevel, location } = req.body;
  const item = await prisma.inventoryItem.create({
    data: { sku, name, category, unit, unitPrice: Number(unitPrice), quantity: Number(quantity), reorderLevel: Number(reorderLevel), location }
  });
  await logAudit('CREATE_INVENTORY', 'InventoryItem', item.id, req.user?.id, `Created inventory item ${item.sku}`);
  res.status(201).json(item);
});

router.put('/:id', authorizeRoles('ADMIN', 'INVENTORY', 'PROCUREMENT'), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { sku, name, category, unit, unitPrice, quantity, reorderLevel, location } = req.body;
  const item = await prisma.inventoryItem.update({
    where: { id },
    data: { sku, name, category, unit, unitPrice: Number(unitPrice), quantity: Number(quantity), reorderLevel: Number(reorderLevel), location }
  });
  await logAudit('UPDATE_INVENTORY', 'InventoryItem', id, req.user?.id, `Updated inventory item ${item.sku}`);
  res.json(item);
});

router.delete('/:id', authorizeRoles('ADMIN', 'INVENTORY'), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  await prisma.inventoryItem.delete({ where: { id } });
  await logAudit('DELETE_INVENTORY', 'InventoryItem', id, req.user?.id, `Deleted inventory item ${id}`);
  res.status(204).send();
});

export default router;
