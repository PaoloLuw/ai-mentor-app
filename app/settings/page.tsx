"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/types"
import { Loader2, LogOut, SettingsIcon, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type LLMRole = "mentor" | "terapeuta" | "maestro"

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [llmRole, setLlmRole] = useState<LLMRole>("mentor")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase.from("users_profile").select("*").eq("id", user.id).single()

      if (error) {
        console.error("[v0] Error loading profile:", error)
        setIsLoading(false)
        return
      }

      setProfile(data)
      setDisplayName(data.display_name || "")
      setLlmRole(data.llm_role)
      setIsLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSaveProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("users_profile")
      .update({
        display_name: displayName,
        llm_role: llmRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)

    if (error) {
      console.error("[v0] Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Guardado",
        description: "Tu configuración ha sido actualizada",
      })
    }

    setIsSaving(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center pb-20 md:pb-6 md:pt-16">
        <Navigation />
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 md:pb-6 md:pt-16">
      <Navigation />
      <div className="container mx-auto p-6 max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Configuración
          </h1>
          <p className="text-muted-foreground">Personaliza tu experiencia</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>Información básica de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Nombre</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personalidad del Coach</CardTitle>
            <CardDescription>Elige cómo quieres que te acompañe la IA</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={llmRole} onValueChange={(value) => setLlmRole(value as LLMRole)}>
              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                <RadioGroupItem value="mentor" id="mentor-setting" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="mentor-setting" className="font-medium cursor-pointer">
                    Mentor
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Un guía que te acompaña, te motiva y te ayuda a alcanzar tus metas con consejos prácticos.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                <RadioGroupItem value="terapeuta" id="terapeuta-setting" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="terapeuta-setting" className="font-medium cursor-pointer">
                    Terapeuta
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Un apoyo emocional que te ayuda a reflexionar, gestionar pensamientos y encontrar equilibrio.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                <RadioGroupItem value="maestro" id="maestro-setting" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="maestro-setting" className="font-medium cursor-pointer">
                    Maestro
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Un educador que te enseña, te desafía y te impulsa a crecer con disciplina y conocimiento.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Guardar Cambios
          </Button>
        </div>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
            <CardDescription>Acciones irreversibles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignOut} variant="destructive" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
