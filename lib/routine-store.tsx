"use client"
import React, { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

// --- 1. הגדרות טיפוסים (Exports הכרחיים למניעת שגיאות בדפים אחרים) ---
export interface TimeSlot {
  id: string;
  name: string;
  user_id?: string;
  created_at?: string;
  tasks?: { count: number }[]; 
}

export interface NotificationSettings {
  enabled: boolean
  sound: string
  reminderBefore: number
}

export interface RoutineTask {
  id: string
  name: string
  icon: string
  duration: number
  enabled: boolean
  time_slot_id?: string // קישור ל-Slot
}

export type AppView = "onboarding" | "slots" | "dashboard" | "tasks" | "timer" | "settings"

export interface AppState {
  view: AppView
  onboardingComplete: boolean
  tasks: RoutineTask[]
  slots: TimeSlot[]           // רשימת הזמנים
  activeSlotId: string | null // הזמן הנבחר
  activeTaskIndex: number
  isTimerRunning: boolean
  elapsedSeconds: number
  taskStartTimestampMs: number | null
  notifications: NotificationSettings
  wakeUpTime: string
  isNewUser: boolean
  isLoadingTasks: boolean
}

export const DEFAULT_TASKS: RoutineTask[] = [
  { id: "1", name: "ארגון הבית", icon: "droplets", duration: 30, enabled: false },
  { id: "2", name: "תנועה וכושר", icon: "dumbbell", duration: 15, enabled: true },
  { id: "3", name: "מדיטציה / נשימות", icon: "brain", duration: 10, enabled: false },
  { id: "4", name: "מטלה לימודית", icon: "book-open", duration: 30, enabled: false },
];

const cloneDefaultTasks = () => DEFAULT_TASKS.map((task) => ({ ...task }))

const INITIAL_STATE: AppState = {
  view: "onboarding",
  onboardingComplete: false,
  tasks: cloneDefaultTasks(),
  slots: [],
  activeSlotId: null,
  activeTaskIndex: 0,
  isTimerRunning: false,
  elapsedSeconds: 0,
  taskStartTimestampMs: null,
  notifications: { enabled: true, sound: "gentle-chime", reminderBefore: 30 },
  wakeUpTime: "07:00",
  isNewUser: true,
  isLoadingTasks: false
}

// --- Reducer (כולל התמיכה ב-Slots) ---
function reducer(state: AppState, action: any): AppState {
  switch (action.type) {
    case "SET_VIEW": 
      return { ...state, view: action.payload };
    case "SET_SLOTS":
      return { ...state, slots: action.payload };
    case "SET_ACTIVE_SLOT":
      if (!action.payload) return { ...state, activeSlotId: null, tasks: [], isLoadingTasks: false };
      return { ...state, activeSlotId: action.payload, view: "tasks", tasks: [], isLoadingTasks: true };
    case "RESET_TASKS_TO_DEFAULTS":
      return { ...state, tasks: cloneDefaultTasks(), activeSlotId: null, isLoadingTasks: false };
    case "SET_LOADING_TASKS":
      return { ...state, isLoadingTasks: action.payload };
    case "SET_NEW_USER":
      return { ...state, isNewUser: action.payload };
    case "SET_WAKE_UP_TIME":
      return { ...state, wakeUpTime: action.payload };
    case "UPDATE_NOTIFICATIONS":
      return { ...state, notifications: { ...state.notifications, ...action.payload } };

    // START_ROUTINE: start from task 0 and set real start timestamp
    case "START_ROUTINE": 
      return { ...state, view: "dashboard", isTimerRunning: true, activeTaskIndex: 0, elapsedSeconds: 0, taskStartTimestampMs: Date.now() };

    // START_TIMER: resume running; compute start timestamp so elapsedSeconds continues correctly
    case "START_TIMER":
      return {
        ...state,
        isTimerRunning: true,
        view: "dashboard",
        taskStartTimestampMs: Date.now() - state.elapsedSeconds * 1000
      };

    // PAUSE_TIMER: capture current elapsed from timestamp and clear it
    case "PAUSE_TIMER": {
      const now = Date.now()
      const computedElapsed = state.taskStartTimestampMs ? Math.floor((now - state.taskStartTimestampMs) / 1000) : state.elapsedSeconds
      return { ...state, isTimerRunning: false, elapsedSeconds: computedElapsed, taskStartTimestampMs: null };
    }

    case "RESET_TIMER":
      return { ...state, elapsedSeconds: 0, isTimerRunning: false, taskStartTimestampMs: null };

    // NEXT_TASK: advance index and reset elapsed; if still running, set new start timestamp
    case "NEXT_TASK":
      return {
        ...state,
        activeTaskIndex: state.activeTaskIndex + 1,
        elapsedSeconds: 0,
        taskStartTimestampMs: state.isTimerRunning ? Date.now() : null
      };

    case "RESTART_ROUTINE":
      return { ...state, activeTaskIndex: 0, elapsedSeconds: 0, isTimerRunning: false, taskStartTimestampMs: null };

    // TICK is kept but no longer authoritative for elapsedSeconds
    case "TICK": 
      return { ...state };

    case "COMPLETE_ONBOARDING":
      return { ...state, onboardingComplete: true, view: "slots" };

    case "REORDER_TASKS": 
      return { ...state, tasks: action.payload };

    case "ADD_TASK": {
      const lastEnabledIdx = state.tasks.map(t => t.enabled).lastIndexOf(true);
      const insertAt = lastEnabledIdx + 1;
      const newTasks = [...state.tasks];
      newTasks.splice(insertAt, 0, action.payload);
      return { ...state, tasks: newTasks };
    }
    case "REMOVE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case "UPDATE_TASK_NAME":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, name: action.payload.name } : t
        ),
      };
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => t.id === action.payload ? { ...t, enabled: !t.enabled } : t),
      };
    case "CREATE_AND_START_SLOT":
      {
        const enabledTasksForNewSlot = state.tasks.filter((t) => t.enabled);
        const newSlotId = Math.random().toString(36).substr(2, 9);

        const createdSlot = {
          id: newSlotId,
          name: "שגרה חדשה", 
          tasks: [{ count: enabledTasksForNewSlot.length }]
        };

        return {
          ...state,
          slots: [...state.slots, createdSlot],
          activeSlotId: newSlotId,
          activeTaskIndex: 0,
          elapsedSeconds: 0,
          isTimerRunning: true,
          onboardingComplete: true,
          view: "slots",
          taskStartTimestampMs: Date.now()
        };
      }
    case "RESET_ONBOARDING_TASKS":
      return {
        ...state,
        tasks: state.tasks.map(t => ({ ...t, enabled: false })),
        onboardingComplete: false,
        view: "onboarding"
      };
    case "UPDATE_TASK_DURATION":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, duration: action.payload.duration } : t
        ),
      };
    default: 
      return state;
  }
}

