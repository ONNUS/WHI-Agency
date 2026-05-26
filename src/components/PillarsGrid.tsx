import React, { useState } from "react";
import { 
  Shield, 
  Eye, 
  Zap, 
  Map, 
  Compass, 
  CheckSquare, 
  Cpu, 
  TrendingUp, 
  Maximize, 
  FileText,
  Lock,
  Workflow
} from "lucide-react";

export default function PillarsGrid() {
  const [activeTab, setActiveTab] = useState<"pillars" | "vectors">("pillars");
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);
  const [expandedVector, setExpandedVector] = useState<number | null>(null);

  const pillars = [
    {
      id: 1,
      num: "01",
      name: "BLUE FORCE",
      title: "Internal Capabilities & Talent Matrix",
      desc: "Auditing brand positioning, offer strength, margin economics, and the skills gap across your leadership and delivery team.",
      color: "border-[#2e63a6] hover:bg-[#2e63a6]/5",
      badgeColor: "bg-[#2e63a6]/10 text-[#2e63a6] border-[#2e63a6]/20",
      icon: Shield,
      details: "We map who is doing what, how much bandwidth they consume, and locate hidden productivity drains. Before scaling, we audit whether your current offer is optimized for enterprise margin economics."
    },
    {
      id: 2,
      num: "02",
      name: "RED FORCE",
      title: "Competitive Intelligence & Shadow Campaigns",
      desc: "Reverse-engineering competitor economics, uncovering hidden R&D moves, and mapping their operational vulnerabilities before they strike.",
      color: "border-[#b13b3f] hover:bg-[#b13b3f]/5",
      badgeColor: "bg-[#b13b3f]/10 text-[#b13b3f] border-[#b13b3f]/20",
      icon: Eye,
      details: "We execute deep-dive studies into competitor lead channels, dark-post tests, and headcount distributions to isolate vulnerabilities they must defend, securing your asymmetric high ground."
    },
    {
      id: 3,
      num: "03",
      name: "GREEN FORCE",
      title: "Operational Readiness & Growth Death Prevention",
      desc: "Stress-testing fulfillment capacity, tech-stack scalability, and cash flow velocity — ensuring your infrastructure can absorb scale without collapsing.",
      color: "border-[#308c5f] hover:bg-[#308c5f]/5",
      badgeColor: "bg-[#308c5f]/10 text-[#308c5f] border-[#308c5f]/20",
      icon: Zap,
      details: "Growth Death is the fatal process of generating customer demand your fulfillment cannot survive. We stress-test checkouts, response delays, and supplier chains before authorizing the marketing engines."
    },
    {
      id: 4,
      num: "04",
      name: "BATTLESPACE",
      title: "Market Vectors, Data Moats & Platform Shifts",
      desc: "Mapping AI disruption, regulatory risk, zero-trust infrastructure gaps, and platform dependency before they become existential vulnerabilities.",
      color: "border-[#6647b1] hover:bg-[#6647b1]/5",
      badgeColor: "bg-[#6647b1]/10 text-[#6647b1] border-[#6647b1]/20",
      icon: Map,
      details: "We analyze regulatory exposure, SaaS dependencies, and how AI agents could erode your legacy pricing. This forms your long-range defense moat against rapid market disruptions."
    },
    {
      id: 5,
      num: "05",
      name: "STRATEGIC GAP",
      title: "Asymmetric Opportunity & ROI Heatmap",
      desc: "Synthesizing all intelligence into a prioritized Heatmap — isolating the exact voids where you hold maximum leverage against competitor weaknesses.",
      color: "border-[#b67820] hover:bg-[#b67820]/5",
      badgeColor: "bg-[#b67820]/10 text-[#b67820] border-[#b67820]/20",
      icon: Compass,
      details: "By contrasting competitor failures against your unique team assets, we construct a heat map separating low-effort, high-margin vectors from costly, crowded metrics."
    },
    {
      id: 6,
      num: "06",
      name: "ADVANTEDGE™ ROADMAP",
      title: "The First 90-Day Combat Plan",
      desc: "A week-by-week tactical sequence — not a strategy deck. The exact moves to make on Day 1, Week 1, and Month 1 to capture immediate ROI.",
      color: "border-[#bc993c] hover:bg-[#bc993c]/5",
      badgeColor: "bg-[#bc993c]/10 text-[#bc993c] border-[#bc993c]/20",
      icon: CheckSquare,
      details: "We translate strategic intelligence into immediate, board-ready checklists. On Day 1, your executive team knows exactly what parameters to hardened first, bypassing analysis paralysis."
    }
  ];

  const vectors = [
    {
      id: 1,
      name: "AI & Emerging Technologies",
      title: "Infrastructure Modernization",
      desc: "Comprehensive AI audits and agents, digital twin deployment, Voice AI automation development, advanced systems orchestration, and zero-trust infrastructure hardening.",
      icon: Cpu,
      isUnockedByDna: true,
      bullets: [
        "AI Agent and Digital Twin Deployment modeling the exact operation chain",
        "Custom Voice AI pipelines trained on brand-specific intelligence",
        "Legacy system migrations replacing error-prone manual spreadsheets",
        "Zero-trust cybersecurity integration ensuring absolute data sovereignty"
      ]
    },
    {
      id: 2,
      name: "Business Development Solutions",
      title: "Strategic Consulting & Growth Partnership",
      desc: "High-level consultative project management, digital transformation implementation, portfolio advisory, exit coaching, and fractional Business Broker Services.",
      icon: TrendingUp,
      isUnlockedByDna: true,
      bullets: [
        "M&A preparation maximizing multiplier metrics for final transaction exits",
        "Fractional Executive support to lead critical system transitions",
        "Unified multi-divisional strategic plans bridging management to production",
        "Revenue model refactoring shifting business logic to predictable streams"
      ]
    },
    {
      id: 3,
      name: "Tactile Operations",
      title: "High-Output Media Buy & UI Engineering",
      desc: "Premium brand architecture, high-converting React UI/UX design, channel acquisition optimization, and comprehensive content frameworks.",
      icon: Workflow,
      isUnlockedByDna: true,
      bullets: [
        "Responsive software, application, and web-app design systems",
        "High-performance client dashboards and vector-based telemetry tools",
        "Multi-channel advertising modeling exact Red Force voids",
        "Unbiased marketing buys mapped directly to cash velocity requirements"
      ]
    }
  ];

  return (
    <div className="space-y-8" id="pillars-section">
      {/* TABS */}
      <div className="flex border-b border-stone-850 justify-center">
        <button
          onClick={() => setActiveTab("pillars")}
          className={`px-8 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest transition-all ${
            activeTab === "pillars"
              ? "border-b-2 border-[#bc993c] text-stone-100"
              : "text-stone-500 hover:text-stone-300"
          }`}
        >
          THE 6 PILLARS OF DNA™
        </button>
        <button
          onClick={() => setActiveTab("vectors")}
          className={`px-8 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest transition-all ${
            activeTab === "vectors"
              ? "border-b-2 border-[#bc993c] text-stone-100"
              : "text-stone-500 hover:text-stone-300"
          }`}
        >
          TRANSFORMATION VECTORS
        </button>
      </div>

      {activeTab === "pillars" ? (
        /* PILARS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="dna-pillars-grid">
          {pillars.map((pillar) => {
            const IconComponent = pillar.icon;
            const isExpanded = expandedPillar === pillar.id;

            return (
              <div
                key={pillar.id}
                onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                className={`cursor-pointer rounded border p-6 bg-stone-950/50 transition-all ${pillar.color} ${
                  isExpanded ? "ring-1 ring-amber-500/20 shadow-lg scale-[1.01]" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <span className={`px-2.5 py-1 border rounded font-mono text-[10px] sm:text-xs uppercase font-bold ${pillar.badgeColor}`}>
                    Pillar {pillar.num}
                  </span>
                  <IconComponent className="w-6 h-6 text-stone-500" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-mono text-stone-100 text-xs sm:text-sm font-extrabold tracking-widest">
                    {pillar.name}
                  </h4>
                  <h5 className="font-serif text-base sm:text-lg font-bold text-stone-200 tracking-tight leading-snug">
                    {pillar.title}
                  </h5>
                  <p className="text-sm text-stone-350 leading-relaxed font-sans pt-1">
                    {pillar.desc}
                  </p>
                </div>

                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-stone-900 text-sm sm:text-base text-stone-200 leading-relaxed space-y-3 animate-fadeIn font-sans">
                    <span className="font-mono text-[10px] sm:text-xs text-[#bc993c] font-bold uppercase block">Net Assessment Scope:</span>
                    <p>{pillar.details}</p>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#bc993c] hover:underline flex items-center space-x-1">
                    <span>{isExpanded ? "COLLAPSE DRILL-DOWN" : "EXPAND DRILL-DOWN"}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TRANSFORMATION VECTORS GRID */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn" id="vectors-grid">
          {vectors.map((vector) => {
            const IconC = vector.icon;
            const isExpanded = expandedVector === vector.id;

            return (
              <div
                key={vector.id}
                onClick={() => setExpandedVector(isExpanded ? null : vector.id)}
                className={`cursor-pointer border border-stone-850 bg-[#0e0f14]/80 p-6 rounded hover:border-stone-700 transition-all ${
                  isExpanded ? "ring-1 ring-amber-500/10 shadow-xl" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center space-x-1.5 border border-amber-500/10 bg-[#bc993c]/10 text-[#bc993c] px-2.5 py-1 rounded text-[10px] sm:text-xs font-mono uppercase font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>LOCKED: DNA™ GATED</span>
                  </div>
                  <IconC className="w-6 h-6 text-stone-500" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif text-[#bc993c] text-base sm:text-lg font-bold tracking-tight">
                    {vector.name}
                  </h4>
                  <p className="font-mono text-xs sm:text-sm font-bold uppercase text-stone-400">
                    {vector.title}
                  </p>
                  <p className="text-sm text-stone-350 leading-relaxed">
                    {vector.desc}
                  </p>
                </div>

                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-stone-900 text-sm sm:text-base text-stone-200 space-y-4 animate-fadeIn font-sans">
                    <span className="font-mono text-[10px] sm:text-xs text-[#bc993c] font-bold uppercase block tracking-wider">DEPLOYMENT SPECIFICATION:</span>
                    <ul className="space-y-3 font-sans">
                      {vector.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-[#bc993c] mt-1 shrink-0 font-mono text-xs">◆</span>
                          <span className="text-stone-300 text-sm sm:text-base">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#bc993c] hover:underline">
                    {isExpanded ? "COLLAPSE SPECIFICATIONS" : "VIEW SPECIFICATIONS"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
