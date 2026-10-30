import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { UserProfile, EnhancedRecommendationItem, SavedScheme, Assessment } from '../types';
import { VerificationBadge, ResultStatusBadge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { InteractiveCard } from '../components/motion/InteractiveCard';
import { AnimatedCounter } from '../components/motion/AnimatedCounter';
import { DashboardCardSkeleton, ShimmerSkeleton } from '../components/motion/ShimmerSkeleton';
import {
  Bookmark, ArrowRight, ShieldCheck, Sparkles, CheckCircle2
} from 'lucide-react';
import {
  MOTION_SPRINGS,
  staggerContainerVariants,
  staggerItemVariants,
} from '../styles/motion';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<EnhancedRecommendationItem[]>([]);
  const [savedSchemes, setSavedSchemes] = useState<SavedScheme[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profData, recData, savedData, assessData] = await Promise.all([
          apiRequest<UserProfile>('/api/profile'),
          apiRequest<EnhancedRecommendationItem[]>('/api/assessments/recommendations'),
          apiRequest<SavedScheme[]>('/api/saved-schemes'),
          apiRequest<Assessment[]>('/api/assessments/history'),
        ]);
        setProfile(profData);
        setRecommendations(recData);
        setSavedSchemes(savedData);
        setRecentAssessments(assessData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
          {/* Skeleton Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <ShimmerSkeleton className="h-4 w-40" />
              <ShimmerSkeleton className="h-8 w-64" />
              <ShimmerSkeleton className="h-4 w-96" />
            </div>
            <div className="min-w-[240px] space-y-2">
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-2 w-full" />
            </div>
          </div>
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <DashboardCardSkeleton />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-lg border border-stone-300 space-y-3">
                <ShimmerSkeleton className="h-5 w-32" />
                <ShimmerSkeleton className="h-10 w-full" count={3} />
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const completionPct = profile?.completion_percentage || 0;

  const getMatchCategoryBadge = (category: string) => {
    if (category.includes('Strong')) {
      return 'bg-emerald-50 text-emerald-900 border-emerald-300';
    }
    if (category.includes('requiring more information')) {
      return 'bg-amber-50 text-amber-900 border-amber-300';
    }
    if (category.includes('Low match')) {
      return 'bg-rose-50 text-rose-900 border-rose-300';
    }
    return 'bg-stone-100 text-stone-800 border-stone-300';
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        {/* Welcome Command Banner with Telemetry Progress */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="bg-white p-6 sm:p-8 rounded-lg border border-stone-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        >
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900" />

          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider font-hud-mono">
                Entrepreneur Advisory Workspace • SYS.ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Namaste, {user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              {profile?.business_name
                ? `Advising for "${profile.business_name}" (${profile.sector || 'General'}, ${profile.state || 'India'})`
                : 'Complete your profile attributes to unlock precision scheme matching.'}
            </p>
          </div>

          {/* Profile Completion Meter with Animated Counter */}
          <div className="bg-stone-50 p-4 rounded border border-stone-200 min-w-[260px] shadow-2xs">
            <div className="flex justify-between items-center text-xs mb-1.5 font-hud-mono">
              <span className="font-bold text-stone-700">Profile Completion</span>
              <span className="font-extrabold text-slate-900">
                <AnimatedCounter value={completionPct} suffix="%" />
              </span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: `${completionPct}%` }}
                transition={MOTION_SPRINGS.snappy}
                className={`h-2 ${
                  completionPct > 70 ? 'bg-emerald-600' : completionPct > 40 ? 'bg-amber-600' : 'bg-slate-700'
                }`}
              />
            </div>
            <div className="mt-2 text-right">
              <Link to="/profile" className="text-[11px] font-bold text-slate-900 hover:underline">
                {completionPct < 100 ? 'Update Missing Details →' : 'Edit Profile →'}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* AI Discovery Callout Banner with Telemetry Accents */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="bg-slate-900 text-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-slate-800 relative overflow-hidden"
        >
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-hud-mono">
                Autonomous AI Advisory • RAG.HYBRID
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              Need tailored scheme guidance for your venture?
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              Query our hybrid RAG assistant in natural language. Get immediate answers grounded in verified Central Government gazettes with full source citations.
            </p>
            <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
              <motion.button
                whileHover={!shouldReduceMotion ? { y: -1, scale: 1.02 } : undefined}
                whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
                onClick={() => navigate('/ai-assistant')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-stone-200 border border-slate-700 transition-colors cursor-pointer"
              >
                "Grants for new manufacturing"
              </motion.button>
              <motion.button
                whileHover={!shouldReduceMotion ? { y: -1, scale: 1.02 } : undefined}
                whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
                onClick={() => navigate('/ai-assistant')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-stone-200 border border-slate-700 transition-colors cursor-pointer"
              >
                "Schemes for women entrepreneurs"
              </motion.button>
              <motion.button
                whileHover={!shouldReduceMotion ? { y: -1, scale: 1.02 } : undefined}
                whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
                onClick={() => navigate('/ai-assistant')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-stone-200 border border-slate-700 transition-colors cursor-pointer"
              >
                "Collateral-free credit options"
              </motion.button>
            </div>
          </div>

          <Link to="/ai-assistant" className="shrink-0">
            <TactileButton
              variant="accent"
              size="md"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open AI Assistant
            </TactileButton>
          </Link>
        </motion.div>

        {/* Main Command Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 8 cols: Recommendations & Assessments */}
          <div className="lg:col-span-8 space-y-8">
            {/* Recommended Schemes */}
            <div className="bg-white p-6 rounded-lg border border-stone-300 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Precision Scheme Recommendations
                  </h2>
                  <p className="text-xs text-stone-500 font-hud-mono">
                    Multi-factor evaluation: Eligibility 50% • Profile 25% • Credibility 15% • Evidence 10%
                  </p>
                </div>
                <Link to="/schemes" className="text-xs font-bold text-slate-900 hover:underline">
                  Explore All ({recommendations.length}) →
                </Link>
              </div>

              {recommendations.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-stone-300 rounded text-xs text-stone-500">
                  No scheme recommendations found. Update your profile attributes to see matches.
                </div>
              ) : (
                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={staggerContainerVariants(0.06, 0.02)}
                  className="space-y-4"
                >
                  {recommendations.slice(0, 5).map((rec) => (
                    <InteractiveCard
                      key={rec.scheme.id}
                      className="p-5 border-stone-200 bg-stone-50/40 space-y-3.5 hover:border-slate-800"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-amber-800 font-hud-mono">
                              {rec.scheme.ministry}
                            </span>
                            <VerificationBadge status={rec.scheme.verification_status} size="sm" />
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border font-hud-mono ${getMatchCategoryBadge(rec.match_category)}`}>
                              {rec.match_category}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-slate-900 leading-snug">
                            {rec.scheme.name}
                          </h3>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <ResultStatusBadge result={rec.overall_result} />
                          <span className="text-base font-extrabold text-slate-900 font-hud-mono">
                            <AnimatedCounter value={Math.round(rec.match_score)} suffix="%" />
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {rec.highlighted_reason || rec.scheme.brief_description}
                      </p>

                      {/* Multi-factor Score Breakdown Bar */}
                      {rec.score_factors && (
                        <div className="p-2.5 bg-white rounded border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-stone-600">
                          <div>
                            <span className="text-stone-400 block font-medium font-hud-mono">Eligibility (50%):</span>
                            <span className="font-bold text-slate-900 font-hud-mono">{Math.round(rec.score_factors.eligibility_factor * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block font-medium font-hud-mono">Profile Fit (25%):</span>
                            <span className="font-bold text-slate-900 font-hud-mono">{Math.round(rec.score_factors.profile_affinity_factor * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block font-medium font-hud-mono">Credibility (15%):</span>
                            <span className="font-bold text-slate-900 font-hud-mono">{Math.round(rec.score_factors.verification_credibility_factor * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block font-medium font-hud-mono">Evidence (10%):</span>
                            <span className="font-bold text-slate-900 font-hud-mono">{Math.round(rec.score_factors.evidence_completeness_factor * 100)}%</span>
                          </div>
                        </div>
                      )}

                      {/* Actionable Next Steps Preview */}
                      {rec.next_steps && rec.next_steps.length > 0 && (
                        <div className="pt-1 space-y-1.5 border-t border-stone-200/60">
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block font-hud-mono">
                            Recommended Action:
                          </span>
                          <div className="text-xs text-stone-800 flex items-start space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong>{rec.next_steps[0].title}:</strong> {rec.next_steps[0].description}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bottom Action Controls */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 font-hud-mono">
                        <div className="flex items-center space-x-3 text-[11px] text-stone-500">
                          <span>Satisfied: <strong className="text-emerald-700">{rec.passed_count}</strong></span>
                          <span>Missing: <strong className="text-amber-700">{rec.missing_count}</strong></span>
                          <span>Unmet: <strong className="text-rose-700">{rec.failed_count}</strong></span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link to={`/schemes/${rec.scheme.id}/gap-analysis`}>
                            <TactileButton variant="secondary" size="sm">
                              Gap Analysis
                            </TactileButton>
                          </Link>
                          <Link to={`/schemes/${rec.scheme.id}`}>
                            <TactileButton variant="primary" size="sm">
                              Evaluate & Rules
                            </TactileButton>
                          </Link>
                        </div>
                      </div>
                    </InteractiveCard>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Recent Assessments */}
            <div className="bg-white p-6 rounded-lg border border-stone-300 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Recent Assessments
                  </h2>
                  <p className="text-xs text-stone-500">
                    Historical evaluations with condition breakdowns and grounded explanations.
                  </p>
                </div>
              </div>

              {recentAssessments.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-stone-300 rounded text-xs text-stone-500">
                  You haven't run any formal eligibility evaluations yet. Click "Evaluate & Rules" on any scheme to generate a full report.
                </div>
              ) : (
                <div className="divide-y divide-stone-200">
                  {recentAssessments.slice(0, 4).map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={!shouldReduceMotion ? { x: 2 } : undefined}
                      transition={MOTION_SPRINGS.tactile}
                      className="py-3.5 flex justify-between items-center transition-all"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {item.scheme.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5 font-hud-mono">
                          Evaluated on {new Date(item.created_at).toLocaleDateString('en-IN')} • Match: {Math.round(item.match_score)}%
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <ResultStatusBadge result={item.overall_result} />
                        <Link
                          to={`/assessments/${item.id}`}
                          className="text-xs font-bold text-slate-900 hover:underline"
                        >
                          View Report →
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right 4 cols: Quick Actions, Saved Schemes, Verification Notice */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions HUD */}
            <div className="bg-slate-900 text-white p-5 rounded-lg shadow-sm space-y-3 border border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider font-hud-mono text-stone-300">
                  Advisory Actions & Tools
                </h3>
                <span className="text-[10px] text-amber-400 font-hud-mono">P21.NAV</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-300">
                <li>
                  <Link
                    to="/ai-assistant"
                    className="hover:text-white flex items-center justify-between py-2 border-b border-stone-800 text-amber-300 group transition-colors"
                  >
                    <span className="flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-400" />
                      <span className="font-semibold">Ask AI Scheme Advisor</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/schemes"
                    className="hover:text-white flex items-center justify-between py-2 border-b border-stone-800 group transition-colors"
                  >
                    <span>Browse 100+ Central Schemes</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/compare"
                    className="hover:text-white flex items-center justify-between py-2 border-b border-stone-800 group transition-colors"
                  >
                    <span>Compare Subsidies & Caps</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/checklist"
                    className="hover:text-white flex items-center justify-between py-2 border-b border-stone-800 group transition-colors"
                  >
                    <span>Prepare Document Checklist</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="hover:text-white flex items-center justify-between py-2 group transition-colors"
                  >
                    <span>Update Profile & Outlay</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Saved Schemes List */}
            <div className="bg-white p-5 rounded-lg border border-stone-300 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center font-hud-mono">
                  <Bookmark className="w-4 h-4 text-stone-600 mr-1.5" />
                  <span>Saved Schemes ({savedSchemes.length})</span>
                </h3>
                <Link to="/saved-schemes" className="text-xs font-bold text-slate-900 hover:underline">
                  View All
                </Link>
              </div>

              {savedSchemes.length === 0 ? (
                <p className="text-xs text-stone-500 py-3 leading-relaxed">
                  No schemes saved. Bookmark schemes while browsing to track them here.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {savedSchemes.slice(0, 3).map((s) => (
                    <motion.div
                      key={s.id}
                      whileHover={!shouldReduceMotion ? { y: -1 } : undefined}
                      transition={MOTION_SPRINGS.tactile}
                      className="p-2.5 bg-stone-50 rounded border border-stone-200 text-xs hover:border-stone-300 transition-colors"
                    >
                      <Link to={`/schemes/${s.scheme_id}`} className="font-bold text-slate-900 hover:underline block truncate">
                        {s.scheme.name}
                      </Link>
                      <span className="text-[11px] text-stone-500 block mt-0.5 font-hud-mono">
                        {s.scheme.ministry}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Official Verification Notice */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs text-emerald-950 space-y-1.5 relative overflow-hidden">
              <div className="flex items-center space-x-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="font-hud-mono">Official Criteria Verification</span>
              </div>
              <p className="text-emerald-900 leading-relaxed text-[11px]">
                Every assessment is evaluated deterministically against exact rules extracted from official Gazette notifications and MyScheme documentation. AI synthesizes explanations without altering criteria pass/fail decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
