import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { Scheme } from '../types';
import { VerificationBadge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { ShimmerSkeleton } from '../components/motion/ShimmerSkeleton';
import { Scale, ArrowLeft, ExternalLink, Check, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { MOTION_SPRINGS, staggerContainerVariants, staggerItemVariants } from '../styles/motion';

export const SchemeComparisonPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const idsParam = searchParams.get('ids') || '';
  const shouldReduceMotion = useReducedMotion();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToAdd, setSelectedToAdd] = useState<string>('');

  useEffect(() => {
    const fetchAllList = async () => {
      try {
        const list = await apiRequest<Scheme[]>('/api/schemes?limit=150');
        setAllSchemes(list);
      } catch (err) {
        console.error('Failed to load full scheme list:', err);
      }
    };
    fetchAllList();
  }, []);

  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true);
      if (!idsParam) {
        // Default compare first 3 schemes
        try {
          const list = await apiRequest<Scheme[]>('/api/schemes?status=Verified&limit=3');
          if (list.length >= 2) {
            const defaultIds = list.slice(0, 3).map((s) => s.id).join(',');
            const fullSchemes = await apiRequest<Scheme[]>(`/api/comparisons/compare?ids=${defaultIds}`);
            setSchemes(fullSchemes);
          }
        } catch (err) {
          console.error('Failed default compare:', err);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const fullSchemes = await apiRequest<Scheme[]>(`/api/comparisons/compare?ids=${idsParam}`);
        setSchemes(fullSchemes);
      } catch (err) {
        console.error('Failed fetching comparison schemes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [idsParam]);

  const handleRemoveScheme = (idToRemove: number) => {
    const updated = schemes.filter((s) => s.id !== idToRemove);
    setSchemes(updated);
    const newIds = updated.map((s) => s.id).join(',');
    setSearchParams(newIds ? { ids: newIds } : {});
    toast.info('Scheme removed from comparison matrix.');
  };

  const handleAddScheme = async () => {
    if (!selectedToAdd) return;
    const schemeId = Number(selectedToAdd);
    if (schemes.some((s) => s.id === schemeId)) {
      toast.info('This scheme is already in the comparison table.');
      return;
    }
    if (schemes.length >= 4) {
      toast.warning('You can compare up to 4 schemes simultaneously.');
      return;
    }

    try {
      const fullScheme = await apiRequest<Scheme>(`/api/schemes/${schemeId}`);
      const updated = [...schemes, fullScheme];
      setSchemes(updated);
      setSearchParams({ ids: updated.map((s) => s.id).join(',') });
      setSelectedToAdd('');
      toast.success(`Added ${fullScheme.name} to comparison.`);
    } catch (err) {
      console.error('Failed to add scheme to comparison:', err);
      toast.error('Failed to add scheme to comparison.');
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
          <ShimmerSkeleton className="h-4 w-32" />
          <div className="bg-white p-8 rounded-lg border border-stone-300 space-y-4">
            <ShimmerSkeleton className="h-8 w-64" />
            <ShimmerSkeleton className="h-32 w-full" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <Link
          to="/dashboard"
          className="text-xs font-semibold text-stone-600 hover:text-slate-900 inline-flex items-center group transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider font-hud-mono">
                Scheme Evaluation Matrix • MATRIX.DIFF
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center tracking-tight">
              <Scale className="w-6 h-6 text-slate-700 mr-2" />
              <span>Side-by-Side Scheme Comparison</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              Compare subsidy rates, project ceilings, target sectors, and mandatory document requirements.
            </p>
          </div>

          {/* Add Scheme Selector */}
          {schemes.length < 4 && (
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-stone-300 shadow-sm shrink-0">
              <select
                aria-label="Add scheme to comparison"
                value={selectedToAdd}
                onChange={(e) => setSelectedToAdd(e.target.value)}
                className="text-xs border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900 max-w-[200px] truncate cursor-pointer bg-stone-50"
              >
                <option value="">+ Add scheme to compare...</option>
                {allSchemes
                  .filter((s) => !schemes.some((cur) => cur.id === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.verification_status})
                    </option>
                  ))}
              </select>
              <TactileButton
                variant="primary"
                size="sm"
                onClick={handleAddScheme}
                disabled={!selectedToAdd}
              >
                Add
              </TactileButton>
            </div>
          )}
        </div>

        {schemes.length === 0 ? (
          <div className="bg-white p-12 text-center border border-dashed border-stone-300 rounded-lg space-y-3">
            <Scale className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-sm font-bold text-slate-900">No schemes selected for comparison</p>
            <Link to="/schemes" className="text-xs font-bold text-slate-900 hover:underline">
              Browse schemes to select for comparison →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="p-4 font-bold text-slate-900 w-1/5 min-w-[160px] font-hud-mono">Attribute</th>
                  {schemes.map((s) => (
                    <th key={s.id} className="p-4 font-bold text-slate-900 min-w-[240px] relative">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-amber-800 uppercase block font-bold truncate font-hud-mono">
                            {s.ministry}
                          </span>
                          <motion.button
                            whileTap={!shouldReduceMotion ? { scale: 0.9 } : undefined}
                            onClick={() => handleRemoveScheme(s.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>

                        <Link to={`/schemes/${s.id}`} className="text-sm hover:underline block text-slate-900 leading-snug font-bold">
                          {s.name}
                        </Link>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <VerificationBadge status={s.verification_status} size="sm" />
                          <Link
                            to={`/schemes/${s.id}/gap-analysis`}
                            className="text-[10px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-slate-900 rounded border border-stone-300 font-bold font-hud-mono"
                          >
                            Gap Analysis
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-hud-mono">
                {/* Row: Benefits Summary */}
                <tr className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-bold text-stone-800 bg-stone-50/50 font-sans">Financial Assistance & Benefits</td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-4 text-stone-700 leading-relaxed align-top whitespace-pre-line font-mono text-[11px]">
                      {s.benefits_summary}
                    </td>
                  ))}
                </tr>

                {/* Row: Target Beneficiaries */}
                <tr className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-bold text-stone-800 bg-stone-50/50 font-sans">Target Beneficiaries & Sectors</td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-4 text-stone-700 leading-relaxed align-top">
                      {s.target_beneficiaries || 'Individual entrepreneurs & enterprises'}
                    </td>
                  ))}
                </tr>

                {/* Row: Eligibility Rules Count */}
                <tr className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-bold text-stone-800 bg-stone-50/50 font-sans">Official Eligibility Rules</td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-4 text-stone-700 align-top space-y-1.5">
                      <span className="font-bold text-slate-900 block">{s.rules?.length || 0} deterministic rules</span>
                      <ul className="space-y-1 text-[11px] text-stone-600">
                        {(s.rules || []).slice(0, 4).map((r) => (
                          <li key={r.id} className="flex items-start">
                            <span className="text-stone-400 mr-1.5">•</span>
                            <span><strong>{r.rule_name}:</strong> {r.operator}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Row: Required Documents */}
                <tr className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-bold text-stone-800 bg-stone-50/50 font-sans">Required Documents</td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-4 text-stone-700 align-top">
                      <ul className="space-y-1 text-[11px]">
                        {(s.documents || []).map((doc) => (
                          <li key={doc.id} className="flex items-center text-stone-700">
                            <Check className={`w-3.5 h-3.5 mr-1 shrink-0 ${doc.is_mandatory ? 'text-emerald-600 font-bold' : 'text-stone-400'}`} />
                            <span className={doc.is_mandatory ? 'font-semibold text-slate-900' : 'text-stone-600'}>
                              {doc.document_name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Row: Official Application Portal */}
                <tr className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-bold text-stone-800 bg-stone-50/50 font-sans">Official Portal & Application</td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-4 align-top space-y-2">
                      <a
                        href={s.official_portal_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-900 font-bold hover:underline inline-flex items-center text-xs"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                      <Link
                        to={`/schemes/${s.id}`}
                        className="block text-[11px] text-stone-600 hover:text-slate-900 font-bold"
                      >
                        View Full Details →
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
};
