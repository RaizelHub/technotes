import React, { useState, useEffect } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';
import { Track, ALL_TRACKS } from '../../types';
import {
  FileText,
  Pin,
  Archive,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Folder,
  ChevronDown,
  ChevronRight,
  Database,
  Hash,
  Bookmark,
  Zap,
  FlaskConical,
  Wrench,
  HelpCircle,
  Terminal,
  Calendar,
  Shuffle,
  Trash,
  Code,
  Bot,
  Network,
  Calculator,
  Compass,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    notes,
    categories,
    tags,
    selectedTrack,
    selectedFilter,
    selectedTag,
    setSelectedTrack,
    setSelectedFilter,
    setSelectedTag,
    createNote,
    createCategory,
    renameCategory,
    deleteCategory,
    renameTag,
    fetchTags,
    triggerRandomReview,
    setQuestionsOpen,
    setCommandReferenceOpen,
    setTimelineOpen,
    setBackupOpen,
    setSubnetCalculatorOpen,
    setTrackOverviewOpen,
  } = useNotesStore();

  // Collapsible track sections in sidebar
  const [expandedTracks, setExpandedTracks] = useState<Record<Track, boolean>>({
    'IT & Networking': true,
    'Software Development': true,
    'AI & Automation': true,
  });

  const [isAddingCategory, setIsAddingCategory] = useState<Track | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [activeMenuCatId, setActiveMenuCatId] = useState<string | null>(null);

  // Tag rename state
  const [editingTagName, setEditingTagName] = useState<string | null>(null);
  const [renameTagVal, setRenameTagVal] = useState('');

  useEffect(() => {
    fetchTags();
  }, [selectedTrack]);

  const toggleTrackSection = (track: Track) => {
    setExpandedTracks((prev) => ({ ...prev, [track]: !prev[track] }));
  };

  // Filter notes by selected track (if not 'all')
  const trackScopedNotes = notes.filter((n) =>
    selectedTrack === 'all' ? true : n.track === selectedTrack
  );

  // Counts (active notes, non-deleted, non-archived)
  const totalAllNotes = trackScopedNotes.filter((n) => !n.isArchived && !n.isDeleted).length;
  const totalPinnedNotes = trackScopedNotes.filter((n) => n.isPinned && !n.isDeleted && !n.isArchived).length;
  const totalReviewLater = trackScopedNotes.filter((n) => n.isReviewLater && !n.isDeleted && !n.isArchived).length;
  const totalQuickCaptures = trackScopedNotes.filter((n) => n.type === 'quick_capture' && !n.isDeleted && !n.isArchived).length;

  const handleAddCategorySubmit = async (e: React.FormEvent, track: Track) => {
    e.preventDefault();
    if (newCatName.trim()) {
      await createCategory(newCatName.trim(), track);
      setNewCatName('');
      setIsAddingCategory(null);
    }
  };

  const handleRenameCategorySubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editCatName.trim()) {
      await renameCategory(id, editCatName.trim());
      setEditingCatId(null);
      setEditCatName('');
    }
  };

  const handleRenameTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTagName && renameTagVal.trim()) {
      await renameTag(editingTagName, renameTagVal.trim());
      setEditingTagName(null);
      setRenameTagVal('');
    }
  };

  const tracksToDisplay: Track[] =
    selectedTrack === 'all' ? ALL_TRACKS : [selectedTrack];

  return (
    <aside className="w-64 flex-shrink-0 h-full bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 flex flex-col select-none no-print">
      {/* Top Application Header / Brand */}
      <div className="p-3.5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded border border-gray-900 dark:border-zinc-100 flex items-center justify-center font-bold text-xs bg-gray-900 dark:bg-zinc-100 text-white dark:text-black font-mono">
            T
          </div>
          <span className="font-semibold text-sm tracking-tight text-gray-900 dark:text-zinc-100">
            TechNotes
          </span>
        </div>
        <button
          type="button"
          onClick={() => setTrackOverviewOpen(true)}
          className="text-[11px] font-mono text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 hover:underline"
          title="Open Career Track Overview"
        >
          <Compass className="w-3 h-3" />
          <span>Tracks</span>
        </button>
      </div>

      {/* Top Track Switcher Bar */}
      <div className="px-2 pt-2 pb-1 border-b border-gray-100 dark:border-zinc-900">
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-gray-100 dark:bg-zinc-900 rounded-md text-[10px] font-medium text-center">
          <button
            type="button"
            onClick={() => setSelectedTrack('all')}
            className={`py-1 rounded transition-colors truncate ${
              selectedTrack === 'all'
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs font-semibold'
                : 'text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
            title="All Career Tracks"
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSelectedTrack('IT & Networking')}
            className={`py-1 rounded transition-colors truncate ${
              selectedTrack === 'IT & Networking'
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs font-semibold'
                : 'text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
            title="IT & Networking Track"
          >
            IT/Net
          </button>
          <button
            type="button"
            onClick={() => setSelectedTrack('Software Development')}
            className={`py-1 rounded transition-colors truncate ${
              selectedTrack === 'Software Development'
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs font-semibold'
                : 'text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
            title="Software Development Track"
          >
            Dev
          </button>
          <button
            type="button"
            onClick={() => setSelectedTrack('AI & Automation')}
            className={`py-1 rounded transition-colors truncate ${
              selectedTrack === 'AI & Automation'
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs font-semibold'
                : 'text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
            title="AI & Automation Track"
          >
            AI/Auto
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-4">
        {/* 1. Core Quick Navigation */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedFilter === 'all' && !selectedTag
                ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
              <span>All Notes</span>
            </div>
            <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">{totalAllNotes}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('quick_captures')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedFilter === 'quick_captures' && !selectedTag
                ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Captures</span>
            </div>
            {totalQuickCaptures > 0 && (
              <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">
                {totalQuickCaptures}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('pinned')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedFilter === 'pinned' && !selectedTag
                ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
              <span>Pinned</span>
            </div>
            {totalPinnedNotes > 0 && (
              <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">{totalPinnedNotes}</span>
            )}
          </button>
        </div>

        {/* 2. MY LEARNING (Track-based categories) */}
        <div>
          <div className="px-2.5 py-1 text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
            My Learning
          </div>

          <div className="space-y-3 mt-1">
            {tracksToDisplay.map((track) => {
              const isExpanded = expandedTracks[track];
              const trackCategories = categories.filter((c) => c.track === track);

              return (
                <div key={track} className="space-y-0.5">
                  {/* Track Section Header */}
                  <div className="flex items-center justify-between px-2 py-1 rounded text-xs font-semibold text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-900 group">
                    <button
                      type="button"
                      onClick={() => toggleTrackSection(track)}
                      className="flex items-center gap-1.5 flex-1 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      )}
                      {track === 'IT & Networking' && <Network className="w-3 h-3 text-blue-600" />}
                      {track === 'Software Development' && <Code className="w-3 h-3 text-emerald-600" />}
                      {track === 'AI & Automation' && <Bot className="w-3 h-3 text-purple-600" />}
                      <span className="text-[11px] uppercase tracking-wide">{track}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(track)}
                      className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white rounded"
                      title={`Add category to ${track}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Expanded Track Content */}
                  {isExpanded && (
                    <div className="pl-3 space-y-0.5">
                      {/* Track-Specific Formats & Templates Filter */}
                      {track === 'IT & Networking' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedFilter('labs')}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                              selectedFilter === 'labs' && !selectedTag
                                ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-medium'
                                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <FlaskConical className="w-3 h-3 text-purple-500" />
                              <span>Cisco Labs</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedFilter('troubleshooting')}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                              selectedFilter === 'troubleshooting' && !selectedTag
                                ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-medium'
                                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Wrench className="w-3 h-3 text-orange-500" />
                              <span>Troubleshooting</span>
                            </span>
                          </button>
                        </>
                      )}

                      {track === 'Software Development' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedFilter('coding_concepts')}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                              selectedFilter === 'coding_concepts' && !selectedTag
                                ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-medium'
                                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Code className="w-3 h-3 text-emerald-500" />
                              <span>Coding Concepts</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedFilter('dev_projects')}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                              selectedFilter === 'dev_projects' && !selectedTag
                                ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-medium'
                                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Layers className="w-3 h-3 text-blue-500" />
                              <span>Projects</span>
                            </span>
                          </button>
                        </>
                      )}

                      {track === 'AI & Automation' && (
                        <button
                          type="button"
                          onClick={() => setSelectedFilter('workflows')}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                            selectedFilter === 'workflows' && !selectedTag
                              ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-medium'
                              : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Bot className="w-3 h-3 text-purple-500" />
                            <span>Workflows</span>
                          </span>
                        </button>
                      )}

                      {/* Add Category Form */}
                      {isAddingCategory === track && (
                        <form
                          onSubmit={(e) => handleAddCategorySubmit(e, track)}
                          className="px-1 py-1"
                        >
                          <input
                            type="text"
                            autoFocus
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Escape' && setIsAddingCategory(null)}
                            placeholder={`New ${track} category...`}
                            className="w-full text-xs px-2 py-1 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded focus:border-black dark:focus:border-white focus:outline-none"
                          />
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <button
                              type="button"
                              onClick={() => setIsAddingCategory(null)}
                              className="px-2 py-0.5 text-[10px] text-gray-500 hover:text-black dark:hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-2 py-0.5 text-[10px] bg-black dark:bg-white text-white dark:text-black rounded"
                            >
                              Add
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Categories List for this Track */}
                      {trackCategories.map((cat) => (
                        <div key={cat.id} className="relative group">
                          {editingCatId === cat.id ? (
                            <form
                              onSubmit={(e) => handleRenameCategorySubmit(e, cat.id)}
                              className="px-1 py-0.5"
                            >
                              <input
                                type="text"
                                autoFocus
                                value={editCatName}
                                onChange={(e) => setEditCatName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Escape' && setEditingCatId(null)}
                                className="w-full text-xs px-2 py-0.5 bg-white dark:bg-zinc-900 border border-black dark:border-white rounded outline-none"
                              />
                            </form>
                          ) : (
                            <div
                              className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                                selectedFilter === cat.id && !selectedTag
                                  ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                              }`}
                              onClick={() => setSelectedFilter(cat.id)}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <Folder className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{cat.name}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-400 font-mono group-hover:hidden">
                                  {cat._count?.notes ?? 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuCatId(activeMenuCatId === cat.id ? null : cat.id);
                                  }}
                                  className="hidden group-hover:flex p-0.5 text-gray-400 hover:text-black dark:hover:text-white rounded"
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Category Actions Dropdown */}
                          {activeMenuCatId === cat.id && (
                            <div className="absolute right-2 top-full mt-0.5 w-28 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded shadow-md py-1 z-30">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCatId(cat.id);
                                  setEditCatName(cat.name);
                                  setActiveMenuCatId(null);
                                }}
                                className="w-full text-left px-2.5 py-1 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Rename</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm(
                                      `Delete category "${cat.name}"? Notes will become uncategorized.`
                                    )
                                  ) {
                                    deleteCategory(cat.id);
                                  }
                                  setActiveMenuCatId(null);
                                }}
                                className="w-full text-left px-2.5 py-1 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. REVIEW SECTION */}
        <div>
          <div className="px-2.5 py-1 text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
            Review
          </div>
          <div className="space-y-0.5 mt-0.5">
            <button
              type="button"
              onClick={() => setSelectedFilter('review_later')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedFilter === 'review_later' && !selectedTag
                  ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-blue-500" />
                <span>Review Later</span>
              </div>
              {totalReviewLater > 0 && (
                <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">
                  {totalReviewLater}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setQuestionsOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>Questions Backlog</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTimelineOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>Learning History</span>
              </div>
            </button>
          </div>
        </div>

        {/* 4. REFERENCE SECTION */}
        <div>
          <div className="px-2.5 py-1 text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
            Reference
          </div>
          <div className="space-y-0.5 mt-0.5">
            <button
              type="button"
              onClick={() => setCommandReferenceOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-gray-500" />
                <span>Commands & Code</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSubnetCalculatorOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5 text-gray-500" />
                <span>Subnet Calculator</span>
              </div>
            </button>
          </div>
        </div>

        {/* 5. TAGS SECTION */}
        {tags.length > 0 && (
          <div className="pt-2 border-t border-gray-100 dark:border-zinc-900">
            <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              <span>Tags</span>
              {selectedTag && (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="text-[10px] text-gray-400 hover:text-black dark:hover:text-white lowercase underline"
                >
                  clear
                </button>
              )}
            </div>

            {/* Inline tag rename */}
            {editingTagName && (
              <form onSubmit={handleRenameTagSubmit} className="px-2 py-1">
                <input
                  type="text"
                  autoFocus
                  value={renameTagVal}
                  onChange={(e) => setRenameTagVal(e.target.value)}
                  placeholder={`Rename #${editingTagName}...`}
                  className="w-full text-xs px-2 py-1 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded focus:border-black dark:focus:border-white focus:outline-none"
                />
                <div className="flex items-center justify-end gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setEditingTagName(null)}
                    className="text-[10px] text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[10px] bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-wrap gap-1 px-2 pt-1">
              {tags.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === t.name ? null : t.name)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    selectedTag === t.name
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                      : 'bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Hash className="w-2.5 h-2.5 opacity-60" />
                  <span>{t.name}</span>
                  <span className="text-[10px] opacity-60">({t.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. SYSTEM (Archive & Trash) */}
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-900 space-y-0.5">
          <button
            type="button"
            onClick={() => setSelectedFilter('archived')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedFilter === 'archived' && !selectedTag
                ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Archive className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              <span>Archived</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('trash')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedFilter === 'trash' && !selectedTag
                ? 'bg-gray-100 dark:bg-zinc-800 text-red-600 dark:text-red-400 font-semibold'
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-red-600 dark:hover:text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Trash className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              <span>Trash</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Actions: New Note, Random Review & Backup */}
      <div className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 space-y-2">
        <button
          type="button"
          onClick={() => createNote()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black rounded-md text-xs font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>

        {/* Random Review Button */}
        <button
          type="button"
          onClick={triggerRandomReview}
          className="w-full text-left px-2 py-1 text-[11px] text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center justify-between rounded hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
          title="Randomly open a note to review (Ctrl+Shift+R)"
        >
          <div className="flex items-center gap-1.5">
            <Shuffle className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>Review Something</span>
          </div>
          <span className="text-[10px] font-mono text-gray-400">Ctrl+Shift+R</span>
        </button>

        {/* Database Backup & Restore Trigger */}
        <button
          type="button"
          onClick={() => setBackupOpen(true)}
          className="w-full text-left px-2 py-1 text-[11px] text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
          title="Database Backup, Restore & Markdown Export"
        >
          <Database className="w-3 h-3 text-gray-400 dark:text-zinc-500" />
          <span>Backup & Data Safety</span>
        </button>
      </div>
    </aside>
  );
};
