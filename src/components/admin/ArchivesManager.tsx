import React, { useState } from 'react';
import { useBlog } from '../../context/BlogContext';
import { Post } from '../../types';
import {
  Archive,
  Calendar,
  Eye,
  Star,
  Download,
  FileText,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ArchivesManager: React.FC<{
  onEditPost: (post: Post) => void;
  onViewLive: (post: Post) => void;
}> = ({ onEditPost, onViewLive }) => {
  const { posts, togglePostFeatured, togglePostDraft, deletePost } = useBlog();
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Filter posts
  const filtered = posts.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (selectedYear !== 'all') {
      const year = new Date(p.publishedAt).getFullYear().toString();
      return year === selectedYear;
    }

    return true;
  });

  // Group by Year & Month
  const groupedByYear: { [year: string]: Post[] } = {};
  filtered.forEach(p => {
    const year = new Date(p.publishedAt).getFullYear().toString();
    if (!groupedByYear[year]) groupedByYear[year] = [];
    groupedByYear[year].push(p);
  });

  const availableYears = Array.from(
    new Set(posts.map(p => new Date(p.publishedAt).getFullYear().toString()))
  ).sort((a, b) => Number(b) - Number(a));

  // Export all posts as JSON backup
  const handleExportArchiveJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `watewrites_archive_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F3F1EC] text-[#D44D2E] text-xs font-mono font-semibold mb-2">
            <Archive className="w-3.5 h-3.5" />
            <span>Chronological Archives & Registry</span>
          </div>
          <h2 className="text-2xl font-bold font-sans text-[#111111] tracking-tight">
            Essays Archive & Timeline
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Browse, manage, and audit historical publications chronologically by year and publication cycle.
          </p>
        </div>

        <button
          onClick={handleExportArchiveJSON}
          className="px-4 py-2 bg-white border border-[#E5E2DC] hover:border-[#111111] text-[#111111] rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-[#D44D2E]" />
          <span>Export Archive JSON</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E5E2DC] shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search archive by title or category..."
            className="w-full pl-9 pr-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[#666666] shrink-0">Filter Year:</span>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] font-semibold focus:outline-hidden"
          >
            <option value="all">All Years ({posts.length})</option>
            {availableYears.map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chronological Year Groups */}
      <div className="space-y-6">
        {Object.keys(groupedByYear).length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#E5E2DC] rounded-xl">
            <p className="text-sm text-[#777777]">No essays found matching your archive filter.</p>
          </div>
        ) : (
          Object.entries(groupedByYear)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .map(([year, yearPosts]) => (
              <div key={year} className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E2DC] pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#D44D2E]" />
                    <h3 className="font-mono text-lg font-bold text-[#111111]">
                      {year}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#777777] bg-[#F3F1EC] px-2.5 py-1 rounded">
                    {yearPosts.length} {yearPosts.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                <div className="divide-y divide-[#F0ECE1]">
                  {yearPosts.map(post => {
                    const dateFormatted = new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    });

                    return (
                      <div
                        key={post.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FDFCFB] px-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <span className="font-mono text-xs text-[#888888] w-14 shrink-0">
                            {dateFormatted}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D44D2E]">
                                {post.category}
                              </span>
                              {post.isDraft && (
                                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-bold uppercase">
                                  Draft
                                </span>
                              )}
                              {post.isFeatured && (
                                <span className="px-1.5 py-0.2 bg-[#111111] text-white rounded text-[9px] font-bold uppercase">
                                  Featured
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-[#111111] truncate mt-0.5">
                              {post.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => togglePostFeatured(post.id)}
                            className={`p-1.5 rounded-md border text-xs cursor-pointer ${
                              post.isFeatured
                                ? 'bg-amber-50 border-amber-300 text-amber-600'
                                : 'bg-white border-[#E5E2DC] text-[#888888]'
                            }`}
                            title={post.isFeatured ? 'Featured Story' : 'Mark as Featured'}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => togglePostDraft(post.id)}
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                              post.isDraft
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {post.isDraft ? 'Draft' : 'Live'}
                          </button>

                          <button
                            onClick={() => onEditPost(post)}
                            className="px-3 py-1 bg-[#111111] hover:bg-[#333333] text-white rounded-md text-xs font-medium cursor-pointer"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => onViewLive(post)}
                            className="p-1.5 bg-white border border-[#E5E2DC] hover:border-[#111111] text-[#555555] rounded-md text-xs cursor-pointer"
                            title="View Live Article"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        )}
      </div>

    </div>
  );
};
