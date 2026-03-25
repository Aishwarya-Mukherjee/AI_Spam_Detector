"use client"

import { AlertTriangle, AlertCircle, CheckCircle, Activity, TrendingUp, Shield, Clock, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const summaryData = {
  totalAnalyses: 247,
  highRisk: 42,
  mediumRisk: 78,
  lowRisk: 127,
  recentScams: [
    { type: "Internship Scam", date: "2 hours ago", risk: "High" as const, source: "Email" },
    { type: "Job Scam", date: "5 hours ago", risk: "High" as const, source: "LinkedIn" },
    { type: "Potential Phishing", date: "Yesterday", risk: "Medium" as const, source: "Website" },
    { type: "Contract Terms", date: "2 days ago", risk: "Medium" as const, source: "Document" },
    { type: "Legitimate Offer", date: "3 days ago", risk: "Low" as const, source: "Email" },
  ],
}

export function RiskSummary() {
  const highPercent = Math.round((summaryData.highRisk / summaryData.totalAnalyses) * 100)
  const mediumPercent = Math.round((summaryData.mediumRisk / summaryData.totalAnalyses) * 100)
  const lowPercent = Math.round((summaryData.lowRisk / summaryData.totalAnalyses) * 100)

  return (
    <div className="space-y-6">
      {/* Sample Data Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-sm text-muted-foreground">
          This dashboard shows <span className="font-medium text-foreground">sample data</span> for illustration.
          In a future version, your actual scan history will appear here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Scans</p>
              <p className="text-3xl font-bold text-foreground">{summaryData.totalAnalyses}</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-red-500/5 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-red-500/20 p-3 ring-1 ring-red-500/30">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Risk</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-red-500">{summaryData.highRisk}</p>
                <span className="text-sm text-red-400">({highPercent}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-500/20 p-3 ring-1 ring-emerald-500/30">
              <Shield className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Safe Content</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-emerald-500">{summaryData.lowRisk}</p>
                <span className="text-sm text-emerald-400">({lowPercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Risk Distribution</h3>
            <p className="text-sm text-muted-foreground">Breakdown by threat level</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: "High Risk", count: summaryData.highRisk, percent: highPercent, color: "bg-red-500", textColor: "text-red-500", bgColor: "bg-red-500/10 text-red-500" },
            { label: "Medium Risk", count: summaryData.mediumRisk, percent: mediumPercent, color: "bg-amber-500", textColor: "text-amber-500", bgColor: "bg-amber-500/10 text-amber-500" },
            { label: "Low / Safe", count: summaryData.lowRisk, percent: lowPercent, color: "bg-emerald-500", textColor: "text-emerald-500", bgColor: "bg-emerald-500/10 text-emerald-500" },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{item.count} scans</span>
                  <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", item.bgColor)}>{item.percent}%</span>
                </div>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary/50">
                <div
                  className={cn("h-full rounded-full transition-all duration-700 ease-out", item.color)}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Recent Detections</h3>
            <p className="text-sm text-muted-foreground">Sample scan history</p>
          </div>
        </div>

        <div className="space-y-2">
          {summaryData.recentScams.map((scam, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between rounded-xl border p-3.5 transition-all",
                scam.risk === "High" && "border-red-500/20 bg-red-500/5",
                scam.risk === "Medium" && "border-amber-500/20 bg-amber-500/5",
                scam.risk === "Low" && "border-emerald-500/20 bg-emerald-500/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-lg p-2",
                  scam.risk === "High" && "bg-red-500/20",
                  scam.risk === "Medium" && "bg-amber-500/20",
                  scam.risk === "Low" && "bg-emerald-500/20"
                )}>
                  {scam.risk === "High" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  {scam.risk === "Medium" && <AlertCircle className="h-4 w-4 text-amber-500" />}
                  {scam.risk === "Low" && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{scam.type}</p>
                  <p className="text-xs text-muted-foreground">Source: {scam.source}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  scam.risk === "High" && "bg-red-500/15 text-red-600 dark:text-red-400",
                  scam.risk === "Medium" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                  scam.risk === "Low" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                )}>
                  {scam.risk}
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">{scam.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}