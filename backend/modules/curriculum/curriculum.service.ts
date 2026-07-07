import { User, Progress } from '../../../frontend/src/types';
import { loadDb, saveDb } from '../../server/db';
import {
  isSupabaseEnabled,
  supabaseGetCurriculum,
  supabaseCompleteLesson,
  supabaseGetUserById
} from '../../server/supabase';

export class CurriculumService {
  async getCurriculum(user: User): Promise<any> {
    if (isSupabaseEnabled()) {
      const curriculum = await supabaseGetCurriculum(user.id);
      if (curriculum) {
        return curriculum;
      }
    }

    const db = loadDb();
    const userProgress = db.progress.filter(p => p.userId === user.id);
    const userSubmissions = db.submissions.filter(s => s.userId === user.id);

    const trackScores: Record<string, number> = {};
    userProgress.forEach((progressItem) => {
      if (progressItem.type !== 'lesson' && progressItem.type !== 'project') return;
      const lesson = db.lessons.find((l) => l.id === progressItem.itemId);
      const project = db.projects.find((p) => p.id === progressItem.itemId);
      let trackId = lesson ? db.modules.find((m) => m.id === lesson.moduleId)?.trackId : undefined;
      if (!trackId && project) {
        trackId = project.trackId;
      }
      if (!trackId) return;
      trackScores[trackId] = (trackScores[trackId] || 0) + 1;
    });

    const currentTrackId = Object.keys(trackScores).sort((a, b) => trackScores[b] - trackScores[a])[0] || db.tracks[0]?.id || '';

    return {
      tracks: db.tracks,
      modules: db.modules,
      lessons: db.lessons,
      projects: db.projects,
      progress: userProgress,
      submissions: userSubmissions,
      currentTrackId
    };
  }

  async completeLesson(user: User, lessonId: string): Promise<{ success: boolean; pointsAwarded: number; user: User | null }> {
    if (isSupabaseEnabled()) {
      const success = await supabaseCompleteLesson(user.id, lessonId, 20);
      const updatedUser = await supabaseGetUserById(user.id);
      return { success, pointsAwarded: success ? 20 : 0, user: updatedUser };
    }

    const db = loadDb();
    const lesson = db.lessons.find(l => l.id === lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check if already completed
    const existing = db.progress.find(p => p.userId === user.id && p.itemId === lessonId && p.type === 'lesson');
    
    if (!existing) {
      const newProgress: Progress = {
        userId: user.id,
        itemId: lessonId,
        type: 'lesson',
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      db.progress.push(newProgress);

      // Give 20 XP for lesson completion
      const dbUser = db.users.find(u => u.id === user.id);
      if (dbUser) {
        dbUser.pointsBalance += 20;
      }
      
      saveDb(db);
      return { success: true, pointsAwarded: 20, user: dbUser || null };
    }

    const dbUser = db.users.find(u => u.id === user.id) || null;
    return { success: true, pointsAwarded: 0, user: dbUser };
  }
}

export const curriculumService = new CurriculumService();
