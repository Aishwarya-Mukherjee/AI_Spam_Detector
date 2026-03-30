"use client"

import { useState } from "react"
import {
  Shield, Briefcase, FileText, BarChart3, ImageIcon, Mail,
  Globe, Zap, ChevronRight, Cpu, Menu, X
} from "lucide-react"
import { ScamAnalyzer } from "@/components/scam-analyzer"
import { RiskSummary } from "@/components/risk-summary"
import { EmailAnalyzer } from "@/components/email-analyzer"
import { ScreenshotAnalyzer } from "@/components/screenshot-analyzer"
import { URLScanner } from "@/components/url-scanner"
import { ThreatIntelDashboard } from "@/components/threat-intel-dashboard"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type Tab = "job" | "terms" | "screenshot" | "email" | "url" | "intel" | "summary"

const tabs = [
  { id: "job" as const, label: "Job Scam Detector", icon: Briefcase, group: "Analysis" },
  { id: "terms" as const, label: "T&C Analyzer", icon: FileText, group: "Analysis" },
  { id: "screenshot" as const, label: "Screenshot Analysis", icon: ImageIcon, group: "Analysis" },
  { id: "email" as const, label: "Email Inspector", icon: Mail, group: "Analysis" },
  { id: "url" as const, label: "URL Scanner", icon: Globe, group: "Intelligence" },
  { id: "intel" as const, label: "Threat Intel Feed", icon: Zap, group: "Intelligence" },
  { id: "summary" as const, label: "Risk Summary", icon: BarChart3, group: "Intelligence" },
]

const tabGroups = ["Analysis", "Intelligence"]

const pageTitles: Record<Tab, { title: string; subtitle: string }> = {
  job: { title: "Job Scam Detector", subtitle: "AI-powered analysis of job and internship postings" },
  terms: { title: "T&C Analyzer", subtitle: "Detect hidden clauses and risky terms in contracts" },
  screenshot: { title: "Screenshot Analysis", subtitle: "Multimodal AI reads and analyzes image content" },
  email: { title: "Email Inspector", subtitle: "Identify phishing and social engineering in emails" },
  url: { title: "URL / Domain Scanner", subtitle: "Detect phishing, spoofing, and malicious domains" },
  intel: { title: "Threat Intelligence Feed", subtitle: "Live global scam and fraud campaign monitoring" },
  summary: { title: "Risk Summary", subtitle: "Aggregated threat metrics and detection history" },
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("job")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()
  const { title, subtitle } = pageTitles[activeTab]

  const SidebarContent = () => (
    <aside className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-xl bg-primary/20 blur-sm" />
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
            <Shield className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold tracking-tight text-foreground">FraudX</p>
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Cpu className="h-2.5 w-2.5" />
            <span>Threat Intelligence Platform</span>
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-3 py-2">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">All Systems Operational</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {tabGroups.map(group => (
          <div key={group}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {group}
            </p>
            <div className="space-y-0.5">
              {tabs.filter(t => t.group === group).map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110", isActive && "scale-110")} />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/60 px-5 py-4">
        <p className="text-[10px] text-muted-foreground/50">
          Powered by <span className="font-medium text-muted-foreground/70">Gemini 2.5 Flash</span>
        </p>
        <p className="text-[10px] text-muted-foreground/40">© 2026 FraudX · AI Threat Intelligence</p>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-grid-dark bg-grid-light">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-60 flex-shrink-0 border-r border-border/60 bg-card/80 backdrop-blur-xl">
          <SidebarContent />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border/60 bg-card shadow-xl">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 border-b border-border/60 bg-card/70 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-6 py-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}

            {/* Breadcrumb */}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>FraudX</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-foreground">{title}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground hidden sm:block">{subtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Gemini badge */}
              <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 sm:flex">
                <Cpu className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">Gemini 2.5 Flash</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-6">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeTab === "job" && (
                <ScamAnalyzer
                  title="Job & Internship Scam Detection"
                  placeholder="Paste the job description or internship posting here... Include details like company name, requirements, salary information, and any communication you've received."
                />
              )}
              {activeTab === "terms" && (
                <ScamAnalyzer
                  title="Terms & Conditions Analysis"
                  placeholder="Paste the terms and conditions, privacy policy, or contract text here... The AI will scan for hidden clauses, unfair terms, and potential red flags."
                />
              )}
              {activeTab === "screenshot" && <ScreenshotAnalyzer />}
              {activeTab === "email" && <EmailAnalyzer />}
              {activeTab === "url" && <URLScanner />}
              {activeTab === "intel" && <ThreatIntelDashboard />}
              {activeTab === "summary" && <RiskSummary />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
