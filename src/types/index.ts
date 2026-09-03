export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    notes: number;
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  category?: Category | null;
  isPinned: boolean;
  isArchived: boolean;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

export type SortOption = 'recently_updated' | 'recently_created' | 'alphabetical';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type ViewFilter = 'all' | 'pinned' | 'archived' | string;
