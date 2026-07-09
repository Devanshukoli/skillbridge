import React from 'react';

const shimmer = 'animate-pulse rounded-xl bg-slate-200/80';

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`${shimmer} ${className}`} />;
}

export function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-10 text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 lg:w-72">
          <SkeletonBlock className="h-8 w-24" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <SkeletonBlock className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="mt-4 h-10 w-3/4" />
            <SkeletonBlock className="mt-3 h-4 w-2/3" />
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="mt-4 h-8 w-20" />
                <SkeletonBlock className="mt-3 h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
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
