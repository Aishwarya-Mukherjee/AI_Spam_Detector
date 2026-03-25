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
    { id: "job" as const, label: "Job / Internship", icon: Briefcase },
    { id: "terms" as const, label: "T&C Analyzer", icon: FileText },
    { id: "screenshot" as const, label: "Screenshot", icon: ImageIcon },
    { id: "email" as const, label: "Email / Text", icon: Mail },
    { id: "summary" as const, label: "Risk Summary", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Background grid pattern */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-xl bg-primary/20 blur-md" />
              <div className="relative rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2.5 ring-1 ring-primary/30">
                <Shield className="h-7 w-7 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                FraudX
              </h1>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                <Cpu className="h-3 w-3" />
                AI-powered risk intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 sm:flex">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-emerald-400">System Active</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="relative border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive && "drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]")} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === "job" && "Jobs"}
                    {tab.id === "terms" && "T&C"}
                    {tab.id === "screenshot" && "Image"}
                    {tab.id === "email" && "Text"}
                    {tab.id === "summary" && "Stats"}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
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
              placeholder="Paste the terms and conditions, privacy policy, or contract text here... The AI will analyze for hidden clauses, unfair terms, and potential red flags."
            />
          )}
          {activeTab === "screenshot" && <ScreenshotAnalyzer />}
          {activeTab === "email" && <EmailAnalyzer />}
          {activeTab === "summary" && <RiskSummary />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-auto border-t border-border/50 bg-card/30 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">FraudX</span>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              AI-powered threat detection to protect you from scams. 
              Always verify information independently before making decisions.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Built for cybersecurity professionals and everyday users
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
