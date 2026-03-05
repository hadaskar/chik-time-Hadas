"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from "react"
// ודאי שהנתיב ל-lib/supabase נכון (אם הקובץ בתוך hooks, אולי צריך ../lib/supabase)
import { supabase } from "@/lib/supabase" 

// --- Types ---

// 1. הוספנו export כדי למנוע את השגיאה בדפים אחרים
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
}

export type AppView = "onboarding" | "dashboard" | "tasks" | "settings"

export interface AppState {
  view: AppView
  onboardingComplete: boolean
  tasks: RoutineTask[]
  activeTaskIndex: number
  isTimerRunning: boolean
  elapsedSeconds: number
  notifications: NotificationSettings // משתמש ב-Interface שהגדרנו למעלה
  wakeUpTime: string
}

// --- Default Tasks ---
export const DEFAULT_TASKS: RoutineTask[] = [
  { id: "1", name: "Brush Teeth", icon: "sparkles", duration: 5, enabled: true },
  { id: "2", name: "Shower", icon: "droplets", duration: 10, enabled: true },
]

const INITIAL_STATE: AppState = {
  view: "onboarding",
  onboardingComplete: false,
  tasks: DEFAULT_TASKS,
  activeTaskIndex: 0,
  isTimerRunning: false,
  elapsedSeconds: 0,
  notifications: { enabled: true, sound: "gentle-chime", reminderBefore: 30 },
  wakeUpTime: "07:00",
}

// --- Reducer ---
function reducer(state: AppState, action: any): AppState {
  switch (action.type) {
    case "SET_VIEW": return { ...state, view: action.payload }
    case "REORDER_TASKS": return { ...state, tasks: action.payload }
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => t.id === action.payload ? { ...t, enabled: !t.enabled } : t),
      }
    case "REMOVE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) }
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] }
    case "COMPLETE_ONBOARDING":
      return { ...state, onboardingComplete: true, view: "dashboard" }
    default: return state
  }
}

// --- Context Definition ---
interface RoutineContextType {
  state: AppState
  dispatch: (action: any) => Promise<void>
  enabledTasks: RoutineTask[]
  totalDuration: number
}

const RoutineContext = createContext<RoutineContextType | null>(null)

// --- Provider ---
export function RoutineProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, INITIAL_STATE)

  // טעינה מ-Supabase ברגע שהאפליקציה עולה
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (tasks && tasks.length > 0) {
        const formattedTasks = tasks.map(t => ({
          id: t.id,
          name: t.name,      // מותאם לטבלה שלך
          icon: t.icon,
          duration: t.duration, // מותאם לטבלה שלך
          enabled: t.enabled
        }));
        rawDispatch({ type: "REORDER_TASKS", payload: formattedTasks });
      }
    };
    fetchUserData();
  }, []);

  // Dispatch חכם שמסנכרן לשרת אוטומטית
  const dispatch = useCallback(async (action: any) => {
    // 1. עדכון UI מיידי
    rawDispatch(action);

    // 2. בדיקה אם המשתמש מחובר
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 3. סנכרון ל-Supabase לפי סוג הפעולה
    switch (action.type) {
      case "ADD_TASK":
        await supabase.from('tasks').insert({
          id: action.payload.id,
          user_id: user.id,
          name: action.payload.name,
          duration: action.payload.duration,
          enabled: action.payload.enabled,
          icon: action.payload.icon
        });
        break;

      case "TOGGLE_TASK":
        const task = state.tasks.find(t => t.id === action.payload);
        await supabase.from('tasks')
          .update({ enabled: !task?.enabled })
          .eq('id', action.payload);
        break;

      case "REMOVE_TASK":
        await supabase.from('tasks')
          .delete()
          .eq('id', action.payload);
        break;

      case "COMPLETE_ONBOARDING":
        // עדכון סטטוס אונבורדינג בשרת (אם יצרת טבלת settings/profiles)
        await supabase.from('profiles').upsert({ 
          id: user.id, 
          onboarding_complete: true 
        });
        break;
    }
  }, [state.tasks]);

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
  if (!context) throw new Error("useRoutine must be used within a RoutineProvider")
  return context
}