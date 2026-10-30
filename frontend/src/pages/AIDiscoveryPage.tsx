import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { AIQueryResponse, AIProviderStatusResponse, SuggestedAction } from '../types';
import { VerificationBadge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { InteractiveCard } from '../components/motion/InteractiveCard';
import { ShimmerSkeleton } from '../components/motion/ShimmerSkeleton';
import {
  Sparkles, Search, ShieldCheck, ExternalLink, ArrowRight,
  AlertCircle, Zap, BookOpen, Layers, Copy
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  MOTION_SPRINGS,
  MOTION_DURATIONS,
  MOTION_EASINGS,
  staggerItemVariants,
} from '../styles/motion';

const SUGGESTED_QUERIES = [
  "Which Central Government schemes offer grants or subsidies for new manufacturing?",
  "What schemes can a woman entrepreneur access in India?",
  "What documents are required to apply for PMEGP?",
  "Which schemes provide credit support or collateral-free loans for micro-enterprises?",
  "What are the eligibility conditions for Stand-Up India?",
  "Which schemes support technology or startup ventures?"
];

export const AIDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<AIProviderStatusResponse | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await apiRequest<AIProviderStatusResponse>('/api/ai/status');
        setProviderStatus(status);
      } catch (err) {
        console.warn('Unable to load AI status:', err);
      }
    };
    fetchStatus();
  }, []);

  const handleSearch = async (queryString: string) => {
    const q = queryString.trim();
    if (!q || q.length < 3) return;
    setQuery(q);
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<AIQueryResponse>('/api/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ query: q, top_k: 5 }),
      });
      setResult(response);
    } catch (err: any) {
      console.error('AI Query failed:', err);
      setError(err.message || 'Failed to process inquiry. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: SuggestedAction) => {
    if (action.action_type === 'VIEW_SCHEME' && action.target_id) {
      navigate(`/schemes/${action.target_id}`);
    } else if (action.action_type === 'UPDATE_PROFILE') {
      navigate('/profile');
    } else if (action.action_type === 'VISIT_PORTAL' && action.url) {
      window.open(action.url, '_blank', 'noreferrer');
    } else if (action.action_type === 'APPLY_FILTER') {
      navigate('/schemes');
    }
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        {/* Header Banner */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="bg-white p-6 sm:p-8 rounded-lg border border-stone-300 shadow-sm space-y-3 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-600" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider font-hud-mono">
                Autonomous Advisory Layer • RAG.HYBRID
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center tracking-tight">
                <Sparkles className="w-6 h-6 text-amber-500 mr-2 shrink-0" />
                <span>AI Scheme Discovery & Advisory Engine</span>
              </h1>
            </div>

            {/* Provider Status Pill */}
            {providerStatus && (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-stone-100 border border-stone-300 rounded text-xs text-stone-700 shrink-0 font-hud-mono">
                <span className={`w-2 h-2 rounded-full ${
                  providerStatus.active_provider === 'gemini'
                    ? 'bg-blue-500'
                    : providerStatus.active_provider === 'ollama'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                } animate-pulse`} />
                <span className="font-bold text-slate-900 capitalize">{providerStatus.active_provider}</span>
                <span className="text-stone-400">|</span>
                <span className="text-[11px] font-mono text-stone-600 truncate max-w-[150px]">{providerStatus.model_name}</span>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
            Ask questions in natural language regarding Central Government subsidies, loan caps, target sectors, and eligibility requirements. Answers are strictly grounded in official gazettes and verified dataset records with zero hallucinated figures.
          </p>
        </motion.div>

        {/* Query Bar */}
        <div className="bg-white p-5 rounded-lg border border-stone-300 shadow-sm space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1 group">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Which schemes provide subsidies for solar or green manufacturing?"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder-stone-400 transition-all"
              />
            </div>
            <TactileButton
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || !query.trim()}
              loading={loading}
              loadingText="Retrieving Evidence..."
              leftIcon={!loading ? <Zap className="w-3.5 h-3.5 text-amber-400" /> : undefined}
            >
              Ask Advisor
            </TactileButton>
          </form>

          {/* Suggestion Chips with Tactile Feedback */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block font-hud-mono">
              Suggested Inquiries:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((sq, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  whileHover={!shouldReduceMotion ? { y: -1, scale: 1.015 } : undefined}
                  whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
                  transition={MOTION_SPRINGS.tactile}
                  onClick={() => handleSearch(sq)}
                  className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-slate-950 rounded border border-stone-200 transition-colors text-left cursor-pointer"
                >
                  {sq}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white p-8 rounded-lg border border-stone-300 shadow-sm text-center space-y-4">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Retrieving Grounded Scheme Evidence</h3>
              <p className="text-xs text-stone-500 font-hud-mono">
                Querying hybrid lexical and semantic index across Central Ministry guidelines...
              </p>
            </div>
            <div className="max-w-xl mx-auto space-y-2 pt-2">
              <ShimmerSkeleton className="h-4 w-full" count={3} />
            </div>
          </div>
        )}

        {/* Results View with Layered Animation */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MOTION_DURATIONS.deliberate, ease: MOTION_EASINGS.cinematic }}
            className="space-y-8"
          >
            {/* Grounded Synthesis Section */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-300 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center font-hud-mono">
                    <BookOpen className="w-4 h-4 text-amber-600 mr-1.5" />
                    Grounded Advisory Synthesis
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-hud-mono ${
                    result.evidence_sufficiency === 'SUFFICIENT'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : result.evidence_sufficiency === 'PARTIAL'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    Evidence: {result.evidence_sufficiency}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[11px] font-hud-mono text-stone-500">
                  <span>Engine: {result.provider_used}</span>
                  <span>•</span>
                  <span>Latency: {Math.round(result.latency_ms)}ms</span>
                  <span>•</span>
                  <span>Retrieved: {result.retrieval_count} docs</span>
                </div>
              </div>

              {/* Answer Markdown Body */}
              <div className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line bg-stone-50/70 p-5 rounded border border-stone-200 space-y-3 font-sans">
                {result.answer_markdown}
              </div>

              {/* Suggested Actions Row */}
              {result.suggested_actions && result.suggested_actions.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mr-1 font-hud-mono">
                    Suggested Actions:
                  </span>
                  {result.suggested_actions.map((act, i) => (
                    <TactileButton
                      key={i}
                      variant="primary"
                      size="sm"
                      onClick={() => handleActionClick(act)}
                      rightIcon={<ArrowRight className="w-3 h-3 text-stone-400" />}
                    >
                      {act.label}
                    </TactileButton>
                  ))}
                </div>
              )}
            </div>

            {/* Matched Schemes Grid */}
            {result.matched_schemes && result.matched_schemes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center tracking-tight">
                    <Layers className="w-4 h-4 text-slate-700 mr-2" />
                    Matched Central Government Schemes ({result.matched_schemes.length})
                  </h2>
                  <span className="text-xs text-stone-500 font-hud-mono">
                    AUTHORITATIVE.RECORDS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.matched_schemes.map((s) => (
                    <InteractiveCard
                      key={s.id}
                      className="p-5 border-stone-300 hover:border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider truncate font-hud-mono">
                            {s.ministry}
                          </span>
                          <VerificationBadge status={s.verification_status as any} size="sm" />
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 leading-snug">
                          {s.name}
                        </h3>

                        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                          {s.relevance_summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <Link to={`/schemes/${s.id}`}>
                            <TactileButton variant="primary" size="sm">
                              Evaluate & Rules
                            </TactileButton>
                          </Link>
                          <Link to={`/schemes/${s.id}/gap-analysis`}>
                            <TactileButton variant="secondary" size="sm">
                              Gap Analysis
                            </TactileButton>
                          </Link>
                        </div>

                        {s.portal_url && (
                          <a
                            href={s.portal_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-stone-600 hover:text-slate-900 inline-flex items-center"
                            title="Visit Official Portal"
                          >
                            <span>Portal</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </InteractiveCard>
                  ))}
                </div>
              </div>
            )}

            {/* Citations & Evidence Passages */}
            {result.citations && result.citations.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-stone-300 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center uppercase tracking-wide font-hud-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 mr-2" />
                  <span>Cited Ground Truth Sources ({result.citations.length})</span>
                </h3>

                <div className="divide-y divide-stone-200">
                  {result.citations.map((c, idx) => (
                    <div key={idx} className="py-3.5 space-y-1.5 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {c.scheme_name}
                        </span>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(c.evidence_excerpt);
                              toast.success('Gazette excerpt copied to clipboard.');
                            }}
                            className="text-[11px] font-medium text-stone-500 hover:text-stone-900 inline-flex items-center space-x-1 cursor-pointer font-hud-mono"
                            title="Copy Evidence Excerpt"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                          {c.source_url && (
                            <a
                              href={c.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-semibold text-emerald-800 hover:underline inline-flex items-center font-hud-mono"
                            >
                              <span>{c.source_title}</span>
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                      <blockquote className="text-xs text-stone-600 italic bg-stone-50 p-2.5 rounded border border-stone-200 leading-relaxed font-hud-mono">
                        "{c.evidence_excerpt}"
                      </blockquote>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};
