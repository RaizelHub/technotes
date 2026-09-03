import React, { useState, useEffect, useRef } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';
import { X, Check, RefreshCw } from 'lucide-react';

export const QuickNoteModal: React.FC = () => {
  const {
    isQuickNoteOpen,
    setQuickNoteOpen,
    createNote,
    categories,
    fetchNotes,
  } = useNotesStore();

  const [noteId, setNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimerRef = useRef<any>(null);

  // Initialize or reset quick note on open
  useEffect(() => {
    if (isQuickNoteOpen) {
      const now = new Date();
      const defaultTitle = `Quick Note - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setTitle(defaultTitle);
      setContent('');
      setSaveStatus('idle');

      // Create note in database immediately
      createNote({ title: defaultTitle, content: '', categoryId: null })
        .then((newNote) => {
          setNoteId(newNote.id);
          setSaveStatus('saved');
        })
        .catch((err) => console.error('Failed to init quick note:', err));
    } else {
      setNoteId(null);
    }
  }, [isQuickNoteOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQuickNoteOpen) {
        setQuickNoteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickNoteOpen, setQuickNoteOpen]);

  // Auto-save logic
  const triggerAutoSave = (newTitle: string, newContent: string, newCatId: string | null) => {
    if (!noteId) return;
    setSaveStatus('saving');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        const formattedContent = newContent.includes('\n')
          ? `<pre><code>${newContent}</code></pre>`
          : `<p>${newContent}</p>`;

        const res = await fetch(`/api/notes/${noteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTitle || 'Quick Note',
            content: formattedContent,
            categoryId: newCatId,
          }),
        });
        if (res.ok) {
          setSaveStatus('saved');
          fetchNotes();
        }
      } catch (err) {
        console.error('Quick note auto-save failed:', err);
      }
    }, 500);
  };

  if (!isQuickNoteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 select-none">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-gray-900 dark:text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-tight font-mono">
              QUICK NOTE
            </span>
            <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">(Cisco / Lab capture)</span>
          </div>

          <button
            type="button"
            onClick={() => setQuickNoteOpen(false)}
            className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-3 bg-white dark:bg-zinc-900">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                triggerAutoSave(val, content, categoryId);
              }}
              placeholder="e.g. Cisco Router Configuration"
              className="w-full text-sm px-3 py-1.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-zinc-500 focus:outline-none transition-colors text-gray-900 dark:text-zinc-100"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={categoryId || ''}
              onChange={(e) => {
                const val = e.target.value ? e.target.value : null;
                setCategoryId(val);
                triggerAutoSave(title, content, val);
              }}
              className="w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-zinc-500 focus:outline-none cursor-pointer text-gray-900 dark:text-zinc-100"
            >
              <option value="">(No Category)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Commands / Note Text */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Commands / Notes
            </label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => {
                const val = e.target.value;
                setContent(val);
                triggerAutoSave(title, val, categoryId);
              }}
              placeholder="Router(config)# interface g0/0&#10;Router(config-if)# no shutdown"
              className="w-full text-xs font-mono px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-zinc-500 focus:outline-none transition-colors resize-none leading-relaxed text-gray-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Footer Status */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-zinc-950/80 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
          <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">Press Esc to close</span>

          <div className="flex items-center gap-1 text-xs">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-gray-500 dark:text-zinc-400">
                <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-gray-700 dark:text-zinc-300 font-medium">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                Saved automatically ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
