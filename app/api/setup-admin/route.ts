import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createClient()

    // Check if admin already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", "suman.myinternet@gmail.com")
      .single()

    if (existingProfile) {
      return NextResponse.json({
        success: false,
        message: "Admin user already exists",
      })
    }

    // Create the admin user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: "suman.myinternet@gmail.com",
      password: "Admincdpr##",
      options: {
        data: {
          full_name: "System Administrator",
          role: "admin",
        },
      },
    })

    if (signUpError) {
      console.log("[v0] SignUp error:", signUpError)
      return NextResponse.json({
        success: false,
        message: signUpError.message,
      })
    }

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: "suman.myinternet@gmail.com",
        full_name: "System Administrator",
        role: "admin",
        phone: "+1234567890",
      })

      if (profileError) {
        console.log("[v0] Profile error:", profileError)
        return NextResponse.json({
          success: false,
          message: profileError.message,
        })
      }

      // Create wallet
      const { error: walletError } = await supabase.from("wallets").insert({
        user_id: authData.user.id,
        balance: 0,
      })

      if (walletError) {
        console.log("[v0] Wallet error:", walletError)
        return NextResponse.json({
          success: false,
          message: walletError.message,
        })
      }

      return NextResponse.json({
        success: true,
        message: "Admin user created successfully!",
      })
    }

    return NextResponse.json({
      success: false,
      message: "Failed to create user",
    })
  } catch (error: any) {
    console.log("[v0] Setup admin error:", error)
    return NextResponse.json({
      success: false,
      message: error.message || "An error occurred",
    })
  }
}
