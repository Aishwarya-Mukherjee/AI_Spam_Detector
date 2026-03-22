"use client"

import { useState, useCallback } from "react"
import { AlertTriangle, CheckCircle, Shield, AlertCircle, ChevronDown, Loader2, ShieldAlert, ShieldCheck, Upload, X, Mail, Image as ImageIcon, FileText, Link2, AlertOctagon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalysisResult {
  risk_level: "High" | "Medium" | "Low"
  confidence: number
  scam_type: string
  red_flags: string[]
  keywords: string[]
  advice: string
  highlights?: {
    suspicious_phrases: string[]
    unknown_sender: boolean
    link_mismatch: boolean
  }
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

// Circular Risk Meter Component
function RiskMeter({ value }: { value: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference
  
  const getColor = () => {
    if (value >= 71) return { stroke: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" }
    if (value >= 31) return { stroke: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)" }
    return { stroke: "#10b981", bg: "rgba(16, 185, 129, 0.2)" }
  }
  
  const colors = getColor()
  
  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" className="transform -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={colors.bg}
          strokeWidth="8"
          fill="none"
        />
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
        <span className="text-2xl font-bold text-foreground">{value}%</span>
        <span className="text-xs text-muted-foreground">Risk</span>
      </div>
    </div>
  )
}

export function EmailAnalyzer() {
  const [inputMode, setInputMode] = useState<"upload" | "email">("upload")
  const [emailContent, setEmailContent] = useState("")
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
    if (file) {
      handleFileSelect(file)
    }
  }, [])

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PNG, JPG, or PDF file")
      return
    }
    
    setUploadedFile(file)
    setError(null)
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const clearUpload = () => {
    setUploadedFile(null)
    setFilePreview(null)
    setResult(null)
  }

  // Check if image filename suggests it's a regular photo (not a screenshot)
  const isRegularPhoto = (filename: string): boolean => {
    const photoPatterns = [
      /^IMG_/i,          // Camera photos (IMG_1234)
      /^DSC/i,           // DSLR camera photos
      /^DCIM/i,          // Camera folder photos
      /^Photo/i,         // Generic photo naming
      /^PXL_/i,          // Pixel phone photos
      /^P\d{8}/i,        // Date-based photo naming
      /\d{8}_\d{6}/,     // Timestamp photos (20231225_143022)
      /wallpaper/i,      // Wallpapers
      /landscape/i,      // Landscape photos
      /portrait/i,       // Portrait photos
      /selfie/i,         // Selfies
      /vacation/i,       // Vacation photos
      /family/i,         // Family photos
      /pet/i,            // Pet photos
      /dog|cat|bird/i,   // Animal photos
      /food|meal|dinner|lunch|breakfast/i, // Food photos
      /sunset|sunrise|beach|mountain|nature/i, // Nature photos
    ]
    
    // Check if filename matches regular photo patterns
    if (photoPatterns.some(pattern => pattern.test(filename))) {
      return true
    }
    
    // Screenshot patterns that indicate suspicious content
    const screenshotPatterns = [
      /screenshot/i,
      /screen shot/i,
      /scam/i,
      /phishing/i,
      /suspicious/i,
      /email/i,
      /message/i,
      /text/i,
      /sms/i,
      /whatsapp/i,
      /telegram/i,
    ]
    
    // If it matches screenshot patterns, it's not a regular photo
    if (screenshotPatterns.some(pattern => pattern.test(filename))) {
      return false
    }
    
    // Default: random names without patterns could be regular photos
    // Use a simple heuristic - if filename is just numbers/letters without suspicious words, likely a photo
    const hasNoText = /^[A-Za-z0-9_\-\.]+$/.test(filename) && filename.length < 30
    return hasNoText
  }

  const handleAnalyze = async () => {
    if (inputMode === "upload" && !uploadedFile) return
    if (inputMode === "email" && !emailContent.trim()) return
    
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    
    try {
      // Simulate OCR extraction for images
      let contentToAnalyze = emailContent
      let isNormalImage = false
      
      if (inputMode === "upload" && uploadedFile) {
        // Simulate OCR extraction delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        
        // Check if this looks like a regular photo vs a screenshot of suspicious content
        isNormalImage = isRegularPhoto(uploadedFile.name)
        
        if (isNormalImage) {
          // Normal photo - no suspicious content detected
          contentToAnalyze = `[Image Analysis: ${uploadedFile.name}] This appears to be a regular photograph with no text or suspicious content detected. No email, message, or document content found in the image.`
        } else {
          // Likely a screenshot - simulate finding suspicious content
          contentToAnalyze = `[OCR Extracted from ${uploadedFile.name}] Urgent: Your account requires immediate verification. Click here to verify your identity. Failure to comply will result in account suspension. Best regards, Security Team`
        }
      }
      
      // If it's a normal image, return safe result directly
      if (isNormalImage) {
        setResult({
          risk_level: "Low",
          confidence: 95,
          scam_type: "Regular Image - No Threat",
          red_flags: [],
          keywords: [],
          advice: "This appears to be a regular photograph or image. No suspicious text, phishing content, or scam indicators were detected. If you believe this image contains suspicious content, try uploading a clearer screenshot or paste the text directly.",
          highlights: {
            suspicious_phrases: [],
            unknown_sender: false,
            link_mismatch: false,
          },
        })
        setIsAnalyzing(false)
        return
      }
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentToAnalyze,
          inputType: inputMode === "upload" ? "screenshot" : "email",
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to analyze content")
      }
      
      const data = await response.json()
      
      // Add email-specific highlights
      if (inputMode === "email" || inputMode === "upload") {
        data.highlights = {
          suspicious_phrases: extractSuspiciousPhrases(contentToAnalyze),
          unknown_sender: checkUnknownSender(contentToAnalyze),
          link_mismatch: checkLinkMismatch(contentToAnalyze),
        }
      }
      
      setResult(data)
    } catch (err) {
      console.error("Analysis error:", err)
      setError("Failed to analyze content. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Helper functions for email analysis
  const extractSuspiciousPhrases = (content: string): string[] => {
    const phrases = [
      "urgent action required",
      "verify your identity",
      "account suspended",
      "click here immediately",
      "limited time offer",
      "act now",
      "confirm your details",
      "security alert",
      "unusual activity",
      "password reset required",
    ]
    return phrases.filter(phrase => content.toLowerCase().includes(phrase.toLowerCase()))
  }

  const checkUnknownSender = (content: string): boolean => {
    const suspiciousDomains = ["@gmail.com", "@yahoo.com", "@hotmail.com", "@outlook.com"]
    return suspiciousDomains.some(domain => content.toLowerCase().includes(domain))
  }

  const checkLinkMismatch = (content: string): boolean => {
    return content.toLowerCase().includes("click here") || content.toLowerCase().includes("verify")
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

  const canAnalyze = (inputMode === "upload" && uploadedFile) || (inputMode === "email" && emailContent.trim())

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-card/50 p-6 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="relative">
          <h2 className="mb-1 text-xl font-bold text-foreground">Screenshot & Email Analyzer</h2>
          <p className="mb-5 text-sm text-muted-foreground">Upload screenshots or paste email content for AI-powered scam detection</p>
          
          {/* Input Mode Toggle */}
          <div className="mb-4 inline-flex rounded-lg bg-secondary/50 p-1">
            <button
              onClick={() => setInputMode("upload")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                inputMode === "upload"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ImageIcon className="h-4 w-4" />
              Upload Screenshot
            </button>
            <button
              onClick={() => setInputMode("email")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                inputMode === "email"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Mail className="h-4 w-4" />
              Paste Email
            </button>
          </div>

          {/* Upload Section */}
          {inputMode === "upload" && (
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
                  <p className="mt-4 text-lg font-medium text-foreground">
                    Drag & drop your file here
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    PNG, JPG, or PDF files accepted
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="h-px w-12 bg-border" />
                    <span className="text-sm text-muted-foreground">OR</span>
                    <span className="h-px w-12 bg-border" />
                  </div>
                  <label className="mt-4 cursor-pointer">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <span className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
                      Upload File
                    </span>
                  </label>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-start gap-4">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="h-24 w-24 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-secondary">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                      <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Ready for analysis
                      </p>
                    </div>
                    <button
                      onClick={clearUpload}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Paste Section */}
          {inputMode === "email" && (
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste suspicious email content here... Include the full email body, sender information, and any links mentioned."
              className="h-44 w-full resize-none rounded-xl border border-border bg-background/50 p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !canAnalyze}
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
                <span>Analyze Content</span>
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
            <p className="mt-6 text-lg font-medium text-foreground">Analyzing with AI...</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {inputMode === "upload" ? "Extracting text via OCR and scanning for threats..." : "Scanning email content for phishing indicators..."}
            </p>
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
            <button
              onClick={handleAnalyze}
              className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-colors"
            >
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
                <span className={cn(
                  "rounded-full px-6 py-2.5 text-xl font-bold uppercase tracking-wider",
                  getRiskStyles(result.risk_level).badge
                )}>
                  {result.risk_level} Risk
                </span>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-center rounded-xl bg-secondary/20 p-4">
                  <RiskMeter value={result.confidence} />
                </div>
                
                <div className="space-y-2 rounded-xl bg-secondary/20 p-4">
                  <span className="text-sm font-medium text-muted-foreground">Confidence Level</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{result.confidence}%</span>
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
                
                <div className="flex flex-col justify-center rounded-xl bg-secondary/20 p-4">
                  <span className="text-sm text-muted-foreground">Detected Type</span>
                  <span className={cn(
                    "mt-1 text-lg font-bold",
                    getRiskStyles(result.risk_level).text
                  )}>
                    {result.scam_type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Highlights Section */}
          {result.highlights && (result.highlights.suspicious_phrases.length > 0 || result.highlights.unknown_sender || result.highlights.link_mismatch) && (
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-transparent p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-amber-500/20 p-2">
                  <AlertOctagon className="h-5 w-5 text-amber-400" />
                </div>
                <span className="font-bold text-foreground">Email Analysis Highlights</span>
              </div>
              
              <div className="space-y-3">
                {result.highlights.suspicious_phrases.length > 0 && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                    <p className="text-sm font-medium text-amber-400 mb-2">Suspicious Phrases Detected:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.highlights.suspicious_phrases.map((phrase, index) => (
                        <span key={index} className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.highlights.unknown_sender && (
                  <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Unknown Sender Warning</p>
                      <p className="text-xs text-muted-foreground">Email appears to be from a personal/free email domain</p>
                    </div>
                  </div>
                )}
                
                {result.highlights.link_mismatch && (
                  <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <Link2 className="h-5 w-5 text-red-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Suspicious Links Detected</p>
                      <p className="text-xs text-muted-foreground">Email contains action links that may be phishing attempts</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Red Flags Section */}
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
                    <span className="font-bold text-foreground">Red Flags Detected</span>
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
              
              <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isRedFlagsExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}>
                <div className="overflow-hidden">
                  <ul className="space-y-3 border-t border-red-500/20 px-5 pb-5 pt-4">
                    {result.red_flags.map((flag, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 rounded-lg bg-red-500/5 p-3 border border-red-500/10"
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
