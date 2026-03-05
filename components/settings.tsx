"use client"

import { useRoutine, type NotificationSettings } from "@/lib/routine-store"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Bell, Volume2, Clock, RotateCcw, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

const SOUNDS: { value: NotificationSettings["sound"]; label: string; desc: string }[] = [
  { value: "gentle-chime", label: "Gentle Chime", desc: "Soft melodic tone" },
  { value: "soft-bell", label: "Soft Bell", desc: "Warm bell sound" },
  { value: "morning-bird", label: "Morning Bird", desc: "Light birdsong" },
  { value: "ocean-wave", label: "Ocean Wave", desc: "Calm wave sweep" },
]

export function Settings() {
  const { state, dispatch, enabledTasks, totalDuration } = useRoutine()
  const { notifications, wakeUpTime } = state

  return (
    <div className="px-4 py-6">
      <h2 className="mb-1 text-xl font-semibold text-foreground">Settings</h2>
      <p className="mb-8 text-sm text-muted-foreground">
        Customize your morning experience
      </p>

      {/* Wake Up Time */}
      <section className="mb-6">
        <div className="neu-flat rounded-2xl bg-background p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Sun className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Wake Up Time</p>
              <p className="text-xs text-muted-foreground">
                Your routine starts at this time
              </p>
            </div>
          </div>
          <div className="neu-pressed-sm rounded-xl p-3">
            <input
              type="time"
              value={wakeUpTime}
              onChange={(e) =>
                dispatch({ type: "SET_WAKE_UP_TIME", payload: e.target.value })
              }
              className="w-full bg-transparent text-center text-2xl font-semibold tabular-nums text-foreground focus:outline-none"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Routine ends around{" "}
            <span className="font-medium text-foreground">
              {calculateEndTime(wakeUpTime, totalDuration)}
            </span>
          </p>
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Notifications
        </h3>

        <div className="neu-flat rounded-2xl bg-background p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Enable Alerts
                </p>
                <p className="text-xs text-muted-foreground">
                  Gentle reminders when tasks end
                </p>
              </div>
            </div>
            <Switch
              checked={notifications.enabled}
              onCheckedChange={(checked) =>
                dispatch({
                  type: "UPDATE_NOTIFICATIONS",
                  payload: { enabled: checked },
                })
              }
            />
          </div>

          {notifications.enabled && (
            <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
              {/* Reminder timing */}
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Remind before task ends
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {notifications.reminderBefore}s
                  </span>
                </div>
                <Slider
                  value={[notifications.reminderBefore]}
                  onValueChange={([val]) =>
                    dispatch({
                      type: "UPDATE_NOTIFICATIONS",
                      payload: { reminderBefore: val },
                    })
                  }
                  min={10}
                  max={120}
                  step={5}
                />
              </div>

              {/* Sound selection */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Alert Sound
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SOUNDS.map((sound) => (
                    <button
                      key={sound.value}
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_NOTIFICATIONS",
                          payload: { sound: sound.value },
                        })
                      }
                      className={cn(
                        "flex flex-col items-start rounded-xl p-3 text-left transition-all",
                        notifications.sound === sound.value
                          ? "neu-pressed bg-background"
                          : "neu-flat-sm bg-background hover:scale-[1.02]"
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs font-medium",
                          notifications.sound === sound.value
                            ? "text-primary"
                            : "text-foreground"
                        )}
                      >
                        {sound.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {sound.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Routine Summary */}
      <section className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Routine Summary
        </h3>
        <div className="neu-flat rounded-2xl bg-background p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="text-center flex-1">
              <p className="text-2xl font-semibold text-foreground tabular-nums">
                {enabledTasks.length}
              </p>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center flex-1">
              <p className="text-2xl font-semibold text-foreground tabular-nums">
                {totalDuration}
              </p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center flex-1">
              <p className="text-2xl font-semibold text-foreground tabular-nums">
                {wakeUpTime}
              </p>
              <p className="text-xs text-muted-foreground">Start</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reset */}
      <section>
        <button
          onClick={() => dispatch({ type: "SET_VIEW", payload: "onboarding" })}
          className="neu-flat-sm flex w-full items-center justify-center gap-2 rounded-2xl bg-background py-4 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:scale-[1.01] active:scale-[0.99]"
        >
          <RotateCcw className="h-4 w-4" />
          Redo Onboarding
        </button>
      </section>
    </div>
  )
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number)
  const totalMinutes = h * 60 + m + durationMinutes
  const endH = Math.floor(totalMinutes / 60) % 24
  const endM = totalMinutes % 60
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`
}
