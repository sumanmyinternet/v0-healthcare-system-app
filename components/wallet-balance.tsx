"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WalletBalanceProps {
  userId: string
  className?: string
}

export function WalletBalance({ userId, className }: WalletBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      const { data: wallet, error } = await supabase.from("wallets").select("balance").eq("user_id", userId).single()

      if (error) {
        throw error
      }

      setBalance(Number.parseFloat(wallet.balance))
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch balance")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [userId])

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p className="text-sm">Error loading balance</p>
            <Button variant="outline" size="sm" onClick={fetchBalance} className="mt-2 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
          ) : (
            `$${balance?.toFixed(2) || "0.00"}`
          )}
        </div>
        <p className="text-xs text-muted-foreground">Available funds</p>
        <Button variant="outline" size="sm" onClick={fetchBalance} className="mt-2 bg-transparent">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardContent>
    </Card>
  )
}
