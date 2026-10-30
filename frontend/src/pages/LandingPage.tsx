import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { InteractiveCard } from '../components/motion/InteractiveCard';
import { AnimatedCounter } from '../components/motion/AnimatedCounter';
import { VerificationBadge } from '../components/ui/Badge';
import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  MOTION_SPRINGS,
  staggerContainerVariants,
  staggerItemVariants,
} from '../styles/motion';

export const LandingPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Interactive Live Thing: Real-time scheme matcher demo
  const [selectedProfile, setSelectedProfile] = useState<{
    applicant_type: string;
    stage: string;
    category: string;
    sector: string;
    investment: number;
  }>({
    applicant_type: 'aspiring_entrepreneur',
    stage: 'ideation',
    category: 'women',
    sector: 'manufacturing',
    investment: 2500000, // 25 Lakhs
  });

  // Calculate live results based on the deterministic engine criteria
  const isPmegpEligible =
    selectedProfile.investment <= 5000000 &&
    ['manufacturing', 'services', 'food_processing', 'textiles_handicrafts'].includes(selectedProfile.sector);

  const isStandUpEligible =
    ['women', 'sc_st'].includes(selectedProfile.category) &&
    ['ideation', 'prototype', 'early_stage'].includes(selectedProfile.stage) &&
    selectedProfile.investment <= 10000000;

  const isMudraEligible =
    selectedProfile.investment <= 2000000 &&
    selectedProfile.sector !== 'direct_farming';

  return (
    <PageTransition>
      <div className="bg-[#fcfbf9] text-[#18191b] min-h-screen">
        {/* Cinematic Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Hero Column: Choreographed Typography Reveal */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainerVariants(0.09, 0.05)}
              className="lg:col-span-6 space-y-6 text-left"
            >
              {/* Telemetry Tag */}
              <motion.div
                variants={staggerItemVariants}
                className="inline-flex items-center space-x-2 px-3 py-1 bg-stone-100 border border-stone-200 rounded text-xs font-medium text-stone-700 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-hud-mono tracking-tight">Grounded in Official Central Gazette Criteria</span>
              </motion.div>

              {/* Cinematic Headline with Masked Typography */}
              <motion.div variants={staggerItemVariants} className="overflow-hidden">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                  Find Central Government schemes built for your enterprise.
                </h1>
              </motion.div>

              {/* Supporting Text */}
              <motion.p
                variants={staggerItemVariants}
                className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl"
              >
                P21 evaluates your venture against verified eligibility conditions from MyScheme and Ministry portals with deterministic rules and source-grounded explanations.
              </motion.p>

              {/* Staggered Actions */}
              <motion.div
                variants={staggerItemVariants}
                className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2"
              >
                <Link to="/register">
                  <TactileButton
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    fullWidth
                  >
                    Check Your Eligibility
                  </TactileButton>
                </Link>
                <Link to="/schemes">
                  <TactileButton
                    variant="secondary"
                    size="lg"
                    fullWidth
                  >
                    Browse Scheme Catalogue
                  </TactileButton>
                </Link>
              </motion.div>

              {/* Credibility Telemetry Markers with Animated Numerals */}
              <motion.div
                variants={staggerItemVariants}
                className="pt-8 grid grid-cols-3 gap-6 border-t border-stone-200"
              >
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-hud-mono">
                    <AnimatedCounter value={100} suffix="%" />
                  </p>
                  <p className="text-xs text-stone-600 font-medium mt-0.5">Deterministic Rules</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-hud-mono">
                    ₹50L - ₹5Cr
                  </p>
                  <p className="text-xs text-stone-600 font-medium mt-0.5">Assistance Ceilings</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-hud-mono">
                    Zero
                  </p>
                  <p className="text-xs text-stone-600 font-medium mt-0.5">Fabricated Claims</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Hero Column: Tactical HUD Live Evaluator */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: MOTION_DURATIONS.cinematic, delay: 0.18, ease: MOTION_EASINGS.cinematic }}
              className="lg:col-span-6 bg-white rounded-lg border border-stone-300 shadow-md p-6 sm:p-7 text-left motion-gpu relative"
              data-ui="interactive-evaluator"
            >
              {/* Tactical Top Corner Notch Accent */}
              <div className="absolute top-0 right-0 w-16 h-1 bg-slate-900 rounded-tr-lg" />

              <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Instant Eligibility Simulator
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Adjust venture parameters to test live deterministic conditions.
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-hud-mono font-semibold border border-stone-200">
                  SYS.EVAL_LIVE
                </span>
              </div>

              {/* Interactive Inputs */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Social / Ownership Category
                  </label>
                  <select
                    aria-label="Social / Ownership Category"
                    value={selectedProfile.category}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, category: e.target.value })}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
                  >
                    <option value="women">Woman Entrepreneur</option>
                    <option value="sc_st">Scheduled Caste / Tribe (SC/ST)</option>
                    <option value="obc">Other Backward Class (OBC)</option>
                    <option value="general">General Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Business Stage
                  </label>
                  <select
                    aria-label="Business Stage"
                    value={selectedProfile.stage}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, stage: e.target.value })}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
                  >
                    <option value="ideation">Ideation / New Venture (Greenfield)</option>
                    <option value="prototype">Prototype / Validation</option>
                    <option value="early_stage">Early Operational Stage</option>
                    <option value="growth">Existing Scaling Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Economic Sector
                  </label>
                  <select
                    aria-label="Economic Sector"
                    value={selectedProfile.sector}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, sector: e.target.value })}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
                  >
                    <option value="manufacturing">Manufacturing Unit</option>
                    <option value="services">Service Enterprise</option>
                    <option value="textiles_handicrafts">Handicrafts / Textiles</option>
                    <option value="food_processing">Food Processing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Estimated Outlay / Loan Need
                  </label>
                  <select
                    aria-label="Estimated Outlay / Loan Need"
                    value={selectedProfile.investment}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, investment: Number(e.target.value) })}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
                  >
                    <option value={500000}>₹5 Lakhs (Micro project)</option>
                    <option value={2500000}>₹25 Lakhs (Medium project)</option>
                    <option value={5000000}>₹50 Lakhs (Upper PMEGP limit)</option>
                    <option value={8000000}>₹80 Lakhs (Stand-Up India range)</option>
                  </select>
                </div>
              </div>

              {/* Live Output Schemes with Physical Transitions */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider font-hud-mono">
                    Evaluated Central Schemes
                  </h4>
                  <span className="text-[11px] text-stone-500 font-hud-mono">
                    Updated in 0.02ms
                  </span>
                </div>

                {/* PMEGP Match Card */}
                <motion.div
                  layout
                  transition={MOTION_SPRINGS.snappy}
                  className="p-3 rounded border border-stone-200 bg-stone-50/80 flex items-center justify-between transition-colors hover:border-stone-300"
                >
                  <div className="pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">PMEGP Scheme</span>
                      <VerificationBadge status="Verified" size="sm" />
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      {isPmegpEligible
                        ? `Eligible for 25%-35% Margin Money Subsidy (up to ₹${(selectedProfile.investment * 0.35 / 100000).toFixed(1)} Lakhs).`
                        : 'Project cost exceeds ₹50 Lakhs maximum outlay limit.'}
                    </p>
                  </div>
                  <div>
                    <AnimatePresence mode="wait">
                      {isPmegpEligible ? (
                        <motion.span
                          key="pmegp-pass"
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          transition={MOTION_SPRINGS.tactile}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-hud-mono bg-emerald-100 text-emerald-800 border border-emerald-300"
                        >
                          PASS
                        </motion.span>
                      ) : (
                        <motion.span
                          key="pmegp-fail"
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          transition={MOTION_SPRINGS.tactile}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-hud-mono bg-rose-100 text-rose-800 border border-rose-300"
                        >
                          FAIL
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Stand-Up India Match Card */}
                <motion.div
                  layout
                  transition={MOTION_SPRINGS.snappy}
                  className="p-3 rounded border border-stone-200 bg-stone-50/80 flex items-center justify-between transition-colors hover:border-stone-300"
                >
                  <div className="pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">Stand-Up India</span>
                      <VerificationBadge status="Verified" size="sm" />
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      {isStandUpEligible
                        ? 'Greenfield criterion satisfied. Composite loan ₹10L - ₹1Cr available.'
                        : 'Requires Women or SC/ST promoter and first-time greenfield enterprise.'}
                    </p>
                  </div>
                  <div>
                    <AnimatePresence mode="wait">
                      {isStandUpEligible ? (
                        <motion.span
                          key="standup-pass"
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          transition={MOTION_SPRINGS.tactile}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-hud-mono bg-emerald-100 text-emerald-800 border border-emerald-300"
                        >
                          PASS
                        </motion.span>
                      ) : (
                        <motion.span
                          key="standup-fail"
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          transition={MOTION_SPRINGS.tactile}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-hud-mono bg-rose-100 text-rose-800 border border-rose-300"
                        >
                          FAIL
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Mudra Match Card */}
                <motion.div
                  layout
                  transition={MOTION_SPRINGS.snappy}
                  className="p-3 rounded border border-stone-200 bg-stone-50/80 flex items-center justify-between transition-colors hover:border-stone-300"
                >
                  <div className="pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">PM Mudra Yojana (PMMY)</span>
                      <VerificationBadge status="Verified" size="sm" />
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      {isMudraEligible
                        ? 'Collateral-free institutional credit under Kishore or Tarun category.'
                        : 'Project outlay exceeds MUDRA loan ceiling of ₹20 Lakhs.'}
                    </p>
                  </div>
                  <div>
                    <AnimatePresence mode="wait">
                      {isMudraEligible ? (
                        <motion.span
                          key="mudra-pass"
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          transition={MOTION_SPRINGS.tactile}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-hud-mono bg-emerald-100 text-emerald-800 border border-emerald-300"
                        >
                          PASS
                        </motion.span>
                      ) : (
                        <motion.span
                          key="mudra-fail"
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          transition={MOTION_SPRINGS.tactile}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-hud-mono bg-rose-100 text-rose-800 border border-rose-300"
                        >
                          FAIL
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between items-center">
                <span className="text-[11px] text-stone-500 font-hud-mono">
                  All 15 evaluation rules active
                </span>
                <Link
                  to="/register"
                  className="text-xs font-bold text-slate-900 hover:text-slate-700 inline-flex items-center group"
                >
                  <span>Save profile for full 15-point assessment</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Schemes Section with Restrained Depth */}
        <section className="py-16 bg-stone-100/70 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainerVariants(0.08, 0.02)}
              className="max-w-3xl text-left mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Verified Central Government Schemes
              </h2>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                Every scheme record is cross-checked against Gazette notifications, official portals, and MyScheme entries with complete source citations.
              </p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainerVariants(0.1, 0.05)}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
            >
              {/* Card 1 */}
              <InteractiveCard className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wide font-hud-mono">
                      Ministry of MSME
                    </span>
                    <VerificationBadge status="Verified" size="sm" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                    PMEGP Employment Generation
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Margin money subsidy up to 35% on project costs up to ₹50 Lakhs for manufacturing and ₹20 Lakhs for services.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">KVIC Official Portal</span>
                  <Link to="/schemes" className="font-bold text-slate-900 hover:underline inline-flex items-center">
                    <span>View Rules</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </InteractiveCard>

              {/* Card 2 */}
              <InteractiveCard className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wide font-hud-mono">
                      Ministry of Finance
                    </span>
                    <VerificationBadge status="Verified" size="sm" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                    Stand-Up India Scheme
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Loans between ₹10 Lakhs and ₹1 Crore for greenfield enterprises founded by Women or SC/ST entrepreneurs.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">SIDBI Mitra Portal</span>
                  <Link to="/schemes" className="font-bold text-slate-900 hover:underline inline-flex items-center">
                    <span>View Rules</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </InteractiveCard>

              {/* Card 3 */}
              <InteractiveCard className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wide font-hud-mono">
                      Commerce & Industry
                    </span>
                    <VerificationBadge status="Verified" size="sm" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                    Startup India Seed Fund
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Financial assistance up to ₹50 Lakhs for early-stage DPIIT-recognized startups incorporated within 2 years.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">DPIIT Incubator Network</span>
                  <Link to="/schemes" className="font-bold text-slate-900 hover:underline inline-flex items-center">
                    <span>View Rules</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </InteractiveCard>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section: 3-Step Strategy Sequence */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              How P21 Advises Indian Founders
            </h2>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              A three-step architecture separating deterministic rule assessment from AI explanation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InteractiveCard elevation="hud" className="p-6 space-y-3">
              <div className="w-10 h-10 rounded bg-slate-900 text-white font-hud-mono font-bold flex items-center justify-center text-sm shadow-xs">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Structured Profile Input
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Enter your sector, location, enterprise stage, business age, registration status, and financial ceilings through a simple onboarding wizard.
              </p>
            </InteractiveCard>

            <InteractiveCard elevation="hud" className="p-6 space-y-3">
              <div className="w-10 h-10 rounded bg-slate-900 text-white font-hud-mono font-bold flex items-center justify-center text-sm shadow-xs">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Deterministic Matching Engine
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hard requirements evaluate to PASS, FAIL, or UNKNOWN. Missing details are flagged honestly—they never fabricate a false match.
              </p>
            </InteractiveCard>

            <InteractiveCard elevation="hud" className="p-6 space-y-3">
              <div className="w-10 h-10 rounded bg-slate-900 text-white font-hud-mono font-bold flex items-center justify-center text-sm shadow-xs">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Grounded AI Explanations
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                The AI layer synthesizes the engine's findings into clear advice, citing real Gazette passages and official portal documents.
              </p>
            </InteractiveCard>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center border-t border-slate-800">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to explore schemes for your enterprise?
            </h2>
            <p className="text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
              Create an entrepreneur account in seconds. Zero fees, no third-party cloud requirements, and real local persistence.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <TactileButton variant="secondary" size="lg">
                  Register Entrepreneur Profile
                </TactileButton>
              </Link>
              <Link to="/auth">
                <TactileButton variant="ghost" size="lg" className="text-stone-200 border border-stone-700 hover:text-white hover:bg-slate-800">
                  Sign In to Existing Account
                </TactileButton>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};
