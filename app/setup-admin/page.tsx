"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function SetupAdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createAdminUser = async () => {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: "suman.myinternet@gmail.com",
        password: "Admincdpr##",
        options: {
          data: {
            full_name: "System Administrator",
            role: "admin",
          },
        },
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        const { error: confirmError } = await supabase.auth.admin.updateUserById(authData.user.id, {
          email_confirm: true,
        })

        const { error: profileError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          email: "suman.myinternet@gmail.com",
          full_name: "System Administrator",
          role: "admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) throw profileError

        const { error: walletError } = await supabase.from("wallets").insert({
          user_id: authData.user.id,
          balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (walletError) throw walletError

        setMessage("Admin user created successfully! You can now login with: suman.myinternet@gmail.com")
      }
    } catch (error: any) {
      console.log("[v0] Admin creation error:", error)
      setError(error.message || "Failed to create admin user")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-blue-900">Setup Admin User</CardTitle>
            <CardDescription>Create the admin account for CDPR Health Care System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Admin Credentials:</h3>
              <p className="text-sm text-blue-700">Email: suman.myinternet@gmail.com</p>
              <p className="text-sm text-blue-700">Password: Admincdpr##</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm text-green-600">{message}</p>
              </div>
            )}

            <Button onClick={createAdminUser} className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Admin User..." : "Create Admin User"}
            </Button>

            <div className="text-center">
              <a href="/auth/login" className="text-blue-600 hover:underline text-sm">
                Go to Login Page
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
