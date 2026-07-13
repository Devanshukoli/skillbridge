import React, { useEffect, useState } from 'react';
import { ManualPayoutDetails, User } from '../types';
import { avatarPresets } from '../avatarPresets';
import { useStripeConnect } from '../hooks/useStripeConnect';
import {
  Award,
  BriefcaseBusiness,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Github,
  Globe,
  Linkedin,
  Lock,
  Loader2,
  Mail,
  Monitor,
  Moon,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Sun,
  Tag,
  User as UserIcon,
  X
} from 'lucide-react';

interface SettingsViewProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

type SettingsTab = 'general' | 'account' | 'privacy' | 'payment';
type AppearanceMode = 'system' | 'dark' | 'light';

const experienceOptions = [
  'Never coded professionally',
  'Built personal projects',
  'Have internship experience'
];

const goalOptions = [
  'Get my first job',
  'Prepare for a specific offer',
  'Just leveling up / curiosity'
];

const commitmentOptions = [
  'Casual ~2-3 hrs',
  'Regular ~5-8 hrs',
  'Intensive 10+ hrs'
];

const appearanceOptions: Array<{ value: AppearanceMode; label: string; icon: React.ElementType }> = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun }
];

const countryOptions = ['','US','IN','AE','TH','GB','CA','DE','AU','SG'];

