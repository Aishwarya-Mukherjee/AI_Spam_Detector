"use client"

import { AlertTriangle, AlertCircle, CheckCircle, Activity, TrendingUp, Shield, Zap, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const summaryData = {
  totalAnalyses: 247,
  highRisk: 42,
  mediumRisk: 78,
  lowRisk: 127,
  recentScams: [
    { type: "Internship Scam", date: "2 hours ago", risk: "High", source: "Email" },
    { type: "Job Scam", date: "5 hours ago", risk: "High", source: "LinkedIn" },
    { type: "Potential Phishing", date: "Yesterday", risk: "Medium", source: "Website" },
    { type: "Contract Terms", date: "2 days ago", risk: "Medium", source: "Document" },
    { type: "Legitimate Offer", date: "3 days ago", risk: "Low", source: "Email" },
  ],
}

export function RiskSummary() {
  const highPercent = Math.round((summaryData.highRisk / summaryData.totalAnalyses) * 100)
  const mediumPercent = Math.round((summaryData.mediumRisk / summaryData.totalAnalyses) * 100)
  const lowPercent = Math.round((summaryData.lowRisk / summaryData.totalAnalyses) * 100)

  return (
    <div className="space-y-6">
      {/* Stats Grid - Primary 3 cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Scans */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-6 shadow-lg">
          <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
              <p className="text-3xl font-bold text-foreground">{summaryData.totalAnalyses}</p>
            </div>
          </div>
        </div>

        {/* High Risk Count */}
        <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-red-900/20 to-transparent p-6 shadow-lg shadow-red-500/5">
          <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-red-500/20 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="rounded-xl bg-red-500/20 p-3 ring-1 ring-red-500/30">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">High Risk</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-red-400">{summaryData.highRisk}</p>
                <span className="text-sm text-red-400/60">({highPercent}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Safe Content Count */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-transparent p-6 shadow-lg shadow-emerald-500/5">
          <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="rounded-xl bg-emerald-500/20 p-3 ring-1 ring-emerald-500/30">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Safe Content</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-emerald-400">{summaryData.lowRisk}</p>
                <span className="text-sm text-emerald-400/60">({lowPercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Risk Distribution</h3>
              <p className="text-sm text-muted-foreground">Analysis breakdown by threat level</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Real-time data
          </div>
        </div>

        <div className="space-y-5">
          {/* High Risk Bar */}
          <div className="group">
            <div className="mb-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="font-medium text-foreground">High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{summaryData.highRisk} scans</span>
                <span className="rounded-md bg-red-500/20 px-2 py-0.5 font-bold text-red-400">{highPercent}%</span>
              </div>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-secondary/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 transition-all duration-1000 ease-out group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                style={{ width: `${highPercent}%` }}
              />
            </div>
          </div>

          {/* Medium Risk Bar */}
          <div className="group">
            <div className="mb-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="font-medium text-foreground">Medium Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{summaryData.mediumRisk} scans</span>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-bold text-amber-400">{mediumPercent}%</span>
              </div>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-secondary/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 transition-all duration-1000 ease-out group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                style={{ width: `${mediumPercent}%` }}
              />
            </div>
          </div>

          {/* Low Risk Bar */}
          <div className="group">
            <div className="mb-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">Low Risk / Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{summaryData.lowRisk} scans</span>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-400">{lowPercent}%</span>
              </div>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-secondary/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 transition-all duration-1000 ease-out group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                style={{ width: `${lowPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Recent Detections</h3>
              <p className="text-sm text-muted-foreground">Latest analyzed content</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {summaryData.recentScams.map((scam, index) => (
            <div
              key={index}
              className={cn(
                "group flex items-center justify-between rounded-xl border p-4 transition-all hover:scale-[1.01]",
                scam.risk === "High" && "border-red-500/20 bg-red-500/5 hover:border-red-500/40",
                scam.risk === "Medium" && "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40",
                scam.risk === "Low" && "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "rounded-lg p-2",
                  scam.risk === "High" && "bg-red-500/20",
                  scam.risk === "Medium" && "bg-amber-500/20",
                  scam.risk === "Low" && "bg-emerald-500/20"
                )}>
                  {scam.risk === "High" && <AlertTriangle className="h-5 w-5 text-red-400" />}
                  {scam.risk === "Medium" && <AlertCircle className="h-5 w-5 text-amber-400" />}
                  {scam.risk === "Low" && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                </div>
                <div>
                  <p className="font-medium text-foreground">{scam.type}</p>
                  <p className="text-xs text-muted-foreground">Source: {scam.source}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    scam.risk === "High" && "bg-red-500/20 text-red-400",
                    scam.risk === "Medium" && "bg-amber-500/20 text-amber-400",
                    scam.risk === "Low" && "bg-emerald-500/20 text-emerald-400"
                  )}
                >
                  {scam.risk}
                </span>
                <span className="text-xs text-muted-foreground">{scam.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
