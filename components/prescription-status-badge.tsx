import { Badge } from "@/components/ui/badge"

interface PrescriptionStatusBadgeProps {
  status: "active" | "completed" | "cancelled"
  className?: string
}

export function PrescriptionStatusBadge({ status, className }: PrescriptionStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return <Badge className={`${getStatusColor(status)} ${className}`}>{status}</Badge>
}
