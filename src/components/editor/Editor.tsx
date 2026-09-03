import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { CustomCodeBlock } from './CiscoCodeBlock';
import { RelatedNotes } from './RelatedNotes';
import { useNotesStore } from '../../stores/useNotesStore';
import { formatRelativeTime } from '../../utils/date';
import { TEMPLATES } from '../../utils/templates';
import { CISCO_SNIPPETS } from '../../utils/snippets';
import { downloadMarkdown, printCleanDocument } from '../../utils/export';
import { SubnetCalculatorModal } from '../modals/SubnetCalculatorModal';
import { NoteType, LearningStatus, Track, ALL_TRACKS } from '../../types';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Terminal,
  Minus,
  FileText,
  Pin,
  Archive,
  Trash2,
  Copy,
  ChevronDown,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
  Printer,
  Calculator,
  Tag,
  X,
  Code2,
  Image as ImageIcon,
  Bookmark,
  GraduationCap,
  FlaskConical,
  Wrench,
  Zap,
  Network,
  Bot,
  Plus,
  Layers,
} from 'lucide-react';

export const Editor: React.FC = () => {
  const {
    activeNote,
    categories,
    saveStatus,
    isSidecarMode,
    isSubnetCalculatorOpen,
    setSubnetCalculatorOpen,
    updateActiveNote,
    retrySave,
    togglePin,
    toggleArchive,
    toggleReviewLater,
    setLearningStatus,
    duplicateNote,
    moveToTrash,
    createNote,
    createCategory,
  } = useNotesStore();

  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isSnippetMenuOpen, setIsSnippetMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isTrackMenuOpen, setIsTrackMenuOpen] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Quick inline category add in editor
  const [isQuickAddingCat, setIsQuickAddingCat] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');

  const templateMenuRef = useRef<HTMLDivElement>(null);
  const snippetMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const trackMenuRef = useRef<HTMLDivElement>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Upload image helper (stores locally and persists)
  const uploadAndInsertImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (readerEvent) => {
      const base64 = readerEvent.target?.result as string;
      if (!base64 || !editor) return;

      try {
        const res = await fetch('/api/attachments/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: base64,
            filename: file.name,
            noteId: activeNote?.id,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          editor.chain().focus().setImage({ src: data.url }).run();
        } else {
          editor.chain().focus().setImage({ src: base64 }).run();
        }
      } catch (err) {
        editor.chain().focus().setImage({ src: base64 }).run();
      }
    };
    reader.readAsDataURL(file);
  };

  // TipTap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CustomCodeBlock,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder:
          'Start writing notes, code, commands, paste a screenshot (Ctrl+V), or insert a template...',
      }),
    ],
    content: activeNote?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateActiveNote({ content: html });
    },
    editorProps: {
      attributes: {
        class:
          'focus:outline-none min-h-[400px] leading-relaxed font-sans selection:bg-gray-200 dark:selection:bg-zinc-700 selection:text-black dark:selection:text-white',
      },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            const file = item.getAsFile();
            if (file) {
              uploadAndInsertImage(file);
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFile = files.find((f) => f.type.indexOf('image') === 0);
        if (imageFile) {
          uploadAndInsertImage(imageFile);
          return true;
        }
        return false;
      },
    },
  });

  // Keep editor content in sync when active note switches
  useEffect(() => {
    if (editor && activeNote) {
      const currentHTML = editor.getHTML();
      if (activeNote.content !== currentHTML) {
        editor.commands.setContent(activeNote.content || '', false);
      }
    }
  }, [activeNote?.id, editor]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) {
        setIsTemplateMenuOpen(false);
      }
      if (snippetMenuRef.current && !snippetMenuRef.current.contains(e.target as Node)) {
        setIsSnippetMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
      if (trackMenuRef.current && !trackMenuRef.current.contains(e.target as Node)) {
        setIsTrackMenuOpen(false);
      }
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target as Node)) {
        setIsTypeMenuOpen(false);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-center px-4 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-200 select-none">
        <div className="max-w-sm">
          <h2 className="text-xl font-semibold mb-2">No note selected</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
            Select a technical note from the list, or create a new one to begin writing.
          </p>
          <button
            type="button"
            onClick={() => createNote()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white dark:bg-zinc-100 dark:text-black rounded-md text-sm font-medium hover:bg-black dark:hover:bg-white transition-colors"
          >
            + New Note
          </button>
        </div>
      </div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateActiveNote({ title: e.target.value });
  };

  const handleInsertTemplate = (templateContent: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(templateContent).run();
    setIsTemplateMenuOpen(false);
  };

  const handleInsertSnippet = (snippetCommands: string) => {
    if (!editor) return;
    const snippetHtml = `<pre><code>${snippetCommands}</code></pre>`;
    editor.chain().focus().insertContent(snippetHtml).run();
    setIsSnippetMenuOpen(false);
  };

  const handleSetTrack = (track: Track) => {
    updateActiveNote({ track });
    setIsTrackMenuOpen(false);
  };

  const handleSetCategory = (categoryId: string | null) => {
    updateActiveNote({ categoryId });
    setIsCategoryMenuOpen(false);
  };

  const handleSetNoteType = (type: NoteType) => {
    updateActiveNote({ type });
    setIsTypeMenuOpen(false);
  };

  const handleLearningStatusChange = (status: LearningStatus) => {
    setLearningStatus(activeNote.id, status);
    setIsStatusMenuOpen(false);
  };

  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatName.trim()) return;
    const newCat = await createCategory(quickCatName.trim(), activeNote.track);
    if (newCat) {
      updateActiveNote({ categoryId: newCat.id });
      setQuickCatName('');
      setIsQuickAddingCat(false);
      setIsCategoryMenuOpen(false);
    }
  };

  // Tag management
  const currentTags = activeNote.tags
    ? activeNote.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim().toLowerCase().replace(/^#/, '');
    if (clean && !currentTags.includes(clean)) {
      const updatedTags = [...currentTags, clean].join(',');
      updateActiveNote({ tags: updatedTags });
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = currentTags.filter((t) => t !== tagToRemove).join(',');
    updateActiveNote({ tags: updatedTags });
  };

  // Scoped categories for active note's Track
  const relevantCategories = categories.filter((c) => c.track === activeNote.track);
  const currentCategory = categories.find((c) => c.id === activeNote.categoryId);

  const renderStatusBadge = () => {
    switch (activeNote.learningStatus) {
      case 'dont_understand':
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Don't Understand</span>
          </span>
        );
      case 'reviewing':
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Reviewing</span>
          </span>
        );
      case 'learned':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Learned</span>
          </span>
        );
      default:
        return <span className="text-gray-400 dark:text-zinc-500">Status: Set</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 overflow-hidden">
      {/* Top Header / Metadata Bar */}
      <div
        className={`flex-shrink-0 border-b border-gray-200 dark:border-zinc-800 ${
          isSidecarMode ? 'px-4 pt-3 pb-2' : 'px-8 pt-5 pb-3'
        } no-print`}
      >
        {/* Title input */}
        <input
          type="text"
          value={activeNote.title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className={`w-full font-semibold tracking-tight text-gray-900 dark:text-zinc-50 bg-transparent border-none outline-none focus:ring-0 p-0 mb-2.5 placeholder:text-gray-400 dark:placeholder:text-zinc-600 ${
            isSidecarMode ? 'text-xl' : 'text-2xl md:text-3xl'
          }`}
        />

        {/* Metadata row: Track, Category, Note Type, Learning Status, Review Later, Tags, Timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs text-gray-500 dark:text-zinc-400">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Track Selector Pill (Requirement 6) */}
            <div className="relative" ref={trackMenuRef}>
              <button
                type="button"
                onClick={() => setIsTrackMenuOpen(!isTrackMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200 font-semibold text-xs transition-colors border border-gray-200/80 dark:border-zinc-700/80"
                title="Career Track"
              >
                {activeNote.track === 'IT & Networking' && (
                  <Network className="w-3.5 h-3.5 text-blue-600" />
                )}
                {activeNote.track === 'Software Development' && (
                  <Code className="w-3.5 h-3.5 text-emerald-600" />
                )}
                {activeNote.track === 'AI & Automation' && (
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                )}
                <span>{activeNote.track}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              {isTrackMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg py-1 z-30">
                  <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Select Track
                  </div>
                  {ALL_TRACKS.map((track) => (
                    <button
                      key={track}
                      type="button"
                      onClick={() => handleSetTrack(track)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-between ${
                        activeNote.track === track
                          ? 'font-semibold text-black dark:text-white bg-gray-50 dark:bg-zinc-800'
                          : 'text-gray-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {track === 'IT & Networking' && <Network className="w-3.5 h-3.5 text-blue-600" />}
                        {track === 'Software Development' && <Code className="w-3.5 h-3.5 text-emerald-600" />}
                        {track === 'AI & Automation' && <Bot className="w-3.5 h-3.5 text-purple-600" />}
                        <span>{track}</span>
                      </span>
                      {activeNote.track === track && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Track-Scoped Category Selector Pill (Requirement 6) */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                type="button"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium transition-colors border border-gray-200/80 dark:border-zinc-700/80"
                title="Category"
              >
                <span>{currentCategory ? currentCategory.name : 'Uncategorized'}</span>
                <ChevronDown className="w-3 h-3 text-gray-500 dark:text-zinc-400" />
              </button>

              {isCategoryMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg py-1 z-30 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {activeNote.track} Categories
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSetCategory(null)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-between ${
                      !activeNote.categoryId
                        ? 'font-semibold text-black dark:text-white bg-gray-50 dark:bg-zinc-800'
                        : 'text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    <span>Uncategorized</span>
                    {!activeNote.categoryId && <Check className="w-3.5 h-3.5 text-black dark:text-white" />}
                  </button>
                  <div className="border-t border-gray-100 dark:border-zinc-800 my-1" />

                  {relevantCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSetCategory(cat.id)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-between ${
                        activeNote.categoryId === cat.id
                          ? 'font-semibold text-black dark:text-white bg-gray-50 dark:bg-zinc-800'
                          : 'text-gray-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {activeNote.categoryId === cat.id && (
                        <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                      )}
                    </button>
                  ))}

                  {/* Inline quick add category */}
                  <div className="border-t border-gray-100 dark:border-zinc-800 p-2 mt-1">
                    {isQuickAddingCat ? (
                      <form onSubmit={handleQuickAddCategory} className="flex gap-1">
                        <input
                          type="text"
                          autoFocus
                          value={quickCatName}
                          onChange={(e) => setQuickCatName(e.target.value)}
                          placeholder="New category..."
                          className="w-full text-xs px-2 py-1 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded focus:border-black dark:focus:border-white focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 bg-black text-white dark:bg-white dark:text-black rounded text-[10px]"
                        >
                          Add
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsQuickAddingCat(true)}
                        className="w-full text-left text-xs text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Category</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Note Type Pill */}
            <div className="relative" ref={typeMenuRef}>
              <button
                type="button"
                onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-mono text-[11px] uppercase transition-colors border border-gray-200/80 dark:border-zinc-700/80"
                title="Change note type"
              >
                {activeNote.type === 'lab' && <FlaskConical className="w-3 h-3 text-purple-600" />}
                {activeNote.type === 'troubleshooting' && <Wrench className="w-3 h-3 text-orange-600" />}
                {activeNote.type === 'quick_capture' && <Zap className="w-3 h-3 text-amber-500" />}
                {activeNote.type === 'coding_concept' && <Code className="w-3 h-3 text-emerald-600" />}
                {activeNote.type === 'dev_project' && <Layers className="w-3 h-3 text-blue-600" />}
                {activeNote.type === 'automation_workflow' && <Bot className="w-3 h-3 text-purple-600" />}
                <span>{activeNote.type.replace('_', ' ')}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              {isTypeMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg py-1 z-30">
                  {(
                    [
                      'general',
                      'lab',
                      'troubleshooting',
                      'quick_capture',
                      'coding_concept',
                      'dev_project',
                      'api_integration',
                      'automation_workflow',
                      'ai_concept',
                    ] as NoteType[]
                  ).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleSetNoteType(t)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 capitalize flex items-center justify-between ${
                        activeNote.type === t
                          ? 'font-semibold text-black dark:text-white bg-gray-50 dark:bg-zinc-800'
                          : 'text-gray-700 dark:text-zinc-300'
                      }`}
                    >
                      <span>{t.replace('_', ' ')}</span>
                      {activeNote.type === t && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Learning Status Dropdown */}
            <div className="relative" ref={statusMenuRef}>
              <button
                type="button"
                onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 dark:bg-zinc-900/60 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs border border-gray-200/80 dark:border-zinc-800 transition-colors"
                title="Set learning comprehension status"
              >
                <GraduationCap className="w-3 h-3 text-gray-400" />
                {renderStatusBadge()}
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              {isStatusMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg py-1 z-30">
                  <button
                    type="button"
                    onClick={() => handleLearningStatusChange('none')}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500"
                  >
                    No Status
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLearningStatusChange('dont_understand')}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 text-amber-700 dark:text-amber-400 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Don't Understand</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLearningStatusChange('reviewing')}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 text-blue-700 dark:text-blue-400 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Reviewing</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLearningStatusChange('learned')}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 text-emerald-700 dark:text-emerald-400 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Learned</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Review Later Toggle */}
            <button
              type="button"
              onClick={() => toggleReviewLater(activeNote.id)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors border ${
                activeNote.isReviewLater
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold border-black dark:border-white'
                  : 'bg-gray-50 dark:bg-zinc-900/60 text-gray-500 hover:text-black dark:hover:text-white border-gray-200 dark:border-zinc-800'
              }`}
              title="Bookmark for later review"
            >
              <Bookmark className={`w-3 h-3 ${activeNote.isReviewLater ? 'fill-current' : ''}`} />
              <span>Review Later</span>
            </button>

            {/* 6. Tags list */}
            {currentTags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 font-mono border border-gray-200 dark:border-zinc-800"
              >
                <span>#{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-red-500 p-0.2 rounded"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            {isAddingTag ? (
              <form onSubmit={handleAddTag} className="inline-flex items-center">
                <input
                  type="text"
                  autoFocus
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onBlur={() => setIsAddingTag(false)}
                  placeholder="tag..."
                  className="w-20 text-[11px] font-mono px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-black dark:border-white rounded outline-none"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-black dark:hover:text-white px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-900"
                title="Add tag"
              >
                <Tag className="w-3 h-3" />
                <span>+tag</span>
              </button>
            )}

            <span className="text-gray-300 dark:text-zinc-700">|</span>
            <span className="text-gray-400 dark:text-zinc-500">
              {formatRelativeTime(activeNote.updatedAt)}
            </span>
          </div>

          {/* Right actions: Save Status, Export, Print, Pin, Duplicate, Archive, Delete */}
          <div className="flex items-center gap-1.5">
            <div className="mr-1">
              {saveStatus === 'saving' && (
                <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium flex items-center gap-1 font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs text-gray-600 dark:text-zinc-400 font-medium flex items-center gap-1 font-mono">
                  <Check className="w-3.5 h-3.5 text-gray-700 dark:text-zinc-300 stroke-[2.5]" />
                  Saved ✓
                </span>
              )}
              {saveStatus === 'error' && (
                <button
                  type="button"
                  onClick={retrySave}
                  className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1 hover:underline"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  Retry Save
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => downloadMarkdown(activeNote)}
              className="p-1.5 rounded text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
              title="Export Note to Markdown (.md)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={printCleanDocument}
              className="p-1.5 rounded text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
              title="Print Note / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => togglePin(activeNote.id)}
              className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors ${
                activeNote.isPinned
                  ? 'text-black dark:text-white bg-gray-100 dark:bg-zinc-800'
                  : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
              }`}
              title={activeNote.isPinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => duplicateNote(activeNote.id)}
              className="p-1.5 rounded text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
              title="Duplicate note"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => toggleArchive(activeNote.id)}
              className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors ${
                activeNote.isArchived
                  ? 'text-black dark:text-white bg-gray-100 dark:bg-zinc-800'
                  : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
              }`}
              title={activeNote.isArchived ? 'Unarchive note' : 'Archive note'}
            >
              <Archive className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Move this note to Trash?')) {
                  moveToTrash(activeNote.id);
                }
              }}
              className="p-1.5 rounded text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
              title="Move to Trash"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div
        className={`flex-shrink-0 border-b border-gray-100 dark:border-zinc-800/80 ${
          isSidecarMode ? 'px-4' : 'px-8'
        } py-1.5 flex flex-wrap items-center gap-1 text-gray-600 dark:text-zinc-400 bg-white dark:bg-zinc-950 select-none no-print`}
      >
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('heading', { level: 1 })
              ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white font-bold'
              : ''
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('heading', { level: 2 })
              ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white font-bold'
              : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('heading', { level: 3 })
              ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white font-bold'
              : ''
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-gray-200 dark:bg-zinc-800 mx-1" />

        {/* Text Styling */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('bold')
              ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white font-bold'
              : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('italic')
              ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white italic'
              : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('underline')
              ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white underline'
              : ''
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-gray-200 dark:bg-zinc-800 mx-1" />

        {/* Lists & Tasks */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('orderedList') ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('taskList') ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white' : ''
          }`}
          title="Checklist / Review Tasks"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-gray-200 dark:bg-zinc-800 mx-1" />

        {/* Code & Terminal */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('code') ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white' : ''
          }`}
          title="Inline Code"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 ${
            editor?.isActive('codeBlock')
              ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white font-medium'
              : ''
          }`}
          title="Code Block (Cisco/Bash/JS/SQL)"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">Code</span>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('blockquote') ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white' : ''
          }`}
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          title="Divider Line"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Screenshot / Image Attachment Button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors flex items-center gap-1"
          title="Attach Screenshot / Image"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="text-[11px]">Image</span>
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadAndInsertImage(file);
          }}
        />

        {/* Subnet Calculator Button */}
        <button
          type="button"
          onClick={() => setSubnetCalculatorOpen(true)}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors flex items-center gap-1"
          title="CIDR Subnet Calculator (Ctrl+Shift+C)"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">Subnet</span>
        </button>

        <div className="w-px h-3.5 bg-gray-200 dark:bg-zinc-800 mx-1" />

        {/* Cisco Snippets Dropdown */}
        <div className="relative ml-auto" ref={snippetMenuRef}>
          <button
            type="button"
            onClick={() => setIsSnippetMenuOpen(!isSnippetMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded border border-gray-200 dark:border-zinc-800 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-gray-500" />
            <span>Cisco Snippets</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {isSnippetMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg py-1.5 z-30 max-h-80 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Insert Cisco Configuration
              </div>
              {CISCO_SNIPPETS.map((snip) => (
                <button
                  key={snip.id}
                  type="button"
                  onClick={() => handleInsertSnippet(snip.commands)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="font-medium text-xs text-gray-900 dark:text-zinc-100">{snip.name}</div>
                  <div className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">{snip.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Templates Inserter Dropdown (Requirement 8) */}
        <div className="relative" ref={templateMenuRef}>
          <button
            type="button"
            onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded border border-gray-200 dark:border-zinc-800 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <span>Templates</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {isTemplateMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg py-1.5 z-30 max-h-80 overflow-y-auto">
              {ALL_TRACKS.map((track) => {
                const trackTemplates = TEMPLATES.filter((t) => t.track === track);
                if (trackTemplates.length === 0) return null;

                return (
                  <div key={track} className="mb-2">
                    <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider bg-gray-50 dark:bg-zinc-950/70 border-y border-gray-100 dark:border-zinc-800">
                      {track}
                    </div>
                    {trackTemplates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleInsertTemplate(tmpl.content)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="font-medium text-xs text-gray-900 dark:text-zinc-100">{tmpl.name}</div>
                        <div className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">{tmpl.description}</div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Editor Content Surface */}
      <div
        className={`flex-1 overflow-y-auto ${isSidecarMode ? 'px-4 py-3' : 'px-8 py-5'} cursor-text`}
        onClick={() => editor?.commands.focus()}
      >
        <div className={`${isSidecarMode ? 'max-w-none' : 'max-w-4xl'} mx-auto`}>
          <EditorContent editor={editor} />

          {/* Related Notes Section */}
          <RelatedNotes currentNote={activeNote} />
        </div>
      </div>

      {/* Subnet Calculator Modal */}
      <SubnetCalculatorModal
        isOpen={isSubnetCalculatorOpen}
        onClose={() => setSubnetCalculatorOpen(false)}
        onInsertIntoNote={(html) => editor?.chain().focus().insertContent(html).run()}
      />
    </div>
  );
};
