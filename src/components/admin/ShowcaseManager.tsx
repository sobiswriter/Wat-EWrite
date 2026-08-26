import React, { useState } from 'react';
import { useBlog } from '../../context/BlogContext';
import { Post, MetricItem } from '../../types';
import {
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Sliders,
  HelpCircle,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

export const ShowcaseManager: React.FC<{ onViewLivePost?: (post: Post) => void }> = ({ onViewLivePost }) => {
  const { posts, settings, updateSettings } = useBlog();

  const MAX_SHOWCASE_COUNT = 5;
  const publishedPosts = posts.filter(p => !p.isDraft);

  const [volume, setVolume] = useState(settings.volume || 'Vol. IV');
  const [issue, setIssue] = useState(settings.issue || 'Issue #48');
  const [journalSeason, setJournalSeason] = useState(settings.journalSeason || 'Autumn 2026 Journal');
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle || "Where Thoughtful Software Meets Timeless Craft.");
  const [heroSubtitle, setHeroSubtitle] = useState(
    settings.heroSubtitle ||
      'An independent digital journal dedicated to human-computer interaction, spatial tools, optical typography, and zero-bloat architecture.'
  );

  // Selected featured post IDs for top showcase accordion (strictly validated against published posts, max 5)
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>(() => {
    const rawList = settings.featuredPostIds && settings.featuredPostIds.length > 0
      ? settings.featuredPostIds
      : publishedPosts.slice(0, MAX_SHOWCASE_COUNT).map(p => p.id);
    const valid = rawList.filter(id => publishedPosts.some(p => p.id === id));
    return valid.length > 0
      ? valid.slice(0, MAX_SHOWCASE_COUNT)
      : publishedPosts.slice(0, MAX_SHOWCASE_COUNT).map(p => p.id);
  });

  // Validated active posts in current sequence
  const activeShowcasePosts = selectedPostIds
    .map(id => publishedPosts.find(p => p.id === id))
    .filter((p): p is Post => !!p)
    .slice(0, MAX_SHOWCASE_COUNT);

  const [metrics, setMetrics] = useState<MetricItem[]>(() => {
    return settings.metrics && settings.metrics.length > 0
      ? settings.metrics
      : [
          { value: '5,200+', label: 'Sunday Dispatch Readers' },
          { value: '0 Trackers', label: 'Pure Content Privacy' },
          { value: '100/100', label: 'Lighthouse Performance' },
          { value: 'GSAP + React', label: 'Fluid Interactive Motion' }
        ];
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Move post up in accordion list
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const currentIds = activeShowcasePosts.map(p => p.id);
    const next = [...currentIds];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    setSelectedPostIds(next);
  };

  // Move post down in accordion list
  const handleMoveDown = (index: number) => {
    const currentIds = activeShowcasePosts.map(p => p.id);
    if (index >= currentIds.length - 1) return;
    const next = [...currentIds];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    setSelectedPostIds(next);
  };

  // Remove from showcase
  const handleRemovePost = (id: string) => {
    setSelectedPostIds(prev => prev.filter(pid => pid !== id));
  };

  // Add post to showcase
  const handleAddPost = (id: string) => {
    const currentIds = activeShowcasePosts.map(p => p.id);
    if (currentIds.includes(id)) return;
    if (currentIds.length >= MAX_SHOWCASE_COUNT) {
      alert(`The Top Stories Accordion Showcase can display at most ${MAX_SHOWCASE_COUNT} stories at a time.`);
      return;
    }
    setSelectedPostIds([...currentIds, id]);
  };

  // Metrics handlers
  const handleMetricChange = (index: number, field: 'value' | 'label', val: string) => {
    const updated = [...metrics];
    updated[index][field] = val;
    setMetrics(updated);
  };

  const handleAddMetric = () => {
    if (metrics.length >= 6) return;
    setMetrics([...metrics, { value: 'New Metric', label: 'Description' }]);
  };

  const handleRemoveMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const handleSaveShowcase = () => {
    const cleanIds = activeShowcasePosts.map(p => p.id);
    updateSettings({
      volume,
      issue,
      journalSeason,
      heroTitle,
      heroSubtitle,
      featuredPostIds: cleanIds,
      metrics
    });
    setSelectedPostIds(cleanIds);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F3F1EC] text-[#D44D2E] text-xs font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Landing Engine</span>
          </div>
          <h2 className="text-2xl font-bold font-sans text-[#111111] tracking-tight">
            Top Stories & Hero Showcase
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Curate and arrange the 3D Accordion Gallery, hero typography, issue numbers, and live statistics.
          </p>
        </div>

        <button
          onClick={handleSaveShowcase}
          className="px-5 py-2.5 bg-[#D44D2E] hover:bg-[#B83C1F] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Showcase Saved!</span>
            </>
          ) : (
            <>
              <Sliders className="w-4 h-4" />
              <span>Save Showcase Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Headline & Issue Metadata */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-6">
        <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2 border-b border-[#E5E2DC] pb-3">
          <Sliders className="w-4 h-4 text-[#D44D2E]" />
          <span>Hero Masthead & Issue Metadata</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1.5">
              Volume Tag
            </label>
            <input
              type="text"
              value={volume}
              onChange={e => setVolume(e.target.value)}
              placeholder="e.g. Vol. IV"
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs font-mono text-[#111111] focus:outline-hidden focus:border-[#111111]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1.5">
              Journal Season / Date
            </label>
            <input
              type="text"
              value={journalSeason}
              onChange={e => setJournalSeason(e.target.value)}
              placeholder="e.g. Autumn 2026 Journal"
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1.5">
              Issue Number
            </label>
            <input
              type="text"
              value={issue}
              onChange={e => setIssue(e.target.value)}
              placeholder="e.g. Issue #48"
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs font-mono text-[#111111] focus:outline-hidden focus:border-[#111111]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#444444] mb-1.5">
            Hero Primary Headline
          </label>
          <input
            type="text"
            value={heroTitle}
            onChange={e => setHeroTitle(e.target.value)}
            placeholder="Where Thoughtful Software Meets Timeless Craft."
            className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-sm font-semibold text-[#111111] focus:outline-hidden focus:border-[#111111]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#444444] mb-1.5">
            Hero Subtitle / Description
          </label>
          <textarea
            rows={2}
            value={heroSubtitle}
            onChange={e => setHeroSubtitle(e.target.value)}
            placeholder="A short, elegant description of the publication's scope."
            className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] leading-relaxed focus:outline-hidden focus:border-[#111111]"
          />
        </div>
      </div>

      {/* Accordion Gallery Curated Top Stories */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E2DC] pb-3">
          <div>
            <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D44D2E]" />
              <span>Curated Accordion Gallery Stories ({activeShowcasePosts.length}/{MAX_SHOWCASE_COUNT})</span>
            </h3>
            <p className="text-xs text-[#777777] mt-0.5">
              These essays appear inside the GSAP 3D interactive panels on the landing page in this exact order (max {MAX_SHOWCASE_COUNT} displayable stories).
            </p>
          </div>
          {activeShowcasePosts.length >= MAX_SHOWCASE_COUNT && (
            <span className="text-[11px] font-mono font-semibold text-[#D44D2E] bg-[#FDF2F0] border border-[#FADCD5] px-2.5 py-1 rounded-md self-start sm:self-center">
              Maximum {MAX_SHOWCASE_COUNT}/{MAX_SHOWCASE_COUNT} Reached
            </span>
          )}
        </div>

        {/* Current Active List */}
        <div className="space-y-3">
          {activeShowcasePosts.length === 0 ? (
            <div className="p-8 text-center bg-[#F9F8F6] border border-dashed border-[#E5E2DC] rounded-xl">
              <Layers className="w-8 h-8 text-[#999999] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-[#444444]">No stories selected for the showcase</p>
              <p className="text-[11px] text-[#777777] mt-1">Select up to {MAX_SHOWCASE_COUNT} published essays below to display them on the homepage.</p>
            </div>
          ) : (
            activeShowcasePosts.map((post, index) => (
              <div
                key={post.id}
                className="flex items-center justify-between gap-4 p-3.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl hover:border-[#CCCCCC] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-[#111111] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">
                    {index + 1}
                  </span>
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-12 h-12 rounded-lg object-cover border border-[#E5E2DC] shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D44D2E] block">
                      {post.category}
                    </span>
                    <h4 className="text-xs font-bold text-[#111111] truncate">
                      {post.title}
                    </h4>
                    <p className="text-[11px] text-[#777777] truncate">
                      {post.subtitle || post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="Move panel left / up"
                    className="p-1.5 bg-white border border-[#E5E2DC] hover:border-[#111111] disabled:opacity-30 rounded-md text-xs cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-[#555555]" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === activeShowcasePosts.length - 1}
                    title="Move panel right / down"
                    className="p-1.5 bg-white border border-[#E5E2DC] hover:border-[#111111] disabled:opacity-30 rounded-md text-xs cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-[#555555]" />
                  </button>
                  <button
                    onClick={() => handleRemovePost(post.id)}
                    title="Remove from showcase"
                    className="p-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-md text-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add more stories to showcase */}
        <div className="pt-4 border-t border-[#E5E2DC]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-[#444444]">
              Add from Published Essays:
            </h4>
            <span className="text-[11px] text-[#888888] font-mono">
              {activeShowcasePosts.length >= MAX_SHOWCASE_COUNT
                ? `Limit reached (${MAX_SHOWCASE_COUNT}/${MAX_SHOWCASE_COUNT})`
                : `${MAX_SHOWCASE_COUNT - activeShowcasePosts.length} slot${MAX_SHOWCASE_COUNT - activeShowcasePosts.length === 1 ? '' : 's'} available`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {publishedPosts
              .filter(p => !activeShowcasePosts.some(active => active.id === p.id))
              .map(post => {
                const isFull = activeShowcasePosts.length >= MAX_SHOWCASE_COUNT;
                return (
                  <div
                    key={post.id}
                    className="flex items-center justify-between gap-2 p-2.5 bg-[#FFFFFF] border border-[#E5E2DC] rounded-lg text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#111111] truncate">{post.title}</p>
                      <p className="text-[10px] text-[#777777]">{post.category} • {post.readingTime} min</p>
                    </div>
                    <button
                      onClick={() => handleAddPost(post.id)}
                      disabled={isFull}
                      title={isFull ? `Maximum ${MAX_SHOWCASE_COUNT} stories reached` : 'Add to showcase'}
                      className="px-2.5 py-1 bg-[#111111] hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-[#111111] disabled:cursor-not-allowed text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer shrink-0 transition-opacity"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Performance Ticker Metrics */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E2DC] pb-3">
          <div>
            <h3 className="font-bold text-sm text-[#111111]">
              Performance & Craft Ticker Metrics
            </h3>
            <p className="text-xs text-[#777777]">
              The 4 stat blocks displayed underneath the Accordion Gallery.
            </p>
          </div>
          <button
            onClick={handleAddMetric}
            disabled={metrics.length >= 6}
            className="px-3 py-1.5 bg-[#F3F1EC] hover:bg-[#E5E2DC] text-[#111111] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stat</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl space-y-2 relative group"
            >
              <button
                onClick={() => handleRemoveMetric(idx)}
                className="absolute top-2 right-2 p-1 text-[#999999] hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete metric"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div>
                <label className="text-[10px] font-semibold text-[#666666] block">
                  Metric Value
                </label>
                <input
                  type="text"
                  value={metric.value}
                  onChange={e => handleMetricChange(idx, 'value', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2DC] rounded-md font-mono text-sm font-bold text-[#111111] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#666666] block">
                  Label / Description
                </label>
                <input
                  type="text"
                  value={metric.label}
                  onChange={e => handleMetricChange(idx, 'label', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2DC] rounded-md text-xs text-[#555555] focus:outline-hidden"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
