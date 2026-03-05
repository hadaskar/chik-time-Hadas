
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
}

const INITIAL_STATE: AppState = {
  view: "onboarding",
  onboardingComplete: false,
  tasks: [],
  activeTaskIndex: 0,
  isTimerRunning: false,
  elapsedSeconds: 0,
  notifications: { enabled: true, sound: "gentle-chime", reminderBefore: 30 },
  wakeUpTime: "07:00",
}



// function reducer(state: AppState, action: any): AppState {

//   switch (action.type) {
//     case "SET_VIEW": 
//       return { ...state, view: action.payload };

//     case "START_ROUTINE": 
//       return { 
//         ...state, 
//         view: "dashboard",      // משאירים דשבורד כי זה מה שה-page.tsx מבין
//         isTimerRunning: true, 
//         activeTaskIndex: 0, 
//         elapsedSeconds: 0 
//       };

//     case "COMPLETE_ONBOARDING":
//       return { ...state, onboardingComplete: true, view: "dashboard" };

//     case "TICK": 
//       return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };

//     case "REORDER_TASKS": 
//       return { ...state, tasks: action.payload };
    
//     // ... שאר הפעולות (TOGGLE, UPDATE וכו')
//     default: return state;
//   }
// }



// --- 2. הגדרת ה-Context (מתקן את image_15fc5f) ---

function reducer(state: AppState, action: any): AppState {
  switch (action.type) {
    case "SET_VIEW": 
      return { ...state, view: action.payload };
// בתוך ה-switch ב-routine-store.ts

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
      if (data) {
        rawDispatch({ 
          type: "REORDER_TASKS", 
          payload: data.map(t => ({ 
            id: t.id, 
            name: t.name, // לפי image_15f15f
            icon: t.icon, 
            duration: t.duration, // לפי image_15f15f
            enabled: t.enabled 
          })) 
        })
      }
    }
    fetchTasks()
  }, [])

  const dispatch = useCallback((action: any) => {
    rawDispatch(action)
    // כאן אפשר להוסיף סנכרון ל-Supabase ברקע
  }, [])

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