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

    // Check if user is a doctor
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "doctor") {
      return NextResponse.json({ error: "Only doctors can create prescriptions" }, { status: 403 })
    }

    const body = await request.json()
    const { patientId, familyMemberId, medicationName, dosage, frequency, duration, instructions } = body

    if (!patientId || !medicationName || !dosage || !frequency || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const prescriptionData = {
      patient_id: patientId,
      doctor_id: user.id,
      family_member_id: familyMemberId || null,
      medication_name: medicationName,
      dosage: dosage,
      frequency: frequency,
      duration: duration,
      instructions: instructions || null,
      status: "active" as const,
      prescribed_date: new Date().toISOString().split("T")[0],
    }

    const { data, error } = await supabase.from("prescriptions").insert(prescriptionData).select().single()

    if (error) {
      return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 })
    }

    return NextResponse.json({ success: true, prescription: data })
  } catch (error) {
    console.error("Prescription creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { prescriptionId, status, medicationName, dosage, frequency, duration, instructions } = body

    if (!prescriptionId) {
      return NextResponse.json({ error: "Prescription ID is required" }, { status: 400 })
    }

    // Check if the prescription belongs to this doctor
    const { data: prescription } = await supabase
      .from("prescriptions")
      .select("doctor_id")
      .eq("id", prescriptionId)
      .single()

    if (!prescription || prescription.doctor_id !== user.id) {
      return NextResponse.json({ error: "Prescription not found or unauthorized" }, { status: 404 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (medicationName) updateData.medication_name = medicationName
    if (dosage) updateData.dosage = dosage
    if (frequency) updateData.frequency = frequency
    if (duration) updateData.duration = duration
    if (instructions !== undefined) updateData.instructions = instructions

    const { data, error } = await supabase
      .from("prescriptions")
      .update(updateData)
      .eq("id", prescriptionId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 })
    }

    return NextResponse.json({ success: true, prescription: data })
  } catch (error) {
    console.error("Prescription update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
