import { User } from '../../../frontend/src/types';
import {
  supabaseGetCurriculum,
  supabaseCompleteLesson,
  supabaseGetUserById
} from '../../server/supabase';

export class CurriculumService {
  async getCurriculum(user: User): Promise<any> {
    const curriculum = await supabaseGetCurriculum(user.id);
    if (!curriculum) {
      throw new Error('Failed to load curriculum from database');
    }
    return curriculum;
  }

  async completeLesson(user: User, lessonId: string): Promise<{ success: boolean; pointsAwarded: number; user: User | null }> {
    const success = await supabaseCompleteLesson(user.id, lessonId, 20);
    const updatedUser = await supabaseGetUserById(user.id);
    return { success, pointsAwarded: success ? 20 : 0, user: updatedUser };
  }
}

export const curriculumService = new CurriculumService();
