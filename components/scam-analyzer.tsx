"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, Shield, AlertCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalysisResult {
  risk_level: "High" | "Medium" | "Low"
  confidence: number
  scam_type: string
  red_flags: string[]
  advice: string
}

interface ScamAnalyzerProps {
  title: string
  placeholder: string
}

const mockResponses: Record<string, AnalysisResult> = {
  high: {
    risk_level: "High",
    confidence: 92,
    scam_type: "Job Scam",
    red_flags: [
      "Requests upfront payment or registration fee",
      "Uses urgency tactics like 'limited positions available'",
      "No verifiable company information found",
      "Unrealistic salary promises for entry-level work",
      "Requests personal financial information early",
    ],
    advice: "Avoid this opportunity immediately. Legitimate employers never ask for upfront fees. Do not share any personal or financial information.",
  },
  medium: {
    risk_level: "Medium",
    confidence: 67,
    scam_type: "Potential Phishing",
    red_flags: [
      "Generic job description with vague responsibilities",
      "Communication from personal email domain",
      "Limited online presence of company",
    ],
    advice: "Proceed with caution. Research the company thoroughly before engaging further. Verify contact information independently.",
  },
  low: {
    risk_level: "Low",
    confidence: 85,
    scam_type: "Unknown",
    red_flags: [],
    advice: "This opportunity appears legitimate. Standard due diligence is still recommended before accepting any offer.",
  },
}

export function ScamAnalyzer({ title, placeholder }: ScamAnalyzerProps) {
  const [inputMode, setInputMode] = useState<"text" | "url">("text")
  const [inputValue, setInputValue] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isRedFlagsExpanded, setIsRedFlagsExpanded] = useState(true)

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return
    
    setIsAnalyzing(true)
    setResult(null)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    // Determine mock response based on input length for demo
    const inputLength = inputValue.length
    let mockKey: keyof typeof mockResponses = "low"
    if (inputLength > 200) mockKey = "high"
    else if (inputLength > 50) mockKey = "medium"
    
    setResult(mockResponses[mockKey])
    setIsAnalyzing(false)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-red-400"
      case "Medium":
        return "text-amber-400"
      case "Low":
        return "text-emerald-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getRiskBg = (level: string) => {
    switch (level) {
      case "High":
        return "bg-red-500/10 border-red-500/30"
      case "Medium":
        return "bg-amber-500/10 border-amber-500/30"
      case "Low":
        return "bg-emerald-500/10 border-emerald-500/30"
      default:
        return "bg-muted"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High":
        return <AlertTriangle className="h-8 w-8 text-red-400" />
      case "Medium":
        return <AlertCircle className="h-8 w-8 text-amber-400" />
      case "Low":
        return <CheckCircle className="h-8 w-8 text-emerald-400" />
      default:
        return <Shield className="h-8 w-8" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
        
        {/* Input Mode Toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setInputMode("text")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all",
              inputMode === "text"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            Paste Text
          </button>
          <button
            onClick={() => setInputMode("url")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all",
              inputMode === "url"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            Enter URL
          </button>
        </div>

        {/* Input Area */}
        {inputMode === "text" ? (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="h-40 w-full resize-none rounded-lg border border-border bg-input p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ) : (
          <input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter job posting URL..."
            className="w-full rounded-lg border border-border bg-input p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )}

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !inputValue.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              Analyze
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Verdict Card */}
          <div className={cn("rounded-xl border p-6", getRiskBg(result.risk_level))}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {getRiskIcon(result.risk_level)}
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className={cn("text-3xl font-bold", getRiskColor(result.risk_level))}>
                    {result.risk_level} Risk
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold text-foreground">{result.confidence}%</p>
              </div>
            </div>

            {/* Scam Type */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Detected Type:</span>
              <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                {result.scam_type}
              </span>
            </div>
          </div>

          {/* Red Flags Section */}
          {result.red_flags.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-card">
              <button
                onClick={() => setIsRedFlagsExpanded(!isRedFlagsExpanded)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span className="font-semibold text-foreground">
                    Red Flags Detected ({result.red_flags.length})
                  </span>
                </div>
                {isRedFlagsExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  isRedFlagsExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <ul className="space-y-2 border-t border-border px-4 pb-4 pt-3">
                  {result.red_flags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                      <span className="text-sm text-foreground">{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Advice Section */}
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Recommendation</p>
                <p className="mt-1 text-sm text-muted-foreground">{result.advice}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
