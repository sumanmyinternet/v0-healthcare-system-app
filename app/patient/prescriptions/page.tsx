import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Pill, User, Calendar, Stethoscope } from "lucide-react"
import Link from "next/link"

export default async function PatientPrescriptions() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is patient
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "patient") {
    redirect("/auth/login")
  }

  // Fetch patient's prescriptions
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select(`
      *,
      profiles!prescriptions_doctor_id_fkey (full_name),
      doctor_specializations!inner (specialization),
      family_members (name, relationship)
    `)
    .eq("patient_id", user.id)
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

  const activePrescriptions = prescriptions?.filter((p) => p.status === "active") || []
  const completedPrescriptions = prescriptions?.filter((p) => p.status === "completed") || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/patient">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
              <p className="text-gray-600">Track your medications and treatment plans</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Prescription Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activePrescriptions.length}</div>
              <p className="text-xs text-muted-foreground">Currently taking</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Treatments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{completedPrescriptions.length}</div>
              <p className="text-xs text-muted-foreground">Finished courses</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
              <User className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{prescriptions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Prescriptions */}
        {activePrescriptions.length > 0 && (
          <Card className="mb-6 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-green-700">Active Medications</CardTitle>
              <CardDescription>Medications you are currently taking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Prescribed By</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Dosage & Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Prescribed Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activePrescriptions.map((prescription) => (
                      <TableRow key={prescription.id}>
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
                          <div className="flex items-center">
                            <Stethoscope className="h-4 w-4 mr-2 text-blue-500" />
                            <div>
                              <div className="font-medium">Dr. {prescription.profiles?.full_name}</div>
                              <div className="text-sm text-gray-500">
                                {prescription.doctor_specializations?.specialization}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {prescription.family_members ? prescription.family_members.name : "Self"}
                            </div>
                            {prescription.family_members && (
                              <div className="text-sm text-gray-500">({prescription.family_members.relationship})</div>
                            )}
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
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                            {new Date(prescription.prescribed_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Prescriptions */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Prescription History</CardTitle>
            <CardDescription>Complete record of all your medications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Prescribed By</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Dosage & Frequency</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Prescribed Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions?.map((prescription) => (
                    <TableRow key={prescription.id}>
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
                        <div className="flex items-center">
                          <Stethoscope className="h-4 w-4 mr-2 text-blue-500" />
                          <div>
                            <div className="font-medium">Dr. {prescription.profiles?.full_name}</div>
                            <div className="text-sm text-gray-500">
                              {prescription.doctor_specializations?.specialization}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {prescription.family_members ? prescription.family_members.name : "Self"}
                          </div>
                          {prescription.family_members && (
                            <div className="text-sm text-gray-500">({prescription.family_members.relationship})</div>
                          )}
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
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                          {new Date(prescription.prescribed_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No prescriptions found. Visit a doctor to get your first prescription!
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
