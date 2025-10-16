"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Category } from "@/lib/types"
import { Loader2, Clock } from "lucide-react"

interface QuickLogPanelProps {
  categories: Category[]
  activeActivityId: string | null
  onStartActivity: (categoryId: string) => Promise<void>
  onStopActivity: () => Promise<void>
  isLoading: boolean
}

export function QuickLogPanel({
  categories,
  activeActivityId,
  onStartActivity,
  onStopActivity,
  isLoading,
}: QuickLogPanelProps) {
  const activeCategory = categories.find((c) => c.id === activeActivityId)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Registro Rápido</CardTitle>
            <CardDescription>Selecciona una actividad para comenzar</CardDescription>
          </div>
          {activeCategory && (
            <Badge variant="default" className="gap-2 bg-success text-success-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Activo
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeCategory && (
          <div className="p-4 rounded-lg border-2 border-success bg-success/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-3xl flex-shrink-0">{activeCategory.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg">{activeCategory.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>En progreso...</span>
                  </div>
                </div>
              </div>
              <Button onClick={onStopActivity} disabled={isLoading} variant="destructive" size="sm">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terminar"}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((category) => {
            const isActive = activeActivityId === category.id
            return (
              <Button
                key={category.id}
                onClick={() => onStartActivity(category.id)}
                disabled={isLoading || isActive}
                variant={isActive ? "secondary" : "outline"}
                className="h-auto flex-col gap-2 p-4 hover:scale-105 transition-all"
                style={{
                  borderColor: isActive ? category.color : undefined,
                  borderWidth: isActive ? "2px" : undefined,
                }}
              >
                <span className="text-3xl">{category.emoji}</span>
                <span className="text-sm font-medium text-center leading-tight">{category.name}</span>
              </Button>
            )
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          💡 Tip: Usa <kbd>L</kbd> para acceso rápido al registro
        </p>
      </CardContent>
    </Card>
  )
}
