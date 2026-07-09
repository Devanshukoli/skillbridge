import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  supabaseGetAllUsers,
  supabaseUpdateUserProfile,
  supabaseCreateUser,
  supabaseCreateTrack,
  supabaseUpdateTrack,
  supabaseDeleteTrack,
  supabaseCreateModule,
  supabaseUpdateModule,
  supabaseDeleteModule,
  supabaseCreateLesson,
  supabaseUpdateLesson,
  supabaseDeleteLesson,
  supabaseCreateProject,
  supabaseUpdateProject,
  supabaseDeleteProject,
  supabaseGetSubmissionHistory,
  supabaseUpdatePassword
} from '../../server/supabase';
import { User, Track, Module, Lesson, Project } from '../../../frontend/src/types';

export class AdminController {
  // --- USER MANAGEMENT ---
  async getUsers(req: Request, res: Response) {
    try {
      const users = await supabaseGetAllUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { name, email, role, password } = req.body;
      const newUser: User = {
        id: 'user-' + Date.now().toString(),
        name,
        email,
        role: role || 'student',
        status: 'active',
        pointsBalance: 0,
        claimableBalance: 0,
        profile: {
          bio: '',
          githubUrl: '',
          portfolioUrl: '',
          skills: [],
          experienceLevel: 'beginner',
          goals: '',
          timeCommitment: ''
        },
        onboardingCompleted: false,
        createdAt: new Date().toISOString()
      };
      
      const passwordHash = await bcrypt.hash(password || 'defaultPassword123', 10);
      await supabaseCreateUser(newUser, passwordHash);
      res.json(newUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, profile, status, newPassword } = req.body;
      
      if (newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await supabaseUpdatePassword(id, passwordHash);
      }
      
      const updatedUser = await supabaseUpdateUserProfile(id, { name, profile, status });
      res.json(updatedUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- CMS: TRACKS ---
  async createTrack(req: Request, res: Response) {
    try {
      const track: Track = req.body;
      await supabaseCreateTrack(track);
      res.json(track);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateTrack(req: Request, res: Response) {
    try {
      await supabaseUpdateTrack(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteTrack(req: Request, res: Response) {
    try {
      await supabaseDeleteTrack(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- CMS: MODULES ---
  async createModule(req: Request, res: Response) {
    try {
      const moduleData: Module = req.body;
      await supabaseCreateModule(moduleData);
      res.json(moduleData);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateModule(req: Request, res: Response) {
    try {
      await supabaseUpdateModule(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteModule(req: Request, res: Response) {
    try {
      await supabaseDeleteModule(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- CMS: LESSONS ---
  async createLesson(req: Request, res: Response) {
    try {
      const lesson: Lesson = req.body;
      await supabaseCreateLesson(lesson);
      res.json(lesson);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateLesson(req: Request, res: Response) {
    try {
      await supabaseUpdateLesson(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteLesson(req: Request, res: Response) {
    try {
      await supabaseDeleteLesson(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- CMS: PROJECTS ---
  async createProject(req: Request, res: Response) {
    try {
      const project: Project = req.body;
      await supabaseCreateProject(project);
      res.json(project);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      await supabaseUpdateProject(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      await supabaseDeleteProject(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- SUBMISSION HISTORY ---
  async getSubmissionHistory(req: Request, res: Response) {
    try {
      const history = await supabaseGetSubmissionHistory(req.params.id);
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const adminController = new AdminController();
