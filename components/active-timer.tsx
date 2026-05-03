"use client"
import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useRoutine } from "@/lib/routine-store"
import { TaskIcon } from "@/components/task-icon"
import { Check, SkipForward, Play, Pause, X, Coffee, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export function ActiveTimer() {
  const { state, dispatch } = useRoutine()
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const dingRef = useRef<HTMLAudioElement | null>(null)
  const relaxRef = useRef<HTMLAudioElement | null>(null)
  const countdownRef = useRef<HTMLAudioElement | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Wake Lock — מונע מהמסך להיכבות ומהטאב להירדם
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch {}
    }
    requestWakeLock()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      wakeLockRef.current?.release().catch(() => {})
    }
  }, [])

  useEffect(() => {
    dingRef.current = new Audio('/ding.mp3')
    relaxRef.current = new Audio('/picturewall-relax-piano-268564.mp3')
    countdownRef.current = new Audio('/amishabhatnagar-smartphone-camera-timer-397368.mp3')
  }, [])

  const playDing = () => {
    if (relaxRef.current) { relaxRef.current.pause(); relaxRef.current.currentTime = 0 }
    if (countdownRef.current) { countdownRef.current.pause(); countdownRef.current.currentTime = 0 }
    if (dingRef.current) {
      dingRef.current.currentTime = 0
      dingRef.current.play().catch(() => {})
    }
  }

  const playRelax = () => {
    if (dingRef.current) { dingRef.current.pause(); dingRef.current.currentTime = 0 }
    if (countdownRef.current) { countdownRef.current.pause(); countdownRef.current.currentTime = 0 }
    if (relaxRef.current) {
      relaxRef.current.currentTime = 0
      relaxRef.current.volume = 0.4
      relaxRef.current.play().catch(() => {})
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name
      if (name) setFirstName(name.split(' ')[0])
    })
  }, [])

  // --- Break state (local only, not saved to DB) ---
  const [breakMinutes, setBreakMinutes] = useState(0)       // 0 = no break
  const [showBreakPicker, setShowBreakPicker] = useState(false)
  const [customMinutes, setCustomMinutes] = useState("")
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [breakRemaining, setBreakRemaining] = useState(0)    // seconds left in current break
  const breakIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Break countdown timer
  useEffect(() => {
    if (isOnBreak && breakRemaining > 0) {
      breakIntervalRef.current = setInterval(() => {
        setBreakRemaining(prev => {
          if (prev <= 1) {
            clearInterval(breakIntervalRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current)
    }
  }, [isOnBreak, breakRemaining > 0]) // eslint-disable-line react-hooks/exhaustive-deps

  // When break finishes (remaining hits 0), move to next task
  useEffect(() => {
    if (isOnBreak && breakRemaining === 0) {
      setIsOnBreak(false)
      dispatch({ type: "NEXT_TASK" })
      dispatch({ type: "START_TIMER" })
      playDing()
    }
  }, [isOnBreak, breakRemaining]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fade out relax sound in last 5 seconds of break
  useEffect(() => {
    if (!isOnBreak || !relaxRef.current) return
    if (breakRemaining <= 5 && breakRemaining > 0) {
      relaxRef.current.volume = Math.max(0, (breakRemaining / 5) * 0.4)
    }
  }, [isOnBreak, breakRemaining])

  // Pre-unlock countdown audio on first user interaction
  const unlockCountdown = useCallback(() => {
    if (countdownRef.current) {
      countdownRef.current.volume = 0
      countdownRef.current.play().then(() => {
        countdownRef.current!.pause()
        countdownRef.current!.currentTime = 0
        countdownRef.current!.volume = 1
      }).catch(() => {})
    }
  }, [])

  // Handle task completion with optional break
  const handleCompleteTask = useCallback(() => {
    unlockCountdown()
    if (breakMinutes > 0) {
      // Pause main timer, start break
      dispatch({ type: "PAUSE_TIMER" })
      setBreakRemaining(breakMinutes * 60)
      setIsOnBreak(true)
      playRelax()
    } else {
      playDing()
      dispatch({ type: "NEXT_TASK" })
    }
  }, [breakMinutes, dispatch, unlockCountdown])

  const skipBreak = useCallback(() => {
    if (breakIntervalRef.current) clearInterval(breakIntervalRef.current)
    setIsOnBreak(false)
    setBreakRemaining(0)
    dispatch({ type: "NEXT_TASK" })
    dispatch({ type: "START_TIMER" })
    playDing()
  }, [dispatch])

  const selectBreak = (mins: number) => {
    setBreakMinutes(mins)
    setShowBreakPicker(false)
    setCustomMinutes("")
  }

  const applyCustomBreak = () => {
    const val = parseInt(customMinutes, 10)
    if (val > 0 && val <= 60) {
      selectBreak(val)
    }
  }

  const goToHomeSlots = () => {
    if (breakIntervalRef.current) clearInterval(breakIntervalRef.current)
    setIsOnBreak(false)
    dispatch({ type: "SET_VIEW", payload: "slots" })
    router.push("/dashboard")
  }
  
  // מקבלים את רשימת המשימות הפעילות בלבד
  const activeTasks = state.tasks.filter((t: any) => t.enabled)
  const currentTask = activeTasks[state.activeTaskIndex]
  const nextTask = activeTasks[state.activeTaskIndex + 1]

  // חישוב זמן שנותר למשימה הנוכחית
  const totalSeconds = (currentTask?.duration || 0) * 60
  const remainingSeconds = Math.max(0, totalSeconds - state.elapsedSeconds)

  // Countdown sound — play at last 3 seconds
  useEffect(() => {
    if (!state.isTimerRunning || isOnBreak || !currentTask) return
    if (remainingSeconds === 3 && totalSeconds > 3) {
      if (countdownRef.current) {
        countdownRef.current.currentTime = 0
        countdownRef.current.play().catch(() => {})
      }
    }
  }, [remainingSeconds, state.isTimerRunning, isOnBreak, currentTask, totalSeconds])

  // Auto-complete task when timer reaches 0
  useEffect(() => {
    if (!state.isTimerRunning || isOnBreak || !currentTask) return
    if (remainingSeconds === 0 && totalSeconds > 0) {
      handleCompleteTask()
    }
  }, [remainingSeconds, state.isTimerRunning, isOnBreak, currentTask, totalSeconds, handleCompleteTask])

  // חישוב זמן כולל שנשאר לכל המשימות (כולל הפסקות)
  const remainingTasks = activeTasks.length - state.activeTaskIndex - 1
  const breaksTotalSeconds = breakMinutes > 0 ? remainingTasks * breakMinutes * 60 : 0
  const totalRemainingSeconds = remainingSeconds +
    activeTasks.slice(state.activeTaskIndex + 1).reduce((sum: number, t: any) => sum + t.duration * 60, 0) +
    breaksTotalSeconds + (isOnBreak ? breakRemaining : 0)
  const totalRemainingMins = Math.ceil(totalRemainingSeconds / 60)
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentTask && !isOnBreak) {
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
            חזרה לזמנים
          </button>

        </div>
      </div>
    )
  }

  // --- Break screen ---
  if (isOnBreak) {
    const breakTotal = breakMinutes * 60
    const nextTaskForBreak = activeTasks[state.activeTaskIndex + 1]
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm">

          {/* Break timer circle */}
          <div className="flex justify-center py-8">
            <div className="relative flex items-center justify-center w-48 h-48 rounded-full bg-background shadow-[8px_8px_20px_rgba(0,0,0,0.15),-6px_-6px_16px_rgba(255,255,255,0.06)]">
              <div className="text-center">
                <Coffee className="mx-auto mb-2 h-6 w-6 text-primary/50" />
                <span className="text-4xl font-black text-foreground tabular-nums">
                  {formatTime(breakRemaining)}
                </span>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">הפסקה</p>
              </div>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="5" className="text-primary/10" />
                <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="5"
                  strokeDasharray={553} strokeDashoffset={553 - (553 * (breakRemaining / (breakTotal || 1)))}
                  strokeLinecap="round" className="text-primary transition-all duration-1000" />
              </svg>
            </div>
          </div>

          {/* Next task preview */}
          {nextTaskForBreak && (
            <div className="mb-6 text-center">
              <p className="text-xs text-muted-foreground mb-1">המשימה הבאה</p>
              <p className="text-base font-bold text-foreground">{nextTaskForBreak.name}</p>
            </div>
          )}

          {/* Skip break button */}
          <button
            onClick={skipBreak}
            className="neu-flat flex w-full items-center justify-center gap-2 rounded-[20px] bg-background py-4 text-sm font-semibold text-primary transition-all hover:scale-[1.02] active:neu-pressed active:scale-[0.98]"
          >
            <SkipForward className="h-4 w-4" />
            דלג על ההפסקה
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4">
      <div className="w-full max-w-sm">

      {/* ── Header ── */}
      <div className="pt-8 pb-4">
        {/* Top row: greeting + close */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {firstName ? `היי ${firstName}` : 'היי'} 👋
            </p>
            <p className="text-lg font-black text-foreground">
              {activeTasks.length} משימות
            </p>
          </div>
          <button
            onClick={goToHomeSlots}
            className="neu-flat-sm flex h-9 w-9 items-center justify-center rounded-xl bg-background text-muted-foreground transition-all hover:scale-[1.05] hover:text-primary active:neu-pressed active:scale-[0.95]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex justify-center py-8">
        <div className="relative flex items-center justify-center w-56 h-56 rounded-full bg-background shadow-[8px_8px_20px_rgba(0,0,0,0.15),-6px_-6px_16px_rgba(255,255,255,0.06)]">
          <div className="text-center">
            <span className="text-5xl font-black text-foreground tabular-nums">
              {formatTime(remainingSeconds)}
            </span>
            <p className="text-xs text-muted-foreground mt-2 font-medium tracking-widest uppercase">
דקות נותרו            </p>
          </div>
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="112" cy="112" r="104" fill="none" stroke="currentColor" strokeWidth="6" className="text-primary/10" />
            <circle cx="112" cy="112" r="104" fill="none" stroke="currentColor" strokeWidth="6"
              strokeDasharray={654} strokeDashoffset={654 - (654 * (remainingSeconds / (totalSeconds || 1)))}
              strokeLinecap="round" className="text-primary transition-all duration-1000" />
          </svg>
        </div>
      </div>

      {/* סה״כ נשאר + כפתור הפסקות */}
      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="neu-pressed flex items-center gap-2 rounded-full bg-background px-5 py-2">
          <span className="text-xs text-muted-foreground">סה״כ נשאר</span>
          <span className="text-sm font-black text-primary tabular-nums">{totalRemainingMins} דק׳</span>
        </div>
        <button
          onClick={() => setShowBreakPicker(!showBreakPicker)}
          className={cn(
            "neu-flat flex items-center gap-1.5 rounded-full bg-background px-4 py-2 text-xs font-semibold transition-all hover:scale-[1.03] active:neu-pressed active:scale-[0.97]",
            breakMinutes > 0 ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Coffee className="h-3.5 w-3.5" />
          {breakMinutes > 0 ? `${breakMinutes} דק׳` : "הפסקות"}
        </button>
      </div>

      {/* Break picker */}
      {showBreakPicker && (
        <div className="mb-4 neu-pressed rounded-[20px] bg-background p-4">
          <p className="mb-3 text-center text-xs font-bold text-muted-foreground">הפסקה בין משימות</p>
          <div className="flex justify-center gap-2 mb-3">
            {[2, 5, 10].map(mins => (
              <button
                key={mins}
                onClick={() => selectBreak(mins)}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
                  breakMinutes === mins
                    ? "bg-primary text-white shadow-[0_4px_12px_rgba(111,163,199,0.4)]"
                    : "neu-flat bg-background text-muted-foreground hover:text-primary"
                )}
              >
                {mins} דק׳
              </button>
            ))}
          </div>
          {/* Custom input */}
          {/* <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="60"
              placeholder="אחר..."
              value={customMinutes}
              onChange={e => setCustomMinutes(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyCustomBreak()}
              className="neu-pressed flex-1 rounded-xl bg-background px-3 py-2 text-center text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            <button
              onClick={applyCustomBreak}
              className="neu-flat rounded-xl bg-background px-4 py-2 text-sm font-bold text-primary transition-all hover:scale-[1.03] active:neu-pressed"
            >
              הגדר
            </button>
          </div> */}
          {/* Remove break option */}
          {breakMinutes > 0 && (
            <button
              onClick={() => selectBreak(0)}
              className="mt-3 w-full text-center text-xs text-muted-foreground/60 hover:text-red-400 transition-colors"
            >
              ביטול הפסקות
            </button>
          )}
        </div>
      )}

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
            onClick={handleCompleteTask}
            className="neu-flat flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background text-primary transition-all hover:scale-[1.05] active:neu-pressed active:scale-[0.95]"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
        {breakMinutes > 0 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/50">
            <Coffee className="h-3 w-3" />
            <span>הפסקה של {breakMinutes} דק׳ אחרי כל משימה</span>
          </div>
        )}
      </div>

      
      {/* כפתורי שליטה */}
      <div className="flex justify-center gap-5 pb-8">
        <button
          onClick={() => {
            dispatch({ type: "PAUSE_TIMER" })
            dispatch({ type: "RESTART_ROUTINE" })
          }}
          className="neu-flat flex h-16 w-16 items-center justify-center rounded-full bg-background text-muted-foreground transition-all hover:scale-[1.05] active:neu-pressed"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button
          onClick={() => dispatch({ type: state.isTimerRunning ? "PAUSE_TIMER" : "START_TIMER" })}
          className="neu-flat flex h-16 w-16 items-center justify-center rounded-full bg-background text-primary transition-all hover:scale-[1.05] active:neu-pressed"
        >
          {state.isTimerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button onClick={handleCompleteTask} className="neu-flat flex h-16 w-16 items-center justify-center rounded-full bg-background text-muted-foreground transition-all hover:scale-[1.05] active:neu-pressed">
          <SkipForward className="w-6 h-6" />
        </button>
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

      </div>
    </div>
  )
}