import React, { useState, useEffect } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';
import { Clock, X, ArrowUpRight, Calendar } from 'lucide-react';
import { Note } from '../../types';

interface TimelineGroup {
  date: string;
  notes: Note[];
}

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({ isOpen, onClose }) => {
  const { setActiveNoteId } = useNotesStore();
  const [timeline, setTimeline] = useState<TimelineGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/timeline')
        .then((res) => res.json())
        .then((data) => {
          setTimeline(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load timeline:', err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-gray-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-700 dark:text-zinc-300" />
            <span className="font-semibold text-xs font-mono uppercase tracking-tight">
              Learning History / Timeline
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-400">Loading learning history...</div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">No notes recorded yet.</div>
          ) : (
            timeline.map((group) => (
              <div key={group.date} className="space-y-2">
                <div className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider sticky top-0 bg-white dark:bg-zinc-900 py-1 border-b border-gray-100 dark:border-zinc-800/80">
                  {group.date}
                </div>

                <div className="space-y-1 pl-2 border-l border-gray-200 dark:border-zinc-800">
                  {group.notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => {
                        setActiveNoteId(note.id);
                        onClose();
                      }}
                      className="p-2 hover:bg-gray-50 dark:hover:bg-zinc-800/60 rounded cursor-pointer transition-colors flex items-center justify-between group"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-medium text-gray-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white truncate">
                          {note.title || 'Untitled Note'}
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-zinc-500">
                          {note.category?.name || 'Uncategorized'}
                          {note.type !== 'general' && (
                            <span className="ml-1.5 font-mono text-[10px] text-gray-500 uppercase">
                              • {note.type}
                            </span>
                          )}
                        </div>
                      </div>

                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-white transition-colors flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
