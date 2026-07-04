import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../../frontend/src/types';
import { authService } from './auth.service';
import { JWT_SECRET, getCookies, AuthenticatedRequest } from '../../middlewares/auth';
import { isSupabaseEnabled } from '../../server/supabase';

export class AuthController {
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

      // Generate JWT
      const token = jwt.sign({ userId, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

      // Set Cookie
      res.setHeader('Set-Cookie', `skillbridge_token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);
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

      // Generate JWT
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      // Set Cookie
      res.setHeader('Set-Cookie', `skillbridge_token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);
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

  // Simulate Google Sign-In
  async googleSim(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Google email is required' });
      }

      const normalizedEmail = email.toLowerCase();
      const existing = await authService.getUserByEmail(normalizedEmail);
      let user: User;

      if (existing) {
        user = existing.user;
      } else {
        const userId = 'user-google-' + Date.now().toString();
        user = {
          id: userId,
          name: name || 'Google User',
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

        await authService.createUser(user, 'GOOGLE_OAUTH_OAUTH_NO_PASSWORD');
      }

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.setHeader('Set-Cookie', `skillbridge_token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
