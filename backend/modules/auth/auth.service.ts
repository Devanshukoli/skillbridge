import bcrypt from 'bcryptjs';
import { User } from '../../../frontend/src/types';
import { supabaseGetUser, supabaseCreateUser, supabaseGetUserById } from '../../server/supabase';

export class AuthService {
  async getUserByEmail(email: string): Promise<{ user: User; passwordHash: string } | null> {
    const normalizedEmail = email.toLowerCase();
    return await supabaseGetUser(normalizedEmail);
  }

  async getUserById(userId: string): Promise<User | null> {
    return await supabaseGetUserById(userId);
  }

  async createUser(user: User, passwordHash: string): Promise<boolean> {
    return await supabaseCreateUser(user, passwordHash);
  }

  async changePassword(userId: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { supabaseUpdatePassword } = await import('../../server/supabase');
    return await supabaseUpdatePassword(userId, hashedPassword);
  }
}

export const authService = new AuthService();
