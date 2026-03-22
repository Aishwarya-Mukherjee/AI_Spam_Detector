"use client"

import { AlertTriangle, AlertCircle, CheckCircle, Activity, TrendingUp } from "lucide-react"

const summaryData = {
  totalAnalyses: 247,
  highRisk: 42,
  mediumRisk: 78,
  lowRisk: 127,
  recentScams: [
    { type: "Job Scam", date: "Today", risk: "High" },
    { type: "Internship Scam", date: "Yesterday", risk: "High" },
    { type: "Potential Phishing", date: "2 days ago", risk: "Medium" },
    { type: "Unknown", date: "3 days ago", risk: "Low" },
  ],
}

export function RiskSummary() {
  const highPercent = Math.round((summaryData.highRisk / summaryData.totalAnalyses) * 100)
  const mediumPercent = Math.round((summaryData.mediumRisk / summaryData.totalAnalyses) * 100)
  const lowPercent = Math.round((summaryData.lowRisk / summaryData.totalAnalyses) * 100)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Analyses</p>
              <p className="text-2xl font-bold text-foreground">{summaryData.totalAnalyses}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Risk</p>
              <p className="text-2xl font-bold text-red-400">{summaryData.highRisk}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medium Risk</p>
              <p className="text-2xl font-bold text-amber-400">{summaryData.mediumRisk}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Risk</p>
              <p className="text-2xl font-bold text-emerald-400">{summaryData.lowRisk}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Risk Distribution</h3>
        </div>

        <div className="space-y-4">
          {/* High Risk Bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">High Risk</span>
              <span className="font-medium text-red-400">{highPercent}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700"
                style={{ width: `${highPercent}%` }}
              />
            </div>
          </div>

          {/* Medium Risk Bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Medium Risk</span>
              <span className="font-medium text-amber-400">{mediumPercent}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                style={{ width: `${mediumPercent}%` }}
              />
            </div>
          </div>

          {/* Low Risk Bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Low Risk</span>
              <span className="font-medium text-emerald-400">{lowPercent}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${lowPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Recent Detections</h3>
        <div className="space-y-3">
          {summaryData.recentScams.map((scam, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
            >
              <div className="flex items-center gap-3">
                {scam.risk === "High" && <AlertTriangle className="h-4 w-4 text-red-400" />}
                {scam.risk === "Medium" && <AlertCircle className="h-4 w-4 text-amber-400" />}
                {scam.risk === "Low" && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                <span className="text-sm text-foreground">{scam.type}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    scam.risk === "High"
                      ? "bg-red-500/20 text-red-400"
                      : scam.risk === "Medium"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
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
