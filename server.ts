/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // API: Gemini Insights Generator
  app.post("/api/gemini/insights", async (req: express.Request, res: express.Response) => {
    try {
      const { breakdown, inputs, activeActions } = req.body;

      if (!breakdown || !inputs) {
         res.status(400).json({ error: "Missing required footprint breakdown or inputs state." });
         return;
      }

      const client = getGeminiClient();

      const userProfileString = `
      CARBON FOOTPRINT PROFILE:
      - Transport: ${breakdown.transport} kg CO2/year
        Details: ${inputs.transport.carDistance} km yearly driving, car type: ${inputs.transport.carType}, ${inputs.transport.publicTransitHours} hrs/week public transit, short flights: ${inputs.transport.flightsShort}/year, long flights: ${inputs.transport.flightsLong}/year.
      - Home Energy: ${breakdown.energy} kg CO2/year
        Details: ${inputs.energy.electricityKwh} kWh/month electricity with ${inputs.energy.greenEnergyShare}% certified renewable sourcing, gas consumption: ${inputs.energy.gasCubicMeters} m3/month, heating oil: ${inputs.energy.heatingFuelLiters} L/year.
      - Food: ${breakdown.food} kg CO2/year
        Details: diet type is ${inputs.food.dietType}, ${inputs.food.organicShare}% organic food preference, household food waste rate is ${inputs.food.foodWasteShare}%.
      - Shopping/Consumables: ${breakdown.shopping} kg CO2/year
        Details: clothing spending: $${inputs.shopping.clothesMonthly}/month, electronics spending: $${inputs.shopping.electronicsYearly}/year, recycling habits: paper(${inputs.shopping.recyclingPaper}), plastic(${inputs.shopping.recyclingPlastic}), glass(${inputs.shopping.recyclingGlass}), metal(${inputs.shopping.recyclingMetal}).
      - ACTIVE COMMITTED REDUCTION ACTIONS:
        ${activeActions && activeActions.length > 0
          ? activeActions.map((a: any) => `- ${a.title} (Saves ${a.co2SavingKg} kg CO2/year)`).join("\n")
          : "None committed yet. They are looking for inspiration."
        }
      - TOTAL EMISSIONS: ${breakdown.total} kg CO2/year
      `;

      const systemInstruction = `
      You are an elite, warm, and highly supportive Climate scientist and personal Environmental Coach.
      Your goal is to inspect the user's detailed carbon footprint breakdown and inputs, analyze where they are excelling and where the biggest leverage opportunities lie, and deliver highly personalized, action-oriented, and scientifically accurate insights.
      
      Always speak directly but warmly, using positive, scientific, and encouraging framing. Keep insights realistic and highly specific.
      Avoid lecturing or guilt-tripping; focus on high-impact systemic/habit changes that yield maximum carbon reduction.
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this carbon footprint profile and provide tailored insights:\n\n${userProfileString}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "An elegant 2-3 sentence overview of where their current footprint stands, highlighting positive aspects and showing how close they are to sustainable horizons.",
              },
              highestCategoryAnalysis: {
                type: Type.STRING,
                description: "Deep-dive analysis of their largest emission category. Explain specifically what decisions in their profile drives it (e.g. heating choices, driving distances, long-haul flights) and the carbon cost of those choices.",
              },
              actionPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "A micro-focused, encouraging, action-oriented title." },
                    description: { type: Type.STRING, description: "Highly scientific, practical, step-by-step instruction to implement this habit." },
                    impact: { type: Type.STRING, description: "Explanation of why this action has high leverage for their specific configuration (e.g., 'Saves ~400kg CO2/yr by offsetting gasoline with high-efficiency hydro transit')." },
                  },
                  required: ["title", "description", "impact"],
                },
                description: "Exactly three highly precise, personalized action plans targeting their highest emission categories or untapped opportunities.",
              },
              encouragement: {
                type: Type.STRING,
                description: "An inspiring closing message of hope and collective action, explaining the compound impact of sustainable household choices.",
              }
            },
            required: ["summary", "highestCategoryAnalysis", "actionPlan", "encouragement"],
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response received from Gemini.");
      }

      // Return parsed dynamic JSON directly
      res.json(JSON.parse(text.trim()));
    } catch (error: any) {
      console.error("Gemini Insight generation failed:", error);
      res.status(500).json({
        error: "Failed to generate dynamic AI Insights.",
        details: error.message
      });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Carbon Aware platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Express startup crashed:", err);
});
