import React, { useState, useEffect } from 'react';
import { User, Track, Module, Lesson, Project, Submission, Progress } from './types';
import Navbar from './components/Navbar';
import AuthView from './components/AuthView';
import OnboardingFlow from './components/OnboardingFlow';
import DashboardView from './components/DashboardView';
import CurriculumView from './components/CurriculumView';
import TracksView from './components/TracksView';
import ProjectSubmissionView from './components/ProjectSubmissionView';
import SettingsView from './components/SettingsView';
import AdminView from './components/AdminView';
import AdminDashboardView from './components/AdminDashboardView';
import AdminTracksCMSView from './components/AdminTracksCMSView';
import AdminSettingsView from './components/AdminSettingsView';
import { Code } from 'lucide-react';
import { AppShellSkeleton } from './components/Skeleton';

const sectionsByRole: Record<User['role'], string[]> = {
  admin: ['dashboard', 'tracks', 'submissions', 'settings'],
  student: ['dashboard', 'curriculum', 'tracks', 'submissions', 'settings']
};

const getSectionStorageKey = (user: User) => `skillbridge:last-section:${user.id}`;

const getStoredSection = (user: User) => {
  try {
    const storedSection = window.localStorage.getItem(getSectionStorageKey(user));
    return storedSection && sectionsByRole[user.role].includes(storedSection)
      ? storedSection
      : 'dashboard';
  } catch (err) {
    return 'dashboard';
  }
};

const persistStoredSection = (user: User, section: string) => {
  if (!sectionsByRole[user.role].includes(section)) {
    return;
  }

  try {
    window.localStorage.setItem(getSectionStorageKey(user), section);
  } catch (err) {
    // Ignore storage failures so private browsing or blocked storage does not break navigation.
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string>('');
  
  const [curriculum, setCurriculum] = useState<{
    tracks: Track[];
    modules: Module[];
    lessons: Lesson[];
    projects: Project[];
    progress: Progress[];
    submissions: Submission[];
    currentTrackId?: string;
  }>({
    tracks: [],
    modules: [],
    lessons: [],
    projects: [],
    progress: [],
    submissions: [],
    currentTrackId: ''
  });

  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  const navigateToSection = (section: string, nextUser = user) => {
    setActiveSection(section);
    if (nextUser) {
      persistStoredSection(nextUser, section);
    }

    // Auto clear specific reader selections when navigating tabs
    if (section !== 'curriculum') setSelectedLessonId(null);
    if (section !== 'submissions') setSelectedProjectId(null);
  };

  useEffect(() => {
    const preference = user?.profile.appearance || 'system';
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const resolvedTheme = preference === 'system'
        ? (mediaQuery.matches ? 'dark' : 'light')
        : preference;

      document.documentElement.dataset.theme = resolvedTheme;
    };

    applyTheme();

    if (preference === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [user?.profile.appearance]);

  // 1. Fetch Session on Mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          const params = new URLSearchParams(window.location.search);
          const restoredSection = data.user.role === 'student' && params.get('settings') === 'payment'
            ? 'settings'
            : getStoredSection(data.user);
          navigateToSection(restoredSection, data.user);
        }
      } catch (err) {
        console.error('Session retrieval failed', err);
      } finally {
        setLoadingSession(false);
      }
    };
    fetchSession();
  }, []);

  // 2. Fetch Curriculum once User logs in
  const fetchCurriculum = async () => {
    if (!user) return;
    // Admins don't strictly require onboarding check to view curriculum details
    if (user.role === 'student' && !user.onboardingCompleted) return;
    
    setLoadingCurriculum(true);
    try {
      const res = await fetch('/api/curriculum');
      if (res.ok) {
        const data = await res.json();
        setCurriculum(data);
        if (data.currentTrackId) {
          setCurrentTrackId(data.currentTrackId);
        }
      }
    } catch (err) {
      console.error('Curriculum sync failed', err);
    } finally {
      setLoadingCurriculum(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [user]);

  // Auto-refresh curriculum every 30 seconds to catch admin updates
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchCurriculum();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setActiveSection('dashboard');
      setSelectedLessonId(null);
      setSelectedProjectId(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // 3. Render Session Boot Loading Screen
  if (loadingSession) {
    return <AppShellSkeleton />;
  }

  // 4. Render Auth Page if not authenticated
  if (!user) {
    return <AuthView onAuthSuccess={(authenticatedUser) => {
      setUser(authenticatedUser);
      navigateToSection(getStoredSection(authenticatedUser), authenticatedUser);
    }} />;
  }

  // 5. Render Onboarding Questionnaire for first-time students
  if (user.role === 'student' && !user.onboardingCompleted) {
    return <OnboardingFlow user={user} onOnboardingComplete={(updatedUser) => {
      setUser(updatedUser);
      navigateToSection('dashboard', updatedUser);
    }} />;
  }

  // 6. Main Portal Layout
  return (
    <div className="app-shell min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      
      {/* Navigation drawer */}
      <Navbar 
        user={user} 
        activeSection={activeSection} 
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        setActiveSection={navigateToSection}
        onLogout={handleLogout} 
      />

      {/* Primary Workspace Stage */}
      <main className={`flex-1 p-6 lg:p-10 pb-24 lg:pb-10 overflow-y-auto max-w-7xl mx-auto w-full ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {activeSection === 'dashboard' && user.role !== 'admin' && (
          <DashboardView 
            user={user}
            onUserUpdate={setUser}
            curriculum={curriculum}
            setActiveSection={navigateToSection}
            setSelectedLessonId={setSelectedLessonId}
            setSelectedProjectId={setSelectedProjectId}
          />
        )}

        {activeSection === 'dashboard' && user.role === 'admin' && (
          <AdminDashboardView 
            user={user}
            onRefreshCurriculum={fetchCurriculum}
          />
        )}

        {activeSection === 'curriculum' && user.role !== 'admin' && (
          <CurriculumView 
            user={user}
            onUserUpdate={setUser}
            curriculum={curriculum}
            onRefreshCurriculum={fetchCurriculum}
            selectedLessonId={selectedLessonId}
            setSelectedLessonId={setSelectedLessonId}
            setActiveSection={navigateToSection}
            setSelectedProjectId={setSelectedProjectId}
            currentTrackId={currentTrackId}
            setCurrentTrackId={setCurrentTrackId}
          />
        )}

        {activeSection === 'tracks' && user.role !== 'admin' && (
          <TracksView
            curriculum={curriculum}
            onViewTrack={(trackId) => {
              setCurrentTrackId(trackId);
              navigateToSection('curriculum');
            }}
          />
        )}

        {activeSection === 'tracks' && user.role === 'admin' && (
          <AdminTracksCMSView
            curriculum={curriculum}
            onRefreshCurriculum={fetchCurriculum}
          />
        )}

        {activeSection === 'submissions' && user.role !== 'admin' && (
          <ProjectSubmissionView 
            user={user}
            onUserUpdate={setUser}
            curriculum={curriculum}
            onRefreshCurriculum={fetchCurriculum}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />
        )}

        {activeSection === 'submissions' && user.role === 'admin' && (
          <AdminView 
            user={user}
            onRefreshCurriculum={fetchCurriculum}
          />
        )}

        {activeSection === 'settings' && user.role !== 'admin' && (
          <SettingsView
            user={user}
            onUserUpdate={setUser}
          />
        )}

        {activeSection === 'settings' && user.role === 'admin' && (
          <AdminSettingsView
            user={user}
            onUserUpdate={setUser}
          />
        )}
      </main>

    </div>
  );
}
