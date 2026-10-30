import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { Scheme, Assessment } from '../types';
import { useAuth } from '../context/AuthContext';
import { VerificationBadge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { InteractiveCard } from '../components/motion/InteractiveCard';
import { ShimmerSkeleton } from '../components/motion/ShimmerSkeleton';
import {
  ExternalLink, Bookmark, ShieldCheck, FileText, Sparkles, ChevronDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  MOTION_SPRINGS,
  staggerItemVariants,
} from '../styles/motion';

export const SchemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [expandedRule, setExpandedRule] = useState<number | null>(null);

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const data = await apiRequest<Scheme>(`/api/schemes/${id}`);
        setScheme(data);

        // Check if saved
        if (user) {
          const mySaved = await apiRequest<any[]>('/api/saved-schemes');
          const isSaved = mySaved.some((s) => s.scheme_id === Number(id));
          setSaved(isSaved);
        }
      } catch (err) {
        console.error('Error fetching scheme details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScheme();
  }, [id, user]);

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      if (saved) {
        await apiRequest(`/api/saved-schemes/${id}`, { method: 'DELETE' });
        setSaved(false);
        toast.info('Scheme removed from your saved bookmarks.');
      } else {
        await apiRequest('/api/saved-schemes', {
          method: 'POST',
          body: JSON.stringify({ scheme_id: Number(id) }),
        });
        setSaved(true);
        toast.success('Scheme saved to your bookmarks.');
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
      toast.error('Failed to update bookmark status.');
    }
  };

  const handleRunAssessment = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setAssessing(true);
    try {
      const res = await apiRequest<Assessment>('/api/assessments/run', {
        method: 'POST',
        body: JSON.stringify({ scheme_id: Number(id) }),
      });
      navigate(`/assessments/${res.id}`);
    } catch (err) {
      console.error('Failed to run assessment:', err);
    } finally {
      setAssessing(false);
    }
  };

  if (loading || !scheme) {
    return (
      <PageTransition>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-300 space-y-4">
            <ShimmerSkeleton className="h-4 w-40" />
            <ShimmerSkeleton className="h-8 w-3/4" />
            <ShimmerSkeleton className="h-16 w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <ShimmerSkeleton className="h-48 w-full" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <ShimmerSkeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        {/* Header Banner with Provenance Telemetry */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="bg-white p-6 sm:p-8 rounded-lg border border-stone-300 shadow-sm space-y-4 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider font-hud-mono">
              {scheme.ministry} {scheme.department && `• ${scheme.department}`}
            </span>
            <div className="flex items-center space-x-2">
              <VerificationBadge status={scheme.verification_status} />
              <motion.button
                whileHover={!shouldReduceMotion ? { scale: 1.02 } : undefined}
                whileTap={!shouldReduceMotion ? { scale: 0.96 } : undefined}
                transition={MOTION_SPRINGS.tactile}
                onClick={handleToggleSave}
                className={`p-2 rounded border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  saved
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Bookmark className={`w-4 h-4 transition-all ${saved ? 'fill-amber-600 text-amber-700' : ''}`} />
                <span>{saved ? 'Saved' : 'Save Scheme'}</span>
              </motion.button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {scheme.name}
          </h1>

          <p className="text-sm text-stone-600 leading-relaxed">
            {scheme.brief_description}
          </p>

          {/* Verification provenance citation */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-500 border-t border-stone-100 font-hud-mono">
            <span>Last Verified: {new Date(scheme.last_checked_date).toLocaleDateString('en-IN')}</span>
            <a
              href={scheme.official_portal_url}
              target="_blank"
              rel="noreferrer"
              className="text-slate-900 font-semibold hover:underline inline-flex items-center"
            >
              <span>Official Ministry Portal</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </motion.div>

        {/* Assessment Action Callout */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="bg-slate-900 text-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800"
        >
          <div className="space-y-1">
            <h3 className="font-bold text-base flex items-center text-white">
              <Sparkles className="w-4 h-4 text-amber-400 mr-2" />
              Evaluate Against Your Profile
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Run deterministic rules against your saved entrepreneur details to generate an official verification breakdown and gap roadmap.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
            <Link to={`/schemes/${scheme.id}/gap-analysis`} className="w-full sm:w-auto">
              <TactileButton variant="secondary" size="md" fullWidth>
                Gap Analysis
              </TactileButton>
            </Link>
            <TactileButton
              variant="accent"
              size="md"
              onClick={handleRunAssessment}
              loading={assessing}
              loadingText="Evaluating Criteria..."
              className="w-full sm:w-auto"
            >
              Run Eligibility Assessment
            </TactileButton>
          </div>
        </motion.div>

        {/* Scheme Detail Tabs / Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Benefits Section */}
            <InteractiveCard elevation="hud" className="p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Assistance & Financial Benefits
              </h2>
              <div className="p-4 bg-stone-50 rounded border border-stone-200 text-xs text-stone-800 leading-relaxed whitespace-pre-line font-hud-mono">
                {scheme.benefits_summary}
              </div>
              {scheme.detailed_description && (
                <p className="text-xs text-stone-600 leading-relaxed pt-2">
                  {scheme.detailed_description}
                </p>
              )}
            </InteractiveCard>

            {/* Structured Eligibility Rules */}
            <div className="bg-white p-6 rounded-lg border border-stone-300 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Official Eligibility Conditions ({scheme.rules?.length || 0})
                </h2>
                <span className="text-[11px] font-hud-mono text-stone-500">
                  DETERMINISTIC.RULES
                </span>
              </div>
              <div className="space-y-3">
                {(scheme.rules || []).map((rule) => (
                  <motion.div
                    key={rule.id}
                    layout
                    className="p-3.5 bg-stone-50 rounded border border-stone-200 text-xs space-y-2 cursor-pointer transition-colors hover:border-stone-300"
                    onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">{rule.rule_name}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-hud-mono ${
                          rule.is_hard_requirement ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {rule.is_hard_requirement ? 'Hard Condition' : 'Flexible Condition'}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${expandedRule === rule.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-stone-600 text-[11px] font-hud-mono">
                      Target: <code className="bg-stone-200/70 px-1 py-0.5 rounded">{rule.target_field}</code> • Operator: <span className="font-semibold text-slate-900">{rule.operator}</span>
                    </p>
                    <AnimatePresence>
                      {expandedRule === rule.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={MOTION_SPRINGS.snappy}
                          className="pt-2 border-t border-stone-200 text-[11px] text-stone-600 space-y-1 overflow-hidden"
                        >
                          <p><strong>Evaluation Failure Logic:</strong> {rule.failure_reason}</p>
                          {rule.source_reference && (
                            <p className="italic text-stone-500">
                              Official Source: {rule.source_reference}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Application Procedure */}
            <div className="bg-white p-6 rounded-lg border border-stone-300 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Application & Sanction Procedure
              </h2>
              <div className="text-xs text-stone-700 leading-relaxed whitespace-pre-line font-hud-mono">
                {scheme.application_procedure}
              </div>
            </div>
          </div>

          {/* Sidebar (4 cols): Documents & Citations */}
          <div className="lg:col-span-4 space-y-6">
            {/* Required Documents */}
            <div className="bg-white p-5 rounded-lg border border-stone-300 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center font-hud-mono">
                  <FileText className="w-4 h-4 text-stone-600 mr-1.5" />
                  <span>Required Documents</span>
                </h3>
                <Link to="/checklist" className="text-xs font-bold text-slate-900 hover:underline">
                  Checklist →
                </Link>
              </div>
              <div className="space-y-2">
                {(scheme.documents || []).map((doc) => (
                  <div key={doc.id} className="p-2.5 bg-stone-50 rounded border border-stone-200 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-slate-900">{doc.document_name}</span>
                      <span className={`text-[10px] font-bold font-hud-mono ${doc.is_mandatory ? 'text-rose-700' : 'text-stone-500'}`}>
                        {doc.is_mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                    {doc.issuing_authority && (
                      <span className="text-[11px] text-stone-500 block mt-0.5 font-hud-mono">
                        Issuer: {doc.issuing_authority}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Official Grounded Sources */}
            <div className="bg-white p-5 rounded-lg border border-stone-300 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center font-hud-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-700 mr-1.5" />
                <span>Verified Gazette Citations</span>
              </h3>
              <div className="space-y-3">
                {(scheme.sources || []).map((source) => (
                  <div key={source.id} className="p-2.5 bg-stone-50 rounded border border-stone-200 text-xs space-y-1">
                    <a
                      href={source.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-slate-900 hover:underline flex items-center"
                    >
                      <span className="line-clamp-1">{source.source_title}</span>
                      <ExternalLink className="w-3 h-3 ml-1 shrink-0 text-stone-400" />
                    </a>
                    <p className="text-[11px] text-stone-600 italic leading-relaxed">
                      "{source.extracted_passage}"
                    </p>
                    <p className="text-[10px] text-emerald-800 font-bold font-hud-mono pt-0.5">
                      ✓ Provenance: {source.provenance_fact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
