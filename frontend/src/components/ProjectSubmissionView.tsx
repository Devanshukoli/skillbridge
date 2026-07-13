import React, { useState, useEffect } from 'react';
import { User, Track, Module, Lesson, Project, Submission, Progress } from '../types';
import {
  Award,
  Github,
  Globe,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  ChevronRight,
  Sparkles,
  DollarSign,
  ArrowLeft,
  XCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';

interface ProjectSubmissionViewProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  curriculum: {
    tracks: Track[];
    modules: Module[];
    lessons: Lesson[];
    projects: Project[];
    progress: Progress[];
    submissions: Submission[];
  };
  onRefreshCurriculum: () => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (projectId: string | null) => void;
}

export default function ProjectSubmissionView({
  user,
  onUserUpdate,
  curriculum,
  onRefreshCurriculum,
  selectedProjectId,
  setSelectedProjectId
}: ProjectSubmissionViewProps) {
  
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [writeup, setWriteup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Set selected project initially if not provided
  useEffect(() => {
    if (!selectedProjectId && curriculum.projects.length > 0) {
      setSelectedProjectId(curriculum.projects[0].id);
    }
  }, [curriculum.projects, selectedProjectId]);

  const activeProject = curriculum.projects.find(p => p.id === selectedProjectId) || null;
  const activeSubmission = activeProject 
    ? [...curriculum.submissions].filter(s => s.projectId === activeProject.id).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0] || null
    : null;

  // Sync inputs on project change
  useEffect(() => {
    if (activeProject) {
      setRepoUrl(activeSubmission ? activeSubmission.repoUrl : '');
      setDemoUrl(activeSubmission ? activeSubmission.demoUrl || '' : '');
      setWriteup(activeSubmission ? activeSubmission.writeup : '');
      setError('');
      setSuccess(false);
    }
  }, [selectedProjectId, activeSubmission]);

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    if (!repoUrl) {
      setError('Please provide your GitHub repository URL.');
      return;
    }
    if (!writeup || writeup.trim().length < 20) {
      setError('Please provide a substantial write-up of your engineering decisions (minimum 20 characters).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProject.id,
          repoUrl,
          demoUrl,
          writeup
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit project');
      }

      setSuccess(true);
      onRefreshCurriculum();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="bg-amber-50 border border-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-mono font-semibold">
            Pending Review
          </span>
        );
      case 'in_review':
        return (
          <span className="bg-sky-50 border border-sky-100 text-sky-700 text-xs px-3 py-1 rounded-full font-mono font-semibold">
            Active Review
          </span>
        );
      case 'approved':
        return (
          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-mono font-semibold flex items-center space-x-1 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Passed & Credited</span>
          </span>
        );
      case 'changes_requested':
        return (
          <span className="bg-orange-50 border border-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-mono font-semibold flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
            <span>Changes Requested</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-3 py-1 rounded-full font-mono font-semibold flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-slate-800">
      
      {/* LEFT COLUMN: Challenges List */}
      <div className={`lg:col-span-4 space-y-6 ${activeProject ? 'hidden lg:block' : 'block'}`}>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Pipelines</h2>
          <p className="text-slate-500 text-sm">Convert theoretical knowledge into verified code portfolios.</p>
        </div>

        <div className="space-y-3">
          {curriculum.projects.map((proj) => {
            const isSelected = activeProject?.id === proj.id;
            const sub = [...curriculum.submissions].filter(s => s.projectId === proj.id).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0] || null;
            const status = sub?.status || 'not_started';

            return (
              <button
                key={proj.id}
                id={`project-item-${proj.id}`}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`
                  w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between group h-36 cursor-pointer
                  ${isSelected 
                    ? 'bg-blue-50/50 border-blue-500 shadow-sm text-slate-900' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm transition-colors'
                  }
                `}
              >
                <div className="w-full">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                      proj.type === 'capstone' 
                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {proj.type} Project
                    </span>
                    
                    {/* Status Dot */}
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      status === 'approved' ? 'text-emerald-600 font-semibold' :
                      status === 'submitted' ? 'text-amber-600 font-semibold' :
                      status === 'changes_requested' ? 'text-orange-600 font-semibold' : 'text-slate-400'
                    }`}>
                      {status === 'not_started' ? 'Not Started' : status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold truncate leading-tight ${isSelected ? 'text-blue-950' : 'text-slate-800 group-hover:text-slate-900'}`}>
                    {proj.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs">
                  <span className="font-mono text-emerald-600 font-bold">+{proj.rewardPoints} XP</span>
                  {proj.type === 'capstone' && proj.rewardMoney && (
                    <span className="font-mono text-amber-600 font-bold flex items-center">
                      <DollarSign className="w-3 h-3" />
                      <span>{proj.rewardMoney} Sponsorship</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Selected Project Spec & Submission Panel */}
      <div className={`lg:col-span-8 ${!activeProject ? 'hidden lg:block' : 'block'}`}>
        {activeProject ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-8 shadow-md">
            
            {/* Top specs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setSelectedProjectId(null)}
                  className="p-1.5 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 rounded-xl border border-slate-200 lg:hidden flex items-center space-x-1 text-xs transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <div className="flex items-center space-x-2.5">
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    activeProject.type === 'capstone' 
                      ? 'bg-amber-50 text-amber-700 border-amber-100' 
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {activeProject.type} spec
                  </span>
                  {activeSubmission && getStatusBadge(activeSubmission.status)}
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {activeProject.title}
                </h1>
                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                  {activeProject.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Syllabus XP Value</span>
                  <span className="font-bold font-mono text-emerald-600 text-sm mt-0.5 block">+{activeProject.rewardPoints} Points</span>
                </div>
                {activeProject.type === 'capstone' && activeProject.rewardMoney && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Sponsorship cash</span>
                    <span className="font-bold font-mono text-amber-600 text-sm mt-0.5 block">${activeProject.rewardMoney} Claimable</span>
                  </div>
                )}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Estimated Effort</span>
                  <span className="font-bold font-mono text-blue-600 text-sm mt-0.5 block">
                    {activeProject.type === 'capstone' ? '2-3 days' : '2-4 hours'}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist requirements & Rubrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Requirements */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Functional Requirements</span>
                </h4>
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {activeProject.requirements.map((req, i) => (
                    <div key={i} className="flex items-start space-x-2.5 text-xs">
                      <span className="text-emerald-700 font-mono font-bold text-[10px] bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded mt-0.5 select-none">{i+1}</span>
                      <p className="text-slate-600 leading-normal flex-1">{req}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rubric evaluation */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Review Grading Rubric</span>
                </h4>
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {activeProject.rubric.map((rub, i) => (
                    <div key={i} className="flex items-start space-x-2.5 text-xs">
                      <span className="text-blue-500 font-bold mt-0.5 select-none">❖</span>
                      <p className="text-slate-600 leading-normal flex-1">{rub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FEEDBACK LOGS IF EXISTS */}
            {activeSubmission?.reviewerFeedback && (
              <div className={`p-5 rounded-2xl border ${
                activeSubmission.status === 'approved' 
                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' 
                  : 'bg-orange-50 border border-orange-100 text-orange-800'
              } space-y-2.5 shadow-sm`}>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-bold text-sm">Reviewer Evaluations & Feedback:</span>
                </div>
                <p className="text-xs text-slate-700 italic whitespace-pre-wrap leading-relaxed">
                  "{activeSubmission.reviewerFeedback}"
                </p>
                <div className="text-[10px] font-mono text-slate-400">
                  Reviewed on {new Date(activeSubmission.reviewedAt || '').toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Submission Form OR Congratulations message */}
            <div className="pt-6 border-t border-slate-100">
              {activeSubmission?.status === 'approved' ? (
                <div className="p-8 text-center bg-emerald-50 border border-emerald-100 rounded-2xl space-y-4 shadow-sm">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto fill-emerald-500/5" />
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900">Project Approved & Closed!</h3>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto leading-normal">
                      Excellent work! You have successfully passed all rubrics for this challenge. The associated {activeProject.rewardPoints} XP points{activeProject.type === 'capstone' ? ` and $${activeProject.rewardMoney} cash` : ''} has been credited to your profile.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3 pt-2">
                    <a
                      href={activeSubmission.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
                    >
                      <Github className="w-4 h-4" />
                      <span>View Submitted Repo</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitProject} className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Submit Your Solutions</h3>
                    <p className="text-slate-500 text-xs">Fill in your repository and architecture decisions to notify reviewing administrators.</p>
                  </div>

                  {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm animate-fade-in shadow-sm">
                      Your solution was submitted successfully! Reviewers will evaluate it against the rubrics shortly.
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm animate-fade-in shadow-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                        GitHub Repository URL *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Github className="w-4 h-4" />
                        </div>
                        <input
                          id="submit-repo-input"
                          type="url"
                          required
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          placeholder="https://github.com/username/repo-name"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Live Demo URL (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <input
                          id="submit-demo-input"
                          type="url"
                          value={demoUrl}
                          onChange={(e) => setDemoUrl(e.target.value)}
                          placeholder="https://my-app.railway.app"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Engineering Approach & Trade-offs Write-up *
                    </label>
                    <textarea
                      id="submit-writeup-textarea"
                      required
                      rows={5}
                      value={writeup}
                      onChange={(e) => setWriteup(e.target.value)}
                      placeholder="Outline your database design, middleware choices, routes validation structures, and any specific architectural decisions you made to satisfy rubrics. (Min 20 characters)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm leading-relaxed focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Resubmissions are always allowed if revision is requested!</span>
                    </div>

                    <button
                      id="submit-project-btn"
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-sm shadow-blue-500/10 cursor-pointer"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /><span>{activeSubmission ? 'Re-Submit Solution' : 'Submit Project for Review'}</span></>}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        ) : (
          /* Empty state */
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center h-96 space-y-4 shadow-sm">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h4 className="font-bold text-slate-900 text-base">Select a Challenge Pipeline</h4>
              <p className="text-slate-500 text-xs leading-normal">
                Pick a practice or capstone challenge from the left pane to view requirements, rubrics, and launch submission forms.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}