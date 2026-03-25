"use client"

import { useState } from "react"
import { Shield, Briefcase, FileText, BarChart3, Cpu, ImageIcon, Mail, Menu, Lock, Mail as MailIcon, User } from "lucide-react"
import { ScamAnalyzer } from "@/components/scam-analyzer"
import { RiskSummary } from "@/components/risk-summary"
import { EmailAnalyzer } from "@/components/email-analyzer"
import { ScreenshotAnalyzer } from "@/components/screenshot-analyzer"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

type Tab = "job" | "terms" | "screenshot" | "email" | "summary"

function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const { signUp } = useAuth()
  const isMobile = useIsMobile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      signUp(formData.name, formData.email, formData.password)
      setFormData({ name: "", email: "", password: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-xl bg-primary/10 blur-md" />
              <div className="relative rounded-xl bg-primary/5 p-3 ring-1 ring-primary/20">
                <Shield className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">FraudX</h1>
          <p className="text-muted-foreground">
            AI-powered risk intelligence for job postings, T&Cs, emails, and more
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Get Started</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10"
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-primary" />
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-10"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-10"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 text-base font-semibold"
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            By signing up, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}

function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("job")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const isMobile = useIsMobile()

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
                    <div className="mt-4 border-t border-border/50 pt-4">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
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

export default function Home() {
  const { isSignedUp } = useAuth()

  return isSignedUp ? <DashboardPage /> : <SignUpPage />
}
