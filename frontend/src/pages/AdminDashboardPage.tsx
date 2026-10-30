import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { AdminStats, CatalogueCoverageStats } from '../types';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { InteractiveCard } from '../components/motion/InteractiveCard';
import { AnimatedCounter } from '../components/motion/AnimatedCounter';
import {
  Users, Shield, CheckCircle2,
  Activity, Database, ArrowRight, RefreshCw
} from 'lucide-react';
import {
  MOTION_SPRINGS,
  staggerContainerVariants,
  staggerItemVariants,
} from '../styles/motion';

export const AdminDashboardPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [coverage, setCoverage] = useState<CatalogueCoverageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [ingestionResult, setIngestionResult] = useState<string | null>(null);

  const fetchStatsAndCoverage = async () => {
    try {
      const [adminStats, coverageStats] = await Promise.all([
        apiRequest<AdminStats>('/api/admin/stats'),
        apiRequest<CatalogueCoverageStats>('/api/admin/coverage'),
      ]);
      setStats(adminStats);
      setCoverage(coverageStats);
    } catch (err) {
      console.error('Failed to load admin stats or coverage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndCoverage();
  }, []);

  const handleTriggerIngestion = async () => {
    setIngesting(true);
    setIngestionResult(null);
    try {
      const res = await apiRequest<{ message: string; verified_imported: number; candidates_imported: number }>(
        '/api/admin/ingestion/trigger',
        { method: 'POST' }
      );
      setIngestionResult(res.message);
      await fetchStatsAndCoverage();
    } catch (err: any) {
      setIngestionResult(err.message || 'Ingestion execution failed.');
    } finally {
      setIngesting(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-stone-500 font-hud-mono tracking-hud uppercase">
            Querying Governance Ledger...
          </span>
        </div>
      </div>
    );
  }

  const breakdown = stats.verification_breakdown || {};

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        {/* Header Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-5"
        >
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-hud font-hud-mono">
                Official System Governance • Secure Gateway
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Administrator Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              Real metrics calculated strictly from PostgreSQL tables and data pipeline audits.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <TactileButton
              variant="admin"
              size="sm"
              loading={ingesting}
              onClick={handleTriggerIngestion}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${ingesting ? 'animate-spin' : ''}`} />
              <span>{ingesting ? 'Executing Pipeline...' : 'Run Scheme Ingestion'}</span>
            </TactileButton>
          </div>
        </motion.div>

        {/* Ingestion Result Notification */}
        <AnimatePresence>
          {ingestionResult && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              transition={MOTION_SPRINGS.snappy}
              className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center space-x-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{ingestionResult}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Metrics Cards */}
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <InteractiveCard elevation="subtle" className="p-5 space-y-1">
            <span className="text-xs text-stone-500 font-medium block">Registered Users</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-hud-mono tabular-nums">
              <AnimatedCounter value={stats.total_users} />
            </p>
            <span className="text-[11px] text-emerald-700 font-semibold block font-hud-mono">
              {stats.active_users} active • {stats.deactivated_users} deactivated
            </span>
          </InteractiveCard>

          <InteractiveCard elevation="subtle" className="p-5 space-y-1">
            <span className="text-xs text-stone-500 font-medium block">Scheme Catalogue</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-hud-mono tabular-nums">
              <AnimatedCounter value={stats.total_schemes} />
            </p>
            <span className="text-[11px] text-stone-600 block font-hud-mono">
              {breakdown['Verified'] || 0} verified • {breakdown['Candidate'] || 0} candidate
            </span>
          </InteractiveCard>

          <InteractiveCard elevation="subtle" className="p-5 space-y-1">
            <span className="text-xs text-stone-500 font-medium block">Completed Assessments</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-hud-mono tabular-nums">
              <AnimatedCounter value={stats.total_assessments} />
            </p>
            <span className="text-[11px] text-stone-600 block font-hud-mono">
              Across registered entrepreneurs
            </span>
          </InteractiveCard>

          <InteractiveCard elevation="subtle" className="p-5 space-y-1">
            <span className="text-xs text-stone-500 font-medium block">Audit Trail Events</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-hud-mono tabular-nums">
              <AnimatedCounter value={stats.total_audit_events} />
            </p>
            <span className="text-[11px] text-stone-600 block font-hud-mono">
              {stats.recent_activity_count} in past 7 days
            </span>
          </InteractiveCard>
        </motion.div>

        {/* Dataset & Catalogue Coverage Report Card */}
        {coverage && (
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerItemVariants}
            className="bg-white rounded-lg border border-stone-300 shadow-xs p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-hud font-hud-mono">
                  Public Dataset Ingestion Audit
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center">
                  <Database className="w-5 h-5 text-slate-700 mr-2" />
                  <span>MyScheme Dataset Pipeline Coverage</span>
                </h2>
              </div>
              <span className="text-xs font-hud-mono px-2.5 py-1 bg-stone-100 rounded text-stone-700 border border-stone-200">
                Source: {coverage.dataset_name} ({coverage.dataset_license})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-stone-50 rounded border border-stone-200 space-y-0.5">
                <span className="text-stone-500 block font-medium">Discovered Files</span>
                <span className="text-lg font-bold text-slate-900 block font-hud-mono tabular-nums">
                  <AnimatedCounter value={coverage.total_source_files_discovered} />
                </span>
                <span className="text-[10px] text-stone-500 font-hud-mono">From Hugging Face repo</span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded border border-stone-200 space-y-0.5">
                <span className="text-stone-500 block font-medium">Unique Source Docs</span>
                <span className="text-lg font-bold text-slate-900 block font-hud-mono tabular-nums">
                  <AnimatedCounter value={coverage.unique_source_files} />
                </span>
                <span className="text-[10px] text-stone-500 font-hud-mono">
                  {coverage.duplicate_copies_detected} duplicate copies omitted
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded border border-stone-200 space-y-0.5">
                <span className="text-stone-500 block font-medium">Structured Rules</span>
                <span className="text-lg font-bold text-slate-900 block font-hud-mono tabular-nums">
                  <AnimatedCounter value={coverage.total_rules_defined} />
                </span>
                <span className="text-[10px] text-stone-500 font-hud-mono">Deterministic criteria</span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded border border-stone-200 space-y-0.5">
                <span className="text-stone-500 block font-medium">Catalogued Documents</span>
                <span className="text-lg font-bold text-slate-900 block font-hud-mono tabular-nums">
                  <AnimatedCounter value={coverage.total_documents_required} />
                </span>
                <span className="text-[10px] text-stone-500 font-hud-mono">Required certificates/proofs</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-600 border-t border-stone-100 font-hud-mono">
              <span>Official Sources Cited: <strong className="text-slate-900">{coverage.total_sources_cited}</strong></span>
              <span>•</span>
              <span>Specific Portal URLs: <strong className="text-slate-900">{coverage.schemes_with_specific_portal_links}</strong></span>
              <span>•</span>
              <span>Central Schemes in DB: <strong className="text-slate-900">{coverage.total_schemes_in_db}</strong></span>
            </div>
          </motion.div>
        )}

        {/* Admin Modules Navigation */}
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link to="/admin/users" className="block focus:outline-none">
            <InteractiveCard
              elevation="subtle"
              className="p-6 h-full text-left space-y-2 group cursor-pointer border border-stone-300 hover:border-slate-800 transition-colors"
            >
              <div className="flex justify-between items-center">
                <Users className="w-5 h-5 text-slate-700 group-hover:text-slate-900" />
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-slate-900 transition-transform group-hover:translate-x-0.5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">User Management</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Inspect user profiles, manage roles, and activate or deactivate accounts with audit reasons.
              </p>
            </InteractiveCard>
          </Link>

          <Link to="/admin/verification" className="block focus:outline-none">
            <InteractiveCard
              elevation="subtle"
              className="p-6 h-full text-left space-y-2 group cursor-pointer border border-stone-300 hover:border-amber-800 transition-colors"
            >
              <div className="flex justify-between items-center">
                <Shield className="w-5 h-5 text-amber-700 group-hover:text-amber-900" />
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-900 transition-transform group-hover:translate-x-0.5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Verification & Source Review</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Review candidate records, cross-check against official gazettes, approve or mark schemes stale.
              </p>
            </InteractiveCard>
          </Link>

          <Link to="/admin/audit-logs" className="block focus:outline-none">
            <InteractiveCard
              elevation="subtle"
              className="p-6 h-full text-left space-y-2 group cursor-pointer border border-stone-300 hover:border-slate-800 transition-colors"
            >
              <div className="flex justify-between items-center">
                <Activity className="w-5 h-5 text-slate-700 group-hover:text-slate-900" />
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-slate-900 transition-transform group-hover:translate-x-0.5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Security Audit Logs</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Real-time audit log of all administrative actions, logins, status updates, and security events.
              </p>
            </InteractiveCard>
          </Link>
        </motion.div>

        {/* Verification Status Breakdown Table */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="bg-white rounded-lg border border-stone-300 shadow-xs p-6 text-left space-y-4"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">
              Scheme Quality & Verification Breakdown
            </h3>
            <span className="text-[10px] font-hud-mono text-stone-500 uppercase tracking-hud">
              PROVENANCE METRICS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-emerald-50 rounded border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-800 font-hud-mono">Verified</span>
              <p className="text-xl font-extrabold text-emerald-950 mt-1 font-hud-mono tabular-nums">
                <AnimatedCounter value={breakdown['Verified'] || 0} />
              </p>
            </div>
            <div className="p-3.5 bg-blue-50 rounded border border-blue-200">
              <span className="text-[11px] font-semibold text-blue-800 font-hud-mono">Candidate Records</span>
              <p className="text-xl font-extrabold text-blue-950 mt-1 font-hud-mono tabular-nums">
                <AnimatedCounter value={breakdown['Candidate'] || 0} />
              </p>
            </div>
            <div className="p-3.5 bg-amber-50 rounded border border-amber-200">
              <span className="text-[11px] font-semibold text-amber-800 font-hud-mono">Needs Review</span>
              <p className="text-xl font-extrabold text-amber-950 mt-1 font-hud-mono tabular-nums">
                <AnimatedCounter value={breakdown['Needs Review'] || 0} />
              </p>
            </div>
            <div className="p-3.5 bg-stone-100 rounded border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-700 font-hud-mono">Stale / Superseded</span>
              <p className="text-xl font-extrabold text-stone-900 mt-1 font-hud-mono tabular-nums">
                <AnimatedCounter value={(breakdown['Stale'] || 0) + (breakdown['Superseded'] || 0)} />
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};
