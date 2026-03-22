"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, Shield, AlertCircle, ChevronDown, ChevronUp, Loader2, ShieldAlert, ShieldCheck, Link2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface AnalysisResult {
  risk_level: "High" | "Medium" | "Low"
  confidence: number
  scam_type: string
  red_flags: string[]
  keywords: string[]
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
    scam_type: "Internship Scam",
    red_flags: [
      "Requests upfront payment or registration fee of $500",
      "Uses urgency tactics like 'limited positions available - apply NOW'",
      "No verifiable company information found online",
      "Unrealistic salary promises: $5000/week for entry-level work",
      "Requests personal financial information (bank details, SSN) early",
      "Generic Gmail address instead of corporate email",
    ],
    keywords: ["payment", "urgency", "limited positions", "$5000/week", "bank details", "SSN", "Gmail"],
    advice: "Do not proceed with this opportunity. Legitimate employers never ask for upfront fees or sensitive financial information during initial contact. Block the sender and report this posting to the platform.",
  },
  medium: {
    risk_level: "Medium",
    confidence: 67,
    scam_type: "Potential Phishing",
    red_flags: [
      "Generic job description with vague responsibilities",
      "Communication from personal email domain (@gmail.com)",
      "Limited online presence of company",
    ],
    keywords: ["vague", "gmail.com", "limited presence"],
    advice: "Proceed with caution. Research the company thoroughly using LinkedIn and official channels. Verify contact information independently before sharing any personal data.",
  },
  low: {
    risk_level: "Low",
    confidence: 85,
    scam_type: "Legitimate Opportunity",
    red_flags: [],
    keywords: [],
    advice: "This opportunity appears legitimate based on our analysis. Standard due diligence is still recommended - verify the company website, check employee reviews, and never share sensitive information until you've confirmed the offer.",
  },
}

