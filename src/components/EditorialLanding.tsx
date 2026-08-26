import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { Post } from '../types';
import { LandingHeroShowcase } from './LandingHeroShowcase';
import { RotatingSidebar } from './RotatingSidebar';
import { PostCard } from './PostCard';
import { Search, BookOpen } from 'lucide-react';

interface EditorialLandingProps {
  onSelectPost: (post: Post) => void;
}

export const EditorialLanding: React.FC<EditorialLandingProps> = ({
  onSelectPost
}) => {
  const { posts } = useBlog();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'likes'>('latest');

  // Smooth scroll helper to essays stream
  const handleScrollToEssays = () => {
    const el = document.getElementById('essays-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter visible posts
  const filteredPosts = posts.filter(post => {
    if (post.isDraft) return false;
    if (selectedCategory && post.category !== selectedCategory) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q)) ||
        post.author.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort visible posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') return b.views - a.views;
    if (sortBy === 'likes') return b.likes - a.likes;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <div className="w-full">
      {/* 1. Aesthetic Developer Showcase & Top Stories Hero */}
      <LandingHeroShowcase
        onSelectPost={onSelectPost}
        onScrollToEssays={handleScrollToEssays}
      />

      {/* 2. Main Essays Section with Rotating Sidebar & 2-Column Notion Grid */}
      <section id="essays-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
          
          {/* Left: Sticky Rotating Editorial Sidebar */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-22 self-start">
            <RotatingSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setSearchFilter('');
              }}
              onSelectPost={onSelectPost}
            />
          </div>

          {/* Right: Main Editorial Stream */}
          <div className="flex-1 min-w-0 w-full">
            
            {/* Top Editorial Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-8 border-b border-[#E5E2DC]">
              <div className="flex items-baseline gap-2">
                <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                  {selectedCategory || 'Latest'}
                </h2>
                <span className="text-xs text-[#888888] font-mono">
                  ({sortedPosts.length} {sortedPosts.length === 1 ? 'essay' : 'essays'})
                </span>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Filter search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter stories..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] placeholder:text-[#999999] focus:outline-hidden focus:border-[#111111] w-36 sm:w-44 transition-all"
                  />
                </div>

                {/* Sort pills */}
                <div className="flex items-center bg-[#F3F1EC] border border-[#E5E2DC] rounded-lg p-0.5 text-xs font-medium">
                  <button
                    onClick={() => setSortBy('latest')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      sortBy === 'latest' ? 'bg-[#FFFFFF] text-[#111111] shadow-2xs font-semibold' : 'text-[#666666] hover:text-[#111111]'
                    }`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      sortBy === 'popular' ? 'bg-[#FFFFFF] text-[#111111] shadow-2xs font-semibold' : 'text-[#666666] hover:text-[#111111]'
                    }`}
                  >
                    Popular
                  </button>
                  <button
                    onClick={() => setSortBy('likes')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      sortBy === 'likes' ? 'bg-[#FFFFFF] text-[#111111] shadow-2xs font-semibold' : 'text-[#666666] hover:text-[#111111]'
                    }`}
                  >
                    Top
                  </button>
                </div>
              </div>
            </div>

            {/* Editorial Cards Grid */}
            {sortedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {sortedPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelectPost={onSelectPost}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#FFFFFF] rounded-2xl border border-[#E5E2DC] p-8">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-[#999999]" />
                <h3 className="font-sans text-base font-bold text-[#111111]">No stories found</h3>
                <p className="text-xs text-[#666666] mt-1 max-w-sm mx-auto">
                  No published articles matched your active filter or search query.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchFilter('');
                  }}
                  className="mt-4 px-4 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  Show All Stories
                </button>
              </div>
            )}

          </div>

        </div>
      </section>
    </div>
  );
};
