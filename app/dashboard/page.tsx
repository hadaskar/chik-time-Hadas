"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TimeSlotCard from "@/components/TimeSlotCard";
import { TaskManager } from "@/components/task-manager";
import { Plus, ClockCheck, ArrowLeft, LogOut, Sparkles, Timer, User } from "lucide-react";
import { useRoutine } from "@/lib/routine-store";

interface Slot { id: string; name: string; time: number; progress: number }

function getGreeting(hour: number) {
  if (hour < 5)  return "לילה טוב";
  if (hour < 12) return "בוקר טוב";
  if (hour < 17) return "צהריים טובים";
  if (hour < 21) return "ערב טוב";
  return "לילה טוב";
}

export default function DashboardPage() {
  const { dispatch } = useRoutine();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      setUser(user);
      if (user) {
        const { data, error: dbError } = await supabase
          .from("time_slots")
          .select("id,name,time,progress,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (dbError) throw dbError;
        setSlots(data || []);
      }
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  useEffect(() => {
    dispatch({ type: "SET_ACTIVE_SLOT", payload: selectedSlotId });
  }, [selectedSlotId, dispatch]);

  const addNewSlot = () => {
    dispatch({ type: "RESET_TASKS_TO_DEFAULTS" });
    router.push("/onboarding");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "";
  const hour = new Date().getHours();
  const totalMinutes = slots.reduce((s, sl) => s + (sl.time || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-primary/10 border-t-primary" />
            <ClockCheck className="h-6 w-6 text-primary/60" strokeWidth={1.5} />
          </div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground/60 uppercase">טוען...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="neu-flat rounded-3xl bg-background p-8 text-center max-w-sm w-full">
          <p className="text-destructive text-sm">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  /* ── Task manager sub-view ── */
  if (selectedSlotId) {
    const selectedSlot = slots.find(s => s.id === selectedSlotId);
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/20">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-3.5">
            <button
              onClick={() => setSelectedSlotId(null)}
              className="neu-flat-sm flex h-9 w-9 items-center justify-center rounded-xl bg-background text-primary transition-all hover:scale-[1.05] active:scale-[0.95]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{selectedSlot?.name}</p>
              <p className="text-[11px] text-muted-foreground">{selectedSlot?.time} דקות</p>
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-2xl px-4 py-6">
          <TaskManager />
        </div>
      </div>
    );
  }

  /* ── Main dashboard ── */
  return (
    <div className="min-h-screen bg-background" dir="rtl">

      {/* ══════════════════ HERO ══════════════════ */}
      <div className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/5" />

        <div className="relative z-10 mx-auto max-w-2xl px-5">

          {/* Top nav */}
          <div className="flex items-center justify-end pt-12 pb-0">
            <div className="flex items-center gap-2">
              <button
                onClick={addNewSlot}
                className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-[0_4px_20px_rgba(111,163,199,0.5)] transition-all hover:scale-[1.04] active:scale-[0.97]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                זמן חדש
              </button>
              <button
                onClick={signOut}
                className="flex h-9 w-9 items-center justify-center rounded-full neu-flat-sm bg-background text-muted-foreground transition-all hover:text-destructive"
                title="התנתקות"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Greeting */}
          <div className="pt-8 pb-14">
            <div className="flex items-end justify-end gap-3 mb-2">
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {firstName || 'משתמש'} היי
                </p>
                <p className="text-sm font-semibold text-muted-foreground">{getGreeting(hour)}</p>
              </div>
              <div className="neu-flat flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--background) 85%, #0284c7)" }}>
                <User className="h-6 w-6" style={{ color: "var(--primary)" }} />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight">
              הזמנים שלך
            </h1>

            {/* Stats row */}
            {slots.length > 0 && (
              <div className="mt-5 flex gap-3">
                <div className="flex items-center gap-2.5 rounded-2xl bg-background px-4 py-2.5 neu-flat-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                    <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-lg font-black text-primary leading-none">{slots.length}</span>
                    <span className="mr-1 text-xs font-semibold text-foreground/50">זמנים</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl bg-background px-4 py-2.5 neu-flat-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20">
                    <Timer className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-lg font-black text-accent leading-none">
                      {totalHours > 0 ? `${totalHours}:${String(remainingMins).padStart(2, "0")}` : totalMinutes}
                    </span>
                    <span className="mr-1 text-xs font-semibold text-foreground/50">
                      {totalHours > 0 ? "שעות" : "דקות"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════ SLOTS ══════════════════ */}
      <div className="mx-auto w-full max-w-2xl px-5 pb-16 -mt-2">

        {slots.length === 0 ? (
          /* Empty state */
          <div className="mt-6 flex flex-col items-center text-center">
            <div className="neu-flat mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-background">
              <ClockCheck className="h-12 w-12 text-primary/30" strokeWidth={1.2} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">עוד אין לך זמנים</h3>
            <p className="mb-8 max-w-[220px] text-sm leading-relaxed text-muted-foreground">
              צור את הרוטינה הראשונה שלך — זה ייקח פחות מדקה
            </p>
            <button
              onClick={addNewSlot}
              className="flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_rgba(111,163,199,0.4)] transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              צור זמן חדש
            </button>
          </div>
        ) : (
          /* Slots list */
          <div className="flex flex-col gap-3">
            {slots.map((slot, i) => (
              <div
                key={slot.id}
                className="animate-in fade-in-0 slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
              >
                <TimeSlotCard
                  slot={slot}
                  onSelect={(id) => setSelectedSlotId(id)}
                  onDeleted={(deletedId) => setSlots((prev) => prev.filter((s) => s.id !== deletedId))}
                  onUpdate={fetchData}
                />
              </div>
            ))}

            {/* Add more button */}
            <button
              onClick={addNewSlot}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-border/40 py-4 text-xs font-semibold text-muted-foreground/50 transition-all hover:border-primary/30 hover:text-primary/60"
            >
              <Plus className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" />
              הוסיפי עוד זמן
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


