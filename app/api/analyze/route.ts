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

    const prompt = `
You are a top-tier cybersecurity Threat Intelligence Analyst.
Analyze the following ${inputType === "url" ? "URL" : "text context"} for potential scams, phishing, or fraud.
Return your detailed analysis STRICTLY as a JSON object matching this TypeScript interface exactly:
interface AnalysisResult {
  risk_level: "High" | "Medium" | "Low";
  confidence: number; // 0 to 100 integer
  scam_type: string; // concise name of threat type (e.g., "Advance Fee Scam", "Legitimate Offer", "Phishing")
  red_flags: string[]; // array of specific suspicious elements found, explain why they are suspicious
  keywords: string[]; // array of exactly matching suspicious keywords or patterns from the text
  advice: string; // clear, actionable advice for the user based strictly on the findings
}

Output ONLY the raw JSON object. Do not wrap in markdown code blocks.

Input to analyze:
"""
${content}
"""
`

    // Use gemini-2.5-flash for fast and accurate processing
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            temperature: 0.1 // Keep it deterministic for threat analysis
        }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No text returned from Gemini");
    }

    const result: AnalysisResult = JSON.parse(resultText);

    return NextResponse.json(result)
  } catch (error) {
    console.error("[FraudX] Gemini API Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze content via AI. Check server logs." },
      { status: 500 }
    )
  }
}
