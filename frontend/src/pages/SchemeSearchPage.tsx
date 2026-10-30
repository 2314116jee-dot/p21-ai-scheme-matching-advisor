import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { Scheme } from '../types';
import { VerificationBadge } from '../components/ui/Badge';
import { PageTransition } from '../components/motion/PageTransition';
import { InteractiveCard } from '../components/motion/InteractiveCard';
import { TactileButton } from '../components/motion/TactileButton';
import { AnimatedCounter } from '../components/motion/AnimatedCounter';
import { ShimmerSkeleton } from '../components/motion/ShimmerSkeleton';
import { Search, ArrowRight, RotateCcw } from 'lucide-react';
import {
  MOTION_SPRINGS,
  staggerContainerVariants,
  staggerItemVariants,
} from '../styles/motion';

export const SchemeSearchPage: React.FC = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [ministries, setMinistries] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (selectedMinistry) params.append('ministry', selectedMinistry);
      if (selectedStatus) params.append('status', selectedStatus);

      const data = await apiRequest<Scheme[]>(`/api/schemes?${params.toString()}`);
      setSchemes(data);
    } catch (err) {
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const mins = await apiRequest<string[]>('/api/schemes/ministries');
        setMinistries(mins);
      } catch (err) {
        console.error('Error fetching ministries:', err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSchemes();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedMinistry, selectedStatus]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMinistry('');
    setSelectedStatus('');
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider font-hud-mono">
              Central Government Repository • CATALOGUE.LIVE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Explore Government Schemes
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            Search across verified Central Government subsidy programmes, loan guarantees, and seed capital funds.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-lg border border-stone-300 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative group">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
            <input
              type="text"
              aria-label="Search by scheme name, keywords, or benefits"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scheme name, keywords, or benefits..."
              className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          {/* Ministry Filter */}
          <div className="md:col-span-4">
            <select
              aria-label="Filter by Ministry"
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">All Ministries</option>
              {ministries.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="md:col-span-3">
            <select
              aria-label="Filter by Verification Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">All Verification Statuses</option>
              <option value="Verified">Verified Only</option>
              <option value="Candidate">Candidate Records</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Stale">Stale / Archived</option>
            </select>
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex justify-between items-center text-xs font-hud-mono text-stone-600">
          <span>
            Displaying <strong className="text-slate-900"><AnimatedCounter value={schemes.length} /></strong> verified scheme records
          </span>
          {(searchQuery || selectedMinistry || selectedStatus) && (
            <button
              onClick={handleResetFilters}
              className="text-stone-700 hover:text-slate-950 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Scheme Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-stone-300 p-6 space-y-3">
                <div className="flex justify-between">
                  <ShimmerSkeleton className="h-4 w-32" />
                  <ShimmerSkeleton className="h-4 w-16" />
                </div>
                <ShimmerSkeleton className="h-6 w-3/4" />
                <ShimmerSkeleton className="h-12 w-full" />
                <ShimmerSkeleton className="h-14 w-full" />
              </div>
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={MOTION_SPRINGS.snappy}
            className="bg-white p-12 text-center border border-dashed border-stone-300 rounded-lg space-y-3"
          >
            <p className="text-sm font-bold text-slate-900">No matching schemes found</p>
            <p className="text-xs text-stone-500">
              Try adjusting your search keywords or clearing ministry and status filters.
            </p>
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={handleResetFilters}
            >
              Reset Filters
            </TactileButton>
          </motion.div>
        ) : (
          <motion.div
            layout
            initial="initial"
            animate="animate"
            variants={staggerContainerVariants(0.05, 0.02)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {schemes.map((scheme) => (
              <InteractiveCard
                key={scheme.id}
                className="p-6 flex flex-col justify-between hover:border-slate-800"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-800 tracking-wide uppercase line-clamp-1 font-hud-mono">
                      {scheme.ministry}
                    </span>
                    <VerificationBadge status={scheme.verification_status} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    <Link to={`/schemes/${scheme.id}`} className="hover:underline">
                      {scheme.name}
                    </Link>
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {scheme.brief_description}
                  </p>

                  <div className="p-3 bg-stone-50 rounded border border-stone-200/80 text-xs">
                    <span className="font-bold text-slate-900 block mb-0.5 font-hud-mono">Key Benefit:</span>
                    <span className="text-stone-700 line-clamp-2 leading-relaxed">{scheme.benefits_summary}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500 font-hud-mono">
                    Updated: {new Date(scheme.last_checked_date).toLocaleDateString('en-IN')}
                  </span>
                  <Link to={`/schemes/${scheme.id}`}>
                    <TactileButton variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Evaluate Scheme
                    </TactileButton>
                  </Link>
                </div>
              </InteractiveCard>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};
