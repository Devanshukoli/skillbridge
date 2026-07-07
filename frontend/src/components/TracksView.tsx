import React from 'react';
import { Track, Module, Lesson, Progress } from '../types';
import { Server, Database, Layers, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface TracksViewProps {
  curriculum: {
    tracks: Track[];
    modules: Module[];
    lessons: Lesson[];
    progress: Progress[];
  };
  onViewTrack: (trackId: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Server,
  Database,
  Layers,
  BookOpen,
  Sparkles
};

export default function TracksView({ curriculum, onViewTrack }: TracksViewProps) {
  const trackSummaries = curriculum.tracks.map((track) => {
    const moduleCount = curriculum.modules.filter((mod) => mod.trackId === track.id).length;
    const lessonCount = curriculum.lessons.filter((lesson) => {
      const module = curriculum.modules.find((mod) => mod.id === lesson.moduleId);
      return module?.trackId === track.id;
    }).length;

    const completedCount = curriculum.progress.filter((item) => {
      if (item.type !== 'lesson') return false;
      const lesson = curriculum.lessons.find((l) => l.id === item.itemId);
      const module = lesson ? curriculum.modules.find((mod) => mod.id === lesson.moduleId) : undefined;
      return module?.trackId === track.id;
    }).length;

    return {
      track,
      moduleCount,
      lessonCount,
      completedCount,
      started: completedCount > 0
    };
  });

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm text-blue-600 uppercase tracking-[0.3em] font-semibold">Explore Tracks</p>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900">All learning paths</h1>
            <p className="mt-3 text-sm text-slate-500 max-w-2xl">
              Browse all available tracks, including newly added curriculum paths. Preview any track to inspect its modules and lessons in the Curriculum tab.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 border border-slate-200 p-6 shadow-sm max-w-lg">
            <p className="text-sm font-semibold text-slate-800">Need a recommendation?</p>
            <p className="mt-3 text-sm text-slate-500">If you're already working through a track, keep going there. Otherwise explore a new path and come back to your active curriculum when you're ready.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trackSummaries.map(({ track, moduleCount, lessonCount, completedCount, started }) => {
          const Icon = iconMap[track.icon] || Layers;
          return (
            <div key={track.id} className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 inline-flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase font-semibold tracking-[0.2em] text-slate-500">
                  {started ? 'Started' : 'New'}
                </span>
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-bold text-slate-900">{track.name}</h2>
                <p className="mt-3 text-sm text-slate-500 leading-6">{track.description}</p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-slate-500 text-xs font-semibold uppercase tracking-[0.15em]">
                <div className="rounded-2xl bg-slate-50 p-3 text-center">
                  <span className="block text-base text-slate-900">{moduleCount}</span>
                  modules
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-center">
                  <span className="block text-base text-slate-900">{lessonCount}</span>
                  lessons
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-center">
                  <span className="block text-base text-slate-900">{completedCount}</span>
                  completed
                </div>
              </div>
              <button
                onClick={() => onViewTrack(track.id)}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Preview track
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
