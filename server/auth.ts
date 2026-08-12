import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'adventiststay-dev-secret-change-me';
const TOKEN_TTL = '7d';

export interface AuthTokenPayload {
  userId: string;
  role: string;
  email: string;
}

export interface AuthedRequest extends Request {
  user?: AuthTokenPayload;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function authOptional(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const payload = verifyToken(header.slice(7));
    if (payload) req.user = payload;
  }
  next();
}

export function authRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const payload = verifyToken(header.slice(7));
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.user = payload;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export async function writeAuditLog(params: {
  actorId?: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  details?: string;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId || null,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      details: params.details || '',
      ipAddress: params.ipAddress || '127.0.0.1',
    },
  });
}
