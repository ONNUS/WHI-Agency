import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// ─── Repositories ─────────────────────────────────────────────────────────────
import { JsonUserRepository } from "./server/repositories/JsonUserRepository.js";
import { JsonBriefingRepository } from "./server/repositories/JsonBriefingRepository.js";
import { JsonProspectRepository } from "./server/repositories/JsonProspectRepository.js";

// ─── Services ─────────────────────────────────────────────────────────────────
import * as seedService from "./server/services/seedService.js";

// ─── Routes ───────────────────────────────────────────────────────────────────
import { createAdminAuthRouter } from "./server/routes/adminAuth.js";
import { createAdminBriefingsRouter } from "./server/routes/adminBriefings.js";
import { createAdminProspectsRouter } from "./server/routes/adminProspects.js";
import { createAdminUsersRouter } from "./server/routes/adminUsers.js";
import { createAdminStatsRouter } from "./server/routes/adminStats.js";
import { createPublicProspectsRouter } from "./server/routes/publicProspects.js";

// ─── Middleware ────────────────────────────────────────────────────────────────
import { assessLimiter } from "./server/middleware/rateLimiter.js";

dotenv.config();

// ─── Data Repositories (singleton instances) ──────────────────────────────────
const DATA_PATH = process.env.DATA_PATH ?? "./data/json/dna/questionnaire";
const userRepo = new JsonUserRepository(DATA_PATH);
const briefingRepo = new JsonBriefingRepository(DATA_PATH);
const prospectRepo = new JsonProspectRepository(DATA_PATH);

