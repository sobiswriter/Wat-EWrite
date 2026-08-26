import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { Post } from '../types';
import { PostCard } from './PostCard';
import { SlidersHorizontal, Search, ArrowUpDown, BookOpen } from 'lucide-react';

interface PostListProps {
  onSelectPost: (post: Post) => void;
  initialCategory?: string | null;
}

export const PostList: React.FC<PostListProps> = ({
  onSelectPost,
  initialCategory = null
}) => {
  const { posts } = useBlog();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'likes'>('latest');

  // Extract all categories
  const categories = Array.from(new Set(posts.map(p => p.category)));

  // Filter posts
  const visiblePosts = posts.filter(post => {
    if (post.isDraft) return false;
    if (selectedCategory && post.category !== selectedCategory) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Sort posts
  const sortedPosts = [...visiblePosts].sort((a, b) => {
    if (sortBy === 'popular') return b.views - a.views;
    if (sortBy === 'likes') return b.likes - a.likes;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#E5E2DC]">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            Latest Essays & Notes
          </h2>
          <p className="text-sm text-[#6B665F] mt-1">
            Thoughts, blueprints, and explorations published chronologically.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#9C968B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter essays..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-white border border-[#E5E2DC] rounded-xl text-xs text-[#1A1A1A] placeholder:text-[#9C968B] focus:outline-hidden focus:border-[#D44D2E] w-40 sm:w-48 transition-all"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center bg-white border border-[#E5E2DC] rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                sortBy === 'latest' ? 'bg-[#1A1A1A] text-white' : 'text-[#6B665F] hover:text-[#1A1A1A]'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                sortBy === 'popular' ? 'bg-[#1A1A1A] text-white' : 'text-[#6B665F] hover:text-[#1A1A1A]'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setSortBy('likes')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                sortBy === 'likes' ? 'bg-[#1A1A1A] text-white' : 'text-[#6B665F] hover:text-[#1A1A1A]'
              }`}
            >
              Top Liked
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 py-5 overflow-x-auto text-xs no-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
            selectedCategory === null
              ? 'bg-[#1A1A1A] text-white shadow-2xs'
              : 'bg-white border border-[#E5E2DC] text-[#6B665F] hover:border-[#9C968B]'
          }`}
        >
          All Topics ({posts.filter(p => !p.isDraft).length})
        </button>
        {categories.map(cat => {
          const count = posts.filter(p => p.category === cat && !p.isDraft).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#D44D2E] text-white shadow-2xs'
                  : 'bg-white border border-[#E5E2DC] text-[#6B665F] hover:border-[#D44D2E]/40'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid of Post Cards */}
      {sortedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
          {sortedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onSelectPost={onSelectPost}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E2DC] p-8 mt-4">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-[#9C968B]" />
          <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">No articles matched your criteria</h3>
          <p className="text-xs text-[#6B665F] mt-1 max-w-sm mx-auto">
            Try resetting your search query or selecting a different category filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchFilter('');
            }}
            className="mt-4 px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-semibold hover:bg-[#332F2A] transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
};
