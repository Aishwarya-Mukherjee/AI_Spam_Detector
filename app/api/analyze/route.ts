import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

// Initialize the Google Gen AI SDK
// It will automatically use process.env.GEMINI_API_KEY if not passed explicitly,
// but we pass it here explicitly for clarity in the hackathon codebase.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string })

interface AnalysisResult {
  risk_level: "High" | "Medium" | "Low"
  confidence: number
  scam_type: string
  red_flags: string[]
  keywords: string[]
  advice: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, inputType } = body as { content: string; inputType: "text" | "url" }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in .env.local. Please add your API key to enable AI analysis." },
        { status: 500 }
      )
    }

    const prompt = `You are a top-tier cybersecurity Threat Intelligence Analyst.
Analyze the following ${inputType === "url" ? "URL" : "text context"} for potential scams, phishing, or fraud.
Return your detailed analysis STRICTLY as a JSON object matching this TypeScript interface exactly:
interface AnalysisResult {
  risk_level: "High" | "Medium" | "Low";
  confidence: number;
  scam_type: string;
  red_flags: string[];
  keywords: string[];
  advice: string;
}

Output ONLY the raw JSON object. Do not wrap in markdown code blocks.

Input to analyze:
"""
${content}
"""`

    // Use gemini-2.5-flash for fast and accurate processing
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    let resultText = '';
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts && content.parts.length > 0) {
        const part = content.parts[0];
        if ('text' in part) {
          resultText = (part as any).text;
        }
      }
    }

    if (!resultText) {
      throw new Error("No text returned from Gemini");
    }

    // Extract JSON if it's wrapped in markdown code blocks
    let jsonText = resultText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const result: AnalysisResult = JSON.parse(jsonText);

    return NextResponse.json(result)
  } catch (error) {
    console.error("[FraudX] Gemini API Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze content via AI. Check server logs." },
      { status: 500 }
    )
  }
}
