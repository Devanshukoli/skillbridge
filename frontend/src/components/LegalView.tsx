import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Scale, 
  ArrowLeft, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  Lock, 
  Globe, 
  FileText,
  Mail,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface LegalViewProps {
  initialDocument?: 'privacy' | 'terms';
  onNavigateHome?: () => void;
}

export default function LegalView({ initialDocument = 'privacy', onNavigateHome }: LegalViewProps) {
  const [docType, setDocType] = useState<'privacy' | 'terms'>(initialDocument);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Sync document type if props update
    setDocType(initialDocument);
  }, [initialDocument]);

  const switchDocument = (type: 'privacy' | 'terms') => {
    setDocType(type);
    const targetPath = type === 'privacy' ? '/privacy-policy' : '/terms-and-conditions';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    const fullUrl = window.location.origin + (docType === 'privacy' ? '/privacy-policy' : '/terms-and-conditions');
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback if clipboard API is restricted
    });
  };

  const handleGoHome = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Back to App */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              type="button"
              onClick={handleGoHome}
              className="group inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-mono font-medium transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to SkillBridge</span>
            </button>

            <div className="hidden sm:block h-4 w-px bg-slate-800" />

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                <Code className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white hidden md:inline">
                SkillBridge
              </span>
            </div>
          </div>

          {/* Document Selector Pills */}
          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => switchDocument('privacy')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                docType === 'privacy'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => switchDocument('terms')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                docType === 'terms'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
            </button>
          </div>

          {/* Copy Link Button */}
          <div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
              title="Copy direct link to this legal document"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 font-mono">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline font-mono">Copy Link</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border-b border-slate-800/80 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
            <Globe className="w-3.5 h-3.5" />
            <span>Official Legal Documentation • SkillBridge Platform Inc.</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {docType === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {docType === 'privacy'
              ? 'Learn how SkillBridge collects, processes, protects, and handles your personal data, code submissions, and Stripe Connect financial information.'
              : 'The terms, conditions, and code integrity standards governing your use of SkillBridge, verified capstone submissions, and capstone reward payouts.'}
          </p>

          <div className="pt-2 flex items-center justify-center space-x-4 text-xs font-mono text-slate-400">
            <span>Effective Date: July 2026</span>
            <span>•</span>
            <span>Version 2.4</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">GDPR & CCPA Compliant</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-slate-300 leading-relaxed text-sm">
          
          {docType === 'privacy' ? (
            /* PRIVACY POLICY */
            <div className="space-y-8 divide-y divide-slate-800/60">
              
              <section className="space-y-3">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <span>Section 01</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Overview & Processing Principles
                </h2>
                <p>
                  SkillBridge Platform Inc. ("SkillBridge", "we", "us", or "our") is dedicated to safeguarding the privacy and security of our software engineering students, educators, and enterprise partners. This Privacy Policy details our practices concerning the collection, use, disclosure, and protection of personal data gathered when you visit our website, register for accounts, participate in backend and database engineering tracks, submit code repositories, or receive capstone financial payouts via Stripe Connect.
                </p>
                <p>
                  We adhere strictly to data minimization: we request and process only the information required to authenticate your identity, evaluate your engineering submissions, protect against fraud, and comply with tax and banking regulations.
                </p>
              </section>

              <section className="pt-8 space-y-4">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <span>Section 02</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Information We Collect
                </h2>
                <p>
                  Depending on how you interact with SkillBridge, we process the following categories of information:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                    <div className="font-bold text-white flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-blue-400" />
                      <span>Account & Authentication</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Full name, email address, salted password hashes (PBKDF2/bcrypt), two-factor authentication (TOTP) secret keys, Google OAuth tokens, avatar pictures, and university/experience background.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                    <div className="font-bold text-white flex items-center space-x-2">
                      <Code className="w-4 h-4 text-cyan-400" />
                      <span>Code & Submissions</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Public GitHub repository URLs, branch commits, submitted code snippets, milestone scores, line-by-line review comments, and verified track completion history.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                    <div className="font-bold text-white flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Stripe Connect Financials</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Stripe Express connected account IDs, payout transaction IDs, currency preferences, and verification status. Bank account numbers and SSN/Tax IDs are processed directly by Stripe Express and are never stored on SkillBridge servers.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                    <div className="font-bold text-white flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-amber-400" />
                      <span>Diagnostics & Technical Logs</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      IP address, device characteristics, operating system, browser type, request timestamps, authentication event logs, and API performance traces.
                    </p>
                  </div>
                </div>
              </section>

              <section className="pt-8 space-y-4">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <span>Section 03</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  How We Use Your Personal Data
                </h2>
                <ul className="list-disc list-inside space-y-2 pl-2 text-slate-300">
                  <li><strong className="text-white">Educational Evaluation:</strong> Reviewing code submissions against test suites, issuing staff engineer feedback, and recording XP progress.</li>
                  <li><strong className="text-white">Financial Reward Disbursement:</strong> Verifying capstone completion eligibility ($20–$50 rewards) and initiating automated transfers via Stripe Connect Express.</li>
                  <li><strong className="text-white">Account Security & Fraud Prevention:</strong> Detecting unauthorized access, preventing duplicate account reward farming, validating 2FA security, and protecting platform infrastructure.</li>
                  <li><strong className="text-white">Hiring Matchmaking (Opt-In):</strong> Showcasing verified student completion credentials and leaderboard ranks to hiring partners when explicitly authorized by you.</li>
                  <li><strong className="text-white">Transactional Communications:</strong> Sending essential service emails including password resets, submission review notifications, 2FA verification codes, and payout confirmation receipts.</li>
                </ul>
              </section>

              <section className="pt-8 space-y-4">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <span>Section 04</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Third-Party Service Providers & Subprocessors
                </h2>
                <p>
                  We share personal data strictly with vetted third-party service providers bound by Data Processing Agreements (DPAs) and confidentiality constraints:
                </p>
                <div className="space-y-3 pt-1">
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs">
                    <div className="font-bold text-white min-w-[120px]">Stripe, Inc.</div>
                    <div className="text-slate-400">Processes financial transactions, payout distributions, and KYC identity verification.</div>
                  </div>
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs">
                    <div className="font-bold text-white min-w-[120px]">Supabase, Inc.</div>
                    <div className="text-slate-400">Provides cloud PostgreSQL database infrastructure with encrypted storage and Row Level Security.</div>
                  </div>
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs">
                    <div className="font-bold text-white min-w-[120px]">Google Cloud</div>
                    <div className="text-slate-400">Handles optional Google OAuth single sign-on authentication and container hosting.</div>
                  </div>
                </div>
              </section>

              <section className="pt-8 space-y-3">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <span>Section 05</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Your Data Rights (GDPR & CCPA)
                </h2>
                <p>
                  Regardless of your location, SkillBridge grants you comprehensive rights over your personal data:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300 text-xs">
                  <li><strong>Right to Access & Export:</strong> Request a complete copy of your account profile, progress metrics, and submission history in machine-readable JSON format.</li>
                  <li><strong>Right to Rectification:</strong> Update or correct inaccurate account details directly via your Settings page.</li>
                  <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request complete deletion of your user account, stored tokens, and progress history.</li>
                  <li><strong>Right to Restrict Processing:</strong> Opt out of public leaderboard displays and hiring partner matching at any time.</li>
                </ul>
                <p className="text-xs text-slate-400 pt-2">
                  To exercise any of these rights, email our Data Protection Officer at <a href="mailto:privacy@skillbridge.dev" className="text-blue-400 hover:underline font-mono">privacy@skillbridge.dev</a>.
                </p>
              </section>

            </div>
          ) : (
            /* TERMS OF SERVICE */
            <div className="space-y-8 divide-y divide-slate-800/60">
              
              <section className="space-y-3">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <span>Section 01</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Agreement to Terms & Scope of Service
                </h2>
                <p>
                  These Terms of Service ("Terms") constitute a legally binding contract between you and SkillBridge Platform Inc. ("SkillBridge", "Company", "we", "us"). By creating an account, accessing curriculum content, or submitting code on SkillBridge, you confirm that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy.
                </p>
                <p>
                  SkillBridge provides an interactive educational environment designed for learning node.js, Express, SQL, and backend architecture, verified through real-world capstone projects and financial payouts.
                </p>
              </section>

              <section className="pt-8 space-y-4">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <span>Section 02</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  User Account Registration & Security
                </h2>
                <ul className="list-disc list-inside space-y-2 pl-2 text-slate-300">
                  <li><strong className="text-white">Age Requirement:</strong> You must be at least 18 years old or the age of legal majority in your state/country to create an account and participate in Stripe Connect payouts.</li>
                  <li><strong className="text-white">Accurate Credentials:</strong> You agree to provide true, current, and complete registration information.</li>
                  <li><strong className="text-white">Account Security:</strong> You are solely responsible for keeping your password and 2FA authentication tokens confidential. You must immediately notify SkillBridge of any unauthorized access to your account.</li>
                  <li><strong className="text-white">One Account Per Person:</strong> Registering multiple accounts to duplicate capstone rewards or manipulate leaderboards is grounds for permanent ban and payout forfeiture.</li>
                </ul>
              </section>

              <section className="pt-8 space-y-4">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <span>Section 03</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Code Integrity, Academic Honesty & Prohibited Conduct
                </h2>
                <p>
                  SkillBridge certifies real engineering competency. Maintaining strict integrity is essential:
                </p>
                <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-red-400 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Strictly Prohibited Actions:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
                    <li>Submitting plagiarized or stolen code from other students or public solution dumps.</li>
                    <li>Attempting SQL injection, cross-site scripting (XSS), or automated denial-of-service against SkillBridge services.</li>
                    <li>Automating capstone submissions via bots without personal comprehension.</li>
                    <li>Attempting to exploit payout logic or manipulate Stripe Express connected accounts.</li>
                  </ul>
                  <p className="text-slate-400 pt-1">
                    Violations result in instant account suspension, deletion of progress records, and disqualification from future participation.
                  </p>
                </div>
              </section>

              <section className="pt-8 space-y-4">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <span>Section 04</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Capstone Rewards & Stripe Connect Express Payouts
                </h2>
                <p>
                  SkillBridge provides cash rewards ($20 to $50) for verified completion of selected capstone modules:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 text-slate-300 text-xs">
                  <li><strong>Review Approval Requirement:</strong> Rewards are issued only after code submissions pass all automated test suites and receive approval from senior staff reviewers.</li>
                  <li><strong>Stripe Express Requirement:</strong> All payouts require an active, identity-verified Stripe Connect Express account in a supported country.</li>
                  <li><strong>Tax Responsibilities:</strong> Users are solely responsible for reporting any earned rewards and paying applicable local, state, or federal income taxes.</li>
                  <li><strong>Payout Disputes:</strong> SkillBridge reserves the right to hold, audit, or cancel pending payouts if fraudulent submission patterns or credential sharing are detected.</li>
                </ul>
              </section>

              <section className="pt-8 space-y-3">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <span>Section 05</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Intellectual Property Rights
                </h2>
                <p>
                  <strong className="text-white">Your Submissions:</strong> You retain 100% ownership and copyright of the source code you write and deposit in your personal GitHub repositories.<br />
                  <strong className="text-white">Platform Content:</strong> SkillBridge and its licensors retain all rights, titles, and interests in the curriculum, track markdown text, branding, logos, website design, and review feedback text.
                </p>
              </section>

              <section className="pt-8 space-y-3">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <span>Section 06</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Limitation of Liability & Governing Law
                </h2>
                <p className="text-xs text-slate-300">
                  SkillBridge is provided "AS IS" and "AS AVAILABLE" without warranties of any kind. In no event shall SkillBridge Platform Inc. or its officers be liable for indirect, incidental, or consequential damages resulting from platform downtime, loss of data, or third-party service interruptions. These Terms are governed by the laws of the State of Delaware, USA.
                </p>
              </section>

            </div>
          )}

          {/* Contact Footer Box */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Have legal or privacy questions?</div>
                <div className="text-xs text-slate-400">Our compliance team is here to assist you.</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href="mailto:legal@skillbridge.dev"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center space-x-1.5"
              >
                <span>Contact Legal Team</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 SkillBridge Platform Inc. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => switchDocument('privacy')}
              className={`hover:text-white transition-colors cursor-pointer ${docType === 'privacy' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => switchDocument('terms')}
              className={`hover:text-white transition-colors cursor-pointer ${docType === 'terms' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Terms of Service
            </button>
            <span>•</span>
            <a href="/llm.txt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              llm.txt
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
