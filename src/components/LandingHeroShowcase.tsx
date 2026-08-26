import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { Post } from '../types';
import { AccordionGallery, AccordionGalleryItem } from './AccordionGallery';
import {
  ArrowDown,
  ArrowRight,
  Sparkles,
  BookOpen,
  Eye,
  Heart,
  Clock,
  Compass
} from 'lucide-react';

interface LandingHeroShowcaseProps {
  onSelectPost: (post: Post) => void;
  onScrollToEssays: () => void;
}

export const LandingHeroShowcase: React.FC<LandingHeroShowcaseProps> = ({
  onSelectPost,
  onScrollToEssays
}) => {
  const { posts, settings } = useBlog();

  // Top curated stories based on custom admin selection or defaults
  const topStories = (() => {
    if (settings.featuredPostIds && settings.featuredPostIds.length > 0) {
      const customList = settings.featuredPostIds
        .map(id => posts.find(p => p.id === id))
        .filter((p): p is Post => !!p && !p.isDraft);
      if (customList.length > 0) return customList.slice(0, 5);
    }
    // Fallback: featured posts then latest published
    const featured = posts.filter(p => !p.isDraft && p.isFeatured);
    if (featured.length >= 3) return featured.slice(0, 5);
    return posts.filter(p => !p.isDraft).slice(0, 5);
  })();

  const accordionItems: AccordionGalleryItem[] = topStories.map(story => ({
    image: story.coverImage,
    label: `${story.category}: ${story.title}`,
    alt: story.title,
    postId: story.id,
    category: story.category
  }));

  const handleAccordionSelect = (item: AccordionGalleryItem) => {
    if (item.postId) {
      const found = posts.find(p => p.id === item.postId);
      if (found) {
        onSelectPost(found);
      }
    }
  };

  const metrics = settings.metrics || [
    { value: settings.newsletterReadersCount || "5,200+", label: "Sunday Dispatch Readers" },
    { value: "0 Trackers", label: "Pure Content Privacy" },
    { value: "100/100", label: "Lighthouse Performance" },
    { value: "GSAP + React", label: "Fluid Interactive Motion" }
  ];

  return (
    <section className="border-b border-[#E5E2DC] bg-[#FFFFFF] relative overflow-hidden">
      
      {/* Subtle architectural hairline grid pattern */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#D5D2CA 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12 sm:pb-16 relative z-10">
        
        {/* Top Header Badge & Issue Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#E5E2DC] mb-8">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#111111] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              {settings.volume || 'Vol. IV'}
            </span>
            <span className="text-xs font-semibold text-[#666666] tracking-tight">
              {settings.journalSeason || 'Autumn 2026 Journal'}
            </span>
            <span className="text-[#CCCCCC]">•</span>
            <span className="text-xs text-[#888888] font-mono">
              {settings.issue || 'Issue #48'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#666666] font-sans">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Independent & Ad-Free
            </span>
          </div>
        </div>

        {/* Hero Title & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-10">
          <div className="lg:col-span-8">
            <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#111111] tracking-tight leading-[1.08]">
              {settings.heroTitle ? (
                <span>{settings.heroTitle}</span>
              ) : (
                <>Where Thoughtful Software Meets <span className="font-serif italic font-normal text-[#D44D2E]">Timeless Craft</span>.</>
              )}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#555555] leading-relaxed max-w-2xl font-sans">
              {settings.heroSubtitle || settings.description || 'An independent digital journal dedicated to human-computer interaction, spatial tools, optical typography, and zero-bloat architecture.'}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-end">
            <button
              onClick={onScrollToEssays}
              className="px-5 py-3 bg-[#111111] hover:bg-[#2A2A2A] text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2.5 cursor-pointer group"
            >
              <span>Explore All Essays & Digest</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </button>
            <span className="text-[11px] text-[#888888] font-mono mt-2">
              ↓ Jump to Notion-style stream & sidebar
            </span>
          </div>
        </div>

        {/* Interactive React Bits AccordionGallery showcasing Top Stories */}
        <div className="bg-[#F9F8F6] border border-[#E5E2DC] rounded-2xl p-4 sm:p-7 shadow-2xs">
          
          {/* Gallery Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E5E2DC]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D44D2E] animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Top Stories Showcase • Interactive Accordion Gallery
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#777777]">
              <span className="hidden sm:inline">Hover / click panels to expand</span>
              <span className="font-mono text-[11px] bg-[#EBE8E3] px-2 py-0.5 rounded text-[#111111]">
                {topStories.length} Featured Essays
              </span>
            </div>
          </div>

          {/* Render AccordionGallery */}
          {accordionItems.length > 0 && (
            <div className="w-full overflow-hidden rounded-xl">
              <AccordionGallery
                items={accordionItems}
                defaultIndex={1}
                accentColor="#D44D2E"
                overlayColor="#0A0806"
                textColor="#FFFFFF"
                height={400}
                gap={12}
                radius={14}
                expandRatio={0.54}
                duration={0.6}
                ease="power3.out"
                parallax={0.5}
                tilt={6}
                stagger={0.05}
                trigger="hover"
                grayscale={true}
                showLabels={true}
                onItemSelect={handleAccordionSelect}
              />
            </div>
          )}

          {/* Quick story pills under accordion */}
          <div className="mt-5 pt-4 border-t border-[#E5E2DC] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#888888] text-[11px] font-semibold uppercase tracking-wider">
                Quick Jump:
              </span>
              {topStories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => onSelectPost(story)}
                  className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#111111] hover:text-white border border-[#E5E2DC] rounded-md text-[11px] text-[#444444] transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{story.title.length > 28 ? `${story.title.slice(0, 28)}...` : story.title}</span>
                  <ArrowRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>

            <div className="text-[11px] text-[#888888] font-mono">
              Click any expanded panel to read
            </div>
          </div>

        </div>

        {/* Developer Craftsmanship & Performance Ticker */}
        <div className="mt-8 pt-8 border-t border-[#E5E2DC]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {metrics.map((m, i) => (
              <div key={i} className="p-4 bg-[#F9F8F6] rounded-xl border border-[#E5E2DC]">
                <div className="font-mono text-xl sm:text-2xl font-bold text-[#111111]">
                  {m.value}
                </div>
                <div className="text-xs font-medium text-[#666666] mt-0.5">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
