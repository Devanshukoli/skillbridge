import { User } from '../../../frontend/src/types';
import { supabaseUpdateUserProfile } from '../../server/supabase';

export class ProfileService {
  async completeOnboarding(user: User, updatedProfile: any): Promise<User | null> {
    return await supabaseUpdateUserProfile(user.id, {
      profile: updatedProfile,
      onboardingCompleted: true,
      pointsBalance: user.pointsBalance + 50
    });
  }

  async updateProfile(user: User, name: string, updatedProfile: any): Promise<User | null> {
    return await supabaseUpdateUserProfile(user.id, {
      name,
      profile: updatedProfile
    });
  }
}

export const profileService = new ProfileService();
