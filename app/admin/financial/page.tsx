import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function FinancialOverview() {
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

  // Fetch financial data
  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select(`
      *,
      profiles!wallet_transactions_user_id_fkey (full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  // Calculate totals
  const totalRevenue =
    transactions?.reduce((sum, t) => (t.transaction_type === "payment" ? sum + Number.parseFloat(t.amount) : sum), 0) ||
    0

  const totalRecharges =
    transactions?.reduce(
      (sum, t) => (t.transaction_type === "recharge" ? sum + Number.parseFloat(t.amount) : sum),
      0,
    ) || 0

  const totalRefunds =
    transactions?.reduce((sum, t) => (t.transaction_type === "refund" ? sum + Number.parseFloat(t.amount) : sum), 0) ||
    0

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "recharge":
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      case "refund":
        return <TrendingDown className="h-4 w-4 text-orange-500" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "payment":
        return "bg-green-100 text-green-800"
      case "recharge":
        return "bg-blue-100 text-blue-800"
      case "refund":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
              <p className="text-gray-600">System revenue and transaction management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From consultation payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recharges</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${totalRecharges.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Wallet top-ups by users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">${totalRefunds.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Refunded to users</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest financial activities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.profiles?.full_name || "Unknown User"}</div>
                          <div className="text-sm text-gray-500">{transaction.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.transaction_type)}
                          <Badge className={`ml-2 ${getTransactionBadge(transaction.transaction_type)}`}>
                            {transaction.transaction_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">${Number.parseFloat(transaction.amount).toFixed(2)}</div>
                      </TableCell>
                      <TableCell>{transaction.description || "No description"}</TableCell>
                      <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {transaction.reference_id || "N/A"}
                        </code>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No transactions found
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
