import React, { useState, useEffect, useRef } from 'react';
import { useBlog } from '../context/BlogContext';
import { Post } from '../types';
import { Search, X, Clock, ArrowRight, Tag } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPost: (post: Post) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPost
}) => {
  const { posts } = useBlog();
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(posts.flatMap(p => p.tags))
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedTag(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPosts = posts.filter(post => {
    if (post.isDraft) return false;
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return matchesTag;

    const inTitle = post.title.toLowerCase().includes(cleanQuery);
    const inExcerpt = post.excerpt.toLowerCase().includes(cleanQuery);
    const inCategory = post.category.toLowerCase().includes(cleanQuery);
    const inContent = post.content.toLowerCase().includes(cleanQuery);
    const inTags = post.tags.some(t => t.toLowerCase().includes(cleanQuery));

    return matchesTag && (inTitle || inExcerpt || inCategory || inContent || inTags);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#F9F8F6] rounded-2xl shadow-2xl border border-[#E5E2DC] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E5E2DC] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#6B665F] shrink-0" />
          <input
            ref={inputRef}
            id="search-modal-input"
            type="text"
            placeholder="Search essays, concepts, typography, code..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-[#1A1A1A] placeholder:text-[#9C968B] text-base focus:outline-hidden"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-[#9C968B] hover:text-[#1A1A1A] rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[11px] bg-[#E5E2DC] text-[#6B665F] px-2 py-0.5 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Tag Filters */}
        <div className="px-4 py-2.5 bg-[#F3F1EC] border-b border-[#E5E2DC] flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[#6B665F] flex items-center gap-1 shrink-0 mr-1 font-medium">
            <Tag className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
              selectedTag === null
                ? 'bg-[#1A1A1A] text-[#F9F8F6]'
                : 'bg-[#E5E2DC] text-[#6B665F] hover:bg-[#D3CEC4]'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#D44D2E] text-white'
                  : 'bg-[#E5E2DC] text-[#6B665F] hover:bg-[#D3CEC4]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-2 divide-y divide-[#E5E2DC]/60">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <div
                key={post.id}
                onClick={() => {
                  onSelectPost(post);
                  onClose();
                }}
                className="pt-2 first:pt-0 p-3 rounded-xl hover:bg-[#F3F1EC] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#D44D2E]">
                    {post.category}
                  </span>
                  <span className="text-xs text-[#6B665F] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readingTime} min read
                  </span>
                </div>
                <h4 className="font-serif font-semibold text-base text-[#1A1A1A] group-hover:text-[#D44D2E] transition-colors">
                  {post.title}
                </h4>
                <p className="text-xs text-[#6B665F] line-clamp-2 mt-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] bg-[#E5E2DC] text-[#6B665F] px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-[#D44D2E] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read essay <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 px-4 text-[#6B665F]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-[#1A1A1A]">No matching essays found</p>
              <p className="text-xs mt-1">Try refining your search keyword or clearing the tag filter.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F3F1EC] border-t border-[#E5E2DC] text-center text-xs text-[#6B665F]">
          Showing {filteredPosts.length} of {posts.filter(p => !p.isDraft).length} published essays
        </div>
      </div>
    </div>
  );
};
