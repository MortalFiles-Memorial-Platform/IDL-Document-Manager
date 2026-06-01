import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types';
import type { Role } from '@prisma/client';

export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
    }
    next();
  };
}
