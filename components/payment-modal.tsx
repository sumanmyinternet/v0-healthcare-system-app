"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, CreditCard, AlertCircle } from "lucide-react"

interface PaymentModalProps {
  amount: number
  description: string
  appointmentId?: string
  onSuccess?: () => void
  children: React.ReactNode
}

export function PaymentModal({ amount, description, appointmentId, onSuccess, children }: PaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  const fetchWalletBalance = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

      if (wallet) {
        setWalletBalance(Number.parseFloat(wallet.balance))
      }
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error)
    }
  }

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/wallet/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description,
          appointmentId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Payment failed")
      }

      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Payment failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      fetchWalletBalance()
      setError(null)
    }
  }

  const hasInsufficientFunds = walletBalance !== null && walletBalance < amount

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Confirmation
          </DialogTitle>
          <DialogDescription>Review and confirm your payment details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Description:</span>
                  <span className="text-sm font-medium">{description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-lg font-bold">${amount.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Wallet className="h-4 w-4 mr-1" />
                    Wallet Balance:
                  </span>
                  <span className={`text-sm font-medium ${hasInsufficientFunds ? "text-red-600" : "text-green-600"}`}>
                    ${walletBalance?.toFixed(2) || "Loading..."}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {hasInsufficientFunds && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <p className="text-sm text-red-600">Insufficient funds. Please add money to your wallet first.</p>
            </div>
          )}

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isLoading || hasInsufficientFunds} className="flex-1">
              {isLoading ? "Processing..." : "Pay Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
