"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CreateAdminPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const createAdmin = async () => {
    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Admin user created successfully!")
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to create admin user")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Network error occurred")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Create Admin User</CardTitle>
          <CardDescription>Set up the default administrator account for CDPR Health Care System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Admin Credentials:</h3>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> suman.myinternet@gmail.com
            </p>
            <p className="text-sm text-gray-600">
              <strong>Password:</strong> Admincdpr##
            </p>
          </div>

          {status === "idle" && (
            <Button onClick={createAdmin} className="w-full">
              Create Admin User
            </Button>
          )}

          {status === "loading" && (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Admin User...
            </Button>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{message}</span>
              </div>
              <Link href="/auth/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{message}</span>
              </div>
              <Button onClick={createAdmin} variant="outline" className="w-full bg-transparent">
                Try Again
              </Button>
            </div>
          )}

          <div className="text-center">
            <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
