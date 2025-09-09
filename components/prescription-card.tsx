"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pill, User, Calendar, Clock } from "lucide-react"
import { PrescriptionStatusBadge } from "./prescription-status-badge"

interface PrescriptionCardProps {
  prescription: {
    id: string
    medication_name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
    status: "active" | "completed" | "cancelled"
    prescribed_date: string
    profiles?: {
      full_name: string
    }
    family_members?: {
      name: string
      relationship: string
    }
  }
  showPatient?: boolean
  showDoctor?: boolean
  onStatusChange?: (prescriptionId: string, status: "active" | "completed" | "cancelled") => void
}

export function PrescriptionCard({ prescription, showPatient, showDoctor, onStatusChange }: PrescriptionCardProps) {
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Pill className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <CardTitle className="text-lg">{prescription.medication_name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <span className="font-medium">{prescription.dosage}</span>
                <span className="mx-2">•</span>
                <span>{prescription.frequency}</span>
              </CardDescription>
            </div>
          </div>
          <PrescriptionStatusBadge status={prescription.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-2" />
            <span>Duration: {prescription.duration}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span>Prescribed: {new Date(prescription.prescribed_date).toLocaleDateString()}</span>
          </div>
        </div>

        {(showPatient || showDoctor) && (
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 text-blue-500 mr-2" />
            <span>
              {showPatient && prescription.profiles?.full_name}
              {showDoctor && "Dr. " + prescription.profiles?.full_name}
              {prescription.family_members && (
                <span className="text-gray-500 ml-1">
                  (for {prescription.family_members.name} - {prescription.family_members.relationship})
                </span>
              )}
            </span>
          </div>
        )}

        {prescription.instructions && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong> {prescription.instructions}
            </p>
          </div>
        )}

        {onStatusChange && prescription.status === "active" && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(prescription.id, "completed")}
              className="bg-transparent"
            >
              Mark Completed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(prescription.id, "cancelled")}
              className="bg-transparent"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
