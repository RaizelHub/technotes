import React, { useState } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';
import { formatRelativeTime } from '../../utils/date';
import { SortOption } from '../../types';
import {
  Search,
  X,
  ArrowUpDown,
  Pin,
  Archive,
  Trash2,
  Copy,
  MoreHorizontal,
  Hash,
} from 'lucide-react';

export const NoteList: React.FC = () => {
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    selectedFilter,
    selectedTag,
    setSelectedTag,
    categories,
    createNote,
    togglePin,
    toggleArchive,
    duplicateNote,
    deleteNote,
  } = useNotesStore();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Helper to strip HTML tags for clean card snippet preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getFilterTitle = () => {
    if (selectedTag) return `Tag: #${selectedTag}`;
    if (selectedFilter === 'all') return 'All Notes';
    if (selectedFilter === 'pinned') return 'Pinned Notes';
    if (selectedFilter === 'archived') return 'Archived Notes';
    if (selectedFilter === 'uncategorized') return 'Uncategorized';
    const cat = categories.find((c) => c.id === selectedFilter);
    return cat ? cat.name : 'Notes';
  };

  return (
    <div className="w-80 flex-shrink-0 h-full bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 flex flex-col select-none no-print">
      {/* Search and Header Section */}
      <div className="p-3 border-b border-gray-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 tracking-tight truncate">
              {getFilterTitle()}
            </h1>
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-[10px] text-gray-400 hover:text-black dark:hover:text-white"
                title="Clear tag filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <span className="text-xs text-gray-400 dark:text-zinc-500 font-mono">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes (Ctrl+F)..."
            className="w-full text-xs pl-8 pr-7 py-1.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md focus:bg-white dark:focus:bg-zinc-950 focus:border-black dark:focus:border-zinc-500 focus:outline-none transition-colors text-gray-900 dark:text-zinc-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-zinc-400">
            <ArrowUpDown className="w-3 h-3 text-gray-400 dark:text-zinc-500" />
            <span>Sort:</span>
          </div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="text-[11px] bg-transparent border-none text-gray-600 dark:text-zinc-400 font-medium focus:ring-0 focus:outline-none cursor-pointer hover:text-black dark:hover:text-white"
          >
            <option value="recently_updated">Recently Updated</option>
            <option value="recently_created">Recently Created</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Notes List Cards */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-900">
        {notes.length === 0 ? (
          <div className="p-8 text-center select-none">
            {searchQuery || selectedTag ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 dark:text-zinc-300">No matching notes found.</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Try another search term or filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                  }}
                  className="mt-2 text-xs text-gray-900 dark:text-zinc-100 font-medium underline hover:text-black dark:hover:text-white"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-700 dark:text-zinc-300">No notes yet.</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Create your first technical note.</p>
                <button
                  type="button"
                  onClick={() => createNote()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black rounded text-xs font-medium transition-colors"
                >
                  + New Note
                </button>
              </div>
            )}
          </div>
        ) : (
          notes.map((note) => {
            const isSelected = note.id === activeNoteId;
            const snippet = stripHtml(note.content).slice(0, 95);
            const categoryName = note.category?.name;
            const noteTags = note.tags
              ? note.tags.split(',').map((t) => t.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`relative group p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-gray-100/80 dark:bg-zinc-900 border-l-2 border-black dark:border-white'
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-900/60 border-l-2 border-transparent'
                }`}
              >
                {/* Note Title & Pin Indicator */}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3
                    className={`text-xs font-medium truncate ${
                      isSelected
                        ? 'text-black dark:text-white font-semibold'
                        : 'text-gray-900 dark:text-zinc-200'
                    }`}
                  >
                    {note.title || 'Untitled Note'}
                  </h3>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {note.isPinned && (
                      <Pin className="w-3 h-3 text-black dark:text-white fill-current" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === note.id ? null : note.id);
                      }}
                      className="hidden group-hover:block p-0.5 text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white rounded"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Content snippet preview */}
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-normal mb-1.5 font-normal">
                  {snippet || 'Empty note...'}
                </p>

                {/* Tags if any */}
                {noteTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {noteTags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800/80 px-1 py-0.2 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                    {noteTags.length > 3 && (
                      <span className="text-[10px] font-mono text-gray-400">+{noteTags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Footer: Category badge & updated time */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-zinc-500">
                  <span className="truncate max-w-[120px]">
                    {categoryName ? (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium">
                        {categoryName}
                      </span>
                    ) : (
                      <span>Uncategorized</span>
                    )}
                  </span>
                  <span>{formatRelativeTime(note.updatedAt)}</span>
                </div>

                {/* Context Menu Dropdown */}
                {activeMenuId === note.id && (
                  <div
                    className="absolute right-3 top-8 w-36 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded shadow-md py-1 z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        togglePin(note.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-gray-700 dark:text-zinc-300"
                    >
                      <Pin className="w-3 h-3" />
                      <span>{note.isPinned ? 'Unpin Note' : 'Pin Note'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        duplicateNote(note.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-gray-700 dark:text-zinc-300"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toggleArchive(note.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-gray-700 dark:text-zinc-300"
                    >
                      <Archive className="w-3 h-3" />
                      <span>{note.isArchived ? 'Unarchive' : 'Archive'}</span>
                    </button>
                    <div className="border-t border-gray-100 dark:border-zinc-800 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete this note permanently?')) {
                          deleteNote(note.id);
                        }
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
