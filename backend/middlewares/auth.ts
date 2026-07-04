import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../frontend/src/types';
import { loadDb } from '../server/db';
import { isSupabaseEnabled, supabaseGetUserById } from '../server/supabase';

export const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_secret_signature_key_2026';

// Helper to parse cookies manually from headers
export function getCookies(req: Request): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

// Extend express Request interface to include the user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Authentication Middleware
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const cookies = getCookies(req);
  const token = cookies['skillbridge_token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    
    let user: User | null = null;
    if (isSupabaseEnabled()) {
      user = await supabaseGetUserById(decoded.userId);
    } else {
      const db = loadDb();
      user = db.users.find(u => u.id === decoded.userId) || null;
    }

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Admin only gate middleware
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}
