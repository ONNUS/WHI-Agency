export interface PillarScore {
  name: string;
  key: "blue" | "red" | "green" | "battlespace" | "gap";
  score: number;
  label: string;
  color: string;
  description: string;
}

export interface ReconBriefing {
  businessName: string;
  industry: string;
  location: string;
  blueForceAnswers: string; // Internal Capabilities / Talent Matrix
  redForceAnswers: string;  // Competitive pressure / Brand Positioning
  greenForceAnswers: string; // Fulfillment capacity / Tech scalability
  battlespaceAnswers: string; // AI & zero-trust readiness / Regulations
  gapAnswers: string;       // Cash flow constraints / Growth limits
}

export interface DiagnosticResult {
  scores: {
    blue: number;
    red: number;
    green: number;
    battlespace: number;
    gap: number;
  };
  overallScore: number;
  criticalVulnerability: string;
  asymmetricLeverage: string;
  combatPlan90Days: {
    phase1: string; // Days 1-30: Immediate Hardening
    phase2: string; // Days 31-60: Operational Alignment
    phase3: string; // Days 61-90: Velocity Generation
  };
  executiveSummary: string;
  isGeminiLive?: boolean;
  submissionId?: string;
}
