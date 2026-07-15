import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, Track, Module, Lesson, Project, Submission, Progress } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import {
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  Award,
  ArrowLeft,
  ChevronRight,
  Lock,
  ThumbsUp,
  Sparkles,
  PlayCircle,
  Loader2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { CurriculumSkeleton } from './Skeleton';

interface CurriculumViewProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  curriculum: {
    tracks: Track[];
    modules: Module[];
    lessons: Lesson[];
    projects: Project[];
    progress: Progress[];
    submissions: Submission[];
    currentTrackId?: string;
  };
  onRefreshCurriculum: () => void;
  selectedLessonId: string | null;
  setSelectedLessonId: (lessonId: string | null) => void;
  setActiveSection: (section: string) => void;
  setSelectedProjectId: (projectId: string | null) => void;
  currentTrackId: string;
  setCurrentTrackId: (trackId: string) => void;
}

export default function CurriculumView({
  user,
  onUserUpdate,
  curriculum,
  onRefreshCurriculum,
  selectedLessonId,
  setSelectedLessonId,
  setActiveSection,
  setSelectedProjectId,
  currentTrackId,
  setCurrentTrackId
}: CurriculumViewProps) {
  const [activeTrackId, setActiveTrackId] = useState<string>('');
  const [activeModuleId, setActiveModuleId] = useState<string>('');
  const [completing, setCompleting] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);

  // Collapse back to the inline reader whenever the selected lesson changes,
  // so switching lessons never leaves you stuck in fullscreen by accident.
  useEffect(() => {
    setIsEnlarged(false);
  }, [selectedLessonId]);

  // Escape key closes the enlarged reader, and we lock body scroll while
  // it's open so the page behind the overlay doesn't scroll along with it.
  useEffect(() => {
    if (!isEnlarged) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsEnlarged(false);
    };
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isEnlarged]);

  // Set initial track and module selection when curriculum loads
  useEffect(() => {
    if (curriculum.tracks.length === 0) return;
    const preferredTrackId = currentTrackId || curriculum.currentTrackId || curriculum.tracks[0]?.id || '';
    if (
      preferredTrackId &&
      activeTrackId !== preferredTrackId &&
      curriculum.tracks.some((track) => track.id === preferredTrackId)
    ) {
      setActiveTrackId(preferredTrackId);
      return;
    }

    if (!activeTrackId || !curriculum.tracks.some((track) => track.id === activeTrackId)) {
      setActiveTrackId(preferredTrackId);
    }
  }, [curriculum.tracks, activeTrackId, currentTrackId, curriculum.currentTrackId]);

  // Update active module when active track changes
  useEffect(() => {
    const trackModules = curriculum.modules
      .filter((m) => m.trackId === activeTrackId)
      .sort((a, b) => a.order - b.order);

    if (trackModules.length === 0) {
      setActiveModuleId('');
      return;
    }

    if (!activeModuleId || !trackModules.some((module) => module.id === activeModuleId)) {
      setActiveModuleId(trackModules[0].id);
    }
  }, [activeTrackId, curriculum.modules, activeModuleId]);

  // Auto-expand module if the selected lesson is from a different module
  useEffect(() => {
    if (selectedLessonId) {
      const activeLesson = curriculum.lessons.find((l) => l.id === selectedLessonId);
      if (activeLesson && activeLesson.moduleId !== activeModuleId) {
        setActiveModuleId(activeLesson.moduleId);
      }
    }
  }, [selectedLessonId, activeModuleId, curriculum.lessons]);

  if (curriculum.tracks.length === 0 && curriculum.modules.length === 0 && curriculum.lessons.length === 0) {
    return <CurriculumSkeleton />;
  }

  const activeLesson = curriculum.lessons.find((l) => l.id === selectedLessonId) || null;
  const sortedTracks = [...curriculum.tracks].sort((a, b) => a.name.localeCompare(b.name));
  const trackModules = [...curriculum.modules]
    .filter((m) => m.trackId === activeTrackId)
    .sort((a, b) => a.order - b.order);
  const sortedModules = trackModules;

  const handleCompleteLesson = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/lessons/${activeLesson.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete lesson');
      }

      // Success animation state
      setCompletionSuccess(true);
      if (data.user) {
        onUserUpdate(data.user);
      }
      onRefreshCurriculum();

      // Clear success state after 2 seconds
      setTimeout(() => {
        setCompletionSuccess(false);
      }, 2500);

    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const isCompleted = (lessonId: string) => {
    return curriculum.progress.some(p => p.itemId === lessonId && p.type === 'lesson' && p.status === 'completed');
  };

  // Determine if a module is locked
  const isModuleLocked = (mod: Module) => {
    if (mod.order === 1) return false;
    // Check if previous module has any completion
    const prevMod = sortedModules.find(m => m.order === mod.order - 1);
    if (!prevMod) return false;

    const prevLessons = curriculum.lessons.filter(l => l.moduleId === prevMod.id);
    const completedPrev = prevLessons.some(l => isCompleted(l.id));
    return !completedPrev;
  };

  // Shared markup for the reader card, used for both the inline (in-grid) and
  // enlarged (fullscreen overlay) states so we don't maintain two copies of
  // the header/body/footer. `enlarged` only toggles the icon + a couple of
  // spacing tweaks — the layoutId below is what does the actual animation work.
  const renderReaderPanel = (enlarged: boolean) => {
    if (!activeLesson) return null;
    return (
      <>
        {/* Reader Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedLessonId(null)}
              className="p-1.5 bg-white text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 lg:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-blue-600 uppercase tracking-wider font-semibold">
                Lesson Reader
              </span>
              <h3 className="font-bold text-slate-900 text-base leading-snug">{activeLesson.title}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {isCompleted(activeLesson.id) ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono flex items-center space-x-1.5 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Syllabus Completed</span>
              </div>
            ) : (
              <div className="bg-blue-50 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-600 font-mono border border-blue-100">
                +20 XP Reward
              </div>
            )}
            <button
              onClick={() => setIsEnlarged(!enlarged)}
              title={enlarged ? 'Exit fullscreen (Esc)' : 'Enlarge reader'}
              className="p-2 bg-white text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer shadow-sm"
            >
              {enlarged ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Reader Scroll Area */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="prose prose-slate max-w-none">
            <MarkdownRenderer content={activeLesson.content} />
          </div>
        </div>

        {/* Reader Footer Control */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={() => setSelectedLessonId(null)}
            className="hidden lg:block text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 transition-all shadow-sm cursor-pointer"
          >
            Close Reader
          </button>

          {isCompleted(activeLesson.id) ? (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center flex items-center space-x-2 text-emerald-700 text-xs w-full lg:w-auto">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <span>You finished reading this lesson! Continue below or browse projects.</span>
            </div>
          ) : (
            <button
              id="complete-lesson-btn"
              disabled={completing || completionSuccess}
              onClick={handleCompleteLesson}
              className="w-full lg:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-sm shadow-blue-500/10 cursor-pointer"
            >
              {completionSuccess ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Earned 20 XP!</span>
                </>
              ) : completing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Mark Complete & Earn 20 XP</span>
                  <Award className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-slate-800">
      
      {/* LEFT COLUMN: Module Selector & List of Lessons */}
      <div className={`lg:col-span-5 space-y-6 ${activeLesson ? 'hidden lg:block' : 'block'}`}>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Curriculum Pipeline</h2>
          <p className="text-slate-500 text-sm">Pick a track to explore lessons, examples, and projects.</p>
        </div>

        {/* Track Selection Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sortedTracks.map((track) => {
            const isActiveTrack = track.id === activeTrackId;
            return (
              <button
                key={track.id}
                onClick={() => {
                  setActiveTrackId(track.id);
                  setCurrentTrackId(track.id);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all border cursor-pointer ${isActiveTrack ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                {track.name}
              </button>
            );
          })}
        </div>

        {/* Module Navigation Tabs */}
        <div className="flex flex-col space-y-2 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm">
          {trackModules.map((mod) => {
            const isActive = activeModuleId === mod.id;
            const locked = isModuleLocked(mod);
            const modLessons = curriculum.lessons.filter((l) => l.moduleId === mod.id);
            const modCompleted = modLessons.filter((l) => isCompleted(l.id)).length;

            return (
              <button
                key={mod.id}
                id={`module-tab-${mod.id}`}
                onClick={() => setActiveModuleId(mod.id)}
                className={`
                  w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer
                  ${isActive 
                    ? 'bg-blue-50 border-blue-100 text-blue-700 font-semibold' 
                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`
                    w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center border transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:border-slate-300'
                    }
                  `}>
                    {mod.order}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm truncate leading-tight">{mod.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      {modLessons.length} units • {modCompleted}/{modLessons.length} complete
                    </span>
                  </div>
                </div>
                {locked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            );
          })}
        </div>

        {/* Lessons List inside selected module */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold px-1">
            Module {sortedModules.find(m => m.id === activeModuleId)?.order} Core Syllabus
          </span>

          <div className="space-y-2">
            {curriculum.lessons
              .filter(l => l.moduleId === activeModuleId)
              .sort((a, b) => a.order - b.order)
              .map((lesson) => {
                const active = selectedLessonId === lesson.id;
                const done = isCompleted(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    id={`lesson-item-${lesson.id}`}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`
                      w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer
                      ${active 
                        ? 'bg-blue-50/50 border-blue-500 shadow-sm text-slate-900' 
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="mt-0.5">
                        {done ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <span className={`text-sm font-semibold block leading-tight ${active ? 'text-blue-900' : 'text-slate-800 group-hover:text-slate-900'}`}>
                          {lesson.title}
                        </span>
                        <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.estimatedMinutes} mins read</span>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">+20 XP</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'translate-x-0.5 text-blue-600' : 'text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600'}`} />
                  </button>
                );
              })}

            {/* If Module has projects, link to Submissions section */}
            {curriculum.projects.filter(p => p.moduleId === activeModuleId).map((proj) => {
              const status = curriculum.submissions.find(s => s.projectId === proj.id)?.status;
              const isApproved = status === 'approved';

              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    setActiveSection('submissions');
                  }}
                  className="w-full text-left p-4 rounded-2xl border border-dashed border-slate-200 hover:border-blue-300 bg-white text-slate-700 shadow-sm transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="mt-0.5">
                      {isApproved ? (
                        <CheckCircle className="w-5 h-5 text-blue-600 fill-blue-500/10" />
                      ) : (
                        <PlayCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider block">
                        Module Project Challenge
                      </span>
                      <span className="text-sm font-bold text-slate-800 block leading-tight group-hover:text-slate-900">
                        {proj.title}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Active Lesson Reader */}
      <div className={`lg:col-span-7 ${!activeLesson ? 'hidden lg:block' : 'block'}`}>
        {activeLesson ? (
          <>
            {/* Inline card — hidden (not unmounted-and-forgotten, just swapped)
                while enlarged, so the layoutId below can animate from here. */}
            {!isEnlarged && (
              <motion.div
                layoutId="lesson-reader-panel"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[calc(100vh-10rem)] shadow-md overflow-hidden"
              >
                {renderReaderPanel(false)}
              </motion.div>
            )}

            {/* Enlarged overlay — rendered via a portal straight onto <body>.
                This is the fix: our nearest positioned ancestor (the page's
                `.animate-fade-in` wrapper) keeps a `transform` around after
                its mount animation finishes (CSS fill-mode: forwards), and
                ANY transform on an ancestor — even a no-op translateY(0) —
                creates a new containing block for `position: fixed`
                descendants. That silently turned our "fixed to the
                viewport" overlay into "fixed to that div" instead, which is
                why the backdrop only covered part of the screen and why
                content got clipped by <main>'s own overflow-y-auto instead
                of scrolling freely. Portaling to document.body sidesteps
                the whole containing-block chain — the standard fix any
                modal/dialog library uses for exactly this reason. */}
            {createPortal(
              <AnimatePresence>
                {isEnlarged && (
                  <>
                    <motion.div
                      key="lesson-reader-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsEnlarged(false)}
                      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm"
                    />
                    <motion.div
                      key="lesson-reader-expanded"
                      layoutId="lesson-reader-panel"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="fixed inset-4 sm:inset-8 lg:inset-16 z-[110] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
                    >
                      {renderReaderPanel(true)}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>,
              document.body
            )}
          </>
        ) : (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center h-96 space-y-4 shadow-sm">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h4 className="font-bold text-slate-900 text-base">Select a Lesson Unit</h4>
              <p className="text-slate-500 text-xs leading-normal">
                Expand any module folder on the left pane and pick a syllabus unit to launch our rich lesson reading interface.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}