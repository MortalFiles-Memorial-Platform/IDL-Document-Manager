import type { Request } from 'express';
import type { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'department'>;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  department?: string;
}
