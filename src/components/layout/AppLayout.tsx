import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { NoteList } from '../notes/NoteList';
import { Editor } from '../editor/Editor';
import { QuickCaptureModal } from '../modals/QuickCaptureModal';
import { CommandPalette } from '../modals/CommandPalette';
import { CommandReferenceModal } from '../modals/CommandReferenceModal';
import { QuestionsModal } from '../modals/QuestionsView';
import { TimelineModal } from '../modals/TimelineView';
import { BackupModal } from '../modals/BackupModal';
import { TrackOverviewModal } from '../modals/TrackOverviewModal';
import { useNotesStore } from '../../stores/useNotesStore';
import {
  PanelLeft,
  Plus,
  Search,
  Zap,
  Command,
  Calculator,
  Moon,
  Sun,
  Columns2,
  Minimize2,
  ChevronDown,
  FlaskConical,
  Wrench,
  FileText,
  Terminal,
  Shuffle,
  Compass,
  Code,
  Bot,
  Layers,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const {
    fetchNotes,
    fetchCategories,
    fetchTags,
    createNote,
    createNoteFromTemplate,
    saveActiveNote,
    selectedTrack,
    isSidebarCollapsed,
    isSidecarMode,
    isDarkMode,
    isCommandReferenceOpen,
    isQuestionsOpen,
    isTimelineOpen,
    isBackupOpen,
    isTrackOverviewOpen,
    toggleSidebar,
    toggleSidecarMode,
    toggleDarkMode,
    setCommandPaletteOpen,
    setQuickCaptureOpen,
    setSubnetCalculatorOpen,
    setCommandReferenceOpen,
    setQuestionsOpen,
    setTimelineOpen,
    setBackupOpen,
    setTrackOverviewOpen,
    triggerRandomReview,
  } = useNotesStore();

  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchNotes();
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + N: New note
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        createNote();
      }
      // Ctrl + Shift + N: Quick Capture
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setQuickCaptureOpen(true);
      }
      // Ctrl + Shift + R: Random Review
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        triggerRandomReview();
      }
      // Ctrl + Shift + C: Subnet Calculator
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setSubnetCalculatorOpen(true);
      }
      // Ctrl + M: Toggle Sidecar mode
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleSidecarMode();
      }
      // Ctrl + Shift + P: Command palette
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Ctrl + S: Force save
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveActiveNote();
      }
      // Ctrl + F or Ctrl + K: Focus search
      else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'k')
      ) {
        const searchInput = document.querySelector(
          'input[placeholder*="Search notes"]'
        ) as HTMLInputElement;
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    createNote,
    saveActiveNote,
    setCommandPaletteOpen,
    setQuickCaptureOpen,
    setSubnetCalculatorOpen,
    toggleSidecarMode,
    triggerRandomReview,
  ]);

  // Click outside for new note template menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setIsNewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 overflow-hidden select-none">
      {/* Top Application Bar */}
      <header className="h-11 border-b border-gray-200 dark:border-zinc-800 px-4 flex items-center justify-between bg-white dark:bg-zinc-950 select-none z-20 flex-shrink-0 no-print">
        <div className="flex items-center gap-3">
          {!isSidecarMode && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1 rounded text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
              title="Toggle Sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-tight text-gray-900 dark:text-zinc-100 font-mono">
              TechNotes
            </span>

            {/* Track Switcher Button in Header */}
            <button
              type="button"
              onClick={() => setTrackOverviewOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 transition-colors"
              title="Click to view Career Tracks"
            >
              <Compass className="w-3 h-3 text-gray-500" />
              <span>{selectedTrack === 'all' ? 'All Tracks' : selectedTrack}</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Capture Button */}
          <button
            type="button"
            onClick={() => setQuickCaptureOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded transition-colors"
            title="Quick Capture (Ctrl+Shift+N)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Quick Capture</span>
          </button>

          {/* Random Review Button */}
          <button
            type="button"
            onClick={triggerRandomReview}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded transition-colors"
            title="Review Something (Ctrl+Shift+R)"
          >
            <Shuffle className="w-3.5 h-3.5 text-purple-500" />
            <span className="hidden lg:inline">Review</span>
          </button>

          {/* Subnet Calculator Button */}
          <button
            type="button"
            onClick={() => setSubnetCalculatorOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded transition-colors"
            title="CIDR Subnet Calculator (Ctrl+Shift+C)"
          >
            <Calculator className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
            <span className="hidden md:inline">Subnet</span>
          </button>

          {/* Sidecar / Mini Mode Toggle */}
          <button
            type="button"
            onClick={toggleSidecarMode}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              isSidecarMode
                ? 'bg-black dark:bg-white text-white dark:text-black font-medium'
                : 'text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900'
            }`}
            title="Toggle Sidecar Mini View (Ctrl+M)"
          >
            {isSidecarMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Columns2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isSidecarMode ? 'Exit Sidecar' : 'Sidecar'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded transition-colors"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Pure Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Command Palette Button */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded transition-colors"
            title="Command Palette (Ctrl+Shift+P)"
          >
            <Command className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
            <span className="hidden lg:inline">Commands</span>
          </button>

          {/* Search Trigger */}
          {!isSidecarMode && (
            <button
              type="button"
              onClick={() => {
                const searchInput = document.querySelector(
                  'input[placeholder*="Search notes"]'
                ) as HTMLInputElement;
                if (searchInput) searchInput.focus();
              }}
              className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded transition-colors"
              title="Search Notes (Ctrl+F / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Enhanced Multi-Track New Note Button & Template Picker (Requirement 6 & 8) */}
          <div className="relative" ref={newMenuRef}>
            <div className="inline-flex items-center rounded-md bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black text-xs font-medium shadow-sm">
              <button
                type="button"
                onClick={() => createNote()}
                className="px-2.5 py-1 flex items-center gap-1"
                title="Create Blank Note (Ctrl+N)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
              <button
                type="button"
                onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
                className="px-1 py-1 border-l border-gray-700 dark:border-zinc-300 hover:bg-black dark:hover:bg-white rounded-r-md"
                title="Choose Note Template"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Templates Menu */}
            {isNewMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-60 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg py-1 z-30 max-h-80 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    createNote();
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  <span className="font-medium">Blank Note</span>
                </button>

                {/* Software Development Templates */}
                <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-zinc-950 mt-1">
                  Software Development
                </div>
                <button
                  type="button"
                  onClick={() => {
                    createNoteFromTemplate('coding_concept');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Code className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Coding Concept</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    createNoteFromTemplate('dev_project');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Development Project</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    createNoteFromTemplate('api_integration');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>API / Integration</span>
                </button>

                {/* AI & Automation Templates */}
                <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-zinc-950 mt-1">
                  AI & Automation
                </div>
                <button
                  type="button"
                  onClick={() => {
                    createNoteFromTemplate('automation_workflow');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                  <span>Automation Workflow</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    createNoteFromTemplate('ai_concept');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Concept</span>
                </button>

                {/* IT & Networking Templates */}
                <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-zinc-950 mt-1">
                  IT & Networking
                </div>
                <button
                  type="button"
                  onClick={() => {
                    createNoteFromTemplate('cisco_lab');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                  <span>Cisco Lab Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    createNoteFromTemplate('troubleshooting');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Wrench className="w-3.5 h-3.5 text-orange-600" />
                  <span>Troubleshooting Journal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    createNoteFromTemplate('networking_concept');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Networking Concept</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    createNoteFromTemplate('quick_capture');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Capture</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    createNoteFromTemplate('command_reference');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Terminal className="w-3.5 h-3.5 text-gray-600" />
                  <span>Command Reference Note</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main App Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar & Note List (Hidden in Sidecar Mode) */}
        {!isSidecarMode && (
          <>
            {!isSidebarCollapsed && <Sidebar />}
            <NoteList />
          </>
        )}

        {/* Note Editor Surface */}
        <Editor />
      </main>

      {/* Modals & Technical Views */}
      <QuickCaptureModal />
      <CommandPalette />
      <CommandReferenceModal
        isOpen={isCommandReferenceOpen}
        onClose={() => setCommandReferenceOpen(false)}
        onInsertIntoNote={(html) => {
          const editorElem = document.querySelector('.ProseMirror') as any;
          if (editorElem && editorElem.__vue__?.editor) {
            editorElem.__vue__.editor.chain().focus().insertContent(html).run();
          }
        }}
      />
      <QuestionsModal
        isOpen={isQuestionsOpen}
        onClose={() => setQuestionsOpen(false)}
      />
      <TimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setTimelineOpen(false)}
      />
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setBackupOpen(false)}
      />
      <TrackOverviewModal
        isOpen={isTrackOverviewOpen}
        onClose={() => setTrackOverviewOpen(false)}
      />
    </div>
  );
};
