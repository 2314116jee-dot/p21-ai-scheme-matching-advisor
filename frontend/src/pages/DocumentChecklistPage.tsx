import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { Scheme, DocumentChecklistItem } from '../types';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { AnimatedCounter } from '../components/motion/AnimatedCounter';
import { ShimmerSkeleton } from '../components/motion/ShimmerSkeleton';
import { CheckSquare, Printer, Filter, ExternalLink } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { MOTION_SPRINGS } from '../styles/motion';

export const DocumentChecklistPage: React.FC = () => {
  const toast = useToast();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<DocumentChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'missing' | 'in_progress' | 'available'>('all');
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const shouldReduceMotion = useReducedMotion();

  const fetchChecklist = useCallback(async (schemeId: number) => {
    try {
      const data = await apiRequest<DocumentChecklistItem[]>(`/api/checklist/scheme/${schemeId}`);
      setChecklist(data);
    } catch (err) {
      console.error('Failed to load checklist:', err);
    }
  }, []);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const data = await apiRequest<Scheme[]>('/api/schemes?limit=100');
        setSchemes(data);
        if (data.length > 0) {
          const firstId = data[0].id;
          setSelectedSchemeId(firstId);
          fetchChecklist(firstId);
        }
      } catch (err) {
        console.error('Failed to load schemes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [fetchChecklist]);

  const handleSelectScheme = (schemeId: number) => {
    setSelectedSchemeId(schemeId);
    setStatusFilter('all');
    fetchChecklist(schemeId);
  };

  const handleStatusChange = async (documentId: number, newStatus: string) => {
    if (!selectedSchemeId) return;
    setUpdating(documentId);
    try {
      await apiRequest(`/api/checklist/scheme/${selectedSchemeId}/document/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setChecklist((prev) =>
        prev.map((item) =>
          item.document_id === documentId ? { ...item, status: newStatus as any } : item
        )
      );
      toast.success(`Document marked as ${newStatus.replace('_', ' ')}.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update document status.');
    } finally {
      setUpdating(null);
    }
  };

  const handleSaveNotes = async (documentId: number) => {
    if (!selectedSchemeId) return;
    setUpdating(documentId);
    try {
      const item = checklist.find((c) => c.document_id === documentId);
      await apiRequest(`/api/checklist/scheme/${selectedSchemeId}/document/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: item?.status || 'missing', notes: tempNotes }),
      });
      setChecklist((prev) =>
        prev.map((c) =>
          c.document_id === documentId ? { ...c, notes: tempNotes } : c
        )
      );
      setEditingNotesId(null);
      toast.success('Document notes saved.');
    } catch (err) {
      console.error('Failed to save notes:', err);
      toast.error('Failed to save notes.');
    } finally {
      setUpdating(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
          <ShimmerSkeleton className="h-4 w-40" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <ShimmerSkeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-8 space-y-4">
              <ShimmerSkeleton className="h-24 w-full" />
              <ShimmerSkeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId);
  const availableCount = checklist.filter((c) => c.status === 'available').length;
  const inProgressCount = checklist.filter((c) => c.status === 'in_progress').length;
  const missingCount = checklist.filter((c) => c.status === 'missing').length;
  const progressPct = checklist.length > 0 ? Math.round((availableCount / checklist.length) * 100) : 0;

  const filteredChecklist = checklist.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider font-hud-mono">
                Application Readiness • DOCS.VERIFY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center tracking-tight">
              <CheckSquare className="w-6 h-6 text-slate-700 mr-2" />
              <span>Document Checklist & Verification Tracker</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              Track certificate readiness, project reports, and identity documents required by Central Ministries.
            </p>
          </div>

          <TactileButton
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5 text-stone-600" />}
            className="print:hidden shrink-0"
          >
            Print / Export Checklist
          </TactileButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Scheme Selector Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white p-5 rounded-lg border border-stone-300 shadow-sm space-y-3 print:hidden">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-hud-mono">
                Select Scheme ({schemes.length})
              </h3>
              {selectedScheme && (
                <Link to={`/schemes/${selectedScheme.id}`} className="text-[11px] text-stone-600 hover:text-slate-900 font-bold inline-flex items-center font-hud-mono">
                  <span>Details</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              )}
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {schemes.map((s) => (
                <motion.button
                  key={s.id}
                  whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
                  onClick={() => handleSelectScheme(s.id)}
                  className={`w-full text-left p-3 rounded text-xs transition-colors block cursor-pointer ${
                    selectedSchemeId === s.id
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-stone-50 text-stone-800 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <span className="block truncate font-medium">{s.name}</span>
                  <div className="flex items-center justify-between mt-1 font-hud-mono">
                    <span className={`text-[10px] truncate max-w-[170px] ${selectedSchemeId === s.id ? 'text-stone-300' : 'text-stone-500'}`}>
                      {s.ministry}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      s.verification_status === 'Verified' ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-800'
                    }`}>
                      {s.verification_status}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Document Checklist Area (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Progress Banner with Animated Number */}
            <div className="bg-white p-5 rounded-lg border border-stone-300 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                <div>
                  <span className="font-semibold text-stone-600 block text-[11px] font-hud-mono">Readiness Progress for:</span>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5">{selectedScheme?.name}</h3>
                </div>
                <span className="font-extrabold text-slate-900 sm:text-right shrink-0 font-hud-mono text-sm">
                  {availableCount} of {checklist.length} Ready (<AnimatedCounter value={progressPct} suffix="%" />)
                </span>
              </div>

              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${progressPct}%` }}
                  transition={MOTION_SPRINGS.snappy}
                  className="bg-emerald-600 h-2.5"
                />
              </div>

              {/* Filter Tabs */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-stone-100 print:hidden font-hud-mono">
                <span className="text-[11px] font-bold text-stone-500 mr-1 flex items-center">
                  <Filter className="w-3 h-3 mr-1" /> Filter:
                </span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`text-[11px] px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                    statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  All ({checklist.length})
                </button>
                <button
                  onClick={() => setStatusFilter('missing')}
                  className={`text-[11px] px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                    statusFilter === 'missing' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  Missing ({missingCount})
                </button>
                <button
                  onClick={() => setStatusFilter('in_progress')}
                  className={`text-[11px] px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                    statusFilter === 'in_progress' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  In Progress ({inProgressCount})
                </button>
                <button
                  onClick={() => setStatusFilter('available')}
                  className={`text-[11px] px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                    statusFilter === 'available' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Ready ({availableCount})
                </button>
              </div>
            </div>

            {/* Documents Table */}
            <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden">
              <div className="p-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 font-hud-mono">
                  Official Document Checklist ({filteredChecklist.length})
                </h3>
                <span className="text-xs text-stone-500 font-hud-mono print:hidden">
                  Auto-saved to your profile
                </span>
              </div>

              {filteredChecklist.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500 font-hud-mono">
                  {checklist.length === 0
                    ? 'No documents catalogued yet for this scheme.'
                    : 'No documents match the selected filter.'}
                </div>
              ) : (
                <div className="divide-y divide-stone-200">
                  {filteredChecklist.map((item) => (
                    <motion.div
                      key={item.document_id}
                      layout
                      className="p-4 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                              {item.document_name}
                            </h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-hud-mono ${
                              item.is_mandatory ? 'bg-rose-100 text-rose-900 border border-rose-200' : 'bg-stone-100 text-stone-600'
                            }`}>
                              {item.is_mandatory ? 'Mandatory' : 'Optional'}
                            </span>
                          </div>
                          {item.issuing_authority && (
                            <p className="text-[11px] text-stone-500 font-hud-mono">
                              Issuing Authority: <strong className="text-stone-700">{item.issuing_authority}</strong>
                            </p>
                          )}
                        </div>

                        {/* Status Selector */}
                        <div className="shrink-0 print:hidden">
                          <select
                            aria-label={`Status for ${item.document_name}`}
                            disabled={updating === item.document_id}
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.document_id, e.target.value)}
                            className={`text-xs font-bold rounded px-2.5 py-1.5 border focus:outline-none cursor-pointer font-hud-mono transition-colors ${
                              item.status === 'available'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : item.status === 'in_progress'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-stone-50 text-stone-700 border-stone-300'
                            }`}
                          >
                            <option value="missing">Missing / Need to Procure</option>
                            <option value="in_progress">In Progress / Applied</option>
                            <option value="available">Available / Ready</option>
                            <option value="not_applicable">Not Applicable</option>
                          </select>
                        </div>
                      </div>

                      {item.instructions && (
                        <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded border border-stone-200 leading-relaxed font-sans">
                          {item.instructions}
                        </p>
                      )}

                      {/* Notes Field */}
                      <div className="pt-1 text-[11px] print:hidden font-hud-mono">
                        {editingNotesId === item.document_id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              placeholder="Add reference number, file location, or remarks..."
                              className="flex-1 px-2.5 py-1 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 bg-stone-50"
                            />
                            <TactileButton
                              variant="primary"
                              size="sm"
                              onClick={() => handleSaveNotes(item.document_id)}
                            >
                              Save
                            </TactileButton>
                            <TactileButton
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingNotesId(null)}
                            >
                              Cancel
                            </TactileButton>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-stone-500">
                            <span>
                              {item.notes ? (
                                <span className="text-stone-700 font-sans"><strong>Note:</strong> {item.notes}</span>
                              ) : (
                                <span className="italic text-stone-400">No personal remarks recorded</span>
                              )}
                            </span>
                            <button
                              onClick={() => {
                                setEditingNotesId(item.document_id);
                                setTempNotes(item.notes || '');
                              }}
                              className="text-slate-900 hover:underline font-bold ml-2 cursor-pointer"
                            >
                              {item.notes ? 'Edit' : '+ Add Note'}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
