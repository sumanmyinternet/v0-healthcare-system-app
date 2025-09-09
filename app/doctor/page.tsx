import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, FileText, Clock, Stethoscope, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function DoctorDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is doctor
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "doctor") {
    redirect("/auth/login")
  }

  // Fetch doctor's statistics
  const [
    { count: totalAppointments },
    { count: todayAppointments },
    { count: totalPatients },
    { count: activePrescriptions },
    { data: recentAppointments },
    { data: specialization },
  ] = await Promise.all([
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("doctor_id", user.id),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .eq("appointment_date", new Date().toISOString().split("T")[0]),
    supabase
      .from("appointments")
      .select("patient_id", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .not("patient_id", "is", null),
    supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .eq("status", "active"),
    supabase
      .from("appointments")
      .select(`
        *,
        profiles!appointments_patient_id_fkey (full_name, email)
      `)
      .eq("doctor_id", user.id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })
      .limit(5),
    supabase.from("doctor_specializations").select("*").eq("doctor_id", user.id).single(),
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600">Welcome back, Dr. {profile.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Stethoscope className="h-3 w-3 mr-1" />
                {specialization?.specialization || "General Practice"}
              </Badge>
              <Button asChild>
                <Link href="/doctor/appointments/new">New Appointment</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">All time consultations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatients || 0}</div>
              <p className="text-xs text-muted-foreground">Unique patients treated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePrescriptions || 0}</div>
              <p className="text-xs text-muted-foreground">Current medications</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/doctor/appointments"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">View Appointments</span>
                </Link>
                <Link
                  href="/doctor/patients"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Users className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">My Patients</span>
                </Link>
                <Link
                  href="/doctor/prescriptions"
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <FileText className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Prescriptions</span>
                </Link>
                <Link
                  href="/doctor/schedule"
                  className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Clock className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="font-medium text-orange-900">My Schedule</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
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
                        <div className="font-medium">{appointment.profiles?.full_name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                          {appointment.appointment_time}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </div>
                )) || <p className="text-sm text-gray-500 text-center py-4">No upcoming appointments</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Profile Summary */}
        {specialization && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
              <CardDescription>Your specialization and practice details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center">
                  <Stethoscope className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <div className="font-medium">Specialization</div>
                    <div className="text-sm text-gray-600">{specialization.specialization}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <div className="font-medium">Experience</div>
                    <div className="text-sm text-gray-600">{specialization.years_of_experience} years</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-purple-500 mr-3" />
                  <div>
                    <div className="font-medium">License</div>
                    <div className="text-sm text-gray-600">{specialization.license_number}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 font-bold text-lg mr-3">$</span>
                  <div>
                    <div className="font-medium">Consultation Fee</div>
                    <div className="text-sm text-gray-600">${specialization.consultation_fee}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
