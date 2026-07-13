import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { profileService } from './profile.service';

export class ProfileController {
  // Post onboarding questionnaire
  async completeOnboarding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { experienceLevel, skills, goals, timeCommitment } = req.body;

      if (!experienceLevel || !skills || !goals || !timeCommitment) {
        return res.status(400).json({ error: 'All questionnaire responses are required' });
      }

      const updatedProfile = {
        ...user.profile,
        experienceLevel,
        skills,
        goals,
        timeCommitment,
        currentRole: 'CS Student / Aspiring Engineer'
      };

      const updatedUser = await profileService.completeOnboarding(user, updatedProfile);
      if (!updatedUser) {
        return res.status(500).json({ error: 'Failed to complete onboarding' });
      }

      res.json({ user: updatedUser });
    } catch (err) {
      next(err);
    }
  }

  // Update profile attributes
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        name,
        bio,
        currentRole,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        resumeUrl,
        skills,
        experienceLevel,
        goals,
        timeCommitment,
        avatarId,
        appearance,
        privacy,
        country
      } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const updatedProfile = {
        experienceLevel: experienceLevel || user.profile.experienceLevel || '',
        skills: skills || user.profile.skills || [],
        goals: goals || user.profile.goals || '',
        timeCommitment: timeCommitment || user.profile.timeCommitment || '',
        country: country || user.profile.country || '',
        avatarId: avatarId || user.profile.avatarId || 'blue-code',
        appearance: appearance || user.profile.appearance || 'system',
        privacy: privacy || user.profile.privacy || {
          publicProfile: true,
          showExternalLinks: true,
          showProgressBadges: true
        },
        bio: bio || '',
        currentRole: currentRole || '',
        githubUrl: githubUrl || '',
        linkedinUrl: linkedinUrl || '',
        portfolioUrl: portfolioUrl || '',
        resumeUrl: resumeUrl || ''
      };

      const updatedUser = await profileService.updateProfile(user, name, updatedProfile);
      if (!updatedUser) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      res.json({ user: updatedUser });
    } catch (err) {
      next(err);
    }
  }
}

export const profileController = new ProfileController();
