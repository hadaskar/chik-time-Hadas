"use client"

import { RoutineProvider, useRoutine, type AppView } from "@/lib/routine-store"
import { Onboarding } from "@/components/onboarding"
import { ActiveTimer } from "@/components/active-timer"
import { TaskManager } from "@/components/task-manager"
import { Settings } from "@/components/settings"
import { Timer, ListChecks, Settings2, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

function AppContent() {
  const { state, dispatch } = useRoutine()

  if (!state.onboardingComplete || state.view === "onboarding") {
    return <Onboarding />
  }

  const navItems: { view: AppView; icon: typeof Timer; label: string }[] = [
    { view: "dashboard", icon: Timer, label: "Timer" },
    { view: "tasks", icon: ListChecks, label: "Tasks" },
    { view: "settings", icon: Settings2, label: "Settings" },
  ]

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sun className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <span className="text-lg font-semibold text-foreground tracking-tight">
            Rise
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {getGreeting()}
        </p>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {state.view === "dashboard" && <ActiveTimer />}
        {state.view === "tasks" && <TaskManager />}
        {state.view === "settings" && <Settings />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-lg px-4 pb-4">
          <div className="neu-flat flex items-center justify-around rounded-2xl bg-background p-2">
            {navItems.map(({ view, icon: Icon, label }) => (
              <button
                key={view}
                onClick={() => dispatch({ type: "SET_VIEW", payload: view })}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-6 py-2.5 transition-all",
                  state.view === view
                    ? "neu-pressed bg-background text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={label}
                aria-current={state.view === view ? "page" : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function Page() {
  return (
    <RoutineProvider>
      <AppContent />
    </RoutineProvider>
  )
}
