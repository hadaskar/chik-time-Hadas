"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TimeSlotCard from "@/components/TimeSlotCard";
import { TaskManager } from "@/components/task-manager";
import { Plus, ClockCheck, ArrowLeft } from "lucide-react";
import { useRoutine } from "@/lib/routine-store";
import HomeComponent from "@/components/home"

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
      router.replace("/login");
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

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || '';

  if (loading) {
    return (
      <div
        style={{ background: "#F0EDE8", colorScheme: "light", minHeight: "100vh" }}
        className="flex items-center justify-center"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-[#6FA3C7]/20 border-t-[#6FA3C7]" />
          <p className="text-xs font-medium tracking-wide" style={{ color: "#636e72" }}>טוען...</p>
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

  /* ───────── Task manager view ───────── */
  if (selectedSlotId) {
    const selectedSlot = slots.find(s => s.id === selectedSlotId);
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* Top bar with back */}
        <div className="sticky top-0 z-10 border-b border-border/20 bg-background/80 backdrop-blur-xl">
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

  /* ───────── Main dashboard ───────── */
  return (
    <HomeComponent />
  );
}