"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type LLMRole = "mentor" | "terapeuta" | "maestro"

interface GoalInput {
  title: string
  description: string
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [llmRole, setLlmRole] = useState<LLMRole>("mentor")
  const [goals, setGoals] = useState<GoalInput[]>([
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      }
    }
    checkAuth()
  }, [router])

  const handleGoalChange = (index: number, field: "title" | "description", value: string) => {
    const newGoals = [...goals]
    newGoals[index][field] = value
    setGoals(newGoals)
  }

  const handleComplete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("No hay usuario autenticado")

      // Update user profile with LLM role
      const { error: profileError } = await supabase
        .from("users_profile")
        .update({ llm_role: llmRole })
        .eq("id", user.id)

      if (profileError) throw profileError

      // Seed default categories
      const { error: seedError } = await supabase.rpc("seed_default_categories", { p_user_id: user.id })

      if (seedError) throw seedError

      // Create goals (only non-empty ones)
      const validGoals = goals.filter((g) => g.title.trim() !== "")
      if (validGoals.length > 0) {
        const { error: goalsError } = await supabase.from("goals").insert(
          validGoals.map((g) => ({
            user_id: user.id,
            title: g.title,
            description: g.description || null,
          })),
        )

        if (goalsError) throw goalsError
      }

      router.push("/")
    } catch (error: unknown) {
      console.error("[v0] Onboarding error:", error)
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Bienvenido a Autocontrol & Mentoring AI</CardTitle>
            <CardDescription>Paso {step} de 2: Configuremos tu experiencia</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">¿Cómo quieres que sea tu mentor de IA?</Label>
                  <RadioGroup value={llmRole} onValueChange={(value) => setLlmRole(value as LLMRole)}>
                    <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                      <RadioGroupItem value="mentor" id="mentor" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="mentor" className="font-medium cursor-pointer">
                          Mentor
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Un guía que te acompaña, te motiva y te ayuda a alcanzar tus metas con consejos prácticos.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                      <RadioGroupItem value="terapeuta" id="terapeuta" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="terapeuta" className="font-medium cursor-pointer">
                          Terapeuta
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Un apoyo emocional que te ayuda a reflexionar, gestionar pensamientos y encontrar equilibrio.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                      <RadioGroupItem value="maestro" id="maestro" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="maestro" className="font-medium cursor-pointer">
                          Maestro
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Un educador que te enseña, te desafía y te impulsa a crecer con disciplina y conocimiento.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                <Button onClick={() => setStep(2)} className="w-full">
                  Continuar
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Define tus 3 metas principales (opcional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Estas metas te ayudarán a mantener el foco. Puedes agregar más después.
                  </p>
                </div>

                {goals.map((goal, index) => (
                  <div key={index} className="space-y-3 p-4 rounded-lg border bg-card">
                    <div className="space-y-2">
                      <Label htmlFor={`goal-title-${index}`}>Meta {index + 1}</Label>
                      <Input
                        id={`goal-title-${index}`}
                        placeholder="Ej: Estudiar 2 horas diarias"
                        value={goal.title}
                        onChange={(e) => handleGoalChange(index, "title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`goal-desc-${index}`}>Descripción (opcional)</Label>
                      <Textarea
                        id={`goal-desc-${index}`}
                        placeholder="¿Por qué es importante esta meta?"
                        value={goal.description}
                        onChange={(e) => handleGoalChange(index, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md" role="alert">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1" disabled={isLoading}>
                    Atrás
                  </Button>
                  <Button onClick={handleComplete} className="flex-1" disabled={isLoading}>
                    {isLoading ? "Configurando..." : "Comenzar"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
