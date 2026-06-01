import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';

const router = Router();
router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'AUDITOR'), async (req, res) => {
  const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 200 });
  res.json(logs);
});

export default router;
