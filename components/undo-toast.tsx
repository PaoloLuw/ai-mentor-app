"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Undo2, CheckCircle2 } from "lucide-react"

export function useUndoToast() {
  const { toast } = useToast()

  const showUndoToast = (message: string, onUndo: () => void) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span>{message}</span>
        </div>
      ),
      description: "Tienes 4 segundos para deshacer esta acción",
      action: (
        <Button
          size="sm"
          variant="outline"
          onClick={onUndo}
          className="gap-2 bg-transparent"
          data-action="undo"
          aria-label="Deshacer"
        >
          <Undo2 className="h-4 w-4" />
          Deshacer
        </Button>
      ),
      // ⏱️ este se muestra 10s; si lo prefieres igual al global, quita esta línea
      duration: 4000,
    })
  }

  return { showUndoToast }
}
