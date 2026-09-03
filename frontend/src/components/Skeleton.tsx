import React from 'react';
import { Code } from 'lucide-react';

const shimmer = 'animate-pulse rounded-xl bg-slate-200/80';

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`${shimmer} ${className}`} />;
}

export function SessionBootScreen() {
  return (
    <div
      className="session-boot"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading SkillBridge"
    >
      <div className="session-boot__enter flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/20">
          <Code className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-5 bg-gradient-to-r from-blue-700 via-blue-600 to-orange-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
          SkillBridge
        </p>
        <div className="session-boot__bridge mt-5" aria-hidden />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="mt-4 h-10 w-3/5" />
        <SkeletonBlock className="mt-3 h-4 w-2/3" />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-4 h-8 w-20" />
            <SkeletonBlock className="mt-3 h-3 w-16" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SkeletonBlock className="h-5 w-40" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-12 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SkeletonBlock className="h-5 w-36" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CurriculumSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 animate-fade-in text-slate-800 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-56" />
          <SkeletonBlock className="h-4 w-80" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-10 w-24" />
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="mb-2 h-16 w-full" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-7">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="mt-4 h-4 w-64" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TracksSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="mt-4 h-8 w-56" />
        <SkeletonBlock className="mt-3 h-4 w-2/3" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            <SkeletonBlock className="mt-6 h-6 w-36" />
            <SkeletonBlock className="mt-3 h-4 w-full" />
            <SkeletonBlock className="mt-2 h-4 w-3/4" />
            <div className="mt-6 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <SkeletonBlock key={cardIndex} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="mt-2 h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <SkeletonBlock className="h-6 w-40" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <SkeletonBlock key={cardIndex} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSettingsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="mt-2 h-4 w-72" />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <SkeletonBlock className="h-10 w-56" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
