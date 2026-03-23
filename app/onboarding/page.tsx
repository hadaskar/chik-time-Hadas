"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useRoutine } from "@/lib/routine-store";
import { TaskIcon, availableIcons } from "@/components/task-icon";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ArrowLeft, Clock, Check, Plus, Type } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const { state, dispatch } = useRoutine();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [slotName, setSlotName] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskIcon, setNewTaskIcon] = useState("sparkles");
  const [newTaskDuration, setNewTaskDuration] = useState(10);

  const steps = [
    { title: "Chik Time", subtitle: "בואי נבנה את הבוקר המושלם שלך" },
    { title: "שם המיקוד", subtitle: "איך נקרא לרוטינה הזו?" },
    { title: "בחרי פעילויות", subtitle: "מה חשוב לך בבוקר?" },
    { title: "משכי זמן", subtitle: "כמה זמן לכל פעילות?" },
    { title: "Ready to Chik Time ✨", subtitle: "הרוטינה שלך מוכנה" },
  ];

  const enabledTasks = state.tasks.filter((t) => t.enabled);
  const totalMinutes = enabledTasks.reduce((sum, t) => sum + t.duration, 0);

  useEffect(() => {
    dispatch({ type: "RESET_TASKS_TO_DEFAULTS" });
  }, [dispatch]);

  const handleAddPrivateTask = () => {
    if (!newTaskName.trim()) return;

    dispatch({
      type: "ADD_TASK",
      payload: {
        id: `custom-${crypto.randomUUID()}`,
        name: newTaskName.trim(),
        icon: newTaskIcon,
        duration: newTaskDuration,
        enabled: true,
      },
    });

    setNewTaskName("");
    setNewTaskIcon("sparkles");
    setNewTaskDuration(10);
  };

  const handleContinueFromPickActivities = () => {
    setStep(3);
  };

  const saveNewSlotToDB = async () => {
    setSaving(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("User not authenticated");

      // 1. insert slot
      const { data: newSlot, error: slotError } = await supabase
        .from("time_slots")
        .insert({
          name: slotName.trim() || `My Routine – ${new Date().toLocaleDateString("he-IL")}`,
          user_id: user.id,
          time: totalMinutes,
          progress: 0,
        })
        .select()
        .single();
      if (slotError) throw slotError;

      // 2. insert/upsert tasks
      const tasksToSync = enabledTasks.map((task) => ({
        user_id: user.id,
        time_slot_id: newSlot.id,
        task_id: crypto.randomUUID(),
        name: task.name,
        icon: task.icon,
        duration: task.duration,
        enabled: true,
      }));
      if (tasksToSync.length > 0) {
        const { error: tasksError } = await supabase
          .from("tasks")
          .insert(tasksToSync);
        if (tasksError) throw tasksError;
      }

      // 3. עדכון מצב וניווט
      dispatch({ type: "COMPLETE_ONBOARDING" });
      dispatch({ type: "SET_ACTIVE_SLOT", payload: newSlot.id });
      router.push("/active-timer");
    } catch (error: any) {
      console.error("Error saving routine:", error);
      alert("שגיאה בשמירת הרוטינה: " + error.message);
    } finally {
      setSaving(false);
    }
  };

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
            <div className="neu-flat mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-background">
              <Clock className="h-14 w-14 text-accent" strokeWidth={1.5} />
            </div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">morning routine</p>
            <h1 className="mb-3 text-4xl font-black tracking-tight text-foreground">
              Chik Time
            </h1>
            <p className="mb-2 text-base text-muted-foreground leading-relaxed">
              {steps[0].subtitle}
            </p>
            <p className="mb-10 text-sm text-muted-foreground/60 leading-relaxed max-w-xs">
              צרי רוטינת בוקר רגועה ומסודרת שתעזור לך להתחיל כל יום עם מיקוד וכוונה.
            </p>
            <button
              onClick={() => setStep(1)}
              className="neu-flat flex items-center gap-2 rounded-2xl bg-background px-8 py-4 text-foreground font-semibold transition-all hover:scale-[1.02] active:neu-pressed active:scale-[0.98]"
            >
              בואי נתחיל
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 1: Name Your Focus */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="neu-flat mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-background">
              <Type className="h-10 w-10 text-primary" strokeWidth={1.5} />
            </div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">step 1 / 4</p>
            <h2 className="mb-1 text-2xl font-bold text-foreground">{steps[1].title}</h2>
            <p className="mb-8 text-sm text-muted-foreground">{steps[1].subtitle}</p>

            <input
              type="text"
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && slotName.trim() && setStep(2)}
              placeholder="לדוגמה: בוקר רגוע, אימון בוקר..."
              className="mb-8 w-full rounded-2xl bg-background px-5 py-4 text-center text-lg font-semibold text-foreground placeholder:text-muted-foreground/40 neu-pressed focus:outline-none"
              autoFocus
            />

            <div className="flex w-full items-center justify-between">
              <button
                onClick={() => setStep(0)}
                className="neu-flat-sm flex items-center gap-1.5 rounded-2xl bg-background px-4 py-3 text-sm text-muted-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                חזורה
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!slotName.trim()}
                className="neu-flat flex items-center gap-1.5 rounded-2xl bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              >
                המשיכי
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Pick Activities */}
        {step === 2 && (
          <div className="animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="mb-6 text-center">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">step 2 / 4</p>
              <h2 className="mb-1 text-2xl font-bold text-foreground">{steps[2].title}</h2>
              <p className="text-sm text-muted-foreground">{steps[2].subtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {state.tasks?.map((task) => (
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

            <div className="mt-5 neu-flat rounded-2xl bg-background p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">הוספי פעילות מיוחדת</p>
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="שם הפעילות..."
                className="mb-3 w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 neu-pressed-sm focus:outline-none"
              />

              <div className="mb-3 flex flex-wrap gap-2">
                {availableIcons.slice(0, 8).map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewTaskIcon(icon)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                      newTaskIcon === icon
                        ? "neu-pressed bg-background text-primary"
                        : "neu-flat-sm bg-background text-muted-foreground"
                    )}
                  >
                    <TaskIcon iconKey={icon} className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                ))}
              </div>

              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">משך זמן</span>
                  <span className="text-xs font-semibold text-foreground">{newTaskDuration} דקות</span>
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
                onClick={handleAddPrivateTask}
                disabled={!newTaskName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                הוספי פעילות
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => {
                  if (!state.onboardingComplete) {
                    setStep(1)
                  } else {
                    router.push('/dashboard')
                  }
                }}
                className="neu-flat-sm flex items-center gap-1.5 rounded-2xl bg-background px-4 py-3 text-sm text-muted-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                חזורה
              </button>
              <button
                onClick={handleContinueFromPickActivities}
                disabled={enabledTasks.length === 0}
                className="neu-flat flex items-center gap-1.5 rounded-2xl bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              >
                המשיכי
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Set Durations */}
        {step === 3 && (
          <div className="animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="mb-6 text-center">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">step 3 / 4</p>
              <h2 className="mb-1 text-2xl font-bold text-foreground">{steps[3].title}</h2>
              <p className="text-sm text-muted-foreground">{steps[3].subtitle}</p>
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
                      <span className="text-xs text-muted-foreground">דקות</span>
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
                onClick={() => setStep(2)}
                className="neu-flat-sm flex items-center gap-1.5 rounded-2xl bg-background px-4 py-3 text-sm text-muted-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                חזורה
              </button>
              <button
                onClick={() => setStep(4)}
                className="neu-flat flex items-center gap-1.5 rounded-2xl bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                לסיכום
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <div className="neu-flat mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-background">
              <Check className="h-10 w-10 text-primary" strokeWidth={1.5} />
            </div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">step 4 / 4</p>
            <h2 className="mb-2 text-2xl font-bold text-foreground">{steps[4].title}</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {enabledTasks.length} פעילויות בסך הכל {totalMinutes} דקות
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
                      {task.duration} דקות
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full items-center gap-3">
              <button
                onClick={() => setStep(3)}
                className="neu-flat-sm flex items-center gap-1.5 rounded-2xl bg-background px-4 py-3 text-sm text-muted-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                חזורה
              </button>
              <button
                onClick={saveNewSlotToDB}
                disabled={saving}
                className="neu-flat flex-1 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'שומר...' : 'התחילי את הבוקר ✨'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}