// Create Express app
const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGIN || "https://yourdomain.com"
      : true, // allow all origins in development
  credentials: true,
};
app.use(cors(corsOptions));

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── Sanitize helper ─────────────────────────────────────────────────────────
function sanitize(s: string): string {
  return s
    .replace(/[<>`\\]/g, "")
    .replace(/\[INST\]|\[\/INST\]|###/g, "")
    .trim()
    .slice(0, 2000);
}

// ─── Admin API routes ─────────────────────────────────────────────────────────
app.use("/api/admin/auth", createAdminAuthRouter(userRepo));
app.use("/api/admin/briefings", createAdminBriefingsRouter(briefingRepo));
app.use("/api/admin/prospects", createAdminProspectsRouter(prospectRepo));
app.use("/api/admin/users", createAdminUsersRouter(userRepo));
app.use("/api/admin/stats", createAdminStatsRouter(briefingRepo, prospectRepo, userRepo));

// ─── Public API routes ───────────────────────────────────────────────────────
app.use("/api/prospects", createPublicProspectsRouter(prospectRepo));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyConfigured = apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "";

let ai: GoogleGenAI | null = null;
if (isApiKeyConfigured) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("WHI Diagnostic Center: Gemini API client initialized successfully.");
  } catch (error) {
    console.error("WHI Diagnostic Center: Failed to initialize Gemini API Client:", error);
  }
} else {
  console.log("WHI Diagnostic Center: Running in Local Fallback mode. Configure a secret GEMINI_API_KEY in Settings to enable live neural intelligence brief generation.");
}

// Q&A API Endpoint
app.post("/api/assess", assessLimiter, async (req, res) => {
  const {
    businessName: rawBusiness,
    industry: rawIndustry,
    location: rawLocation,
    blueForceAnswers: rawBlue,
    redForceAnswers: rawRed,
    greenForceAnswers: rawGreen,
    battlespaceAnswers: rawBattle,
    gapAnswers: rawGap,
  } = req.body;

  // Sanitize all inputs
  const businessName = sanitize(String(rawBusiness || ""));
  const industry = sanitize(String(rawIndustry || ""));
  const location = sanitize(String(rawLocation || ""));
  const blueForceAnswers = sanitize(String(rawBlue || ""));
  const redForceAnswers = sanitize(String(rawRed || ""));
  const greenForceAnswers = sanitize(String(rawGreen || ""));
  const battlespaceAnswers = sanitize(String(rawBattle || ""));
  const gapAnswers = sanitize(String(rawGap || ""));

  // Simple validation
  if (!businessName || !industry) {
    return res.status(400).json({ error: "Business Name and Industry/Vertical are required parameters." });
  }

  // 1. If Gemini AI is active, invoke it with net assessment doctrine prompt
  if (ai) {
    try {
      const prompt = `
        You are the Head of Strategic Intelligence at WHI Agency, a elite Business Transformation Engine modeling net-assessment doctrine.
        Analyze the following client reconnaissance survey questionnaire responses for the organization: "${businessName}" specializing in "${industry}", operating out of "${location || "Unspecified Corridor"}".

        Their responses are:
        - BLUE FORCE (Their Capabilities & Talent Matrix): ${blueForceAnswers || "Deem operational or unaddressed."}
        - RED FORCE (Competitive Position & Pricing Power): ${redForceAnswers || "Deem operational or unaddressed."}
        - GREEN FORCE (Stress Test, Scalability & fulfillment): ${greenForceAnswers || "Deem operational or unaddressed."}
        - BATTLESPACE (AI Readiness, Tech Infrastructure, platform shifts): ${battlespaceAnswers || "Deem operational or unaddressed."}
        - STRATEGIC GAP (Margin structures, scaling pain, cash velocities): ${gapAnswers || "Deem operational or unaddressed."}

        Formulate their WHI Readiness Score™ showing vulnerabilities on a scale of 1 to 10 for each of the five pillars:
        - blue (Blue Force): How solid are their internal team, placement, and value proposition? (10 is elite, 1 is critical gap)
        - red (Red Force): How insulated are they from competitors and copycats?
        - green (Green Force): How operationally ready are they to handle increased load?
        - battlespace (Battlespace): How advanced is their digital/AI architecture?
        - gap (Strategic Gap): How solid are their unit economics and execution speeds?

        Write a professional, militaristic, sharp diagnostic report in clean JSON format adhering strictly to the required schema. Keep summaries punchy and filled with objective terms (e.g., 'Growth Death risks', 'asymmetric leverages'). Avoid filler or self-congratulatory jargon. State hard truths clearly like a seasoned business strategist.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the primary artificial intelligence module for the WHI Agency Command Center. You think and talk in high-level strategic intelligence terms. You diagnose operational failure modes and propose high-velocity combat roadmaps.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scores: {
                type: Type.OBJECT,
                properties: {
                  blue: { type: Type.NUMBER, description: "A score from 1.0 to 10.0 for Blue Force capabilities." },
                  red: { type: Type.NUMBER, description: "A score from 1.0 to 10.0 for Red Force insulation." },
                  green: { type: Type.NUMBER, description: "A score from 1.0 to 10.0 for Green Force limits." },
                  battlespace: { type: Type.NUMBER, description: "A score from 1.0 to 10.0 for Battlespace modernity." },
                  gap: { type: Type.NUMBER, description: "A score from 1.0 to 10.0 for Strategic Gap resolution." },
                },
                required: ["blue", "red", "green", "battlespace", "gap"],
              },
              overallScore: { type: Type.NUMBER, description: "Average score across the five key vectors." },
              criticalVulnerability: { type: Type.STRING, description: "Maximum tactical hazard profile or points of total failure (Growth Death Risk)." },
              asymmetricLeverage: { type: Type.STRING, description: "Area of immediate high-yielding market exploitation." },
              combatPlan90Days: {
                type: Type.OBJECT,
                properties: {
                  phase1: { type: Type.STRING, description: "Days 1-30: Tactical Hardening focus." },
                  phase2: { type: Type.STRING, description: "Days 31-60: Operational Alignment moves." },
                  phase3: { type: Type.STRING, description: "Days 61-90: Velocity Generation and scale-up sequences." },
                },
                required: ["phase1", "phase2", "phase3"],
              },
              executiveSummary: { type: Type.STRING, description: "Authoritative boardroom-level intelligence briefing summary (2-3 sentences)." },
            },
            required: ["scores", "overallScore", "criticalVulnerability", "asymmetricLeverage", "combatPlan90Days", "executiveSummary"],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsedReport = JSON.parse(responseText.trim());
        const briefing = await briefingRepo.create({
          businessName,
          industry,
          location,
          blueForceAnswers,
          redForceAnswers,
          greenForceAnswers,
          battlespaceAnswers,
          gapAnswers,
          scores: parsedReport.scores,
          overallScore: parsedReport.overallScore,
          criticalVulnerability: parsedReport.criticalVulnerability,
          asymmetricLeverage: parsedReport.asymmetricLeverage,
          combatPlan90Days: parsedReport.combatPlan90Days,
          executiveSummary: parsedReport.executiveSummary,
          isGeminiLive: true,
        });
        return res.json({
          ...parsedReport,
          isGeminiLive: true,
          submissionId: briefing.id,
        });
      }
    } catch (apiError) {
      console.error("WHI AI Command API Error. Swerving to local fallback assessment calculation:", apiError);
    }
  }

  // 2. High-Quality Deterministic Semantic Fallback (Ensures the app is robust even under limited credentials / missing key)
  const answersLength = 
    (blueForceAnswers || "").length + 
    (redForceAnswers || "").length + 
    (greenForceAnswers || "").length + 
    (battlespaceAnswers || "").length + 
    (gapAnswers || "").length;

  // Let's parse words for specific keywords to estimate custom scores dynamically
  const textBlob = `${blueForceAnswers} ${redForceAnswers} ${greenForceAnswers} ${battlespaceAnswers} ${gapAnswers}`.toLowerCase();
  
  let blueScore = 7;
  let redScore = 5;
  let greenScore = 6;
  let battleScore = 4;
  let gapScore = 6;

  if (textBlob.includes("hiring") || textBlob.includes("talent") || textBlob.includes("vacancy") || textBlob.includes("skill")) blueScore -= 2;
  if (textBlob.includes("niche") || textBlob.includes("different") || textBlob.includes("authority")) blueScore += 1;
  if (textBlob.includes("competitor") || textBlob.includes("copy") || textBlob.includes("price war") || textBlob.includes("cheap")) redScore -= 2;
  if (textBlob.includes("brand") || textBlob.includes("market leader") || textBlob.includes("premium")) redScore += 2;
  if (textBlob.includes("manual") || textBlob.includes("break") || textBlob.includes("bottleneck") || textBlob.includes("slow")) greenScore -= 3;
  if (textBlob.includes("automated") || textBlob.includes("software") || textBlob.includes("scale")) greenScore += 2;
  if (textBlob.includes("legacy") || textBlob.includes("old") || textBlob.includes("spreadsheet") || textBlob.includes("analog")) battleScore -= 2;
  if (textBlob.includes("ai") || textBlob.includes("cloud") || textBlob.includes("security") || textBlob.includes("tech")) battleScore += 3;
  if (textBlob.includes("cash") || textBlob.includes("capital") || textBlob.includes("margin") || textBlob.includes("debt")) gapScore -= 2;

  // Clamp values between 2 and 10
  const clamp = (val: number) => Math.min(10, Math.max(2, val));
  blueScore = clamp(blueScore);
  redScore = clamp(redScore);
  greenScore = clamp(greenScore);
  battleScore = clamp(battleScore);
  gapScore = clamp(gapScore);

  const averageScore = parseFloat(((blueScore + redScore + greenScore + battleScore + gapScore) / 5).toFixed(1));

  // Determine critical vulnerabilities and strengths based on lowest scores
  let criticalVulnerability = "Fulfillment scalability limits. Generating additional marketing demand under current parameters will trigger 'Growth Death' and brand dilution.";
  let asymmetricLeverage = "Establishing automated systems and data capture pipelines to reclaim executive bandwidth and drive margin optimization.";

  if (greenScore <= blueScore && greenScore <= redScore) {
    criticalVulnerability = "Green Force Deficit: Serious fulfillment capability limits. Current systems are highly manual and likely to experience critical bottlenecking if lead volume scales 2x.";
  } else if (redScore <= blueScore && redScore <= greenScore) {
    criticalVulnerability = "Red Force Insufficiency: Competitive copycat vulnerability and pricing compression. The brand identity is operating too close to commodity definitions, inviting a race to the bottom.";
  } else if (blueScore <= redScore && blueScore <= greenScore) {
    criticalVulnerability = "Blue Force Disruption: Suboptimal core offer framing and internal execution skill gaps. High-tier executive time is being consumed by standard lower-yielding tasks.";
  }

  const fallbackResult = {
    scores: {
      blue: blueScore,
      red: redScore,
      green: greenScore,
      battlespace: battleScore,
      gap: gapScore,
    },
    overallScore: averageScore,
    criticalVulnerability,
    asymmetricLeverage,
    combatPlan90Days: {
      phase1: `Days 1–30: Plug major holes in ${greenScore < 6 ? "fulfillment systems" : "profitability parameters"}. Stop uninsulated spending and establish an operational buffer before scaling further.`,
      phase2: `Days 31–60: Standardize ${blueScore < 6 ? "offer packaging" : "digital twin automations"}. Introduce automated customer qualifiers to protect the core delivery pipeline.`,
      phase3: `Days 61–90: Deploy Red Force shadow positioning. Launch highly differentiated, strategic campaigns targeting market share voids.`,
    },
    executiveSummary: `Reconnaissance Briefing authorized for ${businessName}. While scaling parameters show operational promise in ${industry}, fundamental vulnerabilities in systems integration and tactical insulation must be patched before launching capital projects.`,
  };

  const briefing = await briefingRepo.create({
    businessName,
    industry,
    location,
    blueForceAnswers,
    redForceAnswers,
    greenForceAnswers,
    battlespaceAnswers,
    gapAnswers,
    scores: fallbackResult.scores,
    overallScore: fallbackResult.overallScore,
    criticalVulnerability: fallbackResult.criticalVulnerability,
    asymmetricLeverage: fallbackResult.asymmetricLeverage,
    combatPlan90Days: fallbackResult.combatPlan90Days,
    executiveSummary: fallbackResult.executiveSummary,
    isGeminiLive: false,
  });

  res.json({
    ...fallbackResult,
    isGeminiLive: false,
    submissionId: briefing.id,
  });
});

// Start serve pipeline
async function startServer() {
  const PORT = parseInt(process.env.PORT ?? '3000', 10);

  // ─── Startup tasks ────────────────────────────────────────────────────────
  await seedService.seed(userRepo);
  await briefingRepo.reconcileIndex();
  await prospectRepo.reconcileIndex();

  if (process.env.NODE_ENV !== "production") {
    console.log("Vite is running in Development mode; mounting middleware engine...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Express is running in Production; serving static code from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WHI Landing Portal successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
