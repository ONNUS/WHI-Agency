import React, { useState } from "react";
import { 
  Shield, 
  Eye, 
  Zap, 
  Map, 
  Compass, 
  CheckSquare, 
  Activity, 
  Send, 
  Menu, 
  X, 
  TrendingUp, 
  Briefcase, 
  Cpu, 
  Lock, 
  Layers, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Info,
  DollarSign,
  Award,
  Users,
  Terminal,
  Clock,
  ArrowRight
} from "lucide-react";
import BriefingForm from "./components/BriefingForm";
import PillarsGrid from "./components/PillarsGrid";
import { DiagnosticResult, PillarScore } from "./types";
import WHILogo from "./components/WHILogo";
import DNABackground from "./components/DNABackground";
import AnimatedMazeBackground from "./components/AnimatedMazeBackground";
import AnimatedPathBackground from "./components/AnimatedPathBackground";
import IntelAccordion from "./components/IntelAccordion";
import { motion } from "motion/react";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  // Hardcode pre-filled stats for mock visual chart
  const [sampleScores, setSampleScores] = useState({
    blue: 7,
    red: 5,
    green: 6,
    battlespace: 8,
    gap: 4
  });

  const handleScoreChange = (key: "blue" | "red" | "green" | "battlespace" | "gap", value: number) => {
    setSampleScores(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const activeAverage = ((sampleScores.blue + sampleScores.red + sampleScores.green + sampleScores.battlespace + sampleScores.gap) / 5).toFixed(1);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-[#e8e4da] selection:bg-[#bc993c] selection:text-[#0b0c0f] font-sans antialiased text-sm">
      
      {/* GLOBAL BANNER */}
      <div className="bg-[#bc993c] text-[#0b0c0f] text-center font-mono py-2 px-4 text-xs font-semibold tracking-wider flex items-center justify-center space-x-2">
        <span className="inline-block w-2 h-2 bg-[#0b0c0f] rounded-full animate-ping" />
        <span>ACCEPTING QUALIFIED ASSESSMENTS FOR THE 2026 WINTER CYCLE</span>
      </div>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-[#0b0c0f]/90 backdrop-blur-md border-b border-stone-900 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => scrollToSection("hero")} 
            className="cursor-pointer group flex items-center"
            id="brand-logo"
          >
            <WHILogo className="h-7 sm:h-8 hover:opacity-85 transition-opacity" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 font-mono text-[12px] sm:text-[13px] tracking-widest text-[#e8e4da] font-semibold">
            <button 
              onClick={() => scrollToSection("paradigm")} 
              className="hover:text-white uppercase transition-colors cursor-pointer"
            >
              The Paradigm
            </button>
            <button 
              onClick={() => scrollToSection("dna")} 
              className="hover:text-white uppercase transition-colors cursor-pointer"
            >
              The DNA™
            </button>
            <button 
              onClick={() => scrollToSection("solutions")} 
              className="hover:text-white uppercase transition-colors cursor-pointer"
            >
              Solutions
            </button>
            <button 
              onClick={() => scrollToSection("standard")} 
              className="hover:text-white uppercase transition-colors cursor-pointer"
            >
              The Standard
            </button>
            <button 
              onClick={() => scrollToSection("briefing-room")} 
              className="hover:text-white uppercase transition-colors cursor-pointer"
            >
              Briefing Room
            </button>
            <button 
              onClick={() => scrollToSection("command-team")} 
              className="hover:text-white uppercase transition-colors cursor-pointer"
            >
              Command Team
            </button>
          </nav>

          {/* CTA & Mobile trigger */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => scrollToSection("assessment-portal")}
              className="hidden sm:inline-block px-5 py-2.5 bg-[#bc993c] text-stone-950 font-mono text-xs font-bold tracking-widest uppercase hover:bg-[#a68634] transition-all duration-200 rounded shadow-lg shadow-[#bc993c]/10 cursor-pointer"
              id="header-cta"
            >
              INITIATE ASSESSMENT
            </button>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-stone-400 hover:text-stone-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu container */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-stone-900 space-y-3 flex flex-col font-mono text-xs tracking-wider text-stone-400 text-center animate-fadeIn bg-[#0b0c0f] pb-4">
            <button 
              onClick={() => scrollToSection("paradigm")} 
              className="py-1.5 hover:text-stone-100"
            >
              THE PARADIGM
            </button>
            <button 
              onClick={() => scrollToSection("dna")} 
              className="py-1.5 hover:text-stone-100"
            >
              THE DNA™
            </button>
            <button 
              onClick={() => scrollToSection("solutions")} 
              className="py-1.5 hover:text-stone-100"
            >
              SOLUTIONS
            </button>
            <button 
              onClick={() => scrollToSection("standard")} 
              className="py-1.5 hover:text-stone-100"
            >
              THE STANDARD
            </button>
            <button 
              onClick={() => scrollToSection("briefing-room")} 
              className="py-1.5 hover:text-stone-100"
            >
              BRIEFING ROOM
            </button>
            <button 
              onClick={() => scrollToSection("command-team")} 
              className="py-1.5 hover:text-stone-100"
            >
              COMMAND TEAM
            </button>
            <button 
              onClick={() => scrollToSection("assessment-portal")}
              className="w-full py-2.5 bg-[#bc993c] text-[#0b0c0f] font-bold text-[10px] uppercase tracking-widest"
            >
              INITIATE ASSESSMENT
            </button>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">
        {/* Bespoke Interactive Glowing DNA Helix Node Network Canvas */}
        <DNABackground />

        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1c1b18_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none z-0" />
        
        {/* Soft elegant warm accent radial shadow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[40vh] bg-[#bc993c]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-10">
          
          <div className="inline-flex items-center space-x-2.5 px-5 py-2.5 bg-stone-950 border border-stone-850 rounded text-sm sm:text-base font-mono tracking-[0.2em] text-[#bc993c] uppercase select-none font-bold">
            <Terminal className="w-5 h-5 text-[#bc993c]" />
            <span>BUSINESS TRANSFORMATION ENGINE</span>
          </div>

          <div className="space-y-6">
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-stone-100 tracking-tight leading-[1.05] font-semibold">
              Most agencies guess. <br />
              <span className="font-serif italic text-[#bc993c] block mt-2 sm:mt-3">We diagnose.</span>
            </h1>

            <p className="max-w-3xl mx-auto text-stone-300 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-sans">
              WHI Agency is a Business Transformation Engine — not a marketing shop. We don't deploy a single campaign until the Battlespace (Go-To-Market strategy) has been fully mapped, your operational vulnerabilities identified, and your infrastructure hardened for scale.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollToSection("assessment-portal")}
              className="w-full sm:w-auto px-10 py-4 bg-[#bc993c] text-stone-950 font-mono text-sm sm:text-base font-bold tracking-widest uppercase hover:bg-[#a68634] transition-colors rounded shadow-lg shadow-[#bc993c]/10 cursor-pointer"
            >
              Initiate Your DNA™ Assessment
            </button>
            <button
              onClick={() => scrollToSection("standard")}
              className="w-full sm:w-auto px-10 py-4 bg-transparent text-stone-300 font-mono text-sm sm:text-base font-medium tracking-widest uppercase hover:text-stone-100 border border-stone-800 hover:border-stone-700 transition-all rounded cursor-pointer"
            >
              View The Intelligence Standard
            </button>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-16 border-t border-stone-900 text-left max-w-5xl mx-auto">
            <div className="p-6 bg-stone-950/40 rounded border border-stone-900 flex flex-col justify-between">
              <span className="block font-sans font-black text-[#bc993c] text-2xl sm:text-3xl md:text-4xl">$2.5K</span>
              <span className="font-mono text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-widest block mt-2 leading-relaxed">Assessment Entry Point</span>
            </div>
            
            <div className="p-6 bg-stone-950/40 rounded border border-stone-900 flex flex-col justify-between">
              <span className="block font-sans font-black text-stone-100 text-2xl sm:text-3xl md:text-4xl">6 Pillars</span>
              <span className="font-mono text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-widest block mt-2 leading-relaxed">Full-Spectrum Diagnosis</span>
            </div>

            <div className="p-6 bg-stone-950/40 rounded border border-stone-900 flex flex-col justify-between">
              <span className="block font-sans font-black text-stone-100 text-2xl sm:text-3xl md:text-4xl">90 Days</span>
              <span className="font-mono text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-widest block mt-2 leading-relaxed">To First Measurable Advantage</span>
            </div>

            <div className="p-6 bg-stone-950/40 rounded border border-stone-900 flex flex-col justify-between">
              <span className="block font-sans font-black text-[#bc993c] text-2xl sm:text-3xl md:text-4xl">S3 Model</span>
              <span className="font-mono text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-widest block mt-2 leading-relaxed">Strategies · Systems · Solutions</span>
            </div>
          </div>

        </div>
      </section>

      {/* CREED DIVIDER */}
      <section className="bg-stone-950 border-y border-stone-900 py-16 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-xs sm:text-sm text-[#bc993c] tracking-[0.3em] font-bold uppercase block">THE WHI CREED</span>
          <p className="font-serif italic text-stone-100 text-xl sm:text-2xl md:text-3xl leading-relaxed">
            "To empower visionary leaders with the strategic intelligence and operational resilience required to navigate disruption and achieve absolute market dominance."
          </p>
          <div className="h-[1.5px] w-20 bg-[#bc993c]/50 mx-auto" />
          <p className="font-mono text-xs sm:text-sm text-stone-400 uppercase tracking-widest max-w-3xl mx-auto leading-relaxed">
            EXECUTION WITHOUT INTELLIGENCE IS A LIABILITY. WE DON'T JUST SOLVE PROBLEMS — WE ENGINEER ADVANTAGE.
          </p>
        </div>
      </section>

      {/* THE PARADIGM SHIFT SECTION */}
      <section id="paradigm" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <span className="font-mono text-xs sm:text-sm text-[#bc993c] tracking-[0.25em] font-bold uppercase">THE PARADIGM SHIFT</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-100 font-semibold tracking-tight">
            The Integrated Path vs. The Fragmented Maze
          </h2>
          <p className="text-stone-300 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed font-sans">
            Why traditional boutique consultancy and legacy advertising agencies default to standard templates when you actually require custom operational orchestration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          
          {/* FRAGMENTED MAZE */}
          <div className="relative overflow-hidden bg-stone-950/40 border border-[#bc993c]/30 p-8 rounded shadow-xl flex flex-col justify-between">
            {/* Animated glowing backdrop matching the attached aurora image */}
            <AnimatedMazeBackground />

            <div className="relative z-10 flex flex-col h-full justify-between space-y-8">
              <div>
                <div className="flex items-center space-x-2 text-stone-300 font-mono text-xs sm:text-sm font-bold tracking-wider uppercase border-b border-stone-900/40 pb-4 mb-6">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <span>THE FRAGMENTED MAZE — LEGACY MODEL</span>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <span className="text-red-500 shrink-0 font-mono text-sm sm:text-base font-black">✕</span>
                    <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>Freelance strategists</strong> deliver expert, high-level advice but bring zero operational accountability or reliable resources to implement it.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <span className="text-red-500 shrink-0 font-mono text-sm sm:text-base font-black">✕</span>
                    <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>Digital agencies</strong> optimize cosmetic marketing metrics and click rates while remaining completely disconnected from your real P&L parameters.
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="text-red-500 shrink-0 font-mono text-sm sm:text-base font-black">✕</span>
                    <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>Big consulting firms</strong> sell complex, high-level theory decks that sit in drawers, costing too much configuration or capital for growing teams to deploy.
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="text-red-500 shrink-0 font-mono text-sm sm:text-base font-black">✕</span>
                    <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>DIY execution</strong> drains the founder's executive bandwidth, pulling key leadership assets away from core strategy and governance.
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="text-red-500 shrink-0 font-mono text-sm sm:text-base font-black">✕</span>
                    <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>Conflicting vendors</strong> produce clashing tactical packages, duplicate software fees, and leave no single center of accountability when outcomes stall.
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="text-red-500 shrink-0 font-mono text-sm sm:text-base font-black">✕</span>
                    <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>Blind execution</strong> begins before precise diagnosis, leading to wasted marketing capital on channels your operational rails cannot sustain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#12151c]/70 backdrop-blur-xs p-5 border border-stone-850 rounded font-mono text-xs sm:text-sm text-stone-300 italic mt-8 leading-relaxed">
                Outcome: Fragmented execution, critical data leakages, and compromised unit economics when scaling.
              </div>
            </div>
          </div>

          {/* THE INTEGRATED PATH */}
          <div className="relative overflow-hidden bg-stone-950/40 border border-[#bc993c]/45 p-8 rounded shadow-xl flex flex-col justify-between">
            {/* Animated Strategic Pathfinder & Radar Command Network Glow */}
            <AnimatedPathBackground />

            <div className="relative z-10 flex flex-col h-full justify-between space-y-8">
              <div>
                <div className="flex items-center space-x-2 text-[#bc993c] font-mono text-xs sm:text-sm font-bold tracking-wider uppercase border-b border-[#bc993c]/30 pb-4 mb-6">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <span>THE WHI INTEGRATED PATH</span>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <span className="text-[#bc993c] shrink-0 font-mono text-sm sm:text-base">◆</span>
                    <p className="text-stone-100 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>Relentless co-pilot:</strong> Strategic intelligence, product architecture, and end-to-end execution unified under a single engine.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <span className="text-[#bc993c] shrink-0 font-mono text-sm sm:text-base">◆</span>
                    <p className="text-stone-100 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>Mandatory Discovery Net Assessment™ (DNA™):</strong> We map the whole competitive Battlespace before deploying a single campaign tool or platform.
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="text-[#bc993c] shrink-0 font-mono text-sm sm:text-base">◆</span>
                    <p className="text-stone-100 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>The S3 Integrated Model:</strong> Directly connects media channels, software integrations, financial reporting, and talent management under one unified roadmap.
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="text-[#bc993c] shrink-0 font-mono text-sm sm:text-base">◆</span>
                    <p className="text-stone-100 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>Growth Death Preemption:</strong> Fulfillment systems are rigorously stressed before scaling, ensuring no structural collapse occurs under heavy client load.
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="text-[#bc993c] shrink-0 font-mono text-sm sm:text-base">◆</span>
                    <p className="text-stone-100 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>The Dynamic 90-Day Combat Plan:</strong> A serialized week-by-week program that lists immediate, clear actions — not vague recommendations or theory.
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="text-[#bc993c] shrink-0 font-mono text-sm sm:text-base">◆</span>
                    <p className="text-stone-100 text-sm sm:text-base leading-relaxed font-sans">
                      <strong>From Ideation through Exit:</strong> WHI serves as your dedicated long-term business advisory partner at every crucial junction of the lifecycle.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#bc993c]/10 backdrop-blur-xs p-5 border border-[#bc993c]/20 rounded font-mono text-xs sm:text-sm text-[#e4c478] italic mt-8 leading-relaxed">
                "Most agencies rent you a map. WHI builds you a command center, secures your supply lines, and walks the terrain beside you — from first move to final exit."
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CORE DIAGNOSIS EXPLAINER BANNER */}
      <section id="dna" className="bg-stone-950 py-24 px-4 sm:px-6 lg:px-8 border-y border-stone-900">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <span className="font-mono text-xs sm:text-sm text-[#bc993c] tracking-[0.3em] font-bold uppercase">THE CORE ENGINE</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-stone-100 font-semibold tracking-tight">
            Discovery Net Assessment™
          </h2>
          <p className="font-mono text-sm sm:text-base text-stone-400 max-w-2xl mx-auto tracking-[0.25em] font-bold">
            DISCOVER. NAVIGATE. ACTIVATE.
          </p>
          <p className="text-stone-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-4xl mx-auto font-sans">
            Our proprietary strategic intelligence process — modeled after military net assessment doctrine. The DNA™ is a paid strategic service that maps your full operational reality before a single dollar of execution is authorized.
          </p>
        </div>
      </section>

      {/* PILLARS & TRANSFORMATION VECTORS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <PillarsGrid />
      </section>

      {/* READINESS TEST PLAYGROUND (HIGHLY INTERACTIVE) */}
      <section className="relative bg-stone-950 py-20 px-4 sm:px-6 lg:px-8 border-y border-stone-900 overflow-hidden">
        {/* Animated Background Video */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
            className="w-full h-full object-cover opacity-75"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* Shading overlays: localized vignette to protect text legibility and blend boundaries perfectly */}
          <div className="absolute inset-0 bg-stone-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 space-y-6" id="playground-text">
            <span className="font-mono text-xs bg-amber-500/10 text-[#bc993c] border border-amber-500/20 px-3.5 py-1.5 rounded inline-block uppercase font-bold tracking-widest">
              Interactive Scenario Workspace
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-100 tracking-tight font-semibold">
              The WHI Readiness Score™
            </h3>
            <p className="font-mono text-xs sm:text-sm text-[#bc993c] uppercase tracking-widest font-extrabold">
              WHERE IS YOUR BUSINESS EXPOSED RIGHT NOW?
            </p>
            <p className="text-stone-300 text-sm sm:text-base lg:text-lg leading-relaxed font-sans">
              Every customized DNA™ produces a structured Readiness Score™ mapped across five core operational vectors. Use the interactive scenario simulator on the right to test how improving specific pillars increases your composite business health.
            </p>
            <div className="space-y-4 pt-3">
              <div className="flex items-center space-x-3 text-sm sm:text-base">
                <span className="w-2.5 h-2.5 bg-[#2e63a6] rounded-full inline-block shrink-0" />
                <span className="text-stone-300 font-mono"><strong className="text-stone-100 font-bold">BLUE FORCE</strong>: Human matrix and core positioning status</span>
              </div>
              <div className="flex items-center space-x-3 text-sm sm:text-base">
                <span className="w-2.5 h-2.5 bg-[#b13b3f] rounded-full inline-block shrink-0" />
                <span className="text-stone-300 font-mono"><strong className="text-stone-100 font-bold">RED FORCE</strong>: Security, pricing protection, and competitor moats</span>
              </div>
              <div className="flex items-center space-x-3 text-sm sm:text-base">
                <span className="w-2.5 h-2.5 bg-[#308c5f] rounded-full inline-block shrink-0" />
                <span className="text-stone-300 font-mono"><strong className="text-stone-100 font-bold">GREEN FORCE</strong>: Fulfillment capabilities and infrastructure limits</span>
              </div>
              <div className="flex items-center space-x-3 text-sm sm:text-base">
                <span className="w-2.5 h-2.5 bg-[#6647b1] rounded-full inline-block shrink-0" />
                <span className="text-stone-300 font-mono"><strong className="text-stone-100 font-bold">BATTLESPACE</strong>: System modernization, algorithms, and tech adoption</span>
              </div>
              <div className="flex items-center space-x-3 text-sm sm:text-base">
                <span className="w-2.5 h-2.5 bg-[#b67820] rounded-full inline-block shrink-0" />
                <span className="text-stone-300 font-mono"><strong className="text-stone-100 font-bold">GAP ANALYSIS</strong>: Capital velocities and operational leverage</span>
              </div>
            </div>

            <div className="p-6 bg-[#0e0f14] border border-stone-900 rounded-lg font-mono text-xs sm:text-sm text-stone-350 flex flex-col items-center text-center justify-center space-y-4 mt-6 leading-relaxed">
              <div className="flex items-center justify-center space-x-2.5">
                <span className="text-amber-500 text-base">⚡</span>
                <span>This is a structural matrix. Initiate your DNA™ to build yours from live intelligence.</span>
              </div>
              <button 
                onClick={() => scrollToSection("assessment-portal")}
                className="px-6 py-3 bg-[#bc993c] text-stone-950 font-mono text-xs font-black tracking-widest uppercase hover:bg-[#a68634] transition-all duration-200 rounded shadow-lg shadow-[#bc993c]/20 cursor-pointer"
              >
                INITIATE ASSESSMENT
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center justify-center w-full">
            {/* Embedded Interactive Score Sandbox */}
            <div className="w-full max-w-2xl bg-stone-900/40 p-6 sm:p-8 rounded-xl border border-stone-850 space-y-8">
              
              <div className="flex justify-between items-center border-b border-stone-800 pb-4">
                <span className="font-mono text-sm font-bold text-stone-200">Composite Readiness Calculator</span>
                <span className="font-mono text-[10px] bg-stone-950 py-1 px-3 rounded text-stone-400">Scenario Mode</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* SVG Radial visualization */}
                <div className="md:col-span-12 lg:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
                    
                    {/* Ring indicator background */}
                    <div className="absolute inset-0 rounded-full border border-stone-800/40" />
                    
                    {/* Dynamic colored ring mapping average */}
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <path
                        className="text-stone-950"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#bc993c] transition-all duration-300"
                        strokeDasharray={`${parseFloat(activeAverage) * 10}, 100`}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl sm:text-5xl font-mono font-black text-stone-100">{activeAverage}</span>
                      <span className="text-[9px] sm:text-[10px] font-mono text-stone-500 uppercase tracking-widest leading-none mt-1">Readiness</span>
                    </div>

                  </div>
                </div>

                {/* Direct sliders */}
                <div className="md:col-span-12 lg:col-span-7 space-y-4 text-xs sm:text-sm font-mono w-full">
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] sm:text-xs">
                      <span className="text-stone-300 capitalize flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#2e63a6]" />
                        <span className="font-bold">Blue Force</span>
                      </span>
                      <span className="font-bold text-[#bc993c]">{sampleScores.blue} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sampleScores.blue}
                      onChange={(e) => handleScoreChange("blue", parseInt(e.target.value))}
                      className="w-full accent-[#bc993c] bg-stone-950 h-2 rounded outline-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] sm:text-xs">
                      <span className="text-stone-300 capitalize flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#b13b3f]" />
                        <span className="font-bold">Red Force</span>
                      </span>
                      <span className="font-bold text-[#bc993c]">{sampleScores.red} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sampleScores.red}
                      onChange={(e) => handleScoreChange("red", parseInt(e.target.value))}
                      className="w-full accent-[#bc993c] bg-stone-950 h-2 rounded outline-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] sm:text-xs">
                      <span className="text-stone-300 capitalize flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#308c5f]" />
                        <span className="font-bold">Green Force</span>
                      </span>
                      <span className="font-bold text-[#bc993c]">{sampleScores.green} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sampleScores.green}
                      onChange={(e) => handleScoreChange("green", parseInt(e.target.value))}
                      className="w-full accent-[#bc993c] bg-stone-950 h-2 rounded outline-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] sm:text-xs">
                      <span className="text-stone-300 capitalize flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#6647b1]" />
                        <span className="font-bold">Battlespace</span>
                      </span>
                      <span className="font-bold text-[#bc993c]">{sampleScores.battlespace} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sampleScores.battlespace}
                      onChange={(e) => handleScoreChange("battlespace", parseInt(e.target.value))}
                      className="w-full accent-[#bc993c] bg-stone-950 h-2 rounded outline-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] sm:text-xs">
                      <span className="text-stone-300 capitalize flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#b67820]" />
                        <span className="font-bold">Gap Analysis</span>
                      </span>
                      <span className="font-bold text-[#bc993c]">{sampleScores.gap} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sampleScores.gap}
                      onChange={(e) => handleScoreChange("gap", parseInt(e.target.value))}
                      className="w-full accent-[#bc993c] bg-stone-950 h-2 rounded outline-none cursor-pointer"
                    />
                  </div>

                </div>

              </div>

              <div className="bg-stone-950 p-5 border border-stone-850 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm">
                <div className="text-center sm:text-left">
                  <span className="text-stone-500 uppercase tracking-widest text-[8px] sm:text-[9px] font-mono block">Estimated Tier Status</span>
                  <span className="font-mono font-bold text-stone-200">
                    {parseFloat(activeAverage) < 5 ? "🔴 UNSTABLE CORE MODEL" : parseFloat(activeAverage) < 7.5 ? "🟡 OPERATIONAL VULNERABILITY" : "🟢 SECURE TRANSFORMATION LAYER"}
                  </span>
                </div>
                <button 
                  onClick={() => scrollToSection("assessment-portal")}
                  className="font-mono text-[#bc993c] hover:underline font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer pointer-events-auto shrink-0"
                >
                  <span>RECONNAISSANCE FORM</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECURE INTELLIGENCE DIAGNOSTIC PORTAL */}
      <section id="assessment-portal" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <span className="font-mono text-xs sm:text-sm text-[#bc993c] tracking-[0.25em] font-bold uppercase">SECURE ALIGNMENT</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-100 font-semibold tracking-tight leading-tight">
            Before We Brief You, <br />
            We Assess You.
          </h2>
          <p className="text-stone-300 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed font-sans">
            The Discovery Net Assessment™ is not available on demand. It begins with a comprehensive five-question Reconnaissance Briefing designed to determine whether your organization is operationally ready for scale-up forces. Answer the following questions with absolute precise and honesty.:
          </p>

          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left font-mono">
            <div className="bg-stone-950 p-4 rounded-lg border border-stone-900 flex space-x-3 items-center">
              <span className="text-[#bc993c] font-extrabold text-base sm:text-lg shrink-0">01</span>
              <span className="text-xs sm:text-sm text-stone-400 leading-snug">Submit qualification questionnaire</span>
            </div>
            <div className="bg-stone-950 p-4 rounded-lg border border-stone-900 flex space-x-3 items-center">
              <span className="text-[#bc993c] font-extrabold text-base sm:text-lg shrink-0">02</span>
              <span className="text-xs sm:text-sm text-stone-400 leading-snug">Reconnaissance Briefing reviewed</span>
            </div>
            <div className="bg-stone-950 p-4 rounded-lg border border-stone-900 flex space-x-3 items-center">
              <span className="text-[#bc993c] font-extrabold text-base sm:text-lg shrink-0">03</span>
              <span className="text-xs sm:text-sm text-stone-400 leading-snug">DNA™ consultation authorized</span>
            </div>
            <div className="bg-stone-950 p-4 rounded-lg border border-stone-900 flex space-x-3 items-center">
              <span className="text-[#bc993c] font-extrabold text-base sm:text-lg shrink-0">04</span>
              <span className="text-xs sm:text-sm text-stone-400 leading-snug">Dynamic combat plan delivered</span>
            </div>
          </div>
        </div>

        <BriefingForm 
          onDiagnosticComplete={(result) => setDiagnosticResult(result)} 
          savedResult={diagnosticResult}
          onClearResult={() => setDiagnosticResult(null)}
        />
      </section>

      {/* WHY CHARGE / INTEL STANDARD */}
      <section id="standard" className="py-24 bg-stone-950 px-4 sm:px-6 lg:px-8 border-y border-stone-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <span className="font-mono text-xs sm:text-sm text-[#bc993c] tracking-[0.25em] font-bold uppercase">THE INTEL PRINCIPLE</span>
            <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-100 tracking-tight font-semibold leading-tight">
              Why we charge for the assessment — and why that protects you.
            </h3>
            <p className="text-stone-300 text-sm sm:text-base md:text-lg leading-relaxed font-sans">
              Free audits are funded by the sales agency hoping to justify their custom downstream retainer software fees. That conflict of interest corrupts the strategic diagnosis before it even begins. The WHI DNA™ operates under a completely different doctrine.
            </p>
 
            <blockquote className="border-l-2 border-[#bc993c] pl-5 font-serif italic text-stone-200 text-base sm:text-lg md:text-xl py-2 bg-stone-900/40 pr-4 rounded-r">
              "We don't audit your business for free because free intelligence has zero operational value. The WHI DNA™ is a premium strategic briefing because your competitive advantage shouldn't be funded by the agency hoping to win your retainer."
              <cite className="block font-mono text-[10px] sm:text-xs text-[#bc993c] uppercase tracking-widest font-extrabold not-italic mt-3">
                — WHI AGENCY OPERATING DOCTRINE
              </cite>
            </blockquote>
          </div>

          <div className="lg:col-span-12 xl:col-span-7">
            <IntelAccordion />
          </div>

        </div>
      </section>

      {/* ASSESSMENT TIERS SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-mono text-xs sm:text-sm text-[#bc993c] tracking-[0.25em] font-bold uppercase block mb-2">CAPITAL MODEL OPTIONS</span>
          <h4 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-100 font-semibold tracking-tight font-bold">Assessment Tiers</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-stone-950 p-8 sm:p-10 rounded-lg border border-stone-850 space-y-6 flex flex-col justify-between animate-goldPulse select-none relative"
            id="assessment-tier-card-1"
          >
            <div className="space-y-3">
              <span className="font-mono text-xs sm:text-sm text-stone-400 uppercase font-bold tracking-wider block">Tier 01</span>
              <h5 className="font-serif font-bold text-stone-100 text-2xl sm:text-3xl">Tactical DNA™</h5>
              <span className="font-mono text-base sm:text-lg font-black text-[#bc993c] block">$2,500 – $3,500</span>
              <p className="text-stone-350 text-sm sm:text-base leading-relaxed pt-2 font-sans">
                Designed specifically for early-stage agencies or startups looking to establish basic positioning protectability and initial product funnel architectures.
              </p>
            </div>
            <button 
              onClick={() => scrollToSection("assessment-portal")}
              className="w-full py-3.5 sm:py-4 bg-stone-900 hover:bg-stone-800 text-stone-300 font-mono text-xs sm:text-sm uppercase tracking-widest font-extrabold rounded-md transition-colors block border border-stone-800 text-center cursor-pointer pointer-events-auto"
            >
              Select Tactical
            </button>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-[#0e0f14] p-8 sm:p-10 rounded-lg border border-[#bc993c]/50 space-y-6 flex flex-col justify-between relative shadow-2xl animate-goldPulse select-none text-left"
            id="assessment-tier-card-2"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#bc993c] text-stone-950 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] px-4.5 py-1.5 rounded-md font-black shadow-lg z-10">
              Core Offering
            </div>
            <div className="space-y-3">
              <span className="font-mono text-xs sm:text-sm text-[#bc993c] uppercase font-bold tracking-wider block">Tier 02</span>
              <h5 className="font-serif font-bold text-stone-100 text-2xl sm:text-3xl">Operational DNA™</h5>
              <span className="font-mono text-base sm:text-lg font-black text-[#bc993c] block">$5,500 – $7,500</span>
              <p className="text-stone-250 text-sm sm:text-base leading-relaxed pt-2 font-sans">
                Our standard robust diagnostic module auditing active marketing pipelines, internal employee fulfillment bottlenecks, and custom tech stack integrations.
              </p>
            </div>
            <button 
              onClick={() => scrollToSection("assessment-portal")}
              className="w-full py-3.5 sm:py-4 bg-[#bc993c] text-stone-950 font-mono text-xs sm:text-sm uppercase tracking-widest font-extrabold rounded-md hover:bg-[#a68634] transition-colors block text-center cursor-pointer pointer-events-auto"
            >
              Select Operational
            </button>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-stone-950 p-8 sm:p-10 rounded-lg border border-stone-850 space-y-6 flex flex-col justify-between animate-goldPulse select-none relative"
            id="assessment-tier-card-3"
          >
            <div className="space-y-3">
              <span className="font-mono text-xs sm:text-sm text-stone-400 uppercase font-bold tracking-wider block">Tier 03</span>
              <h5 className="font-serif font-bold text-stone-100 text-2xl sm:text-3xl">Enterprise DNA™</h5>
              <span className="font-mono text-base sm:text-lg font-black text-[#bc993c] block">$10,000 – $15,000+</span>
              <p className="text-stone-350 text-sm sm:text-base leading-relaxed pt-2 font-sans">
                Focused entirely on mergers & acquisitions, zero-trust enterprise security systems, AI-agent integrations, and strategic exit coaching strategies.
              </p>
            </div>
            <button 
              onClick={() => scrollToSection("assessment-portal")}
              className="w-full py-3.5 sm:py-4 bg-stone-900 hover:bg-stone-800 text-stone-300 font-mono text-xs sm:text-sm uppercase tracking-widest font-extrabold rounded-md transition-colors block border border-stone-800 text-center cursor-pointer pointer-events-auto"
            >
              Select Enterprise
            </button>
          </motion.div>

        </div>
      </section>

      {/* SOLUTIONS & TRANSFORMATIONS SECTION */}
      <section id="solutions" className="bg-stone-950 py-24 px-4 sm:px-6 lg:px-8 border-y border-stone-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 space-y-8">
            <span className="font-mono text-xs sm:text-sm text-[#bc993c] tracking-[0.25em] font-bold uppercase">SOLUTIONS & SCALE</span>
            <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-100 tracking-tight font-semibold">
              Transformation Vectors
            </h3>
            <p className="text-stone-300 text-base sm:text-base md:text-lg leading-relaxed font-sans">
              We scale operations only after the baseline variables have been structurally hardened. These transformation blueprints outline how WE execute once variables are aligned.
            </p>

            <div className="space-y-4">
              <div className="flex space-x-3 bg-[#0e0f14] p-4.5 rounded border border-stone-900">
                <Cpu className="w-5 h-5 text-[#bc993c] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-sm text-stone-200 uppercase font-bold">AI & Tech Modernization</h4>
                  <p className="text-sm text-stone-400 mt-1.5 leading-relaxed font-sans">Replacing spreadsheets with optimized custom script architectures and secure zero-trust neural nodes.</p>
                </div>
              </div>
              
              <div className="flex space-x-3 bg-[#0e0f14] p-4.5 rounded border border-stone-900">
                <TrendingUp className="w-5 h-5 text-[#bc993c] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-sm text-stone-200 uppercase font-bold">Corporate Development Advisory</h4>
                  <p className="text-sm text-stone-400 mt-1.5 leading-relaxed font-sans">Ensuring that operations logic is directly preparing the brand equity for high multiplier M&A deals.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0e0f14] p-6 sm:p-8 rounded border border-stone-850 space-y-6">
            
            <div className="flex items-center space-x-2 text-[#bc993c] font-mono text-xs sm:text-sm tracking-widest uppercase mb-2">
              <Lock className="w-4 h-4 animate-pulse shrink-0" />
              <span>CONFIDENTIAL DEPLOYMENT Blueprints</span>
            </div>
            
            <p className="text-sm sm:text-sm text-stone-400 leading-relaxed font-sans">
              To protect client market insulation models, details about active campaigns remain restricted to authorized participants. Deploying tactical campaigns or tech stacks prior to compiling your custom DNA™ operates as a massive structural liability.
            </p>

            <div className="p-5 bg-stone-950 rounded border border-stone-900 space-y-3">
              <span className="font-mono text-xs text-amber-500 uppercase block font-semibold tracking-wider">ACTIVE TRANSFORM DETECTOR</span>
              <p className="text-sm text-stone-300 leading-relaxed block font-sans">
                Approved corporate operators get custom dashboards visualising real-time pipeline status, compliance delays, and diagnostic scores instantly.
              </p>
            </div>

            <button 
              onClick={() => scrollToSection("assessment-portal")}
              className="w-full py-4 bg-[#bc993c] hover:bg-[#a68634] text-stone-950 font-mono text-xs sm:text-sm font-extrabold uppercase tracking-widest transition-colors rounded cursor-pointer"
            >
              UNLOCk VECTORS WITH YOUR RECONNAISSANCE INPUTS
            </button>
          </div>

        </div>
      </section>

      {/* SECURE COMMAND TEAM */}
      <section id="command-team" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-stone-900 bg-[#0e0f14]">

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-20">
            <span className="font-mono text-xs sm:text-sm text-[#bc993c] tracking-[0.25em] font-bold uppercase">COMMAND TEAM</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-100 font-semibold tracking-tight">
              The Strategists Behind the Intelligence
            </h2>
            <p className="text-stone-300 max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-sans leading-relaxed">
              Anticipating market disruptions and constructing unassailable digital infrastructure moats.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Centered Team Image with Gold Frame */}
            <div className="flex justify-center pb-12">
              <div className="relative p-1 bg-stone-950 border border-[#bc993c] rounded max-w-xl w-full shadow-[0_0_25px_rgba(188,153,60,0.15)] overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/d/1fuGvqNqK6q11LWcHnvG38G3SJalGOY3v" 
                  alt="Command Team" 
                  className="w-full h-auto rounded-sm object-cover" 
                  referrerPolicy="no-referrer"
                />
                
                {/* Micro tech accent lines for the frame corners */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#bc993c]" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#bc993c]" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#bc993c]" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#bc993c]" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 border-b border-stone-900 pb-6">
              {/* Co-founder 1 */}
              <div className="space-y-1.5 sm:max-w-[45%]">
                <span className="font-mono text-[10px] sm:text-xs text-[#bc993c] tracking-widest uppercase block font-semibold">
                  Co-founder & Chief Visionary
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight leading-tight">
                  Michael Wayne
                </h3>
                <p className="font-mono text-[10px] text-stone-400 block pt-1">
                  We Have Ideas • WHI Agency
                </p>
              </div>

              {/* Plus Sign Separator */}
              <div className="flex items-center justify-start sm:justify-center text-[#bc993c] font-mono text-2xl sm:text-3xl font-light">
                +
              </div>

              {/* Co-founder 2 */}
              <div className="space-y-1.5 sm:max-w-[45%]">
                <span className="font-mono text-[10px] sm:text-xs text-[#bc993c] tracking-widest uppercase block font-semibold">
                  Co-founder Chief Technologist
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight leading-tight">
                  Jasen Crockett
                </h3>
                <p className="font-mono text-[10px] text-stone-400 block pt-1">
                  We Have Ideas • WHI Agency
                </p>
              </div>
            </div>

            <p className="text-stone-300 text-sm sm:text-base md:text-lg leading-relaxed font-sans">
              WHI Agency was built from a single conviction: that the modern marketing industry had developed a dangerous obsession with high-churn tactical campaigns, and a catastrophic neglect of foundational strategic diagnosis. After years of orchestrating digital transformation systems and high-margin business models, Michael and Jasen developed and engineered the antidotal WHI framework — a cohesive system to fully support business entities, refusing blind retainer spending until unit variables are thoroughly mapped and stress-tested.
            </p>

            <p className="text-stone-300 text-sm sm:text-base md:text-lg leading-relaxed font-sans">
              Technology scales our execution, but human brilliance is our core engine, engineering our definitive advantage. The WHI team is a global elite network of master creatives, system strategists, and enterprise professionals—ranging from high-fidelity UI/UX engineers and algorithmic architects to predictive growth specialists. Real people, operating with absolute precision and deep empathy, are the core of our transformation model. We don’t just build a workforce; we assemble custom tactical units tailored specifically to exploit the market inefficiencies uncovered by your Discovery Net Assessment™
            </p>

            <div className="space-y-3 pt-2">
              <span className="font-mono text-[10px] sm:text-xs text-amber-500 font-bold block uppercase tracking-wider">CREATIVE BIOGRAPHY STANDARD</span>
              <p className="text-stone-300 text-xs sm:text-sm md:text-base leading-relaxed italic bg-stone-950 p-4 sm:p-5 rounded-lg border border-stone-900 shadow-inner">
                We have dedicated our careers to moving organizations out of defensive survival metrics and into offensive market supremacy. We do not merely consult; we engineer decisive, institutional advantages for visionary leaders who refuse to guess, choose to diagnose, and demand absolute dominance in their battlespace.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* BRIEFING ROOM SECTION */}
      <section id="briefing-room" className="bg-stone-950 py-24 px-4 sm:px-6 lg:px-8 border-t border-stone-900 relative overflow-hidden">
        {/* Background Video Layer */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-55"
          >
            <source 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_115655_b4d9cd77-feed-43cd-a198-af78ebdf1f7a.mp4" 
              type="video/mp4" 
            />
          </video>
          {/* Edge gradients to dissolve video edges smoothly into section bounds */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950 opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-transparent to-stone-950 opacity-90" />
          <div className="absolute inset-0 bg-stone-950/20" />
        </div>

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="font-mono text-xs sm:text-sm text-[#bc993c] tracking-[0.25em] font-bold uppercase block">THE BRIEFING ROOM</span>
              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-stone-100 leading-tight">
                Strategic Intelligence. Published for Operators.
              </h3>
              <p className="text-stone-300 text-sm sm:text-base md:text-lg font-sans leading-relaxed">
                Real-world briefs detailing system vulnerabilities, tactical alignment successes, and growth mechanics.
              </p>
            </div>
            
            <button 
              onClick={() => scrollToSection("assessment-portal")}
              className="inline-flex items-center space-x-1 font-mono text-[10px] text-[#bc993c] uppercase hover:underline tracking-wider text-left"
            >
              <span>Unlock full catalog</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="group relative overflow-hidden bg-stone-950 p-8 rounded-xl border border-stone-850 hover:border-[#bc993c]/50 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-[#bc993c]/5 min-h-[380px]">
              {/* Image Background Layer */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
                <img 
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80" 
                  className="w-full h-full object-cover opacity-45 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500 ease-out" 
                  alt="Texas digital network battlespace overlay background" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-950/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-stone-950/70" />
              </div>

              <div className="relative z-10 space-y-4">
                <span className="inline-block px-2 py-1 bg-blue-500/15 text-blue-400 border border-blue-500/25 rounded font-mono text-[8px] uppercase font-bold tracking-widest">
                  Blue force Analysis
                </span>
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-stone-100 text-lg sm:text-xl tracking-tight leading-snug group-hover:text-[#bc993c] transition-colors duration-300">
                    The 2026 Texas Battlespace Report & Growth Intelligence
                  </h4>
                  <p className="text-stone-300 text-sm leading-relaxed font-sans pt-1">
                    A sector-by-sector breakdown of competitive pressure, AI risk disruption, and platform dependency in tech corridors.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-6">
                <button 
                  onClick={() => scrollToSection("assessment-portal")}
                  className="inline-flex items-center space-x-1.5 font-mono text-stone-300 text-xs uppercase tracking-widest font-bold group-hover:text-[#bc993c] transition-colors duration-300 cursor-pointer pointer-events-auto"
                >
                  <span>REQUEST BRIEFING</span>
                  <span>↗</span>
                </button>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-stone-950 p-8 rounded-xl border border-[#bc993c]/30 hover:border-[#bc993c]/60 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-[#bc993c]/10 min-h-[380px]">
              {/* Image Background Layer */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" 
                  className="w-full h-full object-cover opacity-45 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500 ease-out" 
                  alt="Sleek digital statistics graph background with blue curves" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-950/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-stone-950/70" />
              </div>

              <div className="relative z-10 space-y-4">
                <span className="inline-block px-2 py-1 bg-green-500/15 text-green-400 border border-green-500/25 rounded font-mono text-[8px] uppercase font-bold tracking-widest">
                  Case Study
                </span>
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-stone-100 text-lg sm:text-xl tracking-tight leading-snug group-hover:text-[#bc993c] transition-colors duration-300">
                    Operation: Controlled Burn — Preventing collapse under load
                  </h4>
                  <p className="text-stone-300 text-sm leading-relaxed font-sans pt-1">
                    How an operational stress test saved a behavior health brand from a disastrous $180K campaign scale-up.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-6">
                <button 
                  onClick={() => scrollToSection("assessment-portal")}
                  className="inline-flex items-center space-x-1.5 font-mono text-[#bc993c] text-xs uppercase tracking-widest font-black hover:underline cursor-pointer pointer-events-auto"
                >
                  <span>REQUEST BRIEFING</span>
                  <span>↗</span>
                </button>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-stone-950 p-8 rounded-xl border border-stone-850 hover:border-[#bc993c]/50 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-[#bc993c]/5 min-h-[380px]">
              {/* Image Background Layer */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
                <img 
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80" 
                  className="w-full h-full object-cover opacity-45 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500 ease-out" 
                  alt="Interactive globe map defense digital overlay background" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-950/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-stone-950/70" />
              </div>

              <div className="relative z-10 space-y-4">
                <span className="inline-block px-2 py-1 bg-red-500/15 text-red-400 border border-red-500/25 rounded font-mono text-[8px] uppercase font-bold tracking-widest">
                  Intel BRIEF
                </span>
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-stone-100 text-lg sm:text-xl tracking-tight leading-snug group-hover:text-[#bc993c] transition-colors duration-300">
                    Red Force tactics: Reverse Engineering Competitor R&D
                  </h4>
                  <p className="text-stone-300 text-sm leading-relaxed font-sans pt-1">
                    Detecting competitor price alterations and talent pipelines using public platform telemetry indicators.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-6">
                <button 
                  onClick={() => scrollToSection("assessment-portal")}
                  className="inline-flex items-center space-x-1.5 font-mono text-stone-300 text-xs uppercase tracking-widest font-bold group-hover:text-[#bc993c] transition-colors duration-300 cursor-pointer pointer-events-auto"
                >
                  <span>REQUEST BRIEFING</span>
                  <span>↗</span>
                </button>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-stone-950 p-8 rounded-xl border border-stone-850 hover:border-[#bc993c]/50 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-[#bc993c]/5 min-h-[380px]">
              {/* Image Background Layer */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
                <img 
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80" 
                  className="w-full h-full object-cover opacity-45 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500 ease-out" 
                  alt="High-performance processor servers and orange glowing cyber mesh background" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-950/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-stone-950/70" />
              </div>

              <div className="relative z-10 space-y-4">
                <span className="inline-block px-2 py-1 bg-purple-500/15 text-purple-400 border border-purple-500/25 rounded font-mono text-[8px] uppercase font-bold tracking-widest">
                  Strategic Brief
                </span>
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-stone-100 text-lg sm:text-xl tracking-tight leading-snug group-hover:text-[#bc993c] transition-colors duration-300">
                    Growth Death: Why Brilliant Campaigns Kill Operations
                  </h4>
                  <p className="text-stone-300 text-sm leading-relaxed font-sans pt-1">
                    Why traditional vanity digital agencies default to standard template ads designed around lead lead-churn patterns.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-6">
                <button 
                  onClick={() => scrollToSection("assessment-portal")}
                  className="inline-flex items-center space-x-1.5 font-mono text-stone-300 text-xs uppercase tracking-widest font-bold group-hover:text-[#bc993c] transition-colors duration-300 cursor-pointer pointer-events-auto"
                >
                  <span>REQUEST BRIEFING</span>
                  <span>↗</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FINAL CONFLICT PRE-FOOTER MAP */}
      <section className="bg-stone-950 py-14 px-4 border-t border-stone-900 text-center font-mono text-xs sm:text-sm text-stone-400 tracking-[0.15em] font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 bg-[#bc993c] rounded-full animate-bounce" />
            <span>EXECUTION WITHOUT INTELLIGENCE IS A LIABILITY</span>
          </div>
          <span className="hidden md:inline">◆</span>
          <div>WE DON'T JUST SOLVE PROBLEMS — WE ENGINEER AN ASYMMETRIC ADVANTAGE.</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0e0f14] text-stone-400 border-t border-stone-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Network Video Layer --- Visible but not dominant */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
            className="w-full h-full object-cover opacity-45"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* Gradients to dissolve video edges smoothly into background */}
          <div className="absolute inset-0 bg-[#0e0f14]/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0f14] via-[#0e0f14]/20 to-[#0e0f14]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0f14] via-[#0e0f14]/40 to-[#0e0f14]/80" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10 w-full">
          
          {/* Brand block */}
          <div className="md:col-span-5 space-y-6">
            <div 
              onClick={() => scrollToSection('hero')}
              className="cursor-pointer flex items-center inline-block"
            >
              <WHILogo className="h-8 sm:h-9 hover:opacity-85 transition-opacity" />
            </div>
            
            <p className="text-sm sm:text-base md:text-lg text-stone-300 leading-relaxed max-w-md">
              WHI Agency is a dedicated Business Transformation Engine. We map the terrain, build system architectures, and lead full-lifecycle business executions.
            </p>

            <div className="font-mono text-xs sm:text-sm text-stone-400 flex flex-col space-y-2 pt-2">
              <span className="text-stone-500 uppercase tracking-widest text-xs sm:text-sm">Primary secure communications:</span>
              <a href="mailto:info@whi.agency" className="text-[#bc993c] hover:underline font-extrabold text-base sm:text-lg">INFO@WHI.AGENCY</a>
            </div>
          </div>

          {/* Quick list */}
          <div className="md:col-span-4 space-y-4 font-mono text-xs sm:text-sm uppercase pt-4 md:pt-0">
            <span className="text-stone-250 font-extrabold block pb-1 border-b border-stone-900 mb-3 tracking-widest text-xs sm:text-sm">RESOURCES</span>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => scrollToSection('paradigm')} className="text-left hover:text-stone-100 transition-colors py-1 cursor-pointer">THE DNA™</button>
              <button onClick={() => scrollToSection('solutions')} className="text-left hover:text-stone-100 transition-colors py-1 cursor-pointer">SOLUTIONS</button>
              <button onClick={() => scrollToSection('briefing-room')} className="text-left hover:text-stone-100 transition-colors py-1 cursor-pointer">BRIEFING ROOM</button>
              <button onClick={() => scrollToSection('standard')} className="text-left hover:text-stone-100 transition-colors py-1 cursor-pointer">THE STANDARD</button>
              <button onClick={() => scrollToSection('command-team')} className="text-left hover:text-stone-100 transition-colors py-1 cursor-pointer">THE TEAM</button>
              <button onClick={() => scrollToSection('assessment-portal')} className="text-left hover:text-stone-100 transition-colors py-1 cursor-pointer">ASSESSMENT</button>
            </div>
          </div>

          {/* Copyright badge */}
          <div className="md:col-span-3 space-y-4 font-mono text-xs sm:text-sm md:text-right pt-4 md:pt-0">
            <span className="text-stone-250 font-extrabold block pb-1 border-b border-stone-900 mb-3 tracking-widest text-xs sm:text-sm">SECURITY & DOCTRINE</span>
            <p className="text-xs sm:text-sm text-stone-400 leading-normal">
              All submitted data resides locally within your active workspace. Assessments processed via Secure Neural Transmitting Node standards.
            </p>
            <p className="text-xs sm:text-sm text-[#bc993c] font-bold pt-1">
              © {new Date().getFullYear()} WHI AGENCY & WE HAVE IDEAS · ALL RIGHTS RESERVED
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
