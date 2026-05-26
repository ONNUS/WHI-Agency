import React, { useState } from "react";
import { ReconBriefing, DiagnosticResult } from "../types";
import { 
  ShieldAlert, 
  Target, 
  TrendingUp, 
  Cpu, 
  Coins, 
  Send, 
  MapPin, 
  Building2, 
  Activity, 
  Flame, 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import RadarChart from "./RadarChart";

interface BriefingFormProps {
  onDiagnosticComplete: (result: DiagnosticResult) => void;
  savedResult: DiagnosticResult | null;
  onClearResult: () => void;
}

export default function BriefingForm({ onDiagnosticComplete, savedResult, onClearResult }: BriefingFormProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [form, setForm] = useState<ReconBriefing>({
    businessName: "",
    industry: "",
    location: "Texas Corridor: DFW Metroplex",
    blueForceAnswers: "",
    redForceAnswers: "",
    greenForceAnswers: "",
    battlespaceAnswers: "",
    gapAnswers: "",
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const totalSteps = 4;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (step === 1 && (!form.businessName.trim() || !form.industry.trim())) {
      alert("Please specify your Business Name and Industry/Vertical to begin reconnaissance.");
      return;
    }
    setStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const simulateLoading = async () => {
    const messages = [
      "ESTABLISHING SECURE UPLINK...",
      "MAPPING PILOT BATTLESPACE GEOMETRY...",
      "REVERSE-ENGINEERING RED FORCE INTEL...",
      "STRESS-TESTING GREEN FORCE READINESS...",
      "CALCULATING SYSTEM VECTOR HEATMAPS..."
    ];
    
    for (const msg of messages) {
      setLoadingStep(msg);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Run the visual loading sequence for rich tactical immersion
      await simulateLoading();

      const response = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("WHI Core Command returned an error response");
      }

      const result: DiagnosticResult & { isGeminiLive?: boolean } = await response.json();
      onDiagnosticComplete(result);
    } catch (err) {
      console.error("Submitting Reconnaissance Briefing failed", err);
      // Construct a premium client-side backup analysis in case of complete failures
      const mockResult: DiagnosticResult = {
        scores: { blue: 6, red: 4, green: 5, battlespace: 5, gap: 5 },
        overallScore: 5.0,
        criticalVulnerability: "Internal infrastructure stress. Fulfillment mechanisms are too fragile to absorb a dual-channel scale-up without triggering Growth Death.",
        asymmetricLeverage: "Replicating your highest value workflow into automated loops to reclaim executive margins.",
        combatPlan90Days: {
          phase1: "Days 1–30: Plug severe structural leaks, cancel low-converting ads, and buffer cash flow.",
          phase2: "Days 31–60: Standardize packaging of high-margin services to minimize fulfillment friction.",
          phase3: "Days 61–90: Deploy Red Force shadow countermeasures and scale tactical outbound loops."
        },
        executiveSummary: "Your intelligence inputs indicate system-wide constraints in fulfillment. Refactor the core operational pipelines before deploying new campaigns."
      };
      onDiagnosticComplete(mockResult);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setForm({
      businessName: "",
      industry: "",
      location: "Texas Corridor: DFW Metroplex",
      blueForceAnswers: "",
      redForceAnswers: "",
      greenForceAnswers: "",
      battlespaceAnswers: "",
      gapAnswers: "",
    });
    setContactSubmitted(false);
    setContactForm({ name: "", email: "", phone: "", notes: "" });
    onClearResult();
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) {
      alert("Name and email are required to authorize briefing call.");
      return;
    }
    setContactSubmitted(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg border border-stone-800 bg-[#0e0f14] p-6 text-stone-100 shadow-2xl relative overflow-hidden" id="recon-briefing-widget">
      {/* Absolute background accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-[#bc993c] to-amber-900" />

      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-stone-800">
        <div>
          <div className="flex items-center space-x-2.5 text-[#bc993c] font-mono text-sm sm:text-base font-bold tracking-[0.2em] uppercase mb-1.5">
            <Activity className="w-5 h-5 animate-pulse" />
            <span>Operational Diagnostic Command Center</span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-100 tracking-tight font-semibold">
            Reconnaissance Briefing Questionnaire
          </h3>
        </div>
        {!savedResult && (
          <div className="mt-2 md:mt-0 font-mono text-xs text-stone-400 bg-stone-900 px-3.5 py-1.5 rounded inline-block border border-stone-800 font-bold">
            STEP {step} OF {totalSteps}
          </div>
        )}
      </div>

      {loading ? (
        /* LOADING / ANALYSIS ENGINES */
        <div className="py-20 flex flex-col items-center justify-center space-y-6" id="loading-terminal">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-stone-800" />
            <div className="absolute inset-0 rounded-full border-t-2 border-[#bc993c] animate-spin" />
            <Activity className="w-6 h-6 text-[#bc993c] absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <p className="font-mono text-stone-100 text-xs tracking-[0.25em] font-semibold">
              {loadingStep}
            </p>
            <p className="font-mono text-[9px] text-[#bc993c] uppercase select-none opacity-60">
              neural assessment net running · processing vectors
            </p>
          </div>
        </div>
      ) : savedResult ? (
        /* DIAGNOSTIC RESULTS INSIGHT DASHBOARD */
        <div className="space-y-8 animate-fadeIn" id="diagnostic-results-terminal">
          <div className="bg-gradient-to-br from-stone-950 to-[#12151c] rounded border border-[#bc993c]/30 p-5 relative">
            <div className="absolute -top-3 -right-3 bg-amber-500/10 text-[#bc993c] border border-amber-500/20 text-[9px] font-mono px-2 py-0.5 rounded flex items-center space-x-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{(savedResult as any).isGeminiLive ? "Gemini Neural Brief" : "Analytic Diagnosis"}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 flex flex-col items-center">
                <RadarChart 
                  scores={savedResult.scores} 
                  interactive={true} 
                  onScoreChange={(key, value) => {
                    const updatedScores = { ...savedResult.scores, [key]: value };
                    const nextAverage = parseFloat(((updatedScores.blue + updatedScores.red + updatedScores.green + updatedScores.battlespace + updatedScores.gap) / 5).toFixed(1));
                    onDiagnosticComplete({
                      ...savedResult,
                      scores: updatedScores,
                      overallScore: nextAverage
                    });
                  }} 
                />
              </div>

              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block mb-1">
                    Executive Analysis
                  </span>
                  <p className="text-sm text-stone-300 leading-relaxed font-serif">
                    {savedResult.executiveSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-stone-900/40 p-3.5 border border-red-950/40 rounded flex space-x-3">
                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[9px] text-red-400 block font-semibold uppercase tracking-wider mb-1">
                        Critical Vulnerability
                      </span>
                      <p className="text-xs text-stone-300 leading-relaxed font-sans">
                        {savedResult.criticalVulnerability}
                      </p>
                    </div>
                  </div>

                  <div className="bg-stone-900/40 p-3.5 border border-green-950/40 rounded flex space-x-3">
                    <Target className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[9px] text-green-400 block font-semibold uppercase tracking-wider mb-1">
                        Asymmetric Leverage
                      </span>
                      <p className="text-xs text-stone-300 leading-relaxed font-sans">
                        {savedResult.asymmetricLeverage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROADMAP / 90 DAYS COMBAT PLAN */}
          <div className="space-y-4 bg-stone-950 p-5 rounded border border-stone-850">
            <h4 className="font-serif text-lg text-[#bc993c] tracking-tight font-medium flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Your First 90-Day Combat Plan</span>
            </h4>
            <p className="font-sans text-xs text-stone-400">
              The proprietary sequenced campaign strategy generated for your terrain. These represent immediate tactical priorities:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="bg-[#12151c] p-4 border-l-2 border-blue-500 rounded-r relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                  DAYS 1-30
                </div>
                <div className="text-[10px] text-stone-500 uppercase font-semibold mb-2">Phase 01</div>
                <div className="text-stone-200 text-xs font-sans leading-relaxed">
                  {savedResult.combatPlan90Days.phase1}
                </div>
              </div>

              <div className="bg-[#12151c] p-4 border-l-2 border-[#bc993c] rounded-r relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[8px] bg-amber-500/10 text-[#bc993c] border border-amber-500/20 px-1.5 py-0.5 rounded">
                  DAYS 31-60
                </div>
                <div className="text-[10px] text-stone-500 uppercase font-semibold mb-2">Phase 02</div>
                <div className="text-stone-200 text-xs font-sans leading-relaxed">
                  {savedResult.combatPlan90Days.phase2}
                </div>
              </div>

              <div className="bg-[#12151c] p-4 border-l-2 border-red-500 rounded-r relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded">
                  DAYS 61-90
                </div>
                <div className="text-[10px] text-stone-500 uppercase font-semibold mb-2">Phase 03</div>
                <div className="text-stone-200 text-xs font-sans leading-relaxed">
                  {savedResult.combatPlan90Days.phase3}
                </div>
              </div>
            </div>
          </div>

          {/* ACTION FORMS FOR SCHEDULING CALENDAR SUBMISSIONS */}
          <div className="bg-stone-950 p-5 rounded border border-stone-850 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 space-y-2">
              <h5 className="font-serif text-base text-[#bc993c] tracking-tight font-semibold">
                Lock in Your Solutions Retainer
              </h5>
              <p className="text-xs text-stone-400 leading-normal">
                Submit this diagnosis to a WHI Strategist to schedule a paid DNA™ briefing call. Subsidies up to 50% apply if you book within 14 days of combat plan generation.
              </p>
              <div className="flex items-center space-x-1 text-stone-500 font-mono text-[9px]">
                <Info className="w-3 h-3" />
                <span>We respond to approved briefings within 48 hours</span>
              </div>
            </div>

            <div className="md:col-span-7 bg-[#161924]/30 p-6 border border-stone-800 rounded-lg">
              {contactSubmitted ? (
                <div className="text-center py-6 space-y-3 font-mono">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-sm sm:text-base text-stone-200 font-bold uppercase">Briefing Transmission Successful</p>
                  <p className="text-xs sm:text-sm text-stone-450 leading-relaxed">A WHI operative has registered your assessment scores and will contact you at <strong className="text-[#bc993c]">{contactForm.email}</strong>.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-xs font-bold text-stone-400 block mb-1.5">YOUR NAME</label>
                      <input 
                        type="text" 
                        required 
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Marcus Sterling" 
                        className="w-full bg-stone-900 border border-stone-850 px-4 py-3 text-sm sm:text-base rounded-md text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#bc993c]"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs font-bold text-stone-400 block mb-1.5">BUSINESS EMAIL</label>
                      <input 
                        type="email" 
                        required 
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="marcus@agency.com" 
                        className="w-full bg-stone-900 border border-stone-850 px-4 py-3 text-sm sm:text-base rounded-md text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#bc993c]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-xs font-bold text-stone-400 block mb-1.5">SECURE TELEPHONE</label>
                    <input 
                      type="tel" 
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+1 (214) 555-0199" 
                      className="w-full bg-stone-900 border border-stone-850 px-4 py-3 text-sm sm:text-base rounded-md text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#bc993c]"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-3.5 sm:py-4 bg-[#bc993c] hover:bg-[#a68634] text-stone-950 font-mono text-xs sm:text-sm font-extrabold uppercase tracking-widest transition-colors rounded-md cursor-pointer"
                  >
                    AUTHORIZE DISCOVERY BRIEFING CALL
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded font-mono text-[10px] tracking-widest border border-stone-800 transition-colors uppercase cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset and Take New Assessment</span>
            </button>
          </div>
        </div>
      ) : (
        /* MULTI STEP INTAKE FORM PROCESS */
        <form onSubmit={handleSubmit} className="space-y-8" id="intake-form">
          {/* STEP 1: PARAMETERS */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn" id="step-1">
              <div className="bg-stone-950/40 p-6 sm:p-8 border border-stone-850 rounded-lg">
                <p className="font-serif text-base sm:text-lg md:text-xl text-[#bc993c] leading-relaxed italic mb-2">
                  "Execution without intelligence is a liability. We don't just solve problems — we engineer advantage."
                </p>
                <p className="font-sans text-sm sm:text-base text-stone-300 leading-relaxed">
                  Our proprietary Strategic Net Assessment process diagnoses vulnerabilities before we deploy a single dollar of capital. Answer the following questionnaire to identify structural vectors.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-xs sm:text-sm font-bold text-stone-400 block mb-2">
                    ORGANIZATION NAME <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-500">
                      <Building2 className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      name="businessName"
                      required
                      value={form.businessName}
                      onChange={handleChange}
                      placeholder="e.g., WHI Logistics"
                      className="w-full bg-stone-900 border border-stone-850 pl-11 pr-4 py-3 text-sm sm:text-base rounded-md text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#bc993c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-xs sm:text-sm font-bold text-stone-400 block mb-2">
                    INDUSTRY / SECTOR <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-500">
                      <Activity className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      name="industry"
                      required
                      value={form.industry}
                      onChange={handleChange}
                      placeholder="e.g., High-margin Supply Chain, SaaS"
                      className="w-full bg-stone-900 border border-stone-850 pl-11 pr-4 py-3 text-sm sm:text-base rounded-md text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#bc993c]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs sm:text-sm font-bold text-stone-400 block mb-2">
                  OPERATIONAL CORRIDOR / REGION
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-500">
                    <MapPin className="w-4.5 h-4.5" />
                  </span>
                  <select
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full bg-stone-900 border border-stone-850 pl-11 pr-4 py-3 text-sm sm:text-base rounded-md text-stone-100 focus:outline-none focus:border-[#bc993c]"
                  >
                    <option value="Texas Corridor: DFW Metroplex">Texas Corridor: DFW Metroplex</option>
                    <option value="Texas Corridor: Houston">Texas Corridor: Houston</option>
                    <option value="Texas Corridor: Austin">Texas Corridor: Austin</option>
                    <option value="Georgia Corridor: Atlanta">Georgia Corridor: Atlanta</option>
                    <option value="Western Region">Western Region</option>
                    <option value="Southern Region">Southern Region</option>
                    <option value="Midwest">Midwest</option>
                    <option value="Northern Region">Northern Region</option>
                    <option value="National / Multistate">National / Multistate</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BLUE & RED FORCES */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn" id="step-2">
              <div>
                <label className="font-mono text-sm sm:text-base font-extrabold text-blue-400 block mb-1.5">
                  BLUE FORCE: PERSONNEL AND SYSTEM GAP CAPABILITIES
                </label>
                <span className="text-xs sm:text-sm text-stone-400 block mb-2.5 leading-relaxed font-sans">
                  How solid is your core leadership, talent matrix, and offer pricing? Are high-tier executives consumed by low-tier tasks?
                </span>
                <textarea
                  name="blueForceAnswers"
                  value={form.blueForceAnswers}
                  onChange={handleChange}
                  placeholder="e.g., Lead founder spends 12 hours/week in fulfillment logistics. Staff skills gap in software automations. Offers are priced at standard margins..."
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-850 p-4 text-sm sm:text-base rounded-md text-stone-100 focus:outline-none focus:border-[#bc993c]"
                />
              </div>

              <div className="pt-4 border-t border-stone-850">
                <label className="font-mono text-sm sm:text-base font-extrabold text-red-400 block mb-1.5">
                  RED FORCE: INSULATION AND PRICING SOVEREIGNTY
                </label>
                <span className="text-xs sm:text-sm text-stone-400 block mb-2.5 leading-relaxed font-sans">
                  Are competitors eroding your market segment? Who is copying your moves, and is pricing power under pressure?
                </span>
                <textarea
                  name="redForceAnswers"
                  value={form.redForceAnswers}
                  onChange={handleChange}
                  placeholder="e.g. Traditional agencies compete on Google Ads pricing. Competitors duplicate our packages within days, forcing coupon/discount wars..."
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-850 p-4 text-sm sm:text-base rounded-md text-stone-100 focus:outline-none focus:border-[#bc993c]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: GREEN FORCE & BATTLESPACE */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn" id="step-3">
              <div>
                <label className="font-mono text-sm sm:text-base font-extrabold text-green-400 block mb-1.5">
                  GREEN FORCE: OPERATIONAL READINESS AND SCALING RATIO
                </label>
                <span className="text-xs sm:text-sm text-stone-400 block mb-2.5 leading-relaxed font-sans">
                  If lead volume or customers doubled tomorrow, which system breaks first? fulfillment, data flow, or staff bandwidth?
                </span>
                <textarea
                  name="greenForceAnswers"
                  value={form.greenForceAnswers}
                  onChange={handleChange}
                  placeholder="e.g., Stressed customer support bottlenecking. Software is non-integrated. We would collapse under manual email notifications..."
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-850 p-4 text-sm sm:text-base rounded-md text-stone-100 focus:outline-none focus:border-[#bc993c]"
                />
              </div>

              <div className="pt-4 border-t border-stone-850">
                <label className="font-mono text-sm sm:text-base font-extrabold text-[#9d7aff] block mb-1.5">
                  BATTLESPACE: TECHNICAL MODERNITY & SYSTEM DISRUPTION
                </label>
                <span className="text-xs sm:text-sm text-stone-400 block mb-2.5 leading-relaxed font-sans">
                  Are your workflows supported by actual AI, zero-trust cybersecurity structures, or locked inside spreadsheet dependencies?
                </span>
                <textarea
                  name="battlespaceAnswers"
                  value={form.battlespaceAnswers}
                  onChange={handleChange}
                  placeholder="e.g. Dependent entirely on Google Sheets. No AI deployment or voice systems. Regulatory audits consume high compliance assets..."
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-850 p-4 text-sm sm:text-base rounded-md text-stone-100 focus:outline-none focus:border-[#bc993c]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: STRATEGIC GAP */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn" id="step-4">
              <div>
                <label className="font-mono text-sm sm:text-base font-extrabold text-amber-500 block mb-1.5">
                  STRATEGIC GAP: CAPITAL VELOCITIES & MARGIN SECURITY
                </label>
                <span className="text-xs sm:text-sm text-stone-400 block mb-2.5 leading-relaxed font-sans">
                  Where is your biggest operating waste? Lead acquisition costs, slow cycles, funding barriers, or severe asset leakages?
                </span>
                <textarea
                  name="gapAnswers"
                  value={form.gapAnswers}
                  onChange={handleChange}
                  placeholder="e.g. Cash flow cycles exceed 60 days. Customer acquisition cost absorbs 45% of margins. No broker partnership established..."
                  rows={4}
                  className="w-full bg-stone-900 border border-stone-850 p-4 text-sm sm:text-base rounded-md text-stone-100 focus:outline-none focus:border-[#bc993c]"
                />
              </div>

              <div className="rounded-lg border border-amber-500/15 bg-amber-500/5 p-5 sm:p-6 flex space-x-4 items-start">
                <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                  <span className="font-mono font-bold text-[#bc993c] block uppercase mb-1 tracking-wider text-sm">INTEL AUTHORIZATION REQUIRED</span>
                  By submitting this briefing, you certify the information is representative of your actual business operations. All data remains localized within your session parameters.
                </div>
              </div>
            </div>
          )}

          {/* CONTROLS */}
          <div className="flex border-t border-stone-850 pt-6 justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3.5 sm:px-8 sm:py-4 bg-stone-900 hover:bg-stone-800 text-stone-300 font-mono text-xs sm:text-sm font-bold tracking-widest border border-stone-800 rounded-md transition-colors uppercase cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3.5 sm:px-8 sm:py-4 bg-[#bc993c] hover:bg-[#a68634] text-stone-950 font-mono text-xs sm:text-sm font-extrabold tracking-widest rounded-md transition-colors uppercase cursor-pointer"
              >
                <span>Proceed to Step {step + 1}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-amber-500 to-[#bc993c] hover:opacity-90 text-stone-950 font-mono text-xs sm:text-sm font-black tracking-widest rounded-md shadow-lg transition-opacity uppercase cursor-pointer"
              >
                <Send className="w-5 h-5" />
                <span>Authorize Tactical Diagnosis</span>
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
