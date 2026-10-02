import type { Request, Response } from 'express';
import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  ThinkingLevel,
} from '@google/genai';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Valid text input is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.json({ source: 'client_fallback', message: 'No GEMINI_API_KEY set on Vercel' });
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

    const systemInstruction = `You are the core logic engine of "ScholarSync," an intelligent desktop assistant that helps researchers ingest, summarize, synthesize, and cite academic literature. Your visual theme is Modern Academic: White (#FFFFFF) backgrounds, deep navy text (#0F172A), and cobalt blue accents (#2563EB).

Your responsibilities:
1. Parse uploaded paper text or abstracts to extract objectives, methods, and results.
2. Cross-reference multiple papers to identify research gaps and thematic overlaps.
3. Generate clean, formatted citation strings (IEEE/APA) and structured Markdown review summaries.

You MUST respond strictly with a valid JSON object adhering to this schema:
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
    "ieee": "Complete formatted IEEE citation string",
    "apa": "Complete formatted APA 7th edition citation string",
    "mla": "Complete formatted MLA 9th citation string",
    "chicago": "Complete formatted Chicago 17th citation string",
    "bibtex": "@article{...}"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      config: {
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
        tools: [{ googleSearch: {} }],
        systemInstruction: [{ text: systemInstruction }],
        responseMimeType: 'application/json',
      },
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
    const cleaned = responseText.replace(/^```json/g, '').replace(/```$/g, '').trim();
    const parsed = JSON.parse(cleaned);
    res.status(200).json({ source: 'gemini', data: parsed });
  } catch (error: any) {
    console.error('Vercel API synthesis error:', error);
    res.status(200).json({ source: 'client_fallback', error: error?.message });
  }
}
