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
      { regex: /upfront (payment|fee|deposit)/i, keyword: "upfront payment", weight: 30 },
      { regex: /send (money|payment|fee)/i, keyword: "send money", weight: 30 },
      { regex: /pay.{0,20}(fee|charge|amount|deposit)/i, keyword: "payment required", weight: 30 },
      { regex: /(fee|charge|payment|deposit).{0,20}(₹|rs\.?|inr|rupee|\$|usd)/i, keyword: "money demand", weight: 30 },
      { regex: /(₹|rs\.?|inr)\s*[\d,]+/i, keyword: "rupee amount", weight: 25 },
      { regex: /(onboarding|activation|joining|enrollment|registration|processing|training|security)\s*(fee|charge|cost|deposit|payment)/i, keyword: "hidden fees", weight: 30 },
      { regex: /(fee|charge|cost|deposit|payment)\s*of\s*(₹|rs\.?|\$|inr)/i, keyword: "explicit fee demand", weight: 30 },
      { regex: /without\s*payment.{0,30}(cancel|expire|invalid|void|reject)/i, keyword: "payment threat", weight: 30 },
      { regex: /(wire transfer|western union|bitcoin|crypto|upi|paytm|phonepe|gpay)/i, keyword: "suspicious payment method", weight: 25 },
      
      // Urgency tactics - used to prevent victims from thinking
      { regex: /(act now|limited time|urgent|immediately|asap|right away|within \d+ (hour|day))/i, keyword: "urgency tactics", weight: 20 },
      { regex: /(immediate|instant)\s*(confirmation|action|response|payment)/i, keyword: "pressure tactics", weight: 20 },
      { regex: /(will be|automatically)\s*(cancel|expire|void|reject|invalid)/i, keyword: "cancellation threat", weight: 20 },
      { regex: /(last chance|final notice|expire|deadline)/i, keyword: "artificial deadline", weight: 15 },
      
      // Too good to be true
      { regex: /\$\d{3,}\/?(week|day|hour)/i, keyword: "unrealistic pay", weight: 20 },
      { regex: /(guaranteed|100%|assured|confirm).{0,20}(job|offer|placement|success)/i, keyword: "guaranteed job", weight: 20 },
      { regex: /(no interview|skip interview|direct (hire|joining|offer))/i, keyword: "no interview required", weight: 20 },
      { regex: /(no experience|freshers?|anyone can)/i, keyword: "unrealistic promises", weight: 15 },
      
      // Sensitive information requests
      { regex: /(ssn|social security|bank account|routing number|aadhar|pan card)/i, keyword: "sensitive info request", weight: 20 },
      
      // Offer letters with payment
      { regex: /offer\s*letter.{0,50}(pay|fee|charge|deposit|₹|rs\.?|\$)/i, keyword: "fake offer letter", weight: 30 },
      { regex: /(activate|verify|confirm).{0,30}(pay|fee|charge|deposit)/i, keyword: "activation fee scam", weight: 30 },
      
      // Contact methods
      { regex: /@(gmail|yahoo|hotmail|outlook|rediffmail)\.com/i, keyword: "personal email domain", weight: 10 },
      { regex: /(whatsapp|telegram).{0,20}(\+?\d{10,})/i, keyword: "unofficial contact", weight: 15 },
      
      // Other red flags
      { regex: /(click here|click this link|click below)/i, keyword: "suspicious link", weight: 10 },
      { regex: /(congratulations|you have been selected|you won|shortlisted)/i, keyword: "unsolicited selection", weight: 15 },
      { regex: /(work from home|remote).{0,30}(₹|rs\.?|\$)\s*\d{4,}/i, keyword: "suspicious remote offer", weight: 15 },
    ],
    scamTypes: ["Advance Fee Scam", "Job Scam", "Internship Scam", "Phishing Attempt", "Fake Offer Letter Scam", "Employment Fraud"],
  },
  medium: {
    patterns: [
      { regex: /(vague|flexible|various)/i, keyword: "vague description", weight: 8 },
      { regex: /(interview via (chat|text|whatsapp|telegram))/i, keyword: "informal interview", weight: 10 },
      { regex: /(no experience|entry level).{0,30}(₹|rs\.?|\$)\s*\d{3,}/i, keyword: "suspicious salary", weight: 12 },
      { regex: /(contact us|reach out|message).{0,20}@(gmail|yahoo)/i, keyword: "unprofessional contact", weight: 8 },
      { regex: /(limited positions|few spots|exclusive|only \d+ seats)/i, keyword: "artificial scarcity", weight: 10 },
      { regex: /(stipend|salary).{0,20}(₹|rs\.?)\s*\d{4,}/i, keyword: "stipend mentioned", weight: 5 },
      { regex: /(certificate|certification).{0,20}(guaranteed|assured|free)/i, keyword: "certificate promise", weight: 8 },
    ],
    scamTypes: ["Potential Phishing", "Suspicious Offer", "Unverified Opportunity"],
  },
}

