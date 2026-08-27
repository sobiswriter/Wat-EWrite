import React, { useState, useRef, useEffect } from 'react';
import { useBlog } from '../../context/BlogContext';
import { Post } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Upload,
  Sparkles,
  CheckCircle2,
  Eye,
  Edit3,
  Columns,
  Maximize2,
  Minimize2,
  Trash2,
  RefreshCw,
  Sliders,
  FileText,
  HelpCircle,
  Type,
  AlignLeft,
  ChevronDown,
  Info,
  Layers,
  Star,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WritingDeskProps {
  initialPost?: Post | null;
  onPostSaved?: (post: Post) => void;
  onViewLive?: (post: Post) => void;
}

const COVER_PRESETS = [
  { label: 'Minimal Workspace', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Editorial Typewriter', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Architectural Shadow', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Paper & Ink', url: 'https://images.unsplash.com/photo-1507842229458-577749e472e3?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Mechanical Device', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80' }
];

export const WritingDesk: React.FC<WritingDeskProps> = ({
  initialPost,
  onPostSaved,
  onViewLive
}) => {
  const { posts, settings, createPost, updatePost } = useBlog();

  const [editingId, setEditingId] = useState<string | null>(initialPost?.id || null);
  const [title, setTitle] = useState(initialPost?.title || '');
  const [subtitle, setSubtitle] = useState(initialPost?.subtitle || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState(
    initialPost?.content ||
      `# Introduction\n\nBegin writing your essay here. You can use the formatting bar above to apply **bold**, *italic*, headings, or insert desktop images.\n\n## Core Idea\n\n> Exceptional tools disappear into human attention, leaving only the clarity of pure thought.\n\n- Point one\n- Point two\n- Point three\n`
  );
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || COVER_PRESETS[0].url);
  const [category, setCategory] = useState(initialPost?.category || (settings.categories?.[0] || 'Design Philosophy'));
  const [tags, setTags] = useState(initialPost?.tags?.join(', ') || 'Craft, Typography, Systems');
  const [isFeatured, setIsFeatured] = useState(initialPost?.isFeatured || false);
  const [isDraft, setIsDraft] = useState(initialPost?.isDraft ?? false);
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialPost?.seoDescription || '');

  // UI preferences
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  // Sync if initialPost changes
  useEffect(() => {
    if (initialPost) {
      setEditingId(initialPost.id);
      setTitle(initialPost.title);
      setSubtitle(initialPost.subtitle || '');
      setExcerpt(initialPost.excerpt);
      setContent(initialPost.content);
      setCoverImage(initialPost.coverImage);
      setCategory(initialPost.category);
      setTags(initialPost.tags.join(', '));
      setIsFeatured(initialPost.isFeatured);
      setIsDraft(initialPost.isDraft);
      setSlug(initialPost.slug);
      setSeoTitle(initialPost.seoTitle || '');
      setSeoDescription(initialPost.seoDescription || '');
    } else {
      setEditingId(null);
      setTitle('');
      setSubtitle('');
      setExcerpt('');
      setContent('');
      setCoverImage(COVER_PRESETS[0].url);
      setCategory(settings.categories?.[0] || 'Design Philosophy');
      setTags('');
      setIsFeatured(false);
      setIsDraft(false);
      setSlug('');
      setSeoTitle('');
      setSeoDescription('');
    }
  }, [initialPost, settings.categories]);

  // Statistics
  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;
  const paragraphCount = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));

  const availableCategories = settings.categories || [
    'Design Philosophy',
    'Notion HQ',
    'Engineering',
    'Writing & Thought',
    'Typography',
    'Tech'
  ];

  // Helper to insert markdown around selected text or cursor
  const insertFormatting = (before: string, after: string = '', defaultText: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);
    const textToInsert = selectedText || defaultText;
    const replacement = `${before}${textToInsert}${after}`;

    const newContent = previousText.substring(0, start) + replacement + previousText.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selectedText ? selectedText.length : defaultText.length)
      );
    }, 10);
  };

  // Insert block at current line
  const insertBlock = (prefix: string, defaultText: string = 'Sample text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const previousText = textarea.value;

    // Find start of current line
    const lastNewline = previousText.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const beforeLine = previousText.substring(0, lineStart);
    const afterLine = previousText.substring(lineStart);

    const newContent = `${beforeLine}${prefix}${afterLine.length > 0 ? '' : defaultText + '\n'}${afterLine}`;
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
    }, 10);
  };

  // Keyboard shortcut handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const mod = isMac ? e.metaKey : e.ctrlKey;

    if (mod && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      insertFormatting('**', '**', 'bold text');
    } else if (mod && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      insertFormatting('*', '*', 'italic text');
    } else if (mod && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      insertFormatting('<u>', '</u>', 'underlined text');
    } else if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const sel = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        setLinkText(sel || 'Link text');
        setLinkUrl('https://');
        setShowLinkModal(true);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Cover Desktop File Upload
  const handleCoverFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCoverImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Inline Image from Desktop Upload
  const handleInlineImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        const altName = file.name.replace(/\.[^/.]+$/, '');
        insertFormatting(`\n\n![${altName}](`, `${dataUrl})\n*${altName}*\n\n`, '');
      }
    };
    reader.readAsDataURL(file);
  };

  // Drop on cover container
  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCoverFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Drop on editor canvas
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCanvas(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleInlineImageUpload(e.dataTransfer.files[0]);
    }
  };

  // AI Helpers
  const handleGenerateExcerpt = () => {
    if (!content) return;
    const cleanLines = content
      .replace(/#+\s+/g, '')
      .replace(/>\s+/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 25);

    if (cleanLines.length > 0) {
      setExcerpt(cleanLines[0].substring(0, 160) + '...');
    }
  };

  const handleSuggestHeadlines = () => {
    const base = title.trim() || 'Software Craft & Human Attention';
    const suggestions = [
      `The Art of ${base}`,
      `Why ${base} Defines Modern Engineering`,
      `Rethinking ${base}: An Optical Perspective`,
      `Notes on ${base}: Subtraction, Speed & Dignity`,
      `The Architecture of ${base}`
    ];
    const picked = suggestions[Math.floor(Math.random() * suggestions.length)];
    setTitle(picked);
  };

  // Insert custom link
  const handleConfirmLink = () => {
    if (!linkUrl) {
      setShowLinkModal(false);
      return;
    }
    insertFormatting(`[${linkText || 'Link'}](${linkUrl})`, '', '');
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
  };

  // Insert markdown table
  const handleInsertTable = () => {
    const tableTemplate = `\n\n| Feature | Subtraction Focus | Outcome |\n| :--- | :--- | :--- |\n| UI Chrome | Eliminated redundant toolbars | +40% writing canvas |\n| Performance | Zero external dependencies | 60 FPS baseline |\n\n`;
    insertFormatting(tableTemplate, '', '');
  };

  // Save or Publish
  const handleSave = (publishMode?: 'draft' | 'published') => {
    if (!title.trim()) {
      alert('Please enter a title for your essay before saving.');
      return;
    }

    const draftState = publishMode ? publishMode === 'draft' : isDraft;
    const tagsArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const generatedSlug = slug.trim()
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const finalExcerpt = excerpt.trim() || subtitle.trim() || title.trim();

    if (editingId) {
      updatePost(editingId, {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        excerpt: finalExcerpt,
        content,
        coverImage: coverImage || COVER_PRESETS[0].url,
        category,
        tags: tagsArray.length > 0 ? tagsArray : ['General'],
        isFeatured,
        isDraft: draftState,
        slug: generatedSlug,
        seoTitle: seoTitle.trim() || `${title.trim()} — ${settings.blogName}`,
        seoDescription: seoDescription.trim() || finalExcerpt,
        readingTime,
        author: {
          name: settings.authorName,
          avatar: settings.authorAvatar,
          role: settings.authorRole
        },
        updatedAt: new Date().toISOString()
      });

      const updatedPost = posts.find(p => p.id === editingId);
      if (updatedPost && onPostSaved) onPostSaved({ ...updatedPost, title, content, isDraft: draftState });
      setSaveToast(draftState ? 'Saved as draft!' : 'Essay updated and live!');
    } else {
      const newPost = createPost({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        excerpt: finalExcerpt,
        content,
        coverImage: coverImage || COVER_PRESETS[0].url,
        category,
        tags: tagsArray.length > 0 ? tagsArray : ['General'],
        isFeatured,
        isDraft: draftState,
        slug: generatedSlug,
        seoTitle: seoTitle.trim() || `${title.trim()} — ${settings.blogName}`,
        seoDescription: seoDescription.trim() || finalExcerpt,
        readingTime,
        publishedAt: new Date().toISOString(),
        author: {
          name: settings.authorName,
          avatar: settings.authorAvatar,
          role: settings.authorRole
        }
      });
      setEditingId(newPost.id);
      if (onPostSaved) onPostSaved(newPost);
      setSaveToast(draftState ? 'Draft created!' : 'New essay published to the world!');
      if (!draftState) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }

    setTimeout(() => setSaveToast(null), 3500);
  };

  const getFontFamilyClass = () => {
    if (fontFamily === 'serif') return 'font-serif';
    if (fontFamily === 'mono') return 'font-mono';
    return 'font-sans';
  };

  const getFontSizeClass = () => {
    if (fontSize === 'sm') return 'text-xs sm:text-sm';
    if (fontSize === 'lg') return 'text-base sm:text-lg';
    return 'text-sm sm:text-base';
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      
      {/* 1. TOP STATUS & MASTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E2DC]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#111111] text-white shadow-xs">
            <Edit3 className="w-5 h-5 text-[#D44D2E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-sans text-[#111111] tracking-tight">
                {editingId ? 'Editing Publication' : 'Writing Desk • New Essay'}
              </h2>
              {isDraft ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                  Draft
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Publication
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[#777777] font-mono mt-0.5">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
              <span>•</span>
              <span>{paragraphCount} paragraphs</span>
              <span>•</span>
              <span>~{readingTime} min read</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-white border border-[#E5E2DC] rounded-xl p-1 text-xs shadow-2xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'split' ? 'bg-[#111111] text-white shadow-xs' : 'text-[#666666] hover:text-[#111111]'
              }`}
              title="Split Write & Preview"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'edit' ? 'bg-[#111111] text-white shadow-xs' : 'text-[#666666] hover:text-[#111111]'
              }`}
              title="Full Focus Writing Canvas"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'preview' ? 'bg-[#111111] text-white shadow-xs' : 'text-[#666666] hover:text-[#111111]'
              }`}
              title="Full Article Live Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            onClick={() => handleSave('draft')}
            className="px-3.5 py-2 bg-white hover:bg-[#F3F1EC] border border-[#E5E2DC] text-[#333333] rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave('published')}
            className="px-5 py-2 bg-[#D44D2E] hover:bg-[#B83C1F] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{editingId ? 'Save & Update' : 'Publish Essay'}</span>
          </button>
        </div>
      </div>

      {/* Save Notification Banner */}
      {saveToast && (
        <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 2. METADATA & DESKTOP COVER IMAGE UPLOADER */}
      <div className="bg-white border border-[#E5E2DC] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
        
        {/* Title & Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#444444]">
                Essay Headline
              </label>
              <button
                type="button"
                onClick={handleSuggestHeadlines}
                className="text-[11px] text-[#D44D2E] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Headline Idea</span>
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Crafting Timeless Typography Systems on the Web..."
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl text-base sm:text-lg font-bold text-[#111111] focus:outline-hidden focus:border-[#111111] transition-colors"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#444444]">
              Publication Topic
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-3 bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl text-xs font-bold text-[#111111] focus:outline-hidden focus:border-[#111111] cursor-pointer"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lead Excerpt & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#444444]">
                Lead Excerpt / Subtitle
              </label>
              <button
                type="button"
                onClick={handleGenerateExcerpt}
                className="text-[11px] text-[#D44D2E] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-generate from text</span>
              </button>
            </div>
            <input
              type="text"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="A concise, captivating sentence explaining the core thesis..."
              className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl text-xs text-[#111111] focus:outline-hidden focus:border-[#111111] transition-colors"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#444444]">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. Design, Systems, Code"
              className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl text-xs text-[#111111] focus:outline-hidden focus:border-[#111111] transition-colors"
            />
          </div>
        </div>

        {/* COVER IMAGE: DESKTOP UPLOADER + PREVIEW */}
        <div className="pt-2 border-t border-[#E5E2DC]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#444444] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#D44D2E]" />
              <span>Cover Image</span>
            </label>
            <div className="flex flex-wrap items-center gap-1 text-[11px] text-[#777777]">
              <span>Presets:</span>
              {COVER_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className="px-2 py-0.5 bg-[#F3F1EC] hover:bg-[#E5E2DC] text-[#111111] rounded text-[10px] cursor-pointer transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            
            {/* Desktop Drag-and-Drop / Browse Box */}
            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDraggingCover(true);
              }}
              onDragLeave={() => setIsDraggingCover(false)}
              onDrop={handleCoverDrop}
              className={`md:col-span-7 border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                isDraggingCover
                  ? 'border-[#D44D2E] bg-[#FDF2F0]'
                  : 'border-[#E5E2DC] hover:border-[#111111] bg-[#F9F8F6]'
              }`}
              onClick={() => coverFileInputRef.current?.click()}
            >
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleCoverFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-full bg-white border border-[#E5E2DC] flex items-center justify-center text-[#111111] mb-2 shadow-2xs">
                <Upload className="w-5 h-5 text-[#D44D2E]" />
              </div>
              <p className="text-xs font-bold text-[#111111]">
                Import Cover Image from Desktop
              </p>
              <p className="text-[11px] text-[#777777] mt-0.5">
                Drag and drop any image file here, or click to browse files
              </p>
            </div>

            {/* Live Cover Preview or URL input */}
            <div className="md:col-span-5 space-y-2">
              {coverImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-[#E5E2DC] bg-[#111111] aspect-video">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-white text-[#111111] rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-28 rounded-xl border border-dashed border-[#E5E2DC] flex items-center justify-center text-xs text-[#999999]">
                  No cover image selected
                </div>
              )}

              <input
                type="text"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="Or paste an image URL (https://...)"
                className="w-full px-3 py-1.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-[11px] font-mono text-[#111111] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Toggles & Showcase Settings */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E5E2DC] text-xs">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-[#D44D2E] focus:ring-0 cursor-pointer"
              />
              <span className="font-bold text-[#111111] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Feature in Top Accordion Gallery</span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDraft}
                onChange={e => setIsDraft(e.target.checked)}
                className="w-4 h-4 rounded text-[#D44D2E] focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-[#555555]">Save as Unpublished Draft</span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[11px] text-[#777777] hover:text-[#111111] flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Sliders className="w-3 h-3" />
            <span>{showAdvanced ? 'Hide SEO & Slug' : 'Customize SEO & Slug'}</span>
          </button>
        </div>

        {/* Advanced SEO & Custom Slug Drawer */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-dashed border-[#E5E2DC] bg-[#F9F8F6] p-4 rounded-xl">
            <div>
              <label className="block text-[11px] font-bold text-[#444444] mb-1">
                Custom URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="custom-article-slug"
                className="w-full px-3 py-1.5 bg-white border border-[#E5E2DC] rounded-lg text-xs font-mono text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#444444] mb-1">
                Custom SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={e => setSeoTitle(e.target.value)}
                placeholder="Title for Google Search..."
                className="w-full px-3 py-1.5 bg-white border border-[#E5E2DC] rounded-lg text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#444444] mb-1">
                SEO Meta Description
              </label>
              <input
                type="text"
                value={seoDescription}
                onChange={e => setSeoDescription(e.target.value)}
                placeholder="150 character search snippet..."
                className="w-full px-3 py-1.5 bg-white border border-[#E5E2DC] rounded-lg text-xs text-[#111111]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. MS WORD-LIKE VISIBLE & FLUENT FORMATTING RIBBON */}
      <div className="sticky top-0 z-20 bg-white border border-[#E5E2DC] rounded-2xl p-2 sm:p-2.5 shadow-md space-y-2">
        
        {/* Upper Ribbon: Typography, Structure, Insertions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          {/* Group 1: Headings & Hierarchy */}
          <div className="flex items-center gap-1 bg-[#F9F8F6] p-1 rounded-xl border border-[#E5E2DC]">
            <button
              type="button"
              onClick={() => insertBlock('# ', 'Heading 1 Title')}
              className="px-2.5 py-1.5 hover:bg-white rounded-lg text-xs font-bold text-[#111111] flex items-center gap-1 cursor-pointer transition-colors"
              title="Heading 1 (Main Section Title)"
            >
              <Heading1 className="w-3.5 h-3.5 text-[#D44D2E]" />
              <span>H1</span>
            </button>
            <button
              type="button"
              onClick={() => insertBlock('## ', 'Heading 2 Subtitle')}
              className="px-2.5 py-1.5 hover:bg-white rounded-lg text-xs font-bold text-[#111111] flex items-center gap-1 cursor-pointer transition-colors"
              title="Heading 2 (Sub-section)"
            >
              <Heading2 className="w-3.5 h-3.5 text-[#D44D2E]" />
              <span>H2</span>
            </button>
            <button
              type="button"
              onClick={() => insertBlock('### ', 'Heading 3 Subsection')}
              className="px-2.5 py-1.5 hover:bg-white rounded-lg text-xs font-bold text-[#111111] flex items-center gap-1 cursor-pointer transition-colors"
              title="Heading 3 (Minor Topic)"
            >
              <Heading3 className="w-3.5 h-3.5 text-[#D44D2E]" />
              <span>H3</span>
            </button>
          </div>

          {/* Group 2: Word-style Inline Text Formatting */}
          <div className="flex items-center gap-0.5 bg-[#F9F8F6] p-1 rounded-xl border border-[#E5E2DC]">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'bold text')}
              className="p-2 hover:bg-white rounded-lg text-[#111111] font-bold cursor-pointer transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'italic text')}
              className="p-2 hover:bg-white rounded-lg text-[#111111] italic cursor-pointer transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('<u>', '</u>', 'underlined text')}
              className="p-2 hover:bg-white rounded-lg text-[#111111] cursor-pointer transition-colors"
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('~~', '~~', 'strikethrough text')}
              className="p-2 hover:bg-white rounded-lg text-[#555555] cursor-pointer transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`', 'inlineCode')}
              className="p-2 hover:bg-white rounded-lg font-mono text-xs text-[#555555] cursor-pointer transition-colors"
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Group 3: Lists & Blocks */}
          <div className="flex items-center gap-0.5 bg-[#F9F8F6] p-1 rounded-xl border border-[#E5E2DC]">
            <button
              type="button"
              onClick={() => insertBlock('- ', 'Bullet item')}
              className="p-2 hover:bg-white rounded-lg text-[#333333] cursor-pointer transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertBlock('1. ', 'Numbered item')}
              className="p-2 hover:bg-white rounded-lg text-[#333333] cursor-pointer transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertBlock('- [ ] ', 'Task checklist item')}
              className="p-2 hover:bg-white rounded-lg text-[#333333] cursor-pointer transition-colors"
              title="Task Checklist"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertBlock('> ', 'Notable quotation or pull-quote')}
              className="p-2 hover:bg-white rounded-lg text-[#333333] cursor-pointer transition-colors"
              title="Pull Quote (> quote)"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertBlock('> 💡 **Key Takeaway:** ', 'State your key insight here.')}
              className="px-2 py-1.5 hover:bg-white rounded-lg text-xs font-semibold text-[#111111] flex items-center gap-1 cursor-pointer transition-colors"
              title="Insert Callout Box"
            >
              <span>💡 Callout</span>
            </button>
          </div>

          {/* Group 4: Insert Media, Tables, Links & Desktop Images */}
          <div className="flex items-center gap-1 bg-[#F9F8F6] p-1 rounded-xl border border-[#E5E2DC]">
            
            {/* Desktop Image File Picker */}
            <input
              ref={inlineImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleInlineImageUpload(e.target.files[0]);
                }
              }}
            />
            <button
              type="button"
              onClick={() => inlineImageInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-[#111111] hover:bg-[#333333] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              title="Insert Image from Desktop directly into essay"
            >
              <Upload className="w-3.5 h-3.5 text-[#D44D2E]" />
              <span>Upload Image</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const textarea = textareaRef.current;
                const sel = textarea ? textarea.value.substring(textarea.selectionStart, textarea.selectionEnd) : '';
                setLinkText(sel || 'Link text');
                setLinkUrl('https://');
                setShowLinkModal(true);
              }}
              className="p-2 hover:bg-white rounded-lg text-[#333333] cursor-pointer transition-colors"
              title="Insert Hyperlink (Ctrl+K)"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleInsertTable}
              className="p-2 hover:bg-white rounded-lg text-[#333333] cursor-pointer transition-colors"
              title="Insert Table Grid"
            >
              <TableIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => insertFormatting('\n```typescript\n', '\n```\n', '// Code snippet here\n')}
              className="p-2 hover:bg-white rounded-lg text-[#333333] cursor-pointer transition-colors"
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => insertFormatting('\n---\n\n', '', '')}
              className="px-2 py-1.5 hover:bg-white rounded-lg text-xs font-mono text-[#555555] cursor-pointer transition-colors"
              title="Horizontal Divider"
            >
              ───
            </button>
          </div>

          {/* Group 5: Typography Preferences */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setFontFamily('sans')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                  fontFamily === 'sans' ? 'bg-white shadow-2xs text-[#111111] font-bold' : 'text-[#777777]'
                }`}
              >
                Sans
              </button>
              <button
                type="button"
                onClick={() => setFontFamily('serif')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium font-serif cursor-pointer ${
                  fontFamily === 'serif' ? 'bg-white shadow-2xs text-[#111111] font-bold' : 'text-[#777777]'
                }`}
              >
                Serif
              </button>
              <button
                type="button"
                onClick={() => setFontFamily('mono')}
                className={`px-2 py-1 rounded-md text-[11px] font-mono cursor-pointer ${
                  fontFamily === 'mono' ? 'bg-white shadow-2xs text-[#111111] font-bold' : 'text-[#777777]'
                }`}
              >
                Mono
              </button>
            </div>

            <div className="flex items-center bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 rounded-md text-[10px] cursor-pointer ${
                  fontSize === 'sm' ? 'bg-white shadow-2xs font-bold text-[#111111]' : 'text-[#777777]'
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('base')}
                className={`px-2 py-1 rounded-md text-xs cursor-pointer ${
                  fontSize === 'base' ? 'bg-white shadow-2xs font-bold text-[#111111]' : 'text-[#777777]'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 rounded-md text-sm cursor-pointer ${
                  fontSize === 'lg' ? 'bg-white shadow-2xs font-bold text-[#111111]' : 'text-[#777777]'
                }`}
              >
                A+
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. MAIN WRITING & LIVE PREVIEW CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Writing Editor Pane */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDraggingCanvas(true);
            }}
            onDragLeave={() => setIsDraggingCanvas(false)}
            onDrop={handleCanvasDrop}
            className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col transition-all relative ${
              isDraggingCanvas ? 'border-[#D44D2E] ring-2 ring-[#D44D2E]/20' : 'border-[#E5E2DC]'
            } ${viewMode === 'edit' ? 'lg:col-span-2 max-w-4xl mx-auto w-full' : ''}`}
          >
            {isDraggingCanvas && (
              <div className="absolute inset-0 bg-[#FDF2F0]/90 backdrop-blur-2xs z-30 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <Upload className="w-12 h-12 text-[#D44D2E] animate-bounce mb-2" />
                <h4 className="text-base font-bold text-[#111111]">Drop Image File to Insert Directly</h4>
                <p className="text-xs text-[#777777]">The image will be converted and embedded into your essay.</p>
              </div>
            )}

            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#F0ECE1] text-xs text-[#888888]">
              <span className="font-semibold text-[#555555]">Writing Canvas (Markdown & Rich Shortcuts)</span>
              <span className="font-mono text-[11px]">Supports drag & drop images • Ctrl+B, Ctrl+I, Ctrl+U</span>
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write with ease, clarity and rhythm..."
              className={`w-full h-[580px] leading-relaxed resize-none focus:outline-hidden bg-transparent text-[#111111] selection:bg-[#FADCD5] selection:text-[#111111] ${getFontFamilyClass()} ${getFontSizeClass()}`}
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className={`bg-white border border-[#E5E2DC] rounded-2xl p-6 sm:p-10 shadow-2xs overflow-y-auto h-[660px] ${
              viewMode === 'preview' ? 'lg:col-span-2 max-w-3xl mx-auto w-full' : ''
            }`}
          >
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Preview Header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D44D2E] font-mono">
                    {category}
                  </span>
                  <span className="text-[#CCCCCC]">•</span>
                  <span className="text-xs text-[#777777] font-mono">
                    {readingTime} min read
                  </span>
                  {isDraft && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-bold">
                      Draft Preview
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-sans text-[#111111] tracking-tight leading-tight">
                  {title || 'Untitled Essay'}
                </h1>

                {excerpt && (
                  <p className="text-sm sm:text-base text-[#666666] font-serif italic mt-3 leading-relaxed border-l-2 border-[#D44D2E] pl-3">
                    {excerpt}
                  </p>
                )}

                {/* Author row */}
                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-[#E5E2DC]">
                  <img
                    src={settings.authorAvatar}
                    alt={settings.authorName}
                    className="w-9 h-9 rounded-full object-cover border border-[#E5E2DC]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#111111]">{settings.authorName}</p>
                    <p className="text-[11px] text-[#777777]">{settings.authorRole || 'Editorial Collective'}</p>
                  </div>
                </div>
              </div>

              {/* Cover in Preview */}
              {coverImage && (
                <div className="rounded-xl overflow-hidden border border-[#E5E2DC] shadow-xs">
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Rendered Markdown Body */}
              <div className="prose prose-sm sm:prose-base max-w-none text-[#111111] leading-relaxed pt-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>

              {/* Tags */}
              {tags && (
                <div className="pt-6 border-t border-[#E5E2DC] flex flex-wrap gap-1.5">
                  {tags
                    .split(',')
                    .map(t => t.trim())
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-[#F3F1EC] text-[#444444] text-xs font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 5. LINK MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E2DC] p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#D44D2E]" />
              <span>Insert Hyperlink</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#444444] mb-1">
                Link Display Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={e => setLinkText(e.target.value)}
                placeholder="e.g. Douglas Engelbart's 1968 Demo"
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs font-semibold text-[#111111] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#444444] mb-1">
                Target URL
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs font-mono text-[#111111] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E2DC]">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 bg-[#F3F1EC] hover:bg-[#E5E2DC] text-[#333333] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLink}
                className="px-4 py-2 bg-[#111111] hover:bg-[#333333] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
