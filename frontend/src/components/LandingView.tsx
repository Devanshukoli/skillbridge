import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Code,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  BookOpen,
  Database,
  Server,
  Star,
  ChevronRight,
  X,
  Scale,
} from 'lucide-react';
import { User } from '../types';

interface LandingViewProps {
  onAuthSuccess: (user: User) => void;
  onRequestAuthModal: (mode: 'login' | 'register') => void;
}

export default function LandingView({ onAuthSuccess, onRequestAuthModal }: LandingViewProps) {
  const [activeTab, setActiveTab] = useState<'backend' | 'sql'>('backend');
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(0);
  const [calcCapstones, setCalcCapstones] = useState<number>(2);
  const [calcPractice, setCalcPractice] = useState<number>(3);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | null>(null);

  const backendModules = [
    {
      title: 'Module 1: Node.js & Express Architecture',
      lessonsCount: 8,
      xp: 150,
      reward: '$0 (Practice)',
      description: 'Master the event loop, non-blocking I/O, core HTTP modules, and Express middleware patterns.',
      topics: ['Event Loop & Async I/O', 'Express Router & Custom Middlewares', 'JSON Parsing & Query Validation', 'Centralized Error Handlers'],
      skills: ['Node.js', 'Express', 'HTTP', 'Middleware']
    },
    {
      title: 'Module 2: REST APIs, Auth & Security',
      lessonsCount: 6,
      xp: 250,
      reward: '$20 Cash Reward',
      description: 'Implement stateless JWT authentication, password hashing with Bcrypt, rate limiting, and 2FA OTP security.',
      topics: ['Stateless JWT Tokens', 'Bcrypt Password Hashing', 'Two-Factor Authentication (TOTP)', 'Role-based Access Control (RBAC)'],
      skills: ['JWT', 'Bcrypt', 'Security', '2FA']
    },
    {
      title: 'Module 3: Production Backend & Payment Engine',
      lessonsCount: 5,
      xp: 400,
      reward: '$50 Capstone Reward',
      description: 'Build a production-grade payment service with Stripe Webhooks, idempotency keys, and automated email triggers.',
      topics: ['Stripe Webhook Signature Verification', 'Idempotent Transaction Handling', 'Nodemailer Email Workflows', 'Containerized Cloud Deployment'],
      skills: ['Stripe API', 'Webhooks', 'Express', 'Docker']
    }
  ];

  const sqlModules = [
    {
      title: 'Module 1: Relational Schema Design & Indexing',
      lessonsCount: 8,
      xp: 150,
      reward: '$0 (Practice)',
      description: 'Design normalized relational schemas, manage foreign keys, constraints, and query execution plans.',
      topics: ['Normalized DB Schemas (3NF)', 'Primary & Foreign Key Constraints', 'B-Tree & Hash Indexing', 'EXPLAIN ANALYZE Performance'],
      skills: ['PostgreSQL', 'SQL', 'Schema Design', 'Indexing']
    },
    {
      title: 'Module 2: Complex Joins, CTEs & Aggregations',
      lessonsCount: 6,
      xp: 250,
      reward: '$20 Cash Reward',
      description: 'Write multi-table INNER/LEFT/FULL joins, Common Table Expressions (CTEs), and window functions.',
      topics: ['INNER, LEFT & FULL OUTER Joins', 'Common Table Expressions (WITH queries)', 'GROUP BY & HAVING Aggregations', 'Window Functions (ROW_NUMBER, RANK)'],
      skills: ['SQL Joins', 'CTEs', 'Window Functions', 'Aggregations']
    },
    {
      title: 'Module 3: High-Performance Analytics Capstone Engine',
      lessonsCount: 5,
      xp: 400,
      reward: '$50 Capstone Reward',
      description: 'Construct a real-time analytics aggregation query engine processing high-cardinality event streams.',
      topics: ['Real-time Metrics Aggregation', 'Subqueries vs. CTE Performance', 'Transaction Isolation Levels', 'Query Optimization & Deadlock Prevention'],
      skills: ['PostgreSQL', 'Performance Tuning', 'Analytics', 'Transactions']
    }
  ];

  const currentModules = activeTab === 'backend' ? backendModules : sqlModules;

  const totalMoney = calcCapstones * 50 + calcPractice * 20;
  const totalXp = calcCapstones * 400 + calcPractice * 250 + 300;

  const moneyLabel = (reward: string) => {
    const match = reward.match(/^(\$\d+)(.*)$/);
    if (!match) return reward;
    return (
      <>
        <span className="tabular-money">{match[1]}</span>
        <span className="text-[var(--app-text-muted)] font-normal">{match[2]}</span>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] selection:bg-[var(--app-accent)] selection:text-white">
      <header className="sticky top-0 z-40 bg-[var(--app-bg)]/90 backdrop-blur-md border-b border-[var(--app-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-md bg-[var(--app-accent)] text-white flex items-center justify-center">
              <Code className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[var(--app-text)]">
              SkillBridge
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 type-body text-sm">
            <a href="#curriculum" className="hover:text-[var(--app-text)] transition-colors">Curriculum</a>
            <a href="#reward-engine" className="hover:text-[var(--app-text)] transition-colors">Reward Engine</a>
            <a href="#reviews" className="hover:text-[var(--app-text)] transition-colors">Industry Reviews</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onRequestAuthModal('login')}
              className="px-4 py-2.5 text-sm font-semibold text-[var(--app-text)] border border-[var(--app-border)] bg-transparent rounded-md cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onRequestAuthModal('register')}
              className="px-5 py-2.5 bg-[var(--app-accent)] text-white font-semibold rounded-md text-sm flex items-center space-x-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <section className="landing-hero-reveal relative pt-12 pb-20 lg:pt-20 lg:pb-28 bg-[var(--app-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <h1 className="type-display">
                Stop Building Todo Apps. <br className="hidden sm:inline" />
                Start Building Your Career.
              </h1>

              <p className="type-body max-w-2xl mx-auto lg:mx-0">
                Follow structured Backend and SQL tracks, submit your projects for expert review, and claim real monetary rewards.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <button
                  onClick={() => onRequestAuthModal('register')}
                  className="w-full sm:w-auto px-8 py-4 bg-[var(--app-accent)] text-white text-base font-semibold rounded-md flex items-center justify-center space-x-3 cursor-pointer"
                >
                  <span>Start Your First Track</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <a
                  href="#curriculum"
                  className="w-full sm:w-auto px-6 py-4 bg-transparent text-[var(--app-text)] text-base font-semibold rounded-md border border-[var(--app-border)] flex items-center justify-center space-x-2 text-center"
                >
                  <span>Explore Curriculum</span>
                  <ChevronRight className="w-4 h-4 text-[var(--app-text-muted)]" />
                </a>
              </div>

              <div className="pt-6 border-t border-[var(--app-border)] grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 type-body text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--app-accent)] flex-shrink-0" />
                  <span>Stripe Connect payouts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--app-accent)] flex-shrink-0" />
                  <span>Industry code reviews</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--app-accent)] flex-shrink-0" />
                  <span>Verified certificates</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[var(--app-surface-alt)] border border-[var(--app-border)] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--app-border)]">
                  <span className="font-tech text-sm text-[var(--app-text)]">webhook.ts · Module 03 capstone</span>
                  <span className="text-sm font-semibold text-[var(--app-accent)]">Review</span>
                </div>

                <div className="font-tech text-[13px] leading-6 px-4 py-3 border-b border-[var(--app-border)]">
                  <div className="text-[var(--app-text-muted)]">- res.status(200).send('ok');</div>
                  <div className="text-[var(--app-accent)]">+ const event = stripe.webhooks.constructEvent(buf, sig, secret);</div>
                </div>

                <div className="px-4 py-4 border-b border-[var(--app-border)]">
                  <p className="text-sm font-semibold text-[var(--app-text)]">Maya K. · Staff Engineer</p>
                  <p className="type-body text-sm mt-1">Verify the signature before parsing the body. This is the production path.</p>
                </div>

                <div className="px-4 py-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-[var(--app-text)]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--app-accent)] flex-shrink-0" />
                    <span>Passed · Webhook signature verified</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[var(--app-text-muted)]">
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span>Failed · Body parsed before signature check</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[var(--app-text)]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--app-accent)] flex-shrink-0" />
                    <span>Passed · Integration tests 12/12</span>
                  </div>
                  <p className="text-sm text-[var(--app-text-muted)] pt-1">
                    Capstone payout <span className="tabular-money">$50</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="curriculum" className="py-20 bg-[var(--app-bg)] border-y border-[var(--app-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="type-title">
              Production-grade learning tracks
            </h2>
            <p className="type-body">
              No superficial tutorials. Master production backend infrastructure, database mechanics, and real API integrations step by step.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 bg-[var(--app-surface-alt)] rounded-md border border-[var(--app-border)]">
              <button
                onClick={() => { setActiveTab('backend'); setSelectedModuleIndex(0); }}
                className={`px-6 py-3 rounded-md font-semibold text-sm flex items-center space-x-2.5 cursor-pointer ${
                  activeTab === 'backend'
                    ? 'bg-[var(--app-accent)] text-white'
                    : 'text-[var(--app-text-muted)]'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Backend Fundamentals</span>
                <span className="text-xs font-semibold">
                  3 modules
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('sql'); setSelectedModuleIndex(0); }}
                className={`px-6 py-3 rounded-md font-semibold text-sm flex items-center space-x-2.5 cursor-pointer ${
                  activeTab === 'sql'
                    ? 'bg-[var(--app-accent)] text-white'
                    : 'text-[var(--app-text-muted)]'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>SQL Mastery</span>
                <span className="text-xs font-semibold">
                  3 modules
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 border border-[var(--app-border)]">
              {currentModules.map((mod, idx) => {
                const isSelected = selectedModuleIndex === idx;
                return (
                  <div
                    key={mod.title}
                    onClick={() => setSelectedModuleIndex(idx)}
                    className={`p-5 cursor-pointer ${
                      isSelected
                        ? 'm-1 rounded-md border border-[var(--app-accent)] bg-[var(--app-surface-alt)]'
                        : 'rounded-none border-b border-[var(--app-border)] last:border-b-0'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="type-seq">
                          Module {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="type-heading mt-0.5">
                          {mod.title.replace(/^Module \d+: /, '')}
                        </h3>
                      </div>
                      <span className="text-sm whitespace-nowrap">
                        {moneyLabel(mod.reward)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center space-x-4 text-sm text-[var(--app-text-muted)]">
                      <span className="flex items-center">
                        <BookOpen className="w-3.5 h-3.5 mr-1" />
                        {mod.lessonsCount} Lessons
                      </span>
                      <span>+{mod.xp} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-7 border border-[var(--app-border)] rounded-lg p-6 sm:p-8 bg-[var(--app-bg)]">
              {(() => {
                const mod = currentModules[selectedModuleIndex];
                return (
                  <div key={`${activeTab}-${selectedModuleIndex}`} className="landing-crossfade space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--app-border)] pb-4">
                      <div>
                        <span className="type-seq">
                          Module {String(selectedModuleIndex + 1).padStart(2, '0')}
                        </span>
                        <h3 className="type-heading text-xl mt-1">
                          {mod.title}
                        </h3>
                      </div>
                      <span className="text-sm">
                        {moneyLabel(mod.reward)}
                      </span>
                    </div>

                    <p className="type-body text-sm sm:text-base">
                      {mod.description}
                    </p>

                    <div>
                      <h4 className="type-heading mb-3">
                        Engineering concepts
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {mod.topics.map((topic) => (
                          <div key={topic} className="flex items-center space-x-2.5 p-3 border border-[var(--app-border)] text-sm text-[var(--app-text)]">
                            <CheckCircle2 className="w-4 h-4 text-[var(--app-accent)] flex-shrink-0" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="type-heading mb-2">
                        Technologies and skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {mod.skills.map((skill) => (
                          <span key={skill} className="font-tech text-xs text-[var(--app-text)] border border-[var(--app-border)] px-3 py-1">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--app-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="type-body text-sm text-center sm:text-left">
                        Complete lessons, solve tests, submit code for expert review.
                      </div>
                      <button
                        onClick={() => onRequestAuthModal('register')}
                        className="w-full sm:w-auto px-6 py-3 bg-[var(--app-accent)] text-white font-semibold rounded-md text-sm flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>Start This Module</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      <section id="reward-engine" className="py-20 bg-[var(--app-bg)] text-[var(--app-text)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="type-title">
              The Reward Engine
            </h2>
            <p className="type-body">
              No gift cards. Real payouts. Once your project passes admin review, claim your reward directly to your bank account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="border border-[var(--app-border)] p-6">
              <div className="w-12 h-12 border border-[var(--app-accent)] bg-transparent text-[var(--app-accent)] flex items-center justify-center mb-5">
                <Code className="w-6 h-6" />
              </div>
              <span className="type-seq">Step 01</span>
              <h3 className="type-heading mt-1 mb-2">Build & Submit Code</h3>
              <p className="type-body text-sm">
                Follow production specifications, write unit tests, and submit your GitHub repository and live demo URL.
              </p>
            </div>

            <div className="border border-[var(--app-border)] p-6">
              <div className="w-12 h-12 border border-[var(--app-accent)] bg-transparent text-[var(--app-accent)] flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="type-seq">Step 02</span>
              <h3 className="type-heading mt-1 mb-2">Industry Expert Review</h3>
              <p className="type-body text-sm">
                A senior software engineer reviews your code for security, error handling, performance, and requirements.
              </p>
            </div>

            <div className="border border-[var(--app-border)] p-6">
              <div className="w-12 h-12 border border-[var(--app-accent)] bg-transparent text-[var(--app-accent)] flex items-center justify-center mb-5">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="type-seq">Step 03</span>
              <h3 className="type-heading mt-1 mb-2">Instant Stripe Deposit</h3>
              <p className="type-body text-sm">
                Click claim and receive funds directly to your connected bank account or debit card via Stripe Connect Express.
              </p>
            </div>
          </div>

          <div className="surface-elevated p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h3 className="type-heading text-2xl">Potential earnings calculator</h3>
                  <p className="type-body text-sm mt-1">
                    Estimate how much cash and XP you can earn by finishing tracks.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-[var(--app-text)]">Capstones completed (<span className="tabular-money">$50</span> each)</span>
                    <span className="text-[var(--app-text-muted)]">{calcCapstones} Capstone{calcCapstones !== 1 ? 's' : ''}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={calcCapstones}
                    onChange={(e) => setCalcCapstones(Number(e.target.value))}
                    className="w-full accent-[var(--app-accent)] rounded-lg h-2 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-[var(--app-text)]">Practice projects completed (<span className="tabular-money">$20</span> each)</span>
                    <span className="text-[var(--app-text-muted)]">{calcPractice} Project{calcPractice !== 1 ? 's' : ''}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={calcPractice}
                    onChange={(e) => setCalcPractice(Number(e.target.value))}
                    className="w-full accent-[var(--app-accent)] rounded-lg h-2 cursor-pointer"
                  />
                </div>
              </div>

              <div className="md:col-span-5 border border-[var(--app-border)] rounded-lg p-6 text-center space-y-4">
                <p className="type-heading">Estimated total earnings</p>
                <div>
                  <p className="tabular-money text-4xl">${totalMoney}.00</p>
                  <p className="type-body text-sm mt-1">+{totalXp} Total XP Points</p>
                </div>
                <button
                  onClick={() => onRequestAuthModal('register')}
                  className="w-full py-3 bg-[var(--app-accent)] text-white font-semibold rounded-md text-sm cursor-pointer"
                >
                  Claim Your First Reward
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20 bg-[var(--app-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="type-title">
              Reviewed by industry engineers
            </h2>
            <p className="type-body">
              Our reviewers grade every capstone against production criteria: error handling, API response design, and database query efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="surface-quote p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-[var(--app-accent)]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="type-body text-sm italic">
                  "The code quality coming out of SkillBridge's backend capstones is genuinely impressive. Students learn proper error handling, schema migrations, and API security before applying to tech roles."
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--app-border)] flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--app-accent)] text-white font-bold flex items-center justify-center text-sm">
                  SC
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--app-text)]">Sarah Chen</h4>
                  <p className="text-xs text-[var(--app-text-muted)]">Tech Lead @ Stripe</p>
                </div>
              </div>
            </div>

            <div className="surface-quote p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-[var(--app-accent)]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="type-body text-sm italic">
                  "I review capstone submissions on SkillBridge weekly. Unlike typical tutorial projects, these students write production-ready SQL and handle real-world edge cases gracefully."
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--app-border)] flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--app-accent)] text-white font-bold flex items-center justify-center text-sm">
                  MV
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--app-text)]">Marcus Vance</h4>
                  <p className="text-xs text-[var(--app-text-muted)]">Senior Staff Engineer @ Google</p>
                </div>
              </div>
            </div>

            <div className="surface-quote p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-[var(--app-accent)]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="type-body text-sm italic">
                  "SkillBridge replaces tutorial fluff with real industry rigor. Paying students for approved production code creates incredible accountability and genuine job confidence."
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--app-border)] flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--app-accent)] text-white font-bold flex items-center justify-center text-sm">
                  ER
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--app-text)]">Elena Rostova</h4>
                  <p className="text-xs text-[var(--app-text-muted)]">Engineering Director @ Vercel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--app-accent)] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="type-title !text-white">
            Ready to Build Real Backend Systems?
          </h2>
          <p className="type-body !text-white/90 max-w-2xl mx-auto">
            Join thousands of student engineers building production code, getting reviewed by staff engineers, and earning real rewards.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onRequestAuthModal('register')}
              className="px-8 py-4 bg-[var(--app-bg)] text-[var(--app-accent)] font-semibold rounded-md text-base flex items-center justify-center space-x-2 mx-auto cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-[var(--app-surface-alt)] text-[var(--app-text-muted)] border-t border-[var(--app-border)] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-9 h-9 rounded-md bg-[var(--app-accent)] text-white flex items-center justify-center font-tech text-lg">
                  &lt;&gt;
                </div>
                <span className="text-xl font-bold text-[var(--app-text)] tracking-tight">
                  SkillBridge
                </span>
              </div>

              <p className="type-body text-sm max-w-sm">
                Helping great developer tools reach the builders who will shape the future. Production-grade coding tracks, expert reviews, and real cash rewards.
              </p>

              <div className="pt-2">
                <p className="font-semibold text-sm text-[var(--app-text)] mb-3">
                  Keep in touch
                </p>
                <div className="flex items-center space-x-4 text-[var(--app-text-muted)]">
                  <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--app-text)] transition-colors" title="WhatsApp">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                    </svg>
                  </a>
                  <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--app-text)] transition-colors" title="X / Twitter">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--app-text)] transition-colors" title="LinkedIn">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                  </a>
                  <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--app-text)] transition-colors" title="Discord">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z"/>
                    </svg>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--app-text)] transition-colors" title="YouTube">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-sm text-[var(--app-text)] pb-2.5 border-b border-[var(--app-border)] mb-4">
                  Developers
                </h4>
                <ul className="space-y-3 text-sm text-[var(--app-text-muted)]">
                  <li><a href="#curriculum" className="hover:text-[var(--app-text)] transition-colors">Hackathons & Tracks</a></li>
                  <li><a href="#curriculum" className="hover:text-[var(--app-text)] transition-colors">Meetups & Practice</a></li>
                  <li><a href="#reward-engine" className="hover:text-[var(--app-text)] transition-colors">Scholarships & Rewards</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-[var(--app-text)] pb-2.5 border-b border-[var(--app-border)] mb-4">
                  Businesses
                </h4>
                <ul className="space-y-3 text-sm text-[var(--app-text-muted)]">
                  <li><a href="#reviews" className="hover:text-[var(--app-text)] transition-colors">Partners</a></li>
                  <li><a href="#reward-engine" className="hover:text-[var(--app-text)] transition-colors">Why SkillBridge</a></li>
                  <li><a href="#reviews" className="hover:text-[var(--app-text)] transition-colors">Contact Us</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-[var(--app-text)] pb-2.5 border-b border-[var(--app-border)] mb-4">
                  Company & legal
                </h4>
                <ul className="space-y-3 text-sm text-[var(--app-text-muted)]">
                  <li><a href="#reviews" className="hover:text-[var(--app-text)] transition-colors">About SkillBridge</a></li>
                  <li>
                    <a
                      href="/privacy-policy"
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, '', '/privacy-policy');
                        window.dispatchEvent(new Event('popstate'));
                      }}
                      className="hover:text-[var(--app-text)] transition-colors text-left cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>Privacy Policy</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/terms-and-conditions"
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, '', '/terms-and-conditions');
                        window.dispatchEvent(new Event('popstate'));
                      }}
                      className="hover:text-[var(--app-text)] transition-colors text-left cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>Terms of Service</span>
                    </a>
                  </li>
                  <li><a href="#reviews" className="hover:text-[var(--app-text)] transition-colors">Code of Conduct</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--app-border)] py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--app-text-muted)]">
            <div>
              © 2026 SkillBridge Platform Inc. All rights reserved.
            </div>

            <div className="flex items-center space-x-6">
              <a
                href="/privacy-policy"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/privacy-policy');
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="hover:text-[var(--app-text)] transition-colors cursor-pointer"
              >
                Privacy Policy
              </a>
              <span className="text-[var(--app-border)]">•</span>
              <a
                href="/terms-and-conditions"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/terms-and-conditions');
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="hover:text-[var(--app-text)] transition-colors cursor-pointer"
              >
                Terms of Service
              </a>
              <span className="text-[var(--app-border)]">•</span>
              <a
                href="/llm.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors cursor-pointer"
                title="View LLM documentation file"
              >
                <span>↗</span>
                <span>llms.txt</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {legalModalTab && createPortal(
        <div className="fixed inset-0 z-50 bg-[var(--app-bg)]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[var(--app-surface-alt)] border border-[var(--app-border)] rounded-lg w-full max-w-4xl text-[var(--app-text-muted)] max-h-[90vh] flex flex-col overflow-hidden my-auto">
            <div className="p-5 sm:p-6 border-b border-[var(--app-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-md bg-[var(--app-accent)] text-white flex items-center justify-center">
                  {legalModalTab === 'privacy' ? <ShieldCheck className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="type-heading text-[var(--app-text)]">
                    {legalModalTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                  </h2>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    SkillBridge Platform Inc. • Effective Date: July 2026
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-[var(--app-bg)] p-1 rounded-md flex items-center space-x-1 border border-[var(--app-border)]">
                  <button
                    type="button"
                    onClick={() => setLegalModalTab('privacy')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                      legalModalTab === 'privacy'
                        ? 'bg-[var(--app-accent)] text-white'
                        : 'text-[var(--app-text-muted)]'
                    }`}
                  >
                    Privacy Policy
                  </button>
                  <button
                    type="button"
                    onClick={() => setLegalModalTab('terms')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                      legalModalTab === 'terms'
                        ? 'bg-[var(--app-accent)] text-white'
                        : 'text-[var(--app-text-muted)]'
                    }`}
                  >
                    Terms of Service
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setLegalModalTab(null)}
                  className="p-2 text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)] rounded-md cursor-pointer"
                  aria-label="Close legal document"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-2.5 border-b border-[var(--app-border)] text-[var(--app-text-muted)] text-xs flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[var(--app-accent)] flex-shrink-0" />
              <span>
                Compliant with GDPR, CCPA, and Stripe Connect Financial Distribution Standards.
              </span>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-[var(--app-text-muted)] divide-y divide-[var(--app-border)]">
              {legalModalTab === 'privacy' ? (
                <div className="space-y-6">
                  <section className="space-y-2">
                    <h3 className="type-heading flex items-center space-x-2">
                      <span className="type-seq">01.</span>
                      <span>Overview & Data Processing Principles</span>
                    </h3>
                    <p>
                      SkillBridge Platform Inc. ("SkillBridge", "we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy outlines how we collect, process, store, and safeguard information when you use our web platform, submit backend and SQL engineering code, participate in verified learning tracks, and receive monetary payouts via Stripe Connect.
                    </p>
                  </section>

                  <section className="pt-6 space-y-3">
                    <h3 className="type-heading flex items-center space-x-2">
                      <span className="type-seq">02.</span>
                      <span>Information We Collect</span>
                    </h3>
                    <p>
                      We collect only the essential personal data necessary to provide verified code validation, maintain security, and facilitate financial rewards:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                      <li>
                        <strong className="text-[var(--app-text)]">Account & Authentication Data:</strong> Full name, university/personal email address, cryptographically hashed passwords (PBKDF2/bcrypt), two-factor authentication (TOTP) secret keys, and profile avatar metadata.
                      </li>
                      <li>
                        <strong className="text-[var(--app-text)]">Code & Submission Metadata:</strong> Public GitHub repository URLs, branch commits, submission code snippets, line-by-line review comments, and verified milestone scores.
                      </li>
                      <li>
                        <strong className="text-[var(--app-text)]">Payout & Financial Information:</strong> Stripe Connect account identifiers, payout status, and transaction references. Sensitive bank account numbers or card credentials are processed directly by Stripe and never stored on SkillBridge servers.
                      </li>
                      <li>
                        <strong className="text-[var(--app-text)]">Technical & Usage Logs:</strong> IP address, device environment, browser type, authentication logs, and error diagnostic traces.
                      </li>
                    </ul>
                  </section>

                  <section className="pt-6 space-y-3">
                    <h3 className="type-heading flex items-center space-x-2">
                      <span className="type-seq">03.</span>
                      <span>How We Use Your Data</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 border border-[var(--app-border)] space-y-1">
                        <div className="font-semibold text-[var(--app-text)]">Curriculum & Code Reviews</div>
                        <p>Evaluating submissions, calculating XP points, generating verified completion badges, and sending line-by-line senior staff engineer reviews.</p>
                      </div>
                      <div className="p-3 border border-[var(--app-border)] space-y-1">
                        <div className="font-semibold text-[var(--app-text)]">Cash Payouts & Stripe Connect</div>
                        <p>Verifying reward eligibility for capstones ($20–$50 per module) and disbursing funds securely through Stripe Connect Express.</p>
                      </div>
                      <div className="p-3 border border-[var(--app-border)] space-y-1">
                        <div className="font-semibold text-[var(--app-text)]">Security & Fraud Prevention</div>
                        <p>Preventing multi-account reward abuse, automated submission bots, plagiarism, unauthorized access, and credential stuffing.</p>
                      </div>
                      <div className="p-3 border border-[var(--app-border)] space-y-1">
                        <div className="font-semibold text-[var(--app-text)]">Hiring Partner Matchmaking</div>
                        <p>Displaying public leaderboard ranks and verified track completion credentials to prospective enterprise hiring partners (only with your explicit opt-in).</p>
                      </div>
                    </div>
                  </section>

                  <section className="pt-6 space-y-2">
                    <h3 className="type-heading flex items-center space-x-2">
                      <span className="type-seq">04.</span>
                      <span>Data Sharing & Third-Party Integrations</span>
                    </h3>
                    <p>
                      We never sell, rent, or trade your personal data to advertising networks. We share limited necessary data only with trusted infrastructure providers bound by strict confidentiality:
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                      <li><strong className="text-[var(--app-text)]">Stripe Inc.:</strong> Payment processing, Stripe Connect onboarding, and regulatory compliance.</li>
                      <li><strong className="text-[var(--app-text)]">Supabase / PostgreSQL:</strong> Secure cloud database storage with row-level security.</li>
                      <li><strong className="text-[var(--app-text)]">Google OAuth:</strong> Optional single sign-on authentication when authorized by you.</li>
                    </ul>
                  </section>

                  <section className="pt-6 space-y-2">
                    <h3 className="type-heading flex items-center space-x-2">
                      <span className="type-seq">05.</span>
                      <span>Your Rights & Choices</span>
                    </h3>
                    <p>
                      Under applicable privacy laws (GDPR, CCPA), you have the right to request access to your stored personal data, export your submission records, request account deletion, or update your profile settings at any time by contacting <a href="mailto:privacy@skillbridge.dev" className="text-[var(--app-accent)] hover:underline">privacy@skillbridge.dev</a>.
                    </p>
                  </section>
                </div>
              ) : (
                <div className="space-y-6">
                  <section className="space-y-2">
                    <h3 className="type-heading flex items-center space-x-2">
                      <span className="type-seq">01.</span>
                      <span>Acceptance of Terms</span>
                    </h3>
                    <p>
                      By accessing or registering for an account on SkillBridge, you enter into a legally binding agreement to comply with these Terms of Service. If you do not agree to these terms, you must immediately discontinue using the platform.
                    </p>
                  </section>

                  <section className="pt-6 space-y-3">
                    <h3 className="type-heading flex items-center space-x-2">
                      <span className="type-seq">02.</span>
                      <span>User Eligibility & Account Security</span>
                    </h3>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                      <li>
                        <strong className="text-[var(--app-text)]">Age Requirement:</strong> You must be at least 18 years old or the legal age of majority in your jurisdiction to participate in monetary reward claims and Stripe Connect payouts.
                      </li>
                      <li>
                        <strong className="text-[var(--app-text)]">Account Confidentiality:</strong> You are responsible for safeguarding your credentials, password, and 2FA authentication tokens. Any action performed under your logged-in account is deemed your responsibility.
                      </li>
                      <li>
                        <strong className="text-[var(--app-text)]">Single Account Policy:</strong> Creating multiple accounts to duplicate capstones or bypass reward limits is strictly prohibited.
                      </li>
                    </ul>
                  </section>

                  <section className="pt-6 space-y-3">
                    <h3 className="type-heading flex items-center space-x-2">
                      <span className="type-seq">03.</span>
                      <span>Code Originality & Academic Integrity</span>
                    </h3>
                    <p>
                      SkillBridge validates production-grade software engineering skills. All submitted capstones and assignments must represent your own authentic code:
                    </p>
                    <div className="p-3 bg-[var(--app-bg)] border border-[var(--app-border)] space-y-1 text-xs">
                      <div className="font-semibold text-[var(--app-text)]">Prohibited Conduct:</div>
                      <p>Submitting plagiarized repositories, automated LLM code submissions without personal understanding, attempting SQL injection or exploit attacks against SkillBridge servers, or sharing capstone solution keys with other students will result in immediate permanent account termination and forfeiture of pending rewards.</p>
                    </div>
                  </section>

                  <section className="pt-6 space-y-3">
                    <h3 className="type-heading flex items-center space-x-2">
                      <span className="type-seq">04.</span>
                      <span>Reward Engine & Stripe Connect Payouts</span>
                    </h3>
                    <p>
                      Monetary rewards ($20 - $50 per module) are awarded upon review approval by senior staff engineer reviewers:
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                      <li>Payouts are processed exclusively via Stripe Connect Express to supported countries.</li>
                      <li>Users are responsible for completing Stripe Connect identity verification and reporting local income taxes.</li>
                      <li>SkillBridge reserves the right to hold or deny payouts if code review standards are not met or if fraudulent activity is flagged.</li>
                    </ul>
                  </section>

                  <section className="pt-6 space-y-2">
                    <h3 className="type-heading flex items-center space-x-2">
                      <span className="type-seq">05.</span>
                      <span>Intellectual Property & Ownership</span>
                    </h3>
                    <p>
                      <strong className="text-[var(--app-text)]">Student Ownership:</strong> You retain 100% copyright ownership of all code you write and deposit in your personal GitHub repositories.<br />
                      <strong className="text-[var(--app-text)]">Platform Assets:</strong> SkillBridge retains full ownership of curriculum content, branding, system architecture, logo, and review feedback text.
                    </p>
                  </section>

                  <section className="pt-6 space-y-2">
                    <h3 className="type-heading flex items-center space-x-2">
                      <span className="type-seq">06.</span>
                      <span>Limitation of Liability & Contact</span>
                    </h3>
                    <p>
                      SkillBridge is provided "as is" without warranty of any kind. We are not liable for lost profits, service interruptions, or third-party API availability. For legal inquiries, please contact <a href="mailto:legal@skillbridge.dev" className="text-[var(--app-accent)] hover:underline">legal@skillbridge.dev</a>.
                    </p>
                  </section>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-[var(--app-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-[var(--app-text-muted)]">
                Questions about legal terms? Contact <a href="mailto:legal@skillbridge.dev" className="text-[var(--app-accent)] hover:underline">legal@skillbridge.dev</a>
              </div>
              <button
                type="button"
                onClick={() => setLegalModalTab(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[var(--app-accent)] text-white font-semibold rounded-md cursor-pointer text-center"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
