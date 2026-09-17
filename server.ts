import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Prospect Enrichment & Analysis endpoint
app.post("/api/enrich", async (req, res) => {
  try {
    const { name, company, role, industry, website, currentNotes } = req.body;
    const ai = getGenAI();

    if (ai) {
      const prompt = `Analyze this sales prospect for B2B qualification and intelligence:
Prospect Name: ${name || "Unknown"}
Company: ${company || "Unknown"}
Role: ${role || "Unknown"}
Industry: ${industry || "Technology"}
Website: ${website || ""}
Current Notes: ${currentNotes || "None"}

Provide a structured JSON response with:
- fitScore (number between 60 and 99)
- intentScore (number between 50 and 98)
- summary (2-3 concise sentences summarizing their business, growth trigger, and strategic need)
- painPoints (array of 3 specific operational/strategic challenges they likely face)
- estimatedRevenue (e.g. "$5M - $15M" or similar realistic estimate)
- companySize (e.g. "50-150 employees")
- techStack (array of 3-5 technologies they likely use)
- buyingTriggers (array of 2 recent events or industry shifts creating urgency)
- recommendedAngle (1 sentence on the best psychological hook/value prop)`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ success: true, source: "gemini", data: parsed });
      }
    }

    // Heuristic intelligent fallback when API key is not configured
    const calculatedFit = Math.floor(75 + Math.random() * 22);
    const calculatedIntent = Math.floor(68 + Math.random() * 26);
    
    return res.json({
      success: true,
      source: "heuristic",
      data: {
        fitScore: calculatedFit,
        intentScore: calculatedIntent,
        summary: `${name || "The prospect"} leads ${role || "key initiatives"} at ${company || "their company"}, focusing on scaling operational output and driving digital transformation in the ${industry || "modern tech"} sector.`,
        painPoints: [
          "Manual sales pipelines causing slow lead velocity and lost opportunities",
          "Lack of unified intelligence to prioritize high-intent accounts",
          "Scaling outreach without compromising personalization and conversion rates",
        ],
        estimatedRevenue: "$10M - $25M ARR",
        companySize: "50 - 200 employees",
        techStack: ["HubSpot", "Salesforce", "Segment", "Slack", "AWS"],
        buyingTriggers: [
          "Recent hiring push in commercial and technology teams",
          "Quarterly mandate to reduce customer acquisition cost (CAC)",
        ],
        recommendedAngle: `Emphasize automated qualification speed and pipeline predictability for ${role || "leadership"}.`,
      },
    });
  } catch (error: any) {
    console.error("Enrichment error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze prospect" });
  }
});

// AI Outreach Generator endpoint
app.post("/api/generate-outreach", async (req, res) => {
  try {
    const { prospect, senderName, senderCompany, valueProp, tone, language, channel } = req.body;
    const ai = getGenAI();

    const selectedLanguage = language || "English";
    const selectedTone = tone || "Consultative & Professional";
    const selectedChannel = channel || "email";

    if (ai) {
      const prompt = `You are an elite B2B sales copywriter and pipeline expert. Write high-converting cold outreach:
Target Prospect:
- Name: ${prospect?.name || "Prospect"}
- Company: ${prospect?.company || "Company"}
- Role: ${prospect?.role || "Leader"}
- Industry: ${prospect?.industry || "Tech"}
- Pain Points: ${prospect?.painPoints ? prospect.painPoints.join(", ") : "pipeline efficiency and scaling"}

Sender Details:
- Sender Name: ${senderName || "Alex Morgan"}
- Sender Company: ${senderCompany || "Prospect IA"}
- Core Value Proposition: ${valueProp || "Automated AI lead qualification and personalized outreach that 3x sales velocity"}

Parameters:
- Channel: ${selectedChannel} (e.g. cold_email, linkedin_invite, linkedin_inmail, phone_whatsapp_pitch)
- Tone: ${selectedTone}
- Language: ${selectedLanguage}

Provide a structured JSON output with:
- subject (for email or inmail, concise and curious, maximum 6 words)
- body (the message body formatted with line breaks, crisp, hyper-relevant, under 120 words, no generic fluff, ending with a low-friction soft call-to-action)
- followUp (a short 2-sentence follow-up message to send 3 days later)
- whyItWorks (1 sentence explaining the psychological angle applied)`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ success: true, source: "gemini", data: parsed });
      }
    }

    // Heuristic generator fallback
    const prospectName = prospect?.name?.split(" ")[0] || "there";
    const comp = prospect?.company || "your team";
    const userRole = prospect?.role || "leader";

    let subject = `Quick question re: ${comp}'s pipeline`;
    let body = `Hi ${prospectName},\n\nNoticed your work steering ${userRole} initiatives at ${comp}. Most leaders in ${prospect?.industry || "your space"} we speak with are looking to eliminate manual prospecting bottlenecks and boost conversion.\n\nAt ${senderCompany || "Prospect IA"}, we help high-growth teams automate lead intelligence and 3x outreach velocity without robotic sounding templates.\n\nWould you be opposed to a brief 5-minute look at how this could fit into ${comp}'s roadmap this quarter?\n\nBest,\n${senderName || "Alex"}`;
    let followUp = `Hi ${prospectName}, following up on this—thought you might find our qualification benchmark helpful for ${comp}. Open to a 5-minute chat?`;

    if (selectedChannel === "linkedin_invite") {
      subject = "LinkedIn Connection Request";
      body = `Hi ${prospectName}, came across your leadership at ${comp} and love what you are building in ${prospect?.industry || "the space"}. Would love to connect and share notes!`;
      followUp = `Thanks for connecting ${prospectName}! Loved your recent update.`;
    } else if (selectedChannel === "phone_whatsapp_pitch") {
      subject = "Direct Pitch Script";
      body = `Hey ${prospectName}, this is ${senderName || "Alex"} with ${senderCompany || "Prospect IA"}. I'm reaching out because I saw you're leading ${userRole} at ${comp}. We recently helped similar companies cut lead research time by 70% while improving meeting rates. Do you have 3 minutes later this week?`;
      followUp = `Sent you a quick email summary as well, ${prospectName}. Looking forward to connecting!`;
    }

    if (selectedLanguage.toLowerCase().includes("french") || selectedLanguage.toLowerCase().includes("fr")) {
      subject = `Question rapide sur la croissance de ${comp}`;
      body = `Bonjour ${prospectName},\n\nJ'ai remarqué vos initiatives en tant que ${userRole} chez ${comp}. La plupart des équipes de votre secteur cherchent à automatiser la qualification de leurs prospects sans perdre en pertinence.\n\nNous aidons les entreprises à tripler l'efficacité de leur prospection commerciale grâce à l'IA.\n\nSeriez-vous ouvert à un échange rapide de 5 minutes cette semaine ?\n\nBien à vous,\n${senderName || "Alex"}`;
      followUp = `Bonjour ${prospectName}, je me permets de faire un petit suivi. Avez-vous eu l'occasion de jeter un œil à mon message précédent ?`;
    }

    return res.json({
      success: true,
      source: "heuristic",
      data: {
        subject,
        body,
        followUp,
        whyItWorks: "Uses role-specific relevance, social proof, and a low-friction soft call-to-action.",
      },
    });
  } catch (error: any) {
    console.error("Outreach generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate outreach" });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Prospect IA] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
