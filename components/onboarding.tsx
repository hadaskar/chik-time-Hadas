"use client"

import { useState } from "react"
import { useRoutine } from "@/lib/routine-store"
import { TaskIcon } from "@/components/task-icon"
import { Slider } from "@/components/ui/slider"
import { Sun, ArrowRight, ArrowLeft, Clock, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function Onboarding() {
  const { state, dispatch } = useRoutine()
  const [step, setStep] = useState(0)

  const steps = [
    { title: "Welcome", subtitle: "Let's build your ideal morning" },
    { title: "Pick Activities", subtitle: "Select what matters to you" },
    { title: "Set Durations", subtitle: "How long for each task?" },
    { title: "Ready to Rise", subtitle: "Your morning is set" },
  ]

  const enabledTasks = state.tasks.filter((t) => t.enabled)
  const totalMinutes = enabledTasks.reduce((sum, t) => sum + t.duration, 0)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      {/* Step indicators */}
      <div className="mb-8 flex items-center gap-3">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i < step) setStep(i)
            }}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              i === step
                ? "w-8 bg-primary"
                : i < step
                  ? "w-2 bg-primary/60 cursor-pointer"
                  : "w-2 bg-muted"
            )}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex flex-col items-center text-center animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="neu-flat mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-background">
              <Sun className="h-12 w-12 text-accent" strokeWidth={1.5} />
            </div>
            <h1 className="mb-3 text-3xl font-semibold tracking-tight text-foreground text-balance">
              Rise
            </h1>
            <p className="mb-2 text-lg text-muted-foreground leading-relaxed">
              {steps[0].subtitle}
            </p>
            <p className="mb-10 text-sm text-muted-foreground/70 leading-relaxed max-w-xs">
              Create a calm, structured morning routine that helps you start each day with purpose and clarity.
            </p>
            <button
              onClick={() => setStep(1)}
              className="neu-flat flex items-center gap-2 rounded-2xl bg-background px-8 py-4 text-foreground font-medium transition-all hover:scale-[1.02] active:neu-pressed active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 1: Pick Activities */}
        {step === 1 && (
          <div className="animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="mb-8 text-center">
              <h2 className="mb-1 text-2xl font-semibold text-foreground">
                {steps[1].title}
              </h2>
              <p className="text-sm text-muted-foreground">{steps[1].subtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {state.tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => dispatch({ type: "TOGGLE_TASK", payload: task.id })}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-2xl p-5 transition-all duration-300",
                    task.enabled
                      ? "neu-pressed bg-background"
                      : "neu-flat bg-background hover:scale-[1.02]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300",
                      task.enabled
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <TaskIcon iconKey={task.icon} className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      task.enabled ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {task.name}
                  </span>
                  {task.enabled && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setStep(0)}
                className="neu-flat-sm flex items-center gap-1 rounded-xl bg-background px-4 py-3 text-sm text-muted-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={enabledTasks.length === 0}
                className="neu-flat flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-medium text-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Set Durations */}
        {step === 2 && (
          <div className="animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="mb-8 text-center">
              <h2 className="mb-1 text-2xl font-semibold text-foreground">
                {steps[2].title}
              </h2>
              <p className="text-sm text-muted-foreground">{steps[2].subtitle}</p>
            </div>

            <div className="flex flex-col gap-4">
              {enabledTasks.map((task) => (
                <div
                  key={task.id}
                  className="neu-flat rounded-2xl bg-background p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <TaskIcon iconKey={task.icon} className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {task.name}
                    </span>
                    <div className="neu-pressed-sm flex items-center gap-1.5 rounded-lg px-3 py-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {task.duration}
                      </span>
                      <span className="text-xs text-muted-foreground">min</span>
                    </div>
                  </div>
                  <Slider
                    value={[task.duration]}
                    onValueChange={([val]) =>
                      dispatch({
                        type: "UPDATE_TASK_DURATION",
                        payload: { id: task.id, duration: val },
                      })
                    }
                    min={1}
                    max={60}
                    step={1}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="neu-flat-sm flex items-center gap-1 rounded-xl bg-background px-4 py-3 text-sm text-muted-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="neu-flat flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-medium text-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="neu-flat mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-background">
              <Check className="h-10 w-10 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              {steps[3].title}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {enabledTasks.length} activities totalling {totalMinutes} minutes
            </p>

            <div className="mb-8 w-full neu-pressed rounded-2xl bg-background p-5">
              <div className="flex flex-col gap-3">
                {enabledTasks.map((task, idx) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <TaskIcon iconKey={task.icon} className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    <span className="flex-1 text-left text-sm text-foreground">
                      {task.name}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {task.duration} min
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full items-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="neu-flat-sm flex items-center gap-1 rounded-xl bg-background px-4 py-3 text-sm text-muted-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <button
                onClick={() => dispatch({ type: "COMPLETE_ONBOARDING" })}
                className="neu-flat flex-1 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Start My Morning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
