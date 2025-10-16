"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUndoToast } from "@/components/undo-toast"
import { createClient } from "@/lib/supabase/client"
import type { Goal, Task } from "@/lib/types"
import { CheckCircle2, Circle, Loader2, Plus, Target, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [newGoal, setNewGoal] = useState({ title: "", description: "", target_date: "" })
  const [newTask, setNewTask] = useState({ title: "", description: "", due_date: "" })
  const router = useRouter()
  const { showUndoToast } = useUndoToast()

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)
      await loadGoals(user.id)
      await loadTasks(user.id)
    }

    loadData()
  }, [router])

  const loadGoals = async (uid: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error loading goals:", error)
      return
    }

    setGoals(data || [])
    setIsLoading(false)
  }

  const loadTasks = async (uid: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error loading tasks:", error)
      return
    }

    setTasks(data || [])
  }

  const handleCreateGoal = async () => {
    if (!userId || !newGoal.title.trim()) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        title: newGoal.title,
        description: newGoal.description || null,
        target_date: newGoal.target_date || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating goal:", error)
      return
    }

    await loadGoals(userId)
    setIsDialogOpen(false)
    setNewGoal({ title: "", description: "", target_date: "" })

    showUndoToast("Meta creada", async () => {
      await supabase.from("goals").delete().eq("id", data.id)
      await loadGoals(userId)
    })
  }

  const handleToggleGoal = async (goalId: string, isCompleted: boolean) => {
    if (!userId) return

    const supabase = createClient()
    const { error } = await supabase
      .from("goals")
      .update({ is_completed: !isCompleted, updated_at: new Date().toISOString() })
      .eq("id", goalId)

    if (error) {
      console.error("[v0] Error updating goal:", error)
      return
    }

    await loadGoals(userId)

    showUndoToast(isCompleted ? "Meta marcada como pendiente" : "Meta completada", async () => {
      await supabase.from("goals").update({ is_completed: isCompleted }).eq("id", goalId)
      await loadGoals(userId)
    })
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!userId) return

    const supabase = createClient()
    const goalToDelete = goals.find((g) => g.id === goalId)
    if (!goalToDelete) return

    const { error } = await supabase.from("goals").delete().eq("id", goalId)

    if (error) {
      console.error("[v0] Error deleting goal:", error)
      return
    }

    await loadGoals(userId)

    showUndoToast("Meta eliminada", async () => {
      await supabase.from("goals").insert(goalToDelete)
      await loadGoals(userId)
    })
  }

  const handleCreateTask = async () => {
    if (!userId || !newTask.title.trim()) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        goal_id: selectedGoalId,
        title: newTask.title,
        description: newTask.description || null,
        due_date: newTask.due_date || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating task:", error)
      return
    }

    await loadTasks(userId)
    setIsTaskDialogOpen(false)
    setNewTask({ title: "", description: "", due_date: "" })
    setSelectedGoalId(null)

    showUndoToast("Tarea creada", async () => {
      await supabase.from("tasks").delete().eq("id", data.id)
      await loadTasks(userId)
    })
  }

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    if (!userId) return

    const supabase = createClient()
    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: !isCompleted, updated_at: new Date().toISOString() })
      .eq("id", taskId)

    if (error) {
      console.error("[v0] Error updating task:", error)
      return
    }

    await loadTasks(userId)

    showUndoToast(isCompleted ? "Tarea marcada como pendiente" : "Tarea completada", async () => {
      await supabase.from("tasks").update({ is_completed: isCompleted }).eq("id", taskId)
      await loadTasks(userId)
    })
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!userId) return

    const supabase = createClient()
    const taskToDelete = tasks.find((t) => t.id === taskId)
    if (!taskToDelete) return

    const { error } = await supabase.from("tasks").delete().eq("id", taskId)

    if (error) {
      console.error("[v0] Error deleting task:", error)
      return
    }

    await loadTasks(userId)

    showUndoToast("Tarea eliminada", async () => {
      await supabase.from("tasks").insert(taskToDelete)
      await loadTasks(userId)
    })
  }

  const getTasksForGoal = (goalId: string) => {
    return tasks.filter((t) => t.goal_id === goalId)
  }

  const getStandaloneTasks = () => {
    return tasks.filter((t) => !t.goal_id)
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
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Metas y Tareas</h1>
            <p className="text-muted-foreground">Organiza y alcanza tus objetivos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Meta</DialogTitle>
                <DialogDescription>Define una meta que quieras alcanzar</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-title">Título</Label>
                  <Input
                    id="goal-title"
                    placeholder="Ej: Estudiar 2 horas diarias"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-description">Descripción (opcional)</Label>
                  <Textarea
                    id="goal-description"
                    placeholder="¿Por qué es importante esta meta?"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-date">Fecha objetivo (opcional)</Label>
                  <Input
                    id="goal-date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateGoal} disabled={!newGoal.title.trim()}>
                  Crear Meta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        {goals.length === 0 && tasks.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No tienes metas aún</h3>
            <p className="text-muted-foreground mb-4">Comienza creando tu primera meta para organizar tu progreso</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Meta
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const goalTasks = getTasksForGoal(goal.id)
              const completedTasks = goalTasks.filter((t) => t.is_completed).length

              return (
                <Card key={goal.id} className={goal.is_completed ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => handleToggleGoal(goal.id, goal.is_completed)}
                          className="mt-1 hover:scale-110 transition-transform"
                        >
                          {goal.is_completed ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                          )}
                        </button>
                        <div className="flex-1">
                          <CardTitle className={goal.is_completed ? "line-through" : ""}>{goal.title}</CardTitle>
                          {goal.description && <CardDescription className="mt-1">{goal.description}</CardDescription>}
                          {goal.target_date && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Fecha objetivo: {new Date(goal.target_date).toLocaleDateString("es-ES")}
                            </p>
                          )}
                          {goalTasks.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {completedTasks} de {goalTasks.length} tareas completadas
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {goalTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={task.is_completed}
                              onCheckedChange={() => handleToggleTask(task.id, task.is_completed)}
                            />
                            <div className="flex-1">
                              <p className={`text-sm ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                                {task.title}
                              </p>
                              {task.due_date && (
                                <p className="text-xs text-muted-foreground">
                                  Vence: {new Date(task.due_date).toLocaleDateString("es-ES")}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedGoalId(goal.id)
                          setIsTaskDialogOpen(true)
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Tarea
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {getStandaloneTasks().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tareas sin Meta</CardTitle>
                  <CardDescription>Tareas que no están asociadas a ninguna meta específica</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getStandaloneTasks().map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={task.is_completed}
                            onCheckedChange={() => handleToggleTask(task.id, task.is_completed)}
                          />
                          <div className="flex-1">
                            <p className={`text-sm ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </p>
                            {task.due_date && (
                              <p className="text-xs text-muted-foreground">
                                Vence: {new Date(task.due_date).toLocaleDateString("es-ES")}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setSelectedGoalId(null)
                setIsTaskDialogOpen(true)
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Tarea Independiente
            </Button>
          </div>
        )}

        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarea</DialogTitle>
              <DialogDescription>
                {selectedGoalId ? "Agrega una tarea a tu meta" : "Crea una tarea independiente"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Título</Label>
                <Input
                  id="task-title"
                  placeholder="Ej: Leer capítulo 3"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">Descripción (opcional)</Label>
                <Textarea
                  id="task-description"
                  placeholder="Detalles adicionales..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-date">Fecha de vencimiento (opcional)</Label>
                <Input
                  id="task-date"
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsTaskDialogOpen(false)
                  setSelectedGoalId(null)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>
                Crear Tarea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
