"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { Activity, Category } from "@/lib/types"
import { BarChart3, Clock, Target, TrendingDown, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"

interface CategoryMetric {
  category: Category
  totalMinutes: number
  percentage: number
  count: number
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<CategoryMetric[]>([])
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [distractionMinutes, setDistractionMinutes] = useState(0)
  const [productiveMinutes, setProductiveMinutes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadMetrics = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get today's activities
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: activities, error } = await supabase
        .from("activities")
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .eq("user_id", user.id)
        .gte("start_time", today.toISOString())
        .not("end_time", "is", null)

      if (error) {
        console.error("[v0] Error loading metrics:", error)
        setIsLoading(false)
        return
      }

      // Calculate metrics
      const categoryMap = new Map<string, CategoryMetric>()
      let total = 0
      let distraction = 0
      let productive = 0

      activities?.forEach((activity: Activity) => {
        if (!activity.end_time || !activity.category) return

        const duration = Math.round(
          (new Date(activity.end_time).getTime() - new Date(activity.start_time).getTime()) / 60000,
        )

        total += duration

        if (activity.category.is_distraction) {
          distraction += duration
        } else {
          productive += duration
        }

        const existing = categoryMap.get(activity.category_id)
        if (existing) {
          existing.totalMinutes += duration
          existing.count += 1
        } else {
          categoryMap.set(activity.category_id, {
            category: activity.category,
            totalMinutes: duration,
            percentage: 0,
            count: 1,
          })
        }
      })

      // Calculate percentages
      const metricsArray = Array.from(categoryMap.values()).map((m) => ({
        ...m,
        percentage: total > 0 ? (m.totalMinutes / total) * 100 : 0,
      }))

      metricsArray.sort((a, b) => b.totalMinutes - a.totalMinutes)

      setMetrics(metricsArray)
      setTotalMinutes(total)
      setDistractionMinutes(distraction)
      setProductiveMinutes(productive)
      setIsLoading(false)
    }

    loadMetrics()
  }, [router])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center pb-20 md:pb-6 md:pt-16">
        <Navigation />
        <p className="text-muted-foreground">Cargando métricas...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 md:pb-6 md:pt-16">
      <Navigation />
      <div className="container mx-auto p-6 max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Métricas del Día</h1>
          <p className="text-muted-foreground">Análisis de tu uso del tiempo</p>
        </header>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(totalMinutes)}</div>
              <p className="text-xs text-muted-foreground">Registrado hoy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Productivo</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatTime(productiveMinutes)}</div>
              <p className="text-xs text-muted-foreground">
                {totalMinutes > 0 ? Math.round((productiveMinutes / totalMinutes) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distracciones</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatTime(distractionMinutes)}</div>
              <p className="text-xs text-muted-foreground">
                {totalMinutes > 0 ? Math.round((distractionMinutes / totalMinutes) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Desglose por Categoría
            </CardTitle>
            <CardDescription>Distribución de tu tiempo por actividad</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay actividades completadas hoy</p>
                <p className="text-sm mt-1">Comienza a registrar tus actividades para ver las métricas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{metric.category.emoji}</span>
                        <div>
                          <p className="font-medium">{metric.category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {metric.count} {metric.count === 1 ? "sesión" : "sesiones"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatTime(metric.totalMinutes)}</p>
                        <p className="text-sm text-muted-foreground">{metric.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${metric.percentage}%`,
                          backgroundColor: metric.category.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        {metrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {distractionMinutes > productiveMinutes && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm">
                    <strong>Atención:</strong> Has pasado más tiempo en distracciones que en actividades productivas
                    hoy.
                  </p>
                </div>
              )}
              {productiveMinutes > distractionMinutes * 2 && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm">
                    <strong>Excelente:</strong> Tu tiempo productivo supera ampliamente las distracciones. ¡Sigue así!
                  </p>
                </div>
              )}
              {totalMinutes < 60 && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm">
                    <strong>Consejo:</strong> Registra más actividades para obtener métricas más precisas de tu día.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
