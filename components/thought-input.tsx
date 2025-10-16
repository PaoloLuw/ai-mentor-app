"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, MessageSquarePlus, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface ThoughtInputProps {
  onSubmit: (content: string) => Promise<void>
}

export function ThoughtInput({ onSubmit }: ThoughtInputProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [charCount, setCharCount] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsLoading(true)
    try {
      await onSubmit(content)
      setContent("")
      setCharCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setCharCount(e.target.value.length)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Registrar Pensamiento</CardTitle>
            <CardDescription>Anota lo que estás pensando o sintiendo</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thought-input">¿Qué estás pensando o sintiendo ahora?</Label>
            <Textarea
              id="thought-input"
              placeholder="Escribe tus pensamientos, emociones o reflexiones..."
              value={content}
              onChange={handleChange}
              disabled={isLoading}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{charCount} caracteres</span>
              {content.trim() && (
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  Listo para guardar
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              💡 Atajo rápido: <kbd>N</kbd>
            </p>
            <Button type="submit" disabled={isLoading || !content.trim()} size="sm">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                "Guardar Pensamiento"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
