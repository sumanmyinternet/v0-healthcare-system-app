import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, description, appointmentId } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Check if user has sufficient balance
    if (Number.parseFloat(wallet.balance) < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Create payment transaction
    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      user_id: user.id,
      transaction_type: "payment",
      amount: amount,
      description: description || "Healthcare payment",
      reference_id: appointmentId || `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })

    if (transactionError) {
      return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Payment processed successfully" })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
