import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, Clock, User, Phone, Plus } from "lucide-react"
import Link from "next/link"

export default async function DoctorAppointments() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is doctor
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "doctor") {
    redirect("/auth/login")
  }

  // Fetch doctor's appointments
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      profiles!appointments_patient_id_fkey (full_name, email, phone),
      family_members (name, relationship)
    `)
    .eq("doctor_id", user.id)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no_show":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-4">
                <Link href="/doctor">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-gray-600">Manage your scheduled consultations</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/doctor/appointments/new">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Schedule</CardTitle>
            <CardDescription>All your scheduled and completed consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments?.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            {appointment.profiles?.full_name}
                            {appointment.family_members && (
                              <span className="text-sm text-gray-500 ml-2">
                                (for {appointment.family_members.name})
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {appointment.profiles?.phone || "No phone"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-green-500" />
                          <div>
                            <div className="font-medium">
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.appointment_time}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.duration_minutes} min</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          ${Number.parseFloat(appointment.consultation_fee || "0").toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{appointment.notes || "No notes"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          {appointment.status === "scheduled" && (
                            <Button variant="outline" size="sm">
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No appointments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
