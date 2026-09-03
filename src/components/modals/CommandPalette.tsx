import React, { useState, useEffect, useRef } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';
import { downloadMarkdown, printCleanDocument, downloadDatabaseBackup } from '../../utils/export';
import {
  Search,
  Plus,
  Pin,
  PanelLeft,
  Archive,
  Trash2,
  FileCode,
  Zap,
  Calculator,
  Moon,
  Sun,
  Download,
  Printer,
  Database,
  Columns2,
} from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    createNote,
    setSelectedFilter,
    toggleSidebar,
    toggleSidecarMode,
    isSidecarMode,
    toggleDarkMode,
    isDarkMode,
    setSubnetCalculatorOpen,
    setQuickNoteOpen,
    activeNote,
    deleteNote,
    toggleArchive,
  } = useNotesStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'new_note',
      name: 'New Note',
      shortcut: 'Ctrl+N',
      icon: <Plus className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => createNote(),
    },
    {
      id: 'quick_note',
      name: 'Open Quick Note',
      shortcut: 'Ctrl+Shift+N',
      icon: <Zap className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => setQuickNoteOpen(true),
    },
    {
      id: 'subnet_calc',
      name: 'CIDR & Subnet Calculator',
      shortcut: 'Ctrl+Shift+C',
      icon: <Calculator className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => setSubnetCalculatorOpen(true),
    },
    {
      id: 'toggle_sidecar',
      name: isSidecarMode ? 'Exit Sidecar Mode' : 'Enter Sidecar / Mini Mode (Packet Tracer View)',
      shortcut: 'Ctrl+M',
      icon: <Columns2 className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => toggleSidecarMode(),
    },
    {
      id: 'toggle_theme',
      name: isDarkMode ? 'Switch to Light Theme' : 'Switch to Pure Dark Theme',
      icon: isDarkMode ? (
        <Sun className="w-4 h-4 text-amber-500" />
      ) : (
        <Moon className="w-4 h-4 text-gray-500" />
      ),
      action: () => toggleDarkMode(),
    },
    {
      id: 'pinned_notes',
      name: 'Open Pinned Notes',
      icon: <Pin className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => setSelectedFilter('pinned'),
    },
    {
      id: 'all_notes',
      name: 'Open All Notes',
      icon: <FileCode className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => setSelectedFilter('all'),
    },
    {
      id: 'toggle_sidebar',
      name: 'Toggle Sidebar',
      icon: <PanelLeft className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => toggleSidebar(),
    },
    ...(activeNote
      ? [
          {
            id: 'export_md',
            name: `Export "${activeNote.title || 'Note'}" to Markdown (.md)`,
            icon: <Download className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
            action: () => downloadMarkdown(activeNote),
          },
          {
            id: 'print_pdf',
            name: `Print "${activeNote.title || 'Note'}" / Save as PDF`,
            icon: <Printer className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
            action: () => printCleanDocument(),
          },
          {
            id: 'archive_note',
            name: activeNote.isArchived ? 'Unarchive Current Note' : 'Archive Current Note',
            icon: <Archive className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
            action: () => toggleArchive(activeNote.id),
          },
          {
            id: 'delete_note',
            name: 'Delete Current Note',
            icon: <Trash2 className="w-4 h-4 text-red-500" />,
            action: () => {
              if (window.confirm('Delete this note permanently?')) {
                deleteNote(activeNote.id);
              }
            },
          },
        ]
      : []),
    {
      id: 'backup_db',
      name: 'Download SQLite Database Backup (.db)',
      icon: <Database className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => downloadDatabaseBackup(),
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (cmd) {
        setCommandPaletteOpen(false);
        cmd.action();
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-[1px] p-4 select-none"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-gray-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
          <Search className="w-4 h-4 text-gray-400 dark:text-zinc-500 mr-2.5 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="w-full text-sm bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-zinc-500 text-gray-900 dark:text-zinc-100"
          />
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded">
            Esc
          </kbd>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto py-1.5 divide-y divide-gray-50 dark:divide-zinc-800/50">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400 dark:text-zinc-500">
              No matching commands
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => {
                  setCommandPaletteOpen(false);
                  cmd.action();
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs text-left transition-colors ${
                  idx === selectedIndex
                    ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-medium'
                    : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {cmd.icon}
                  <span className="truncate">{cmd.name}</span>
                </div>
                {cmd.shortcut && (
                  <kbd className="font-mono text-[10px] text-gray-400 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
