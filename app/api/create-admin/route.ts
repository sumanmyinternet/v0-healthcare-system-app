import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST() {
  try {
    // Create admin user with service role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: "suman.myinternet@gmail.com",
      password: "Admincdpr##",
      email_confirm: true, // Skip email verification
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      full_name: "System Administrator",
      email: "suman.myinternet@gmail.com",
      phone: "+1234567890",
      role: "admin",
      specialization: null,
      consultation_fee: null,
    })

    if (profileError) {
      console.error("Profile error:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // Create wallet
    const { error: walletError } = await supabaseAdmin.from("wallets").insert({
      user_id: authData.user.id,
      balance: 0,
    })

    if (walletError) {
      console.error("Wallet error:", walletError)
      return NextResponse.json({ error: walletError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      email: "suman.myinternet@gmail.com",
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
  }
}
