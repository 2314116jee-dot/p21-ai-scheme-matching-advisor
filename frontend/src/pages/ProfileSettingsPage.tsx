import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import {
  User, Check, Building2, MapPin, IndianRupee, AlertCircle, Shield, Sparkles
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  MOTION_SPRINGS,
  staggerContainerVariants,
  staggerItemVariants,
} from '../styles/motion';

export const ProfileSettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiRequest<UserProfile>('/api/profile');
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSuccessMessage('');
    try {
      const updated = await apiRequest<UserProfile>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      setProfile(updated);
      setSuccessMessage('Profile parameters updated successfully.');
      toast.success('Business profile updated successfully.');
      await refreshUser();
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to save profile. Please verify your fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-stone-500 font-hud-mono tracking-hud uppercase">
            Loading Profile Telemetry...
          </span>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="border-b border-stone-200 pb-5"
        >
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span className="text-xs font-bold text-stone-500 uppercase tracking-hud font-hud-mono">
              Account & Enterprise Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Profile & Business Settings
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            Maintain your venture's parameters to ensure high accuracy matching with Central Government schemes.
          </p>
        </motion.div>

        {/* Success Banner */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              transition={MOTION_SPRINGS.snappy}
              className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center space-x-2 shadow-xs"
            >
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          onSubmit={handleSave}
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {/* Account Details Box */}
          <motion.div
            variants={staggerItemVariants}
            className="bg-white p-6 rounded-lg border border-stone-300 shadow-xs space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center">
                <User className="w-4 h-4 mr-2 text-stone-600" />
                <span>Account Identity</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-100 rounded text-stone-500 border border-stone-200 font-hud-mono">
                READ-ONLY CREDENTIALS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.full_name || ''}
                  className="w-full text-xs bg-stone-100 border border-stone-200 rounded px-3 py-2 text-stone-600 cursor-not-allowed font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full text-xs bg-stone-100 border border-stone-200 rounded px-3 py-2 text-stone-600 cursor-not-allowed font-mono"
                />
              </div>
            </div>
          </motion.div>

          {/* Business Parameters Box */}
          <motion.div
            variants={staggerItemVariants}
            className="bg-white p-6 rounded-lg border border-stone-300 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-stone-600" />
                <span>Venture & Enterprise Profile</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-50 rounded text-amber-900 border border-amber-200 font-hud-mono">
                CRITERIA TELEMETRY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Enterprise Name
                </label>
                <input
                  type="text"
                  value={profile.business_name || ''}
                  onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                  placeholder="Official Venture / Trade Name"
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Applicant Type
                </label>
                <select
                  aria-label="Applicant Type"
                  value={profile.applicant_type || 'aspiring_entrepreneur'}
                  onChange={(e) => setProfile({ ...profile, applicant_type: e.target.value })}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
                >
                  <option value="aspiring_entrepreneur">Aspiring Entrepreneur</option>
                  <option value="individual">Individual Proprietor</option>
                  <option value="startup">Startup</option>
                  <option value="msme">MSME</option>
                  <option value="existing_business">Existing Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  State / Union Territory
                </label>
                <input
                  type="text"
                  value={profile.state || ''}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  placeholder="e.g. Maharashtra, Karnataka"
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={profile.district || ''}
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  placeholder="e.g. Pune, Bengaluru Urban"
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Economic Sector
                </label>
                <select
                  aria-label="Economic Sector"
                  value={profile.sector || 'manufacturing'}
                  onChange={(e) => setProfile({ ...profile, sector: e.target.value })}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
                >
                  <option value="manufacturing">Manufacturing</option>
                  <option value="services">Services</option>
                  <option value="textiles_handicrafts">Textiles & Handicrafts</option>
                  <option value="food_processing">Food Processing</option>
                  <option value="agriculture_allied">Agri-Allied</option>
                  <option value="it_technology">IT & Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="retail_trade">Retail & Trade</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Registration Status
                </label>
                <select
                  aria-label="Registration Status"
                  value={profile.registration_status || 'unregistered'}
                  onChange={(e) => setProfile({ ...profile, registration_status: e.target.value })}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
                >
                  <option value="unregistered">Unregistered</option>
                  <option value="udyam_registered">Udyam Registered</option>
                  <option value="startup_india_recognized">Startup India Recognized</option>
                  <option value="pvt_ltd">Private Limited Company</option>
                  <option value="llp">LLP</option>
                  <option value="partnership">Partnership Firm</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Social / Ownership Category
                </label>
                <select
                  aria-label="Social / Ownership Category"
                  value={profile.ownership_category || 'general'}
                  onChange={(e) => setProfile({ ...profile, ownership_category: e.target.value })}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
                >
                  <option value="general">General Category</option>
                  <option value="women">Woman Entrepreneur (51% or higher stake)</option>
                  <option value="sc_st">Scheduled Caste / Tribe (SC/ST)</option>
                  <option value="obc">Other Backward Class (OBC)</option>
                  <option value="minority">Minority Community</option>
                  <option value="divyangjan">Divyangjan</option>
                  <option value="ex_servicemen">Ex-Servicemen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Business Age (in Months)
                </label>
                <input
                  type="number"
                  min="0"
                  value={profile.business_age_months || 0}
                  onChange={(e) => setProfile({ ...profile, business_age_months: Number(e.target.value) })}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors font-hud-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Estimated Outlay / Loan Requirement (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={profile.total_investment_inr || 0}
                  onChange={(e) => setProfile({ ...profile, total_investment_inr: Number(e.target.value) })}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors font-hud-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Annual Turnover (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={profile.annual_turnover_inr || 0}
                  onChange={(e) => setProfile({ ...profile, annual_turnover_inr: Number(e.target.value) })}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors font-hud-mono"
                />
              </div>
            </div>
          </motion.div>

          {/* Action Row */}
          <motion.div variants={staggerItemVariants} className="flex justify-end pt-2">
            <TactileButton
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Settings'}</span>
            </TactileButton>
          </motion.div>
        </motion.form>
      </div>
    </PageTransition>
  );
};
