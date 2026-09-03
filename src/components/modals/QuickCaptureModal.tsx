import React, { useState, useEffect, useRef } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';
import { X, Check, RefreshCw, ArrowUpRight } from 'lucide-react';

export const QuickCaptureModal: React.FC = () => {
  const {
    isQuickCaptureOpen,
    setQuickCaptureOpen,
    createNote,
    updateActiveNote,
    setActiveNoteId,
    fetchNotes,
  } = useNotesStore();

  const [noteId, setNoteId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimerRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize fresh quick capture note on open
  useEffect(() => {
    if (isQuickCaptureOpen) {
      setContent('');
      setSaveStatus('idle');

      const now = new Date();
      const defaultTitle = `Quick Capture • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      createNote({
        title: defaultTitle,
        content: '',
        type: 'quick_capture',
        categoryId: null,
      })
        .then((newNote) => {
          setNoteId(newNote.id);
          setSaveStatus('saved');
          setTimeout(() => textareaRef.current?.focus(), 50);
        })
        .catch((err) => console.error('Failed to init quick capture:', err));
    } else {
      setNoteId(null);
    }
  }, [isQuickCaptureOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQuickCaptureOpen) {
        setQuickCaptureOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickCaptureOpen, setQuickCaptureOpen]);

  // Auto-save logic on input
  const handleContentChange = (val: string) => {
    setContent(val);
    if (!noteId) return;

    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        const firstLine = val.trim().split('\n')[0];
        const dynamicTitle = firstLine ? firstLine.slice(0, 48) : 'Quick Capture';
        const formatted = `<p>${val.replace(/\n/g, '<br>')}</p>`;

        await fetch(`/api/notes/${noteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: dynamicTitle,
            content: formatted,
            type: 'quick_capture',
          }),
        });

        setSaveStatus('saved');
        fetchNotes();
      } catch (err) {
        console.error('Quick capture auto-save failed:', err);
      }
    }, 400);
  };

  const handleConvertToFullNote = () => {
    if (noteId) {
      // Switch type to 'general' and open in full editor
      fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'general' }),
      }).then(() => {
        fetchNotes().then(() => {
          setActiveNoteId(noteId);
          setQuickCaptureOpen(false);
        });
      });
    }
  };

  const handleSaveCapture = () => {
    setQuickCaptureOpen(false);
  };

  if (!isQuickCaptureOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 select-none"
      onClick={() => setQuickCaptureOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-gray-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/60">
          <span className="font-semibold text-xs tracking-tight font-mono text-gray-800 dark:text-zinc-200 uppercase">
            Quick Capture
          </span>
          <button
            type="button"
            onClick={() => setQuickCaptureOpen(false)}
            className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Text Input */}
        <div className="p-4 bg-white dark:bg-zinc-900">
          <textarea
            ref={textareaRef}
            rows={7}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Remember this...&#10;&#10;Why does a trunk port carry multiple VLANs?"
            className="w-full text-sm font-sans px-3 py-2 bg-gray-50/60 dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-md focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-zinc-500 focus:outline-none transition-colors resize-none leading-relaxed text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-zinc-950/80 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center gap-1 font-mono">
                <Check className="w-3 h-3 stroke-[2.5]" />
                Saved ✓
              </span>
            )}
            <button
              type="button"
              onClick={handleConvertToFullNote}
              className="text-[11px] text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-0.5 underline decoration-gray-300 ml-2"
              title="Convert this capture into a full editable note"
            >
              <span>Open as Note</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveCapture}
            className="px-3 py-1.5 bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black rounded text-xs font-medium transition-colors"
          >
            Save Capture
          </button>
        </div>
      </div>
    </div>
  );
};
