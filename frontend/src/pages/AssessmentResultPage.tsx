import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { Assessment } from '../types';
import { ResultStatusBadge, VerificationBadge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { InteractiveCard } from '../components/motion/InteractiveCard';
import { AnimatedCounter } from '../components/motion/AnimatedCounter';
import { ShimmerSkeleton } from '../components/motion/ShimmerSkeleton';
import {
  CheckCircle2, XCircle, HelpCircle, ExternalLink, ShieldCheck,
  FileText, ArrowLeft, Sparkles
} from 'lucide-react';
import {
  MOTION_SPRINGS,
  MOTION_DURATIONS,
  MOTION_EASINGS,
  staggerContainerVariants,
  staggerItemVariants,
} from '../styles/motion';

export const AssessmentResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const data = await apiRequest<Assessment>(`/api/assessments/${id}`);
        setAssessment(data);
      } catch (err) {
        console.error('Error fetching assessment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  if (loading || !assessment) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
          <ShimmerSkeleton className="h-4 w-32" />
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-300 space-y-4">
            <ShimmerSkeleton className="h-4 w-40" />
            <ShimmerSkeleton className="h-8 w-3/4" />
            <ShimmerSkeleton className="h-16 w-full" />
          </div>
          <div className="bg-white p-6 rounded-lg border border-stone-300 space-y-4">
            <ShimmerSkeleton className="h-6 w-48" />
            <ShimmerSkeleton className="h-20 w-full" count={3} />
          </div>
        </div>
      </PageTransition>
    );
  }

  const { overall_result, match_score, passed_conditions, failed_conditions, missing_conditions, scheme } = assessment;

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <Link
          to="/dashboard"
          className="text-xs font-semibold text-stone-600 hover:text-slate-900 inline-flex items-center group transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        {/* SEQUENCE 1: The assessment panel settles into place */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.99 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: MOTION_DURATIONS.deliberate, ease: MOTION_EASINGS.cinematic }}
          className="bg-white p-6 sm:p-8 rounded-lg border border-stone-300 shadow-sm space-y-4 relative overflow-hidden"
        >
          {/* Tactical top indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider font-hud-mono">
              {scheme.ministry}
            </span>
            <div className="flex items-center space-x-2">
              <VerificationBadge status={scheme.verification_status} size="sm" />
              <span className="text-xs text-stone-500 font-hud-mono">
                Assessed: {new Date(assessment.created_at).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {scheme.name}
          </h1>

          {/* SEQUENCE 2: The overall result appears with spring impact */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={{ delay: 0.18, duration: MOTION_DURATIONS.standard, ease: MOTION_EASINGS.cinematic }}
            className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded bg-stone-50 border border-stone-200"
          >
            <div>
              <span className="text-xs text-stone-500 font-hud-mono block mb-1">Evaluation Outcome:</span>
              <ResultStatusBadge result={overall_result} animated />
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-stone-500 font-hud-mono block mb-1">Deterministic Match Score:</span>
              <span className="text-2xl font-extrabold text-slate-900 font-hud-mono">
                <AnimatedCounter value={match_score} suffix="%" />
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* SEQUENCE 3: Individual conditions reveal in a deliberate sequence */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: MOTION_DURATIONS.deliberate, ease: MOTION_EASINGS.cinematic }}
          className="bg-white p-6 rounded-lg border border-stone-300 shadow-sm space-y-6"
        >
          <div className="flex justify-between items-center border-b border-stone-200 pb-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Condition Verification Matrix
            </h2>
            <span className="text-xs font-hud-mono text-stone-500">
              100% Deterministic Engine
            </span>
          </div>

          {/* Failed Conditions */}
          {failed_conditions.length > 0 && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainerVariants(0.06, 0.4)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs uppercase tracking-wide font-hud-mono">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Unmet Conditions ({failed_conditions.length})</span>
              </div>
              <div className="space-y-2">
                {failed_conditions.map((c, i) => (
                  <motion.div
                    key={i}
                    variants={staggerItemVariants}
                    className="p-3.5 bg-rose-50/60 border border-rose-200 rounded text-xs text-rose-950 space-y-1"
                  >
                    <div className="flex justify-between font-bold">
                      <span>{c.rule_name}</span>
                      <span className="text-rose-700 font-hud-mono font-semibold">
                        {c.is_hard_requirement ? 'Hard Disqualification' : 'Flexible'}
                      </span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">{c.reason}</p>
                    {c.source_reference && (
                      <p className="text-[11px] text-stone-500 italic">Source: {c.source_reference}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Missing Conditions */}
          {missing_conditions.length > 0 && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainerVariants(0.06, 0.48)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wide font-hud-mono">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Profile Information Needed ({missing_conditions.length})</span>
              </div>
              <div className="space-y-2">
                {missing_conditions.map((c, i) => (
                  <motion.div
                    key={i}
                    variants={staggerItemVariants}
                    className="p-3.5 bg-amber-50/60 border border-amber-200 rounded text-xs text-amber-950 space-y-1"
                  >
                    <div className="flex justify-between font-bold">
                      <span>{c.rule_name}</span>
                      <span className="text-amber-800 font-hud-mono font-semibold">Unknown / Missing</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">{c.reason}</p>
                    <Link to="/profile" className="text-[11px] font-bold text-slate-900 hover:underline inline-block pt-1">
                      Update profile to clarify this rule →
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Passed Conditions */}
          {passed_conditions.length > 0 && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainerVariants(0.06, 0.54)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wide font-hud-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Satisfied Conditions ({passed_conditions.length})</span>
              </div>
              <div className="space-y-2">
                {passed_conditions.map((c, i) => (
                  <motion.div
                    key={i}
                    variants={staggerItemVariants}
                    className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded text-xs text-emerald-950 space-y-1"
                  >
                    <div className="flex justify-between font-bold">
                      <span>{c.rule_name}</span>
                      <span className="text-emerald-700 font-hud-mono font-semibold">Satisfied</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">{c.reason}</p>
                    {c.source_reference && (
                      <p className="text-[11px] text-stone-500 italic">Source: {c.source_reference}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* SEQUENCE 4: Supporting evidence panels become available */}
        {assessment.ai_explanation && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: MOTION_DURATIONS.deliberate, ease: MOTION_EASINGS.cinematic }}
            className="bg-white p-6 rounded-lg border border-stone-300 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Advisory Synthesis & Explanation
                </h2>
              </div>
              <span className="text-[11px] font-mono text-stone-500 font-hud-mono">
                Engine: {assessment.ai_provider_used || 'deterministic_rules_engine'}
              </span>
            </div>

            <div className="text-xs text-stone-800 leading-relaxed whitespace-pre-line bg-stone-50 p-4 rounded border border-stone-200 font-hud-mono">
              {assessment.ai_explanation}
            </div>

            {/* Citations List */}
            {assessment.sources_cited && assessment.sources_cited.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center font-hud-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                  <span>Cited Official Sources</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-600">
                  {assessment.sources_cited.map((s, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-stone-400 font-bold">•</span>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-900 font-semibold hover:underline inline-flex items-center"
                      >
                        <span>{s.title}</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                      <span className="text-stone-500">— {s.fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* SEQUENCE 5: Next-action controls appear */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.82, duration: MOTION_DURATIONS.standard, ease: MOTION_EASINGS.cinematic }}
          className="p-4 bg-stone-100 rounded-lg border border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3"
        >
          <Link
            to={`/checklist`}
            className="text-xs font-bold text-slate-900 hover:underline flex items-center group"
          >
            <FileText className="w-4 h-4 mr-1.5 text-stone-700" />
            <span>Prepare Application Document Checklist for this Scheme →</span>
          </Link>
          <a
            href={scheme.official_portal_url}
            target="_blank"
            rel="noreferrer"
          >
            <TactileButton variant="primary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Visit Official Portal
            </TactileButton>
          </a>
        </motion.div>
      </div>
    </PageTransition>
  );
};
