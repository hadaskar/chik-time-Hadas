"use client"

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from "react"
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
// --- Types ---
export interface RoutineTask {
  id: string
  name: string
  icon: string
  duration: number // in minutes
  enabled: boolean
}

export type AppView = "onboarding" | "dashboard" | "tasks" | "settings"

export interface NotificationSettings {
  enabled: boolean
  sound: "gentle-chime" | "soft-bell" | "morning-bird" | "ocean-wave"
  reminderBefore: number // seconds before task ends
}

export interface AppState {
  view: AppView
  onboardingComplete: boolean
  tasks: RoutineTask[]
  activeTaskIndex: number
  isTimerRunning: boolean
  elapsedSeconds: number
  notifications: NotificationSettings
  wakeUpTime: string
}

// --- Default Tasks ---
export const DEFAULT_TASKS: RoutineTask[] = [
  { id: "1", name: "Brush Teeth", icon: "sparkles", duration: 5, enabled: true },
  { id: "2", name: "Shower", icon: "droplets", duration: 10, enabled: true },
  { id: "3", name: "Get Dressed", icon: "shirt", duration: 5, enabled: true },
  { id: "4", name: "Make Breakfast", icon: "coffee", duration: 15, enabled: true },
  { id: "5", name: "Meditate", icon: "brain", duration: 10, enabled: false },
  { id: "6", name: "Exercise", icon: "dumbbell", duration: 20, enabled: false },
  { id: "7", name: "Journal", icon: "book-open", duration: 10, enabled: false },
  { id: "8", name: "Read News", icon: "newspaper", duration: 10, enabled: false },
]

const INITIAL_STATE: AppState = {
  view: "onboarding",
  onboardingComplete: false,
  tasks: DEFAULT_TASKS,
  activeTaskIndex: 0,
  isTimerRunning: false,
  elapsedSeconds: 0,
  notifications: {
    enabled: true,
    sound: "gentle-chime",
    reminderBefore: 30,
  },
  wakeUpTime: "07:00",
}

// --- Actions ---
type Action =
  | { type: "SET_VIEW"; payload: AppView }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "TOGGLE_TASK"; payload: string }
  | { type: "UPDATE_TASK_DURATION"; payload: { id: string; duration: number } }
  | { type: "ADD_TASK"; payload: RoutineTask }
  | { type: "REMOVE_TASK"; payload: string }
  | { type: "REORDER_TASKS"; payload: RoutineTask[] }
  | { type: "START_TIMER" }
  | { type: "PAUSE_TIMER" }
  | { type: "RESET_TIMER" }
  | { type: "TICK" }
  | { type: "NEXT_TASK" }
  | { type: "UPDATE_NOTIFICATIONS"; payload: Partial<NotificationSettings> }
  | { type: "SET_WAKE_UP_TIME"; payload: string }
  | { type: "UPDATE_TASK_NAME"; payload: { id: string; name: string } }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.payload }
    case "COMPLETE_ONBOARDING":
      return { ...state, onboardingComplete: true, view: "dashboard" }
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, enabled: !t.enabled } : t
        ),
      }
    case "UPDATE_TASK_DURATION":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, duration: action.payload.duration } : t
        ),
      }
    case "UPDATE_TASK_NAME":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, name: action.payload.name } : t
        ),
      }
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] }
    case "REMOVE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) }
    case "REORDER_TASKS":
      return { ...state, tasks: action.payload }
    case "START_TIMER":
      return { ...state, isTimerRunning: true }
    case "PAUSE_TIMER":
      return { ...state, isTimerRunning: false }
    case "RESET_TIMER":
      return { ...state, isTimerRunning: false, elapsedSeconds: 0, activeTaskIndex: 0 }
    case "TICK":
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 }
    case "NEXT_TASK": {
      const enabledTasks = state.tasks.filter((t) => t.enabled)
      const nextIndex = state.activeTaskIndex + 1
      if (nextIndex >= enabledTasks.length) {
        return { ...state, isTimerRunning: false, activeTaskIndex: 0, elapsedSeconds: 0 }
      }
      return { ...state, activeTaskIndex: nextIndex, elapsedSeconds: 0 }
    }
    case "UPDATE_NOTIFICATIONS":
      return {
        ...state,
        notifications: { ...state.notifications, ...action.payload },
      }
    case "SET_WAKE_UP_TIME":
      return { ...state, wakeUpTime: action.payload }
    default:
      return state
  }
}

// --- Context ---
interface RoutineContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
  enabledTasks: RoutineTask[]
  totalDuration: number
}

const RoutineContext = createContext<RoutineContextType | null>(null)

// export function RoutineProvider({ children }: { children: ReactNode }) {
//   const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

//   const enabledTasks = state.tasks.filter((t) => t.enabled)
//   const totalDuration = enabledTasks.reduce((sum, t) => sum + t.duration, 0)

//   return (
//     <RoutineContext.Provider value={{ state, dispatch, enabledTasks, totalDuration }}>
//       {children}
//     </RoutineContext.Provider>
//   )
// }
export function RoutineProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, INITIAL_STATE)

  // זו הפונקציה שתחסוך לך קוד בכל הפרויקט!
  // בכל פעם שתעשי dispatch, זה גם יעדכן את המסך וגם ישמור בשרת אוטומטית.
  const dispatch = useCallback(async (action: Action) => {
    // 1. עדכון מיידי של המסך (שיהיה מהיר למשתמש)
    rawDispatch(action);

    // 2. עדכון השרת (Supabase) בשקט ברקע
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // אם המשתמש לא מחובר, אין מה לשמור

    switch (action.type) {
      case "ADD_TASK":
        await supabase.from('tasks').insert({
          id: action.payload.id,
          user_id: user.id,
          title: action.payload.name,
          duration_minutes: action.payload.duration,
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
        await supabase.from('tasks').delete().eq('id', action.payload);
        break;
        
      // אפשר להוסיף כאן עוד מקרים בהמשך...
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

// Helper to get icon component name
export function getTaskIconName(iconKey: string) {
  return iconKey
}

// Generate unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
