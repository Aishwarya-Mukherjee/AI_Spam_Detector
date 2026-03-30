"use client"

import { useState, useEffect } from "react"
import { Shield, AlertTriangle, Globe, Hash, Clock, TrendingUp, Zap, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

// Simulated live threat intel feed entries typical of real Threat Intel platforms
const BASE_FEED = [
  { id: 1, type: "Phishing Campaign", source: "EmailGateway", region: "IN", severity: "High", time: "0m ago", description: "Mass phishing targeting job seekers via WhatsApp" },
  { id: 2, type: "Advance Fee Fraud", source: "SocialMedia", region: "NG", severity: "High", time: "3m ago", description: "Fake internship offers with upfront registration fees" },
  { id: 3, type: "Fake UPI QR", source: "MobileApps", region: "IN", severity: "High", time: "7m ago", description: "Fraudulent payment QR codes disguised as job portals" },
  { id: 4, type: "Domain Spoofing", source: "DomainWatch", region: "US", severity: "Medium", time: "12m ago", description: "linkedin-jobs[.]net impersonating LinkedIn careers" },
  { id: 5, type: "Credential Harvesting", source: "ThreatFeed", region: "RU", severity: "High", time: "18m ago", description: "Fake Google Forms collecting job applicant personal data" },
  { id: 6, type: "Smishing Attack", source: "MobileTelco", region: "IN", severity: "Medium", time: "24m ago", description: "SMS lure: 'Your resume shortlisted. Pay Rs.500 now'" },
  { id: 7, type: "Malicious PDF", source: "EmailGateway", region: "CN", severity: "High", time: "31m ago", description: "Offer letter PDFs with embedded macros stealing credentials" },
  { id: 8, type: "Brand Impersonation", source: "SocialMedia", region: "IN", severity: "Medium", time: "45m ago", description: "Fake Infosys & TCS recruitment pages on Facebook" },
  { id: 9, type: "Telegram Scam Group", source: "MessengerWatch", region: "IN", severity: "High", time: "52m ago", description: "500+ member Telegram group pushing 'work from home' scams" },
  { id: 10, type: "Investment Fraud", source: "FinancialWatch", region: "AE", severity: "High", time: "1h ago", description: "Crypto trading job offers leading to 'pig butchering' scams" },
]

const severityStyles: Record<string, string> = {
  High: "bg-red-500/15 text-red-500 border-red-500/30",
  Medium: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Low: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
}

const STATS = [
  { label: "Active Threats", value: "1,284", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  { label: "Domains Flagged", value: "347", icon: Globe, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "IOCs Today", value: "8,912", icon: Hash, color: "text-primary", bg: "bg-primary/10" },
  { label: "Feeds Live", value: "24", icon: Radio, color: "text-emerald-500", bg: "bg-emerald-500/10" },
]

export function ThreatIntelDashboard() {
  const [feed, setFeed] = useState(BASE_FEED)
  const [pulse, setPulse] = useState(false)

  // Simulate live feed updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 800)
      setFeed(prev => {
        const newEntry = {
          id: Date.now(),
          type: ["Phishing URL", "Job Scam", "Fake Offer Letter", "QR Fraud", "Smishing"][Math.floor(Math.random() * 5)],
          source: ["EmailGateway", "SocialMedia", "ThreatFeed", "DomainWatch"][Math.floor(Math.random() * 4)],
          region: ["IN", "US", "NG", "PK", "AE"][Math.floor(Math.random() * 5)],
          severity: Math.random() > 0.4 ? "High" : "Medium",
          time: "just now",
          description: [
            "New phishing kit targeting job seekers detected",
            "Fake Google form harvesting applicant data identified",
            "Advance fee recruitment scam campaign active",
            "Suspicious domain registered mimicking Naukri.com",
            "Bulk WhatsApp scam messages with malicious links",
          ][Math.floor(Math.random() * 5)],
        }
        return [newEntry, ...prev.slice(0, 9)]
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="rounded-lg bg-primary/10 p-2">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Threat Intelligence Dashboard</h2>
            </div>
            <p className="ml-12 text-sm text-muted-foreground">Real-time feed of active fraud and phishing campaigns</p>
          </div>
          <div className={cn("flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 transition-all", pulse && "scale-110")}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className={cn("mb-3 w-fit rounded-lg p-2", stat.bg)}>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Threat Type Heatmap */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Threat Type Distribution (Today)</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: "Advance Fee / Job Scam", count: 412, pct: 76, color: "bg-red-500" },
            { label: "Phishing / Domain Spoofing", count: 298, pct: 55, color: "bg-orange-500" },
            { label: "Credential Harvesting", count: 201, pct: 37, color: "bg-amber-500" },
            { label: "Investment / Crypto Fraud", count: 147, pct: 27, color: "bg-yellow-500" },
            { label: "Smishing / Mobile Scams", count: 89, pct: 16, color: "bg-primary" },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{item.count} cases</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Feed */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Live Threat Events</h3>
          </div>
          <span className="text-xs text-muted-foreground">Auto-refreshing every 8s</span>
        </div>
        <div className="divide-y divide-border/50">
          {feed.map((item, idx) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-4 px-6 py-3.5 transition-all duration-500",
                idx === 0 ? "bg-primary/5 animate-in fade-in" : "hover:bg-secondary/30"
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                <Shield className={cn("h-4 w-4", item.severity === "High" ? "text-red-500" : "text-amber-500")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-foreground">{item.type}</span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", severityStyles[item.severity])}>{item.severity}</span>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{item.region}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                <p className="text-xs text-muted-foreground/60">{item.source}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
