"use server"

import { createClient } from "@/lib/supabase/server"

export async function rechargeWallet(amount: number, paymentMethod: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error("Wallet not found")
    }

    // Create transaction record
    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      user_id: user.id,
      transaction_type: "recharge",
      amount: amount,
      description: `Wallet recharge via ${paymentMethod}`,
      reference_id: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })

    if (transactionError) {
      throw new Error("Failed to create transaction")
    }

    return { success: true, message: "Wallet recharged successfully" }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to recharge wallet")
  }
}

export async function processPayment(amount: number, description: string, appointmentId?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error("Wallet not found")
    }

    // Check if user has sufficient balance
    if (Number.parseFloat(wallet.balance) < amount) {
      throw new Error("Insufficient balance")
    }

    // Create payment transaction
    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      user_id: user.id,
      transaction_type: "payment",
      amount: amount,
      description: description,
      reference_id: appointmentId || `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })

    if (transactionError) {
      throw new Error("Failed to process payment")
    }

    return { success: true, message: "Payment processed successfully" }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to process payment")
  }
}

export async function getWalletBalance(userId: string) {
  const supabase = await createClient()

  try {
    const { data: wallet, error } = await supabase.from("wallets").select("balance").eq("user_id", userId).single()

    if (error || !wallet) {
      throw new Error("Wallet not found")
    }

    return Number.parseFloat(wallet.balance)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to get wallet balance")
  }
}

export async function refundPayment(amount: number, description: string, originalTransactionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error("Wallet not found")
    }

    // Create refund transaction
    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      user_id: user.id,
      transaction_type: "refund",
      amount: amount,
      description: description,
      reference_id: `REFUND-${originalTransactionId}-${Date.now()}`,
    })

    if (transactionError) {
      throw new Error("Failed to process refund")
    }

    return { success: true, message: "Refund processed successfully" }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to process refund")
  }
}
