import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock3, ChevronLeft, Trash2 } from 'lucide-react';

interface Slot {
  id: string;
  name: string;
  time: number;
  progress: number;
}

const ACCENTS = [
  'bg-primary/70',
  'bg-accent/70',
  'bg-[#81C9A3]/70',
  'bg-[#B8A4D4]/70',
];

const hashId = (id: string) =>
  id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

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
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const accent = ACCENTS[hashId(slot.id) % ACCENTS.length];

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins} דק׳`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} שע׳ ${m} דק׳` : `${h} שע׳`;
  };

  const deleteSlot = async () => {
    setDeleting(true);
    try {
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('time_slot_id', slot.id);
      if (tasksError) throw tasksError;

      const { data: deleted, error: slotError } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', slot.id)
        .select('id');
      if (slotError) throw slotError;

      if (!deleted || deleted.length === 0) {
        throw new Error('השרת לא מחק את הזמן – בדקי מדיניות DELETE ב-RLS.');
      }

      onDeleted?.(slot.id);
      await onUpdate?.();
    } catch (error: any) {
      console.error('שגיאה במחיקה:', error);
      alert('שגיאה במחיקת הזמן: ' + error.message);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="group neu-flat rounded-[22px] bg-background overflow-hidden transition-all hover:scale-[1.005]">
      <div className="flex">
        {/* Coloured left stripe */}
        <div className={`w-1 shrink-0 ${accent}`} />

        <div className="flex flex-1 items-center gap-4 px-5 py-4">
          {/* Name + time */}
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-base font-bold text-foreground leading-snug">
              {slot.name}
            </h3>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Clock3 className="h-3 w-3 text-primary/60" />
              <span className="text-xs font-semibold text-primary/80">{formatTime(slot.time)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  ביטול
                </button>
                <button
                  onClick={deleteSlot}
                  disabled={deleting}
                  className="rounded-xl bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition-all hover:bg-destructive/20 disabled:opacity-50"
                >
                  {deleting ? '...' : 'מחק'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="neu-flat-sm flex h-8 w-8 items-center justify-center rounded-xl bg-background text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={() => onSelect?.(slot.id)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-[0_3px_12px_rgba(111,163,199,0.35)] transition-all hover:shadow-[0_5px_18px_rgba(111,163,199,0.45)] hover:scale-[1.04] active:scale-[0.97]"
            >
              פתיחה
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}