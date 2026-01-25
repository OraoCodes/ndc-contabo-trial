"use client"

import React, { useState } from "react"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await login(email, password)

      // Wait a moment for user state to be set in AuthContext
      await new Promise(resolve => setTimeout(resolve, 200))

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      })

      navigate("/dashboard")
    } catch (error: any) {
      console.error("Login failed:", error)
      toast({
        title: "Login Failed",
        description: error?.message || "Invalid email or password.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Login"
      description="Please log in to your account to add data to the NDC tool"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          size="sm"
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 space-y-4 text-center">
        <Link
          to="/reset-password"
          className="block text-sm text-gray-900 font-medium underline hover:no-underline"
        >
          Forgot password?
        </Link>

        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-gray-900 underline hover:no-underline transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
