"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, Shield, AlertCircle, ChevronDown, Loader2, ShieldAlert, ShieldCheck, Link2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

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

function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  if (!keywords.length) return text
  const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) => {
    const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase())
    return isKeyword ? (
      <span key={i} className="rounded bg-red-500/20 px-0.5 font-semibold text-red-600 dark:text-red-400">{part}</span>
    ) : part
  })
}

function RiskMeter({ riskLevel, confidence }: { riskLevel: string; confidence: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius

  const getRiskValue = () => {
    switch (riskLevel) {
      case "High": return Math.min(100, 80 + (confidence * 0.2))
      case "Medium": return 40 + (confidence * 0.2)
      case "Low": return Math.max(5, 20 - (confidence * 0.15))
      default: return 50
    }
  }

  const displayValue = Math.round(getRiskValue())
  const progress = (displayValue / 100) * circumference

  const getColor = () => {
    switch (riskLevel) {
      case "High": return { stroke: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" }
      case "Medium": return { stroke: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" }
      case "Low": return { stroke: "#10b981", bg: "rgba(16, 185, 129, 0.15)" }
      default: return { stroke: "#6b7280", bg: "rgba(107, 114, 128, 0.15)" }
    }
  }

  const colors = getColor()

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" className="transform -rotate-90">
        <circle cx="50" cy="50" r={radius} stroke={colors.bg} strokeWidth="8" fill="none" />
        <circle
          cx="50" cy="50" r={radius}
          stroke={colors.stroke} strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-foreground">{displayValue}%</span>
        <span className="text-xs text-muted-foreground">Risk</span>
      </div>
    </div>
  )
}

export function ScamAnalyzer({ title, placeholder }: ScamAnalyzerProps) {
  const [inputMode, setInputMode] = useState<"text" | "url">("text")
  const [inputValue, setInputValue] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRedFlagsExpanded, setIsRedFlagsExpanded] = useState(true)

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputValue, inputType: inputMode }),
      })
      if (!response.ok) throw new Error("Failed to analyze content")
      const data = await response.json()
      setResult(data)
    } catch {
      setError("Failed to analyze content. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskStyles = (level: string) => {
    switch (level) {
      case "High": return { badge: "bg-red-500 text-white", border: "border-red-500/40", bg: "bg-red-500/5", text: "text-red-500" }
      case "Medium": return { badge: "bg-amber-500 text-black", border: "border-amber-500/40", bg: "bg-amber-500/5", text: "text-amber-500" }
      case "Low": return { badge: "bg-emerald-500 text-black", border: "border-emerald-500/40", bg: "bg-emerald-500/5", text: "text-emerald-500" }
      default: return { badge: "bg-muted", border: "border-border", bg: "bg-card", text: "text-muted-foreground" }
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High": return <ShieldAlert className="h-10 w-10 text-red-500" />
      case "Medium": return <AlertTriangle className="h-10 w-10 text-amber-500" />
      case "Low": return <ShieldCheck className="h-10 w-10 text-emerald-500" />
      default: return <Shield className="h-10 w-10" />
    }
  }

  // Fixed: bar color matches risk level, not confidence value
  const getConfidenceBarColor = (level: string) => {
    switch (level) {
      case "High": return "bg-red-500"
      case "Medium": return "bg-amber-500"
      case "Low": return "bg-emerald-500"
      default: return "bg-muted"
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="relative">
          <h2 className="mb-1 text-xl font-bold text-foreground">{title}</h2>
          <p className="mb-5 text-sm text-muted-foreground">Pattern-based detection to help identify potential scams</p>

          {/* Mode Toggle */}
          <div className="mb-4 inline-flex rounded-lg bg-secondary/50 p-1">
            <button
              onClick={() => setInputMode("text")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                inputMode === "text" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              Paste Text
            </button>
            <button
              onClick={() => setInputMode("url")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                inputMode === "url" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link2 className="h-4 w-4" />
              Enter URL
            </button>
          </div>

          {inputMode === "text" ? (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="h-44 w-full resize-none rounded-xl border border-border bg-background/50 p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          ) : (
            <input
              type="url"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://example.com/job-posting..."
              className="w-full rounded-xl border border-border bg-background/50 p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputValue.trim()}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {isAnalyzing ? (
              <><Loader2 className="h-5 w-5 animate-spin" /><span>Analyzing...</span></>
            ) : (
              <><Shield className="h-5 w-5" /><span>Analyze for Scams</span></>
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
            <div className="relative rounded-full bg-primary/10 p-5">
              <Shield className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-base font-medium text-foreground">Scanning for patterns...</p>
          <p className="mt-1 text-sm text-muted-foreground">Checking against known scam indicators</p>
          <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/5 p-8">
          <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
          <p className="font-medium text-foreground">Analysis Failed</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <button onClick={handleAnalyze} className="mt-3 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors">
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {result && !isAnalyzing && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Verdict */}
          <div className={cn("rounded-2xl border-2 p-6", getRiskStyles(result.risk_level).border, getRiskStyles(result.risk_level).bg)}>
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 text-center">
                {getRiskIcon(result.risk_level)}
                <span className={cn("rounded-full px-5 py-2 text-lg font-bold uppercase tracking-wider", getRiskStyles(result.risk_level).badge)}>
                  {result.risk_level} Risk
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center justify-center rounded-xl bg-background/50 p-4 border border-border/50">
                  <RiskMeter riskLevel={result.risk_level} confidence={result.confidence} />
                </div>
                <div className="space-y-2 rounded-xl bg-background/50 p-4 border border-border/50">
                  <span className="text-sm text-muted-foreground">Detection Confidence</span>
                  <div className="text-3xl font-bold text-foreground">{result.confidence}%</div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700 ease-out", getConfidenceBarColor(result.risk_level))}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center rounded-xl bg-background/50 p-4 border border-border/50">
                  <span className="text-sm text-muted-foreground">Detected Type</span>
                  <span className={cn("mt-1 text-base font-bold", getRiskStyles(result.risk_level).text)}>
                    {result.scam_type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Keywords */}
          {result.keywords && result.keywords.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-amber-500/20 p-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <span className="font-semibold text-foreground">
                  Suspicious Keywords Detected
                  <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">{result.keywords.length}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {result.red_flags.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-red-500/30 bg-red-500/5">
              <button
                onClick={() => setIsRedFlagsExpanded(!isRedFlagsExpanded)}
                className="flex w-full items-center justify-between p-5 text-left hover:bg-red-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-500/20 p-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="font-semibold text-foreground">
                    Red Flags Detected
                    <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">{result.red_flags.length}</span>
                  </span>
                </div>
                <div className={cn("rounded-lg bg-secondary p-1.5 transition-transform duration-300", isRedFlagsExpanded && "rotate-180")}>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
              <div className={cn("grid transition-all duration-300 ease-in-out", isRedFlagsExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                  <ul className="space-y-2 border-t border-red-500/20 px-5 pb-5 pt-4">
                    {result.red_flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-lg bg-background/60 p-3 border border-red-500/10">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
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

          {/* Advice */}
          <div className={cn(
            "rounded-2xl border-2 p-5",
            result.risk_level === "Low" ? "border-emerald-500/30 bg-emerald-500/5" : "border-primary/20 bg-primary/5"
          )}>
            <div className="flex items-start gap-4">
              <div className={cn("rounded-xl p-2.5 shrink-0", result.risk_level === "Low" ? "bg-emerald-500/20" : "bg-primary/20")}>
                {result.risk_level === "Low" ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Shield className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Recommended Action</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.advice}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}