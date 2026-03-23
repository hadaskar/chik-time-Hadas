"use client"
import React from "react"
import { useRouter } from "next/navigation"
import { useRoutine } from "@/lib/routine-store"
import { TaskIcon } from "@/components/task-icon"
import { Check, SkipForward, Play, Pause, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ActiveTimer() {
  const { state, dispatch } = useRoutine()
  const router = useRouter()

  const goToHomeSlots = () => {
    dispatch({ type: "SET_VIEW", payload: "slots" })
    router.push("/")
  }
  
  // מקבלים את רשימת המשימות הפעילות בלבד
  const activeTasks = state.tasks.filter((t: any) => t.enabled)
  const currentTask = activeTasks[state.activeTaskIndex]
  const nextTask = activeTasks[state.activeTaskIndex + 1]

  // חישוב זמן שנותר למשימה הנוכחית
  const totalSeconds = (currentTask?.duration || 0) * 60
  const remainingSeconds = Math.max(0, totalSeconds - state.elapsedSeconds)
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentTask) {
    const totalTasks = activeTasks.length
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm">

          {/* Icon */}
          <div className="mb-10 flex justify-center">
            <div className="neu-flat flex h-28 w-28 items-center justify-center rounded-full bg-background">
              <Check className="h-12 w-12 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text */}
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-primary/50">routine complete</p>
            <h2 className="text-3xl font-black text-foreground">כל הכבוד</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              סיימת את כל {totalTasks} המשימות בהצלחה
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 neu-pressed rounded-[24px] bg-background p-5">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-2xl font-black text-primary">{totalTasks}</p>
                <p className="mt-1 text-xs text-muted-foreground">משימות</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-black text-primary">
                  {activeTasks.reduce((s: number, t: any) => s + t.duration, 0)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">דקות</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-black text-primary">100%</p>
                <p className="mt-1 text-xs text-muted-foreground">הושלם</p>
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={goToHomeSlots}
            className="neu-flat flex w-full items-center justify-center rounded-[20px] bg-background py-4 text-sm font-semibold text-primary transition-all hover:scale-[1.02] active:neu-pressed active:scale-[0.98]"
          >
            חזרה לדף הבית
          </button>

        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">

      {/* 1. הטיימר הראשי */}
      <div className="flex justify-center py-8">
        <div className="relative flex items-center justify-center w-56 h-56 rounded-full bg-background shadow-[16px_16px_32px_#bebebe,-16px_-16px_32px_#ffffff]">
          <div className="text-center">
            <span className="text-5xl font-black text-foreground tabular-nums">
              {formatTime(remainingSeconds)}
            </span>
            <p className="text-xs text-muted-foreground mt-2 font-medium tracking-widest uppercase">
              נותרו דקות
            </p>
          </div>
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="112" cy="112" r="104" fill="none" stroke="currentColor" strokeWidth="6" className="text-primary/10" />
            <circle cx="112" cy="112" r="104" fill="none" stroke="currentColor" strokeWidth="6"
              strokeDasharray={654} strokeDashoffset={654 - (654 * (remainingSeconds / (totalSeconds || 1)))}
              strokeLinecap="round" className="text-primary transition-all duration-1000" />
          </svg>
        </div>
      </div>

      {/* 2. המשימה הנוכחית */}
      <div className="neu-pressed p-5 rounded-[24px] bg-background mb-4">
        <div className="flex items-center gap-4">
          <div className="neu-flat flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background">
            <TaskIcon iconKey={currentTask.icon} className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">עכשיו</span>
            <h2 className="text-lg font-bold text-foreground truncate">{currentTask.name}</h2>
          </div>
          <button
            onClick={() => dispatch({ type: "NEXT_TASK" })}
            className="neu-flat flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background text-primary transition-all hover:scale-[1.05] active:neu-pressed active:scale-[0.95]"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. משימות הבאות */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">המשימות הבאות</p>
        <div className="flex flex-col gap-2">
          {activeTasks.slice(state.activeTaskIndex + 1, state.activeTaskIndex + 4).map((task: any) => (
            <div key={task.id} className="neu-flat flex items-center gap-3 rounded-[18px] bg-background px-4 py-3 opacity-60">
              <TaskIcon iconKey={task.icon} className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-sm text-muted-foreground">{task.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{task.duration} דק׳</span>
            </div>
          ))}
          {activeTasks.length <= state.activeTaskIndex + 1 && (
            <p className="text-center text-xs text-muted-foreground py-3">זו המשימה האחרונה</p>
          )}
        </div>
      </div>

      {/* כפתורי שליטה */}
      <div className="flex justify-center gap-5 pb-6">
        <button onClick={goToHomeSlots} className="neu-flat flex h-14 w-14 items-center justify-center rounded-full bg-background text-muted-foreground transition-all hover:scale-[1.05] active:neu-pressed">
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={() => dispatch({ type: state.isTimerRunning ? "PAUSE_TIMER" : "START_TIMER" })}
          className="neu-flat flex h-14 w-14 items-center justify-center rounded-full bg-background text-primary transition-all hover:scale-[1.05] active:neu-pressed"
        >
          {state.isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button onClick={() => dispatch({ type: "NEXT_TASK" })} className="neu-flat flex h-14 w-14 items-center justify-center rounded-full bg-background text-muted-foreground transition-all hover:scale-[1.05] active:neu-pressed">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      </div>
    </div>
  )
}