import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Wallet, Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function PatientWallet() {
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

  // Fetch wallet and transactions
  const [{ data: wallet }, { data: transactions }] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", user.id).single(),
    supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  // Calculate transaction summaries
  const totalRecharges =
    transactions?.reduce(
      (sum, t) => (t.transaction_type === "recharge" ? sum + Number.parseFloat(t.amount) : sum),
      0,
    ) || 0

  const totalPayments =
    transactions?.reduce((sum, t) => (t.transaction_type === "payment" ? sum + Number.parseFloat(t.amount) : sum), 0) ||
    0

  const totalRefunds =
    transactions?.reduce((sum, t) => (t.transaction_type === "refund" ? sum + Number.parseFloat(t.amount) : sum), 0) ||
    0

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "recharge":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "payment":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "refund":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "recharge":
        return "bg-green-100 text-green-800"
      case "payment":
        return "bg-red-100 text-red-800"
      case "refund":
        return "bg-blue-100 text-blue-800"
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
                <h1 className="text-3xl font-bold text-gray-900">Wallet & Billing</h1>
                <p className="text-gray-600">Manage your healthcare payments and balance</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/patient/wallet/recharge">
                <Plus className="h-4 w-4 mr-2" />
                Add Funds
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Balance */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Wallet className="h-5 w-5 mr-2" />
              Current Balance
            </CardTitle>
            <CardDescription className="text-blue-100">Available funds in your healthcare wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">${Number.parseFloat(wallet?.balance || "0").toFixed(2)}</div>
            <div className="flex gap-4">
              <Button variant="secondary" asChild>
                <Link href="/patient/wallet/recharge">Add Funds</Link>
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              >
                View History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recharges</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalRecharges.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Money added to wallet</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalPayments.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Spent on healthcare</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${totalRefunds.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Refunded to wallet</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent wallet activities and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.transaction_type)}
                          <Badge className={`ml-2 ${getTransactionBadge(transaction.transaction_type)}`}>
                            {transaction.transaction_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`font-semibold ${
                            transaction.transaction_type === "payment" ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {transaction.transaction_type === "payment" ? "-" : "+"}$
                          {Number.parseFloat(transaction.amount).toFixed(2)}
                        </div>
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
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No transactions found. Add funds to get started!
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
