"use client"

import { Navigation } from "@/components/navigation"
import { QuickLogPanel } from "@/components/quick-log-panel"
import { ThoughtInput } from "@/components/thought-input"
import { Timeline } from "@/components/timeline"
import { useUndoToast } from "@/components/undo-toast"
import { createClient } from "@/lib/supabase/client"
import type { Activity, Category } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

// 👇 añade esta función:
async function ensureCategoriesForUser(uid: string) {
  const supabase = createClient()
  const { count, error } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", uid)

  if (error) {
    console.error("[ensureCategories] count error:", error)
    return
  }

  if (!count || count === 0) {
    // seed por RPC (ya definida en scripts/002_seed_default_categories.sql)
    const { error: seedError } = await supabase.rpc("seed_default_categories", { p_user_id: uid })
    if (seedError) {
      console.error("[ensureCategories] seed error:", seedError)
    }
  }
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const { showUndoToast } = useUndoToast()

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)

      // 👇 Asegura que existan categorías (si no hubo onboarding)
      await ensureCategoriesForUser(user.id)

      await loadCategories(user.id)
      await loadTodayActivities(user.id)
    }

    checkAuthAndLoadData()
  }, [router])

  const loadCategories = async (uid: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", uid)
      .order("name")

    if (error) {
      console.error("Error loading categories:", error)
      return
    }

    setCategories(data || [])
  }
  
  const loadTodayActivities = async (uid: string) => {
    const supabase = createClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from("activities")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("user_id", uid)
      .gte("start_time", today.toISOString())
      .order("start_time", { ascending: false })

    if (error) {
      console.error("Error loading activities:", error)
      return
    }

    setActivities(data || [])

    const active = data?.find((a) => !a.end_time)
    if (active) {
      setActiveActivityId(active.category_id)
    }
  }

  const handleStartActivity = async (categoryId: string) => {
    if (!userId) return

    setIsLoading(true)
    try {
      const supabase = createClient()

      if (activeActivityId) {
        await handleStopActivity()
      }

      const { data, error } = await supabase
        .from("activities")
        .insert({
          user_id: userId,
          category_id: categoryId,
          start_time: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setActiveActivityId(categoryId)
      await loadTodayActivities(userId)

      showUndoToast("Actividad iniciada", async () => {
        await supabase.from("activities").delete().eq("id", data.id)
        setActiveActivityId(null)
        await loadTodayActivities(userId)
      })
    } catch (error) {
      console.error("Error starting activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStopActivity = async () => {
    if (!userId || !activeActivityId) return

    setIsLoading(true)
    try {
      const supabase = createClient()

      const activeActivity = activities.find((a) => a.category_id === activeActivityId && !a.end_time)

      if (!activeActivity) return

      const { error } = await supabase
        .from("activities")
        .update({ end_time: new Date().toISOString() })
        .eq("id", activeActivity.id)

      if (error) throw error

      setActiveActivityId(null)
      await loadTodayActivities(userId)

      showUndoToast("Actividad terminada", async () => {
        await supabase.from("activities").update({ end_time: null }).eq("id", activeActivity.id)
        setActiveActivityId(activeActivity.category_id)
        await loadTodayActivities(userId)
      })
    } catch (error) {
      console.error("Error stopping activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveThought = async (content: string) => {
    if (!userId) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("thoughts")
      .insert({
        user_id: userId,
        content,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving thought:", error)
      throw error
    }

    showUndoToast("Pensamiento guardado", async () => {
      await supabase.from("thoughts").delete().eq("id", data.id)
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6 md:pt-16">
      <Navigation />
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <header className="mb-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-balance">Autocontrol & Mentoring AI</h1>
              <p className="text-muted-foreground mt-1 text-pretty">Registra tus actividades y pensamientos del día</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium">Sistema activo</span>
            </div>
          </div>

          <Alert className="bg-accent/30 border-accent">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Atajos de teclado:</strong> <kbd>N</kbd> Nueva actividad · <kbd>L</kbd> Registro rápido ·{" "}
              <kbd>U</kbd> Deshacer · <kbd>F</kbd> Buscar
            </AlertDescription>
          </Alert>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <QuickLogPanel
              categories={categories}
              activeActivityId={activeActivityId}
              onStartActivity={handleStartActivity}
              onStopActivity={handleStopActivity}
              isLoading={isLoading}
            />
            <ThoughtInput onSubmit={handleSaveThought} />
          </div>

          <div>
            <Timeline activities={activities} />
          </div>
        </div>
      </div>
    </div>
  )
}
