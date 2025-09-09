import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Get user profile to determine role and redirect accordingly
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role === "admin") {
      redirect("/admin")
    } else if (profile?.role === "doctor") {
      redirect("/doctor")
    } else if (profile?.role === "patient") {
      redirect("/patient")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-900">CDPR Health Care System</CardTitle>
            <CardDescription className="text-lg">
              Comprehensive Digital Patient Records & Healthcare Management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Access your healthcare dashboard with secure authentication</p>
              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
                  <Link href="/auth/sign-up">Create Account</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
