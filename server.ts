import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  ThinkingLevel,
} from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // ScholarSync Agent API endpoint
  app.post('/api/synthesize', async (req: Request, res: Response) => {
    try {
      const { text, mode } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Valid text input is required.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return null so the client-side academic parser handles synthesis smoothly
        res.json({ source: 'client_fallback', message: 'No GEMINI_API_KEY set on server' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const tools = [
        {
          googleSearch: {},
        },
      ];

      const systemInstruction = `You are the core logic engine of "ScholarSync," an intelligent desktop assistant that helps researchers ingest, summarize, synthesize, and cite academic literature. Your visual theme is Modern Academic: White (#FFFFFF) backgrounds, deep navy text (#0F172A), and cobalt blue accents (#2563EB).

Your responsibilities:
1. Parse uploaded paper text or abstracts to extract objectives, methods, and results.
2. Cross-reference multiple papers to identify research gaps and thematic overlaps.
3. Generate clean, formatted citation strings (IEEE/APA) and structured Markdown review summaries.

You MUST respond strictly with a valid JSON object (no markdown code blocks, just raw JSON) adhering to this schema:
{
  "title": "Clear paper title or derived topic",
  "field": "Specific academic field and subdiscipline",
  "authors": "Authors or estimated research group",
  "year": 2024,
  "doi": "10.xxxx/...",
  "summary": {
    "executive": "Exactly 2 clear, concise sentences summarizing the paper's core achievement and significance.",
    "coreHypothesis": "The primary underlying hypothesis or thesis statement.",
    "keyTakeaways": ["Key empirical finding 1", "Key empirical finding 2", "Key empirical finding 3"],
    "domainTags": ["Tag1", "Tag2", "Tag3"]
  },
  "methodology": {
    "objectives": "Explicit research objectives and targets",
    "methods": "Experimental design, apparatus, models, or theoretical proofs used",
    "results": "Quantitative results, benchmarks, metrics, or observed effect sizes",
    "limitations": ["Identified constraint 1", "Identified constraint 2"]
  },
  "researchGaps": [
    {
      "gap": "Specific unaddressed question or methodological gap",
      "opportunity": "Actionable future research direction"
    },
    {
      "gap": "Second identified gap or scalability limitation",
      "opportunity": "Secondary opportunity for investigation"
    }
  ],
  "thematicOverlaps": ["Thematic convergence with foundational literature 1", "Interdisciplinary bridge 2"],
  "claims": [
    {
      "claim": "Primary empirical claim",
      "evidence": "Observed data or benchmark proving the claim",
      "confidence": "High"
    },
    {
      "claim": "Secondary claim",
      "evidence": "Supporting quantitative proof or theoretical deduction",
      "confidence": "Moderate"
    }
  ],
  "citations": {
    "ieee": "Complete formatted IEEE citation string, e.g. [1] A. Author et al., ...",
    "apa": "Complete formatted APA 7th edition citation string",
    "mla": "Complete formatted MLA 9th citation string",
    "chicago": "Complete formatted Chicago 17th citation string",
    "bibtex": "@article{...}"
  }
}`;

      const config: any = {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
        tools,
        systemInstruction: [{ text: systemInstruction }],
        responseMimeType: 'application/json',
      };

      // Model priority: Attempt gemini-3.8-flash (or gemma if configured)
      const model = 'gemini-3.8-flash';

      const response = await ai.models.generateContent({
        model,
        config,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze and synthesize this academic research literature input:\n\n${text}`,
              },
            ],
          },
        ],
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        res.json({ source: 'gemini', data: parsed });
      } catch (err) {
        // Fallback cleanup if response has markdown backticks
        const cleaned = responseText.replace(/^```json/g, '').replace(/```$/g, '').trim();
        const parsed = JSON.parse(cleaned);
        res.json({ source: 'gemini', data: parsed });
      }
    } catch (error: any) {
      console.error('Server synthesis error:', error);
      res.json({ source: 'client_fallback', error: error?.message || 'Error occurred' });
    }
  });

  // Serve static assets in production or Vite in dev
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarSync server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
