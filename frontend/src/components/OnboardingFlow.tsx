import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { Check, Code, ArrowRight, Clock, Target, Award } from 'lucide-react';

interface OnboardingFlowProps {
  user: User;
  onOnboardingComplete: (updatedUser: User) => void;
}

export default function OnboardingFlow({ user, onOnboardingComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [experienceLevel, setExperienceLevel] = useState('Never coded professionally');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [goals, setGoals] = useState('Get my first job');
  const [timeCommitment, setTimeCommitment] = useState('Regular ~5-8 hrs');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const skillsOptions = ['JavaScript', 'Node.js', 'Express', 'SQL', 'Git', 'REST APIs'];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceLevel,
          skills: selectedSkills,
          goals,
          timeCommitment
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong during onboarding.');
      }
      onOnboardingComplete(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-800">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center space-x-2">
        <div className="bg-blue-55 text-blue-600 p-2 rounded-xl border border-blue-100 shadow-sm bg-white">
          <Code className="w-6 h-6" />
        </div>
        <span className="text-xl font-extrabold text-slate-900 tracking-tight">SkillBridge</span>
      </div>

      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative">
        {/* Step Indicator */}
        <div className="h-1 w-full bg-slate-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 animate-pulse"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-mono text-blue-600 tracking-wider uppercase font-extrabold">
              Step {step} of {totalSteps}
            </span>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              +{step * 10} XP Potential
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm shadow-sm">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, {user.name}!</h2>
                  <p className="text-slate-500 text-sm mt-1">Let's craft your custom learning pipeline. What is your current coding background?</p>
                </div>

                <div className="space-y-3">
                  {[
                    'Never coded professionally',
                    'Built personal projects',
                    'Have internship experience'
                  ].map((level) => (
                    <button
                      key={level}
                      id={`exp-${level.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setExperienceLevel(level)}
                      className={`w-full p-4 text-left rounded-xl border transition-all flex items-center justify-between shadow-sm ${
                        experienceLevel === level
                          ? 'bg-blue-50/50 border-blue-500 text-blue-950 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>{level}</span>
                      {experienceLevel === level && <Check className="w-5 h-5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">What do you already know?</h2>
                  <p className="text-slate-500 text-sm mt-1">Select all technologies you are familiar with. You can change this later.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {skillsOptions.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        id={`skill-${skill.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        onClick={() => toggleSkill(skill)}
                        className={`p-4 text-left rounded-xl border transition-all flex flex-col justify-between h-28 shadow-sm ${
                          isSelected
                            ? 'bg-blue-50/50 border-blue-500 text-blue-950 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between w-full">
                          <span className="font-semibold">{skill}</span>
                          {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                        </div>
                        <span className="text-xs text-slate-400">Core technology</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">What's your primary goal?</h2>
                  <p className="text-slate-505 text-sm mt-1">We will tailor your learning path dashboard messages to suit your ambitions.</p>
                </div>

                <div className="space-y-3">
                  {[
                    'Get my first job',
                    'Prepare for a specific offer',
                    'Just leveling up / curiosity'
                  ].map((goal) => (
                    <button
                      key={goal}
                      id={`goal-${goal.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setGoals(goal)}
                      className={`w-full p-4 text-left rounded-xl border transition-all flex items-center justify-between shadow-sm ${
                        goals === goal
                          ? 'bg-blue-50/50 border-blue-500 text-blue-950 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Target className="w-5 h-5 text-slate-400" />
                        <span>{goal}</span>
                      </div>
                      {goals === goal && <Check className="w-5 h-5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Time commitment</h2>
                  <p className="text-slate-505 text-sm mt-1">How much time can you commit to SkillBridge exercises weekly?</p>
                </div>

                <div className="space-y-3">
                  {[
                    'Casual ~2-3 hrs',
                    'Regular ~5-8 hrs',
                    'Intensive 10+ hrs'
                  ].map((commitment) => (
                    <button
                      key={commitment}
                      id={`commit-${commitment.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setTimeCommitment(commitment)}
                      className={`w-full p-4 text-left rounded-xl border transition-all flex items-center justify-between shadow-sm ${
                        timeCommitment === commitment
                          ? 'bg-blue-50/50 border-blue-500 text-blue-950 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span>{commitment}</span>
                      </div>
                      {timeCommitment === commitment && <Check className="w-5 h-5 text-blue-600" />}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-3 text-sm text-emerald-800 shadow-sm">
                  <Award className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-extrabold block">Onboarding Completion Bonus!</span>
                    Completing this questionnaire automatically awards you **50 XP** to kickstart your leaderboard status!
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              id="onboarding-back-btn"
              disabled={step === 1 || loading}
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all text-sm font-semibold disabled:opacity-30 disabled:pointer-events-none bg-slate-50 border border-slate-200"
            >
              Back
            </button>

            {step < totalSteps ? (
              <button
                id="onboarding-next-btn"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm transition-all text-sm font-semibold flex items-center space-x-1.5"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="onboarding-finish-btn"
                disabled={loading}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white transition-all text-sm font-bold flex items-center space-x-1.5 shadow-sm shadow-blue-500/10"
              >
                {loading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>Finish & Claim XP</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
