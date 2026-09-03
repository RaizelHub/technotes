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
  Bookmark,
  RotateCcw,
  FlaskConical,
  Wrench,
  Zap,
  Code,
  Layers,
  Bot,
  Network,
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
    selectedTrack,
    selectedFilter,
    selectedTag,
    setSelectedTag,
    categories,
    createNote,
    togglePin,
    toggleArchive,
    toggleReviewLater,
    duplicateNote,
    moveToTrash,
    restoreFromTrash,
    permanentDeleteNote,
    emptyTrash,
  } = useNotesStore();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Strip HTML tags for clean card snippet preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getFilterTitle = () => {
    let title = 'Notes';
    if (selectedTag) title = `Tag: #${selectedTag}`;
    else if (selectedFilter === 'all') title = 'All Notes';
    else if (selectedFilter === 'quick_captures') title = 'Quick Captures';
    else if (selectedFilter === 'review_later') title = 'Review Later';
    else if (selectedFilter === 'labs') title = 'Cisco Labs';
    else if (selectedFilter === 'troubleshooting') title = 'Troubleshooting';
    else if (selectedFilter === 'coding_concepts') title = 'Coding Concepts';
    else if (selectedFilter === 'dev_projects') title = 'Projects';
    else if (selectedFilter === 'workflows') title = 'Workflows';
    else if (selectedFilter === 'pinned') title = 'Pinned Notes';
    else if (selectedFilter === 'archived') title = 'Archived Notes';
    else if (selectedFilter === 'trash') title = 'Trash';
    else if (selectedFilter === 'uncategorized') title = 'Uncategorized';
    else {
      const cat = categories.find((c) => c.id === selectedFilter);
      title = cat ? cat.name : 'Notes';
    }

    if (selectedTrack !== 'all' && selectedFilter === 'all') {
      return `${selectedTrack}`;
    }
    return title;
  };

  const isTrashView = selectedFilter === 'trash';

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

          <div className="flex items-center gap-2">
            {isTrashView && notes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Permanently delete all notes in Trash? This cannot be undone.')) {
                    emptyTrash();
                  }
                }}
                className="text-[11px] text-red-600 dark:text-red-400 hover:underline"
              >
                Empty Trash
              </button>
            )}
            <span className="text-xs text-gray-400 dark:text-zinc-500 font-mono">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, tracks, tags, code..."
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
                <p className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                  No matching notes found.
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  Try another search term or filter.
                </p>
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
            ) : isTrashView ? (
              <div className="space-y-2 text-xs text-gray-400">
                <p>Trash is empty.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-700 dark:text-zinc-300">No notes here yet.</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  Create a new note or choose a template.
                </p>
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
                {/* Note Title & Status Indicators */}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    {/* Learning Status Dot */}
                    {note.learningStatus === 'dont_understand' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" title="Don't Understand" />
                    )}
                    {note.learningStatus === 'reviewing' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" title="Reviewing" />
                    )}
                    {note.learningStatus === 'learned' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" title="Learned" />
                    )}

                    <h3
                      className={`text-xs font-medium truncate ${
                        isSelected
                          ? 'text-black dark:text-white font-semibold'
                          : 'text-gray-900 dark:text-zinc-200'
                      }`}
                    >
                      {note.title || 'Untitled Note'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {note.isReviewLater && (
                      <span title="Review Later">
                        <Bookmark className="w-3 h-3 text-blue-500 fill-current" />
                      </span>
                    )}
                    {note.isPinned && (
                      <Pin className="w-3 h-3 text-black dark:text-white fill-current" />
                    )}

                    {isTrashView ? (
                      /* Trash Actions */
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            restoreFromTrash(note.id);
                          }}
                          className="p-1 text-gray-400 hover:text-black dark:hover:text-white rounded"
                          title="Restore note"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete note permanently?')) {
                              permanentDeleteNote(note.id);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      /* Context Menu Trigger */
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
                    )}
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

                {/* Footer: Track (if viewing all), Category, Type Badge, and updated time */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-zinc-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                    {/* Career Track Pill (shown when All Tracks selected) */}
                    {selectedTrack === 'all' && (
                      <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 flex-shrink-0">
                        {note.track === 'IT & Networking' && 'IT'}
                        {note.track === 'Software Development' && 'DEV'}
                        {note.track === 'AI & Automation' && 'AI'}
                      </span>
                    )}

                    {categoryName ? (
                      <span className="truncate inline-block px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium">
                        {categoryName}
                      </span>
                    ) : (
                      <span>Uncategorized</span>
                    )}

                    {/* Specialized Note Type Badges */}
                    {note.type === 'lab' && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        <FlaskConical className="w-2.5 h-2.5" />
                        <span>LAB</span>
                      </span>
                    )}
                    {note.type === 'troubleshooting' && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                        <Wrench className="w-2.5 h-2.5" />
                        <span>TS</span>
                      </span>
                    )}
                    {note.type === 'quick_capture' && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        <Zap className="w-2.5 h-2.5" />
                        <span>QC</span>
                      </span>
                    )}
                    {note.type === 'coding_concept' && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        <Code className="w-2.5 h-2.5" />
                        <span>CODE</span>
                      </span>
                    )}
                    {note.type === 'dev_project' && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        <Layers className="w-2.5 h-2.5" />
                        <span>PROJ</span>
                      </span>
                    )}
                    {note.type === 'automation_workflow' && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        <Bot className="w-2.5 h-2.5" />
                        <span>AUTO</span>
                      </span>
                    )}
                  </div>

                  <span className="flex-shrink-0">{formatRelativeTime(note.updatedAt)}</span>
                </div>

                {/* Context Menu Dropdown */}
                {activeMenuId === note.id && !isTrashView && (
                  <div
                    className="absolute right-3 top-8 w-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded shadow-md py-1 z-30 text-gray-700 dark:text-zinc-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        toggleReviewLater(note.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Bookmark className="w-3 h-3" />
                      <span>{note.isReviewLater ? 'Remove Review Later' : 'Review Later'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        togglePin(note.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
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
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
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
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Archive className="w-3 h-3" />
                      <span>{note.isArchived ? 'Unarchive' : 'Archive'}</span>
                    </button>
                    <div className="border-t border-gray-100 dark:border-zinc-800 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        moveToTrash(note.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Move to Trash</span>
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
