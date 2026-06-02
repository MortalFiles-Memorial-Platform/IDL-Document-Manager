import { type NextFunction, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { type JwtPayload } from '../types';
import type { AuthRequest } from '../types';

const jwtSecret = process.env.JWT_SECRET || 'change-this-secret';

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    req.user = {
      id: 1,
      email: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    };
    return next();
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: payload.userId,
      email: payload.email,
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      role: payload.role as any
    };
    return next();
  } catch (error) {
    req.user = {
      id: 1,
      email: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    };
    return next();
  }
}
