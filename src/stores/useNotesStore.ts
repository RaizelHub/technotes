import { create } from 'zustand';
import { Note, Category, SortOption, SaveStatus, ViewFilter } from '../types';

export interface TagCount {
  name: string;
  count: number;
}

interface NotesState {
  notes: Note[];
  categories: Category[];
  tags: TagCount[];
  activeNoteId: string | null;
  activeNote: Note | null;
  selectedFilter: ViewFilter;
  selectedTag: string | null;
  searchQuery: string;
  sortOption: SortOption;
  saveStatus: SaveStatus;
  isCommandPaletteOpen: boolean;
  isQuickNoteOpen: boolean;
  isSubnetCalculatorOpen: boolean;
  isSidebarCollapsed: boolean;
  isSidecarMode: boolean;
  isDarkMode: boolean;
  saveTimeoutId: any | null;

  // Actions
  fetchNotes: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  setActiveNoteId: (id: string | null) => void;
  createNote: (initialData?: { title?: string; content?: string; categoryId?: string | null; tags?: string }) => Promise<Note>;
  updateActiveNote: (updates: Partial<Note>) => void;
  saveActiveNote: () => Promise<void>;
  retrySave: () => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  duplicateNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  createCategory: (name: string) => Promise<Category | null>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setSelectedFilter: (filter: ViewFilter) => void;
  setSelectedTag: (tag: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortOption: (sort: SortOption) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickNoteOpen: (open: boolean) => void;
  setSubnetCalculatorOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidecarMode: () => void;
  toggleDarkMode: () => void;
  resetSampleData: () => Promise<void>;
  clearAllNotes: () => Promise<void>;
}

const LOCAL_STORAGE_BACKUP_KEY = 'technotes_backup_buffer';
const DARK_MODE_STORAGE_KEY = 'technotes_theme_dark';

const initialDarkMode = (() => {
  try {
    return localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
})();

// Set HTML class on load
if (initialDarkMode) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  categories: [],
  tags: [],
  activeNoteId: null,
  activeNote: null,
  selectedFilter: 'all',
  selectedTag: null,
  searchQuery: '',
  sortOption: 'recently_updated',
  saveStatus: 'idle',
  isCommandPaletteOpen: false,
  isQuickNoteOpen: false,
  isSubnetCalculatorOpen: false,
  isSidebarCollapsed: false,
  isSidecarMode: false,
  isDarkMode: initialDarkMode,
  saveTimeoutId: null,

  fetchCategories: async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const categories: Category[] = await res.json();
        set({ categories });
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  },

  fetchTags: async () => {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const tags: TagCount[] = await res.json();
        set({ tags });
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  },

