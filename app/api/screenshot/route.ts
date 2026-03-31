import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

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
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in .env.local. Please add your API key to enable AI screenshot analysis." },
        { status: 500 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString("base64")

    const prompt = `
You are a top-tier cybersecurity Threat Intelligence Analyst.
Analyze the provided image (which may be a screenshot of a job offer, WhatsApp message, email, or a website).
Look deeply for visual and textual scam indicators such as:
1. Phishing links or mismatched domains.
2. Advance Fee fraud (requests for upfront payment, processing fees).
3. Urgency tactics ("act now", "expires in 24 hours").
4. Unrealistic promises (guaranteed job without interview, 100% placement).
5. Unprofessional communication channels (WhatsApp for official hiring, Gmail addresses for corporate roles).
6. Suspicious UI elements that mimic real brands but look off.

Return your detailed analysis STRICTLY as a raw JSON object matching this TypeScript interface exactly:
interface AnalysisResult {
  risk_level: "High" | "Medium" | "Low";
  confidence: number; // 0 to 100 integer
  scam_type: string; // concise name of threat type (e.g., "Advance Fee Scam", "Legitimate Offer", "Phishing")
  red_flags: string[]; // array of specific suspicious elements found, explain why they are suspicious
  keywords: string[]; // array of exactly matching suspicious keywords or patterns from the text
  advice: string; // clear, actionable advice for the user based strictly on the findings
}

Output ONLY the raw JSON object. Do not wrap in markdown code blocks.
`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type
              }
            },
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
    })

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
      throw new Error("No output text from Gemini model.")
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

    const result: AnalysisResult = JSON.parse(jsonText)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[FraudX] Screenshot AI API Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze screenshot via AI. Check server logs." },
      { status: 500 }
    )
  }
}
