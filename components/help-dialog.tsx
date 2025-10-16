"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HelpCircle, Keyboard, Target, TrendingUp, MessageSquare } from "lucide-react"

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-4 md:bottom-6 z-40 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-110 bg-transparent"
          aria-label="Ayuda"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Guía Rápida</DialogTitle>
          <DialogDescription>Aprende a usar Autocontrol & Mentoring AI</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Propósito del Sistema
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Esta aplicación te ayuda a desarrollar autocontrol mediante el registro consciente de tus actividades y
              pensamientos. Con el apoyo de un mentor IA, podrás identificar patrones, reducir distracciones y alcanzar
              tus metas personales.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary" />
              Atajos de Teclado
            </h3>
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">Nueva actividad</span>
                <kbd>N</kbd>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">Registrar pensamiento</span>
                <kbd>L</kbd>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">Deshacer última acción</span>
                <kbd>U</kbd>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">Buscar / Filtrar</span>
                <kbd>F</kbd>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Funciones Principales
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Registro Rápido:</strong> Captura actividades con un clic en la página principal
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Timeline:</strong> Visualiza tu día en tiempo real con duraciones automáticas
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Métricas:</strong> Analiza tu productividad y patrones de comportamiento
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Metas y Tareas:</strong> Define objetivos y divide en pasos alcanzables
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Coach IA:</strong> Recibe orientación personalizada según tu rol elegido
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Consejos de Uso
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Registra actividades en el momento para mayor precisión</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Usa el botón Deshacer si cometes un error (disponible 30 segundos)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Revisa tus métricas semanalmente para identificar patrones</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Conversa con tu coach cuando necesites motivación o claridad</span>
              </li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
