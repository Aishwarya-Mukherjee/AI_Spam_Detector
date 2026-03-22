"use client"

import { useState } from "react"
import { Shield, Briefcase, FileText, BarChart3 } from "lucide-react"
import { ScamAnalyzer } from "@/components/scam-analyzer"
import { RiskSummary } from "@/components/risk-summary"
import { cn } from "@/lib/utils"

type Tab = "job" | "terms" | "summary"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("job")

  const tabs = [
    { id: "job" as const, label: "Job / Internship Analyzer", icon: Briefcase },
    { id: "terms" as const, label: "Terms & Conditions", icon: FileText },
    { id: "summary" as const, label: "Risk Summary", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Scam Ecosystem Analyzer</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Protection</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">System Active</span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === "job" && "Jobs"}
                    {tab.id === "terms" && "Terms"}
                    {tab.id === "summary" && "Summary"}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {activeTab === "job" && (
          <ScamAnalyzer
            title="Job & Internship Scam Detection"
            placeholder="Paste the job description or internship posting here... Include details like company name, requirements, salary information, and any communication you've received."
          />
        )}
        {activeTab === "terms" && (
          <ScamAnalyzer
            title="Terms & Conditions Analysis"
            placeholder="Paste the terms and conditions, privacy policy, or contract text here... The AI will analyze for hidden clauses, unfair terms, and potential red flags."
          />
        )}
        {activeTab === "summary" && <RiskSummary />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card py-6">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Scam Ecosystem Analyzer uses AI to help identify potential scams.
            <br />
            <span className="text-xs">Always verify information independently before making decisions.</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
