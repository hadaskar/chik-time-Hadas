
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
    // 1. בדיקת משתמש מחובר
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 2. שליפת המשימות מהטבלה
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('task_id', { ascending: true }) // סדר לפי המזהה הקבוע שלנו

    if (data && data.length > 0) {
      // --- המהלך המנצח ---
      // אנחנו הופכים את הנתונים מהפורמט של ה-DB לפורמט שה-UI מכיר
      const formattedTasks = data.map(t => ({
        ...t,
        id: t.task_id // מחזירים את "1", "2" וכו' לשדה ה-id כדי שה-Checkbox יעבוד
      }))

      rawDispatch({ type: "REORDER_TASKS", payload: formattedTasks })
      rawDispatch({ type: "SET_NEW_USER", payload: false })
      
      console.log("נתונים נטענו בהצלחה מהשרת:", formattedTasks.length, "משימות")
    } else {
      // משתמש חדש או טבלה ריקה - נשתמש בברירת המחדל שכבר קיימת ב-Initial State
      rawDispatch({ type: "SET_NEW_USER", payload: true })
      
      // אם משום מה ה-State ריק לגמרי, נטעין את הדיפולט
      if (state.tasks.length === 0) {
        rawDispatch({ type: "REORDER_TASKS", payload: DEFAULT_TASKS })
      }
    }

    if (error) {
      console.error("שגיאה במשיכת נתונים:", error.message)
    }
  }

  fetchTasks()
}, []) // רץ פעם אחת בטעינה ראשונית של ה-Provider/ רץ רק פעם אחת בטעינה ראשונית
const dispatch = useCallback(async (action: any) => {
  // 1. עדכון ה-UI מיידית (שה-V יידלק במסך)
  rawDispatch(action);

  // 2. סנכרון לשרת רק כשלוחצים על "התחל רוטינה"
 // בתוך ה-dispatch ב-RoutineProvider
// אנחנו רוצים לסנכרן גם ב-START_ROUTINE וגם ב-COMPLETE_ONBOARDING
if (action.type === "START_ROUTINE" || action.type === "COMPLETE_ONBOARDING") {
    
      // ... שאר קוד הסנכרון שכבר כתבנו עם ה-filter וה-map ...
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("שגיאה: אין משתמש מחובר!");
        return;
      }

      // סינון המשימות שסומנו ב-V
      const tasksToSync = state.tasks
        .filter(task => task.enabled === true)
        .map((task) => ({
          user_id: user.id,
          task_id: String(task.id), // המזהה "1", "2" וכו'
          name: task.name,
          icon: task.icon,
          duration: task.duration,
          enabled: true
        }));

      // --- כאן הבדיקה (DEBUG) שביקשתי ---
      console.log("DEBUG: המשימות שאני שולחת לסנכרון:", tasksToSync);

      if (tasksToSync.length === 0) {
        console.warn("אזהרה: המערך ריק! אין משימות עם enabled: true");
        return;
      }
      // ---------------------------------

      const { data, error } = await supabase
        .from('tasks')
        .upsert(tasksToSync, { 
          onConflict: 'user_id, task_id' 
        })
        .select(); // הוספנו select כדי לראות מה חזר

      if (error) {
        console.error("שגיאת סופאבייס (RLS או מבנה):", error.message);
      } else {
        console.log("הצלחה! הנתונים שנשמרו במסד:", data);
        if (state.isNewUser) {
          rawDispatch({ type: "SET_NEW_USER", payload: false });
        }
      }

    } catch (err) {
      console.error("שגיאה קריטית בתהליך השליחה:", err);
    }
  }
}, [state.tasks, state.isNewUser]);

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