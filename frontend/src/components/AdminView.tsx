import React, { useState, useEffect } from 'react';
import { User, Submission, Claim } from '../types';
import { 
  ClipboardCheck, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Github, 
  Globe, 
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  XCircle,
  Check
} from 'lucide-react';

interface AdminViewProps {
  user: User;
  onRefreshCurriculum: () => void;
}

export default function AdminView({ user, onRefreshCurriculum }: AdminViewProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'claims'>('submissions');
  const [filterStatus, setFilterStatus] = useState<string>('submitted'); // submitted, approved, changes_requested, all
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const [payLoadingId, setPayLoadingId] = useState<string | null>(null);

  // Fetch admin data
  const fetchAdminData = async () => {
    try {
      const subRes = await fetch('/api/admin/submissions');
      const subData = await subRes.json();
      if (subRes.ok) {
        setSubmissions(subData);
      }

      const claimRes = await fetch('/api/admin/claims');
      const claimData = await claimRes.json();
      if (claimRes.ok) {
        setClaims(claimData);
      }
    } catch (err) {
      console.error('Error fetching admin back office details', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const handleReviewSubmit = async (status: 'approved' | 'changes_requested' | 'rejected') => {
    if (!selectedSubId) return;
    if (!feedback) {
      setReviewError('Please provide evaluation feedback/rubric review text.');
      return;
    }

    setReviewLoading(true);
    setReviewError('');
    try {
      const res = await fetch(`/api/admin/submissions/${selectedSubId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to review submission');
      }

      setReviewSuccess(true);
      fetchAdminData();
      onRefreshCurriculum();
      
      setTimeout(() => {
        setReviewSuccess(false);
        setSelectedSubId(null);
        setFeedback('');
      }, 2000);

    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handlePayClaim = async (claimId: string) => {
    setPayLoadingId(claimId);
    try {
      const res = await fetch(`/api/admin/claims/${claimId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to resolve claim');
      }

      fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setPayLoadingId(null);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filterStatus === 'all') return true;
    return sub.status === filterStatus;
  });

  const activeSub = submissions.find(s => s.id === selectedSubId) || null;

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Admin Title Dashboard Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-purple-600 font-bold font-mono text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-purple-500" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Review Pipeline & Sponsorships</h1>
          <p className="text-slate-500 text-xs">Evaluate submissions, leave code quality feedback, and sign off reward payouts.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 mt-4 md:mt-0">
          <button
            id="admin-tab-submissions"
            onClick={() => { setActiveTab('submissions'); setSelectedSubId(null); }}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'submissions' 
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Submissions ({submissions.filter(s => s.status === 'submitted').length} new)
          </button>
          <button
            id="admin-tab-claims"
            onClick={() => { setActiveTab('claims'); setSelectedSubId(null); }}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'claims' 
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Claims ({claims.filter(c => c.status === 'pending').length} pending)
          </button>
        </div>
      </div>

      {activeTab === 'submissions' ? (
        /* SUBMISSIONS Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Submissions List */}
          <div className={`lg:col-span-5 space-y-4 ${activeSub ? 'hidden lg:block' : 'block'}`}>
            <div className="flex items-center justify-between bg-white p-3.5 border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-slate-700 font-mono flex items-center space-x-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter Submissions</span>
              </span>
              <select
                id="admin-filter-select"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setSelectedSubId(null); }}
                className="bg-slate-50 text-xs text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              >
                <option value="submitted">Submitted (New)</option>
                <option value="changes_requested">Changes Requested</option>
                <option value="approved">Approved</option>
                <option value="all">All Submissions</option>
              </select>
            </div>

            <div className="space-y-2.5">
              {filteredSubmissions.map((sub) => {
                const active = selectedSubId === sub.id;
                return (
                  <button
                    key={sub.id}
                    id={`admin-sub-item-${sub.id}`}
                    onClick={() => { setSelectedSubId(sub.id); setFeedback(''); }}
                    className={`
                      w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-36 group
                      ${active 
                        ? 'bg-purple-50/50 border-purple-500 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
                      }
                    `}
                  >
                    <div className="w-full">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] font-mono text-slate-500 block truncate max-w-[70%]">
                          {sub.userName} • {sub.userEmail}
                        </span>
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          sub.projectType === 'capstone' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {sub.projectType}
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold truncate leading-tight ${active ? 'text-purple-950 font-extrabold' : 'text-slate-800 group-hover:text-slate-950'}`}>
                        {sub.projectTitle}
                      </h4>
                    </div>

                    <div className="flex justify-between items-center w-full pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </span>
                      <span className={`font-bold capitalize ${
                        sub.status === 'approved' ? 'text-emerald-600' :
                        sub.status === 'submitted' ? 'text-amber-600' : 'text-orange-600'
                      }`}>
                        {sub.status.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredSubmissions.length === 0 && (
                <div className="p-8 text-center bg-white border border-slate-200 border-dashed rounded-3xl text-xs text-slate-500 shadow-sm">
                  No submissions match the active filters.
                </div>
              )}
            </div>
          </div>

          {/* Submission Details Inspector */}
          <div className={`lg:col-span-7 ${!activeSub ? 'hidden lg:block' : 'block'}`}>
            {activeSub ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-6 shadow-md">
                
                {/* Header info */}
                <div className="space-y-4 pb-4 border-b border-slate-100">
                  <div className="flex justify-between items-start">
                    <button 
                      onClick={() => setSelectedSubId(null)}
                      className="p-1.5 bg-white text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 lg:hidden text-xs flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <div className="text-right ml-auto">
                      <span className="text-[10px] font-mono text-slate-400 block animate-pulse">SUBMITTED ON</span>
                      <span className="text-xs font-mono text-slate-600 font-bold">{new Date(activeSub.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-purple-600 uppercase tracking-wider font-bold block mb-1">
                      Student Account
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-none">{activeSub.userName}</h3>
                    <p className="text-slate-500 text-xs mt-1 font-mono">{activeSub.userEmail}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      PROJECT CHALLENGE EVALUATED
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {activeSub.projectTitle}
                    </h2>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <a
                      href={activeSub.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
                    >
                      <Github className="w-4 h-4 text-emerald-600" />
                      <span>Explore Repository</span>
                    </a>
                    {activeSub.demoUrl && (
                      <a
                        href={activeSub.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
                      >
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span>Live Deployment</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Engineering approach writeup */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Student Architecture & Decisions Write-up
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 text-xs leading-relaxed font-normal whitespace-pre-wrap shadow-inner">
                    {activeSub.writeup}
                  </div>
                </div>

                {/* Review Action Panel */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Evaluation & Rubric Feedback Logs *
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Write down structural design advice, error handling suggestions, and details matching grading rubrics.
                    </p>
                  </div>

                  {reviewSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-semibold">
                      Evaluation log posted successfully!
                    </div>
                  )}

                  {reviewError && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
                      {reviewError}
                    </div>
                  )}

                  {activeSub.status !== 'approved' && activeSub.status !== 'rejected' ? (
                    <div className="space-y-4 animate-fade-in">
                      <textarea
                        id="admin-feedback-textarea"
                        rows={4}
                        required
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Detail your review here. Address functional checks: route parameters, payload schemas, and clean directory layout. Be specific!"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white text-xs leading-relaxed transition-colors"
                      />

                      <div className="flex flex-wrap gap-2.5 pt-2">
                        <button
                          id="admin-btn-approve"
                          type="button"
                          disabled={reviewLoading}
                          onClick={() => handleReviewSubmit('approved')}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-sm shadow-emerald-500/10"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-100" />
                          <span>Approve & Credit Reward</span>
                        </button>
                        <button
                          id="admin-btn-changes"
                          type="button"
                          disabled={reviewLoading}
                          onClick={() => handleReviewSubmit('changes_requested')}
                          className="px-5 py-2.5 bg-orange-50 hover:bg-orange-100/50 border border-orange-200 text-orange-700 font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-sm"
                        >
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <span>Request Revisions</span>
                        </button>
                        <button
                          id="admin-btn-reject"
                          type="button"
                          disabled={reviewLoading}
                          onClick={() => handleReviewSubmit('rejected')}
                          className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100/50 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-sm"
                        >
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Reject Solution</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 text-xs leading-normal">
                      <span className="font-semibold text-slate-500 block font-mono uppercase text-[10px]">Evaluation Completed</span>
                      <div className="p-3 bg-white rounded-xl text-slate-700 italic border border-slate-200/60 shadow-sm">
                        "{activeSub.reviewerFeedback}"
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">Status: {activeSub.status}</span>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              /* Empty state */
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center h-96 space-y-4 shadow-sm">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 shadow-sm">
                  <ClipboardCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h4 className="font-bold text-slate-900 text-base">Select Submission to Review</h4>
                  <p className="text-slate-500 text-xs leading-normal">
                    Select any student challenge submission from the list to launch full engineering code inspections and post feedback.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* CLAIMS Tab */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Claim Ledger</h3>
            <p className="text-slate-500 text-xs">Verify pending corporate-funded sponsorship rewards and mark bank/PayPal transactions resolved.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4">Student Info</th>
                  <th className="p-4">Requested Payout</th>
                  <th className="p-4">Request Time</th>
                  <th className="p-4">Disbursement Destination</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-slate-900 block">{claim.userName}</span>
                      <span className="text-slate-400 font-mono text-[10px] mt-0.5 block">{claim.userEmail}</span>
                    </td>
                    <td className="p-4 font-bold font-mono text-emerald-600 text-sm">
                      ${claim.amount}.00
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {new Date(claim.requestedAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-normal text-slate-600 max-w-xs truncate">
                      {claim.id.startsWith('paypal') ? 'PayPal ID: ' : ''}
                      <span className="font-mono bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[10px]">
                        {claim.id}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border ${
                        claim.status === 'paid' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {claim.status === 'pending' ? (
                        <button
                          id={`admin-pay-claim-${claim.id}`}
                          onClick={() => handlePayClaim(claim.id)}
                          disabled={payLoadingId === claim.id}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all text-[11px] inline-flex items-center space-x-1 shadow-sm shadow-blue-500/10"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{payLoadingId === claim.id ? 'Marking...' : 'Mark Paid'}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}

                {claims.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-mono bg-white">
                      No monetary reward claims have been filed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
