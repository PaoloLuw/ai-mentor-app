"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Valor inicial seguro para SSR
  const [theme, setTheme] = useState<Theme>("light")

  // Cargar preferencia desde Supabase (si hay sesión) y aplicar clase a <html>
  useEffect(() => {
    const applyClass = (t: Theme) => {
      // Aplica/remueve clase tailwind 'dark' en <html>
      document.documentElement.classList.toggle("dark", t === "dark")
    }

    const loadTheme = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data } = await supabase
            .from("users_profile")
            .select("theme")
            .eq("id", user.id)
            .single()

          if (data?.theme === "dark" || data?.theme === "light") {
            setTheme(data.theme as Theme)
            applyClass(data.theme as Theme)
            return
          }
        }

        // Si no hay user o no hay preferencia guardada, usar media-query del sistema
        const systemPrefersDark =
          typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches

        const fallback: Theme = systemPrefersDark ? "dark" : "light"
        setTheme(fallback)
        applyClass(fallback)
      } catch {
        // En caso de error, deja 'light' y sin romper la UI
        setTheme("light")
        document.documentElement.classList.remove("dark")
      }
    }

    loadTheme()
  }, [])

  const toggleTheme = async () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase
          .from("users_profile")
          .update({ theme: newTheme })
          .eq("id", user.id)
      }
    } catch {
      // Silencioso: si falla el guardado, no bloquea el toggle en UI
    }
  }

  // 🔴 Importante: NUNCA devolver children sin el Provider
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
