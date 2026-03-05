"use client"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes" // את תצטרכי להתקין את זה
import { useEffect,useMemo } from "react"
import { useRoutine } from "@/lib/routine-store"
import { ProgressRing } from "@/components/progress-ring"
import { TaskIcon } from "@/components/task-icon"
import { Play, Pause, SkipForward, RotateCcw, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
export function ActiveTimer() {
  // השתמשי בזה כדי שהצליל ייטען רק פעם אחת ולא בכל שניה
  const audio = useMemo(() => typeof Audio !== "undefined" ? new Audio("/ding.mp3") : null, []);

  const playSound = () => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log("Audio play blocked", e));
    }
  };
const { theme, setTheme } = useTheme()
  const { state, dispatch, enabledTasks, totalDuration } = useRoutine()

  const currentTask = enabledTasks[state.activeTaskIndex]
  const nextTask = enabledTasks[state.activeTaskIndex + 1]

  const taskDurationSeconds = currentTask ? currentTask.duration * 60 : 0
  const progress = taskDurationSeconds > 0 ? state.elapsedSeconds / taskDurationSeconds : 0
  const clampedProgress = Math.min(progress, 1)

  const remainingSeconds = Math.max(taskDurationSeconds - state.elapsedSeconds, 0)
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  // Overall progress
  const completedMinutes = enabledTasks
    .slice(0, state.activeTaskIndex)
    .reduce((sum, t) => sum + t.duration, 0)
  const currentTaskProgress = currentTask
    ? Math.min(state.elapsedSeconds / 60, currentTask.duration)
    : 0
  const overallProgress =
    totalDuration > 0
      ? ((completedMinutes + currentTaskProgress) / totalDuration) * 100
      : 0

  // Timer tick
  useEffect(() => {
    if (!state.isTimerRunning) return
    const interval = setInterval(() => {
      dispatch({ type: "TICK" })
    }, 1000)
    return () => clearInterval(interval)
  }, [state.isTimerRunning, dispatch])

  // Auto-advance when task time is up
useEffect(() => {
  if (state.elapsedSeconds >= taskDurationSeconds && taskDurationSeconds > 0 && state.isTimerRunning) {
    playSound(); // <--- הצליל יושמע כאן
    dispatch({ type: "NEXT_TASK" });
  }
}, [state.elapsedSeconds, taskDurationSeconds, state.isTimerRunning, dispatch]);
  const isComplete = !currentTask && state.activeTaskIndex >= enabledTasks.length

  if (enabledTasks.length === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
        <div className="neu-flat rounded-3xl bg-background p-10 text-center">
          <p className="text-lg font-medium text-foreground">No tasks enabled</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Go to Tasks to add activities to your routine.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-8">
      {/* Greeting */}
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        {isComplete ? "Routine Complete" : `Task ${state.activeTaskIndex + 1} of ${enabledTasks.length}`}
      </p>
          <button
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  className="neu-flat-sm absolute top-4 right-4 p-3 rounded-full bg-background text-foreground transition-all hover:scale-110"
>
  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
</button>
      {isComplete ? (
        <div className="flex flex-col items-center text-center animate-in fade-in-0 zoom-in-95 duration-500">
          <div className="neu-flat mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-background">
            <svg className="h-14 w-14 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>

          <h2 className="mb-2 text-2xl font-semibold text-foreground">
            Well Done
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            You completed your entire morning routine.
          </p>
          <button
            onClick={() => dispatch({ type: "RESET_TIMER" })}
            className="neu-flat flex items-center gap-2 rounded-2xl bg-background px-8 py-4 text-sm font-medium text-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            Start Again
          </button>
        </div>
      ) : (
        <>
          {/* Current task name */}
          <h2 className="mb-8 text-2xl font-semibold text-foreground text-balance text-center">
            {currentTask?.name}
          </h2>

          {/* Progress Ring */}
          <div className="neu-flat mb-8 rounded-full bg-background p-6">
            <ProgressRing progress={clampedProgress} size={200} strokeWidth={10}>
              <div className="flex flex-col items-center gap-1">
                <TaskIcon
                  iconKey={currentTask?.icon || "sparkles"}
                  className="mb-2 h-8 w-8 text-primary"
                  strokeWidth={1.5}
                />
                <span className="text-3xl font-semibold tabular-nums text-foreground">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
                <span className="text-xs text-muted-foreground">remaining</span>
              </div>
            </ProgressRing>
          </div>

          {/* Controls */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => dispatch({ type: "RESET_TIMER" })}
              className="neu-flat-sm flex h-12 w-12 items-center justify-center rounded-full bg-background text-muted-foreground transition-all hover:scale-[1.05] active:scale-[0.95]"
              aria-label="Reset timer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              onClick={() =>
                dispatch({ type: state.isTimerRunning ? "PAUSE_TIMER" : "START_TIMER" })
              }
              className="neu-flat flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-[1.05] active:scale-[0.95]"
              aria-label={state.isTimerRunning ? "Pause" : "Play"}
            >
              {state.isTimerRunning ? (
                <Pause className="h-7 w-7" fill="currentColor" />
              ) : (
                <Play className="h-7 w-7 ml-0.5" fill="currentColor" />
              )}
            </button>

            <button
              onClick={() => {playSound(); dispatch({ type: "NEXT_TASK" })}}
              className="neu-flat-sm flex h-12 w-12 items-center justify-center rounded-full bg-background text-muted-foreground transition-all hover:scale-[1.05] active:scale-[0.95]"
              aria-label="Skip to next task"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          {/* Overall progress */}
          <div className="mb-6 w-full max-w-xs">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Overall Progress</span>
              <span className="tabular-nums">{Math.round(overallProgress)}%</span>
            </div>
            <div className="neu-pressed-sm rounded-full p-1">
              <Progress value={overallProgress} className="h-2" />
            </div>
          </div>

          {/* Next Task Preview */}
          {nextTask && (
            <div className="neu-flat-sm w-full max-w-xs rounded-2xl bg-background p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Up Next
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <TaskIcon iconKey={nextTask.icon} className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{nextTask.name}</p>
                  <p className="text-xs text-muted-foreground">{nextTask.duration} min</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
