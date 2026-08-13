import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_EXPIRES_IN = '30d';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[auth] JWT_SECRET is not set (or too short) in production. Using an insecure fallback — set JWT_SECRET on the service.'
    );
  }
  return secret || 'insecure-dev-secret-change-me-please-0000';
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface TokenPayload {
  sub: string; // user id
  role: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export interface AuthedRequest extends Request {
  auth?: TokenPayload;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  // Fallback to cookie for browser sessions
  const cookieToken = (req as any).cookies?.token;
  if (cookieToken) return cookieToken;
  return null;
}

/** Attaches req.auth if a valid token is present; never rejects. */
export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) req.auth = payload;
  }
  next();
}

/** Rejects with 401 when no valid token is present. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  req.auth = payload;
  next();
}

/** Rejects with 403 unless the caller is an authenticated ADMIN. */
export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  if (payload.role !== 'ADMIN') {
    res.status(403).json({ error: 'Administrator privileges required' });
    return;
  }
  req.auth = payload;
  next();
}
