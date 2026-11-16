import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import {
  AIQueryResponse,
  AIProviderStatusResponse,
  SuggestedAction,
  AIChatMessage,
  AIChatResponse,
  SuggestedPromptsResponse,
} from '../types';
import { VerificationBadge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { InteractiveCard } from '../components/motion/InteractiveCard';
import { ShimmerSkeleton } from '../components/motion/ShimmerSkeleton';
import {
  Sparkles,
  Search,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  Zap,
  BookOpen,
  Layers,
  Copy,
  Bot,
  User as UserIcon,
  BrainCircuit,
  MessageSquare,
  RotateCcw,
  Send,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  MOTION_SPRINGS,
  MOTION_DURATIONS,
  MOTION_EASINGS,
  staggerItemVariants,
} from '../styles/motion';

export const AIDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();

  // Mode: 'chat' | 'search' | 'prompts'
  const [activeTab, setActiveTab] = useState<'chat' | 'search' | 'prompts'>('chat');

  // Search Mode state
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Chat Mode state
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Namaste! I am P21, an authoritative AI Scheme Advisor for Indian Entrepreneurs powered by local DeepSeek-R1 (1.5B) in Ollama. All my guidance is strictly grounded in official Government of India gazettes, scheme criteria, and ministry notifications.\n\nAsk me about subsidies (like PMEGP's 15%-35% margin money), collateral-free loans (CGTMSE, Mudra), women entrepreneur concessions, or application checklists!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});

  // Provider Status & Curated Prompts
  const [providerStatus, setProviderStatus] = useState<AIProviderStatusResponse | null>(null);
  const [suggestedCategories, setSuggestedCategories] = useState<SuggestedPromptsResponse | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStatusAndPrompts = async () => {
      try {
        const [status, prompts] = await Promise.allSettled([
          apiRequest<AIProviderStatusResponse>('/api/ai/status'),
          apiRequest<SuggestedPromptsResponse>('/api/ai/suggested-prompts'),
        ]);
        if (status.status === 'fulfilled') setProviderStatus(status.value);
        if (prompts.status === 'fulfilled') setSuggestedCategories(prompts.value);
      } catch (err) {
        console.warn('Unable to load AI diagnostics:', err);
      }
    };
    fetchStatusAndPrompts();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, chatLoading]);

  // Single Search Execution
  const handleSearch = async (queryString: string) => {
    const q = queryString.trim();
    if (!q || q.length < 3) return;
    setQuery(q);
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<AIQueryResponse>('/api/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ query: q, top_k: 5, verified_only: verifiedOnly }),
      });
      setResult(response);
    } catch (err: any) {
      console.error('AI Query failed:', err);
      setError(err.message || 'Failed to process inquiry. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Conversational Chat Execution
  const handleSendChat = async (messageText: string) => {
    const text = messageText.trim();
    if (!text || chatLoading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newThread = [...chatMessages, userMsg];
    setChatMessages(newThread);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      const historyPayload = newThread
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await apiRequest<AIChatResponse>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          history: historyPayload.slice(-6),
          verified_only: verifiedOnly,
          top_k: 5,
        }),
      });

      const assistantMsg: AIChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.reply || response.answer_markdown,
        thought_process: response.thought_process,
        matched_schemes: response.matched_schemes,
        citations: response.citations,
        suggested_actions: response.suggested_actions,
        provider_used: response.provider_used,
        evidence_sufficiency: response.evidence_sufficiency,
        latency_ms: response.latency_ms,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat failed:', err);
      setChatError(err.message || 'Communication with AI advisory service failed.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleActionClick = (action: SuggestedAction) => {
    const dest = action.url || action.target_url;
    if (action.action_type === 'VIEW_SCHEME' && action.target_id) {
      navigate(`/schemes/${action.target_id}`);
    } else if (action.action_type === 'UPDATE_PROFILE') {
      navigate('/profile');
    } else if (action.action_type === 'VISIT_PORTAL' && dest) {
      window.open(dest, '_blank', 'noreferrer');
    } else if (action.action_type === 'APPLY_FILTER') {
      navigate('/schemes');
    } else if (action.target_id) {
      navigate(`/schemes/${action.target_id}`);
    }
  };

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Conversation history cleared. How can I guide you with Central Government entrepreneur schemes today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setExpandedThoughts({});
    setExpandedCitations({});
    toast.info('Chat session refreshed.');
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-left">
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
                Conversational Advisory Layer • RAG.HYBRID • DeepSeek-R1 (1.5B)
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center tracking-tight">
                <Sparkles className="w-6 h-6 text-amber-500 mr-2 shrink-0" />
                <span>AI Scheme Advisor & Discovery Hub</span>
              </h1>
            </div>

            {/* Provider Status Pill */}
            {providerStatus && (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-stone-100 border border-stone-300 rounded text-xs text-stone-700 shrink-0 font-hud-mono">
                <span
                  className={`w-2 h-2 rounded-full ${
                    providerStatus.active_provider === 'ollama' || providerStatus.provider === 'ollama'
                      ? 'bg-emerald-500'
                      : providerStatus.active_provider === 'gemini'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  } animate-pulse`}
                />
                <span className="font-bold text-slate-900 capitalize">
                  {providerStatus.active_provider || providerStatus.provider || 'ollama'}
                </span>
                <span className="text-stone-400">|</span>
                <span className="text-[11px] font-mono text-stone-600 truncate max-w-[170px]">
                  {providerStatus.model_name || 'deepseek-r1:1.5b'}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
            Ask multi-turn questions about subsidies, margin money rates, loan ceilings, eligible sectors, and application processes. Answers are synthesized by the local DeepSeek-R1 (1.5B) model and strictly grounded in official Gazette records with zero hallucinated figures.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-3.5 py-1.5 rounded text-xs font-bold font-hud-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Interactive Chatbot</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`px-3.5 py-1.5 rounded text-xs font-bold font-hud-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === 'search'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Scheme Query Matrix</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('prompts')}
                className={`px-3.5 py-1.5 rounded text-xs font-bold font-hud-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === 'prompts'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Curated Pathways</span>
              </button>
            </div>

            {/* Filter Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-hud-mono text-stone-600">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-stone-300 text-slate-900 focus:ring-slate-900"
              />
              <span>Verified Gazette Records Only</span>
            </label>
          </div>
        </motion.div>

        {/* TAB 1: INTERACTIVE CONVERSATIONAL CHATBOT */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg border border-stone-300 shadow-sm flex flex-col h-[700px] overflow-hidden">
            {/* Chat Header Control Strip */}
            <div className="bg-stone-100/90 border-b border-stone-200 px-5 py-2.5 flex items-center justify-between text-xs font-hud-mono">
              <div className="flex items-center space-x-2 text-stone-700">
                <Bot className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-900">Conversational Thread</span>
                <span className="text-stone-400">•</span>
                <span className="text-stone-500">
                  {chatMessages.length - 1} message{chatMessages.length !== 2 ? 's' : ''}
                </span>
              </div>

              <button
                type="button"
                onClick={clearChatHistory}
                className="text-stone-600 hover:text-rose-700 inline-flex items-center space-x-1 font-bold cursor-pointer"
                title="Clear Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Chat</span>
              </button>
            </div>

            {/* Chat Thread Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-stone-50/50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-[94%] sm:max-w-[85%] ${
                      msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        msg.role === 'user'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-900 text-amber-400'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <UserIcon className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-lg text-xs sm:text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-stone-200 text-slate-900'
                      }`}
                    >
                      {/* DeepSeek-R1 Thought Process Accordion */}
                      {msg.thought_process && (
                        <div className="mb-3 pb-2.5 border-b border-stone-200">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedThoughts((prev) => ({
                                ...prev,
                                [msg.id]: !prev[msg.id],
                              }))
                            }
                            className="flex items-center space-x-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 font-hud-mono cursor-pointer"
                          >
                            <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                            <span>
                              {expandedThoughts[msg.id]
                                ? 'Collapse DeepSeek-R1 Reasoning Chain'
                                : 'View DeepSeek-R1 Reasoning Chain (Internal Thinking)'}
                            </span>
                            {expandedThoughts[msg.id] ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {expandedThoughts[msg.id] && (
                            <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-900 whitespace-pre-wrap font-mono leading-relaxed max-h-56 overflow-y-auto">
                              {msg.thought_process}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Message Markdown Body */}
                      <div className="whitespace-pre-line leading-relaxed font-sans space-y-2">
                        {msg.content}
                      </div>

                      {/* Matched Schemes Interactive Grid */}
                      {msg.matched_schemes && msg.matched_schemes.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-stone-100 space-y-2.5">
                          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block font-hud-mono">
                            🏛️ Grounded Central Schemes ({msg.matched_schemes.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {msg.matched_schemes.map((s) => (
                              <div
                                key={s.id}
                                className="p-3 bg-stone-50 hover:bg-stone-100 rounded border border-stone-200 flex flex-col justify-between space-y-2"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-hud-mono truncate">
                                      {s.ministry}
                                    </span>
                                    <VerificationBadge status={s.verification_status as any} size="sm" />
                                  </div>
                                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                                    {s.name}
                                  </h4>
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/schemes/${s.id}`)}
                                    className="text-[11px] font-bold text-slate-900 hover:underline font-hud-mono inline-flex items-center space-x-1 cursor-pointer"
                                  >
                                    <span>Rules & Criteria</span>
                                    <ArrowRight className="w-3 h-3 text-stone-500" />
                                  </button>

                                  {s.portal_url && (
                                    <a
                                      href={s.portal_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[10px] font-medium text-stone-500 hover:text-slate-900 inline-flex items-center space-x-0.5"
                                    >
                                      <span>Portal</span>
                                      <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cited Sources Accordion */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedCitations((prev) => ({
                                ...prev,
                                [msg.id]: !prev[msg.id],
                              }))
                            }
                            className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 font-hud-mono cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {expandedCitations[msg.id]
                                ? 'Hide Official Citations'
                                : `View ${msg.citations.length} Verified Sources & Gazette Facts`}
                            </span>
                            {expandedCitations[msg.id] ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {expandedCitations[msg.id] && (
                            <div className="mt-2 space-y-2 text-xs">
                              {msg.citations.map((c, i) => (
                                <div key={i} className="p-2.5 bg-emerald-50/70 rounded border border-emerald-200 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-slate-900">
                                      {c.scheme_name}
                                    </span>
                                    {c.source_url && (
                                      <a
                                        href={c.source_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[11px] text-emerald-800 font-semibold hover:underline inline-flex items-center"
                                      >
                                        <span>{c.source_title}</span>
                                        <ExternalLink className="w-2.5 h-2.5 ml-1" />
                                      </a>
                                    )}
                                  </div>
                                  <p className="text-stone-700 italic font-mono text-[11px]">
                                    "{c.evidence_excerpt}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Suggested Actions Pill Row */}
                      {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                        <div className="mt-3 pt-2.5 flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold text-stone-500 uppercase font-hud-mono mr-1">
                            Recommended Actions:
                          </span>
                          {msg.suggested_actions.map((act, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleActionClick(act)}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded text-xs font-bold font-hud-mono inline-flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              <span>{act.label}</span>
                              <ArrowRight className="w-3 h-3 text-stone-400" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.timestamp && (
                    <span className="text-[10px] text-stone-400 mt-1 px-10 font-hud-mono">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              ))}

              {/* Chat Loading Skeleton */}
              {chatLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 bg-white border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-600 shadow-sm flex items-center space-x-3 font-hud-mono">
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>DeepSeek-R1 (1.5B) is reasoning through official scheme gazettes...</span>
                  </div>
                </div>
              )}

              {/* Chat Error Notice */}
              {chatError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{chatError}</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat(chatInput);
              }}
              className="p-4 bg-white border-t border-stone-200 flex items-center space-x-3 shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask follow-up, eligibility requirements, or details (e.g. Can I get a loan if I am from Bihar?)..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder-stone-400"
                disabled={chatLoading}
              />
              <TactileButton
                type="submit"
                variant="primary"
                size="md"
                disabled={chatLoading || !chatInput.trim()}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </TactileButton>
            </form>
          </div>
        )}

        {/* TAB 2: SCHEME QUERY MATRIX (Single Search) */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-lg border border-stone-300 shadow-sm space-y-4">
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

              {/* Suggestion Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block font-hud-mono">
                  Sample Queries:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Which Central Government schemes offer grants or subsidies for new manufacturing?",
                    "What schemes can a woman entrepreneur access in India?",
                    "What documents are required to apply for PMEGP?",
                    "Which schemes provide credit support or collateral-free loans for micro-enterprises?",
                    "What are the eligibility conditions for Stand-Up India?",
                  ].map((sq, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSearch(sq)}
                      className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-slate-950 rounded border border-stone-200 text-left cursor-pointer transition-colors"
                    >
                      {sq}
                    </button>
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
                    Querying hybrid lexical and semantic index with DeepSeek-R1 synthesis...
                  </p>
                </div>
                <div className="max-w-xl mx-auto space-y-2 pt-2">
                  <ShimmerSkeleton className="h-4 w-full" count={3} />
                </div>
              </div>
            )}

            {/* Results View */}
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: MOTION_DURATIONS.deliberate, ease: MOTION_EASINGS.cinematic }}
                className="space-y-8"
              >
                {/* Synthesis Section */}
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

                  {/* DeepSeek Reasoning if present */}
                  {result.thought_process && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-900 font-mono leading-relaxed space-y-1">
                      <span className="font-bold flex items-center space-x-1 text-[11px]">
                        <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                        <span>DeepSeek-R1 Reasoning Chain:</span>
                      </span>
                      <p className="whitespace-pre-wrap">{result.thought_process}</p>
                    </div>
                  )}

                  {/* Answer Markdown Body */}
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line bg-stone-50/70 p-5 rounded border border-stone-200 space-y-3 font-sans">
                    {result.answer_markdown || result.answer}
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
        )}

        {/* TAB 3: CURATED ENTREPRENEUR PATHWAYS */}
        {activeTab === 'prompts' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-stone-300 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-slate-900">
                Curated Inquiry Pathways for Indian Founders
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Click any inquiry below to start a conversational consultation with DeepSeek-R1 (1.5B) in the Chatbot.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedCategories?.categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-lg border border-stone-300 shadow-sm space-y-3"
                >
                  <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
                    <span className="text-base">✨</span>
                    <h3 className="font-bold text-sm text-slate-900 font-hud-mono uppercase tracking-wide">
                      {cat.category}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {cat.prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          setActiveTab('chat');
                          handleSendChat(p.query);
                        }}
                        className="w-full text-left p-3 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-amber-800 transition-colors">
                            {p.title}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 transition-colors" />
                        </div>
                        <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                          {p.query}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};
