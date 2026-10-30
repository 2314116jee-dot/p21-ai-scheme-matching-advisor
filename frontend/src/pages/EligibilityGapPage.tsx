import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { EligibilityGapAnalysis } from '../types';
import { ResultStatusBadge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { InteractiveCard } from '../components/motion/InteractiveCard';
import { AnimatedCounter } from '../components/motion/AnimatedCounter';
import { ShimmerSkeleton } from '../components/motion/ShimmerSkeleton';
import {
  ArrowLeft, CheckCircle2, XCircle, HelpCircle, AlertTriangle,
  FileText, ExternalLink, ArrowRight, UserCheck
} from 'lucide-react';
import {
  MOTION_SPRINGS,
  staggerContainerVariants,
  staggerItemVariants,
} from '../styles/motion';

export const EligibilityGapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<EligibilityGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const fetchGapAnalysis = async () => {
      try {
        const res = await apiRequest<EligibilityGapAnalysis>(`/api/assessments/gap-analysis/${id}`);
        setData(res);
      } catch (err: any) {
        console.error('Failed to load gap analysis:', err);
        setError(err.message || 'Unable to load eligibility gap analysis.');
      } finally {
        setLoading(false);
      }
    };

    fetchGapAnalysis();
  }, [id]);

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
          <ShimmerSkeleton className="h-4 w-32" />
          <div className="bg-white p-8 rounded-lg border border-stone-300 space-y-4">
            <ShimmerSkeleton className="h-4 w-40" />
            <ShimmerSkeleton className="h-8 w-64" />
            <ShimmerSkeleton className="h-16 w-full" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !data) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Eligibility Gap Analysis Unavailable</h2>
          <p className="text-xs text-stone-600">{error || 'Scheme could not be found or assessed.'}</p>
          <Link to="/schemes" className="text-xs font-bold text-slate-900 hover:underline inline-block">
            Return to Scheme Directory →
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <Link
          to={`/schemes/${data.scheme_id}`}
          className="text-xs font-semibold text-stone-600 hover:text-slate-900 inline-flex items-center group transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Scheme Details</span>
        </Link>

        {/* Header Banner */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="bg-white p-6 sm:p-8 rounded-lg border border-stone-300 shadow-sm space-y-4 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider font-hud-mono">
              Deterministic Eligibility Roadmap • GAP.EVAL
            </span>
            <ResultStatusBadge result={data.overall_result as any} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
            Eligibility Gap Analysis: {data.scheme_name}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded bg-stone-50 border border-stone-200">
            <div>
              <span className="text-xs text-stone-500 block mb-0.5 font-hud-mono">Recommended Next Action:</span>
              <p className="text-xs font-bold text-slate-900 leading-relaxed">
                {data.recommended_action}
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-stone-500 block mb-0.5 font-hud-mono">Calculated Compatibility:</span>
              <span className="text-2xl font-extrabold text-slate-900 font-hud-mono">
                <AnimatedCounter value={Math.round(data.match_score)} suffix="%" />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Missing Information (Profile Gaps) */}
        {data.missing_profile_fields.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-amber-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Missing Information In Your Profile ({data.missing_profile_fields.length})
                </h2>
              </div>
              <Link
                to="/profile"
                className="text-xs font-bold text-slate-900 hover:underline flex items-center group font-hud-mono"
              >
                <span>Edit Profile</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              The following parameters could not be evaluated because they are not yet filled in your profile. Supplying these details will instantly resolve the eligibility ambiguity.
            </p>

            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainerVariants(0.06, 0.05)}
              className="space-y-3"
            >
              {data.missing_profile_fields.map((mf, i) => (
                <motion.div
                  key={i}
                  variants={staggerItemVariants}
                  className="p-3.5 bg-amber-50/60 border border-amber-200 rounded text-xs space-y-1 font-hud-mono"
                >
                  <div className="flex justify-between items-center font-bold text-amber-950 font-sans">
                    <span>{mf.rule_name}</span>
                    <code className="text-[10px] bg-amber-200/60 px-1.5 py-0.5 rounded font-mono">{mf.field}</code>
                  </div>
                  <p className="text-stone-700 font-sans leading-relaxed">{mf.prompt}</p>
                  <p className="text-[11px] text-stone-500 italic font-sans">
                    <strong>Why it matters:</strong> {mf.why_it_matters}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <div className="pt-2">
              <Link to="/profile">
                <TactileButton variant="primary" size="md" leftIcon={<UserCheck className="w-3.5 h-3.5 text-stone-300" />}>
                  Update Profile Attributes Now
                </TactileButton>
              </Link>
            </div>
          </div>
        )}

        {/* Disqualified / Failed Rules */}
        {data.failed_rules.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-rose-300 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-rose-100 pb-3">
              <XCircle className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Unmet Criteria / Disqualifications ({data.failed_rules.length})
              </h2>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Your venture parameters currently conflict with official Ministry requirements for this scheme:
            </p>

            <div className="space-y-3">
              {data.failed_rules.map((rule, i) => (
                <div key={i} className="p-3.5 bg-rose-50/60 border border-rose-200 rounded text-xs space-y-1 text-rose-950 font-hud-mono">
                  <div className="flex justify-between font-bold font-sans">
                    <span>{rule.rule_name}</span>
                    <span className="text-rose-800 text-[10px] uppercase font-semibold">
                      {rule.is_hard_requirement ? 'Hard Disqualification' : 'Flexible'}
                    </span>
                  </div>
                  <p className="text-stone-700 font-sans leading-relaxed">{rule.reason}</p>
                  <div className="flex items-center space-x-4 text-[11px] text-stone-500 pt-1">
                    <span>Your Value: <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">{String(rule.user_value)}</code></span>
                    <span>Expected: <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">{JSON.stringify(rule.expected_value)}</code></span>
                  </div>
                  {rule.source_reference && (
                    <p className="text-[11px] text-stone-500 italic pt-0.5 font-sans">
                      Official Reference: {rule.source_reference}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Satisfied Criteria */}
        {data.passed_rules.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-stone-300 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Satisfied Official Conditions ({data.passed_rules.length})
              </h2>
            </div>

            <div className="space-y-2.5">
              {data.passed_rules.map((rule, i) => (
                <div key={i} className="p-3 bg-emerald-50/40 border border-emerald-200 rounded text-xs space-y-1 text-emerald-950">
                  <div className="flex justify-between font-bold">
                    <span>{rule.rule_name}</span>
                    <span className="text-emerald-700 text-[10px] uppercase font-bold font-hud-mono">Criteria Satisfied</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">{rule.reason}</p>
                  {rule.source_reference && (
                    <p className="text-[11px] text-stone-500 italic">
                      Source: {rule.source_reference}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Readiness Summary */}
        <div className="bg-white p-6 rounded-lg border border-stone-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Application Document Readiness ({data.document_readiness.mandatory_count} Mandatory of {data.document_readiness.total_documents} Total)
              </h2>
            </div>
            <Link
              to="/checklist"
              className="text-xs font-bold text-slate-900 hover:underline font-hud-mono"
            >
              Track in Checklist →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.document_readiness.documents.map((doc) => (
              <div key={doc.id} className="p-3 bg-stone-50 rounded border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between items-start font-semibold text-slate-900">
                  <span>{doc.document_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-hud-mono font-bold ${doc.is_mandatory ? 'bg-rose-100 text-rose-900' : 'bg-stone-200 text-stone-700'}`}>
                    {doc.is_mandatory ? 'Mandatory' : 'Optional'}
                  </span>
                </div>
                {doc.issuing_authority && (
                  <p className="text-[11px] text-stone-500 font-hud-mono">
                    Issuer: {doc.issuing_authority}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Official Portal Outlink */}
        <div className="p-5 bg-slate-900 text-white rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3 border border-slate-800">
          <div className="text-xs space-y-0.5">
            <span className="font-bold block text-sm">Ready to initiate your formal application?</span>
            <span className="text-stone-300 block">Apply strictly through official Union Government portals. Beware of unauthorized intermediaries.</span>
          </div>
          <a
            href={data.official_portal_url}
            target="_blank"
            rel="noreferrer"
          >
            <TactileButton variant="secondary" size="md" rightIcon={<ExternalLink className="w-3.5 h-3.5 ml-1" />}>
              Visit Official Portal
            </TactileButton>
          </a>
        </div>
      </div>
    </PageTransition>
  );
};
