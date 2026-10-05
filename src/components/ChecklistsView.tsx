/**
 * ChecklistsView component for Private Notes.
 * Allows creating multiple checklists, adding/editing/deleting items,
 * toggling item completion, and viewing progress.
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ListTodo,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Checklist, ChecklistItem } from '../types';

interface ChecklistsViewProps {
  checklists: Checklist[];
  onCreateChecklist: (title: string) => Promise<void>;
  onUpdateChecklist: (checklistId: string, updates: Partial<Checklist>) => Promise<void>;
  onDeleteChecklist: (checklistId: string) => Promise<void>;
}

export const ChecklistsView: React.FC<ChecklistsViewProps> = ({
  checklists,
  onCreateChecklist,
  onUpdateChecklist,
  onDeleteChecklist,
}) => {
  const [activeChecklistId, setActiveChecklistId] = useState<string>(() => {
    return checklists.length > 0 ? checklists[0].id : '';
  });

  // New checklist creation input state
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // New item input state
  const [newItemText, setNewItemText] = useState('');

  // Editing checklist title state
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  // Editing item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  // Collapsible completed items section
  const [showCompleted, setShowCompleted] = useState(true);

  // Active checklist object
  const activeChecklist =
    checklists.find((c) => c.id === activeChecklistId) || (checklists.length > 0 ? checklists[0] : null);

  // Ensure an active checklist is selected if available
  React.useEffect(() => {
    if (!activeChecklistId && checklists.length > 0) {
      setActiveChecklistId(checklists[0].id);
    } else if (activeChecklistId && !checklists.some((c) => c.id === activeChecklistId)) {
      if (checklists.length > 0) {
        setActiveChecklistId(checklists[0].id);
      } else {
        setActiveChecklistId('');
      }
    }
  }, [checklists, activeChecklistId]);

  // Create new checklist handler
  const handleCreateList = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newListTitle.trim()) return;

    await onCreateChecklist(newListTitle.trim());
    setNewListTitle('');
    setIsCreatingList(false);
  };

  // Add item handler
  const handleAddItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChecklist || !newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: newItemText.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    const updatedItems = [...activeChecklist.items, newItem];
    await onUpdateChecklist(activeChecklist.id, { items: updatedItems });
    setNewItemText('');
  };

  // Toggle item completed
  const handleToggleItem = async (itemId: string) => {
    if (!activeChecklist) return;

    const updatedItems = activeChecklist.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await onUpdateChecklist(activeChecklist.id, { items: updatedItems });
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!activeChecklist) return;

    const updatedItems = activeChecklist.items.filter((item) => item.id !== itemId);
    await onUpdateChecklist(activeChecklist.id, { items: updatedItems });
  };

  // Save edited item
  const handleSaveItemEdit = async (itemId: string) => {
    if (!activeChecklist) return;
    const trimmed = editingItemText.trim();
    if (!trimmed) {
      handleDeleteItem(itemId);
      setEditingItemId(null);
      return;
    }

    const updatedItems = activeChecklist.items.map((item) =>
      item.id === itemId ? { ...item, text: trimmed } : item
    );
    await onUpdateChecklist(activeChecklist.id, { items: updatedItems });
    setEditingItemId(null);
  };

  // Save edited checklist title
  const handleSaveTitleEdit = async (checklistId: string) => {
    const trimmed = editingTitleText.trim();
    if (trimmed) {
      await onUpdateChecklist(checklistId, { title: trimmed });
    }
    setEditingTitleId(null);
  };

  // Items split
  const pendingItems = activeChecklist ? activeChecklist.items.filter((i) => !i.completed) : [];
  const completedItems = activeChecklist ? activeChecklist.items.filter((i) => i.completed) : [];
  const totalCount = activeChecklist ? activeChecklist.items.length : 0;
  const completedCount = completedItems.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-500/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Checklists</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            To-Do & Checklists
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingList(true)}
          className="btn-electric px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-white flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Checklist</span>
        </button>
      </div>

      {/* New Checklist Inline Creator Modal / Card */}
      {isCreatingList && (
        <form
          onSubmit={handleCreateList}
          className="glass-panel rounded-2xl p-4 sm:p-5 border border-sky-400/30 bg-[#031B36]/90 animate-fade-in flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <input
            type="text"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            placeholder="Checklist title (e.g. Weekly Groceries, Travel Pack list)..."
            autoFocus
            className="flex-1 px-3.5 py-2 text-sm rounded-xl glass-input placeholder-sky-200/40 text-white"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!newListTitle.trim()}
              className="btn-electric px-4 py-2 text-xs font-medium text-white rounded-xl flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreatingList(false);
                setNewListTitle('');
              }}
              className="px-3 py-2 text-xs font-medium text-sky-200/70 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Checklists Tab Bar + Active Checklist View */}
      {checklists.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List Selector & Overview */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold text-sky-300/60 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Your Checklists ({checklists.length})</span>
            </div>

            <div className="space-y-2">
              {checklists.map((list) => {
                const isActive = list.id === (activeChecklist ? activeChecklist.id : '');
                const total = list.items.length;
                const done = list.items.filter((i) => i.completed).length;

                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => setActiveChecklistId(list.id)}
                    className={`w-full text-left p-3.5 rounded-2xl glass-panel transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'border-sky-400/50 bg-[#042A52]/90 shadow-[0_0_20px_rgba(56,189,248,0.15)] ring-1 ring-sky-400/40'
                        : 'hover:border-sky-400/30 hover:bg-[#031B36]/80 text-sky-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-sm text-white truncate line-clamp-1">
                        {list.title}
                      </span>
                      <span className="text-[11px] tabular-nums font-medium text-sky-300 shrink-0">
                        {done}/{total}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900/60 h-1.5 rounded-full overflow-hidden border border-sky-500/10">
                      <div
                        className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Checklist Content */}
          {activeChecklist && (
            <div className="lg:col-span-8 glass-panel rounded-2xl p-5 sm:p-6 border border-sky-500/20 bg-[#031B36]/80 shadow-2xl space-y-6">
              {/* Checklist Title & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-500/15">
                {editingTitleId === activeChecklist.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingTitleText}
                      onChange={(e) => setEditingTitleText(e.target.value)}
                      autoFocus
                      className="flex-1 px-3 py-1.5 text-base font-bold rounded-xl glass-input text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveTitleEdit(activeChecklist.id)}
                      className="p-2 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTitleId(null)}
                      className="p-2 rounded-xl text-sky-300 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {activeChecklist.title}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTitleId(activeChecklist.id);
                        setEditingTitleText(activeChecklist.title);
                      }}
                      className="p-1 rounded-lg text-sky-400/60 hover:text-sky-300 hover:bg-sky-950/60 transition-colors"
                      title="Rename checklist"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-xs text-sky-300 font-medium">
                    {percentComplete}% Completed
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete checklist "${activeChecklist.title}"?`)) {
                        onDeleteChecklist(activeChecklist.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete checklist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add New Item Input */}
              <form onSubmit={handleAddItem} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Add a new task or checklist item..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl glass-input placeholder-sky-200/40 text-white"
                />
                <button
                  type="submit"
                  disabled={!newItemText.trim()}
                  className="btn-electric px-4 py-2.5 text-xs sm:text-sm font-medium text-white rounded-xl flex items-center gap-1.5 shrink-0 disabled:opacity-40 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Item</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </form>

              {/* Pending Items List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-sky-300/70 uppercase tracking-wider mb-2">
                  Tasks to do ({pendingItems.length})
                </div>

                {pendingItems.length > 0 ? (
                  <div className="space-y-1.5">
                    {pendingItems.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/40 hover:bg-sky-950/50 border border-sky-500/10 hover:border-sky-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                          <button
                            type="button"
                            onClick={() => handleToggleItem(item.id)}
                            className="text-sky-400/60 hover:text-sky-300 transition-colors shrink-0 cursor-pointer"
                            title="Mark as completed"
                          >
                            <Square className="w-5 h-5" />
                          </button>

                          {editingItemId === item.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editingItemText}
                                onChange={(e) => setEditingItemText(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveItemEdit(item.id);
                                  if (e.key === 'Escape') setEditingItemId(null);
                                }}
                                className="w-full px-2.5 py-1 text-xs sm:text-sm rounded-lg glass-input text-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveItemEdit(item.id)}
                                className="p-1 rounded-md text-emerald-400 hover:text-white"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs sm:text-sm text-slate-100 break-words flex-1">
                              {item.text}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                          {editingItemId !== item.id && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditingItemText(item.text);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 transition-colors"
                              title="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-sky-500/20 text-center text-xs text-sky-200/50">
                    All tasks completed! Add a new item above.
                  </div>
                )}
              </div>

              {/* Completed Items Section */}
              {completedItems.length > 0 && (
                <div className="pt-4 border-t border-sky-500/10 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-sky-400/70 uppercase tracking-wider hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    <span>Completed ({completedItems.length})</span>
                    {showCompleted ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showCompleted && (
                    <div className="space-y-1.5 animate-fade-in">
                      {completedItems.map((item) => (
                        <div
                          key={item.id}
                          className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950/30 border border-sky-500/5 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                            <button
                              type="button"
                              onClick={() => handleToggleItem(item.id)}
                              className="text-emerald-400 hover:text-sky-300 transition-colors shrink-0 cursor-pointer"
                              title="Mark as incomplete"
                            >
                              <CheckSquare className="w-5 h-5 text-emerald-400" />
                            </button>
                            <span className="text-xs sm:text-sm text-slate-400 line-through break-words flex-1">
                              {item.text}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-10 border border-sky-500/15 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-sky-950/60 border border-sky-400/20 flex items-center justify-center text-sky-400 mx-auto mb-4 shadow-lg shadow-sky-500/10">
            <ListTodo className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">No checklists yet</h3>
          <p className="text-xs sm:text-sm text-sky-200/60 mb-6 leading-relaxed">
            Create checklists for daily chores, project milestones, or travel packing.
          </p>
          <button
            type="button"
            onClick={() => setIsCreatingList(true)}
            className="btn-electric px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Checklist</span>
          </button>
        </div>
      )}
    </div>
  );
};
