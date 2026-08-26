import React from 'react';
import { Post } from '../types';
import { useBlog } from '../context/BlogContext';
import { Bookmark, Heart, Clock, ArrowRight } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onSelectPost: (post: Post) => void;
  variant?: 'standard' | 'compact' | 'featured';
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onSelectPost,
  variant = 'standard'
}) => {
  const { bookmarks, toggleBookmark, likePost } = useBlog();
  const isBookmarked = bookmarks.includes(post.id);

  if (variant === 'compact') {
    return (
      <article 
        onClick={() => onSelectPost(post)}
        className="p-4 bg-white rounded-xl border border-[#E5E2DC] hover:border-[#111111] transition-all cursor-pointer group flex items-center justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#777777] mb-1">
            <span className="text-[#111111] font-semibold text-[11px] tracking-tight">{post.category}</span>
            <span>•</span>
            <span>{post.readingTime} min read</span>
          </div>
          <h4 className="font-sans font-bold text-[#111111] text-base group-hover:text-[#D44D2E] transition-colors truncate">
            {post.title}
          </h4>
        </div>
        <ArrowRight className="w-4 h-4 text-[#999999] group-hover:text-[#111111] group-hover:translate-x-1 transition-all shrink-0" />
      </article>
    );
  }

  return (
    <article
      id={`post-card-${post.id}`}
      onClick={() => onSelectPost(post)}
      className="bg-transparent group cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Card Media Preview (Clean Notion Illustration / Photo Frame) */}
        <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-[#F4F3EF] border border-[#E5E2DC] group-hover:border-[#C4C0B6] transition-colors mb-4">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {/* Quick Bookmark button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(post.id);
            }}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-md backdrop-blur-xs transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-[#111111] text-white'
                : 'bg-white/90 text-[#666666] hover:text-[#111111] hover:bg-white'
            }`}
            title={isBookmarked ? "Saved in reading list" : "Save for later"}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Category kicker */}
        <div className="text-xs text-[#777777] font-medium tracking-normal mb-1.5">
          <span>{post.category}</span>
        </div>

        {/* Post Title */}
        <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#111111] group-hover:text-[#D44D2E] transition-colors leading-snug">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="mt-2 text-sm text-[#555555] leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
      </div>

      {/* Author & Meta Row */}
      <div className="mt-4 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-8 h-8 rounded-full object-cover border border-[#E5E2DC]"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="text-xs font-bold text-[#111111] leading-tight">
              {post.author.name}
            </div>
            <div className="text-[11px] text-[#777777] leading-tight">
              {post.author.role}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#888888]">
          <span className="text-[11px] font-mono">{post.readingTime} min read</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              likePost(post.id);
            }}
            className="flex items-center gap-1 text-[#777777] hover:text-rose-600 transition-colors cursor-pointer"
            title="Like"
          >
            <Heart className="w-3.5 h-3.5" />
            <span className="text-[11px]">{post.likes}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
