import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { curriculumService } from './curriculum.service';

export class CurriculumController {
  // Get full curriculum for user
  async getCurriculum(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const curriculum = await curriculumService.getCurriculum(user);
      res.json(curriculum);
    } catch (err) {
      next(err);
    }
  }

  // Complete a lesson
  async completeLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const lessonId = req.params.id;
      const result = await curriculumService.completeLesson(user, lessonId);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'Lesson not found') {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  }
}

export const curriculumController = new CurriculumController();
