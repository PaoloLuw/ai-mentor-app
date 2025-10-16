"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Activity } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, Calendar } from "lucide-react"

interface TimelineProps {
  activities: Activity[]
}

export function Timeline({ activities }: TimelineProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline del Día</CardTitle>
          <CardDescription>Tus actividades aparecerán aquí</CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No hay actividades registradas hoy</p>
              <p className="text-sm text-muted-foreground mt-1">
                Comienza registrando tu primera actividad en el panel de arriba
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate total time today
  const totalMinutes = activities.reduce((acc, activity) => {
    if (activity.end_time) {
      return acc + (new Date(activity.end_time).getTime() - new Date(activity.start_time).getTime()) / 60000
    }
    return acc
  }, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Timeline del Día</CardTitle>
            <CardDescription>Registro cronológico de tus actividades</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {activities.length} actividades
            </Badge>
            {totalMinutes > 0 && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {Math.round(totalMinutes)} min
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const isActive = !activity.end_time
            return (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 ${
                      isActive ? "ring-2 ring-success ring-offset-2" : ""
                    }`}
                    style={{
                      backgroundColor: `${activity.category?.color}20`,
                      borderColor: activity.category?.color,
                    }}
                  >
                    {activity.category?.emoji}
                  </div>
                  {index < activities.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{activity.category?.name}</p>
                        {isActive && (
                          <Badge variant="default" className="bg-success text-success-foreground text-xs">
                            En curso
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(activity.start_time).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {activity.end_time &&
                          ` - ${new Date(activity.end_time).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                      </p>
                      {activity.notes && (
                        <p className="text-sm mt-2 p-2 rounded bg-muted/50 italic">{activity.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.start_time), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  {activity.end_time && (
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                      <Clock className="h-3 w-3" />
                      Duración:{" "}
                      {Math.round(
                        (new Date(activity.end_time).getTime() - new Date(activity.start_time).getTime()) / 60000,
                      )}{" "}
                      minutos
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
