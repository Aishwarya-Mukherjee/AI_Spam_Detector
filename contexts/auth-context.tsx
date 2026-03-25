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
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters")
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error("Password must contain at least one uppercase letter")
    }
    if (!/[0-9]/.test(password)) {
      throw new Error("Password must contain at least one number")
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