// Function to highlight keywords in red flags
function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  if (!keywords.length) return text
  
  const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, i) => {
    const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase())
    return isKeyword ? (
      <span key={i} className="rounded bg-red-500/30 px-1 font-semibold text-red-300">
        {part}
      </span>
    ) : (
      part
    )
  })
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
    await new Promise((resolve) => setTimeout(resolve, 2500))
    
    // Determine mock response based on input length for demo
    const inputLength = inputValue.length
    let mockKey: keyof typeof mockResponses = "low"
    if (inputLength > 200) mockKey = "high"
    else if (inputLength > 50) mockKey = "medium"
    
    setResult(mockResponses[mockKey])
    setIsAnalyzing(false)
  }

  const getRiskStyles = (level: string) => {
    switch (level) {
      case "High":
        return {
          badge: "bg-red-500 text-white shadow-lg shadow-red-500/30",
          border: "border-red-500/50",
          bg: "bg-gradient-to-br from-red-950/50 via-red-900/20 to-transparent",
          text: "text-red-400",
          glow: "shadow-[0_0_60px_-15px_rgba(239,68,68,0.5)]",
        }
      case "Medium":
        return {
          badge: "bg-amber-500 text-black shadow-lg shadow-amber-500/30",
          border: "border-amber-500/50",
          bg: "bg-gradient-to-br from-amber-950/50 via-amber-900/20 to-transparent",
          text: "text-amber-400",
          glow: "shadow-[0_0_60px_-15px_rgba(245,158,11,0.5)]",
        }
      case "Low":
        return {
          badge: "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30",
          border: "border-emerald-500/50",
          bg: "bg-gradient-to-br from-emerald-950/50 via-emerald-900/20 to-transparent",
          text: "text-emerald-400",
          glow: "shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)]",
        }
      default:
        return {
          badge: "bg-muted",
          border: "border-border",
          bg: "bg-card",
          text: "text-muted-foreground",
          glow: "",
        }
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High":
        return <ShieldAlert className="h-12 w-12 text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
      case "Medium":
        return <AlertTriangle className="h-12 w-12 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
      case "Low":
        return <ShieldCheck className="h-12 w-12 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
      default:
        return <Shield className="h-12 w-12" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-emerald-500"
    if (confidence >= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-card/50 p-6 shadow-xl">
        {/* Decorative grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="relative">
          <h2 className="mb-1 text-xl font-bold text-foreground">{title}</h2>
          <p className="mb-5 text-sm text-muted-foreground">AI-powered detection to keep you safe from scams</p>
          
          {/* Input Mode Toggle */}
          <div className="mb-4 inline-flex rounded-lg bg-secondary/50 p-1">
            <button
              onClick={() => setInputMode("text")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                inputMode === "text"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              Paste Text
            </button>
            <button
              onClick={() => setInputMode("url")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                inputMode === "url"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link2 className="h-4 w-4" />
              Enter URL
            </button>
          </div>

          {/* Input Area */}
          {inputMode === "text" ? (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste job description, internship offer, or suspicious message here..."
              className="h-44 w-full resize-none rounded-xl border border-border bg-background/50 p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          ) : (
            <input
              type="url"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://example.com/job-posting..."
              className="w-full rounded-xl border border-border bg-background/50 p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputValue.trim()}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Analyzing Content...</span>
              </>
            ) : (
              <>
                <Shield className="h-6 w-6" />
                <span>Analyze for Scams</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="animate-in fade-in duration-300">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative rounded-full bg-primary/10 p-6">
                <Shield className="h-12 w-12 text-primary animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-lg font-medium text-foreground">Scanning for threats...</p>
            <p className="mt-2 text-sm text-muted-foreground">Analyzing patterns, verifying sources, checking red flags</p>
            <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isAnalyzing && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-4">
          {/* Main Verdict Card */}
          <div className={cn(
            "relative overflow-hidden rounded-2xl border-2 p-8 transition-all",
            getRiskStyles(result.risk_level).border,
            getRiskStyles(result.risk_level).bg,
            getRiskStyles(result.risk_level).glow
          )}>
            {/* Background decoration */}
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />
            
            <div className="relative">
              {/* Risk Level Badge - Large and prominent */}
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6">
                <div className="flex flex-col items-center gap-3">
                  {getRiskIcon(result.risk_level)}
                  <span className={cn(
                    "rounded-full px-5 py-2 text-lg font-bold uppercase tracking-wider",
                    getRiskStyles(result.risk_level).badge
                  )}>
                    {result.risk_level} Risk
                  </span>
                </div>
                
                <div className="flex-1 space-y-4">
                  {/* Scam Type Tag */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm text-muted-foreground">Detected:</span>
                    <span className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm font-semibold",
                      getRiskStyles(result.risk_level).border,
                      getRiskStyles(result.risk_level).text
                    )}>
                      {result.scam_type}
                    </span>
                  </div>
                  
                  {/* Confidence Score with Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Analysis Confidence</span>
                      <span className="text-2xl font-bold text-foreground">{result.confidence}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-secondary/50">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out",
                          getConfidenceColor(result.confidence)
                        )}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Red Flags Section - Collapsible */}
          {result.red_flags.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/30 to-transparent">
              <button
                onClick={() => setIsRedFlagsExpanded(!isRedFlagsExpanded)}
                className="flex w-full items-center justify-between p-5 text-left hover:bg-red-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-500/20 p-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground">
                      Red Flags Detected
                    </span>
                    <span className="ml-2 rounded-full bg-red-500/20 px-2.5 py-0.5 text-sm font-semibold text-red-400">
                      {result.red_flags.length}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  "rounded-lg bg-secondary/50 p-1.5 transition-transform duration-300",
                  isRedFlagsExpanded && "rotate-180"
                )}>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </button>
              
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isRedFlagsExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <ul className="space-y-3 border-t border-red-500/20 px-5 pb-5 pt-4">
                    {result.red_flags.map((flag, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 rounded-lg bg-red-500/5 p-3 border border-red-500/10"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                        <span className="text-sm text-foreground leading-relaxed">
                          {highlightKeywords(flag, result.keywords)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Advice Section */}
          <div className={cn(
            "rounded-2xl border-2 p-6",
            result.risk_level === "Low" 
              ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-transparent" 
              : "border-primary/30 bg-gradient-to-br from-primary/10 to-transparent"
          )}>
            <div className="flex items-start gap-4">
              <div className={cn(
                "rounded-xl p-3",
                result.risk_level === "Low" ? "bg-emerald-500/20" : "bg-primary/20"
              )}>
                {result.risk_level === "Low" ? (
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                ) : (
                  <Shield className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-foreground">Recommended Action</p>
                <p className="mt-2 text-muted-foreground leading-relaxed">{result.advice}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
