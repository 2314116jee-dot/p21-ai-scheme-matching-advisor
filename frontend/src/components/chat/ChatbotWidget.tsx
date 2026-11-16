import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { apiRequest } from '../../api/client';
import {
  AIChatMessage,
  AIChatResponse,
  AIProviderStatusResponse,
  SuggestedAction,
} from '../../types';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Bot,
  User as UserIcon,
  BrainCircuit,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { VerificationBadge } from '../ui/Badge';
import { TactileButton } from '../motion/TactileButton';

const QUICK_PROMPTS = [
  'What is PMEGP and what are the subsidy rates?',
  'Which schemes offer collateral-free loans for MSMEs?',
  'What assistance is available for women entrepreneurs?',
  'How do I apply for Stand-Up India?',
];

export const ChatbotWidget: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Namaste! I am P21, your AI Scheme Advisor powered by local DeepSeek-R1 (1.5B). I can guide you through Central Government business grants, subsidies, and eligibility rules strictly grounded in official gazettes. How can I help your venture today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState<AIProviderStatusResponse | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if current route is a specific scheme detail page
  const schemeMatch = location.pathname.match(/\/schemes\/(\d+)/);
  const currentSchemeId = schemeMatch ? parseInt(schemeMatch[1], 10) : null;

  // Don't show floating button if already on full /ai-assistant page to prevent redundancy
  const isAIAssistantPage = location.pathname === '/ai-assistant';

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await apiRequest<AIProviderStatusResponse>('/api/ai/status');
        setProviderStatus(status);
      } catch (err) {
        console.warn('Chatbot unable to load AI status:', err);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (userText: string) => {
    const text = userText.trim();
    if (!text || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: AIChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Build lightweight conversation history for backend context
      const chatHistory = newHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await apiRequest<AIChatResponse>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          history: chatHistory.slice(-6),
          scheme_id: currentSchemeId,
          top_k: 4,
        }),
      });

      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMessage: AIChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: res.reply || res.answer_markdown,
        thought_process: res.thought_process,
        matched_schemes: res.matched_schemes,
        citations: res.citations,
        suggested_actions: res.suggested_actions,
        provider_used: res.provider_used,
        evidence_sufficiency: res.evidence_sufficiency,
        latency_ms: res.latency_ms,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat inquiry failed:', err);
      const errorMsg: AIChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'I encountered a communication issue connecting to the AI advisory service. Please ensure the local Ollama daemon is running with deepseek-r1:1.5b, or try again shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: SuggestedAction) => {
    const dest = action.url || action.target_url;
    if (action.target_id) {
      navigate(`/schemes/${action.target_id}`);
    } else if (dest) {
      window.open(dest, '_blank', 'noreferrer');
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Conversation cleared. How can I assist you with Central Government entrepreneur schemes?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setExpandedThoughts({});
    setExpandedCitations({});
  };

  if (isAIAssistantPage) {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              type="button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 150);
              }}
              className="group relative flex items-center space-x-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl border border-amber-500/40 cursor-pointer transition-all"
              aria-label="Open AI Scheme Chatbot"
            >
              <div className="relative">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
              </div>
              <span className="text-xs font-bold tracking-tight font-hud-mono">
                Ask P21 AI
              </span>
              {currentSchemeId && (
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded uppercase font-bold">
                  Context Active
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`fixed z-50 bg-white border border-stone-300 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all text-left ${
              isExpanded
                ? 'bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[680px] h-[85vh] max-h-[800px]'
                : 'bottom-6 right-6 w-[calc(100vw-32px)] sm:w-[420px] h-[580px] max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold font-hud-mono tracking-tight text-white">
                      P21 Scheme Advisor
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-stone-400 font-hud-mono block truncate max-w-[200px]">
                    {providerStatus?.model_name || 'deepseek-r1:1.5b'} • RAG Active
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-stone-400">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Reset Conversation"
                  className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Restore Normal Size' : 'Expand Drawer'}
                  className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors hidden sm:block"
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                  className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scheme Context Bar if on Scheme Details */}
            {currentSchemeId && (
              <div className="bg-amber-50/90 border-b border-amber-200/80 px-3 py-1.5 text-[11px] text-amber-900 flex items-center justify-between font-hud-mono shrink-0">
                <span className="truncate">
                  📌 Context pinned to Scheme #{currentSchemeId}
                </span>
                <span className="text-[10px] font-bold text-amber-800">
                  AUTO-GROUNDED
                </span>
              </div>
            )}

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/60 font-sans">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[92%] ${
                      msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                        msg.role === 'user'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-900 text-amber-400'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <UserIcon className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div
                      className={`p-3 rounded-lg text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white border border-stone-200 text-slate-900 shadow-sm'
                      }`}
                    >
                      {/* DeepSeek-R1 Thought Process Toggle */}
                      {msg.thought_process && (
                        <div className="mb-2 pb-2 border-b border-stone-200">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedThoughts((prev) => ({
                                ...prev,
                                [msg.id]: !prev[msg.id],
                              }))
                            }
                            className="flex items-center space-x-1.5 text-[10px] font-bold text-stone-500 hover:text-slate-900 font-hud-mono cursor-pointer"
                          >
                            <BrainCircuit className="w-3 h-3 text-purple-600" />
                            <span>
                              {expandedThoughts[msg.id]
                                ? 'Hide DeepSeek-R1 Reasoning'
                                : 'Show DeepSeek-R1 Reasoning Chain'}
                            </span>
                            {expandedThoughts[msg.id] ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {expandedThoughts[msg.id] && (
                            <div className="mt-1.5 p-2 bg-purple-50/70 border border-purple-200 rounded text-[11px] text-purple-900 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto">
                              {msg.thought_process}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Message Body */}
                      <div className="whitespace-pre-line break-words space-y-1">
                        {msg.content}
                      </div>

                      {/* Matched Schemes Embedded Chips */}
                      {msg.matched_schemes && msg.matched_schemes.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-2">
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block font-hud-mono">
                            Relevant Scheme Records:
                          </span>
                          <div className="space-y-1.5">
                            {msg.matched_schemes.slice(0, 3).map((s) => (
                              <div
                                key={s.id}
                                className="p-2 bg-stone-50 hover:bg-stone-100 rounded border border-stone-200 flex items-center justify-between gap-2"
                              >
                                <div className="truncate">
                                  <span className="font-bold text-[11px] text-slate-900 block truncate">
                                    {s.name}
                                  </span>
                                  <span className="text-[10px] text-stone-500 block truncate">
                                    {s.ministry}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigate(`/schemes/${s.id}`);
                                    setIsOpen(false);
                                  }}
                                  className="px-2 py-1 bg-white hover:bg-stone-200 text-slate-900 border border-stone-300 rounded text-[10px] font-bold font-hud-mono shrink-0 cursor-pointer"
                                >
                                  View
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Citations Toggle */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedCitations((prev) => ({
                                ...prev,
                                [msg.id]: !prev[msg.id],
                              }))
                            }
                            className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 font-hud-mono cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>
                              {expandedCitations[msg.id]
                                ? 'Hide Ground Truth Sources'
                                : `View ${msg.citations.length} Ground Truth Sources`}
                            </span>
                            {expandedCitations[msg.id] ? (
                              <ChevronUp className="w-2.5 h-2.5" />
                            ) : (
                              <ChevronDown className="w-2.5 h-2.5" />
                            )}
                          </button>

                          {expandedCitations[msg.id] && (
                            <div className="mt-1.5 space-y-1 text-[10px] font-hud-mono">
                              {msg.citations.map((c, i) => (
                                <div key={i} className="p-1.5 bg-emerald-50/60 rounded border border-emerald-200/70">
                                  <span className="font-bold text-emerald-950 block">
                                    {c.source_title}
                                  </span>
                                  <span className="text-stone-600 italic block line-clamp-2">
                                    "{c.evidence_excerpt}"
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Suggested Action Buttons */}
                      {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                        <div className="mt-2.5 pt-2 flex flex-wrap gap-1.5">
                          {msg.suggested_actions.slice(0, 2).map((act, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleActionClick(act)}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded text-[10px] font-bold font-hud-mono inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <span>{act.label}</span>
                              <ArrowRight className="w-2.5 h-2.5 text-stone-500" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.timestamp && (
                    <span className="text-[9px] text-stone-400 mt-1 px-8 font-hud-mono">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 text-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 shadow-sm flex items-center space-x-2 font-hud-mono">
                    <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    <span>DeepSeek-R1 is reasoning with official scheme records...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Starter Suggestion Chips if only welcome message exists */}
            {messages.length === 1 && (
              <div className="px-3 py-2 bg-stone-100/90 border-t border-stone-200 space-y-1 shrink-0">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block font-hud-mono">
                  Quick Inquiries:
                </span>
                <div className="flex flex-wrap gap-1">
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(qp)}
                      className="text-[10px] px-2 py-1 bg-white hover:bg-stone-200 text-stone-700 rounded border border-stone-300 text-left cursor-pointer transition-colors"
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-2.5 bg-white border-t border-stone-200 flex items-center space-x-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about subsidies, eligibility, Mudra, PMEGP..."
                className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder-stone-400"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 bg-slate-900 hover:bg-slate-800 disabled:bg-stone-300 text-white rounded cursor-pointer transition-colors"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
