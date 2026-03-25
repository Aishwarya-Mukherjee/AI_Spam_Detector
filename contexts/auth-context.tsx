"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface AuthUser {
  name: string
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  isSignedUp: boolean
  signUp: (name: string, email: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Password validation helper function
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("At least 8 characters")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("At least one number")
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("At least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const signUp = (name: string, email: string, password: string) => {
    // Basic validation
    if (!name || !email || !password) {
      throw new Error("All fields are required")
    }
    if (!email.includes("@")) {
      throw new Error("Valid email is required")
    }
    
    // Password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      throw new Error(`Password requirements: ${passwordValidation.errors.join(", ")}`)
    }

    // Sign up the user
    setUser({ name, email })
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isSignedUp: user !== null, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
