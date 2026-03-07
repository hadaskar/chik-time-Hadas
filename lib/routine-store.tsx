
"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

// --- 1. הוספת export (מתקן את image_15ed41) ---
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

export type AppView = "onboarding" | "dashboard" | "tasks" | "timer" | "settings"

export interface AppState {
  view: AppView
  onboardingComplete: boolean
  tasks: RoutineTask[]
  activeTaskIndex: number
  isTimerRunning: boolean
  elapsedSeconds: number
  notifications: NotificationSettings
  wakeUpTime: string
  isNewUser: boolean
}
// ודאי שהייבוא של DEFAULT_TASKS נמצא כאן או שהגדרת אותו למעלה
export const DEFAULT_TASKS: RoutineTask[] = [
  { id: "1", name: "Brush Teeth", icon: "sparkles", duration: 5, enabled: true },
  { id: "2", name: "Shower", icon: "droplets", duration: 10, enabled: true },
  { id: "3", name: "Get Dressed", icon: "shirt", duration: 5, enabled: true },
  { id: "4", name: "Make Breakfast", icon: "coffee", duration: 15, enabled: true },
  { id: "5", name: "Meditate", icon: "brain", duration: 10, enabled: false },
  { id: "6", name: "Exercise", icon: "dumbbell", duration: 20, enabled: false },
  { id: "7", name: "Journal", icon: "book-open", duration: 10, enabled: false },
  { id: "8", name: "Read News", icon: "newspaper", duration: 10, enabled: false },
];


const INITIAL_STATE: AppState = {
view: "onboarding",
  onboardingComplete: false,
  tasks: DEFAULT_TASKS, // טעינה מיידית מהקוד, לא מהשרת!
  activeTaskIndex: 0,
  isTimerRunning: false,
  elapsedSeconds: 0,
  notifications: { enabled: true, sound: "gentle-chime", reminderBefore: 30 },
  wakeUpTime: "07:00",
  isNewUser: false
}


function reducer(state: AppState, action: any): AppState {
  switch (action.type) {
    case "SET_VIEW": 
      return { ...state, view: action.payload };
// בתוך ה-switch ב-routine-store.ts
case "SET_NEW_USER":
  return { ...state, isNewUser: action.payload };
case "SET_WAKE_UP_TIME":
  return { ...state, wakeUpTime: action.payload };

case "UPDATE_NOTIFICATIONS":
  return {
    ...state,
    notifications: {
      ...state.notifications,
      ...action.payload,
    },
  };
    // זה הכפתור של "התחל את היום שלך" - מחזירים אותו למצב שעבד
    case "START_ROUTINE": 
      return { 
        ...state, 
        view: "dashboard", 
        isTimerRunning: true, 
        activeTaskIndex: 0, 
        elapsedSeconds: 0 
      };

    // מוסיפים את אלו בנפרד עבור הכפתורים בתוך דף הטיימר
    case "START_TIMER":
      return { ...state, isTimerRunning: true };

    case "PAUSE_TIMER":
      return { ...state, isTimerRunning: false };

    case "RESET_TIMER":
      return { ...state, elapsedSeconds: 0, isTimerRunning: false };

    case "NEXT_TASK":
      return { 
        ...state, 
        activeTaskIndex: state.activeTaskIndex + 1, 
        elapsedSeconds: 0 
      };

    case "TICK": 
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };

    case "COMPLETE_ONBOARDING":
      return { ...state, onboardingComplete: true, view: "dashboard" };

    case "REORDER_TASKS": 
      return { ...state, tasks: action.payload };

    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => t.id === action.payload ? { ...t, enabled: !t.enabled } : t),
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



useEffect(() => {
  let interval: NodeJS.Timeout
  
  // כאן היה השינוי: החלפנו מ-"timer" ל-"dashboard"
  // כי זה השם של ה-view שבו הקומפוננטה ActiveTimer מוצגת
  if (state.isTimerRunning && state.view === "dashboard") { 
    interval = setInterval(() => {
      rawDispatch({ type: "TICK" })
    }, 1000)
  }
  
  return () => clearInterval(interval)
}, [state.isTimerRunning, state.view])
  // טעינה מ-Supabase (עם שמות העמודות מהתמונות שלך)
useEffect(() => {
  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id)

    if (data && data.length > 0) {
      // משתמש קיים - טוענים את שלו ומכבים את נורת ה"חדש"
      rawDispatch({ type: "REORDER_TASKS", payload: data })
      rawDispatch({ type: "SET_NEW_USER", payload: false })
    } else {
      // משתמש חדש לגמרי - משאירים את ברירת המחדל ומדליקים נורה
      rawDispatch({ type: "SET_NEW_USER", payload: true })
    }
  }
  fetchTasks()
}, [])

const dispatch = useCallback(async (action: any) => {
  rawDispatch(action)

  if (action.type === "START_ROUTINE" && state.isNewUser) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // לוקחים רק את מה שמסומן ב-V מהמשימות הדיפולטיביות
      const initialTasks = state.tasks
        .filter(t => t.enabled)
        .map(({ id, ...task }) => ({
          ...task,
          user_id: user.id
        }))

      if (initialTasks.length > 0) {
        await supabase.from('tasks').insert(initialTasks)
        // מכבים את הנורה כדי שלא יכניס שוב בפעם הבאה
        rawDispatch({ type: "SET_NEW_USER", payload: false })
        console.log("First time setup complete!")
      }
    }
  }
}, [state.tasks, state.isNewUser])

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