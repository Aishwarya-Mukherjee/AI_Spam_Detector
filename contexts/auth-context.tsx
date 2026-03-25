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
  signIn: (email: string, password: string) => void
  isEmailRegistered: (email: string) => boolean
  logout: () => void
}

class EmailAlreadyRegisteredException extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EmailAlreadyRegisteredException"
  }
}

class InvalidCredentialsException extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidCredentialsException"
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Store registered emails (in a real app, this would be a database)
let registeredEmails: Map<string, string> = new Map()

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

  const isEmailRegistered = (email: string): boolean => {
    return registeredEmails.has(email.toLowerCase())
  }

  const signUp = (name: string, email: string, password: string) => {
    // Basic validation
    if (!name || !email || !password) {
      throw new Error("All fields are required")
    }
    if (!email.includes("@")) {
      throw new Error("Valid email is required")
    }

    // Check if email already exists
    if (isEmailRegistered(email)) {
      throw new EmailAlreadyRegisteredException("This email is already registered. Please sign in instead.")
    }
    
    // Password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      throw new Error(`Password requirements: ${passwordValidation.errors.join(", ")}`)
    }

    // Register the email and password
    registeredEmails.set(email.toLowerCase(), password)

    // Sign up the user
    setUser({ name, email })
  }

  const signIn = (email: string, password: string) => {
    // Basic validation
    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    // Check if email exists
    if (!isEmailRegistered(email)) {
      throw new InvalidCredentialsException("Email not found. Please sign up instead.")
    }

    // Check password
    const storedPassword = registeredEmails.get(email.toLowerCase())
    if (storedPassword !== password) {
      throw new InvalidCredentialsException("Invalid password. Please try again.")
    }

    // Sign in the user (we don't have the name, so we'll use email)
    setUser({ name: email.split("@")[0], email })
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isSignedUp: user !== null, signUp, signIn, isEmailRegistered, logout }}>
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

export { EmailAlreadyRegisteredException, InvalidCredentialsException }
