import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Stethoscope, Wallet, Calendar, FileText } from "lucide-react"

export default async function AdminDashboard() {
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

  // Fetch dashboard statistics
  const [
    { count: totalUsers },
    { count: totalDoctors },
    { count: totalPatients },
    { count: totalAppointments },
    { count: activePrescriptions },
    { data: recentTransactions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "doctor"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("prescriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("wallet_transactions")
      .select("amount, transaction_type, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const totalRevenue =
    recentTransactions?.reduce((sum, transaction) => {
      return transaction.transaction_type === "payment" ? sum + Number.parseFloat(transaction.amount) : sum
    }, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">CDPR Health Care System Administration</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Administrator
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered system users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDoctors || 0}</div>
              <p className="text-xs text-muted-foreground">Healthcare providers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Patients</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatients || 0}</div>
              <p className="text-xs text-muted-foreground">Patient accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">Scheduled consultations</p>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (Recent)</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From recent transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/admin/users"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">Manage Users</span>
                </a>
                <a
                  href="/admin/doctors"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Stethoscope className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">Doctor Management</span>
                </a>
                <a
                  href="/admin/patients"
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <UserCheck className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Patient Records</span>
                </a>
                <a
                  href="/admin/financial"
                  className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Wallet className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="font-medium text-orange-900">Financial Overview</span>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions?.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-3 ${
                          transaction.transaction_type === "payment"
                            ? "bg-green-500"
                            : transaction.transaction_type === "recharge"
                              ? "bg-blue-500"
                              : "bg-orange-500"
                        }`}
                      />
                      <span className="text-sm font-medium capitalize">{transaction.transaction_type}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${Number.parseFloat(transaction.amount).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )) || <p className="text-sm text-gray-500 text-center py-4">No recent transactions</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
