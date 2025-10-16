"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Home, MessageSquare, Settings, Target, History } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/metrics", icon: BarChart3, label: "Métricas" },
    { href: "/goals", icon: Target, label: "Metas" },
    { href: "/coach", icon: MessageSquare, label: "Coach" },
    { href: "/history", icon: History, label: "Historial" },
    { href: "/settings", icon: Settings, label: "Ajustes" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t md:top-0 md:bottom-auto md:border-b md:border-t-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around md:justify-start md:gap-2 py-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Button
                key={link.href}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                asChild
                className="flex-col md:flex-row h-auto md:h-9 gap-1 md:gap-2 py-2 md:py-0"
              >
                <Link href={link.href}>
                  <Icon className="h-5 w-5 md:h-4 md:w-4" />
                  <span className="text-xs md:text-sm">{link.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
