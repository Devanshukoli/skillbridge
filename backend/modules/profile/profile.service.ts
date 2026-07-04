import { User } from '../../../frontend/src/types';
import { loadDb, saveDb } from '../../server/db';
import { isSupabaseEnabled, supabaseUpdateUserProfile } from '../../server/supabase';

export class ProfileService {
  async completeOnboarding(user: User, updatedProfile: any): Promise<User | null> {
    if (isSupabaseEnabled()) {
      return await supabaseUpdateUserProfile(user.id, {
        profile: updatedProfile,
        onboardingCompleted: true,
        pointsBalance: user.pointsBalance + 50
      });
    } else {
      const db = loadDb();
      const dbUser = db.users.find(u => u.id === user.id);
      if (!dbUser) return null;

      dbUser.profile = updatedProfile;
      dbUser.onboardingCompleted = true;
      dbUser.pointsBalance += 50;
      
      saveDb(db);
      return dbUser;
    }
  }

  async updateProfile(user: User, name: string, updatedProfile: any): Promise<User | null> {
    if (isSupabaseEnabled()) {
      return await supabaseUpdateUserProfile(user.id, {
        name,
        profile: updatedProfile
      });
    } else {
      const db = loadDb();
      const dbUser = db.users.find(u => u.id === user.id);
      if (!dbUser) return null;

      dbUser.name = name;
      dbUser.profile = updatedProfile;
      
      saveDb(db);
      return dbUser;
    }
  }
}

export const profileService = new ProfileService();
