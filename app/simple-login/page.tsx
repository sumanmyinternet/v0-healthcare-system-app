"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimpleLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const supabase = createClient()
      console.log("[v0] Attempting login with:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log("[v0] Login error:", error)
        setMessage(`Error: ${error.message}`)
      } else {
        console.log("[v0] Login successful:", data)
        setMessage("Login successful!")

        // Get user profile
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

        console.log("[v0] User profile:", profile)

        if (profile?.role === "admin") {
          window.location.href = "/admin"
        }
      }
    } catch (err) {
      console.log("[v0] Unexpected error:", err)
      setMessage(`Unexpected error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Simple Login Test</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            {message && (
              <p className={`text-sm ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>{message}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
