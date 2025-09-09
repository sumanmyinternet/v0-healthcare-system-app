"use server"

import { createClient } from "@/lib/supabase/server"

export async function createPrescription(prescriptionData: {
  patientId: string
  familyMemberId?: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Check if user is a doctor
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "doctor") {
    throw new Error("Only doctors can create prescriptions")
  }

  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .insert({
        patient_id: prescriptionData.patientId,
        doctor_id: user.id,
        family_member_id: prescriptionData.familyMemberId || null,
        medication_name: prescriptionData.medicationName,
        dosage: prescriptionData.dosage,
        frequency: prescriptionData.frequency,
        duration: prescriptionData.duration,
        instructions: prescriptionData.instructions || null,
        status: "active" as const,
        prescribed_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single()

    if (error) {
      throw new Error("Failed to create prescription")
    }

    return { success: true, prescription: data }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to create prescription")
  }
}

export async function updatePrescriptionStatus(prescriptionId: string, status: "active" | "completed" | "cancelled") {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    // Check if the prescription belongs to this doctor
    const { data: prescription } = await supabase
      .from("prescriptions")
      .select("doctor_id")
      .eq("id", prescriptionId)
      .single()

    if (!prescription || prescription.doctor_id !== user.id) {
      throw new Error("Prescription not found or unauthorized")
    }

    const { data, error } = await supabase
      .from("prescriptions")
      .update({ status })
      .eq("id", prescriptionId)
      .select()
      .single()

    if (error) {
      throw new Error("Failed to update prescription status")
    }

    return { success: true, prescription: data }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to update prescription")
  }
}

export async function getPrescriptionsByDoctor(doctorId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        *,
        profiles!prescriptions_patient_id_fkey (full_name, email),
        family_members (name, relationship)
      `)
      .eq("doctor_id", doctorId)
      .order("prescribed_date", { ascending: false })

    if (error) {
      throw new Error("Failed to fetch prescriptions")
    }

    return data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch prescriptions")
  }
}

export async function getPrescriptionsByPatient(patientId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        *,
        profiles!prescriptions_doctor_id_fkey (full_name),
        doctor_specializations!inner (specialization),
        family_members (name, relationship)
      `)
      .eq("patient_id", patientId)
      .order("prescribed_date", { ascending: false })

    if (error) {
      throw new Error("Failed to fetch prescriptions")
    }

    return data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch prescriptions")
  }
}
