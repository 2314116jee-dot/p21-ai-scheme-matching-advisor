import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { Scheme } from '../types';
import { VerificationBadge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { ArrowLeft, CheckCircle2, ExternalLink, FileEdit, Check } from 'lucide-react';
import {
  MOTION_SPRINGS,
  staggerItemVariants,
} from '../styles/motion';

export const AdminVerificationPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);

  // Verification form state
  const [newStatus, setNewStatus] = useState<string>('Verified');
  const [verificationNotes, setVerificationNotes] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [sourceTitle, setSourceTitle] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSchemes = async () => {
    try {
      const data = await apiRequest<Scheme[]>('/api/schemes');
      setSchemes(data);
      if (data.length > 0 && !selectedScheme) {
        setSelectedScheme(data[0]);
        setNewStatus(data[0].verification_status);
        setVerificationNotes(data[0].verification_notes || '');
      }
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleSelectScheme = (s: Scheme) => {
    setSelectedScheme(s);
    setNewStatus(s.verification_status);
    setVerificationNotes(s.verification_notes || '');
    setSourceUrl('');
    setSourceTitle('');
    setSuccessMessage(null);
  };

  const handleSaveVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheme) return;

    if (!verificationNotes.trim()) {
      alert('Please provide verification evidence notes.');
      return;
    }

    setSaving(true);
    setSuccessMessage(null);
    try {
      const updated = await apiRequest<Scheme>(`/api/admin/schemes/${selectedScheme.id}/verification`, {
        method: 'PUT',
        body: JSON.stringify({
          verification_status: newStatus,
          verification_notes: verificationNotes.trim(),
          source_url: sourceUrl.trim() || null,
          source_title: sourceTitle.trim() || null,
        }),
      });

      setSelectedScheme(updated);
      setSchemes(schemes.map((s) => (s.id === updated.id ? updated : s)));
      setSuccessMessage(`Scheme verification updated to "${newStatus}" and recorded in audit log.`);
    } catch (err: any) {
      alert(err.message || 'Verification update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-stone-500 font-hud-mono tracking-hud uppercase">
            Loading Scheme Registry...
          </span>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <motion.div initial="initial" animate="animate" variants={staggerItemVariants}>
          <Link
            to="/admin"
            className="text-xs font-semibold text-stone-600 hover:text-slate-900 inline-flex items-center group transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Admin Dashboard</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="border-b border-stone-200 pb-5"
        >
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span className="text-xs font-bold text-amber-800 uppercase tracking-hud font-hud-mono">
              Quality Control & Provenance Verification
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Scheme Verification Review
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            Validate Candidate records against official ministry guidelines before publishing to verified status.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Scheme List Selector (4 cols) */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerItemVariants}
            className="lg:col-span-4 bg-white p-5 rounded-lg border border-stone-300 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-hud font-hud-mono">
                Scheme Records ({schemes.length})
              </h3>
              <span className="text-[10px] font-mono text-stone-500 font-hud-mono">POSTGRES TABLE</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {schemes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectScheme(s)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all block border ${
                    selectedScheme?.id === s.id
                      ? 'border-slate-900 bg-stone-100 font-semibold shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900 truncate max-w-[170px]">{s.name}</span>
                    <VerificationBadge status={s.verification_status} size="sm" />
                  </div>
                  <span className="text-[11px] text-stone-500 block truncate font-hud-mono">
                    {s.ministry}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Verification Review Form (8 cols) */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerItemVariants}
            className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-lg border border-stone-300 shadow-xs space-y-6"
          >
            {selectedScheme ? (
              <form onSubmit={handleSaveVerification} className="space-y-5">
                <div className="border-b border-stone-200 pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-800 uppercase font-hud-mono">
                      {selectedScheme.ministry}
                    </span>
                    <VerificationBadge status={selectedScheme.verification_status} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">
                    {selectedScheme.name}
                  </h2>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {selectedScheme.brief_description}
                  </p>
                  <div className="mt-2 text-xs">
                    <a
                      href={selectedScheme.official_portal_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-900 font-semibold hover:underline inline-flex items-center group"
                    >
                      <span>Check Live Portal ({selectedScheme.official_portal_url})</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </div>

                <AnimatePresence>
                  {successMessage && (
                    <motion.div
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                      transition={MOTION_SPRINGS.snappy}
                      className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center space-x-2 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{successMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Status Transition Control */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Target Verification Status
                  </label>
                  <select
                    aria-label="Target Verification Status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium focus:bg-white transition-colors"
                  >
                    <option value="Verified">Verified (Confirmed against Gazette/Portal)</option>
                    <option value="Candidate">Candidate (Awaiting Cross-Verification)</option>
                    <option value="Needs Review">Needs Review (Potential Guidelines Discrepancy)</option>
                    <option value="Stale">Stale (Outdated Budget Limits or Expired Phase)</option>
                    <option value="Superseded">Superseded (Replaced by Subsequent Policy)</option>
                    <option value="Rejected">Rejected (Ineligible or Spurious Entry)</option>
                  </select>
                </div>

                {/* Verification Notes */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Verification Rationale & Notes <span className="text-rose-600">* (Saved to Version Snapshot)</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Detail the specific ministry gazette or guideline section confirmed..."
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors leading-relaxed"
                  />
                </div>

                {/* Optional New Source */}
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center">
                    <FileEdit className="w-3.5 h-3.5 mr-1.5 text-stone-600" />
                    <span>Attach Official Source / Notification (Optional)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                        Source Title
                      </label>
                      <input
                        type="text"
                        value={sourceTitle}
                        onChange={(e) => setSourceTitle(e.target.value)}
                        placeholder="e.g. MSME Gazette Notification 2026"
                        className="w-full text-xs bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                        Source URL
                      </label>
                      <input
                        type="url"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs bg-white border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <TactileButton
                    type="submit"
                    variant="admin"
                    size="md"
                    loading={saving}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    <span>{saving ? 'Updating Status...' : 'Apply Verification Decision'}</span>
                  </TactileButton>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center text-xs text-stone-500 font-hud-mono">
                Select a scheme on the left to review verification details.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
