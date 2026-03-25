"use client"

import { useState } from "react"
import { Shield, Briefcase, FileText, BarChart3, Cpu, ImageIcon, Mail } from "lucide-react"
import { ScamAnalyzer } from "@/components/scam-analyzer"
import { RiskSummary } from "@/components/risk-summary"
import { EmailAnalyzer } from "@/components/email-analyzer"
import { ScreenshotAnalyzer } from "@/components/screenshot-analyzer"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

type Tab = "job" | "terms" | "screenshot" | "email" | "summary"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("job")

  const tabs = [
    { id: "job" as const, label: "Job / Internship", shortLabel: "Jobs", icon: Briefcase },
    { id: "terms" as const, label: "T&C Analyzer", shortLabel: "T&C", icon: FileText },
    { id: "screenshot" as const, label: "Screenshot", shortLabel: "Image", icon: ImageIcon },
    { id: "email" as const, label: "Email / Text", shortLabel: "Email", icon: Mail },
    { id: "summary" as const, label: "Risk Summary", shortLabel: "Stats", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-xl bg-primary/10 blur-md" />
              <div className="relative rounded-xl bg-primary/5 p-2.5 ring-1 ring-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Scam Ecosystem Analyzer
              </h1>
              <p className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Cpu className="h-3 w-3" />
                Pattern-based risk intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:px-4 sm:py-2.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="animate-in fade-in duration-300">
          {activeTab === "job" && (
            <ScamAnalyzer
              title="Job & Internship Scam Detection"
              placeholder="Paste the job description or internship posting here... Include details like company name, requirements, salary information, and any communication you've received."
            />
          )}
          {activeTab === "terms" && (
            <ScamAnalyzer
              title="Terms & Conditions Analysis"
              placeholder="Paste the terms and conditions, privacy policy, or contract text here... The analyzer will scan for hidden clauses, unfair terms, and potential red flags."
            />
          )}
          {activeTab === "screenshot" && <ScreenshotAnalyzer />}
          {activeTab === "email" && <EmailAnalyzer />}
          {activeTab === "summary" && <RiskSummary />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/20 py-6 mt-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Scam Ecosystem Analyzer</span>
            </div>
            <p className="max-w-md text-xs text-muted-foreground">
              Pattern-based threat detection. Always verify information independently before making decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}