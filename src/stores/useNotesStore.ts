import { create } from 'zustand';
import { Note, Category, SortOption, SaveStatus, ViewFilter, NoteType, LearningStatus, Track } from '../types';
import { TEMPLATES } from '../utils/templates';

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
  selectedTrack: Track | 'all';
  selectedFilter: ViewFilter;
  selectedTag: string | null;
  searchQuery: string;
  sortOption: SortOption;
  saveStatus: SaveStatus;

  // Modals & Navigation
  isCommandPaletteOpen: boolean;
  isQuickCaptureOpen: boolean;
  isSubnetCalculatorOpen: boolean;
  isCommandReferenceOpen: boolean;
  isQuestionsOpen: boolean;
  isTimelineOpen: boolean;
  isBackupOpen: boolean;
  isTrackOverviewOpen: boolean;
  isSidebarCollapsed: boolean;
  isSidecarMode: boolean;
  isDarkMode: boolean;
  saveTimeoutId: any | null;

  // Actions
  fetchNotes: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  setActiveNoteId: (id: string | null) => void;
  setSelectedTrack: (track: Track | 'all') => void;
  createNote: (initialData?: {
    title?: string;
    content?: string;
    type?: NoteType;
    track?: Track;
    categoryId?: string | null;
    tags?: string;
  }) => Promise<Note>;
  createNoteFromTemplate: (templateId: string) => Promise<Note>;
  updateActiveNote: (updates: Partial<Note>) => void;
  saveActiveNote: () => Promise<void>;
  retrySave: () => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  restoreFromTrash: (id: string) => Promise<void>;
  permanentDeleteNote: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  duplicateNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  toggleReviewLater: (id: string) => Promise<void>;
  setLearningStatus: (id: string, status: LearningStatus) => Promise<void>;
  triggerRandomReview: () => Promise<void>;
  createCategory: (name: string, track?: Track) => Promise<Category | null>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  renameTag: (oldName: string, newName: string) => Promise<void>;
  deleteTag: (name: string) => Promise<void>;
  setSelectedFilter: (filter: ViewFilter) => void;
  setSelectedTag: (tag: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortOption: (sort: SortOption) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickCaptureOpen: (open: boolean) => void;
  setSubnetCalculatorOpen: (open: boolean) => void;
  setCommandReferenceOpen: (open: boolean) => void;
  setQuestionsOpen: (open: boolean) => void;
  setTimelineOpen: (open: boolean) => void;
  setBackupOpen: (open: boolean) => void;
  setTrackOverviewOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidecarMode: () => void;
  toggleDarkMode: () => void;
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
  selectedTrack: 'all',
  selectedFilter: 'all',
  selectedTag: null,
  searchQuery: '',
  sortOption: 'recently_updated',
  saveStatus: 'idle',

  isCommandPaletteOpen: false,
  isQuickCaptureOpen: false,
  isSubnetCalculatorOpen: false,
  isCommandReferenceOpen: false,
  isQuestionsOpen: false,
  isTimelineOpen: false,
  isBackupOpen: false,
  isTrackOverviewOpen: false,
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
      const { selectedTrack } = get();
      const url = selectedTrack !== 'all' ? `/api/tags?track=${encodeURIComponent(selectedTrack)}` : '/api/tags';
      const res = await fetch(url);
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
      const { selectedTrack, selectedFilter, selectedTag, searchQuery, sortOption } = get();
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      // Career Track scoping
      if (selectedTrack !== 'all') {
        params.append('track', selectedTrack);
      }

      if (selectedTag) {
        params.append('tag', selectedTag);
      }

      // Filter mapping
      if (selectedFilter === 'trash') {
        params.append('trash', 'true');
      } else if (selectedFilter === 'archived') {
        params.append('archived', 'true');
      } else if (selectedFilter === 'pinned') {
        params.append('pinned', 'true');
        params.append('archived', 'false');
      } else if (selectedFilter === 'review_later') {
        params.append('reviewLater', 'true');
        params.append('archived', 'false');
      } else if (selectedFilter === 'quick_captures') {
        params.append('type', 'quick_capture');
        params.append('archived', 'false');
      } else if (selectedFilter === 'labs') {
        params.append('type', 'lab');
        params.append('archived', 'false');
      } else if (selectedFilter === 'troubleshooting') {
        params.append('type', 'troubleshooting');
        params.append('archived', 'false');
      } else if (selectedFilter === 'coding_concepts') {
        params.append('type', 'coding_concept');
        params.append('archived', 'false');
      } else if (selectedFilter === 'dev_projects') {
        params.append('type', 'dev_project');
        params.append('archived', 'false');
      } else if (selectedFilter === 'workflows') {
        params.append('type', 'automation_workflow');
        params.append('archived', 'false');
      } else if (selectedFilter === 'uncategorized') {
        params.append('category', 'uncategorized');
        params.append('archived', 'false');
      } else if (selectedFilter === 'all') {
        params.append('archived', 'false');
      } else {
        // Specific category ID
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

  setSelectedTrack: (track: Track | 'all') => {
    set({ selectedTrack: track, selectedFilter: 'all', selectedTag: null });
    get().fetchTags();
    get().fetchNotes();
  },

  createNote: async (initialData) => {
    const { selectedTrack, selectedFilter, selectedTag, categories, fetchCategories, fetchTags } = get();
    let categoryId = initialData?.categoryId || null;

    // Infer track: priority initialData -> selectedTrack -> category's track -> default
    let noteTrack: Track = initialData?.track || (selectedTrack !== 'all' ? selectedTrack : 'IT & Networking');

    // Preserve current category filter if viewing a custom category
    if (
      !categoryId &&
      selectedFilter !== 'all' &&
      selectedFilter !== 'pinned' &&
      selectedFilter !== 'archived' &&
      selectedFilter !== 'review_later' &&
      selectedFilter !== 'quick_captures' &&
      selectedFilter !== 'labs' &&
      selectedFilter !== 'troubleshooting' &&
      selectedFilter !== 'coding_concepts' &&
      selectedFilter !== 'dev_projects' &&
      selectedFilter !== 'workflows' &&
      selectedFilter !== 'trash' &&
      selectedFilter !== 'uncategorized'
    ) {
      const catExists = categories.find((c) => c.id === selectedFilter);
      if (catExists) {
        categoryId = selectedFilter;
        noteTrack = catExists.track;
      }
    }

    let defaultType: NoteType = initialData?.type || 'general';
    if (!initialData?.type) {
      if (selectedFilter === 'labs') defaultType = 'lab';
      else if (selectedFilter === 'troubleshooting') defaultType = 'troubleshooting';
      else if (selectedFilter === 'quick_captures') defaultType = 'quick_capture';
      else if (selectedFilter === 'coding_concepts') defaultType = 'coding_concept';
      else if (selectedFilter === 'dev_projects') defaultType = 'dev_project';
      else if (selectedFilter === 'workflows') defaultType = 'automation_workflow';
    }

    const defaultTags = initialData?.tags || (selectedTag ? selectedTag : '');

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: initialData?.title || 'Untitled Note',
          content: initialData?.content || '',
          type: defaultType,
          track: noteTrack,
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

  createNoteFromTemplate: async (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    const initialTitle = template ? `${template.name}` : 'Untitled Note';
    const initialContent = template ? template.content.trim() : '';
    const initialType = template ? template.defaultType : 'general';
    const initialTrack = template ? template.track : 'IT & Networking';

    return get().createNote({
      title: initialTitle,
      content: initialContent,
      type: initialType,
      track: initialTrack,
    });
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
          type: updated.type,
          track: updated.track,
          categoryId: updated.categoryId,
          tags: updated.tags,
          learningStatus: updated.learningStatus,
          isReviewLater: updated.isReviewLater,
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
          type: activeNote.type,
          track: activeNote.track,
          categoryId: activeNote.categoryId,
          isPinned: activeNote.isPinned,
          isArchived: activeNote.isArchived,
          isReviewLater: activeNote.isReviewLater,
          learningStatus: activeNote.learningStatus,
          isDeleted: activeNote.isDeleted,
          tags: activeNote.tags || '',
          relatedNoteIds: activeNote.relatedNoteIds || '',
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

  moveToTrash: async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}/trash`, { method: 'PUT' });
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
      console.error('Move to trash error:', err);
    }
  },

  restoreFromTrash: async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}/restore`, { method: 'PUT' });
      if (res.ok) {
        await get().fetchNotes();
        get().fetchCategories();
        get().fetchTags();
      }
    } catch (err) {
      console.error('Restore note error:', err);
    }
  },

  permanentDeleteNote: async (id: string) => {
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
      console.error('Permanent delete note error:', err);
    }
  },

  emptyTrash: async () => {
    try {
      const res = await fetch('/api/notes/trash/empty', { method: 'POST' });
      if (res.ok) {
        set({ notes: [], activeNoteId: null, activeNote: null });
        get().fetchCategories();
        get().fetchTags();
      }
    } catch (err) {
      console.error('Empty trash error:', err);
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

  toggleReviewLater: async (id: string) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const nextVal = !note.isReviewLater;

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReviewLater: nextVal }),
      });
      if (res.ok) {
        const updated: Note = await res.json();
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? updated : n)),
          activeNote: state.activeNoteId === id ? updated : state.activeNote,
        }));
      }
    } catch (err) {
      console.error('Toggle review later error:', err);
    }
  },

  setLearningStatus: async (id: string, status: LearningStatus) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learningStatus: status }),
      });
      if (res.ok) {
        const updated: Note = await res.json();
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? updated : n)),
          activeNote: state.activeNoteId === id ? updated : state.activeNote,
        }));
      }
    } catch (err) {
      console.error('Set learning status error:', err);
    }
  },

  triggerRandomReview: async () => {
    try {
      const { selectedTrack } = get();
      const url = selectedTrack !== 'all' ? `/api/notes/random-review?track=${encodeURIComponent(selectedTrack)}` : '/api/notes/random-review';
      const res = await fetch(url);
      if (res.ok) {
        const note: Note = await res.json();
        set({
          activeNoteId: note.id,
          activeNote: note,
          selectedFilter: 'all',
          selectedTag: null,
        });
        await get().fetchNotes();
      }
    } catch (err) {
      console.error('Random review error:', err);
    }
  },

  createCategory: async (name: string, track?: Track) => {
    if (!name.trim()) return null;
    const { selectedTrack } = get();
    const categoryTrack = track || (selectedTrack !== 'all' ? selectedTrack : 'IT & Networking');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), track: categoryTrack }),
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

  renameTag: async (oldName: string, newName: string) => {
    try {
      const res = await fetch(`/api/tags/${encodeURIComponent(oldName)}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });
      if (res.ok) {
        await get().fetchTags();
        await get().fetchNotes();
      }
    } catch (err) {
      console.error('Rename tag error:', err);
    }
  },

  deleteTag: async (name: string) => {
    try {
      const res = await fetch(`/api/tags/${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (res.ok) {
        if (get().selectedTag === name) {
          set({ selectedTag: null });
        }
        await get().fetchTags();
        await get().fetchNotes();
      }
    } catch (err) {
      console.error('Delete tag error:', err);
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

  setQuickCaptureOpen: (open: boolean) => {
    set({ isQuickCaptureOpen: open });
  },

  setSubnetCalculatorOpen: (open: boolean) => {
    set({ isSubnetCalculatorOpen: open });
  },

  setCommandReferenceOpen: (open: boolean) => {
    set({ isCommandReferenceOpen: open });
  },

  setQuestionsOpen: (open: boolean) => {
    set({ isQuestionsOpen: open });
  },

  setTimelineOpen: (open: boolean) => {
    set({ isTimelineOpen: open });
  },

  setBackupOpen: (open: boolean) => {
    set({ isBackupOpen: open });
  },

  setTrackOverviewOpen: (open: boolean) => {
    set({ isTrackOverviewOpen: open });
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
