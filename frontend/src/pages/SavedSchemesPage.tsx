import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { SavedScheme } from '../types';
import { VerificationBadge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { InteractiveCard } from '../components/motion/InteractiveCard';
import { AnimatedCounter } from '../components/motion/AnimatedCounter';
import { ShimmerSkeleton } from '../components/motion/ShimmerSkeleton';
import { Bookmark, Trash2, Scale } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { MOTION_SPRINGS, staggerContainerVariants, staggerItemVariants } from '../styles/motion';

export const SavedSchemesPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [savedSchemes, setSavedSchemes] = useState<SavedScheme[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const fetchSaved = async () => {
    try {
      const data = await apiRequest<SavedScheme[]>('/api/saved-schemes');
      setSavedSchemes(data);
    } catch (err) {
      console.error('Error fetching saved schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (schemeId: number) => {
    try {
      await apiRequest(`/api/saved-schemes/${schemeId}`, { method: 'DELETE' });
      setSavedSchemes((prev) => prev.filter((s) => s.scheme_id !== schemeId));
      setSelectedForCompare((prev) => prev.filter((id) => id !== schemeId));
      toast.success('Scheme removed from your saved bookmarks.');
    } catch (err) {
      toast.error('Failed to remove scheme from bookmarks.');
    }
  };

  const toggleCompare = (id: number) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare((prev) => prev.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 4) {
        toast.warning('You can compare a maximum of 4 schemes at once.');
        return;
      }
      setSelectedForCompare((prev) => [...prev, id]);
    }
  };

  const handleGoCompare = () => {
    if (selectedForCompare.length < 2) {
      toast.info('Please select at least 2 schemes to run the comparison matrix.');
      return;
    }
    navigate(`/compare?ids=${selectedForCompare.join(',')}`);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
          <ShimmerSkeleton className="h-4 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShimmerSkeleton className="h-56 w-full" count={4} />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider font-hud-mono">
                Personal Repository • BOOKMARKS.LIST
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Saved Schemes (<AnimatedCounter value={savedSchemes.length} />)
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              Bookmark schemes to monitor requirements and run matrix comparisons.
            </p>
          </div>

          {selectedForCompare.length > 0 && (
            <TactileButton
              variant="primary"
              size="md"
              onClick={handleGoCompare}
              leftIcon={<Scale className="w-4 h-4" />}
            >
              Compare Selected ({selectedForCompare.length})
            </TactileButton>
          )}
        </div>

        {savedSchemes.length === 0 ? (
          <div className="bg-white p-12 text-center border border-dashed border-stone-300 rounded-lg space-y-3">
            <Bookmark className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900">No Saved Schemes</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              You haven't saved any government schemes yet. Explore our directory to bookmark schemes relevant to your venture.
            </p>
            <Link to="/schemes" className="inline-block mt-2">
              <TactileButton variant="primary" size="sm">
                Explore Schemes Directory
              </TactileButton>
            </Link>
          </div>
        ) : (
          <motion.div
            layout
            initial="initial"
            animate="animate"
            variants={staggerContainerVariants(0.06, 0.02)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {savedSchemes.map((s) => {
              const isChecked = selectedForCompare.includes(s.scheme_id);
              return (
                <InteractiveCard
                  key={s.id}
                  className={`p-6 flex flex-col justify-between transition-all ${
                    isChecked ? 'border-slate-900 ring-1 ring-slate-900' : 'border-stone-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wide font-hud-mono">
                        {s.scheme.ministry}
                      </span>
                      <VerificationBadge status={s.scheme.verification_status} size="sm" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      <Link to={`/schemes/${s.scheme_id}`} className="hover:underline">
                        {s.scheme.name}
                      </Link>
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {s.scheme.brief_description}
                    </p>

                    <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs text-stone-700 font-hud-mono">
                      <strong className="block text-slate-900 mb-0.5 font-sans">Benefits:</strong>
                      <span className="line-clamp-2">{s.scheme.benefits_summary}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCompare(s.scheme_id)}
                        className="w-4 h-4 text-slate-900 border-stone-300 rounded focus:ring-slate-900 cursor-pointer"
                      />
                      <span className="text-stone-700 font-bold font-hud-mono">Select for Compare</span>
                    </label>

                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/schemes/${s.scheme_id}`}
                        className="font-bold text-slate-900 hover:underline font-hud-mono"
                      >
                        Details →
                      </Link>
                      <motion.button
                        whileTap={!shouldReduceMotion ? { scale: 0.9 } : undefined}
                        onClick={() => handleRemove(s.scheme_id)}
                        className="text-stone-400 hover:text-rose-700 p-1 rounded transition-colors cursor-pointer"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </InteractiveCard>
              );
            })}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};
