import React, { useEffect, useState } from 'react';
import { Check, Loader2, Monitor, Moon, Save, Settings, Sun, User as UserIcon } from 'lucide-react';
import { avatarPresets } from '../avatarPresets';
import { User } from '../types';

interface Props {
  user: User;
  onUserUpdate: (user: User) => void;
}

type AppearanceMode = 'system' | 'dark' | 'light';

const appearanceOptions: Array<{ value: AppearanceMode; label: string; icon: React.ElementType }> = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun }
];

export default function AdminSettingsView({ user, onUserUpdate }: Props) {
  const [name, setName] = useState(user.name);
  const [avatarId, setAvatarId] = useState(user.profile.avatarId || avatarPresets[0].id);
  const [appearance, setAppearance] = useState<AppearanceMode>(user.profile.appearance || 'system');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setName(user.name);
    setAvatarId(user.profile.avatarId || avatarPresets[0].id);
    setAppearance(user.profile.appearance || 'system');
  }, [user]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyThemePreview = () => {
      const resolvedTheme = appearance === 'system'
        ? (mediaQuery.matches ? 'dark' : 'light')
        : appearance;

      document.documentElement.dataset.theme = resolvedTheme;
    };

    applyThemePreview();

    if (appearance === 'system') {
      mediaQuery.addEventListener('change', applyThemePreview);
      return () => mediaQuery.removeEventListener('change', applyThemePreview);
    }
  }, [appearance]);

  const buildProfilePayload = () => ({
    name: name.trim(),
    avatarId,
    appearance,
    bio: user.profile.bio || '',
    currentRole: user.profile.currentRole || '',
    githubUrl: user.profile.githubUrl || '',
    linkedinUrl: user.profile.linkedinUrl || '',
    portfolioUrl: user.profile.portfolioUrl || '',
    resumeUrl: user.profile.resumeUrl || '',
    skills: user.profile.skills || [],
    experienceLevel: user.profile.experienceLevel || '',
    goals: user.profile.goals || '',
    timeCommitment: user.profile.timeCommitment || '',
    country: user.profile.country || '',
    privacy: user.profile.privacy || {
      publicProfile: true,
      showExternalLinks: true,
      showProgressBadges: true
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildProfilePayload())
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      onUserUpdate(data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in text-slate-800 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500">Manage your admin profile and workspace preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <aside className="bg-white border border-slate-200 rounded-2xl p-2 h-max shadow-sm">
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer bg-blue-50 text-blue-700 font-bold"
          >
            <span className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              General
            </span>
          </button>
        </aside>

        <section className="min-w-0">
          {error && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm shadow-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm flex items-center gap-2 shadow-sm">
              <Check className="w-4 h-4" />
              <span>Settings saved.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-slate-950">General</h2>
              </div>

              <div className="mt-5 space-y-5">
                <div className="space-y-3">
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                    Avatar
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {avatarPresets.map((avatar) => {
                      const isSelected = avatarId === avatar.id;

                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setAvatarId(avatar.id)}
                          className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected ? 'border-blue-600 ring-4 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                          }`}
                          title={avatar.label}
                        >
                          <img src={avatar.src} alt={avatar.label} className="w-full h-full object-cover" />
                          {isSelected && (
                            <span className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                    Appearance
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {appearanceOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = appearance === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setAppearance(option.value)}
                          className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-xl text-sm font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-blue-200 text-blue-700 ring-4 ring-blue-50'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/10 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /><span>Save Settings</span></>}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
