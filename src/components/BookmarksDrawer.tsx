import React from 'react';
import { useBlog } from '../context/BlogContext';
import { Post } from '../types';
import { Bookmark, X, ArrowRight, Trash2, BookOpen } from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPost: (post: Post) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  onSelectPost
}) => {
  const { posts, bookmarks, toggleBookmark } = useBlog();

  if (!isOpen) return null;

  const bookmarkedPosts = posts.filter(p => bookmarks.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-[#F9F8F6] h-full shadow-2xl border-l border-[#E5E2DC] flex flex-col animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E5E2DC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#D44D2E]" />
            <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">Reading List</h3>
            <span className="text-xs bg-[#F9EBE7] text-[#942C17] font-semibold px-2 py-0.5 rounded-full">
              {bookmarkedPosts.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B665F] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F3F1EC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarkedPosts.length > 0 ? (
            bookmarkedPosts.map(post => (
              <div
                key={post.id}
                className="p-4 bg-white rounded-xl border border-[#E5E2DC] hover:border-[#D44D2E]/50 shadow-2xs transition-all group relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#942C17] bg-[#F9EBE7] px-2 py-0.5 rounded">
                    {post.category}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(post.id);
                    }}
                    className="text-[#9C968B] hover:text-red-600 transition-colors p-1"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4
                  onClick={() => {
                    onSelectPost(post);
                    onClose();
                  }}
                  className="font-serif font-semibold text-[#1A1A1A] text-base mt-2 hover:text-[#D44D2E] cursor-pointer line-clamp-2"
                >
                  {post.title}
                </h4>

                <p className="text-xs text-[#6B665F] line-clamp-2 mt-1">
                  {post.excerpt}
                </p>

                <div className="mt-3 pt-2 border-t border-[#F3F1EC] flex items-center justify-between text-xs text-[#6B665F]">
                  <span>{post.readingTime} min read</span>
                  <button
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                    className="font-medium text-[#D44D2E] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Read <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 px-4 text-[#6B665F]">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#1A1A1A]" />
              <p className="font-serif text-base font-semibold text-[#1A1A1A]">Your reading list is empty</p>
              <p className="text-xs mt-1 text-[#6B665F] max-w-xs mx-auto">
                Bookmark articles by clicking the bookmark icon while reading to save them for offline or later reflection.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {bookmarkedPosts.length > 0 && (
          <div className="p-4 bg-[#F3F1EC] border-t border-[#E5E2DC] text-center text-xs text-[#6B665F]">
            Saved securely in your local browser storage.
          </div>
        )}
      </div>
    </div>
  );
};