interface RoutineContextType {
  state: AppState
  dispatch: (action: any) => void
  enabledTasks: RoutineTask[]
  totalDuration: number
}

const RoutineContext = createContext<RoutineContextType | null>(null)

export function RoutineProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, INITIAL_STATE)
  const stateRef = React.useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // NOTE: removed authoritative ticking effect (elapsedSeconds is derived from timestamps now)
  // Keep fetchSlots and fetchTasks effects as before

  useEffect(() => {
    const fetchSlots = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("time_slots")
        .select("*, tasks(count)")
        .eq("user_id", user.id);
      if (data) rawDispatch({ type: "SET_SLOTS", payload: data });
    };
    fetchSlots();
  }, []);

  useEffect(() => {
    if (!state.activeSlotId) return;
    if (!state.isLoadingTasks) return;

    const slotIdToFetch = state.activeSlotId;

    const fetchTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        rawDispatch({ type: "REORDER_TASKS", payload: [] });
        rawDispatch({ type: "SET_LOADING_TASKS", payload: false });
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("time_slot_id", slotIdToFetch)
        .order("position", { ascending: true, nullsFirst: false });

      if (error) {
        console.error("fetchTasks error:", error.message);
        rawDispatch({ type: "REORDER_TASKS", payload: [] });
        rawDispatch({ type: "SET_LOADING_TASKS", payload: false });
        return;
      }
      if (data && data.length > 0) {
        const formatted = data.map((t) => ({ ...t, id: t.task_id || t.id }));
        rawDispatch({ type: "REORDER_TASKS", payload: formatted });
        rawDispatch({ type: "SET_NEW_USER", payload: false });
      } else {
        rawDispatch({ type: "REORDER_TASKS", payload: [] });
      }
      rawDispatch({ type: "SET_LOADING_TASKS", payload: false });
    };
    fetchTasks();
  }, [state.activeSlotId, state.isLoadingTasks]);

  const dispatch = useCallback(async (action: any) => {
    rawDispatch(action);
    const currentState = stateRef.current;

    // Sync tasks on START_ROUTINE (same as before)
    if (
      action.type === "START_ROUTINE"
    ) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const tasksToSync = currentState.tasks
          .filter((t) => t.enabled)
          .map((t, i) => ({
            user_id: user.id,
            task_id: String(t.id),
            name: t.name,
            icon: t.icon,
            duration: t.duration,
            enabled: true,
            position: i,
            time_slot_id: currentState.activeSlotId || action.newSlotId || null,
          }));

        if (tasksToSync.length > 0) {
          await supabase
            .from("tasks")
            .upsert(tasksToSync, {
              onConflict: "user_id,task_id",
            });
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    }

    if (action.type === "CREATE_AND_START_SLOT") {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const enabledTasksForNewSlot = currentState.tasks.filter((t) => t.enabled);
        const newSlotId = Math.random().toString(36).substr(2, 9);

        const { data: newSlotData, error } = await supabase
          .from("time_slots")
          .insert({
            id: newSlotId,
            name: "שגרה חדשה",
            user_id: user.id,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("Error saving new slot:", error);
          return;
        }

        const tasksToSync = enabledTasksForNewSlot.map((t, i) => ({
          user_id: user.id,
          task_id: crypto.randomUUID(),
          name: t.name,
          icon: t.icon,
          duration: t.duration,
          enabled: true,
          position: i,
          time_slot_id: newSlotId,
        }));

        if (tasksToSync.length > 0) {
          await supabase
            .from("tasks")
            .upsert(tasksToSync, {
              onConflict: "user_id,task_id",
            });
        }

        rawDispatch({
          type: "SET_SLOTS",
          payload: [
            ...currentState.slots,
            { ...newSlotData, tasks: [{ count: enabledTasksForNewSlot.length }] },
          ],
        });
        rawDispatch({ type: "SET_ACTIVE_SLOT", payload: newSlotId });
      } catch (err) {
        console.error("Error creating slot:", err);
      }
    }
  }, []);

  const enabledTasks = state.tasks.filter((t) => t.enabled)
  const totalDuration = enabledTasks.reduce((sum, t) => sum + t.duration, 0)

  return (
    <RoutineContext.Provider value={{ state, dispatch, enabledTasks, totalDuration }}>
      {children}
    </RoutineContext.Provider>
  )
}

export function useRoutine() {
  const context = useContext(RoutineContext)
  if (!context) throw new Error("useRoutine error")
  return context
}