// Red flag message templates
const redFlagTemplates: Record<string, string> = {
  // Payment related - CRITICAL
  "upfront payment": "CRITICAL: Requests upfront payment - legitimate employers NEVER ask for money",
  "send money": "CRITICAL: Asks you to send money - this is a major scam indicator",
  "payment required": "CRITICAL: Demands payment to proceed - legitimate jobs don't require payment",
  "money demand": "CRITICAL: Mentions specific money amount - never pay for job opportunities",
  "rupee amount": "CRITICAL: Specifies rupee payment amount - employment should not cost money",
  "hidden fees": "CRITICAL: Mentions fees (onboarding/registration/training) - these are scam tactics",
  "explicit fee demand": "CRITICAL: Explicitly demands a fee payment - 100% scam indicator",
  "payment threat": "CRITICAL: Threatens cancellation without payment - classic extortion tactic",
  "suspicious payment method": "Mentions informal payment methods (UPI, crypto, wire transfer)",
  "fake offer letter": "CRITICAL: Offer letter mentions payment - legitimate offers never require fees",
  "activation fee scam": "CRITICAL: Asks for activation/verification fee - this is fraud",
  
  // Urgency related
  "urgency tactics": "Uses urgency tactics ('act now', 'immediately') to pressure quick decisions",
  "pressure tactics": "Creates pressure with 'immediate confirmation' demands",
  "cancellation threat": "Threatens automatic cancellation to force quick action",
  "artificial deadline": "Creates artificial deadline to prevent you from verifying",
  
  // Too good to be true
  "unrealistic pay": "Offers unrealistic salary that is too good to be true",
  "guaranteed job": "Promises guaranteed job/placement - no legitimate company can guarantee this",
  "no interview required": "Claims no interview needed - legitimate jobs always interview candidates",
  "unrealistic promises": "Makes unrealistic promises (no experience needed for high pay)",
  "unsolicited selection": "Claims you were 'selected' without applying - classic scam opening",
  
  // Other red flags
  "sensitive info request": "Requests sensitive personal information (SSN, Aadhar, bank details) early",
  "suspicious remote offer": "Suspicious work from home offer with unusually high pay",
  "personal email domain": "Uses personal email (Gmail/Yahoo) instead of corporate email",
  "unofficial contact": "Uses WhatsApp/Telegram for official communication - unprofessional",
  "suspicious link": "Contains suspicious links that could be phishing attempts",
  "vague description": "Contains vague or unclear job responsibilities",
  "informal interview": "Conducts interviews through informal channels (WhatsApp, text)",
  "suspicious salary": "Entry-level position with suspiciously high salary",
  "unprofessional contact": "Uses unprofessional contact methods",
  "artificial scarcity": "Creates artificial scarcity ('limited seats') to pressure applicants",
  "stipend mentioned": "Mentions stipend amount - verify company legitimacy before proceeding",
  "certificate promise": "Promises guaranteed certificate - may be part of training scam",
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

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze content" },
      { status: 500 }
    )
  }
}
