import bcrypt from 'bcryptjs';
import { User } from '../../../frontend/src/types';
import { loadDb, saveDb } from '../../server/db';
import { isSupabaseEnabled, supabaseGetUser, supabaseCreateUser, supabaseGetUserById } from '../../server/supabase';

export class AuthService {
  async getUserByEmail(email: string): Promise<{ user: User; passwordHash: string } | null> {
    const normalizedEmail = email.toLowerCase();
    
    if (isSupabaseEnabled()) {
      return await supabaseGetUser(normalizedEmail);
    } else {
      const db = loadDb();
      const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (!user) return null;
      
      const passwordHash = db.passwords[user.id] || '';
      return { user, passwordHash };
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    if (isSupabaseEnabled()) {
      return await supabaseGetUserById(userId);
    } else {
      const db = loadDb();
      return db.users.find(u => u.id === userId) || null;
    }
  }

  async createUser(user: User, passwordHash: string): Promise<boolean> {
    if (isSupabaseEnabled()) {
      return await supabaseCreateUser(user, passwordHash);
    } else {
      const db = loadDb();
      db.users.push(user);
      db.passwords[user.id] = passwordHash;
      saveDb(db);
      return true;
    }
  }
}

export const authService = new AuthService();
