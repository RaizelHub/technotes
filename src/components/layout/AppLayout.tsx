import React, { useEffect } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { NoteList } from '../notes/NoteList';
import { Editor } from '../editor/Editor';
import { QuickNoteModal } from '../modals/QuickNoteModal';
import { CommandPalette } from '../modals/CommandPalette';
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
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const {
    fetchNotes,
    fetchCategories,
    fetchTags,
    createNote,
    saveActiveNote,
    isSidebarCollapsed,
    isSidecarMode,
    isDarkMode,
    toggleSidebar,
    toggleSidecarMode,
    toggleDarkMode,
    setCommandPaletteOpen,
    setQuickNoteOpen,
    setSubnetCalculatorOpen,
  } = useNotesStore();

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
      // Ctrl + Shift + N: Quick note
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setQuickNoteOpen(true);
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
      // Ctrl + F: Focus search
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        const searchInput = document.querySelector('input[placeholder*="Search notes"]') as HTMLInputElement;
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNote, saveActiveNote, setCommandPaletteOpen, setQuickNoteOpen, setSubnetCalculatorOpen, toggleSidecarMode]);

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
            {isSidecarMode ? (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                SIDECAR
              </span>
            ) : (
              <span className="text-[11px] text-gray-400 dark:text-zinc-500 hidden sm:inline-block">
                / Technical Support & Cisco Lab Notes
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
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

          {/* Quick Note Modal Button */}
          <button
            type="button"
            onClick={() => setQuickNoteOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded transition-colors"
            title="Open Quick Note (Ctrl+Shift+N)"
          >
            <Zap className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
            <span className="hidden md:inline">Quick Note</span>
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

          {/* Search Trigger (hidden in Sidecar) */}
          {!isSidecarMode && (
            <button
              type="button"
              onClick={() => {
                const searchInput = document.querySelector('input[placeholder*="Search notes"]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
              }}
              className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded transition-colors"
              title="Search Notes (Ctrl+F)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}

          {/* New Note Button */}
          <button
            type="button"
            onClick={() => createNote()}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black rounded text-xs font-medium transition-colors"
            title="Create Note (Ctrl+N)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
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

      {/* Modals */}
      <QuickNoteModal />
      <CommandPalette />
    </div>
  );
};
