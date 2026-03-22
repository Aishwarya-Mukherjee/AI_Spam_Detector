import { NextRequest, NextResponse } from "next/server"

interface AnalysisResult {
  risk_level: "High" | "Medium" | "Low"
  confidence: number
  scam_type: string
  red_flags: string[]
  keywords: string[]
  advice: string
}

// Scam indicator patterns with weights
const scamIndicators = {
  high: {
    patterns: [
      { regex: /upfront (payment|fee|deposit)/i, keyword: "upfront payment", weight: 25 },
      { regex: /send (money|payment|fee)/i, keyword: "send money", weight: 25 },
      { regex: /\$\d{3,}\/?(week|day|hour)/i, keyword: "unrealistic pay", weight: 20 },
      { regex: /(wire transfer|western union|bitcoin|crypto)/i, keyword: "suspicious payment method", weight: 25 },
      { regex: /(ssn|social security|bank account|routing number)/i, keyword: "sensitive info request", weight: 20 },
      { regex: /(act now|limited time|urgent|immediately|asap)/i, keyword: "urgency tactics", weight: 15 },
      { regex: /(guaranteed|100% success|no experience needed)/i, keyword: "unrealistic promises", weight: 15 },
      { regex: /(work from home|remote).*\$\d{4,}/i, keyword: "suspicious remote offer", weight: 15 },
      { regex: /@(gmail|yahoo|hotmail|outlook)\.com/i, keyword: "personal email domain", weight: 10 },
      { regex: /(registration fee|processing fee|training fee)/i, keyword: "hidden fees", weight: 20 },
      { regex: /(click here|click this link)/i, keyword: "suspicious link", weight: 10 },
      { regex: /(congratulations|you have been selected|you won)/i, keyword: "too good to be true", weight: 15 },
    ],
    scamTypes: ["Advance Fee Scam", "Job Scam", "Internship Scam", "Phishing Attempt", "Identity Theft Attempt"],
  },
  medium: {
    patterns: [
      { regex: /(vague|flexible|various)/i, keyword: "vague description", weight: 8 },
      { regex: /(interview via (chat|text|whatsapp))/i, keyword: "informal interview", weight: 10 },
      { regex: /(no experience|entry level).*\$\d{3,}/i, keyword: "suspicious salary", weight: 12 },
      { regex: /(contact us|reach out).*@(gmail|yahoo)/i, keyword: "unprofessional contact", weight: 8 },
      { regex: /(limited positions|few spots|exclusive)/i, keyword: "artificial scarcity", weight: 8 },
    ],
    scamTypes: ["Potential Phishing", "Suspicious Offer", "Unverified Opportunity"],
  },
}

// Red flag message templates
const redFlagTemplates: Record<string, string> = {
  "upfront payment": "Requests upfront payment or registration fee before employment",
  "send money": "Asks you to send money or make payments to proceed",
  "unrealistic pay": "Offers unrealistic salary that is too good to be true",
  "suspicious payment method": "Mentions suspicious payment methods (wire transfer, crypto, etc.)",
  "sensitive info request": "Requests sensitive personal information (SSN, bank details) early in the process",
  "urgency tactics": "Uses urgency tactics to pressure quick decisions",
  "unrealistic promises": "Makes unrealistic promises (guaranteed success, no experience needed)",
  "suspicious remote offer": "Suspicious remote work offer with unusually high pay",
  "personal email domain": "Uses personal email domain instead of corporate email",
  "hidden fees": "Mentions hidden fees (registration, processing, training fees)",
  "suspicious link": "Contains suspicious links that could be phishing attempts",
  "too good to be true": "Uses language that suggests it's too good to be true",
  "vague description": "Contains vague or unclear job responsibilities",
  "informal interview": "Conducts interviews through informal channels (WhatsApp, text)",
  "suspicious salary": "Entry-level position with suspiciously high salary",
  "unprofessional contact": "Uses unprofessional contact methods",
  "artificial scarcity": "Creates artificial scarcity to pressure applicants",
}

function analyzeContent(content: string, inputType: "text" | "url"): AnalysisResult {
  const detectedKeywords: string[] = []
  const redFlags: string[] = []
  let totalScore = 0

  // Check high-risk patterns
  for (const indicator of scamIndicators.high.patterns) {
    if (indicator.regex.test(content)) {
      totalScore += indicator.weight
      if (!detectedKeywords.includes(indicator.keyword)) {
        detectedKeywords.push(indicator.keyword)
        if (redFlagTemplates[indicator.keyword]) {
          redFlags.push(redFlagTemplates[indicator.keyword])
        }
      }
    }
  }

  // Check medium-risk patterns
  for (const indicator of scamIndicators.medium.patterns) {
    if (indicator.regex.test(content)) {
      totalScore += indicator.weight
      if (!detectedKeywords.includes(indicator.keyword)) {
        detectedKeywords.push(indicator.keyword)
        if (redFlagTemplates[indicator.keyword]) {
          redFlags.push(redFlagTemplates[indicator.keyword])
        }
      }
    }
  }

  // URL-specific checks
  if (inputType === "url") {
    if (!/^https:\/\//.test(content)) {
      totalScore += 10
      redFlags.push("URL does not use secure HTTPS protocol")
      detectedKeywords.push("insecure URL")
    }
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(content)) {
      totalScore += 15
      redFlags.push("URL uses IP address instead of domain name")
      detectedKeywords.push("IP-based URL")
    }
  }

  // Determine risk level based on score
  let risk_level: "High" | "Medium" | "Low"
  let confidence: number
  let scam_type: string
  let advice: string

  if (totalScore >= 50) {
    risk_level = "High"
    confidence = Math.min(95, 70 + Math.floor(totalScore / 3))
    scam_type = scamIndicators.high.scamTypes[Math.floor(Math.random() * scamIndicators.high.scamTypes.length)]
    advice = "Do not proceed with this opportunity. This shows multiple signs of a scam. Never share personal or financial information. Block the sender and report this to the platform where you found it."
  } else if (totalScore >= 20) {
    risk_level = "Medium"
    confidence = Math.min(85, 50 + totalScore)
    scam_type = scamIndicators.medium.scamTypes[Math.floor(Math.random() * scamIndicators.medium.scamTypes.length)]
    advice = "Proceed with caution. Research the company thoroughly using official channels like LinkedIn and company websites. Verify contact information independently before sharing any personal data."
  } else {
    risk_level = "Low"
    confidence = Math.max(60, 85 - totalScore * 2)
    scam_type = "Legitimate Opportunity"
    advice = "This content appears legitimate based on our analysis. Standard due diligence is still recommended - verify the company website, check employee reviews, and never share sensitive information until you've confirmed the offer through official channels."
  }

  return {
    risk_level,
    confidence,
    scam_type,
    red_flags: redFlags,
    keywords: detectedKeywords,
    advice,
  }
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

    // Simulate processing time for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const result = analyzeContent(content.trim(), inputType || "text")

    console.log("[v0] API Analysis Result:", JSON.stringify(result, null, 2))

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze content" },
      { status: 500 }
    )
  }
}
