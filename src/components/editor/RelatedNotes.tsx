import React, { useState } from 'react';
import { Note } from '../../types';
import { useNotesStore } from '../../stores/useNotesStore';
import { Link2, Plus, X, ArrowUpRight } from 'lucide-react';

interface RelatedNotesProps {
  currentNote: Note;
}

export const RelatedNotes: React.FC<RelatedNotesProps> = ({ currentNote }) => {
  const { notes, setActiveNoteId, updateActiveNote } = useNotesStore();
  const [isLinking, setIsLinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Manually linked notes
  const linkedIds = (currentNote.relatedNoteIds || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const manuallyLinkedNotes = notes.filter((n) => linkedIds.includes(n.id));

  // 2. Suggested notes based on shared Category or Tags
  const currentTags = (currentNote.tags || '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const suggestedNotes = notes
    .filter((n) => {
      if (n.id === currentNote.id || linkedIds.includes(n.id) || n.isDeleted || n.isArchived) {
        return false;
      }
      // Check shared category
      const sameCat = currentNote.categoryId && n.categoryId === currentNote.categoryId;
      // Check shared tag
      const nTags = (n.tags || '').split(',').map((t) => t.trim().toLowerCase());
      const hasSharedTag = currentTags.some((t) => nTags.includes(t));
      return sameCat || hasSharedTag;
    })
    .slice(0, 4);

  const handleAddLink = (targetNoteId: string) => {
    const updatedIds = Array.from(new Set([...linkedIds, targetNoteId])).join(',');
    updateActiveNote({ relatedNoteIds: updatedIds });
    setIsLinking(false);
    setSearchQuery('');
  };

  const handleRemoveLink = (e: React.MouseEvent, targetNoteId: string) => {
    e.stopPropagation();
    const updatedIds = linkedIds.filter((id) => id !== targetNoteId).join(',');
    updateActiveNote({ relatedNoteIds: updatedIds });
  };

  const candidateNotes = notes.filter(
    (n) =>
      n.id !== currentNote.id &&
      !linkedIds.includes(n.id) &&
      !n.isDeleted &&
      (searchQuery.trim() === '' || n.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="mt-12 pt-6 border-t border-gray-100 dark:border-zinc-800/80 select-none no-print">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
          <Link2 className="w-3.5 h-3.5" />
          <span>Related Notes</span>
        </div>

        <button
          type="button"
          onClick={() => setIsLinking(!isLinking)}
          className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-black dark:hover:text-white px-2 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Link Note</span>
        </button>
      </div>

      {/* Linking Search Popover */}
      {isLinking && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-gray-600 dark:text-zinc-300">
              Select a note to connect:
            </span>
            <button
              type="button"
              onClick={() => setIsLinking(false)}
              className="text-gray-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search note title..."
            className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded focus:border-black dark:focus:border-white focus:outline-none text-gray-900 dark:text-zinc-100 mb-2"
          />
          <div className="max-h-40 overflow-y-auto space-y-1">
            {candidateNotes.length === 0 ? (
              <div className="text-[11px] text-gray-400 text-center py-2">No notes available</div>
            ) : (
              candidateNotes.slice(0, 8).map((cand) => (
                <button
                  key={cand.id}
                  type="button"
                  onClick={() => handleAddLink(cand.id)}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-200/70 dark:hover:bg-zinc-800 rounded truncate flex items-center justify-between group"
                >
                  <span className="truncate">{cand.title || 'Untitled Note'}</span>
                  <span className="text-[10px] text-gray-400 font-mono opacity-0 group-hover:opacity-100">
                    connect +
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Active Linked & Suggested Notes Badges */}
      {manuallyLinkedNotes.length === 0 && suggestedNotes.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-zinc-500 italic">
          No related notes yet. Link references above to connect related concepts.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {/* Manually linked */}
          {manuallyLinkedNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 cursor-pointer border border-gray-200/80 dark:border-zinc-700 transition-colors group"
            >
              <span className="font-medium truncate max-w-[200px]">{note.title || 'Untitled'}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveLink(e, note.id)}
                className="text-gray-400 hover:text-red-500 p-0.5 rounded"
                title="Unlink"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Suggested */}
          {suggestedNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 cursor-pointer border border-dashed border-gray-300 dark:border-zinc-800 transition-colors"
              title="Suggested relation by category or tags"
            >
              <span className="truncate max-w-[180px]">{note.title || 'Untitled'}</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
