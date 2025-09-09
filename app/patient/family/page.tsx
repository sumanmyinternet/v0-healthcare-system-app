import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, Plus, User, Phone, Calendar, Heart } from "lucide-react"
import Link from "next/link"

export default async function PatientFamily() {
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

  // Fetch family members
  const { data: familyMembers } = await supabase
    .from("family_members")
    .select("*")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false })

  // Get appointment counts for each family member
  const familyMembersWithCounts = await Promise.all(
    (familyMembers || []).map(async (member) => {
      const { count: appointmentCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("family_member_id", member.id)

      return {
        ...member,
        appointmentCount: appointmentCount || 0,
      }
    }),
  )

  const getRelationshipColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case "spouse":
      case "husband":
      case "wife":
        return "bg-pink-100 text-pink-800"
      case "child":
      case "son":
      case "daughter":
        return "bg-blue-100 text-blue-800"
      case "parent":
      case "father":
      case "mother":
        return "bg-green-100 text-green-800"
      case "sibling":
      case "brother":
      case "sister":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-4">
                <Link href="/patient">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
                <p className="text-gray-600">Manage healthcare for your family</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/patient/family/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Family Member
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Family Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Family Members</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{familyMembers?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Under your account</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {familyMembersWithCounts.reduce((sum, member) => sum + member.appointmentCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">For family members</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Healthcare Coverage</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{(familyMembers?.length || 0) + 1}</div>
              <p className="text-xs text-muted-foreground">Including yourself</p>
            </CardContent>
          </Card>
        </div>

        {/* Family Members Table */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Family Members</CardTitle>
            <CardDescription>People under your healthcare account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Medical Conditions</TableHead>
                    <TableHead>Appointments</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyMembersWithCounts?.map((member) => {
                    const age = member.date_of_birth
                      ? new Date().getFullYear() - new Date(member.date_of_birth).getFullYear()
                      : null

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRelationshipColor(member.relationship)}>{member.relationship}</Badge>
                        </TableCell>
                        <TableCell>{age ? `${age} years` : "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-green-500" />
                            {member.phone || "No phone"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{member.medical_conditions || "None specified"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                            {member.appointmentCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Book Appointment
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  }) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No family members added yet. Add your first family member to get started!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {familyMembers && familyMembers.length > 0 && (
          <Card className="mt-6 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for family healthcare management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start bg-transparent" asChild>
                  <Link href="/patient/appointments/book">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Family Appointment
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start bg-transparent" asChild>
                  <Link href="/patient/prescriptions">
                    <Heart className="h-4 w-4 mr-2" />
                    View Family Prescriptions
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start bg-transparent" asChild>
                  <Link href="/patient/family/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Member
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
