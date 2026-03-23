"use client"

import { useState } from "react"
import { useRoutine, type RoutineTask } from "@/lib/routine-store"
import { TaskIcon, availableIcons } from "@/components/task-icon"
import { Slider } from "@/components/ui/slider"
import { createBrowserClient } from '@supabase/ssr' // הוספנו את זה
import {
  GripVertical,
  Plus,
  Trash2,
  Clock,
  Pencil,
  X,
  Check,
  Play
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation";    // חדש

export function TaskManager() {
  const { state, dispatch, enabledTasks, totalDuration } = useRoutine()
  
  // יצירת לקוח Supabase
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const router = useRouter();                   // חדיש

  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskIcon, setNewTaskIcon] = useState("sparkles")
  const [newTaskDuration, setNewTaskDuration] = useState(10)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // 2. הוספת משימה ל-Database
const handleAddTask = async () => {
  if (!newTaskName.trim()) return
  if (!state.activeSlotId) return
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // יוצרים מזהה ייחודי חדש למשימה
  const newTaskId = crypto.randomUUID()

  const newTaskForDB = {
    task_id: newTaskId,
    name: newTaskName.trim(),
    icon: newTaskIcon,
    duration: newTaskDuration,
    enabled: true,
    user_id: user.id,
    time_slot_id: state.activeSlotId
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([newTaskForDB])
    .select()

  if (!error && data) {
    // חשוב: אנחנו מעדכנים את ה-Store עם ה-task_id כשדה ה-id
    dispatch({ type: "ADD_TASK", payload: { ...data[0], id: data[0].task_id } })
    setNewTaskName("")
    setShowAddForm(false)
  } else {
    console.error("Error adding task:", error?.message)
  }
}

  // 3. עדכון שם משימה ב-Database
const saveEdit = async () => {
  if (editingId && editingName.trim()) {
    let query = supabase
      .from('tasks')
      .update({ name: editingName.trim() })
      .eq('task_id', editingId)

    if (state.activeSlotId) {
      query = query.eq('time_slot_id', state.activeSlotId)
    }

    const { error } = await query

    if (!error) {
      dispatch({
        type: "UPDATE_TASK_NAME",
        payload: { id: editingId, name: editingName.trim() },
      })
    }
  }
  setEditingId(null)
}

  // 4. מחיקת משימה מה-Database
const handleDeleteTask = async (id: string) => {
  let query = supabase
    .from('tasks')
    .delete()
    .eq('task_id', id)

  if (state.activeSlotId) {
    query = query.eq('time_slot_id', state.activeSlotId)
  }

  const { error } = await query

  if (!error) {
    dispatch({ type: "REMOVE_TASK", payload: id })
  } else {
    console.error("Delete failed:", error.message)
  }
}

  // 5. עדכון Duration ב-Database
  const handleDurationChange = async (id: string, val: number) => {
    dispatch({
      type: "UPDATE_TASK_DURATION",
      payload: { id, duration: val },
    })
    
    // מעדכן רק את המשימה של הזמן הפעיל
    let query = supabase
      .from('tasks')
      .update({ duration: val })
      .eq('task_id', id)

    if (state.activeSlotId) {
      query = query.eq('time_slot_id', state.activeSlotId)
    }

    await query
  }

  const startEditing = (task: RoutineTask) => {
    setEditingId(task.id)
    setEditingName(task.name)
  }

  // Drag and drop handlers (נשארים ללא שינוי בעיצוב)
  const handleDragStart = (index: number) => setDraggedIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const tasks = [...state.tasks]
    const [moved] = tasks.splice(draggedIndex, 1)
    tasks.splice(index, 0, moved)
    dispatch({ type: "REORDER_TASKS", payload: tasks })
    setDraggedIndex(null)
    setDragOverIndex(null)
    
    // כאן כדאי להוסיף בעתיד עדכון של "סדר" ב-Database אם יש לך עמודת position
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  if (state.isLoadingTasks) {
    return (
      <div className="px-4 py-6 flex items-center justify-center h-40">
        <p className="text-muted-foreground text-sm">טוען משימות...</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* כל ה-JSX נשאר זהה לחלוטין כדי לא לפגוע בעיצוב שלך */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Routine</h2>
          <p className="text-sm text-muted-foreground">
            {enabledTasks.length} tasks, {totalDuration} min total
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
            showAddForm
              ? "neu-pressed bg-background text-primary"
              : "neu-flat-sm bg-background text-muted-foreground hover:text-foreground hover:scale-[1.05]"
          )}
        >
          {showAddForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {/* Add Task Form - JSX ללא שינוי */}
      {showAddForm && (
        <div className="mb-6 neu-flat rounded-2xl bg-background p-5 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Add Custom Task</h3>
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Task name..."
            className="mb-4 w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 neu-pressed-sm focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          />

          <p className="mb-2 text-xs font-medium text-muted-foreground">Choose Icon</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {availableIcons.map((icon) => (
              <button
                key={icon}
                onClick={() => setNewTaskIcon(icon)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                  newTaskIcon === icon
                    ? "neu-pressed bg-background text-primary"
                    : "neu-flat-sm bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                <TaskIcon iconKey={icon} className="h-5 w-5" strokeWidth={1.5} />
              </button>
            ))}
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Duration</p>
              <span className="text-sm font-semibold text-foreground tabular-nums">{newTaskDuration} min</span>
            </div>
            <Slider
              value={[newTaskDuration]}
              onValueChange={([val]) => setNewTaskDuration(val)}
              min={1}
              max={60}
              step={1}
            />
          </div>

          <button
            onClick={handleAddTask}
            disabled={!newTaskName.trim()}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
          >
            Add Task
          </button>
        </div>
      )}

      {/* Task List - JSX ללא שינוי */}
      <div className="flex flex-col gap-3">
        {state.tasks.map((task, index) => (
          <div
            key={task.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "neu-flat-sm rounded-2xl bg-background p-4 transition-all duration-200",
              draggedIndex === index && "opacity-50 scale-95",
              dragOverIndex === index && draggedIndex !== index && "ring-2 ring-primary/30",
              !task.enabled && "opacity-60"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="cursor-grab touch-none text-muted-foreground/40 active:cursor-grabbing">
                <GripVertical className="h-5 w-5" />
              </div>

              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                task.enabled ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
              )}>
                <TaskIcon iconKey={task.icon} className="h-5 w-5" strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                {editingId === task.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit()
                        if (e.key === "Escape") setEditingId(null)
                      }}
                      className="flex-1 rounded-lg bg-transparent px-2 py-1 text-sm text-foreground neu-pressed-sm focus:outline-none"
                      autoFocus
                    />
                    <button onClick={saveEdit} className="text-primary"><Check className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{task.name}</span>
                    <button onClick={() => startEditing(task)} className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground"><Pencil className="h-3 w-3" /></button>
                  </div>
                )}
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground tabular-nums">{task.duration} min</span>
                </div>
              </div>

              {/* Toggle - מעדכן ב-Database */}
              <button
                onClick={async () => {
                  dispatch({ type: "TOGGLE_TASK", payload: task.id })
                  let query = supabase
                    .from('tasks')
                    .update({ enabled: !task.enabled })
                    .eq('task_id', task.id)

                  if (state.activeSlotId) {
                    query = query.eq('time_slot_id', state.activeSlotId)
                  }

                  await query
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  task.enabled ? "bg-primary/15 text-primary" : "bg-muted/30 text-muted-foreground/40"
                )}
              >
                <Check className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleDeleteTask(task.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/30 transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {task.enabled && (
              <div className="mt-3 ml-8 pr-2">
                <Slider
                  value={[task.duration]}
                  onValueChange={([val]) => handleDurationChange(task.id, val)}
                  min={1}
                  max={60}
                  step={1}
                />
              </div>
            )}
          </div>
          
        ))}
        {/* הוסיפי את זה בתחתית ה-div הראשי של ה-TaskManager */}
<div className="mt-10 mb-6 flex justify-center">
  <button
    onClick={() => {
      dispatch({ type: "START_ROUTINE" });
      router.push("/active-timer");        // ← ניווט
    }}
    className="neu-flat flex items-center gap-3 rounded-[30px] bg-primary px-12 py-5 text-white font-bold text-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
  >
    <Play className="h-6 w-6 fill-current" />
    בואי נתחיל!
  </button>
</div>
      </div>

      
    </div>
  )
}