export type Track = 'IT & Networking' | 'Software Development' | 'AI & Automation';

export const ALL_TRACKS: Track[] = [
  'IT & Networking',
  'Software Development',
  'AI & Automation',
];

export type NoteType =
  | 'general'
  | 'lab'
  | 'troubleshooting'
  | 'quick_capture'
  | 'coding_concept'
  | 'dev_project'
  | 'api_integration'
  | 'automation_workflow'
  | 'ai_concept';

export type LearningStatus = 'none' | 'dont_understand' | 'reviewing' | 'learned';

export type CommandCategory =
  | 'Cisco'
  | 'Windows'
  | 'PowerShell'
  | 'Networking'
  | 'Linux'
  | 'Git'
  | 'npm'
  | 'Node.js'
  | 'Laravel'
  | 'Docker'
  | 'SQL'
  | 'JavaScript'
  | 'TypeScript'
  | 'n8n'
  | 'curl'
  | 'Webhooks'
  | 'JSON'
  | 'AI_API'
  | string;

export interface Category {
  id: string;
  name: string;
  track: Track;
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
  type: NoteType;
  track: Track;
  categoryId: string | null;
  category?: Category | null;
  isPinned: boolean;
  isArchived: boolean;
  isReviewLater: boolean;
  learningStatus: LearningStatus;
  isDeleted: boolean;
  deletedAt?: string | null;
  tags?: string;
  relatedNoteIds?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionItem {
  id: string;
  content: string;
  isLearned: boolean;
  noteId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommandItem {
  id: string;
  command: string;
  track?: Track;
  category: CommandCategory;
  purpose: string;
  example: string;
  myNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentItem {
  id: string;
  noteId?: string | null;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface TrackSummary {
  track: Track;
  noteCount: number;
  categoryCount: number;
  recentNoteTitle?: string;
}

export type SortOption = 'recently_updated' | 'recently_created' | 'alphabetical';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type ViewFilter =
  | 'all'
  | 'pinned'
  | 'archived'
  | 'review_later'
  | 'quick_captures'
  | 'labs'
  | 'troubleshooting'
  | 'coding_concepts'
  | 'dev_projects'
  | 'workflows'
  | 'trash'
  | 'uncategorized'
  | string;
