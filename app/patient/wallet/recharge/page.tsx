"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CreditCard, Wallet, DollarSign } from "lucide-react"
import Link from "next/link"

const RECHARGE_AMOUNTS = [25, 50, 100, 200, 500]

export default function WalletRechargePage() {
  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const rechargeAmount = amount === "custom" ? customAmount : amount

    if (!rechargeAmount || Number.parseFloat(rechargeAmount) <= 0) {
      setError("Please enter a valid amount")
      setIsLoading(false)
      return
    }

    if (!paymentMethod) {
      setError("Please select a payment method")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Please log in to continue")
        setIsLoading(false)
        return
      }

      // Get user's wallet
      const { data: wallet } = await supabase.from("wallets").select("id").eq("user_id", user.id).single()

      if (!wallet) {
        setError("Wallet not found")
        setIsLoading(false)
        return
      }

      // Create transaction record
      const { error: transactionError } = await supabase.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        user_id: user.id,
        transaction_type: "recharge",
        amount: Number.parseFloat(rechargeAmount),
        description: `Wallet recharge via ${paymentMethod}`,
        reference_id: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })

      if (transactionError) {
        throw transactionError
      }

      // Redirect to success page or back to wallet
      router.push("/patient/wallet?success=recharge")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/patient/wallet">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Wallet
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Funds</h1>
              <p className="text-gray-600">Recharge your healthcare wallet</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl">
              <Wallet className="h-6 w-6 mr-2 text-blue-600" />
              Wallet Recharge
            </CardTitle>
            <CardDescription>Add funds to your healthcare wallet for seamless payments</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecharge} className="space-y-6">
              {/* Quick Amount Selection */}
              <div>
                <Label className="text-base font-medium">Select Amount</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {RECHARGE_AMOUNTS.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant={amount === quickAmount.toString() ? "default" : "outline"}
                      className="h-12"
                      onClick={() => {
                        setAmount(quickAmount.toString())
                        setCustomAmount("")
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      {quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <Label htmlFor="custom-amount">Or Enter Custom Amount</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="pl-10"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setAmount("custom")
                    }}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Credit Card
                      </div>
                    </SelectItem>
                    <SelectItem value="debit_card">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Debit Card
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Summary */}
              {(amount || customAmount) && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount to add:</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${amount === "custom" ? customAmount : amount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">Processing fee:</span>
                      <span className="text-sm text-gray-600">$0.00</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total:</span>
                      <span className="text-xl font-bold text-green-600">
                        ${amount === "custom" ? customAmount : amount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? "Processing..." : "Add Funds to Wallet"}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Secure Payment</h4>
              <p className="text-sm text-gray-600">
                Your payment information is encrypted and secure. We use industry-standard security measures to protect
                your financial data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
