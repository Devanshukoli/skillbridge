import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../../../frontend/src/types';
import { authService } from './auth.service';
import { JWT_SECRET, getCookies, AuthenticatedRequest } from '../../middlewares/auth';
import { isSupabaseEnabled } from '../../server/supabase';
import { sendWelcomeEmail } from './welcomeEmail';

const GOOGLE_OAUTH_PASSWORD_MARKER = 'GOOGLE_OAUTH_NO_PASSWORD';

interface GoogleTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  id_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  email?: string;
  email_verified?: boolean;
  name?: string;
}

export class AuthController {
  private setSessionCookie(res: Response, user: User) {
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.setHeader('Set-Cookie', `skillbridge_token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);
  }

  private getBaseUrl(req: Request) {
    const configuredUrl = process.env.APP_URL;
    if (configuredUrl && /^https?:\/\//.test(configuredUrl)) {
      return configuredUrl.replace(/\/$/, '');
    }

    return `${req.protocol}://${req.get('host')}`;
  }

  private getGoogleRedirectUri(req: Request) {
    return `${this.getBaseUrl(req)}/api/auth/google/callback`;
  }

  // Check Supabase connection status
  async supabaseStatus(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ enabled: isSupabaseEnabled() });
    } catch (err) {
      next(err);
    }
  }

  // Register a new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const normalizedEmail = email.toLowerCase();
      const existing = await authService.getUserByEmail(normalizedEmail);

      if (existing) {
        return res.status(400).json({ error: 'A user with this email already exists' });
      }

      const userId = 'user-' + Date.now().toString();
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: User = {
        id: userId,
        name,
        email: normalizedEmail,
        role: 'student',
        pointsBalance: 0,
        claimableBalance: 0,
        profile: {
          experienceLevel: '',
          skills: [],
          goals: '',
          timeCommitment: '',
        },
        onboardingCompleted: false,
        createdAt: new Date().toISOString()
      };

      const success = await authService.createUser(newUser, hashedPassword);
      if (!success) {
        return res.status(500).json({ error: 'Failed to register user in database' });
      }

      void sendWelcomeEmail({
        name: newUser.name,
        email: newUser.email,
        appUrl: this.getBaseUrl(req)
      });

      this.setSessionCookie(res, newUser);
      res.status(201).json({ user: newUser });
    } catch (err) {
      next(err);
    }
  }

  // Log in
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const normalizedEmail = email.toLowerCase();
      const data = await authService.getUserByEmail(normalizedEmail);

      if (!data) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const { user, passwordHash } = data;
      const match = await bcrypt.compare(password, passwordHash);
      if (!match) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      this.setSessionCookie(res, user);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }

  // Log out
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader('Set-Cookie', `skillbridge_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'All password fields are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }

      const data = await authService.getUserByEmail(user.email);
      if (!data) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { passwordHash } = data;
      if (!passwordHash || passwordHash === GOOGLE_OAUTH_PASSWORD_MARKER || passwordHash === 'GOOGLE_OAUTH_OAUTH_NO_PASSWORD') {
        return res.status(400).json({ error: 'This account does not have a password set' });
      }

      const match = await bcrypt.compare(currentPassword, passwordHash);
      if (!match) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const success = await authService.changePassword(user.id, newPassword);
      if (!success) {
        return res.status(500).json({ error: 'Failed to update password' });
      }

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  // Me (Check current session)
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const cookies = getCookies(req);
      const token = cookies['skillbridge_token'];

      if (!token) {
        return res.json({ user: null });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await authService.getUserById(decoded.userId);

        if (!user) {
          return res.json({ user: null });
        }
        res.json({ user });
      } catch (err) {
        res.json({ user: null });
      }
    } catch (err) {
      next(err);
    }
  }

  async googleRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: 'Google OAuth is not configured' });
      }

      const state = crypto.randomBytes(24).toString('hex');
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: this.getGoogleRedirectUri(req),
        response_type: 'code',
        scope: 'openid email profile',
        state,
        prompt: 'select_account'
      });

      res.setHeader('Set-Cookie', `skillbridge_oauth_state=${state}; Path=/; HttpOnly; Max-Age=600; SameSite=Lax`);
      res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    } catch (err) {
      next(err);
    }
  }

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, state, error } = req.query;
      const baseUrl = this.getBaseUrl(req);

      if (error) {
        return res.redirect(`${baseUrl}/?auth_error=${encodeURIComponent(String(error))}`);
      }

      const cookies = getCookies(req);
      if (!state || cookies.skillbridge_oauth_state !== state) {
        return res.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('Invalid Google sign-in state')}`);
      }

      if (!code || typeof code !== 'string') {
        return res.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('Missing Google authorization code')}`);
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return res.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('Google OAuth is not configured')}`);
      }

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: this.getGoogleRedirectUri(req),
          grant_type: 'authorization_code'
        })
      });

      const tokenData = await tokenRes.json() as GoogleTokenResponse;
      if (!tokenRes.ok || !tokenData.access_token) {
        const message = tokenData.error_description || tokenData.error || 'Google token exchange failed';
        return res.redirect(`${baseUrl}/?auth_error=${encodeURIComponent(message)}`);
      }

      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const googleProfile = await profileRes.json() as GoogleUserInfo;

      if (!profileRes.ok || !googleProfile.email) {
        return res.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('Could not read Google profile')}`);
      }

      const normalizedEmail = googleProfile.email.toLowerCase();
      const existing = await authService.getUserByEmail(normalizedEmail);
      let user: User;

      if (existing) {
        user = existing.user;
      } else {
        const userId = 'user-google-' + Date.now().toString();
        user = {
          id: userId,
          name: googleProfile.name || normalizedEmail.split('@')[0] || 'Google User',
          email: normalizedEmail,
          role: 'student',
          pointsBalance: 0,
          claimableBalance: 0,
          profile: {
            experienceLevel: '',
            skills: [],
            goals: '',
            timeCommitment: '',
          },
          onboardingCompleted: false,
          createdAt: new Date().toISOString()
        };

        const created = await authService.createUser(user, GOOGLE_OAUTH_PASSWORD_MARKER);
        if (!created) {
          return res.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('Failed to create Google account')}`);
        }

        void sendWelcomeEmail({
          name: user.name,
          email: user.email,
          appUrl: baseUrl
        });
      }

      this.setSessionCookie(res, user);
      res.append('Set-Cookie', 'skillbridge_oauth_state=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
      res.redirect(baseUrl);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
