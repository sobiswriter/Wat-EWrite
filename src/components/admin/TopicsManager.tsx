import React, { useState } from 'react';
import { useBlog } from '../../context/BlogContext';
import { Post } from '../../types';
import {
  Tag,
  FolderPlus,
  Trash2,
  Edit2,
  Check,
  Plus,
  Layers,
  FileText,
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const TopicsManager: React.FC<{ onOpenCategoryFilter?: (cat: string) => void }> = ({ onOpenCategoryFilter }) => {
  const { posts, settings, updateSettings, updatePost } = useBlog();

  const [categories, setCategories] = useState<string[]>(() => {
    if (settings.categories && settings.categories.length > 0) {
      return settings.categories;
    }
    // Extract unique categories from posts if not in settings
    const unique = Array.from(new Set(posts.map(p => p.category)));
    return unique.length > 0 ? unique : ['Design Philosophy', 'For Teams', 'Tech', 'Inspiration'];
  });

  const [newCatName, setNewCatName] = useState('');
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // All unique tags extracted across all posts
  const allTagsWithCounts = (() => {
    const map: { [tag: string]: number } = {};
    posts.forEach(p => {
      p.tags.forEach(t => {
        const clean = t.trim();
        if (clean) {
          map[clean] = (map[clean] || 0) + 1;
        }
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  })();

  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      alert('This topic/category already exists.');
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    setNewCatName('');
    updateSettings({ categories: updated });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleStartEdit = (idx: number, name: string) => {
    setEditingCatIndex(idx);
    setEditingCatName(name);
  };

  const handleSaveEdit = (idx: number) => {
    const trimmed = editingCatName.trim();
    if (!trimmed) return;
    const oldName = categories[idx];
    const updated = [...categories];
    updated[idx] = trimmed;
    setCategories(updated);
    setEditingCatIndex(null);

    // Update posts with old category name to new name
    posts.forEach(p => {
      if (p.category === oldName) {
        updatePost(p.id, { category: trimmed });
      }
    });

    updateSettings({ categories: updated });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteCategory = (catName: string) => {
    const count = posts.filter(p => p.category === catName).length;
    if (count > 0) {
      const confirm = window.confirm(
        `There are ${count} essay(s) under "${catName}". Deleting this topic will reassign them to "${categories[0] || 'General'}". Proceed?`
      );
      if (!confirm) return;

      const fallbackCat = categories.find(c => c !== catName) || 'General';
      posts.forEach(p => {
        if (p.category === catName) {
          updatePost(p.id, { category: fallbackCat });
        }
      });
    }

    const updated = categories.filter(c => c !== catName);
    setCategories(updated);
    updateSettings({ categories: updated });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F3F1EC] text-[#D44D2E] text-xs font-mono font-semibold mb-2">
            <Tag className="w-3.5 h-3.5" />
            <span>Site Taxonomy & Organization</span>
          </div>
          <h2 className="text-2xl font-bold font-sans text-[#111111] tracking-tight">
            Topics, Categories & Tags
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Create and organize editorial topics, see essay distributions, and manage searchable discovery tags.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Topics Updated!</span>
          </div>
        )}
      </div>

      {/* Add New Category Box */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2">
          <FolderPlus className="w-4 h-4 text-[#D44D2E]" />
          <span>Create New Publication Topic</span>
        </h3>
        
        <div className="flex gap-3 max-w-md">
          <input
            type="text"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            placeholder="e.g. Spatial Computing, Systems Thinking..."
            className="flex-1 px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-[#111111] hover:bg-[#333333] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      {/* Active Topics List */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-[#111111] flex items-center justify-between border-b border-[#E5E2DC] pb-3">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D44D2E]" />
            <span>Active Publication Topics ({categories.length})</span>
          </span>
          <span className="text-xs text-[#777777] font-normal">
            Used across the rotating sidebar & header navigation
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat, idx) => {
            const count = posts.filter(p => p.category === cat).length;
            const isEditing = editingCatIndex === idx;

            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl hover:border-[#CCCCCC] transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-[#111111] text-white flex items-center justify-center text-[11px] font-mono font-bold shrink-0">
                    {idx + 1}
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={e => setEditingCatName(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-[#111111] rounded text-xs text-[#111111] font-semibold"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(idx)}
                        className="p-1 bg-[#111111] text-white rounded text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#111111] truncate">
                        {cat}
                      </h4>
                      <p className="text-[11px] text-[#777777]">
                        {count} {count === 1 ? 'essay' : 'essays'} published
                      </p>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(idx, cat)}
                      className="p-1.5 bg-white border border-[#E5E2DC] hover:border-[#111111] text-[#555555] rounded-md text-xs cursor-pointer"
                      title="Rename topic"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-md text-xs cursor-pointer"
                      title="Delete topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Tags Cloud */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-[#111111] flex items-center justify-between border-b border-[#E5E2DC] pb-3">
          <span className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#D44D2E]" />
            <span>Essay Tags Catalog ({allTagsWithCounts.length} tags)</span>
          </span>
          <span className="text-xs text-[#777777] font-normal">
            Extracted automatically from all markdown essays
          </span>
        </h3>

        <div className="flex flex-wrap gap-2 pt-2">
          {allTagsWithCounts.map(([tag, count], i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#333333] hover:border-[#111111] transition-colors"
            >
              <span className="font-medium">#{tag}</span>
              <span className="font-mono text-[10px] bg-[#EBE8E3] px-1.5 py-0.2 rounded text-[#666666]">
                {count}
              </span>
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};
