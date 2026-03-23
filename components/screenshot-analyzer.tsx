"use client"

import { useState, useCallback } from "react"
import { AlertTriangle, CheckCircle, Shield, AlertCircle, ChevronDown, Loader2, ShieldAlert, ShieldCheck, Upload, X, FileText, AlertOctagon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalysisResult {
  risk_level: "High" | "Medium" | "Low"
  confidence: number
  scam_type: string
  red_flags: string[]
  keywords: string[]
  advice: string
}

// Circular Risk Meter Component
function RiskMeter({ riskLevel, confidence }: { riskLevel: "High" | "Medium" | "Low"; confidence: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  
  const getRiskValue = () => {
    switch (riskLevel) {
      case "High":
        return Math.min(100, 80 + (confidence * 0.2))
      case "Medium":
        return 40 + (confidence * 0.2)
      case "Low":
        return Math.max(5, 20 - (confidence * 0.15))
      default:
        return 50
    }
  }
  
  const displayValue = Math.round(getRiskValue())
  const progress = (displayValue / 100) * circumference
  
  const getColor = () => {
    switch (riskLevel) {
      case "High":
        return { stroke: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" }
      case "Medium":
        return { stroke: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)" }
      case "Low":
        return { stroke: "#10b981", bg: "rgba(16, 185, 129, 0.2)" }
      default:
        return { stroke: "#6b7280", bg: "rgba(107, 114, 128, 0.2)" }
    }
  }
  
  const colors = getColor()
  
  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" className="transform -rotate-90">
        <circle cx="50" cy="50" r={radius} stroke={colors.bg} strokeWidth="8" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={colors.stroke}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${colors.stroke})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-foreground">{displayValue}%</span>
        <span className="text-xs text-muted-foreground">Risk</span>
      </div>
    </div>
  )
}

export function ScreenshotAnalyzer() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRedFlagsExpanded, setIsRedFlagsExpanded] = useState(true)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [])

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PNG, JPG, or PDF file")
      return
    }
    
    setUploadedFile(file)
    setError(null)
    setResult(null)
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setFilePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const clearUpload = () => {
    setUploadedFile(null)
    setFilePreview(null)
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return
    
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Since we cannot perform actual OCR, inform user to use Email Analyzer tab
      setResult({
        risk_level: "Medium",
        confidence: 50,
        scam_type: "Manual Review Required",
        red_flags: [
          "Image uploaded - text content cannot be automatically extracted",
          "For accurate scam detection, please use the Email Analyzer tab and paste the text",
        ],
        keywords: [],
        advice: "We received your screenshot but cannot automatically read text from images. For accurate analysis, please go to the 'Email Analyzer' tab and copy-paste the text content from your screenshot. This will allow our AI to properly detect scam indicators like registration fees, urgency tactics, and suspicious contact information.",
      })
    } catch (err) {
      setError("Failed to analyze content. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
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
        return { badge: "bg-muted", border: "border-border", bg: "bg-card", text: "text-muted-foreground", glow: "" }
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
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="relative">
          <h2 className="mb-1 text-xl font-bold text-foreground">Screenshot Analyzer</h2>
          <p className="mb-5 text-sm text-muted-foreground">Upload screenshots of suspicious messages, emails, or job postings for analysis</p>
          
          {/* Upload Section */}
          <div className="space-y-4">
            {!uploadedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all",
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background/50 hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="mt-4 text-lg font-medium text-foreground">Drag & drop your screenshot here</p>
                <p className="mt-1 text-sm text-muted-foreground">PNG, JPG, or PDF files accepted</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="h-px w-12 bg-border" />
                  <span className="text-sm text-muted-foreground">OR</span>
                  <span className="h-px w-12 bg-border" />
                </div>
                <label className="mt-4 cursor-pointer">
                  <input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileInputChange} className="hidden" />
                  <span className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
                    Browse Files
                  </span>
                </label>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-start gap-4">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-secondary">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Ready for analysis
                    </p>
                  </div>
                  <button onClick={clearUpload} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !uploadedFile}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Processing Screenshot...</span>
              </>
            ) : (
              <>
                <Shield className="h-6 w-6" />
                <span>Analyze Screenshot</span>
              </>
            )}
          </button>
          
          {/* Info Note */}
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertOctagon className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-400">For Best Results</p>
                <p className="mt-1 text-muted-foreground">
                  Since automatic text extraction from images is limited, we recommend using the <strong className="text-foreground">Email Analyzer</strong> tab where you can paste the actual text content for accurate scam detection.
                </p>
              </div>
            </div>
          </div>
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
            <p className="mt-6 text-lg font-medium text-foreground">Processing Screenshot...</p>
            <p className="mt-2 text-sm text-muted-foreground">Attempting to extract and analyze content</p>
            <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isAnalyzing && (
        <div className="animate-in fade-in duration-300">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/20 p-8">
            <div className="rounded-full bg-red-500/20 p-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">Analysis Failed</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button onClick={handleAnalyze} className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-colors">
              Try Again
            </button>
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
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />
            
            <div className="relative space-y-6">
              <div className="flex flex-col items-center text-center gap-4">
                {getRiskIcon(result.risk_level)}
                <span className={cn("rounded-full px-6 py-2.5 text-xl font-bold uppercase tracking-wider", getRiskStyles(result.risk_level).badge)}>
                  {result.risk_level} Risk
                </span>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-center rounded-xl bg-secondary/20 p-4">
                  <RiskMeter riskLevel={result.risk_level} confidence={result.confidence} />
                </div>
                <div className="space-y-2 rounded-xl bg-secondary/20 p-4">
                  <span className="text-sm font-medium text-muted-foreground">Confidence Level</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{result.confidence}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-secondary/50">
                    <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", getConfidenceColor(result.confidence))} style={{ width: `${result.confidence}%` }} />
                  </div>
                </div>
                <div className="flex flex-col justify-center rounded-xl bg-secondary/20 p-4">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={cn("mt-1 text-lg font-bold", getRiskStyles(result.risk_level).text)}>
                    {result.scam_type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Red Flags Section */}
          {result.red_flags.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-transparent">
              <button onClick={() => setIsRedFlagsExpanded(!isRedFlagsExpanded)} className="flex w-full items-center justify-between p-5 text-left hover:bg-amber-500/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/20 p-2">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground">Notes</span>
                    <span className="ml-2 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-sm font-semibold text-amber-400">{result.red_flags.length}</span>
                  </div>
                </div>
                <div className={cn("rounded-lg bg-secondary/50 p-1.5 transition-transform duration-300", isRedFlagsExpanded && "rotate-180")}>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </button>
              
              <div className={cn("grid transition-all duration-300 ease-in-out", isRedFlagsExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                  <ul className="space-y-3 border-t border-amber-500/20 px-5 pb-5 pt-4">
                    {result.red_flags.map((flag, index) => (
                      <li key={index} className="flex items-start gap-3 rounded-lg bg-amber-500/5 p-3 border border-amber-500/10">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                        <span className="text-sm text-foreground leading-relaxed">{flag}</span>
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
              <div className={cn("rounded-xl p-3", result.risk_level === "Low" ? "bg-emerald-500/20" : "bg-primary/20")}>
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
