"use client"

import { useState } from "react"
import { Globe, Shield, AlertTriangle, Loader2, CheckCircle, AlertCircle, ShieldAlert, ShieldCheck, ExternalLink, Lock, Unlock, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface URLScanResult {
  url: string
  risk_level: "High" | "Medium" | "Low"
  confidence: number
  scam_type: string
  red_flags: string[]
  keywords: string[]
  advice: string
  // URL-specific checks
  checks: {
    uses_https: boolean
    has_ip_address: boolean
    has_suspicious_tld: boolean
    has_brand_impersonation: boolean
    has_excessive_subdomains: boolean
    has_url_shortener: boolean
  }
}

const SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".click", ".work", ".link"]
const SHORT_URLS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "rb.gy", "cutt.ly", "shorturl.at"]
const BIG_BRANDS = ["google", "facebook", "linkedin", "amazon", "microsoft", "apple", "netflix", "paypal", "instagram", "twitter", "naukri", "indeed", "infosys", "tcs", "wipro"]

function runURLChecks(url: string) {
  const lower = url.toLowerCase()
  const useHttps = lower.startsWith("https://")
  const hasIP = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lower)
  const hasSuspiciousTLD = SUSPICIOUS_TLDS.some(t => lower.includes(t))
  const hasShortener = SHORT_URLS.some(s => lower.includes(s))
  
  // Check for brand impersonation: brand name in URL but not as the real domain
  let hasBrandImpersonation = false
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname
    hasBrandImpersonation = BIG_BRANDS.some(brand => {
      if (!hostname.includes(brand)) return false
      // If e.g. hostname is "linkedin-jobs.net" it contains "linkedin" but isn't "linkedin.com"
      return !hostname.endsWith(`${brand}.com`) && !hostname.endsWith(`${brand}.in`) && !hostname.endsWith(`${brand}.net`)
    })
  } catch {
    // pass
  }

  // Count subdomains
  let hasExcessiveSubdomains = false
  try {
    const hostname = new URL(url).hostname
    hasExcessiveSubdomains = hostname.split(".").length > 4
  } catch {
    // pass
  }

  return {
    uses_https: useHttps,
    has_ip_address: hasIP,
    has_suspicious_tld: hasSuspiciousTLD,
    has_brand_impersonation: hasBrandImpersonation,
    has_excessive_subdomains: hasExcessiveSubdomains,
    has_url_shortener: hasShortener,
  }
}

export function URLScanner() {
  const [url, setUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<URLScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRedFlagsExpanded, setIsRedFlagsExpanded] = useState(true)

  const handleScan = async () => {
    if (!url.trim()) return

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = "https://" + normalizedUrl
    }

    setIsScanning(true)
    setResult(null)
    setError(null)

    try {
      const checks = runURLChecks(normalizedUrl)

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: normalizedUrl, inputType: "url" }),
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Failed to scan URL")
      }
      const data = await response.json()

      // Merge local checks into result
      setResult({ ...data, url: normalizedUrl, checks })
    } catch (err: any) {
      setError(err.message || "Failed to scan URL. Please try again.")
    } finally {
      setIsScanning(false)
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

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <div className="rounded-lg bg-primary/10 p-2">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">URL / Domain Scanner</h2>
        </div>
        <p className="mb-5 ml-12 text-sm text-muted-foreground">
          Paste any suspicious link to scan it for phishing, brand impersonation, and domain spoofing
        </p>

        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="https://suspicious-link.xyz/job-offer..."
            className="flex-1 rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            onClick={handleScan}
            disabled={isScanning || !url.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {isScanning ? "Scanning..." : "Scan URL"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["bit.ly/fake-jobs", "linkedin-jobs.net/apply", "192.168.1.1/offer.pdf", "tcs-recruitment.tk"].map((ex) => (
            <button
              key={ex}
              onClick={() => setUrl("http://" + ex)}
              className="rounded-lg border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isScanning && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
            <div className="relative rounded-full bg-primary/10 p-5">
              <Globe className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-base font-medium text-foreground">Scanning URL...</p>
          <p className="mt-1 text-sm text-muted-foreground">Checking domain reputation, TLS, and threat indicators</p>
          <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isScanning && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/5 p-8">
          <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
          <p className="font-medium text-foreground">Scan Failed</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && !isScanning && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Verdict */}
          <div className={cn("rounded-2xl border-2 p-6", getRiskStyles(result.risk_level).border, getRiskStyles(result.risk_level).bg)}>
            <div className="flex flex-col items-center gap-3 text-center mb-5">
              {getRiskIcon(result.risk_level)}
              <span className={cn("rounded-full px-5 py-2 text-lg font-bold uppercase tracking-wider", getRiskStyles(result.risk_level).badge)}>
                {result.risk_level} Risk
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                <span className="font-mono text-xs break-all">{result.url}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 rounded-xl bg-background/50 p-4 border border-border/50">
                <span className="text-sm text-muted-foreground">Threat Type</span>
                <span className={cn("block text-base font-bold", getRiskStyles(result.risk_level).text)}>{result.scam_type}</span>
              </div>
              <div className="space-y-2 rounded-xl bg-background/50 p-4 border border-border/50">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <div className="text-2xl font-bold text-foreground">{result.confidence}%</div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className={cn("h-full rounded-full transition-all duration-700",
                    result.risk_level === "High" ? "bg-red-500" : result.risk_level === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                  )} style={{ width: `${result.confidence}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Automated URL Checks */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Automated URL Checks
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: "HTTPS Secure", pass: result.checks.uses_https, goodMsg: "Uses secure HTTPS", badMsg: "Not using HTTPS — insecure" },
                { label: "IP Address URL", pass: !result.checks.has_ip_address, goodMsg: "Uses proper domain", badMsg: "IP-based URL — very suspicious" },
                { label: "Suspicious TLD", pass: !result.checks.has_suspicious_tld, goodMsg: "Normal TLD", badMsg: "High-risk top-level domain (.tk/.xyz etc)" },
                { label: "Brand Impersonation", pass: !result.checks.has_brand_impersonation, goodMsg: "No brand spoofing detected", badMsg: "Possible brand impersonation detected" },
                { label: "Excessive Subdomains", pass: !result.checks.has_excessive_subdomains, goodMsg: "Normal subdomain structure", badMsg: "Unusual number of subdomains" },
                { label: "URL Shortener", pass: !result.checks.has_url_shortener, goodMsg: "Not a shortened URL", badMsg: "URL shortener hides real destination" },
              ].map(({ label, pass, goodMsg, badMsg }) => (
                <div key={label} className={cn("flex items-start gap-3 rounded-lg border p-3",
                  pass ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
                )}>
                  {pass
                    ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  }
                  <div>
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{pass ? goodMsg : badMsg}</p>
                  </div>
                  {pass ? <Lock className="ml-auto h-3 w-3 shrink-0 text-emerald-500/60" /> : <Unlock className="ml-auto h-3 w-3 shrink-0 text-red-500/60" />}
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags from AI */}
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
                    AI-Detected Red Flags
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
                        <span className="text-sm text-foreground leading-relaxed">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Advice */}
          <div className={cn("rounded-2xl border-2 p-5",
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
