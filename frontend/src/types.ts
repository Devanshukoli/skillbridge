export interface UserProfile {
  experienceLevel: string;
  skills: string[];
  goals: string;
  timeCommitment: string;
  avatarId?: string;
  appearance?: 'system' | 'dark' | 'light';
  privacy?: {
    publicProfile?: boolean;
    showExternalLinks?: boolean;
    showProgressBadges?: boolean;
  };
  bio?: string;
  currentRole?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  status?: 'active' | 'blocked';
  pointsBalance: number;
  claimableBalance: number;
  profile: UserProfile;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface Track {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Module {
  id: string;
  trackId: string;
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string; // Markdown content
  order: number;
  estimatedMinutes: number;
}

export interface Project {
  id: string;
  trackId: string;
  moduleId?: string; // Nullable for capstone
  type: 'practice' | 'capstone';
  title: string;
  description: string;
  requirements: string[];
  rubric: string[];
  rewardPoints: number;
  rewardMoney?: number; // Nullable
}

export interface Submission {
  id: string;
  userId: string;
  projectId: string;
  repoUrl: string;
  demoUrl?: string;
  writeup: string;
  status: 'submitted' | 'in_review' | 'changes_requested' | 'approved' | 'rejected';
  reviewerId?: string;
  reviewerFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
  // Included on fetch for display
  projectTitle?: string;
  projectType?: 'practice' | 'capstone';
  userName?: string;
  userEmail?: string;
}

export interface SubmissionHistory {
  id: string;
  submissionId: string;
  adminId: string;
  action: 'status_change' | 'comment';
  oldStatus?: string;
  newStatus?: string;
  comment: string;
  createdAt: string;
  adminName?: string;
}

export interface Progress {
  userId: string;
  itemId: string; // Lesson ID or Project ID
  type: 'lesson' | 'project';
  status: 'completed' | 'submitted' | 'approved';
  completedAt: string;
}

export interface Claim {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  requestedAt: string;
  resolvedAt?: string;
  userName?: string;
  userEmail?: string;
}

export interface DashboardStats {
  completionPercentage: number;
  pointsBalance: number;
  claimableBalance: number;
  lessonsCompleted: number;
  totalLessons: number;
  projectsCompleted: number;
  totalProjects: number;
}
