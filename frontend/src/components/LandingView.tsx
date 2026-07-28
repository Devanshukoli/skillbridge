import React, { useState } from 'react';
import { 
  Code, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  BookOpen, 
  Database, 
  Server, 
  Award, 
  Sparkles, 
  Star, 
  ChevronRight, 
  Layers, 
  Lock, 
  ExternalLink,
  Users,
  Building2,
  TrendingUp,
  X
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

  // Reward Calculator Math
  const totalMoney = calcCapstones * 50 + calcPractice * 20;
  const totalXp = calcCapstones * 400 + calcPractice * 250 + 300;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                SkillBridge
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                Paid Coding Tracks
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#curriculum" className="hover:text-blue-600 transition-colors">Curriculum</a>
            <a href="#reward-engine" className="hover:text-blue-600 transition-colors">Reward Engine</a>
            <a href="#reviews" className="hover:text-blue-600 transition-colors">Industry Reviews</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onRequestAuthModal('login')}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onRequestAuthModal('register')}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all hover:-translate-y-0.5 text-sm flex items-center space-x-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50">
        
        {/* Background ambient decorative shapes */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-orange-400/10 to-indigo-400/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & Action CTAs */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-100/90 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider shadow-sm animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Earn Cash Payouts For Approved Code</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Stop Building Todo Apps. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 bg-clip-text text-transparent">
                  Start Building Your Career.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Follow structured Backend and SQL tracks, submit your projects for expert review, and claim real monetary rewards.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <button
                  onClick={() => onRequestAuthModal('register')}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white text-base font-extrabold rounded-2xl shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/35 transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-3 cursor-pointer group"
                >
                  <span>Start Your First Track</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#curriculum"
                  className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-100 text-slate-800 text-base font-bold rounded-2xl border border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-center"
                >
                  <span>Explore Curriculum</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              </div>

              {/* Quick trust metrics */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-slate-600 text-xs sm:text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Stripe Connect Payouts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Industry Code Reviews</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Verified Certificates</span>
                </div>
              </div>

            </div>

            {/* Right Column: High-Energy Dashboard Mockup */}
            <div className="lg:col-span-5 relative">
              
              {/* Outer decorative card frame */}
              <div className="relative rounded-3xl bg-white p-3 border border-slate-200/80 shadow-2xl shadow-blue-600/15 group hover:shadow-blue-600/25 transition-all duration-500">
                
                {/* Header bar of mockup */}
                <div className="bg-slate-900 rounded-2xl p-4 text-white overflow-hidden relative">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono text-slate-400 ml-2">skillbridge-dashboard.dev</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      LIVE ENGINE
                    </span>
                  </div>

                  {/* Prominent Floating Notification requested by Prompt */}
                  <div className="my-3 p-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-xl text-white shadow-xl shadow-orange-500/30 transform hover:scale-[1.02] transition-transform animate-bounce-short">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-white font-extrabold text-lg shadow-inner">
                          $50
                        </div>
                        <div>
                          <p className="text-xs font-mono font-bold uppercase tracking-wider text-orange-100">Notification Alert</p>
                          <h4 className="text-base font-extrabold leading-tight">Project Approved + $50 Reward Claimed!</h4>
                        </div>
                      </div>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono text-white">Just now</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                      <span className="text-orange-100 font-medium">Node.js Production Capstone</span>
                      <span className="font-bold underline cursor-pointer hover:text-white" onClick={() => onRequestAuthModal('register')}>View Payout →</span>
                    </div>
                  </div>

                  {/* Mini Dashboard Workspace Preview */}
                  <div className="grid grid-cols-2 gap-3 mt-4 text-left">
                    <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/60">
                      <p className="text-[10px] text-slate-400 font-mono uppercase">Claimable Balance</p>
                      <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">$140.00</p>
                      <span className="text-[10px] text-slate-300 flex items-center mt-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" /> Stripe Express Ready
                      </span>
                    </div>

                    <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/60">
                      <p className="text-[10px] text-slate-400 font-mono uppercase">Total XP Earned</p>
                      <p className="text-2xl font-extrabold text-blue-400 font-mono mt-0.5">1,250 XP</p>
                      <span className="text-[10px] text-slate-300 flex items-center mt-1">
                        <Zap className="w-3 h-3 text-orange-400 mr-1" /> Level 4 Senior Track
                      </span>
                    </div>
                  </div>

                  {/* Code status bar */}
                  <div className="mt-3 p-3 bg-slate-950/80 rounded-xl font-mono text-xs text-slate-300 flex items-center justify-between border border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>POST /api/payouts/claim 200 OK</span>
                    </div>
                    <span className="text-emerald-400 font-semibold">PASSED ALL TESTS</span>
                  </div>

                </div>

                {/* Floating Badge Elements */}
                <div className="absolute -top-4 -right-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl flex items-center space-x-2 text-xs font-bold text-slate-800 animate-pulse">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">Payout Status</p>
                    <p className="text-emerald-600 font-extrabold">Instant Deposit</p>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">Code Review</p>
                    <p className="text-blue-700 font-extrabold">100% Industry Verified</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Curriculum Preview Section */}
      <section id="curriculum" className="py-20 bg-white border-y border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-200">
              Interactive Curriculum Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Production-Grade Learning Tracks
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              No superficial tutorials. Master production backend infrastructure, database mechanics, and real API integrations step by step.
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
              <button
                onClick={() => { setActiveTab('backend'); setSelectedModuleIndex(0); }}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center space-x-2.5 cursor-pointer ${
                  activeTab === 'backend'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Backend Fundamentals</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${activeTab === 'backend' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  3 Modules
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('sql'); setSelectedModuleIndex(0); }}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center space-x-2.5 cursor-pointer ${
                  activeTab === 'sql'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>SQL Mastery</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${activeTab === 'sql' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  3 Modules
                </span>
              </button>
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Module Selector List */}
            <div className="lg:col-span-5 space-y-4">
              {currentModules.map((mod, idx) => {
                const isSelected = selectedModuleIndex === idx;
                return (
                  <div
                    key={mod.title}
                    onClick={() => setSelectedModuleIndex(idx)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
                          Module 0{idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                          {mod.title.replace(/^Module \d+: /, '')}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                        mod.reward.includes('$50') 
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : mod.reward.includes('$20')
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {mod.reward}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center space-x-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center">
                        <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {mod.lessonsCount} Lessons
                      </span>
                      <span className="flex items-center">
                        <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" />
                        +{mod.xp} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Detailed View of Selected Module */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              {(() => {
                const mod = currentModules[selectedModuleIndex];
                return (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
                      <div>
                        <span className="text-xs font-mono font-bold text-orange-600 uppercase tracking-wider">
                          Selected Module Details
                        </span>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                          {mod.title}
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
                        {mod.reward}
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      {mod.description}
                    </p>

                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-3">
                        Key Engineering Concepts Covered
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {mod.topics.map((topic) => (
                          <div key={topic} className="flex items-center space-x-2.5 bg-white p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
                        Technologies & Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {mod.skills.map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-blue-100/80 text-blue-800 text-xs font-bold rounded-lg border border-blue-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                        Complete lessons, solve tests, submit code for expert review.
                      </div>
                      <button
                        onClick={() => onRequestAuthModal('register')}
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-blue-500/20 transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer"
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

      {/* 4. The Reward Engine (Stripe Connect Integration) */}
      <section id="reward-engine" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="px-3.5 py-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider rounded-full">
              Stripe Connect Integration
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              The Reward Engine
            </h2>
            <p className="text-slate-300 text-lg font-medium leading-relaxed">
              No gift cards. Real payouts. Once your project passes admin review, claim your reward directly to your bank account.
            </p>
          </div>

          {/* 3 Step Process Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 relative group hover:border-orange-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-5 border border-orange-500/30">
                <Code className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">Step 01</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">Build & Submit Code</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Follow production specifications, write unit tests, and submit your GitHub repository and live demo URL.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 relative group hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-5 border border-blue-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">Step 02</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">Industry Expert Review</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A senior software engineer reviews your code for security, error handling, performance, and requirements.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 relative group hover:border-emerald-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/30">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Step 03</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">Instant Stripe Deposit</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Click claim and receive funds directly to your connected bank account or debit card via Stripe Connect Express.
              </p>
            </div>

          </div>

          {/* Interactive Earnings Calculator Widget */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Potential Earnings Calculator</h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Estimate how much cash and XP you can earn by finishing tracks.
                  </p>
                </div>

                {/* Slider 1: Capstone Projects */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Capstones Completed ($50 each):</span>
                    <span className="text-orange-400 font-mono font-bold">{calcCapstones} Capstone{calcCapstones !== 1 ? 's' : ''}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={calcCapstones}
                    onChange={(e) => setCalcCapstones(Number(e.target.value))}
                    className="w-full accent-orange-500 bg-slate-700 rounded-lg h-2 cursor-pointer"
                  />
                </div>

                {/* Slider 2: Practice Projects */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Practice Projects Completed ($20 each):</span>
                    <span className="text-blue-400 font-mono font-bold">{calcPractice} Project{calcPractice !== 1 ? 's' : ''}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={calcPractice}
                    onChange={(e) => setCalcPractice(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-700 rounded-lg h-2 cursor-pointer"
                  />
                </div>
              </div>

              {/* Total Outcome Card */}
              <div className="md:col-span-5 bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center space-y-4">
                <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Estimated Total Earnings</p>
                <div>
                  <p className="text-4xl font-extrabold text-emerald-400 font-mono">${totalMoney}.00</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">+{totalXp} Total XP Points</p>
                </div>
                <button
                  onClick={() => onRequestAuthModal('register')}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Claim Your First Reward
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. Social Proof / Trust Section */}
      <section id="reviews" className="py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-200">
              Verified Industry Standards
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Reviewed by Industry Engineers
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Our reviewers grade every capstone against production criteria: error handling, API response design, and database query efficiency.
            </p>
          </div>

          {/* 3 Mock Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Reviewer 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "The code quality coming out of SkillBridge's backend capstones is genuinely impressive. Students learn proper error handling, schema migrations, and API security before applying to tech roles."
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  SC
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sarah Chen</h4>
                  <p className="text-xs text-slate-500 font-medium">Tech Lead @ Stripe</p>
                </div>
              </div>
            </div>

            {/* Reviewer 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "I review capstone submissions on SkillBridge weekly. Unlike typical tutorial projects, these students write production-ready SQL and handle real-world edge cases gracefully."
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  MV
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Marcus Vance</h4>
                  <p className="text-xs text-slate-500 font-medium">Senior Staff Engineer @ Google</p>
                </div>
              </div>
            </div>

            {/* Reviewer 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "SkillBridge replaces tutorial fluff with real industry rigor. Paying students for approved production code creates incredible accountability and genuine job confidence."
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  ER
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Elena Rostova</h4>
                  <p className="text-xs text-slate-500 font-medium">Engineering Director @ Vercel</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Call to Action Footer Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-blue-600 to-orange-600 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Build Real Backend Systems?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto">
            Join thousands of student engineers building production code, getting reviewed by staff engineers, and earning real rewards.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onRequestAuthModal('register')}
              className="px-8 py-4 bg-white text-slate-900 hover:bg-orange-50 font-extrabold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-base flex items-center justify-center space-x-2 mx-auto cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-slate-200 text-sm">SkillBridge</span>
            <span>— Bridge the college to industry gap.</span>
          </div>
          <p>© {new Date().getFullYear()} SkillBridge Platform Inc. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
