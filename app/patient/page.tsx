import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, FileText, Wallet, Heart, Clock, Plus } from "lucide-react"
import Link from "next/link"

export default async function PatientDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is patient
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "patient") {
    redirect("/auth/login")
  }

  // Fetch patient's statistics
  const [
    { count: totalAppointments },
    { count: upcomingAppointments },
    { count: familyMembers },
    { count: activePrescriptions },
    { data: recentAppointments },
    { data: wallet },
  ] = await Promise.all([
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("patient_id", user.id),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .eq("status", "scheduled")
      .gte("appointment_date", new Date().toISOString().split("T")[0]),
    supabase.from("family_members").select("*", { count: "exact", head: true }).eq("patient_id", user.id),
    supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .eq("status", "active"),
    supabase
      .from("appointments")
      .select(`
        *,
        profiles!appointments_doctor_id_fkey (full_name),
        doctor_specializations!inner (specialization)
      `)
      .eq("patient_id", user.id)
      .eq("status", "scheduled")
      .gte("appointment_date", new Date().toISOString().split("T")[0])
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })
      .limit(3),
    supabase.from("wallets").select("*").eq("user_id", user.id).single(),
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Health Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Heart className="h-3 w-3 mr-1" />
                Patient
              </Badge>
              <Button asChild>
                <Link href="/patient/appointments/book">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">Scheduled consultations</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Family Members</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{familyMembers || 0}</div>
              <p className="text-xs text-muted-foreground">Under your care</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{activePrescriptions || 0}</div>
              <p className="text-xs text-muted-foreground">Current medications</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${Number.parseFloat(wallet?.balance || "0").toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Available funds</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/patient/appointments"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">My Appointments</span>
                </Link>
                <Link
                  href="/patient/family"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Users className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">Family Members</span>
                </Link>
                <Link
                  href="/patient/prescriptions"
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <FileText className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Prescriptions</span>
                </Link>
                <Link
                  href="/patient/wallet"
                  className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Wallet className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="font-medium text-orange-900">Wallet & Billing</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your next scheduled consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAppointments?.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                      <div>
                        <div className="font-medium">Dr. {appointment.profiles?.full_name}</div>
                        <div className="text-sm text-gray-500">
                          {appointment.doctor_specializations?.specialization}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                          {appointment.appointment_time}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </div>
                )) || <p className="text-sm text-gray-500 text-center py-4">No upcoming appointments</p>}
              </div>
              {recentAppointments && recentAppointments.length > 0 && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/patient/appointments">View All Appointments</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Health Summary */}
        <Card className="mt-6 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Health Summary</CardTitle>
            <CardDescription>Overview of your healthcare journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalAppointments || 0}</div>
                <div className="text-sm text-blue-700">Total Consultations</div>
                <div className="text-xs text-gray-500 mt-1">All time</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{familyMembers || 0}</div>
                <div className="text-sm text-green-700">Family Members</div>
                <div className="text-xs text-gray-500 mt-1">Under your account</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{activePrescriptions || 0}</div>
                <div className="text-sm text-purple-700">Active Medications</div>
                <div className="text-xs text-gray-500 mt-1">Currently prescribed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
