import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, User, Calendar, Plus, Pill } from "lucide-react"
import Link from "next/link"

export default async function DoctorPrescriptions() {
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

  // Fetch doctor's prescriptions
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select(`
      *,
      profiles!prescriptions_patient_id_fkey (full_name, email),
      family_members (name, relationship),
      appointments (appointment_date)
    `)
    .eq("doctor_id", user.id)
    .order("prescribed_date", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
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
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-4">
                <Link href="/doctor">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
                <p className="text-gray-600">Manage patient medications</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/doctor/prescriptions/new">
                <Plus className="h-4 w-4 mr-2" />
                New Prescription
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Prescriptions</CardTitle>
            <CardDescription>Medications prescribed to your patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage & Frequency</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prescribed Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions?.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          <div>
                            <div className="font-medium">{prescription.profiles?.full_name}</div>
                            {prescription.family_members && (
                              <div className="text-sm text-gray-500">
                                for {prescription.family_members.name} ({prescription.family_members.relationship})
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Pill className="h-4 w-4 mr-2 text-green-500" />
                          <div>
                            <div className="font-medium">{prescription.medication_name}</div>
                            <div className="text-sm text-gray-500">{prescription.dosage}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{prescription.frequency}</div>
                          <div className="text-sm text-gray-500">Frequency</div>
                        </div>
                      </TableCell>
                      <TableCell>{prescription.duration}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                          {new Date(prescription.prescribed_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          {prescription.status === "active" && (
                            <Button variant="outline" size="sm">
                              Update
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No prescriptions found
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
