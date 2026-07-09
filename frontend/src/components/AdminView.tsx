import React, { useState, useEffect } from 'react';
import { User, Submission, SubmissionHistory } from '../types';
import { 
  ClipboardCheck, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Github, 
  Globe, 
  ArrowLeft,
  XCircle,
  MessageSquare
} from 'lucide-react';

interface Props {
  user: User;
  onRefreshCurriculum: () => void;
}

export default function AdminView({ user, onRefreshCurriculum }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [history, setHistory] = useState<SubmissionHistory[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/submissions');
      if (res.ok) {
        setSubmissions(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async (subId: string) => {
    try {
      const res = await fetch(`/api/admin/submissions/${subId}/history`);
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (selectedSubId) {
      fetchHistory(selectedSubId);
    } else {
      setHistory([]);
    }
  }, [selectedSubId]);

  const handleReviewSubmit = async (status: string) => {
    if (!selectedSubId || !feedback) return;
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${selectedSubId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback })
      });

      if (res.ok) {
        setFeedback('');
        fetchSubmissions();
        fetchHistory(selectedSubId);
        onRefreshCurriculum();
      } else {
        const err = await res.json();
        setReviewError(err.error);
      }
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => filterStatus === 'all' || sub.status === filterStatus);
  const activeSub = submissions.find(s => s.id === selectedSubId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in h-[calc(100vh-8rem)]">
      
      {/* Left List */}
      <div className={`lg:col-span-4 flex flex-col bg-white border border-slate-200 rounded-3xl p-4 shadow-sm ${activeSub ? 'hidden lg:flex' : 'flex'}`}>
        <div className="mb-4">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
          >
            <option value="all">All Submissions</option>
            <option value="submitted">Pending</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredSubmissions.map(sub => (
            <button
              key={sub.id}
              onClick={() => { setSelectedSubId(sub.id); setFeedback(''); }}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                selectedSubId === sub.id ? 'bg-purple-50 border-purple-300' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-slate-800">{sub.projectTitle}</span>
                <span className="text-[10px] font-mono capitalize px-1.5 py-0.5 rounded border bg-slate-50">{sub.status}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{sub.userName} • {sub.userEmail}</div>
            </button>
          ))}
          {filteredSubmissions.length === 0 && (
            <div className="text-center p-4 text-slate-400 text-sm">No submissions found.</div>
          )}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className={`lg:col-span-8 flex flex-col bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden ${!activeSub ? 'hidden lg:flex' : 'flex'}`}>
        {activeSub ? (
          <div className="flex flex-col h-full">
            <div className="border-b border-slate-100 pb-4 mb-4 flex-shrink-0">
              <button onClick={() => setSelectedSubId(null)} className="lg:hidden mb-2 text-xs text-slate-500 flex items-center gap-1">
                <ArrowLeft className="w-3 h-3"/> Back
              </button>
              <h2 className="text-xl font-bold">{activeSub.projectTitle}</h2>
              <p className="text-sm text-slate-500">By {activeSub.userName} ({activeSub.userEmail})</p>
              
              <div className="flex gap-2 mt-3">
                <a href={activeSub.repoUrl} target="_blank" className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 rounded-lg"><Github className="w-4 h-4"/> Repo</a>
                {activeSub.demoUrl && <a href={activeSub.demoUrl} target="_blank" className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 rounded-lg"><Globe className="w-4 h-4"/> Demo</a>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Writeup</h4>
                <div className="p-4 bg-slate-50 rounded-xl text-sm whitespace-pre-wrap">{activeSub.writeup}</div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interaction History</h4>
                <div className="space-y-3">
                  {history.map(h => (
                    <div key={h.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-slate-700">{h.adminName} <span className="font-normal text-slate-500 text-xs font-mono">- {new Date(h.createdAt).toLocaleString()}</span></span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-white capitalize">{h.action}</span>
                      </div>
                      <p className="text-sm text-slate-800">{h.comment}</p>
                      {h.action === 'status_change' && (
                        <div className="mt-2 text-[10px] font-mono text-slate-400">
                          Status changed: <span className="line-through">{h.oldStatus}</span> &rarr; <span className="font-bold text-slate-600">{h.newStatus}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {history.length === 0 && <p className="text-xs text-slate-400 italic">No history yet.</p>}
                </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="border-t border-slate-100 pt-4 mt-4 flex-shrink-0 space-y-3">
              {reviewError && <div className="text-xs text-rose-600 p-2 bg-rose-50 rounded">{reviewError}</div>}
              <textarea 
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-purple-500"
                placeholder="Leave feedback or a comment..."
                rows={3}
              />
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleReviewSubmit(activeSub.status)} disabled={reviewLoading} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"><MessageSquare className="w-3.5 h-3.5"/> Add Comment</button>
                <button onClick={() => handleReviewSubmit('approved')} disabled={reviewLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"><CheckCircle className="w-3.5 h-3.5"/> Approve</button>
                <button onClick={() => handleReviewSubmit('changes_requested')} disabled={reviewLoading} className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"><AlertCircle className="w-3.5 h-3.5"/> Request Changes</button>
                <button onClick={() => handleReviewSubmit('rejected')} disabled={reviewLoading} className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"><XCircle className="w-3.5 h-3.5"/> Reject</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <ClipboardCheck className="w-12 h-12 opacity-20"/>
            <p className="text-sm">Select a submission to review.</p>
          </div>
        )}
      </div>

    </div>
  );
}
