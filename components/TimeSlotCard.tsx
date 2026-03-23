import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock3, Trash2, ListChecks } from 'lucide-react';
interface Slot {
  id: string;
  name: string;
  time: number;
  progress: number;
}

export default function TimeSlotCard({
  slot,
  onSelect,
  onUpdate,
  onDeleted,
}: {
  slot: Slot;
  onSelect?: (id: string) => void;
  onUpdate?: () => void | Promise<void>;
  onDeleted?: (id: string) => void;
}) {
  const [additionalTime, setAdditionalTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const addTime = async () => {
    if (additionalTime <= 0) return alert('הזן זמן חיובי');
    setLoading(true);
    const newTime = slot.time + additionalTime;

    const { error } = await supabase
      .from('time_slots')
      .update({
        time: newTime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', slot.id);

    setLoading(false);
    if (error) {
      console.error('שגיאה בשמירה:', error);
      alert('שגיאה בשמירה לדטאבייס: ' + error.message);
    } else {
      alert('✅ זמן נוסף נשמר בהצלחה!');
      setAdditionalTime(0);
      onUpdate?.();
    }
  };

  const deleteSlot = async () => {
    const shouldDelete = window.confirm('למחוק את הזמן הזה וכל המשימות שלו?');
    if (!shouldDelete) return;

    setDeleting(true);
    try {
      // מחיקת משימות של הזמן
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('time_slot_id', slot.id);

      if (tasksError) throw tasksError;

      // מחיקת הזמן עצמו – select() מחזיר את השורות שנמחקו בפועל
      const { data: deleted, error: slotError } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', slot.id)
        .select('id');

      if (slotError) throw slotError;

      if (!deleted || deleted.length === 0) {
        throw new Error(
          'השרת לא מחק את הזמן – כנראה חסרה מדיניות DELETE ב-RLS. הוסיפי אותה בדשבורד של Supabase.'
        );
      }

      onDeleted?.(slot.id);
      await onUpdate?.();
    } catch (error: any) {
      console.error('שגיאה במחיקה:', error);
      alert('שגיאה במחיקת הזמן: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="neu-flat overflow-hidden rounded-[24px] bg-background">
      {/* Top border — primary only */}
      <div className="h-[3px] w-full rounded-t-[24px] bg-primary/30" />

      <div className="p-5">
        {/* Name + time */}
        <div className="mb-5">
          <h3 className="mb-2 text-xl font-bold text-foreground">{slot.name}</h3>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1.5">
            <Clock3 className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-semibold text-primary">{slot.time} דקות</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect?.(slot.id)}
            className="neu-flat-sm flex flex-1 items-center justify-center gap-2 rounded-2xl bg-background py-2.5 text-sm font-semibold text-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ListChecks className="h-4 w-4" />
            משימות
          </button>
          <button
            onClick={deleteSlot}
            disabled={deleting}
            className="neu-flat-sm flex items-center justify-center gap-1.5 rounded-2xl bg-background px-3.5 py-2.5 text-sm text-muted-foreground transition-all hover:scale-[1.02] hover:text-foreground active:scale-[0.98] disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'מוחק...' : 'מחק'}
          </button>
        </div>
      </div>
    </div>
  );
}