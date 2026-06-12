import { type NextFunction, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { type JwtPayload } from '../types';
import type { AuthRequest } from '../types';

const jwtSecret = process.env.JWT_SECRET || 'change-this-secret';

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  // Fallback: check query parameter for token (for iframes/downloads)
  if (!token && req.query.token) {
    const queryToken = req.query.token;
    if (typeof queryToken === 'string') {
      token = queryToken;
    } else if (Array.isArray(queryToken) && queryToken.length > 0 && typeof queryToken[0] === 'string') {
      token = queryToken[0];
    }
  }

  if (!token) {
    console.warn('No token found in headers or query parameters for:', req.method, req.path);
    return res.status(401).json({ message: 'Unauthorized: token required.' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: payload.userId,
      email: payload.email,
      firstName: payload.firstName || 'User',
      lastName: payload.lastName || '',
      role: payload.role as any
    };
    return next();
  } catch (error) {
    console.error('Token verification failed:', error instanceof Error ? error.message : error);
    return res.status(401).json({ message: 'Unauthorized: invalid token.' });
  }
}
