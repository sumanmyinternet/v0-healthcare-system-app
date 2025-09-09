import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Clock, Calendar, Plus, Settings } from "lucide-react"
import Link from "next/link"

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default async function DoctorSchedule() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is doctor
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "doctor") {
    redirect("/auth/login")
  }

  // Fetch doctor's schedule
  const { data: schedules } = await supabase
    .from("doctor_schedules")
    .select("*")
    .eq("doctor_id", user.id)
    .order("day_of_week", { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-4">
                <Link href="/doctor">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
                <p className="text-gray-600">Manage your availability and working hours</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/doctor/schedule/edit">
                <Settings className="h-4 w-4 mr-2" />
                Edit Schedule
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Your regular working hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day, index) => {
                  const daySchedule = schedules?.find((s) => s.day_of_week === index)

                  return (
                    <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                        <span className="font-medium">{day}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {daySchedule ? (
                          <>
                            <div className="flex items-center text-sm">
                              <Clock className="h-3 w-3 mr-1 text-green-500" />
                              {daySchedule.start_time} - {daySchedule.end_time}
                            </div>
                            <Badge
                              className={
                                daySchedule.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }
                            >
                              {daySchedule.is_available ? "Available" : "Unavailable"}
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="outline">Not Set</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Summary</CardTitle>
              <CardDescription>Overview of your availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {schedules?.filter((s) => s.is_available).length || 0}
                    </div>
                    <div className="text-sm text-green-700">Available Days</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{schedules?.length || 0}</div>
                    <div className="text-sm text-blue-700">Total Scheduled Days</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" className="justify-start bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Time Slot
                    </Button>
                    <Button variant="outline" className="justify-start bg-transparent">
                      <Settings className="h-4 w-4 mr-2" />
                      Bulk Edit Schedule
                    </Button>
                    <Button variant="outline" className="justify-start bg-transparent">
                      <Calendar className="h-4 w-4 mr-2" />
                      Set Holiday Dates
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Schedule Table */}
        {schedules && schedules.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Detailed Schedule</CardTitle>
              <CardDescription>Complete breakdown of your working hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => {
                      const startTime = new Date(`2000-01-01T${schedule.start_time}`)
                      const endTime = new Date(`2000-01-01T${schedule.end_time}`)
                      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

                      return (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">{DAYS_OF_WEEK[schedule.day_of_week]}</TableCell>
                          <TableCell>{schedule.start_time}</TableCell>
                          <TableCell>{schedule.end_time}</TableCell>
                          <TableCell>{duration.toFixed(1)} hours</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                schedule.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }
                            >
                              {schedule.is_available ? "Available" : "Unavailable"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
