"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Pill, User, Users } from "lucide-react"
import Link from "next/link"

interface Patient {
  id: string
  full_name: string
  email: string
}

interface FamilyMember {
  id: string
  name: string
  relationship: string
  patient_id: string
}

export default function NewPrescriptionPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedFamilyMember, setSelectedFamilyMember] = useState("")
  const [medicationName, setMedicationName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState("")
  const [duration, setDuration] = useState("")
  const [instructions, setInstructions] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchFamilyMembers(selectedPatient)
    } else {
      setFamilyMembers([])
      setSelectedFamilyMember("")
    }
  }, [selectedPatient])

  const fetchPatients = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get patients who have appointments with this doctor
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          profiles!appointments_patient_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq("doctor_id", user.id)

      // Remove duplicates
      const uniquePatients =
        appointments?.reduce((acc, appointment) => {
          const patient = appointment.profiles
          if (patient && !acc.find((p) => p.id === patient.id)) {
            acc.push(patient)
          }
          return acc
        }, [] as Patient[]) || []

      setPatients(uniquePatients)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
    }
  }

  const fetchFamilyMembers = async (patientId: string) => {
    try {
      const supabase = createClient()
      const { data: members } = await supabase.from("family_members").select("*").eq("patient_id", patientId)

      setFamilyMembers(members || [])
    } catch (error) {
      console.error("Failed to fetch family members:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!selectedPatient || !medicationName || !dosage || !frequency || !duration) {
      setError("Please fill in all required fields")
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

      const prescriptionData = {
        patient_id: selectedPatient,
        doctor_id: user.id,
        family_member_id: selectedFamilyMember || null,
        medication_name: medicationName,
        dosage: dosage,
        frequency: frequency,
        duration: duration,
        instructions: instructions || null,
        status: "active" as const,
        prescribed_date: new Date().toISOString().split("T")[0],
      }

      const { error: insertError } = await supabase.from("prescriptions").insert(prescriptionData)

      if (insertError) {
        throw insertError
      }

      router.push("/doctor/prescriptions?success=created")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/doctor/prescriptions">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Prescriptions
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">New Prescription</h1>
              <p className="text-gray-600">Create a new prescription for your patient</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="h-5 w-5 mr-2 text-green-600" />
              Prescription Details
            </CardTitle>
            <CardDescription>Fill in the medication details and patient information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="patient">Patient *</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {patient.full_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="family-member">Family Member (Optional)</Label>
                  <Select value={selectedFamilyMember} onValueChange={setSelectedFamilyMember}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select family member or leave blank for patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Patient (Self)
                        </div>
                      </SelectItem>
                      {familyMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {member.name} ({member.relationship})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Medication Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="medication">Medication Name *</Label>
                  <Input
                    id="medication"
                    type="text"
                    placeholder="e.g., Amoxicillin"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    type="text"
                    placeholder="e.g., 500mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="Four times daily">Four times daily</SelectItem>
                      <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                      <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                      <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                      <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                      <SelectItem value="Before meals">Before meals</SelectItem>
                      <SelectItem value="After meals">After meals</SelectItem>
                      <SelectItem value="At bedtime">At bedtime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 days">3 days</SelectItem>
                      <SelectItem value="5 days">5 days</SelectItem>
                      <SelectItem value="7 days">7 days (1 week)</SelectItem>
                      <SelectItem value="10 days">10 days</SelectItem>
                      <SelectItem value="14 days">14 days (2 weeks)</SelectItem>
                      <SelectItem value="21 days">21 days (3 weeks)</SelectItem>
                      <SelectItem value="30 days">30 days (1 month)</SelectItem>
                      <SelectItem value="60 days">60 days (2 months)</SelectItem>
                      <SelectItem value="90 days">90 days (3 months)</SelectItem>
                      <SelectItem value="Until further notice">Until further notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="e.g., Take with food, avoid alcohol, complete the full course..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Prescription Preview */}
              {medicationName && dosage && frequency && duration && (
                <Card className="bg-blue-50 border-blue-200 mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Prescription Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <strong>Medication:</strong> {medicationName}
                      </div>
                      <div>
                        <strong>Dosage:</strong> {dosage}
                      </div>
                      <div>
                        <strong>Frequency:</strong> {frequency}
                      </div>
                      <div>
                        <strong>Duration:</strong> {duration}
                      </div>
                      {instructions && (
                        <div>
                          <strong>Instructions:</strong> {instructions}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Creating Prescription..." : "Create Prescription"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
