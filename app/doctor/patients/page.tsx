import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, User, Calendar, FileText, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default async function DoctorPatients() {
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

  // Fetch patients who have appointments with this doctor
  const { data: patients } = await supabase
    .from("appointments")
    .select(`
      profiles!appointments_patient_id_fkey (
        id,
        full_name,
        email,
        phone,
        date_of_birth,
        gender,
        created_at
      ),
      appointment_date,
      status
    `)
    .eq("doctor_id", user.id)
    .order("appointment_date", { ascending: false })

  // Group by patient to avoid duplicates
  const uniquePatients =
    patients?.reduce(
      (acc, appointment) => {
        const patientId = appointment.profiles?.id
        if (patientId && !acc.find((p) => p.profiles?.id === patientId)) {
          acc.push(appointment)
        }
        return acc
      },
      [] as typeof patients,
    ) || []

  // Get prescription counts for each patient
  const patientsWithCounts = await Promise.all(
    uniquePatients.map(async (patient) => {
      const [{ count: appointmentCount }, { count: prescriptionCount }] = await Promise.all([
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("doctor_id", user.id)
          .eq("patient_id", patient.profiles?.id),
        supabase
          .from("prescriptions")
          .select("*", { count: "exact", head: true })
          .eq("doctor_id", user.id)
          .eq("patient_id", patient.profiles?.id),
      ])

      return {
        ...patient,
        appointmentCount: appointmentCount || 0,
        prescriptionCount: prescriptionCount || 0,
      }
    }),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/doctor">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
              <p className="text-gray-600">Patients under your care</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>Patients who have consulted with you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Appointments</TableHead>
                    <TableHead>Prescriptions</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientsWithCounts?.map((patient) => {
                    const age = patient.profiles?.date_of_birth
                      ? new Date().getFullYear() - new Date(patient.profiles.date_of_birth).getFullYear()
                      : null

                    return (
                      <TableRow key={patient.profiles?.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            <div>
                              <div className="font-medium">{patient.profiles?.full_name}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {patient.profiles?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{age ? `${age} years` : "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.profiles?.gender || "Not specified"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-green-500" />
                            {patient.profiles?.phone || "No phone"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                            {patient.appointmentCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-orange-500" />
                            {patient.prescriptionCount}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(patient.appointment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View History
                            </Button>
                            <Button variant="outline" size="sm">
                              New Prescription
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  }) || (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No patients found
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
