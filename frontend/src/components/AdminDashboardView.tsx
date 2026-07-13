import React, { useState, useEffect } from 'react';
import { User, Submission, Claim, ManualPayoutDetails } from '../types';
import { Server, Check, Clock, Loader2 } from 'lucide-react';
import { AdminDashboardSkeleton } from './Skeleton';

interface Props {
  user: User;
  onRefreshCurriculum?: () => void;
}

export default function AdminDashboardView({ user }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [payLoadingId, setPayLoadingId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const subRes = await fetch('/api/admin/submissions');
      const claimRes = await fetch('/api/admin/claims');
      
      if (subRes.ok) setSubmissions(await subRes.json());
      if (claimRes.ok) setClaims(await claimRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayClaim = async (claimId: string) => {
    setPayLoadingId(claimId);
    setPayError(null);
    try {
      const res = await fetch(`/api/admin/claims/${claimId}/pay`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPayError(data?.error || 'Failed to pay claim. It has been left pending so you can retry.');
      }
      fetchData();
    } catch (e) {
      setPayError('Network error while trying to pay this claim.');
    } finally {
      setPayLoadingId(null);
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const pendingClaims = claims.filter(c => c.status === 'pending');

function maskManualPayoutDetails(details?: ManualPayoutDetails | null) {
  if (!details) return 'No manual payout details provided.';
  if (details.type === 'bank') {
    return `Bank • ${details.accountNumber ? 'XXXXXXXX' + details.accountNumber.slice(-4) : 'n/a'} • ${details.ifsc || 'n/a'}`;
  }
  if (details.type === 'upi') {
    return `UPI • ${details.upiId ? details.upiId.replace(/.(?=.{2,}@)/g, '*') : 'n/a'}`;
  }
  return `PayPal • ${details.paypalEmail ? details.paypalEmail.replace(/(^.).*(@.*$)/, '$1***$2') : 'n/a'}`;
}

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-start justify-center shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Server className="text-blue-500 w-6 h-6"/> Admin Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">High-level overview of pending actions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Submissions */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-slate-800">Pending Project Submissions ({pendingSubmissions.length})</h2>
          {pendingSubmissions.length === 0 ? (
            <p className="text-slate-500 text-sm">All caught up!</p>
          ) : (
            <div className="space-y-3">
              {pendingSubmissions.map(sub => (
                <div key={sub.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm">{sub.projectTitle}</span>
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{sub.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">By: {sub.userName} ({sub.userEmail})</div>
                  <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3"/> {new Date(sub.submittedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Claims */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-slate-800">Pending Reward Claims ({pendingClaims.length})</h2>
          {payError && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{payError}</div>
          )}
          {pendingClaims.length === 0 ? (
            <p className="text-slate-500 text-sm">All caught up!</p>
          ) : (
            <div className="space-y-3">
              {pendingClaims.map(claim => (
                <div key={claim.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-emerald-600">${claim.amount}</span>
                      <span className="text-xs text-slate-500 font-mono">from {claim.userName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {claim.id}</div>
                    {claim.payoutMethod === 'manual' && (
                      <div className="text-[10px] text-slate-500 mt-1">Manual payout: {maskManualPayoutDetails(claim.manualPayoutDetails)}</div>
                    )}
                    {claim.failureReason && (
                      <div className="text-[10px] text-red-600 mt-1">Last attempt failed: {claim.failureReason}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handlePayClaim(claim.id)}
                    disabled={payLoadingId === claim.id}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow-sm w-full sm:w-auto cursor-pointer flex items-center justify-center"
                  >
                    {payLoadingId === claim.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Paid'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
