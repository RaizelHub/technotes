import React, { useState, useEffect } from 'react';
import { QuestionItem } from '../../types';
import { useNotesStore } from '../../stores/useNotesStore';
import { HelpCircle, Plus, CheckCircle2, Circle, Trash2, X, ArrowUpRight } from 'lucide-react';

interface QuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionsModal: React.FC<QuestionsModalProps> = ({ isOpen, onClose }) => {
  const { activeNote, setActiveNoteId, notes } = useNotesStore();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [showLearned, setShowLearned] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
      setNewQuestionText('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newQuestionText.trim(),
          noteId: activeNote ? activeNote.id : null,
        }),
      });
      if (res.ok) {
        const created: QuestionItem = await res.json();
        setQuestions([created, ...questions]);
        setNewQuestionText('');
      }
    } catch (err) {
      console.error('Failed to add question:', err);
    }
  };

  const handleToggleLearned = async (q: QuestionItem) => {
    const nextLearned = !q.isLearned;
    try {
      const res = await fetch(`/api/questions/${q.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLearned: nextLearned }),
      });
      if (res.ok) {
        setQuestions(questions.map((item) => (item.id === q.id ? { ...item, isLearned: nextLearned } : item)));
      }
    } catch (err) {
      console.error('Failed to update question:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuestions(questions.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const activeQuestions = questions.filter((q) => !q.isLearned);
  const learnedQuestions = questions.filter((q) => q.isLearned);
  const displayedQuestions = showLearned ? learnedQuestions : activeQuestions;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-gray-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-gray-700 dark:text-zinc-300" />
            <span className="font-semibold text-xs font-mono uppercase tracking-tight">
              Questions / Learning Backlog
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              ({activeQuestions.length} pending)
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAddQuestion} className="p-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2">
          <input
            type="text"
            autoFocus
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="What don't you understand yet? (e.g. Why does DHCP use UDP?)"
            className="flex-1 text-xs px-3 py-1.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:border-black dark:focus:border-white focus:outline-none text-gray-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black rounded text-xs font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Filter Toggle */}
        <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs bg-gray-50/40 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLearned(false)}
              className={`px-2 py-0.5 rounded font-medium ${
                !showLearned ? 'bg-black text-white dark:bg-white dark:text-black font-semibold' : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Active ({activeQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setShowLearned(true)}
              className={`px-2 py-0.5 rounded font-medium ${
                showLearned ? 'bg-black text-white dark:bg-white dark:text-black font-semibold' : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Learned ({learnedQuestions.length})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800/60 p-2">
          {displayedQuestions.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              {showLearned ? 'No learned questions yet.' : 'No pending questions in your backlog! Great job.'}
            </div>
          ) : (
            displayedQuestions.map((q) => {
              const linkedNote = q.noteId ? notes.find((n) => n.id === q.noteId) : null;

              return (
                <div
                  key={q.id}
                  className="p-3 hover:bg-gray-50/70 dark:hover:bg-zinc-950/50 rounded-md transition-colors group flex items-start gap-2.5"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleLearned(q)}
                    className="mt-0.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    title={q.isLearned ? 'Mark as Pending' : 'Mark as Learned'}
                  >
                    {q.isLearned ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <p
                      className={`text-xs leading-relaxed ${
                        q.isLearned ? 'line-through text-gray-400 dark:text-zinc-500' : 'text-gray-900 dark:text-zinc-100 font-medium'
                      }`}
                    >
                      {q.content}
                    </p>

                    {linkedNote && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveNoteId(linkedNote.id);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-black dark:hover:text-white underline decoration-gray-200"
                        title="Jump to note"
                      >
                        <span>From: {linkedNote.title}</span>
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="p-1 text-gray-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
