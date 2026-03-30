"use client"

import { useState } from "react"
import { Shield, Briefcase, FileText, BarChart3, Cpu, ImageIcon, Mail, Menu, Globe, Zap } from "lucide-react"
import { ScamAnalyzer } from "@/components/scam-analyzer"
import { RiskSummary } from "@/components/risk-summary"
import { EmailAnalyzer } from "@/components/email-analyzer"
import { ScreenshotAnalyzer } from "@/components/screenshot-analyzer"
import { URLScanner } from "@/components/url-scanner"
import { ThreatIntelDashboard } from "@/components/threat-intel-dashboard"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type Tab = "job" | "terms" | "screenshot" | "email" | "url" | "intel" | "summary"

const tabs = [
  {
    id: "job" as const,
    label: "Job Scam Detector",
    shortLabel: "Job",
    icon: Briefcase,
  },
  {
    id: "terms" as const,
    label: "T&C Analyzer",
    shortLabel: "T&C",
    icon: FileText,
  },
  {
    id: "screenshot" as const,
    label: "Screenshot Analysis",
    shortLabel: "Screenshot",
    icon: ImageIcon,
  },
  {
    id: "email" as const,
    label: "Email Inspector",
    shortLabel: "Email",
    icon: Mail,
  },
  {
    id: "url" as const,
    label: "URL Scanner",
    shortLabel: "URL",
    icon: Globe,
  },
  {
    id: "intel" as const,
    label: "Threat Intel",
    shortLabel: "Intel",
    icon: Zap,
  },
  {
    id: "summary" as const,
    label: "Risk Summary",
    shortLabel: "Summary",
    icon: BarChart3,
  },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("job")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="flex h-screen flex-col bg-background">
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
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                FraudX
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
            {isMobile && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs">
                  <div className="flex flex-col gap-4 pt-6">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      const isActive = activeTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id)
                            setMobileMenuOpen(false)
                          }}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      {!isMobile && (
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
      )}

      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 w-full flex-1">
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
          {activeTab === "url" && <URLScanner />}
          {activeTab === "intel" && <ThreatIntelDashboard />}
          {activeTab === "summary" && <RiskSummary />}
        </div>
      </main>

      <footer className="border-t border-border/50 bg-card/20 py-6 mt-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">FraudX</span>
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
