import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { Post } from '../types';
import { Sparkles, ArrowRight, CheckCircle2, Mail, Clock, TrendingUp, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeroSectionProps {
  onSelectPost: (post: Post) => void;
  onExploreTopics: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectPost,
  onExploreTopics
}) => {
  const { posts, settings, addSubscriber, subscribers } = useBlog();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the primary featured post
  const featuredPost = posts.find(p => p.isFeatured && !p.isDraft) || posts.find(p => !p.isDraft);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    const result = addSubscriber(email, name, 'hero');
    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({ text: result.message, isError: false });
      setEmail('');
      setName('');
      // Trigger festive celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D97706', '#92400E', '#78350F', '#F59E0B']
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      setStatusMessage({ text: result.message, isError: true });
    }
  };

  const totalSubscribersCount = 4800 + subscribers.length;

  return (
    <section className="relative pt-8 pb-14 border-b border-[#E5E2DC] overflow-hidden">
      {/* Subtle warm background gradient glow */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-[#F3EBE6]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-72 h-72 bg-[#E5E2DC]/40 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Intro */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9EBE7] border border-[#F0D5CE] text-[#942C17] text-xs font-semibold tracking-wide mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#D44D2E]" />
            <span>Weekly Essays & Reflections</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1A1A] leading-[1.15]">
            Reflections on software craft, typography, & the quiet web.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#6B665F] leading-relaxed max-w-2xl font-sans">
            {settings.description}
          </p>
        </div>

        {/* 2-Column Hero: Featured Story + High-Converting Newsletter Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Featured Post Spotlight (7 Cols) */}
          {featuredPost && (
            <div 
              id="hero-featured-card"
              onClick={() => onSelectPost(featuredPost)}
              className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E2DC] hover:border-[#D44D2E]/50 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              <div className="relative aspect-16/9 sm:aspect-21/9 overflow-hidden bg-[#F3F1EC]">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[#1A1A1A]/85 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md">
                  Featured Essay
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-[#1A1A1A] text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-[#D44D2E]" />
                  {featuredPost.readingTime} min read
                </div>
              </div>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#D44D2E] font-semibold uppercase tracking-wider mb-2">
                    <span>{featuredPost.category}</span>
                    <span>•</span>
                    <span className="text-[#6B665F] font-normal lowercase">
                      {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] group-hover:text-[#D44D2E] transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>

                  <p className="mt-3 text-sm sm:text-base text-[#6B665F] line-clamp-3 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F3F1EC] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#E5E2DC]"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs font-medium text-[#4D4842]">
                      {featuredPost.author.name}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-[#D44D2E] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    Read Essay <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Column 2: Newsletter Call-To-Action (5 Cols) */}
          <div className="lg:col-span-5 bg-[#1A1A1A] text-[#F9F8F6] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            {/* Ambient pattern */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D44D2E]/15 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-2 text-[#E06D53] text-xs font-semibold tracking-wider uppercase mb-2">
                <Mail className="w-4 h-4" />
                <span>Join The Inner Circle</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {settings.newsletterTitle}
              </h3>

              <p className="mt-3 text-sm text-[#D3CEC4] leading-relaxed">
                {settings.newsletterSubtitle}
              </p>

              {/* Quick perks */}
              <ul className="mt-4 space-y-2 text-xs text-[#9C968B]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E06D53] shrink-0" />
                  <span>Curated deep-dives on design engineering & typography</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E06D53] shrink-0" />
                  <span>No algorithmic noise, tracking ads, or spam. Unsubscribe anytime.</span>
                </li>
              </ul>
            </div>

            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="mt-6 space-y-3">
              <div>
                <input
                  id="hero-sub-name"
                  type="text"
                  placeholder="Your first name (optional)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-[#9C968B] text-sm focus:outline-hidden focus:border-[#E06D53] focus:bg-white/15 transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="hero-sub-email"
                  type="email"
                  required
                  placeholder="Enter your work or personal email..."
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-[#9C968B] text-sm focus:outline-hidden focus:border-[#E06D53] focus:bg-white/15 transition-all"
                />
                <button
                  id="hero-sub-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#D44D2E] hover:bg-[#B83C1F] text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Joining...' : 'Subscribe'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    statusMessage.isError
                      ? 'bg-red-950/80 text-red-200 border border-red-800'
                      : 'bg-emerald-950/80 text-emerald-200 border border-emerald-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#9C968B] pt-1">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#E06D53]" />
                  {totalSubscribersCount.toLocaleString()}+ readers enrolled
                </span>
                <span>Delivered every Sunday 8:00 AM EST</span>
              </div>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
