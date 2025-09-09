import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, User, Calendar, Users, FileText } from "lucide-react"
import Link from "next/link"

export default async function PatientsManagement() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/auth/login")
  }

  // Fetch all patients with their family members count and recent appointments
  const { data: patients } = await supabase
    .from("profiles")
    .select(`
      *,
      family_members (count),
      appointments (count),
      prescriptions (count)
    `)
    .eq("role", "patient")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
              <p className="text-gray-600">Manage patient records and healthcare data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Registered Patients</CardTitle>
            <CardDescription>Patient records and healthcare information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Family Members</TableHead>
                    <TableHead>Appointments</TableHead>
                    <TableHead>Prescriptions</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients?.map((patient) => {
                    const age = patient.date_of_birth
                      ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
                      : null

                    return (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center">
                              <User className="h-4 w-4 mr-2 text-blue-500" />
                              {patient.full_name}
                            </div>
                            <div className="text-sm text-gray-500">{patient.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{age ? `${age} years` : "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.gender || "Not specified"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-purple-500" />
                            {patient.family_members?.[0]?.count || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-green-500" />
                            {patient.appointments?.[0]?.count || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-orange-500" />
                            {patient.prescriptions?.[0]?.count || 0}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Records
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit Profile
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
