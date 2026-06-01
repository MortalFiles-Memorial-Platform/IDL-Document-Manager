import prisma from '../db';

export async function logAudit(action: string, entity: string, entityId?: number, userId?: number, details?: string) {
  await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      userId,
      details
    }
  });
}
