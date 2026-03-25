"use client"

import { useState, useCallback } from "react"
import { AlertTriangle, CheckCircle, Shield, AlertCircle, ChevronDown, Loader2, ShieldAlert, ShieldCheck, Upload, X, FileText, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalysisResult {
  risk_level: "High" | "Medium" | "Low"
  confidence: number
  scam_type: string
  red_flags: string[]
  keywords: string[]
  advice: string
}

function RiskMeter({ riskLevel, confidence }: { riskLevel: "High" | "Medium" | "Low"; confidence: number }) {
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

  const analyzeImageByFilename = (filename: string): AnalysisResult => {
    const lowercaseName = filename.toLowerCase()
    const detectedKeywords: string[] = []
    const redFlags: string[] = []

    const riskPatterns = [
      { pattern: /whatsapp.*image/i, keyword: "WhatsApp Forward", flag: "Image shared via WhatsApp — common vector for scam distribution" },
      { pattern: /internship/i, keyword: "Internship", flag: "Contains 'internship' — paid internship scams are very common" },
      { pattern: /job|career|hiring|recruit/i, keyword: "Job/Hiring", flag: "Job-related content — verify company legitimacy before proceeding" },
      { pattern: /offer|opportunity/i, keyword: "Offer/Opportunity", flag: "Contains offer language — often used in scam promotions" },
      { pattern: /earn|income|money|salary|stipend/i, keyword: "Money/Earnings", flag: "Financial promises detected — be cautious of unrealistic income claims" },
      { pattern: /urgent|immediate|hurry|limited|fast/i, keyword: "Urgency", flag: "Urgency tactics detected — scammers create artificial time pressure" },
      { pattern: /register|signup|join|apply/i, keyword: "Registration", flag: "Registration prompt — never pay fees to register for jobs" },
      { pattern: /payment|pay|fee|deposit|₹|\$|rupee/i, keyword: "Payment/Fee", flag: "Payment-related content — legitimate jobs never require upfront fees" },
      { pattern: /telegram/i, keyword: "Telegram", flag: "Telegram reference — frequently used for scam coordination" },
      { pattern: /crypto|bitcoin|trading|forex/i, keyword: "Crypto/Trading", flag: "Cryptocurrency/trading content — high risk of investment scams" },
      { pattern: /guarantee|100%|assured|confirm/i, keyword: "Guarantee", flag: "Guarantee language — no legitimate job can guarantee outcomes" },
      { pattern: /work.*from.*home|remote.*job|online.*work/i, keyword: "Work From Home", flag: "Work from home offer — common theme in employment scams" },
      { pattern: /certificate|diploma/i, keyword: "Certificate", flag: "Certificate promises — often part of fake training scams" },
      { pattern: /whatsapp|wa\.me/i, keyword: "WhatsApp Contact", flag: "WhatsApp contact method — professional companies use official channels" },
      { pattern: /qr.*code|scan/i, keyword: "QR Code", flag: "QR code reference — may lead to phishing or payment fraud" },
    ]

    riskPatterns.forEach(({ pattern, keyword, flag }) => {
      if (pattern.test(lowercaseName)) {
        detectedKeywords.push(keyword)
        redFlags.push(flag)
      }
    })

    const safePatterns = [
      /^IMG_\d+/i, /^DSC\d+/i, /^DCIM/i, /^Photo/i, /^PXL_/i,
      /^screenshot.*\d{4}/i, /^screen\s*shot/i, /^capture/i, /^snip/i,
      /^[\{]?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}/i,
      /selfie|vacation|family|pet|food|sunset|beach|nature/i,
      /microsoft|google|amazon|facebook|linkedin|youtube|twitter/i,
      /browser|desktop|news|weather|msn|bing|edge|chrome|safari/i,
    ]

    const isSafePattern = safePatterns.some(pattern => pattern.test(lowercaseName))

    if (detectedKeywords.length >= 3) {
      return {
        risk_level: "High",
        confidence: Math.min(95, 75 + detectedKeywords.length * 5),
        scam_type: "Likely Scam Content",
        red_flags: redFlags,
        keywords: detectedKeywords,
        advice: "This image shows multiple strong scam indicators. Do NOT send money, share personal or financial information, or scan any QR codes. Block the sender and report this content to the platform where you received it.",
      }
    } else if (detectedKeywords.length >= 1) {
      return {
        risk_level: "Medium",
        confidence: 65 + detectedKeywords.length * 5,
        scam_type: "Suspicious Content",
        red_flags: redFlags,
        keywords: detectedKeywords,
        advice: "This image contains some suspicious indicators. Verify the source independently before taking any action. Never pay upfront fees for jobs or internships.",
      }
    } else if (isSafePattern) {
      return {
        risk_level: "Low",
        confidence: 80,
        scam_type: "Likely Safe Content",
        red_flags: [],
        keywords: [],
        advice: "No obvious scam indicators detected based on the filename. Always verify content from unknown sources before taking action.",
      }
    } else {
      return {
        risk_level: "Low",
        confidence: 65,
        scam_type: "No Threats Detected",
        red_flags: [],
        keywords: [],
        advice: "No specific scam indicators detected. Stay vigilant and verify any claims or offers independently.",
      }
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const analysisResult = analyzeImageByFilename(uploadedFile.name)
      setResult(analysisResult)
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

  const getConfidenceColor = (level: string) => {
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
          <h2 className="mb-1 text-xl font-bold text-foreground">Screenshot Analyzer</h2>
          <p className="mb-5 text-sm text-muted-foreground">Upload screenshots of suspicious messages, job postings, or emails for analysis</p>

          {/* Upload Section */}
          <div className="space-y-4">
            {!uploadedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer",
                  isDragging ? "border-primary bg-primary/5" : "border-border bg-background/50 hover:border-primary/40 hover:bg-primary/3"
                )}
              >
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">Drop your screenshot here</p>
                <p className="text-sm text-muted-foreground mb-4">PNG, JPG, or PDF accepted</p>
                <label className="cursor-pointer">
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
                    <img src={filePreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-border flex-shrink-0" />
                  ) : (
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <FileText className="h-7 w-7 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Ready for analysis
                    </p>
                  </div>
                  <button onClick={clearUpload} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !uploadedFile}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {isAnalyzing ? (
              <><Loader2 className="h-5 w-5 animate-spin" /><span>Analyzing...</span></>
            ) : (
              <><Shield className="h-5 w-5" /><span>Analyze Screenshot</span></>
            )}
          </button>

          {/* Honest info note */}
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Analysis is based on the <span className="font-medium text-foreground">filename</span> of your upload.
              For more accurate results, copy the text from the screenshot and use the <span className="font-medium text-foreground">Email / Text</span> tab instead.
            </p>
          </div>
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
          <p className="text-base font-medium text-foreground">Scanning filename patterns...</p>
          <p className="mt-1 text-sm text-muted-foreground">Checking for common scam indicators</p>
          <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/5 p-8">
          <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
          <p className="font-medium text-foreground">{error}</p>
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
                      className={cn("h-full rounded-full transition-all duration-700 ease-out", getConfidenceColor(result.risk_level))}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center rounded-xl bg-background/50 p-4 border border-border/50">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={cn("mt-1 text-base font-bold", getRiskStyles(result.risk_level).text)}>
                    {result.scam_type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Keywords */}
          {result.keywords.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-amber-500/20 p-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <span className="font-semibold text-foreground">
                  Suspicious Filename Keywords
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
              <button onClick={() => setIsRedFlagsExpanded(!isRedFlagsExpanded)} className="flex w-full items-center justify-between p-5 text-left hover:bg-red-500/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-500/20 p-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="font-semibold text-foreground">
                    Red Flags
                    <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">{result.red_flags.length}</span>
                  </span>
                </div>
                <div className={cn("rounded-lg bg-secondary p-1.5 transition-transform duration-300", isRedFlagsExpanded && "rotate-180")}>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
              <div className={cn("grid transition-all duration-300", isRedFlagsExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                  <ul className="space-y-2 border-t border-red-500/20 px-5 pb-5 pt-4">
                    {result.red_flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-lg bg-background/60 p-3 border border-red-500/10">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        <span className="text-sm text-foreground">{flag}</span>
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
              <div className={cn("rounded-xl p-2.5", result.risk_level === "Low" ? "bg-emerald-500/20" : "bg-primary/20")}>
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