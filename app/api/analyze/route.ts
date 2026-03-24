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
      // Payment/Fee related - CRITICAL RED FLAGS (legitimate employers NEVER ask for money)
      // These patterns specifically detect when YOU are asked to PAY money
      { regex: /upfront (payment|fee|deposit)/i, keyword: "upfront payment", weight: 30 },
      { regex: /send (money|payment|fee)/i, keyword: "send money", weight: 30 },
      { regex: /pay\s*(a|the|an)?\s*(fee|charge|amount|deposit|sum)/i, keyword: "payment required", weight: 30 },
      { regex: /(fee|charge|deposit)\s*(of|is|:)?\s*(₹|rs\.?|inr|rupee|\$)/i, keyword: "fee with amount", weight: 35 },
      { regex: /(onboarding|activation|joining|enrollment|registration|processing|training|security|refundable)\s*(fee|charge|cost|deposit|payment)/i, keyword: "hidden fees", weight: 35 },
      { regex: /pay.{0,10}(₹|rs\.?|\$)\s*[\d,]+/i, keyword: "payment demand", weight: 35 },
      { regex: /(₹|rs\.?|\$)\s*[\d,]+.{0,20}(fee|charge|deposit|payment|to (pay|secure|confirm|activate))/i, keyword: "explicit fee", weight: 35 },
      { regex: /without\s*payment.{0,30}(cancel|expire|invalid|void|reject)/i, keyword: "payment threat", weight: 35 },
      { regex: /(wire transfer|western union|bitcoin|crypto)/i, keyword: "suspicious payment method", weight: 25 },
      { regex: /to\s*secure\s*(your)?\s*(spot|seat|position|place).{0,20}pay/i, keyword: "pay to secure", weight: 35 },
      
      // Urgency tactics - used to prevent victims from thinking  
      { regex: /(immediate|instant)\s*(confirmation|action|response|payment)\s*needed/i, keyword: "pressure tactics", weight: 20 },
      { regex: /(will be|automatically)\s*(cancel|expire|void|reject|invalid)/i, keyword: "cancellation threat", weight: 20 },
      
      // Too good to be true
      { regex: /\$\d{3,}\/?(week|day|hour)/i, keyword: "unrealistic pay", weight: 20 },
      { regex: /(guaranteed|100%|assured).{0,20}(job|offer|placement)/i, keyword: "guaranteed job", weight: 20 },
      { regex: /(no interview|skip interview|direct (hire|joining))\s*(required|needed)?/i, keyword: "no interview required", weight: 25 },
      
      // Sensitive information requests
      { regex: /(ssn|social security|bank account|routing number)/i, keyword: "sensitive info request", weight: 20 },
      
      // Contact methods combined with payment
      { regex: /(whatsapp|telegram).{0,30}(pay|fee|charge|deposit|₹|rs\.?|\$)/i, keyword: "payment via chat", weight: 25 },
    ],
    scamTypes: ["Advance Fee Scam", "Job Scam", "Internship Scam", "Phishing Attempt", "Fake Offer Letter Scam", "Employment Fraud"],
  },
  medium: {
    patterns: [
      { regex: /(interview via (chat|text|whatsapp|telegram))/i, keyword: "informal interview", weight: 10 },
      { regex: /(limited positions|few spots|only \d+ seats)/i, keyword: "artificial scarcity", weight: 10 },
      { regex: /(certificate|certification).{0,20}(guaranteed|assured)/i, keyword: "certificate promise", weight: 8 },
      { regex: /@(gmail|yahoo|hotmail)\.com/i, keyword: "personal email", weight: 5 },
    ],
    scamTypes: ["Potential Phishing", "Suspicious Offer", "Unverified Opportunity"],
  },
}

// Positive indicators that REDUCE suspicion (legitimate offer signs)
const legitimateIndicators = [
  { regex: /no\s*(payment|fee|charge).{0,20}(required|needed|at any stage)/i, weight: -30 },
  { regex: /stipend\s*:\s*(₹|rs\.?)\s*[\d,]+\s*\/?\s*(month|per month)/i, weight: -15 },
  { regex: /salary\s*:\s*(₹|rs\.?)\s*[\d,]+/i, weight: -15 },
  { regex: /(working hours|work hours|office hours)/i, weight: -5 },
  { regex: /(interview|selection)\s*(round|process|scheduled)/i, weight: -10 },
  { regex: /please\s*(confirm|reply).{0,30}(before|by)\s*\d/i, weight: -5 },
  { regex: /(pvt\.?\s*ltd|private limited|llp|inc\.|corporation)/i, weight: -5 },
  { regex: /your\s*responsibilities/i, weight: -5 },
]

// Red flag message templates
const redFlagTemplates: Record<string, string> = {
  // Payment related - CRITICAL (only when YOU are asked to pay)
  "upfront payment": "CRITICAL: Requests upfront payment - legitimate employers NEVER ask for money",
  "send money": "CRITICAL: Asks you to send money - this is a major scam indicator",
  "payment required": "CRITICAL: Demands payment to proceed - legitimate jobs don't require payment",
  "fee with amount": "CRITICAL: Specifies a fee amount - never pay for job opportunities",
  "hidden fees": "CRITICAL: Mentions fees (onboarding/registration/training) - these are scam tactics",
  "payment demand": "CRITICAL: Demands payment of a specific amount - 100% scam indicator",
  "explicit fee": "CRITICAL: Explicitly mentions fee/charge amount - this is fraud",
  "payment threat": "CRITICAL: Threatens cancellation without payment - classic extortion tactic",
  "suspicious payment method": "Mentions suspicious payment methods (crypto, wire transfer)",
  "pay to secure": "CRITICAL: Asks payment to secure position - legitimate jobs never do this",
  "payment via chat": "CRITICAL: Requests payment via WhatsApp/Telegram - major scam indicator",
  
  // Urgency related
  "pressure tactics": "Creates pressure with 'immediate confirmation' demands",
  "cancellation threat": "Threatens automatic cancellation to force quick action",
  
  // Too good to be true
  "unrealistic pay": "Offers unrealistic salary that is too good to be true",
  "guaranteed job": "Promises guaranteed job/placement - no legitimate company can guarantee this",
  "no interview required": "Claims no interview needed - legitimate jobs always interview candidates",
  
  // Other red flags
  "sensitive info request": "Requests sensitive personal information (SSN, bank details) early",
  "informal interview": "Conducts interviews through informal channels (WhatsApp, text)",
  "artificial scarcity": "Creates artificial scarcity ('limited seats') to pressure applicants",
  "certificate promise": "Promises guaranteed certificate - may be part of training scam",
  "personal email": "Uses personal email (Gmail/Yahoo) - verify company legitimacy",
}

function analyzeContent(content: string, inputType: "text" | "url"): AnalysisResult {
  const detectedKeywords: string[] = []
  const redFlags: string[] = []
  let totalScore = 0

  // FIRST: Check for legitimate indicators (these REDUCE the score)
  for (const indicator of legitimateIndicators) {
    if (indicator.regex.test(content)) {
      totalScore += indicator.weight // weight is negative, so this reduces score
    }
  }

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

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze content" },
      { status: 500 }
    )
  }
}
