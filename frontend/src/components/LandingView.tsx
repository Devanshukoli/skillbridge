import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
  X,
  FileText,
  Scale,
  Globe
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

      {/* 7. Footer matching screenshot layout */}
      <footer className="bg-[#0A0D14] text-slate-400 border-t border-slate-800/80 text-xs relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Left Column: Logo, Tagline, Keep in touch */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Brand Logo with cyan/blue terminal bracket icon */}
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-400 text-white flex items-center justify-center font-mono font-bold text-lg shadow-md">
                  &lt;&gt;
                </div>
                <span className="text-xl font-extrabold text-white tracking-tight">
                  SkillBridge
                </span>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Helping great developer tools reach the builders who will shape the future. Production-grade coding tracks, expert reviews, and real cash rewards.
              </p>

              {/* KEEP IN TOUCH */}
              <div className="pt-2">
                <p className="font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-slate-300 mb-3">
                  KEEP IN TOUCH
                </p>
                <div className="flex items-center space-x-4 text-slate-400">
                  {/* WhatsApp */}
                  <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="WhatsApp">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                    </svg>
                  </a>
                  {/* X / Twitter */}
                  <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="X / Twitter">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  {/* LinkedIn */}
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="LinkedIn">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                  </a>
                  {/* Discord */}
                  <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Discord">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z"/>
                    </svg>
                  </a>
                  {/* YouTube */}
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="YouTube">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>

            </div>

            {/* Right Columns Grid: DEVELOPERS, BUSINESSES, COMPANY */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
              
              {/* Column 1: DEVELOPERS */}
              <div>
                <h4 className="font-mono text-xs font-bold tracking-[0.2em] text-slate-300 uppercase pb-2.5 border-b border-slate-800/80 mb-4">
                  DEVELOPERS
                </h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="#curriculum" className="hover:text-slate-200 transition-colors">Hackathons & Tracks</a></li>
                  <li><a href="#curriculum" className="hover:text-slate-200 transition-colors">Meetups & Practice</a></li>
                  <li><a href="#reward-engine" className="hover:text-slate-200 transition-colors">Scholarships & Rewards</a></li>
                </ul>
              </div>

              {/* Column 2: BUSINESSES */}
              <div>
                <h4 className="font-mono text-xs font-bold tracking-[0.2em] text-slate-300 uppercase pb-2.5 border-b border-slate-800/80 mb-4">
                  BUSINESSES
                </h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="#reviews" className="hover:text-slate-200 transition-colors">Partners</a></li>
                  <li><a href="#reward-engine" className="hover:text-slate-200 transition-colors">Why SkillBridge</a></li>
                  <li><a href="#reviews" className="hover:text-slate-200 transition-colors">Contact Us</a></li>
                </ul>
              </div>

              {/* Column 3: COMPANY & LEGAL */}
              <div>
                <h4 className="font-mono text-xs font-bold tracking-[0.2em] text-slate-300 uppercase pb-2.5 border-b border-slate-800/80 mb-4">
                  COMPANY & LEGAL
                </h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="#reviews" className="hover:text-slate-200 transition-colors">About SkillBridge</a></li>
                  <li>
                    <button 
                      type="button" 
                      onClick={() => setLegalModalTab('privacy')} 
                      className="hover:text-white transition-colors text-left cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>Privacy Policy</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      type="button" 
                      onClick={() => setLegalModalTab('terms')} 
                      className="hover:text-white transition-colors text-left cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>Terms of Service</span>
                    </button>
                  </li>
                  <li><a href="#reviews" className="hover:text-slate-200 transition-colors">Code of Conduct</a></li>
                </ul>
              </div>

            </div>

          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal Quick Links */}
        <div className="border-t border-slate-800/80 bg-slate-950/80 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div>
              © 2026 SkillBridge Platform Inc. All rights reserved.
            </div>

            <div className="flex items-center space-x-6 text-slate-400">
              <button
                type="button"
                onClick={() => setLegalModalTab('privacy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={() => setLegalModalTab('terms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <span className="text-slate-700">•</span>
              <a 
                href="/llm.txt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                title="View LLM documentation file"
              >
                <span className="text-slate-400 group-hover:text-white transition-colors">↗</span>
                <span className="text-slate-400 group-hover:text-white transition-colors">llms.txt</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Compliance Modal (Privacy Policy & Terms of Service) */}
      {legalModalTab && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl text-slate-300 max-h-[90vh] flex flex-col overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {legalModalTab === 'privacy' ? <ShieldCheck className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {legalModalTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    SkillBridge Platform Inc. • Effective Date: July 2026
                  </p>
                </div>
              </div>

              {/* Tab Switcher & Close Button */}
              <div className="flex items-center space-x-3">
                <div className="bg-slate-800/80 p-1 rounded-xl flex items-center space-x-1 border border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setLegalModalTab('privacy')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      legalModalTab === 'privacy'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Privacy Policy
                  </button>
                  <button
                    type="button"
                    onClick={() => setLegalModalTab('terms')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      legalModalTab === 'terms'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Terms of Service
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setLegalModalTab(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  aria-label="Close legal document"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Compliance Badge */}
            <div className="px-6 py-2.5 bg-blue-950/40 border-b border-blue-900/40 text-blue-300 text-xs font-mono flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>
                Compliant with GDPR, CCPA, and Stripe Connect Financial Distribution Standards.
              </span>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-slate-300 divide-y divide-slate-800/60">
              {legalModalTab === 'privacy' ? (
                /* PRIVACY POLICY CONTENT */
                <div className="space-y-6">
                  <section className="space-y-2">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="text-blue-400 font-mono text-xs">01.</span>
                      <span>Overview & Data Processing Principles</span>
                    </h3>
                    <p className="text-slate-300">
                      SkillBridge Platform Inc. ("SkillBridge", "we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy outlines how we collect, process, store, and safeguard information when you use our web platform, submit backend and SQL engineering code, participate in verified learning tracks, and receive monetary payouts via Stripe Connect.
                    </p>
                  </section>

                  <section className="pt-6 space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="text-blue-400 font-mono text-xs">02.</span>
                      <span>Information We Collect</span>
                    </h3>
                    <p className="text-slate-300">
                      We collect only the essential personal data necessary to provide verified code validation, maintain security, and facilitate financial rewards:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-2 text-slate-300">
                      <li>
                        <strong className="text-white">Account & Authentication Data:</strong> Full name, university/personal email address, cryptographically hashed passwords (PBKDF2/bcrypt), two-factor authentication (TOTP) secret keys, and profile avatar metadata.
                      </li>
                      <li>
                        <strong className="text-white">Code & Submission Metadata:</strong> Public GitHub repository URLs, branch commits, submission code snippets, line-by-line review comments, and verified milestone scores.
                      </li>
                      <li>
                        <strong className="text-white">Payout & Financial Information:</strong> Stripe Connect account identifiers, payout status, and transaction references. Sensitive bank account numbers or card credentials are processed directly by Stripe and never stored on SkillBridge servers.
                      </li>
                      <li>
                        <strong className="text-white">Technical & Usage Logs:</strong> IP address, device environment, browser type, authentication logs, and error diagnostic traces.
                      </li>
                    </ul>
                  </section>

                  <section className="pt-6 space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="text-blue-400 font-mono text-xs">03.</span>
                      <span>How We Use Your Data</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                        <div className="font-bold text-white">Curriculum & Code Reviews</div>
                        <p className="text-slate-400">Evaluating submissions, calculating XP points, generating verified completion badges, and sending line-by-line senior staff engineer reviews.</p>
                      </div>
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                        <div className="font-bold text-white">Cash Payouts & Stripe Connect</div>
                        <p className="text-slate-400">Verifying reward eligibility for capstones ($20–$50 per module) and disbursing funds securely through Stripe Connect Express.</p>
                      </div>
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                        <div className="font-bold text-white">Security & Fraud Prevention</div>
                        <p className="text-slate-400">Preventing multi-account reward abuse, automated submission bots, plagiarism, unauthorized access, and credential stuffing.</p>
                      </div>
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                        <div className="font-bold text-white">Hiring Partner Matchmaking</div>
                        <p className="text-slate-400">Displaying public leaderboard ranks and verified track completion credentials to prospective enterprise hiring partners (only with your explicit opt-in).</p>
                      </div>
                    </div>
                  </section>

                  <section className="pt-6 space-y-2">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="text-blue-400 font-mono text-xs">04.</span>
                      <span>Data Sharing & Third-Party Integrations</span>
                    </h3>
                    <p className="text-slate-300">
                      We never sell, rent, or trade your personal data to advertising networks. We share limited necessary data only with trusted infrastructure providers bound by strict confidentiality:
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300 text-xs">
                      <li><strong>Stripe Inc.:</strong> Payment processing, Stripe Connect onboarding, and regulatory compliance.</li>
                      <li><strong>Supabase / PostgreSQL:</strong> Secure cloud database storage with row-level security.</li>
                      <li><strong>Google OAuth:</strong> Optional single sign-on authentication when authorized by you.</li>
                    </ul>
                  </section>

                  <section className="pt-6 space-y-2">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="text-blue-400 font-mono text-xs">05.</span>
                      <span>Your Rights & Choices</span>
                    </h3>
                    <p className="text-slate-300">
                      Under applicable privacy laws (GDPR, CCPA), you have the right to request access to your stored personal data, export your submission records, request account deletion, or update your profile settings at any time by contacting <a href="mailto:privacy@skillbridge.dev" className="text-blue-400 hover:underline">privacy@skillbridge.dev</a>.
                    </p>
                  </section>
                </div>
              ) : (
                /* TERMS OF SERVICE CONTENT */
                <div className="space-y-6">
                  <section className="space-y-2">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="text-blue-400 font-mono text-xs">01.</span>
                      <span>Acceptance of Terms</span>
                    </h3>
                    <p className="text-slate-300">
                      By accessing or registering for an account on SkillBridge, you enter into a legally binding agreement to comply with these Terms of Service. If you do not agree to these terms, you must immediately discontinue using the platform.
                    </p>
                  </section>

                  <section className="pt-6 space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="text-blue-400 font-mono text-xs">02.</span>
                      <span>User Eligibility & Account Security</span>
                    </h3>
                    <ul className="list-disc list-inside space-y-2 pl-2 text-slate-300">
                      <li>
                        <strong className="text-white">Age Requirement:</strong> You must be at least 18 years old or the legal age of majority in your jurisdiction to participate in monetary reward claims and Stripe Connect payouts.
                      </li>
                      <li>
                        <strong className="text-white">Account Confidentiality:</strong> You are responsible for safeguarding your credentials, password, and 2FA authentication tokens. Any action performed under your logged-in account is deemed your responsibility.
                      </li>
                      <li>
                        <strong className="text-white">Single Account Policy:</strong> Creating multiple accounts to duplicate capstones or bypass reward limits is strictly prohibited.
                      </li>
                    </ul>
                  </section>

                  <section className="pt-6 space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="text-blue-400 font-mono text-xs">03.</span>
                      <span>Code Originality & Academic Integrity</span>
                    </h3>
                    <p className="text-slate-300">
                      SkillBridge validates production-grade software engineering skills. All submitted capstones and assignments must represent your own authentic code:
                    </p>
                    <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl space-y-1 text-xs text-slate-300">
                      <div className="font-bold text-red-300">Prohibited Conduct:</div>
                      <p>Submitting plagiarized repositories, automated LLM code submissions without personal understanding, attempting SQL injection or exploit attacks against SkillBridge servers, or sharing capstone solution keys with other students will result in immediate permanent account termination and forfeiture of pending rewards.</p>
                    </div>
                  </section>

                  <section className="pt-6 space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="text-blue-400 font-mono text-xs">04.</span>
                      <span>Reward Engine & Stripe Connect Payouts</span>
                    </h3>
                    <p className="text-slate-300">
                      Monetary rewards ($20 - $50 per module) are awarded upon review approval by senior staff engineer reviewers:
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300 text-xs">
                      <li>Payouts are processed exclusively via Stripe Connect Express to supported countries.</li>
                      <li>Users are responsible for completing Stripe Connect identity verification and reporting local income taxes.</li>
                      <li>SkillBridge reserves the right to hold or deny payouts if code review standards are not met or if fraudulent activity is flagged.</li>
                    </ul>
                  </section>

                  <section className="pt-6 space-y-2">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="text-blue-400 font-mono text-xs">05.</span>
                      <span>Intellectual Property & Ownership</span>
                    </h3>
                    <p className="text-slate-300">
                      <strong className="text-white">Student Ownership:</strong> You retain 100% copyright ownership of all code you write and deposit in your personal GitHub repositories.<br />
                      <strong className="text-white">Platform Assets:</strong> SkillBridge retains full ownership of curriculum content, branding, system architecture, logo, and review feedback text.
                    </p>
                  </section>

                  <section className="pt-6 space-y-2">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="text-blue-400 font-mono text-xs">06.</span>
                      <span>Limitation of Liability & Contact</span>
                    </h3>
                    <p className="text-slate-300">
                      SkillBridge is provided "as is" without warranty of any kind. We are not liable for lost profits, service interruptions, or third-party API availability. For legal inquiries, please contact <a href="mailto:legal@skillbridge.dev" className="text-blue-400 hover:underline">legal@skillbridge.dev</a>.
                    </p>
                  </section>
                </div>
              )}
            </div>

            {/* Modal Footer Action */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-400">
                Questions about legal terms? Contact <a href="mailto:legal@skillbridge.dev" className="text-blue-400 hover:underline font-mono">legal@skillbridge.dev</a>
              </div>
              <button
                type="button"
                onClick={() => setLegalModalTab(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-center"
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
