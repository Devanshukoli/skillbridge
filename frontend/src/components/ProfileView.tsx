import React, { useState } from 'react';
import { User } from '../types';
import { 
  Github, 
  Linkedin, 
  Globe, 
  FileText, 
  Plus, 
  X, 
  Save, 
  Award, 
  TrendingUp, 
  Clock, 
  Check,
  Tag
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export default function ProfileView({ user, onUserUpdate }: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.profile.bio || '');
  const [currentRole, setCurrentRole] = useState(user.profile.currentRole || '');
  const [githubUrl, setGithubUrl] = useState(user.profile.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user.profile.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user.profile.portfolioUrl || '');
  const [resumeUrl, setResumeUrl] = useState(user.profile.resumeUrl || '');
  
  const [experienceLevel, setExperienceLevel] = useState(user.profile.experienceLevel);
  const [goals, setGoals] = useState(user.profile.goals);
  const [timeCommitment, setTimeCommitment] = useState(user.profile.timeCommitment);

  // Skill tags state
  const [skills, setSkills] = useState<string[]>(user.profile.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill) return;
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Name is required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bio,
          currentRole,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
          resumeUrl,
          skills,
          goals,
          timeCommitment
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-800">
      
      {/* Header Profile Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse" />
        
        {/* Big Avatar */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-blue-500/10 z-10">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="text-center md:text-left space-y-2 z-10 flex-1 min-w-0">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">{user.name}</h1>
            <p className="text-slate-500 text-sm font-medium">
              {currentRole || 'Student / Aspiring Junior Backend Engineer'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-1">
            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-mono font-medium">
              Level {Math.floor(user.pointsBalance / 200) + 1}
            </span>
            <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold">
              {user.pointsBalance} XP
            </span>
            <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold">
              ${user.claimableBalance} Sponsorships
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm shadow-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm flex items-center space-x-2 shadow-sm">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Your portfolio has been updated successfully!</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Metadata */}
        <div className="space-y-6 md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
            Professional Profile
          </h3>

          <div className="space-y-4">
            {/* Full name & headline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  id="profile-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                  Professional Headline
                </label>
                <input
                  id="profile-role-input"
                  type="text"
                  placeholder="e.g. CS Student / Freelance Developer"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm placeholder-slate-400 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Custom Bio */}
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">
                About / Bio
              </label>
              <textarea
                id="profile-bio-textarea"
                rows={4}
                placeholder="Share a short introduction of your backend interests, projects, and what you are actively studying."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm leading-relaxed placeholder-slate-400 focus:bg-white transition-colors"
              />
            </div>

            {/* Integrations URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-505 uppercase tracking-wider">
                  GitHub Profile URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Github className="w-4 h-4" />
                  </div>
                  <input
                    id="profile-github-input"
                    type="url"
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm font-mono focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-505 uppercase tracking-wider">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <input
                    id="profile-linkedin-input"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm font-mono focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-505 uppercase tracking-wider">
                  Personal Portfolio URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    id="profile-portfolio-input"
                    type="url"
                    placeholder="https://mywebsite.com"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm font-mono focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-505 uppercase tracking-wider">
                  Resume Link / URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    id="profile-resume-input"
                    type="url"
                    placeholder="https://drive.google.com/resume.pdf"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm font-mono focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Skill Tags & Education Specifications */}
        <div className="space-y-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase font-mono pb-3 border-b border-slate-100">
            Skills & Goals
          </h3>

          {/* Skill Tag Builder */}
          <div className="space-y-3">
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Skill Badges</span>
            </label>
            
            <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl min-h-24">
              {skills.map((skill) => (
                <span key={skill} className="bg-blue-50 hover:bg-blue-100/80 text-blue-700 border border-blue-100 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-blue-200/50 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-400 self-center mx-auto">No skills added yet.</span>
              )}
            </div>

            <div className="flex space-x-1.5">
              <input
                id="profile-skill-input"
                type="text"
                placeholder="e.g. Postgres"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Onboarding updates */}
          <div className="space-y-3.5 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Experience Level</span>
              </label>
              <select
                id="profile-experience-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Never coded professionally">Never coded professionally</option>
                <option value="Built personal projects">Built personal projects</option>
                <option value="Have internship experience">Have internship experience</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-505 uppercase tracking-wider flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                <span>Career Goals</span>
              </label>
              <select
                id="profile-goals-select"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Get my first job">Get my first job</option>
                <option value="Prepare for a specific offer">Prepare for a specific offer</option>
                <option value="Just leveling up / curiosity">Just leveling up</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-550 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Time Commitment</span>
              </label>
              <select
                id="profile-commitment-select"
                value={timeCommitment}
                onChange={(e) => setTimeCommitment(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Casual ~2-3 hrs">Casual (~2-3 hrs/wk)</option>
                <option value="Regular ~5-8 hrs">Regular (~5-8 hrs/wk)</option>
                <option value="Intensive 10+ hrs">Intensive (10+ hrs/wk)</option>
              </select>
            </div>
          </div>

          <button
            id="profile-save-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-sm shadow-blue-500/10"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Portfolio'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
