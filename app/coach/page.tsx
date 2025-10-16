"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, Lightbulb, Loader2, Send, Sparkles, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function CoachPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [llmRole, setLlmRole] = useState<string>("mentor")
  const [dailySummary, setDailySummary] = useState<string | null>(null)
  const router = useRouter()

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

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

      setUserId(user.id)

      // Get user profile
      const { data: profile } = await supabase.from("users_profile").select("llm_role").eq("id", user.id).single()

      if (profile) {
        setLlmRole(profile.llm_role)
      }

      // Generate daily summary
      await generateDailySummary(user.id)
    }

    loadData()
  }, [router])

  const generateDailySummary = async (uid: string) => {
    const supabase = createClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get today's activities
    const { data: activities } = await supabase
      .from("activities")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("user_id", uid)
      .gte("start_time", today.toISOString())
      .not("end_time", "is", null)

    if (!activities || activities.length === 0) {
      setDailySummary("Aún no has registrado actividades hoy. Comienza a registrar para recibir un análisis.")
      return
    }

    // Calculate metrics
    const categoryMap = new Map<string, { name: string; minutes: number; isDistraction: boolean }>()
    let totalMinutes = 0

    activities.forEach((activity: any) => {
      if (!activity.end_time || !activity.category) return

      const duration = Math.round(
        (new Date(activity.end_time).getTime() - new Date(activity.start_time).getTime()) / 60000,
      )

      totalMinutes += duration

      const existing = categoryMap.get(activity.category.name)
      if (existing) {
        existing.minutes += duration
      } else {
        categoryMap.set(activity.category.name, {
          name: activity.category.name,
          minutes: duration,
          isDistraction: activity.category.is_distraction,
        })
      }
    })

    // Build summary
    const categoryStats = Array.from(categoryMap.values())
      .sort((a, b) => b.minutes - a.minutes)
      .map((cat) => {
        const percentage = ((cat.minutes / totalMinutes) * 100).toFixed(1)
        return `${cat.name}: ${percentage}% (${Math.floor(cat.minutes / 60)}h ${cat.minutes % 60}m)`
      })

    const distractionMinutes = Array.from(categoryMap.values())
      .filter((c) => c.isDistraction)
      .reduce((sum, c) => sum + c.minutes, 0)

    const summary = `Resumen del día:\n\n${categoryStats.join("\n")}\n\nTiempo total registrado: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m\nDistracciones: ${((distractionMinutes / totalMinutes) * 100).toFixed(1)}%`

    setDailySummary(summary)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const input = form.message as HTMLTextAreaElement
    const message = input.value.trim()

    if (!message) return

    sendMessage({ text: message })
    input.value = ""
  }

  const getRoleInfo = () => {
    const roleInfo = {
      mentor: {
        title: "Tu Mentor Personal",
        description: "Aquí para guiarte y motivarte en tu camino",
        icon: Sparkles,
      },
      terapeuta: {
        title: "Tu Terapeuta de Apoyo",
        description: "Un espacio seguro para reflexionar y crecer",
        icon: Lightbulb,
      },
      maestro: {
        title: "Tu Maestro Exigente",
        description: "Desafiándote a alcanzar tu máximo potencial",
        icon: Bot,
      },
    }

    return roleInfo[llmRole as keyof typeof roleInfo] || roleInfo.mentor
  }

  const roleInfo = getRoleInfo()
  const RoleIcon = roleInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 md:pb-6 md:pt-16 transition-smooth">
      <Navigation />
      <div className="container mx-auto p-6 max-w-4xl space-y-6 animate-fade-in">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <RoleIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{roleInfo.title}</h1>
              <p className="text-muted-foreground">{roleInfo.description}</p>
            </div>
          </div>
        </header>

        {dailySummary && (
          <Card className="transition-smooth hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Resumen del Día
              </CardTitle>
              <CardDescription>Análisis automático de tus actividades</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-sm whitespace-pre-wrap font-sans">{dailySummary}</pre>
            </CardContent>
          </Card>
        )}

        <Card className="flex flex-col h-[500px] transition-smooth hover:shadow-lg">
          <CardHeader>
            <CardTitle>Conversación</CardTitle>
            <CardDescription>Habla con tu {llmRole} sobre tu progreso y desafíos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Comienza la conversación</p>
                  <p className="text-sm mt-1">
                    Ejemplo: "Necesito motivación hoy" o "¿Cómo puedo mejorar mi productividad?"
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""} animate-fade-in`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-4 transition-smooth ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <p key={index} className="text-sm whitespace-pre-wrap">
                            {part.text}
                          </p>
                        )
                      }
                      return null
                    })}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {status === "in_progress" && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                name="message"
                placeholder="Escribe a tu mentor... (ej. 'Necesito motivación hoy')"
                disabled={status === "in_progress"}
                className="resize-none transition-smooth"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e as any)
                  }
                }}
              />
              <Button type="submit" disabled={status === "in_progress"} size="icon" className="h-auto">
                {status === "in_progress" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
