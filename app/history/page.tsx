"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import type { Activity, Thought } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, Download, HistoryIcon, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function HistoryPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<"today" | "week" | "month">("today")
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      await loadHistory(user.id, dateRange)
    }

    loadData()
  }, [router, dateRange])

  const loadHistory = async (uid: string, range: "today" | "week" | "month") => {
    setIsLoading(true)
    const supabase = createClient()

    const now = new Date()
    const startDate = new Date()

    switch (range) {
      case "today":
        startDate.setHours(0, 0, 0, 0)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
        break
      case "month":
        startDate.setDate(now.getDate() - 30)
        startDate.setHours(0, 0, 0, 0)
        break
    }

    // Load activities
    const { data: activitiesData } = await supabase
      .from("activities")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("user_id", uid)
      .gte("start_time", startDate.toISOString())
      .order("start_time", { ascending: false })

    setActivities(activitiesData || [])

    // Load thoughts
    const { data: thoughtsData } = await supabase
      .from("thoughts")
      .select("*")
      .eq("user_id", uid)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    setThoughts(thoughtsData || [])
    setIsLoading(false)
  }

  const exportData = () => {
    const data = {
      activities: activities.map((a) => ({
        categoria: a.category?.name,
        inicio: new Date(a.start_time).toLocaleString("es-ES"),
        fin: a.end_time ? new Date(a.end_time).toLocaleString("es-ES") : "En progreso",
        duracion: a.end_time
          ? `${Math.round((new Date(a.end_time).getTime() - new Date(a.start_time).getTime()) / 60000)} min`
          : "-",
        notas: a.notes || "",
      })),
      pensamientos: thoughts.map((t) => ({
        contenido: t.content,
        fecha: new Date(t.created_at).toLocaleString("es-ES"),
        etiquetas: t.tags?.join(", ") || "",
      })),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `historial-${dateRange}-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "En progreso"
    const minutes = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 md:pb-6 md:pt-16">
      <Navigation />
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HistoryIcon className="h-8 w-8" />
              Historial
            </h1>
            <p className="text-muted-foreground">Revisa tus actividades y pensamientos pasados</p>
          </div>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </header>

        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="activities" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activities">
              <Clock className="h-4 w-4 mr-2" />
              Actividades ({activities.length})
            </TabsTrigger>
            <TabsTrigger value="thoughts">
              <MessageSquare className="h-4 w-4 mr-2" />
              Pensamientos ({thoughts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Cargando historial...</p>
              </Card>
            ) : activities.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">No hay actividades en este período</p>
              </Card>
            ) : (
              activities.map((activity) => (
                <Card key={activity.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${activity.category?.color}20` }}
                        >
                          {activity.category?.emoji}
                        </div>
                        <div>
                          <CardTitle>{activity.category?.name}</CardTitle>
                          <CardDescription>
                            {new Date(activity.start_time).toLocaleString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDuration(activity.start_time, activity.end_time)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.start_time), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  {activity.notes && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{activity.notes}</p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="thoughts" className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Cargando pensamientos...</p>
              </Card>
            ) : thoughts.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">No hay pensamientos registrados en este período</p>
              </Card>
            ) : (
              thoughts.map((thought) => (
                <Card key={thought.id}>
                  <CardHeader>
                    <CardDescription>
                      {new Date(thought.created_at).toLocaleString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{thought.content}</p>
                    {thought.tags && thought.tags.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {thought.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-secondary px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
