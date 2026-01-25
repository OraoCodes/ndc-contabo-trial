"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRequesting, setIsRequesting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")
    
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { toast } = useToast()
    
    // Check if we're in "reset mode" (user clicked link from email)
    // Supabase uses hash fragments (#) for auth callbacks, so check both URL hash and query params
    const checkResetMode = () => {
        const hash = window.location.hash
        const hasHashToken = hash.includes('type=recovery') || hash.includes('access_token')
        const hasQueryToken = searchParams.get('type') === 'recovery' || 
                             searchParams.has('access_token') || 
                             searchParams.has('token')
        return hasHashToken || hasQueryToken
    }

    const [isResetMode, setIsResetMode] = useState(checkResetMode())

    useEffect(() => {
        // Re-check reset mode when URL changes
        setIsResetMode(checkResetMode())
        
        // If we have a recovery token, verify the session is valid
        if (isResetMode) {
            // Supabase automatically handles the token exchange from hash fragments
            // We just need to verify the session is valid after a short delay
            setTimeout(() => {
                supabase.auth.getSession().then(({ data: { session }, error }) => {
                    if (error || !session) {
                        setError("Invalid or expired reset link. Please request a new password reset.")
                    }
                })
            }, 500) // Small delay to allow Supabase to process the hash
        }
    }, [searchParams, isResetMode])

    // Handle password reset request (step 1: request reset email)
    const handleRequestReset = async (e) => {
        e.preventDefault()
        setError("")
        setIsRequesting(true)

        if (!email) {
            setError("Please enter your email address")
            setIsRequesting(false)
            return
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(
                email.toLowerCase().trim(),
                {
                    redirectTo: `${window.location.origin}/reset-password?type=recovery`,
                }
            )

            if (error) {
                // Don't reveal if email exists or not for security
                setError("If an account exists with this email, a password reset link has been sent.")
                console.error("Password reset error:", error)
            } else {
                setIsSuccess(true)
                toast({
                    title: "Reset link sent",
                    description: "Check your email for the password reset link.",
                })
            }
        } catch (err) {
            console.error("Password reset request error:", err)
            setError("An error occurred. Please try again later.")
        } finally {
            setIsRequesting(false)
        }
    }

    // Handle actual password reset (step 2: set new password)
    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError("")

        if (!password || !confirmPassword) {
            setError("Please fill in all fields")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsSubmitting(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                setError(error.message || "Failed to reset password. Please try again.")
                console.error("Password reset error:", error)
            } else {
                toast({
                    title: "Password reset successful",
                    description: "Your password has been updated. You can now log in.",
                })
                
                // Redirect to login after a short delay
                setTimeout(() => {
                    navigate("/login")
                }, 2000)
            }
        } catch (err) {
            console.error("Password reset error:", err)
            setError("An error occurred. Please try again later.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // If in reset mode, show password reset form
    if (isResetMode) {
        return (
            <AuthLayout
                title="Set New Password"
                description="Enter your new password below"
            >
                <form onSubmit={handleResetPassword} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                            New Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isSubmitting}
                            minLength={8}
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                            Confirm Password
                        </label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isSubmitting}
                            minLength={8}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-md font-medium"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resetting Password...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Back to Login
                        </Link>
                    </div>
                </form>
            </AuthLayout>
        )
    }

    // Default: show email request form
    return (
        <AuthLayout
            title="Reset Password"
            description="Enter your email below. If your email is in the system, a password reset link will be sent to your email."
        >
            {isSuccess ? (
                <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Check your email
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                            Click the link in the email to reset your password. The link will expire in 1 hour.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Button
                            onClick={() => {
                                setIsSuccess(false)
                                setEmail("")
                            }}
                            variant="outline"
                            className="w-full"
                        >
                            Send another email
                        </Button>
                        <Link
                            to="/login"
                            className="block text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleRequestReset} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

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
                            disabled={isRequesting}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-md font-medium"
                        disabled={isRequesting}
                    >
                        {isRequesting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </AuthLayout>
    )
}
