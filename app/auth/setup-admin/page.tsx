"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function SetupAdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const setupAdmin = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email: "suman.myinternet@gmail.com",
        password: "Admincdpr##",
        options: {
          data: {
            full_name: "System Administrator",
            role: "admin",
          },
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          setMessage("Admin user already exists. You can now login with suman.myinternet@gmail.com / Admincdpr##")
          setIsSuccess(true)
        } else {
          throw error
        }
      } else {
        setMessage(
          "Admin user created successfully! You can now login directly with suman.myinternet@gmail.com / Admincdpr##",
        )
        setIsSuccess(true)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Setup Admin Account</CardTitle>
          <CardDescription>Create the default administrator account for CDPR Health Care System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Default Admin Credentials:</h3>
            <p className="text-sm text-gray-600">Email: suman.myinternet@gmail.com</p>
            <p className="text-sm text-gray-600">Password: Admincdpr##</p>
          </div>

          {message && (
            <Alert className={isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {isSuccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={isSuccess ? "text-green-700" : "text-red-700"}>{message}</AlertDescription>
            </Alert>
          )}

          <Button onClick={setupAdmin} disabled={isLoading} className="w-full">
            {isLoading ? "Creating Admin Account..." : "Create Admin Account"}
          </Button>

          <div className="text-center">
            <a href="/auth/login" className="text-sm text-blue-600 hover:text-blue-800 underline">
              Go to Login Page
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
