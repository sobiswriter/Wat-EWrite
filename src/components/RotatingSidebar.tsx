import React, { useState, useEffect, useRef } from 'react';
import { useBlog } from '../context/BlogContext';
import { Post } from '../types';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Mail,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  Flame,
  Clock,
  Compass
} from 'lucide-react';

interface RotatingSidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onSelectPost: (post: Post) => void;
}

interface RotatingItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  actionText: string;
  postId?: string;
  categoryTarget?: string;
}

export const RotatingSidebar: React.FC<RotatingSidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  onSelectPost
}) => {
  const { posts, settings, addSubscriber, subscribers } = useBlog();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subMessage, setSubMessage] = useState('');

  // Extract distinct categories from published posts
  const availableCategories = Array.from(
    new Set(posts.filter(p => !p.isDraft).map(p => p.category))
  );

  // Curated rotating editorial items
  const rotatingItems: RotatingItem[] = [
    {
      id: 'item-1',
      tag: 'Featured Dispatch',
      title: 'AI is the new plastic',
      subtitle: 'Plastic is in your chair and kitchen. AI is becoming the same invisible substrate.',
      actionText: 'Read essay',
      postId: 'post-ai-plastic'
    },
    {
      id: 'item-2',
      tag: 'Design Philosophy',
      title: 'The Art of Restraint in Software',
      subtitle: 'Why subtraction is the most potent engineering superpower we frequently ignore.',
      actionText: 'Explore philosophy',
      postId: 'post-1'
    },
    {
      id: 'item-3',
      tag: 'Executive Brief',
      title: 'CTO on Knowledge Hygiene',
      subtitle: 'How automated lineage and semantic indexing solve organizational entropy.',
      actionText: 'Read brief',
      postId: 'post-hbr-knowledge'
    },
    {
      id: 'item-4',
      tag: 'Computing Pioneers',
      title: 'The Mother of All Demos at 58',
      subtitle: 'Augmenting human intellect over superficial automation.',
      actionText: 'View archive',
      postId: 'post-pioneers-engelbart'
    },
    {
      id: 'item-5',
      tag: 'Sunday Dispatch #48',
      title: '5,200+ Thinkers Enrolled',
      subtitle: 'Curated weekly essays on typography, spatial tools, and zero-bloat architecture.',
      actionText: 'Join newsletter',
      categoryTarget: 'newsletter'
    }
  ];

  // Auto-advance rotating slide every 5.5 seconds unless user is hovering
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % rotatingItems.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused, rotatingItems.length]);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + rotatingItems.length) % rotatingItems.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % rotatingItems.length);
  };

  const handleItemClick = (item: RotatingItem) => {
    if (item.postId) {
      const targetPost = posts.find(p => p.id === item.postId);
      if (targetPost) {
        onSelectPost(targetPost);
      }
    } else if (item.categoryTarget) {
      if (item.categoryTarget === 'newsletter') {
        const el = document.getElementById('sidebar-newsletter-box');
        el?.scrollIntoView({ behavior: 'smooth' });
      } else {
        onSelectCategory(item.categoryTarget);
      }
    }
  };

  const handleQuickSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const res = addSubscriber(email, '', 'hero');
    if (res.success) {
      setSubscribed(true);
      setSubMessage('Subscribed to Sunday Dispatch.');
      setEmail('');
    } else {
      setSubMessage(res.message);
    }
  };

  const currentItem = rotatingItems[currentSlide];

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-8">
      
      {/* 1. Masthead Branding Title (Matching Notion Editorial Layout) */}
      <div className="border-b border-[#E5E2DC] pb-6">
        <div className="flex items-baseline gap-2">
          <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111] leading-none">
            {settings.blogName}
          </h1>
        </div>
        <p className="mt-3 text-sm text-[#666666] leading-relaxed font-sans">
          {settings.tagline || settings.description}
        </p>
      </div>

      {/* 2. Interactive Rotating Editorial Sidebar Widget */}
      <div
        id="rotating-sidebar-widget"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="bg-[#FFFFFF] border border-[#E5E2DC] rounded-xl p-4 shadow-2xs hover:border-[#111111]/30 transition-all duration-200 relative overflow-hidden group"
      >
        {/* Top Header & Rotating Controls */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#D44D2E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D44D2E] animate-pulse" />
            <span>{currentItem.tag}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevSlide}
              className="p-1 rounded-md text-[#888888] hover:text-[#111111] hover:bg-[#F3F1EC] transition-colors cursor-pointer"
              title="Previous spotlight"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-[#888888] font-mono font-medium">
              {currentSlide + 1}/{rotatingItems.length}
            </span>
            <button
              onClick={handleNextSlide}
              className="p-1 rounded-md text-[#888888] hover:text-[#111111] hover:bg-[#F3F1EC] transition-colors cursor-pointer"
              title="Next spotlight"
              aria-label="Next slide"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div
          onClick={() => handleItemClick(currentItem)}
          className="cursor-pointer transition-all duration-200"
        >
          <h3 className="font-sans font-bold text-sm sm:text-base text-[#111111] group-hover:text-[#D44D2E] transition-colors leading-snug">
            {currentItem.title}
          </h3>
          <p className="mt-1.5 text-xs text-[#666666] leading-relaxed line-clamp-2">
            {currentItem.subtitle}
          </p>
          <div className="mt-3 pt-2 border-t border-[#F3F1EC] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111111] group-hover:text-[#D44D2E] flex items-center gap-1">
              {currentItem.actionText} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <span className="text-[10px] text-[#999999] uppercase tracking-wider font-mono">
              {isPaused ? 'Paused' : 'Live'}
            </span>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F3F1EC]">
          <div
            className="h-full bg-[#111111] transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / rotatingItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3. Category / Topic Navigation Menu (Exact Notion Layout) */}
      <div>
        <div className="text-xs font-bold tracking-wider uppercase text-[#888888] mb-2 px-1">
          Topics & Categories
        </div>
        <nav className="space-y-0.5" aria-label="Sidebar categories">
          {/* Latest (All) */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between cursor-pointer ${
              selectedCategory === null
                ? 'font-bold text-[#111111] bg-[#EFEFEF]'
                : 'text-[#555555] hover:text-[#111111] hover:bg-[#F3F1EC]'
            }`}
          >
            <span>Latest</span>
            <span className="text-xs text-[#888888] font-mono">
              {posts.filter(p => !p.isDraft).length}
            </span>
          </button>

          {/* Individual Categories */}
          {availableCategories.map(cat => {
            const count = posts.filter(p => p.category === cat && !p.isDraft).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'font-bold text-[#111111] bg-[#EFEFEF]'
                    : 'text-[#555555] hover:text-[#111111] hover:bg-[#F3F1EC]'
                }`}
              >
                <span>{cat}</span>
                <span className="text-xs text-[#888888] font-mono">{count}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 4. Mini Dispatch Subscription Box */}
      <div 
        id="sidebar-newsletter-box"
        className="bg-[#F7F7F6] border border-[#E5E2DC] rounded-xl p-4 text-[#111111]"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111] mb-1">
          <Mail className="w-3.5 h-3.5 text-[#D44D2E]" />
          <span>The Sunday Dispatch</span>
        </div>
        <p className="text-xs text-[#666666] leading-relaxed mb-3">
          Join 5,200+ readers receiving our weekly curation on software craft.
        </p>

        {subscribed ? (
          <div className="p-2.5 bg-[#FFFFFF] border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{subMessage || 'You are subscribed!'}</span>
          </div>
        ) : (
          <form onSubmit={handleQuickSubscribe} className="space-y-2">
            <input
              type="email"
              required
              placeholder="Your email address..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-[#D3CEC4] rounded-lg text-xs text-[#111111] placeholder:text-[#999999] focus:outline-hidden focus:border-[#111111] transition-all"
            />
            <button
              type="submit"
              className="w-full py-1.5 bg-[#111111] hover:bg-[#333333] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        )}
      </div>

      {/* 5. Editorial Colophon / Footnote */}
      <div className="pt-2 text-[11px] text-[#888888] space-y-1 font-sans">
        <p>Independent publication exploring digital tools & craft.</p>
        <p>© {new Date().getFullYear()} {settings.blogName}. Free & open.</p>
      </div>

    </aside>
  );
};
