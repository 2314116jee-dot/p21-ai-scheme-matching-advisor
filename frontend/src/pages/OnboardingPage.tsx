import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Check, ArrowRight, ArrowLeft, IndianRupee } from 'lucide-react';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { MOTION_SPRINGS, MOTION_DURATIONS, MOTION_EASINGS } from '../styles/motion';

export const OnboardingPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    applicant_type: 'aspiring_entrepreneur',
    business_name: '',
    business_stage: 'ideation',
    state: 'Maharashtra',
    district: 'Pune',
    sector: 'manufacturing',
    registration_status: 'unregistered',
    business_age_months: 6,
    ownership_category: 'general',
    total_investment_inr: 2500000,
    annual_turnover_inr: 0,
  });

  const handleNext = () => {
    if (step < 4) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiRequest('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 16 : -16,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: MOTION_DURATIONS.snappy,
        ease: MOTION_EASINGS.cinematic,
      },
    },
    exit: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? -16 : 16,
      opacity: 0,
      transition: {
        duration: MOTION_DURATIONS.micro,
        ease: MOTION_EASINGS.exit,
      },
    }),
  };

  return (
    <PageTransition>
      <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto text-left">
        {/* Wizard Header & Telemetry Progress */}
        <div className="mb-8 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 font-hud-mono">
                Step {step} of 4: Entrepreneur Profile
              </span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-semibold text-stone-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Complete Later →
            </button>
          </div>

          {/* Animated Multi-Segment Step Indicator */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="space-y-1">
                <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: step >= s ? '100%' : '0%' }}
                    transition={MOTION_SPRINGS.snappy}
                    className="h-full bg-slate-900"
                  />
                </div>
                <span className="text-[10px] font-hud-mono text-stone-500 block truncate">
                  {s === 1 ? '01. Venture' : s === 2 ? '02. Sector' : s === 3 ? '03. Category' : '04. Outlay'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-7 border border-stone-300 rounded-lg shadow-sm space-y-6 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 1: Venture & Stage */}
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5"
              >
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-hud-mono">
                    Profile Initialization
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                    Venture & Entity Stage
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Tell us about your venture's current stage of development.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Applicant Type
                  </label>
                  <select
                    aria-label="Applicant Type"
                    value={profile.applicant_type}
                    onChange={(e) => setProfile({ ...profile, applicant_type: e.target.value })}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="aspiring_entrepreneur">Aspiring Entrepreneur (First-time Founder)</option>
                    <option value="individual">Individual Beneficiary / Proprietor</option>
                    <option value="startup">Recognized / Early-Stage Startup</option>
                    <option value="msme">Micro, Small or Medium Enterprise (MSME)</option>
                    <option value="existing_business">Existing Operational Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Enterprise Name <span className="text-stone-400 font-normal font-hud-mono">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={profile.business_name}
                    onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                    placeholder="e.g. Sahyadri Agro Products"
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Business Lifecycle Stage
                  </label>
                  <select
                    aria-label="Business Lifecycle Stage"
                    value={profile.business_stage}
                    onChange={(e) => setProfile({ ...profile, business_stage: e.target.value })}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="ideation">Ideation (Planning & Conceptualization)</option>
                    <option value="prototype">Prototype / Validation (Proof of Concept)</option>
                    <option value="early_stage">Early Operational Stage (&lt; 2 Years)</option>
                    <option value="growth">Growth / Expansion (Established Operations)</option>
                    <option value="scaling">Scaling / Modernization</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 2: Location & Sector */}
            {step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5"
              >
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-hud-mono">
                    Geographic & Market Domain
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                    Location & Sector
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Many schemes offer specialized subsidies based on state, district, or sector.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      State / Union Territory
                    </label>
                    <input
                      type="text"
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      placeholder="e.g. Maharashtra"
                      className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={profile.district}
                      onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                      placeholder="e.g. Pune"
                      className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Economic Sector
                  </label>
                  <select
                    aria-label="Economic Sector"
                    value={profile.sector}
                    onChange={(e) => setProfile({ ...profile, sector: e.target.value })}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="manufacturing">Manufacturing (Machinery, Engineering, Chemicals)</option>
                    <option value="services">Service Enterprises (Consulting, Logistics, IT)</option>
                    <option value="textiles_handicrafts">Textiles, Handlooms & Handicrafts</option>
                    <option value="food_processing">Food Processing & Agro-Enterprises</option>
                    <option value="agriculture_allied">Agri-Allied (Dairy, Poultry, Fisheries)</option>
                    <option value="it_technology">IT, Software & Deep-tech</option>
                    <option value="healthcare">Healthcare & Pharmaceuticals</option>
                    <option value="retail_trade">Retail & Trading</option>
                    <option value="other">Other Commercial Activities</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 3: Registration & Social Category */}
            {step === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5"
              >
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-hud-mono">
                    Legal & Quota Criteria
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                    Registrations & Beneficiary Category
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Required for assessing reserved quotas, collateral-free credit, and higher subsidy slabs.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Formal Registration Status
                  </label>
                  <select
                    aria-label="Formal Registration Status"
                    value={profile.registration_status}
                    onChange={(e) => setProfile({ ...profile, registration_status: e.target.value })}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="unregistered">Unregistered / Informal Venture</option>
                    <option value="udyam_registered">Udyam Registered (MSME Certificate)</option>
                    <option value="startup_india_recognized">DPIIT Startup India Recognized</option>
                    <option value="pvt_ltd">Private Limited Company (MCA)</option>
                    <option value="llp">Limited Liability Partnership (LLP)</option>
                    <option value="partnership">Registered Partnership Firm</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ownership / Beneficiary Category
                  </label>
                  <select
                    aria-label="Ownership / Beneficiary Category"
                    value={profile.ownership_category}
                    onChange={(e) => setProfile({ ...profile, ownership_category: e.target.value })}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="general">General Category</option>
                    <option value="women">Woman Entrepreneur (51% or higher stake)</option>
                    <option value="sc_st">Scheduled Caste / Scheduled Tribe (SC/ST)</option>
                    <option value="obc">Other Backward Class (OBC)</option>
                    <option value="minority">Religious Minority Community</option>
                    <option value="divyangjan">Divyangjan (Person with Disability)</option>
                    <option value="ex_servicemen">Ex-Servicemen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Operational Age of Business (in Months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={profile.business_age_months}
                    onChange={(e) => setProfile({ ...profile, business_age_months: Number(e.target.value) })}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                  />
                  <p className="text-[11px] text-stone-500 mt-0.5">Use 0 if venture has not commenced operations yet.</p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Scale & Capital Outlay */}
            {step === 4 && (
              <motion.div
                key="step-4"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5"
              >
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-hud-mono">
                    Financial Boundaries
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                    Financial Outlay & Turnover
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Used to filter against scheme investment limits and subsidy calculation brackets.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Estimated Total Project Outlay / Loan Needed (₹ INR)
                  </label>
                  <div className="relative group">
                    <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={profile.total_investment_inr}
                      onChange={(e) => setProfile({ ...profile, total_investment_inr: Number(e.target.value) })}
                      className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-stone-600 font-hud-mono mt-1">
                    ₹{Number(profile.total_investment_inr).toLocaleString('en-IN')} (₹{(profile.total_investment_inr / 100000).toFixed(2)} Lakhs)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Current Annual Turnover (₹ INR) <span className="text-stone-400 font-normal font-hud-mono">(0 if new venture)</span>
                  </label>
                  <div className="relative group">
                    <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={profile.annual_turnover_inr}
                      onChange={(e) => setProfile({ ...profile, annual_turnover_inr: Number(e.target.value) })}
                      className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-stone-600 font-hud-mono mt-1">
                    ₹{Number(profile.annual_turnover_inr).toLocaleString('en-IN')}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wizard Controls */}
          <div className="pt-6 border-t border-stone-200 flex justify-between items-center">
            {step > 1 ? (
              <TactileButton
                variant="secondary"
                size="md"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </TactileButton>
            ) : <div />}

            {step < 4 ? (
              <TactileButton
                variant="primary"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Next Step
              </TactileButton>
            ) : (
              <TactileButton
                variant="primary"
                size="md"
                onClick={handleSave}
                loading={loading}
                loadingText="Saving Profile..."
                leftIcon={<Check className="w-3.5 h-3.5 text-emerald-400" />}
                className="bg-emerald-800 hover:bg-emerald-900 border-emerald-900"
              >
                Complete & View Matches
              </TactileButton>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