export default function SettingsView({ user, onUserUpdate }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('settings') === 'payment' ? 'payment' : 'general';
  });
  const [name, setName] = useState(user.name);
  const [avatarId, setAvatarId] = useState(user.profile.avatarId || avatarPresets[0].id);
  const [bio, setBio] = useState(user.profile.bio || '');
  const [currentRole, setCurrentRole] = useState(user.profile.currentRole || '');
  const [githubUrl, setGithubUrl] = useState(user.profile.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user.profile.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user.profile.portfolioUrl || '');
  const [resumeUrl, setResumeUrl] = useState(user.profile.resumeUrl || '');
  const [skills, setSkills] = useState<string[]>(user.profile.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [experienceLevel, setExperienceLevel] = useState(user.profile.experienceLevel || experienceOptions[0]);
  const [goals, setGoals] = useState(user.profile.goals || goalOptions[0]);
  const [timeCommitment, setTimeCommitment] = useState(user.profile.timeCommitment || commitmentOptions[0]);
  const [appearance, setAppearance] = useState<AppearanceMode>(user.profile.appearance || 'system');
  const [publicProfile, setPublicProfile] = useState(user.profile.privacy?.publicProfile ?? true);
  const [showExternalLinks, setShowExternalLinks] = useState(user.profile.privacy?.showExternalLinks ?? true);
  const [showProgressBadges, setShowProgressBadges] = useState(user.profile.privacy?.showProgressBadges ?? true);
  const [country, setCountry] = useState(user.profile.country || '');
  const [manualPayoutType, setManualPayoutType] = useState<'bank' | 'upi' | 'paypal'>(user.manualPayoutDetails?.type || 'bank');
  const [manualAccountName, setManualAccountName] = useState(user.manualPayoutDetails?.accountName || '');
  const [manualAccountNumber, setManualAccountNumber] = useState(user.manualPayoutDetails?.accountNumber || '');
  const [manualIfsc, setManualIfsc] = useState(user.manualPayoutDetails?.ifsc || '');
  const [manualUpiId, setManualUpiId] = useState(user.manualPayoutDetails?.upiId || '');
  const [manualPayPalEmail, setManualPayPalEmail] = useState(user.manualPayoutDetails?.paypalEmail || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const stripeConnect = useStripeConnect(true);

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

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ElementType }> = [
    { id: 'general', label: 'General', icon: UserIcon },
    { id: 'account', label: 'Account', icon: Mail },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'payment', label: 'Payment', icon: CreditCard }
  ];

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.some((skill) => skill.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const buildProfilePayload = () => ({
    name: name.trim(),
    avatarId,
    bio,
    currentRole,
    githubUrl,
    linkedinUrl,
    portfolioUrl,
    resumeUrl,
    skills,
    experienceLevel,
    goals,
    timeCommitment,
    appearance,
    country,
    privacy: {
      publicProfile,
      showExternalLinks,
      showProgressBadges
    }
  });

  const persistProfile = async () => {
    if (!name.trim()) {
      setError('Full name is required.');
      return false;
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
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistProfile();
  };

  const handleCountryChange = async (nextCountry: string) => {
    setCountry(nextCountry);
    const payload = buildProfilePayload();
    payload.country = nextCountry;

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update country');
      }
      onUserUpdate(data.user);
      await stripeConnect.fetchPaymentStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleManualPayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const details: ManualPayoutDetails = { type: manualPayoutType } as ManualPayoutDetails;

    if (manualPayoutType === 'bank') {
      details.accountName = manualAccountName;
      details.accountNumber = manualAccountNumber;
      details.ifsc = manualIfsc;
    }

    if (manualPayoutType === 'upi') {
      details.upiId = manualUpiId;
    }

    if (manualPayoutType === 'paypal') {
      details.paypalEmail = manualPayPalEmail;
    }

    try {
      await stripeConnect.setManualPayout(details);
      await stripeConnect.fetchPaymentStatus();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const stripeStatus = stripeConnect.status;
  const stripeLastUpdated = stripeStatus.stripeUpdatedAt
    ? new Date(stripeStatus.stripeUpdatedAt).toLocaleString()
    : 'Not updated yet';
  const isUnsupportedCountry = Boolean(country && stripeConnect.unsupportedCountries.includes(country.toUpperCase()));
  const paymentMethodLabel = stripeConnect.paymentStatus?.method === 'manual' ? 'Manual' : 'Stripe';
  const paymentReadinessLabel = stripeConnect.paymentStatus?.ready ? 'Ready' : 'Needs setup';

  return (
    <div className="max-w-6xl mx-auto animate-fade-in text-slate-800 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500">Manage your profile, account, privacy, and workspace preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <aside className="bg-white border border-slate-200 rounded-2xl p-2 h-max shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </span>
              </button>
            );
          })}
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

          {activeTab === 'general' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-slate-950">Profile</h2>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        id="settings-name-input"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                        Professional Headline
                      </label>
                      <div className="relative">
                        <BriefcaseBusiness className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="settings-headline-input"
                          type="text"
                          placeholder="Software Engineer"
                          value={currentRole}
                          onChange={(e) => setCurrentRole(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm placeholder-slate-400 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                      About / Bio
                    </label>
                    <textarea
                      id="settings-bio-textarea"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm leading-relaxed placeholder-slate-400 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LinkInput id="settings-github-input" label="GitHub" icon={Github} value={githubUrl} onChange={setGithubUrl} placeholder="https://github.com/username" />
                    <LinkInput id="settings-linkedin-input" label="LinkedIn" icon={Linkedin} value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/username" />
                    <LinkInput id="settings-portfolio-input" label="Personal Portfolio" icon={Globe} value={portfolioUrl} onChange={setPortfolioUrl} placeholder="https://portfolio.dev" />
                    <LinkInput id="settings-resume-input" label="Resume Drive Link" icon={FileText} value={resumeUrl} onChange={setResumeUrl} placeholder="https://drive.google.com/file/..." />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-slate-950">Skills & Goals</h2>
                </div>

                <div className="mt-5 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                  <div className="space-y-3">
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                      Skill Badges
                    </label>
                    <div className="flex flex-wrap gap-2 p-3.5 bg-slate-50 border border-slate-100 rounded-xl min-h-24">
                      {skills.map((skill) => (
                        <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
                            title={`Remove ${skill}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {skills.length === 0 && (
                        <span className="text-xs text-slate-400 self-center">No skills added yet.</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="settings-skill-input"
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="e.g. Postgres"
                        className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
                        title="Add skill"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SelectField id="settings-experience-select" label="Experience Level" icon={Award} value={experienceLevel} options={experienceOptions} onChange={setExperienceLevel} />
                    <SelectField id="settings-goals-select" label="Career Goals" icon={BriefcaseBusiness} value={goals} options={goalOptions} onChange={setGoals} />
                    <SelectField id="settings-commitment-select" label="Time Commitment" icon={Clock} value={timeCommitment} options={commitmentOptions} onChange={setTimeCommitment} />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-slate-950">Appearance</h2>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {appearanceOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = appearance === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAppearance(option.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  id="settings-save-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/10 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /><span>Save Settings</span></>}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-slate-950">Account</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ReadOnlyField label="Email" value={user.email} />
                  <ReadOnlyField label="Role" value={user.role} />
                  <ReadOnlyField label="User ID" value={user.id} />
                  <ReadOnlyField label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-slate-950">Change Password</h2>
                </div>

                {passwordError && (
                  <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-700">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700">
                    Password updated successfully.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/10 cursor-pointer"
                  >
                    {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4" /><span>Update Password</span></>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'privacy' && (
            <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Lock className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-slate-950">Privacy</h2>
              </div>

              <div className="space-y-3">
                <ToggleRow label="Public profile" checked={publicProfile} onChange={setPublicProfile} />
                <ToggleRow label="Show external links" checked={showExternalLinks} onChange={setShowExternalLinks} />
                <ToggleRow label="Show progress badges" checked={showProgressBadges} onChange={setShowProgressBadges} />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/10 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /><span>Save Privacy</span></>}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'payment' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-950">Payment</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Choose how you want to receive rewards. Stripe is available in supported regions, and manual payout details work as a fallback.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void stripeConnect.refresh()}
                  disabled={stripeConnect.loading}
                  className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${stripeConnect.loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {stripeConnect.error && (
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-700">
                  {stripeConnect.error}
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => { void handleCountryChange(e.target.value); }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm cursor-pointer"
                >
                  {countryOptions.map((option) => (
                    <option key={option || 'select'} value={option}>
                      {option ? option : 'Select your country'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyField label="Payout Method" value={paymentMethodLabel} />
                <ReadOnlyField label="Readiness" value={paymentReadinessLabel} />
                <ReadOnlyField label="Country" value={country || 'Select your country'} />
                <ReadOnlyField label="Last Updated" value={stripeLastUpdated} />
              </div>

              {stripeConnect.paymentStatus?.reason && (
                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50 text-sm text-amber-700">
                  {stripeConnect.paymentStatus.reason}
                </div>
              )}

              {!country ? (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
                  Select your country to determine your payout setup.
                </div>
              ) : isUnsupportedCountry ? (
                <form onSubmit={handleManualPayoutSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Manual Payout Details</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Stripe self-serve onboarding is not available in your country. Add manual payout details to claim rewards.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">Payout Type</label>
                    <select
                      value={manualPayoutType}
                      onChange={(e) => setManualPayoutType(e.target.value as 'bank' | 'upi' | 'paypal')}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm cursor-pointer"
                    >
                      <option value="bank">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>

                  {manualPayoutType === 'bank' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">Account Name</label>
                        <input value={manualAccountName} onChange={(e) => setManualAccountName(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">Account Number</label>
                        <input value={manualAccountNumber} onChange={(e) => setManualAccountNumber(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">IFSC</label>
                        <input value={manualIfsc} onChange={(e) => setManualIfsc(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                      </div>
                    </div>
                  )}

                  {manualPayoutType === 'upi' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">UPI ID</label>
                      <input value={manualUpiId} onChange={(e) => setManualUpiId(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                    </div>
                  )}

                  {manualPayoutType === 'paypal' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">PayPal Email</label>
                      <input type="email" value={manualPayPalEmail} onChange={(e) => setManualPayPalEmail(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
                    </div>
                  )}

                  <button type="submit" disabled={stripeConnect.loading} className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/10 cursor-pointer">
                    {stripeConnect.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /><span>Save Manual Payout Details</span></>}
                  </button>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PaymentStatusField label="Status" value={stripeStatus.connected ? 'Connected' : 'Not Connected'} active={stripeStatus.connected} />
                    <ReadOnlyField label="Account ID" value={stripeStatus.stripeAccountId || 'Not created yet'} />
                    <PaymentStatusField label="Payouts" value={stripeStatus.payoutsEnabled ? 'Enabled' : 'Not Enabled'} active={stripeStatus.payoutsEnabled} />
                    <PaymentStatusField label="Charges" value={stripeStatus.chargesEnabled ? 'Enabled' : 'Not Enabled'} active={stripeStatus.chargesEnabled} />
                    <PaymentStatusField label="Onboarding" value={stripeStatus.onboardingCompleted ? 'Completed' : 'Incomplete'} active={stripeStatus.onboardingCompleted} />
                  </div>

                  {stripeStatus.requirementsCurrentlyDue && stripeStatus.requirementsCurrentlyDue.length > 0 && (
                    <div className="p-4 rounded-xl border border-amber-100 bg-amber-50 text-sm text-amber-700">
                      Stripe needs more onboarding information before payouts can be enabled.
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => void stripeConnect.connect()}
                      disabled={stripeConnect.loading}
                      className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/10 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{stripeStatus.stripeAccountId ? 'Continue Stripe Onboarding' : 'Connect Stripe'}</span>
                    </button>
                    {stripeStatus.stripeAccountId && !stripeStatus.payoutsEnabled && (
                      <button
                        type="button"
                        onClick={() => void stripeConnect.disconnect()}
                        disabled={stripeConnect.loading}
                        className="w-full sm:w-auto px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface LinkInputProps {
  id: string;
  label: string;
  icon: React.ElementType;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

function LinkInput({ id, label, icon: Icon, value, placeholder, onChange }: LinkInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id={id}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm font-mono focus:bg-white transition-colors"
        />
      </div>
    </div>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  icon: React.ElementType;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function SelectField({ id, label, icon: Icon, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-mono text-slate-500 uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <span>{label}</span>
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="min-h-11 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 break-all">
        {value}
      </div>
    </div>
  );
}

function PaymentStatusField({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="min-h-11 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        <span>{value}</span>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${checked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 hover:bg-slate-400'}`}
      >
        <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
