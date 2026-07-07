import React, { useState } from 'react';
import { User, Track, Module, Lesson, Project, Submission, Progress } from '../types';
import { 
  Award, 
  DollarSign, 
  CheckCircle, 
  BookOpen, 
  Play, 
  ArrowRight, 
  Clock, 
  TrendingUp,
  HelpCircle,
  Briefcase
} from 'lucide-react';

interface DashboardViewProps {
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
  setActiveSection: (section: string) => void;
  setSelectedLessonId: (lessonId: string | null) => void;
  setSelectedProjectId: (projectId: string | null) => void;
}

export default function DashboardView({ 
  user, 
  onUserUpdate, 
  curriculum, 
  setActiveSection, 
  setSelectedLessonId, 
  setSelectedProjectId 
}: DashboardViewProps) {
  
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimAmount, setClaimAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('PayPal');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  // Compute stats
  const totalLessons = curriculum.lessons.length;
  const completedLessons = curriculum.progress.filter(p => p.type === 'lesson' && p.status === 'completed').length;
  
  const totalProjects = curriculum.projects.length;
  const completedProjects = curriculum.progress.filter(p => p.type === 'project' && p.status === 'approved').length;

  // Track completion %
  // Weighted: Lessons are 40% of track, Projects are 60%
  const lessonWeight = totalLessons > 0 ? (completedLessons / totalLessons) * 40 : 0;
  const projectWeight = totalProjects > 0 ? (completedProjects / totalProjects) * 60 : 0;
  const completionPercentage = Math.round(lessonWeight + projectWeight);

  // Determine "Continue where you left off"
  // Find first uncompleted lesson in ordered modules
  const sortedModules = [...curriculum.modules].sort((a, b) => a.order - b.order);
  
  let nextLesson: Lesson | null = null;
  for (const mod of sortedModules) {
    const modLessons = curriculum.lessons
      .filter(l => l.moduleId === mod.id)
      .sort((a, b) => a.order - b.order);
    
    for (const les of modLessons) {
      const isCompleted = curriculum.progress.some(p => p.itemId === les.id && p.type === 'lesson');
      if (!isCompleted) {
        nextLesson = les;
        break;
      }
    }
    if (nextLesson) break;
  }

  // Find first incomplete practice project or capstone project
  let activeProject: Project | null = null;
  const practiceProjects = curriculum.projects.filter(p => p.type === 'practice');
  const capstoneProject = curriculum.projects.find(p => p.type === 'capstone');

  for (const proj of practiceProjects) {
    const status = curriculum.submissions.find(s => s.projectId === proj.id)?.status;
    if (status !== 'approved') {
      activeProject = proj;
      break;
    }
  }

  if (!activeProject && capstoneProject) {
    const status = curriculum.submissions.find(s => s.projectId === capstoneProject.id)?.status;
    if (status !== 'approved') {
      activeProject = capstoneProject;
    }
  }

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(claimAmount);
    if (isNaN(amount) || amount <= 0) {
      setClaimError('Please enter a valid claim amount.');
      return;
    }
    if (amount > user.claimableBalance) {
      setClaimError(`Insufficient balance. You only have $${user.claimableBalance} available.`);
      return;
    }
    if (!payoutDetails) {
      setClaimError('Please provide account details for the payout.');
      return;
    }

    setClaimLoading(true);
    setClaimError('');
    try {
      const res = await fetch('/api/claims/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit claim request.');
      }
      onUserUpdate(data.user);
      setClaimSuccess(true);
      setTimeout(() => {
        setClaimSuccess(false);
        setClaimModalOpen(false);
        setClaimAmount('');
        setPayoutDetails('');
      }, 2500);
    } catch (err: any) {
      setClaimError(err.message);
    } finally {
      setClaimLoading(false);
    }
  };

  // Get current active track metadata
  const activeTrack = curriculum.tracks.find((track) => track.id === curriculum.currentTrackId) || curriculum.tracks[0] || { name: 'Your Current Track', description: '' };

  // Motivation message based on experience / goals
  const getMotivationalHeader = () => {
    const exp = user.profile.experienceLevel;
    const goal = user.profile.goals;
    if (goal.includes('job') || goal.includes('professional')) {
      return `On track for your first Junior Developer job.`;
    } else if (exp.includes('Never coded')) {
      return `Welcome to your engineering foundations. You got this!`;
    }
    return `Level up your backend systems expertise.`;
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-mono text-blue-200 font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/10">
            Active Track: {activeTrack.name}
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-blue-100 text-base leading-relaxed">
            {getMotivationalHeader()} Completing projects unlocks verified, cash-redeemable developer sponsorships.
          </p>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* XP Points */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Total Experience</span>
            <span className="text-2xl font-bold font-mono text-slate-900 block">{user.pointsBalance} XP</span>
            <span className="text-xs text-blue-600 font-medium block">Level {(Math.floor(user.pointsBalance / 200)) + 1} Architect</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Claimable Money */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1.5 flex-1">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Sponsorship Balance</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold font-mono text-slate-900 block">${user.claimableBalance}</span>
              <span className="text-xs text-slate-400 uppercase font-mono">USD</span>
            </div>
            {user.claimableBalance > 0 ? (
              <button
                id="claim-rewards-btn"
                onClick={() => setClaimModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-0.5 mt-1 transition-all"
              >
                <span>Claim Payout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs text-slate-400 block">Unlocked by Capstones</span>
            )}
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Lessons Completed */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Lessons Completed</span>
            <span className="text-2xl font-bold font-mono text-slate-900 block">{completedLessons} / {totalLessons}</span>
            <span className="text-xs text-slate-500 block">
              {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}% module progression
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Projects Completed */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Projects Approved</span>
            <span className="text-2xl font-bold font-mono text-slate-900 block">{completedProjects} / {totalProjects}</span>
            <span className="text-xs text-slate-500 block">
              {curriculum.submissions.filter(s => s.status === 'submitted').length} pending review
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Progress & Active Goal Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Track Completion details */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Track Progress Overview</h3>
              <p className="text-slate-500 text-xs">{activeTrack.name}</p>
            </div>
            <span className="text-2xl font-black font-mono text-blue-600">{completionPercentage}%</span>
          </div>

          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-blue-600 to-indigo-500 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-mono block uppercase">1. Fundamentals</span>
              <span className="font-semibold text-slate-700 block">
                {curriculum.progress.filter(p => p.type === 'lesson' && p.itemId.startsWith('less-1')).length} of 8 complete
              </span>
            </div>
            <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-mono block uppercase">2. Worked Examples</span>
              <span className="font-semibold text-slate-700 block">
                {curriculum.progress.filter(p => p.type === 'lesson' && p.itemId.startsWith('less-worked')).length} of 1 complete
              </span>
            </div>
            <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-mono block uppercase">3. Practice & Capstone</span>
              <span className="font-semibold text-slate-700 block">
                {completedProjects} of {totalProjects} approved
              </span>
            </div>
          </div>
        </div>

        {/* Continue Where Left Off Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-blue-600">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Next Objective</span>
            </div>

            {nextLesson ? (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Next Core Lesson</span>
                <h4 className="font-bold text-slate-900 text-base leading-tight">{nextLesson.title}</h4>
                <div className="flex items-center space-x-2 text-slate-500 text-xs pt-1">
                  <Clock className="w-4 h-4" />
                  <span>~{nextLesson.estimatedMinutes} mins reading</span>
                </div>
              </div>
            ) : activeProject ? (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Pending Project Submission</span>
                <h4 className="font-bold text-slate-900 text-base leading-tight">{activeProject.title}</h4>
                <div className="flex items-center space-x-2 text-slate-500 text-xs pt-1">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Earn {activeProject.rewardPoints} XP</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <h4 className="font-bold text-blue-600 text-base leading-tight">All Tasks Completed!</h4>
                <p className="text-slate-500 text-xs leading-normal">Congratulations, you have navigated the entire pipeline successfully.</p>
              </div>
            )}
          </div>

          <div>
            {nextLesson ? (
              <button
                id="resume-lesson-btn"
                onClick={() => {
                  setSelectedLessonId(nextLesson!.id);
                  setActiveSection('curriculum');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-sm shadow-blue-500/10"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Lesson</span>
              </button>
            ) : activeProject ? (
              <button
                id="resume-project-btn"
                onClick={() => {
                  setSelectedProjectId(activeProject!.id);
                  setActiveSection('submissions');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-sm shadow-blue-500/10"
              >
                <span>Launch Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="review-dashboard-btn"
                onClick={() => setActiveSection('curriculum')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
              >
                <span>Browse Curriculum</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Curriculum Tracks and FAQ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Track Curriculum Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Your Pipeline Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold font-mono text-xs mt-0.5">1</div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Express & Node.js Core (Fundamentals)</h4>
                <p className="text-slate-505 text-xs mt-0.5 leading-normal">8 structured modules covering the request loop, file system, middleware, and standard CRUD servers.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold font-mono text-xs mt-0.5">2</div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Guided Walkthroughs (Worked Examples)</h4>
                <p className="text-slate-505 text-xs mt-0.5 leading-normal">Examine line-by-line of a production-style JSON Notes REST API with automated file persistence.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold font-mono text-xs mt-0.5">3</div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Practice Projects</h4>
                <p className="text-slate-505 text-xs mt-0.5 leading-normal">Build real microservices with validation and advanced database integration to earn immediate developer points.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold font-mono text-xs mt-0.5">4</div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">E-Commerce capstone ($100 Reward)</h4>
                <p className="text-slate-505 text-xs mt-0.5 leading-normal">The final challenge. Implement stock limits, cart transactions, and route encryption for full review and claim payout.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Info / Help */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Verified Sponsorship Sponsorships</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            SkillBridge operates on a **Proof-of-Competency** sponsorship protocol. Real-money payouts (such as our $100 capstone reward) are backed by sponsoring corporations looking to hire junior talent.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 text-xs leading-relaxed">
            <div className="flex space-x-2">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">How do I submit projects?</span>
                <p className="text-slate-500 mt-0.5">Complete any project requirements, push them to a public GitHub repository, and submit the link under the Submissions tab.</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">How does reviews & payout work?</span>
                <p className="text-slate-500 mt-0.5">Our Senior Engineering reviewers evaluate your project within 24 hours. Upon approval, points are credited and the reward is added to your sponsorship balance immediately.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Claim Payout Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <span>Claim Sponsorship Reward</span>
            </h3>

            {claimSuccess ? (
              <div className="p-6 text-center space-y-2 animate-fade-in">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Payout Requested Successfully!</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Our system administration will manually verify your request and disburse your funds to your {payoutMethod} account shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 leading-normal">
                  Request a manual payout. Payout requests are verified and disbursed by team administrators within 2 working days.
                </p>

                {claimError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs">
                    {claimError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Claimable Balance Available
                  </label>
                  <span className="text-2xl font-black font-mono text-slate-900 block">${user.claimableBalance}.00</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Amount to Payout (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">$</span>
                    <input
                      id="claim-amount-input"
                      type="number"
                      required
                      min="1"
                      max={user.claimableBalance}
                      placeholder="100"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Preferred Payout Provider
                  </label>
                  <select
                    id="claim-provider-select"
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="PayPal">PayPal Account</option>
                    <option value="Bank Transfer">Direct Wire Bank Transfer</option>
                    <option value="Stripe Connect">Stripe Payouts</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Account Destination Details
                  </label>
                  <textarea
                    id="claim-details-textarea"
                    required
                    rows={3}
                    placeholder={payoutMethod === 'PayPal' ? 'e.g. email@paypal.com' : 'e.g. Account Number, SWIFT, Name, Routing details'}
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 text-sm placeholder-slate-400"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-slate-100">
                  <button
                    id="claim-cancel-btn"
                    type="button"
                    onClick={() => setClaimModalOpen(false)}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all bg-slate-50 rounded-xl border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    id="claim-confirm-btn"
                    type="submit"
                    disabled={claimLoading}
                    className="flex-1 py-2.5 text-xs font-semibold text-white transition-all bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/10"
                  >
                    {claimLoading ? 'Requesting...' : 'Request Payout'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
