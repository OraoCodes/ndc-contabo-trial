// client/pages/RegisterPage.jsx
"use client"

import React, { useState } from "react"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router-dom"
import { Check, X, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    organisation: "",
    phoneNumber: "",
    position: "",
    password: "",
    termsAgreed: false,
  })

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length
  const isStrong = strengthScore === 5

  // Fixed: Removed TypeScript annotation since this is .jsx (not .tsx)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))

    if (name === "password") {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!isStrong) {
      setError("Password must meet all strength requirements")
      setLoading(false)
      return
    }

    if (!formData.termsAgreed) {
      setError("You must agree to the terms and conditions")
      setLoading(false)
      return
    }

    try {
      // Use Supabase Auth via AuthContext
      const result = await register(formData)
      
      if (result.requiresEmailConfirmation) {
        // Email confirmation required - show success message
        setError("")
        setLoading(false)
        // Show success message
        alert(`✅ Registration successful!\n\nPlease check your email (${result.email}) to confirm your account.\n\nAfter confirming, you can log in.`)
        // Redirect to login page
        navigate("/login")
      } else {
        // Success! Wait for user profile to be loaded before redirecting
        setError("")
        setLoading(false)
        
        // Wait for user to be loaded in AuthContext (with timeout)
        let attempts = 0
        const maxAttempts = 20 // 2 seconds max wait
        
        while (attempts < maxAttempts) {
          // Check if user is now loaded (this will be updated by AuthContext)
          // We'll check the auth state after a short delay
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
          
          // The user state will be updated by the onAuthStateChange listener
          // We'll just wait a reasonable amount of time for it to propagate
          if (attempts >= 5) { // Wait at least 500ms
            break
          }
        }
        
        // Redirect to dashboard - user should be loaded by now
        navigate("/dashboard")
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create an Account" description="Join the NDC Water & Waste Tracking Platform">
      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
          <Input name="fullName" required onChange={handleChange} value={formData.fullName} placeholder="John Doe" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
          <Input name="email" type="email" required onChange={handleChange} value={formData.email} placeholder="john@example.com" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Organisation</label>
          <Input name="organisation" onChange={handleChange} value={formData.organisation} placeholder="County Government of Nairobi" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
          <Input name="phoneNumber" type="tel" onChange={handleChange} value={formData.phoneNumber} placeholder="+254 712 345 678" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Position</label>
          <Input name="position" onChange={handleChange} value={formData.position} placeholder="Climate Officer" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
          <Input name="password" type="password" required onChange={handleChange} value={formData.password} placeholder="Enter strong password" />

          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-300 ${
                  isStrong ? "bg-green-500" : strengthScore >= 3 ? "bg-yellow-500" : strengthScore >= 1 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${(strengthScore / 5) * 100}%` }}
              />
            </div>

            <ul className="space-y-1 text-xs text-gray-600">
              {[
                { text: "At least 8 characters", check: passwordStrength.length },
                { text: "One uppercase letter", check: passwordStrength.uppercase },
                { text: "One lowercase letter", check: passwordStrength.lowercase },
                { text: "One number", check: passwordStrength.number },
                { text: "One special character (!@#$ etc.)", check: passwordStrength.special },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  {item.check ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                  <span className={item.check ? "text-green-700" : "text-gray-500"}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="termsAgreed"
            required
            onChange={handleChange}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">
            I agree to the <a href="#" className="underline hover:text-blue-600">Terms & Conditions</a>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <Button
          size="default"
          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-6 rounded-md font-medium mt-6"
                    disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
