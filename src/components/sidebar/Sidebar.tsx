import React, { useState, useEffect } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';
import { downloadDatabaseBackup } from '../../utils/export';
import {
  FileText,
  Pin,
  Archive,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Folder,
  ChevronRight,
  Tag,
  Database,
  Hash,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    notes,
    categories,
    tags,
    selectedFilter,
    selectedTag,
    setSelectedFilter,
    setSelectedTag,
    createNote,
    createCategory,
    renameCategory,
    deleteCategory,
    clearAllNotes,
    fetchTags,
  } = useNotesStore();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [activeMenuCatId, setActiveMenuCatId] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  // Counts
  const totalAllNotes = notes.filter((n) => !n.isArchived).length;
  const totalPinnedNotes = notes.filter((n) => n.isPinned && !n.isArchived).length;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      await createCategory(newCatName.trim());
      setNewCatName('');
      setIsAddingCategory(false);
    }
  };

  const handleRenameCategory = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editCatName.trim()) {
      await renameCategory(id, editCatName.trim());
      setEditingCatId(null);
      setEditCatName('');
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 h-full bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 flex flex-col select-none no-print">
      {/* Top Application Header / Brand */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded border border-gray-900 dark:border-zinc-100 flex items-center justify-center font-bold text-xs bg-gray-900 dark:bg-zinc-100 text-white dark:text-black font-mono">
            T
          </div>
          <span className="font-semibold text-sm tracking-tight text-gray-900 dark:text-zinc-100">TechNotes</span>
        </div>
        <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Notebook</span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Core Navigation: All Notes, Pinned, Archived */}
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
            <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">{totalPinnedNotes}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('archived')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedFilter === 'archived' && !selectedTag
                ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Archive className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
              <span>Archived</span>
            </div>
          </button>
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
            <span>Categories</span>
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white"
              title="Add Category"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Category Input */}
          {isAddingCategory && (
            <form onSubmit={handleAddCategory} className="px-2 py-1">
              <input
                type="text"
                autoFocus
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setIsAddingCategory(false)}
                placeholder="Category name..."
                className="w-full text-xs px-2 py-1 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded focus:border-black dark:focus:border-white focus:outline-none text-gray-900 dark:text-zinc-100"
              />
              <div className="flex items-center justify-end gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-2 py-0.5 text-[11px] text-gray-500 hover:text-black dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2 py-0.5 text-[11px] bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-0.5 mt-1">
            {categories.map((cat) => (
              <div key={cat.id} className="relative group">
                {editingCatId === cat.id ? (
                  <form onSubmit={(e) => handleRenameCategory(e, cat.id)} className="px-2 py-1">
                    <input
                      type="text"
                      autoFocus
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Escape' && setEditingCatId(null)}
                      className="w-full text-xs px-2 py-1 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded focus:border-black dark:focus:border-white focus:outline-none text-gray-900 dark:text-zinc-100"
                    />
                  </form>
                ) : (
                  <div
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                      selectedFilter === cat.id && !selectedTag
                        ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                        : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                    }`}
                    onClick={() => setSelectedFilter(cat.id)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 flex-shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono group-hover:hidden">
                        {cat._count?.notes ?? 0}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuCatId(activeMenuCatId === cat.id ? null : cat.id);
                        }}
                        className="hidden group-hover:flex p-0.5 text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white rounded"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Category Action Dropdown */}
                {activeMenuCatId === cat.id && (
                  <div className="absolute right-2 top-full mt-0.5 w-32 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded shadow-md py-1 z-30">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCatId(cat.id);
                        setEditCatName(cat.name);
                        setActiveMenuCatId(null);
                      }}
                      className="w-full text-left px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 text-gray-700 dark:text-zinc-300"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Rename</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete category "${cat.name}"? Notes will become uncategorized.`)) {
                          deleteCategory(cat.id);
                        }
                        setActiveMenuCatId(null);
                      }}
                      className="w-full text-left px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Uncategorized Filter */}
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-900">
          <button
            type="button"
            onClick={() => setSelectedFilter('uncategorized')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedFilter === 'uncategorized' && !selectedTag
                ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              <span>Uncategorized</span>
            </div>
          </button>
        </div>

        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="pt-2 border-t border-gray-100 dark:border-zinc-900">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
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
      </div>

      {/* Bottom Actions: New Note, Backup & Shortcuts */}
      <div className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 space-y-2">
        <button
          type="button"
          onClick={() => createNote()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black rounded-md text-xs font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>

        {/* Database Backup Button */}
        <button
          type="button"
          onClick={downloadDatabaseBackup}
          className="w-full text-left px-2 py-1 text-[11px] text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
          title="Download backup copy of local SQLite database"
        >
          <Database className="w-3 h-3 text-gray-400 dark:text-zinc-500" />
          <span>Backup Database</span>
        </button>

        {/* Clear All Notes Option */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Delete all notes? This cannot be undone.')) {
              clearAllNotes();
            }
          }}
          className="w-full text-left px-2 py-1 text-[11px] text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
          title="Delete all notes for a fresh clean notebook"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear All Notes</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-600 pt-1 px-1">
          <span>Shortcuts</span>
          <span className="font-mono">Ctrl+N • Ctrl+M</span>
        </div>
      </div>
    </aside>
  );
};
