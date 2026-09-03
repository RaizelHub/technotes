import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { CustomCodeBlock } from './CiscoCodeBlock';
import { useNotesStore } from '../../stores/useNotesStore';
import { formatRelativeTime } from '../../utils/date';
import { TEMPLATES } from '../../utils/templates';
import { CISCO_SNIPPETS } from '../../utils/snippets';
import { downloadMarkdown, printCleanDocument } from '../../utils/export';
import { SubnetCalculatorModal } from '../modals/SubnetCalculatorModal';
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
    duplicateNote,
    deleteNote,
    createNote,
  } = useNotesStore();

  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isSnippetMenuOpen, setIsSnippetMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const templateMenuRef = useRef<HTMLDivElement>(null);
  const snippetMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // TipTap editor instance with screenshot image support
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
        placeholder: 'Start writing notes, Cisco commands, paste a screenshot (Ctrl+V), or insert a template...',
      }),
    ],
    content: activeNote?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateActiveNote({ content: html });
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px] leading-relaxed font-sans selection:bg-gray-200 dark:selection:bg-zinc-700 selection:text-black dark:selection:text-white',
      },
      // Direct Clipboard Screenshot / Image Paste Handler
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (readerEvent) => {
                const base64 = readerEvent.target?.result as string;
                if (base64) {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src: base64 })
                    )
                  );
                }
              };
              reader.readAsDataURL(file);
              return true; // handled image paste
            }
          }
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

  const handleSetCategory = (categoryId: string | null) => {
    updateActiveNote({ categoryId });
    setIsCategoryMenuOpen(false);
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

  const currentCategory = categories.find((c) => c.id === activeNote.categoryId);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 overflow-hidden">
      {/* Top Header / Metadata Bar */}
      <div className={`flex-shrink-0 border-b border-gray-200 dark:border-zinc-800 ${isSidecarMode ? 'px-4 pt-3 pb-2' : 'px-8 pt-5 pb-3'} no-print`}>
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

        {/* Metadata row: Category pill, Tags, Updated timestamp, Actions, Save status */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs text-gray-500 dark:text-zinc-400">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Selector Pill */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                type="button"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium transition-colors border border-gray-200/80 dark:border-zinc-700/80"
              >
                <span>{currentCategory ? currentCategory.name : 'Uncategorized'}</span>
                <ChevronDown className="w-3 h-3 text-gray-500 dark:text-zinc-400" />
              </button>

              {isCategoryMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg py-1 z-30">
                  <button
                    type="button"
                    onClick={() => handleSetCategory(null)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-between ${
                      !activeNote.categoryId ? 'font-semibold text-black dark:text-white bg-gray-50 dark:bg-zinc-800' : 'text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    <span>Uncategorized</span>
                    {!activeNote.categoryId && <Check className="w-3.5 h-3.5 text-black dark:text-white" />}
                  </button>
                  <div className="border-t border-gray-100 dark:border-zinc-800 my-1" />
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSetCategory(cat.id)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-between ${
                        activeNote.categoryId === cat.id ? 'font-semibold text-black dark:text-white bg-gray-50 dark:bg-zinc-800' : 'text-gray-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {activeNote.categoryId === cat.id && <Check className="w-3.5 h-3.5 text-black dark:text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags list */}
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
            {/* Auto-save status indicator */}
            <div className="mr-1">
              {saveStatus === 'saving' && (
                <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs text-gray-600 dark:text-zinc-400 font-medium flex items-center gap-1">
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

            {/* Export Markdown */}
            <button
              type="button"
              onClick={() => downloadMarkdown(activeNote)}
              className="p-1.5 rounded text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
              title="Export Note to Markdown (.md)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Print / PDF */}
            <button
              type="button"
              onClick={printCleanDocument}
              className="p-1.5 rounded text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
              title="Print Note / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Pin note button */}
            <button
              type="button"
              onClick={() => togglePin(activeNote.id)}
              className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors ${
                activeNote.isPinned ? 'text-black dark:text-white bg-gray-100 dark:bg-zinc-800' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
              }`}
              title={activeNote.isPinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            {/* Duplicate note button */}
            <button
              type="button"
              onClick={() => duplicateNote(activeNote.id)}
              className="p-1.5 rounded text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
              title="Duplicate note"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Archive note button */}
            <button
              type="button"
              onClick={() => toggleArchive(activeNote.id)}
              className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors ${
                activeNote.isArchived ? 'text-black dark:text-white bg-gray-100 dark:bg-zinc-800' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
              }`}
              title={activeNote.isArchived ? 'Unarchive note' : 'Archive note'}
            >
              <Archive className="w-3.5 h-3.5" />
            </button>

            {/* Delete note button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this note permanently?')) {
                  deleteNote(activeNote.id);
                }
              }}
              className="p-1.5 rounded text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className={`flex-shrink-0 border-b border-gray-100 dark:border-zinc-800/80 ${isSidecarMode ? 'px-4' : 'px-8'} py-1.5 flex flex-wrap items-center gap-1 text-gray-600 dark:text-zinc-400 bg-white dark:bg-zinc-950 select-none no-print`}>
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white font-bold' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white font-bold' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white font-bold' : ''
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
            editor?.isActive('bold') ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white font-bold' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('italic') ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white italic' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
            editor?.isActive('underline') ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white underline' : ''
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

        {/* Quotes & Cisco Commands */}
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
            editor?.isActive('codeBlock') ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white font-medium' : ''
          }`}
          title="Cisco Command Block"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">CLI</span>
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

        {/* Subnet Calculator Quick Button */}
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

        {/* Templates Inserter Dropdown */}
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
            <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg py-1.5 z-30">
              <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Insert Template
              </div>
              {TEMPLATES.map((tmpl) => (
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
