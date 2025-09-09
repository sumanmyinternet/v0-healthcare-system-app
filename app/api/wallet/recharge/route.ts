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
    const { amount, paymentMethod, referenceId } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Create transaction record
    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      user_id: user.id,
      transaction_type: "recharge",
      amount: amount,
      description: `Wallet recharge via ${paymentMethod}`,
      reference_id: referenceId || `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })

    if (transactionError) {
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Wallet recharged successfully" })
  } catch (error) {
    console.error("Wallet recharge error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
