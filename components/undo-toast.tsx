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
      description: "Tienes 30 segundos para deshacer esta acción",
      action: (
        <Button size="sm" variant="outline" onClick={onUndo} className="gap-2 bg-transparent">
          <Undo2 className="h-4 w-4" />
          Deshacer
        </Button>
      ),
      duration: 30000,
    })
  }

  return { showUndoToast }
}
