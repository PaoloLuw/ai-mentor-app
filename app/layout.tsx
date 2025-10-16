import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { HelpDialog } from "@/components/help-dialog"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Autocontrol & Mentoring AI",
  description: "Aplicación de autoobservación y mentoring con IA",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* 👇 ojo: template string correcta con backticks */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* El ThemeProvider SIEMPRE envuelve a todo el árbol */}
        <ThemeProvider>
          <ThemeToggle />
          <HelpDialog />
          {children}
          {/* ⏱️ Duración global por defecto (5s). 
              Si un toast especifica su propia duration, esa gana. */}
          <Toaster duration={4000} />
        </ThemeProvider>
      </body>
    </html>
  )
}