  fetchNotes: async () => {
    try {
      const { selectedFilter, selectedTag, searchQuery, sortOption } = get();
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (selectedTag) {
        params.append('tag', selectedTag);
      }

      if (selectedFilter === 'pinned') {
        params.append('pinned', 'true');
        params.append('archived', 'false');
      } else if (selectedFilter === 'archived') {
        params.append('archived', 'true');
      } else if (selectedFilter === 'all') {
        params.append('archived', 'false');
      } else if (selectedFilter === 'uncategorized') {
        params.append('category', 'uncategorized');
        params.append('archived', 'false');
      } else {
        params.append('category', selectedFilter);
        params.append('archived', 'false');
      }

      params.append('sort', sortOption);

      const res = await fetch(`/api/notes?${params.toString()}`);
      if (res.ok) {
        const notes: Note[] = await res.json();
        const currentActiveId = get().activeNoteId;

        let updatedActiveNote = notes.find((n) => n.id === currentActiveId) || null;
        if (!updatedActiveNote && notes.length > 0 && !currentActiveId) {
          updatedActiveNote = notes[0];
        }

        set({
          notes,
          activeNoteId: updatedActiveNote ? updatedActiveNote.id : null,
          activeNote: updatedActiveNote,
        });
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  },

  setActiveNoteId: (id: string | null) => {
    const { saveTimeoutId, saveActiveNote, notes } = get();
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
      saveActiveNote();
    }

    const note = notes.find((n) => n.id === id) || null;
    set({
      activeNoteId: id,
      activeNote: note,
      saveStatus: 'idle',
      saveTimeoutId: null,
    });
  },

  createNote: async (initialData) => {
    const { selectedFilter, selectedTag, categories, fetchCategories, fetchTags } = get();
    let categoryId = initialData?.categoryId || null;

    if (!categoryId && selectedFilter !== 'all' && selectedFilter !== 'pinned' && selectedFilter !== 'archived' && selectedFilter !== 'uncategorized') {
      const catExists = categories.some((c) => c.id === selectedFilter);
      if (catExists) {
        categoryId = selectedFilter;
      }
    }

    const defaultTags = initialData?.tags || (selectedTag ? selectedTag : '');

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: initialData?.title || 'Untitled Note',
          content: initialData?.content || '',
          categoryId,
          tags: defaultTags,
        }),
      });

      if (res.ok) {
        const newNote: Note = await res.json();
        set((state) => ({
          notes: [newNote, ...state.notes],
          activeNoteId: newNote.id,
          activeNote: newNote,
          saveStatus: 'saved',
        }));
        fetchCategories();
        fetchTags();
        return newNote;
      }
      throw new Error('Failed to create note');
    } catch (err) {
      console.error('Create note error:', err);
      throw err;
    }
  },

  updateActiveNote: (updates: Partial<Note>) => {
    const { activeNote, activeNoteId, saveTimeoutId } = get();
    if (!activeNote || !activeNoteId) return;

    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }

    const updated = {
      ...activeNote,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        LOCAL_STORAGE_BACKUP_KEY,
        JSON.stringify({
          id: activeNoteId,
          title: updated.title,
          content: updated.content,
          categoryId: updated.categoryId,
          tags: updated.tags,
        })
      );
    } catch (_) {}

    set((state) => ({
      activeNote: updated,
      notes: state.notes.map((n) => (n.id === activeNoteId ? updated : n)),
      saveStatus: 'saving',
      saveTimeoutId: setTimeout(() => {
        get().saveActiveNote();
      }, 600),
    }));
  },

  saveActiveNote: async () => {
    const { activeNote, activeNoteId, fetchCategories, fetchTags } = get();
    if (!activeNote || !activeNoteId) return;

    set({ saveStatus: 'saving', saveTimeoutId: null });

    try {
      const res = await fetch(`/api/notes/${activeNoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeNote.title,
          content: activeNote.content,
          categoryId: activeNote.categoryId,
          isPinned: activeNote.isPinned,
          isArchived: activeNote.isArchived,
          tags: activeNote.tags || '',
        }),
      });

      if (res.ok) {
        const savedNote: Note = await res.json();
        set((state) => ({
          saveStatus: 'saved',
          activeNote: savedNote,
          notes: state.notes.map((n) => (n.id === savedNote.id ? savedNote : n)),
        }));
        try {
          localStorage.removeItem(LOCAL_STORAGE_BACKUP_KEY);
        } catch (_) {}
        fetchCategories();
        fetchTags();
      } else {
        set({ saveStatus: 'error' });
      }
    } catch (err) {
      console.error('Failed to auto-save note:', err);
      set({ saveStatus: 'error' });
    }
  },

  retrySave: async () => {
    await get().saveActiveNote();
  },

  deleteNote: async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const remaining = get().notes.filter((n) => n.id !== id);
        const currentActiveId = get().activeNoteId;
        const nextActive = currentActiveId === id ? remaining[0] || null : get().activeNote;

        set({
          notes: remaining,
          activeNoteId: nextActive ? nextActive.id : null,
          activeNote: nextActive,
        });
        get().fetchCategories();
        get().fetchTags();
      }
    } catch (err) {
      console.error('Delete note error:', err);
    }
  },

  duplicateNote: async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const dup: Note = await res.json();
        set((state) => ({
          notes: [dup, ...state.notes],
          activeNoteId: dup.id,
          activeNote: dup,
        }));
        get().fetchCategories();
        get().fetchTags();
      }
    } catch (err) {
      console.error('Duplicate note error:', err);
    }
  },

  togglePin: async (id: string) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const newPinned = !note.isPinned;

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newPinned }),
      });
      if (res.ok) {
        const updated: Note = await res.json();
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? updated : n)),
          activeNote: state.activeNoteId === id ? updated : state.activeNote,
        }));
      }
    } catch (err) {
      console.error('Toggle pin error:', err);
    }
  },

  toggleArchive: async (id: string) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const newArchived = !note.isArchived;

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: newArchived }),
      });
      if (res.ok) {
        await get().fetchNotes();
        await get().fetchCategories();
        await get().fetchTags();
      }
    } catch (err) {
      console.error('Toggle archive error:', err);
    }
  },

  createCategory: async (name: string) => {
    if (!name.trim()) return null;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const category: Category = await res.json();
        set((state) => ({
          categories: [...state.categories, category].sort((a, b) => a.name.localeCompare(b.name)),
        }));
        return category;
      }
      return null;
    } catch (err) {
      console.error('Create category error:', err);
      return null;
    }
  },

  renameCategory: async (id: string, name: string) => {
    if (!name.trim()) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const updated: Category = await res.json();
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? updated : c)),
        }));
        get().fetchNotes();
      }
    } catch (err) {
      console.error('Rename category error:', err);
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          selectedFilter: state.selectedFilter === id ? 'all' : state.selectedFilter,
        }));
        get().fetchNotes();
      }
    } catch (err) {
      console.error('Delete category error:', err);
    }
  },

  setSelectedFilter: (filter: ViewFilter) => {
    set({ selectedFilter: filter, selectedTag: null });
    get().fetchNotes();
  },

  setSelectedTag: (tag: string | null) => {
    set({ selectedTag: tag });
    get().fetchNotes();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().fetchNotes();
  },

  setSortOption: (sort: SortOption) => {
    set({ sortOption: sort });
    get().fetchNotes();
  },

  setCommandPaletteOpen: (open: boolean) => {
    set({ isCommandPaletteOpen: open });
  },

  setQuickNoteOpen: (open: boolean) => {
    set({ isQuickNoteOpen: open });
  },

  setSubnetCalculatorOpen: (open: boolean) => {
    set({ isSubnetCalculatorOpen: open });
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
  },

  toggleSidecarMode: () => {
    set((state) => ({ isSidecarMode: !state.isSidecarMode }));
  },

  toggleDarkMode: () => {
    const nextDark = !get().isDarkMode;
    set({ isDarkMode: nextDark });
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(nextDark));
    } catch {}
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  resetSampleData: async () => {
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      if (res.ok) {
        await get().fetchCategories();
        await get().fetchTags();
        await get().fetchNotes();
      }
    } catch (err) {
      console.error('Reset sample data error:', err);
    }
  },

  clearAllNotes: async () => {
    try {
      const res = await fetch('/api/notes/clear', { method: 'POST' });
      if (res.ok) {
        set({ notes: [], activeNoteId: null, activeNote: null, tags: [] });
        await get().fetchCategories();
      }
    } catch (err) {
      console.error('Clear all notes error:', err);
    }
  },
}));
