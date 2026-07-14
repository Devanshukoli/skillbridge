import { authenticator } from '@otplib/preset-default';
import { User } from '../../../frontend/src/types';
import { supabaseGetUserById, supabaseUpdateUser } from '../../server/supabase';

export class TwoFactorService {
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  generateQRCode(secret: string, email: string): string {
    const serviceName = 'SkillBridge';
    return authenticator.keyuri(email, serviceName, secret);
  }

  verifyToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }

  async enableTwoFactor(userId: string, secret: string): Promise<boolean> {
    const user = await supabaseGetUserById(userId);
    if (!user) return false;

    const updatedUser: Partial<User> = {
      twoFactorEnabled: true,
      twoFactorSecret: secret
    };

    return await supabaseUpdateUser(userId, updatedUser);
  }

  async disableTwoFactor(userId: string): Promise<boolean> {
    const updatedUser: Partial<User> = {
      twoFactorEnabled: false,
      twoFactorSecret: null
    };

    return await supabaseUpdateUser(userId, updatedUser);
  }

  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await supabaseGetUserById(userId);
    return user?.twoFactorEnabled || false;
  }
}

export const twoFactorService = new TwoFactorService();
