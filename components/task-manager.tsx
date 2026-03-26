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
  const [showAllIcons, setShowAllIcons] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // 2. הוספת משימה ל-Database
const handleAddTask = async () => {
  if (!newTaskName.trim()) return
  if (!state.activeSlotId) return
  if (isAdding) return
  setIsAdding(true)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { setIsAdding(false); return }

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
    dispatch({ type: "ADD_TASK", payload: { ...data[0], id: data[0].task_id } })
    setNewTaskName("")
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  } else {
    console.error("Error adding task:", error?.message)
  }
  setIsAdding(false)
}

  // 3. עדכון שם משימה ב-Database
const saveEdit = async () => {
  if (isSaving) return
  if (editingId && editingName.trim()) {
  setIsSaving(true)
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
  setIsSaving(false)
  setEditingId(null)
}

  // 4. מחיקת משימה מה-Database
const handleDeleteTask = async (id: string) => {
  if (deletingIds.has(id)) return
  setDeletingIds(prev => new Set(prev).add(id))
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
    setDeletingIds(prev => { const s = new Set(prev); s.delete(id); return s })
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

      {/* Add Task Form — compact */}
      {showAddForm && (
        <div className="mb-6 neu-flat rounded-2xl bg-background p-4 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          {/* Name + submit button */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="שם הפעילות..."
              className="neu-pressed-sm flex-1 rounded-xl bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskName.trim() || justAdded || isAdding}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-40",
                justAdded ? "bg-green-500" : "bg-primary"
              )}
            >
              {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>

          {/* Icon picker */}
          <div className="flex flex-wrap gap-1.5">
            {(showAllIcons ? availableIcons : availableIcons.slice(0, 8)).map((icon) => (
              <button
                key={icon}
                onClick={() => setNewTaskIcon(icon)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  newTaskIcon === icon
                    ? "neu-pressed bg-background text-primary"
                    : "neu-flat-sm bg-background text-muted-foreground hover:text-primary"
                )}
              >
                <TaskIcon iconKey={icon} className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            ))}
            <button
              onClick={() => setShowAllIcons(!showAllIcons)}
              className="flex h-8 items-center justify-center rounded-lg px-2 text-[10px] font-medium text-primary/60 hover:text-primary"
            >
              {showAllIcons ? 'פחות ▲' : 'עוד ▼'}
            </button>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground shrink-0">משך זמן</span>
            <div className="flex-1">
              <Slider
                value={[newTaskDuration]}
                onValueChange={([val]) => setNewTaskDuration(val)}
                min={1} max={60} step={1}
              />
            </div>
            <span className="text-xs font-bold text-foreground w-12 text-left tabular-nums">{newTaskDuration} דק׳</span>
          </div>
        </div>
      )}

      {/* Task List - JSX ללא שינוי */}
      <div className="flex flex-col gap-3">
        {[...state.tasks].sort((a, b) => Number(b.enabled) - Number(a.enabled)).map((task, index) => (
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
                    <button onClick={saveEdit} disabled={isSaving} className={cn("text-primary", isSaving && "opacity-40 cursor-not-allowed")}><Check className="h-4 w-4" /></button>
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
                  if (togglingIds.has(task.id)) return
                  setTogglingIds(prev => new Set(prev).add(task.id))
                  dispatch({ type: "TOGGLE_TASK", payload: task.id })
                  let query = supabase
                    .from('tasks')
                    .update({ enabled: !task.enabled })
                    .eq('task_id', task.id)

                  if (state.activeSlotId) {
                    query = query.eq('time_slot_id', state.activeSlotId)
                  }

                  await query
                  setTogglingIds(prev => { const s = new Set(prev); s.delete(task.id); return s })
                }}
                disabled={togglingIds.has(task.id)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  task.enabled ? "bg-primary/15 text-primary" : "bg-muted/30 text-muted-foreground/40",
                  togglingIds.has(task.id) && "opacity-50 cursor-not-allowed"
                )}
              >
                <Check className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleDeleteTask(task.id)}
                disabled={deletingIds.has(task.id)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/30 transition-colors hover:text-destructive",
                  deletingIds.has(task.id) && "opacity-40 cursor-not-allowed"
                )}
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
בוא נתחיל  </button>
</div>
      </div>

      
    </div>
  )
}