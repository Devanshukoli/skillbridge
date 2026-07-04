import React, { useState, useEffect } from 'react';
import { User, Track, Module, Lesson, Project, Submission, Progress } from './types';
import Navbar from './components/Navbar';
import AuthView from './components/AuthView';
import OnboardingFlow from './components/OnboardingFlow';
import DashboardView from './components/DashboardView';
import CurriculumView from './components/CurriculumView';
import ProjectSubmissionView from './components/ProjectSubmissionView';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import { Code } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const [curriculum, setCurriculum] = useState<{
    tracks: Track[];
    modules: Module[];
    lessons: Lesson[];
    projects: Project[];
    progress: Progress[];
    submissions: Submission[];
  }>({
    tracks: [],
    modules: [],
    lessons: [],
    projects: [],
    progress: [],
    submissions: []
  });

  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  // 1. Fetch Session on Mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (data.user.role === 'admin') {
            setActiveSection('admin');
          }
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
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        {/* Minimalist modern ring spinner */}
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/10 border-t-emerald-400 animate-spin" />
        <div className="flex items-center space-x-2 text-slate-400 font-mono text-xs tracking-wider uppercase font-semibold">
          <Code className="w-4 h-4 animate-pulse text-emerald-400" />
          <span>Synchronizing Session...</span>
        </div>
      </div>
    );
  }

  // 4. Render Auth Page if not authenticated
  if (!user) {
    return <AuthView onAuthSuccess={(authenticatedUser) => {
      setUser(authenticatedUser);
      if (authenticatedUser.role === 'admin') {
        setActiveSection('admin');
      } else {
        setActiveSection('dashboard');
      }
    }} />;
  }

  // 5. Render Onboarding Questionnaire for first-time students
  if (user.role === 'student' && !user.onboardingCompleted) {
    return <OnboardingFlow user={user} onOnboardingComplete={(updatedUser) => {
      setUser(updatedUser);
      setActiveSection('dashboard');
    }} />;
  }

  // 6. Main Portal Layout
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      
      {/* Navigation drawer */}
      <Navbar 
        user={user} 
        activeSection={activeSection} 
        setActiveSection={(section) => {
          setActiveSection(section);
          // Auto clear specific reader selections when navigating tabs
          if (section !== 'curriculum') setSelectedLessonId(null);
          if (section !== 'submissions') setSelectedProjectId(null);
        }} 
        onLogout={handleLogout} 
      />

      {/* Primary Workspace Stage */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 pb-24 lg:pb-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeSection === 'dashboard' && (
          <DashboardView 
            user={user}
            onUserUpdate={setUser}
            curriculum={curriculum}
            setActiveSection={setActiveSection}
            setSelectedLessonId={setSelectedLessonId}
            setSelectedProjectId={setSelectedProjectId}
          />
        )}

        {activeSection === 'curriculum' && (
          <CurriculumView 
            user={user}
            onUserUpdate={setUser}
            curriculum={curriculum}
            onRefreshCurriculum={fetchCurriculum}
            selectedLessonId={selectedLessonId}
            setSelectedLessonId={setSelectedLessonId}
            setActiveSection={setActiveSection}
            setSelectedProjectId={setSelectedProjectId}
          />
        )}

        {activeSection === 'submissions' && (
          <ProjectSubmissionView 
            user={user}
            onUserUpdate={setUser}
            curriculum={curriculum}
            onRefreshCurriculum={fetchCurriculum}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />
        )}

        {activeSection === 'profile' && (
          <ProfileView 
            user={user}
            onUserUpdate={setUser}
          />
        )}

        {activeSection === 'admin' && user.role === 'admin' && (
          <AdminView 
            user={user}
            onRefreshCurriculum={fetchCurriculum}
          />
        )}
      </main>

    </div>
  );
}
