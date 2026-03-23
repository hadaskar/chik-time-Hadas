"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TimeSlotCard from "@/components/TimeSlotCard";
import { TaskManager } from "@/components/task-manager";
import { Plus, ClockCheck } from "lucide-react";
import { useRoutine } from "@/lib/routine-store";

interface Slot { id: string; name: string; time: number; progress: number }

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
      console.error("שגיאה:", err);
      setError(err.message || "שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (selectedSlotId) {
      dispatch({ type: "SET_ACTIVE_SLOT", payload: selectedSlotId });
    }
  }, [selectedSlotId, dispatch]);

  const addNewSlot = () => {
    dispatch({ type: "RESET_TASKS_TO_DEFAULTS" });
    router.push("/onboarding");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="neu-flat rounded-3xl bg-background px-10 py-8 text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="neu-flat rounded-3xl bg-background px-10 py-8 text-center">
          <p className="text-destructive">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (selectedSlotId) {
    return (
      <div className="flex min-h-screen items-start justify-center bg-background px-4 py-8">
        <div className="w-full max-w-2xl">
          <button
            onClick={() => setSelectedSlotId(null)}
            className="neu-flat-sm mb-6 rounded-2xl bg-background px-5 py-2.5 text-sm font-medium text-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            ← חזור לזמנים
          </button>
          <TaskManager />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="neu-flat mb-8 rounded-[28px] bg-background p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary/50">morning routine</p>
              <h1 className="mt-1 text-2xl font-black text-foreground">Chik Time</h1>
              <p className="mt-1 text-sm text-muted-foreground">בחרי זמן כדי להתחיל את היום שלך</p>
            </div>
            <div className="neu-pressed flex h-14 w-14 items-center justify-center rounded-2xl bg-background">
              <ClockCheck className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Slots */}
        {slots.length === 0 ? (
          <div className="neu-flat mb-6 rounded-[24px] bg-background p-10 text-center">
            <p className="text-muted-foreground">עדיין אין זמנים. צרי את הראשון!</p>
          </div>
        ) : (
          <div className="mb-6 flex flex-col gap-4">
            {slots.map((slot) => (
              <TimeSlotCard
                key={slot.id}
                slot={slot}
                onSelect={(id) => setSelectedSlotId(id)}
                onDeleted={(deletedId) => setSlots((prev) => prev.filter((s) => s.id !== deletedId))}
                onUpdate={fetchData}
              />
            ))}
          </div>
        )}

        {/* Add button */}
        <button
          onClick={addNewSlot}
          className="neu-flat flex w-full items-center justify-center gap-2 rounded-[24px] bg-background px-6 py-5 text-primary transition-all hover:scale-[1.01] active:neu-pressed active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-semibold">הוסיפי זמן חדש</span>
        </button>

      </div>
    </div>
  );
}
