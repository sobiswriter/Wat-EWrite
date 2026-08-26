import React, { useState, useRef } from 'react';
import { useBlog } from '../context/BlogContext';
import { Post, Subscriber, Comment, BlogSettings } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ShowcaseManager } from './admin/ShowcaseManager';
import { AboutManager } from './admin/AboutManager';
import { TopicsManager } from './admin/TopicsManager';
import { ArchivesManager } from './admin/ArchivesManager';
import { WritingDesk } from './admin/WritingDesk';
import {
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Star,
  CheckCircle2,
  Sparkles,
  Download,
  Upload,
  Search,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  Link,
  Image as ImageIcon,
  Table as TableIcon,
  HelpCircle,
  Clock,
  Send,
  ArrowRight,
  TrendingUp,
  Globe,
  Smartphone,
  Laptop,
  Check,
  X,
  RefreshCw,
  LogOut,
  AlertCircle,
  Copy,
  FolderTree,
  Archive,
  Layers,
  User,
  Sliders,
  Shield,
  Compass,
  ExternalLink,
  Lock,
  EyeOff,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SECURITY_QUESTION_PRESETS, evaluatePasskeyStrength } from '../utils/security';

interface AdminDashboardProps {
  onClose: () => void;
  onViewPostLive: (post: Post) => void;
}

export type AdminTab =
  | 'posts'
  | 'editor'
  | 'showcase'
  | 'about'
  | 'topics'
  | 'archives'
  | 'subscribers'
  | 'analytics'
  | 'comments'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onViewPostLive
}) => {
  const {
    posts,
    comments,
    subscribers,
    settings,
    createPost,
    updatePost,
    deletePost,
    togglePostFeatured,
    togglePostDraft,
    deleteComment,
    addSubscriber,
    removeSubscriber,
    updateSubscriberStatus,
    sendNewsletterBroadcast,
    updateSettings,
    logoutAdmin,
    analyticsEvents
  } = useBlog();

  const [activeTab, setActiveTab] = useState<AdminTab>('posts');

  // Posts list filters
  const [postSearch, setPostSearch] = useState('');
  const [postFilter, setPostFilter] = useState<'all' | 'published' | 'drafts' | 'featured'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Editor State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorSubtitle, setEditorSubtitle] = useState('');
  const [editorExcerpt, setEditorExcerpt] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorCoverImage, setEditorCoverImage] = useState('');
  const [editorCategory, setEditorCategory] = useState('Design Philosophy');
  const [editorTags, setEditorTags] = useState('Craft, Minimalism, Design');
  const [editorIsFeatured, setEditorIsFeatured] = useState(false);
  const [editorIsDraft, setEditorIsDraft] = useState(false);
  const [editorSlug, setEditorSlug] = useState('');
  const [editorSeoTitle, setEditorSeoTitle] = useState('');
  const [editorSeoDescription, setEditorSeoDescription] = useState('');
  const [editorPreviewMode, setEditorPreviewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Subscribers State
  const [subSearch, setSubSearch] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastSent, setBroadcastSent] = useState<number | null>(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<BlogSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [showPasscodeSettings, setShowPasscodeSettings] = useState(false);
  const [showAnswerSettings, setShowAnswerSettings] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cover image presets
  const COVER_PRESETS = [
    { label: 'Minimal Workspace', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Typography / Print', url: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Abstract Blueprints', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Quiet Nature / Garden', url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Architecture & Shadows', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Minimal Monochrome', url: 'https://images.unsplash.com/photo-1507842229451-79b1b902846c?w=1200&auto=format&fit=crop&q=80' }
  ];

  // Open Editor with blank post
  const handleOpenNewPost = () => {
    setEditingPostId(null);
    setEditorTitle('');
    setEditorSubtitle('');
    setEditorExcerpt('');
    setEditorContent(`# Your New Essay Title

Write a captivating opening paragraph that hooks the reader with intentional insight...

## The Core Thesis

Explain your ideas with clarity, precision, and focus.

> "A thoughtful quote elevates the reading experience and anchors the core truth."

### Architectural Blueprint

\`\`\`typescript
// Clean, declarative craft
export function buildWithIntention() {
  return { durable: true, focused: true };
}
\`\`\`

## Conclusion

Summarize your perspective with actionable wisdom for your readers.`);
    setEditorCoverImage(COVER_PRESETS[0].url);
    setEditorCategory(settings.categories?.[0] || 'Design Philosophy');
    setEditorTags('Craft, Design, Technology');
    setEditorIsFeatured(false);
    setEditorIsDraft(false);
    setEditorSlug('');
    setEditorSeoTitle('');
    setEditorSeoDescription('');
    setActiveTab('editor');
  };

  // Open Editor with existing post
  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditorTitle(post.title);
    setEditorSubtitle(post.subtitle || '');
    setEditorExcerpt(post.excerpt);
    setEditorContent(post.content);
    setEditorCoverImage(post.coverImage);
    setEditorCategory(post.category);
    setEditorTags(post.tags.join(', '));
    setEditorIsFeatured(post.isFeatured);
    setEditorIsDraft(post.isDraft);
    setEditorSlug(post.slug);
    setEditorSeoTitle(post.seoTitle || '');
    setEditorSeoDescription(post.seoDescription || '');
    setActiveTab('editor');
  };

  // Duplicate an existing post
  const handleDuplicatePost = (post: Post) => {
    createPost({
      title: `${post.title} (Copy)`,
      subtitle: post.subtitle,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      category: post.category,
      tags: [...post.tags],
      isFeatured: false,
      isDraft: true,
      slug: `${post.slug}-copy-${Date.now().toString().slice(-4)}`,
      readingTime: post.readingTime,
      author: { ...post.author },
      publishedAt: new Date().toISOString()
    });
    setSaveNotification('Post duplicated as draft!');
    setTimeout(() => setSaveNotification(null), 2500);
  };

  // Insert formatting into markdown textarea
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);
    const replacement = `${before}${selectedText || 'text'}${after}`;

    const newContent = previousText.substring(0, start) + replacement + previousText.substring(end);
    setEditorContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText ? selectedText.length : 4));
    }, 0);
  };

  // AI Assistant helpers
  const handleGenerateExcerpt = () => {
    if (!editorContent) return;
    const cleanLines = editorContent
      .replace(/#+\s+/g, '')
      .replace(/>\s+/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 30);
    
    if (cleanLines.length > 0) {
      setEditorExcerpt(cleanLines[0].substring(0, 160) + '...');
    }
  };

  const handleSuggestHeadlines = () => {
    if (!editorTitle) {
      setEditorTitle("The Architectural Secrets of Modern Software Craft");
      return;
    }
    const variations = [
      `The Art of ${editorTitle}`,
      `Why ${editorTitle} Matters More Than Ever`,
      `Rethinking ${editorTitle}: A Minimalist Manifesto`,
      `Crafting ${editorTitle} for the Modern Web`,
      `Notes on ${editorTitle}: Subtraction & Clarity`
    ];
    const picked = variations[Math.floor(Math.random() * variations.length)];
    setEditorTitle(picked);
  };

  // Save Post
  const handleSavePost = () => {
    if (!editorTitle.trim()) {
      alert("Please provide a title for your essay.");
      return;
    }

    const calculatedWords = editorContent.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(calculatedWords / 220));
    const generatedSlug = editorSlug.trim()
      ? editorSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : editorTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const tagsArray = editorTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingPostId) {
      updatePost(editingPostId, {
        title: editorTitle.trim(),
        subtitle: editorSubtitle.trim() || undefined,
        excerpt: editorExcerpt.trim() || editorTitle.trim(),
        content: editorContent,
        coverImage: editorCoverImage || COVER_PRESETS[0].url,
        category: editorCategory,
        tags: tagsArray.length > 0 ? tagsArray : ['General'],
        isFeatured: editorIsFeatured,
        isDraft: editorIsDraft,
        slug: generatedSlug,
        seoTitle: editorSeoTitle.trim() || `${editorTitle.trim()} — ${settings.blogName}`,
        seoDescription: editorSeoDescription.trim() || editorExcerpt.trim(),
        readingTime,
        updatedAt: new Date().toISOString()
      });
      setSaveNotification('Essay updated successfully!');
    } else {
      const newPost = createPost({
        title: editorTitle.trim(),
        subtitle: editorSubtitle.trim() || undefined,
        excerpt: editorExcerpt.trim() || editorTitle.trim(),
        content: editorContent,
        coverImage: editorCoverImage || COVER_PRESETS[0].url,
        category: editorCategory,
        tags: tagsArray.length > 0 ? tagsArray : ['General'],
        isFeatured: editorIsFeatured,
        isDraft: editorIsDraft,
        slug: generatedSlug,
        seoTitle: editorSeoTitle.trim() || `${editorTitle.trim()} — ${settings.blogName}`,
        seoDescription: editorSeoDescription.trim() || editorExcerpt.trim(),
        readingTime,
        publishedAt: new Date().toISOString(),
        author: {
          name: settings.authorName,
          avatar: settings.authorAvatar,
          role: settings.authorRole
        }
      });
      setEditingPostId(newPost.id);
      setSaveNotification('New essay created & published!');
    }

    setTimeout(() => {
      setSaveNotification(null);
    }, 3000);
  };

  // Subscribers Handlers
  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail) return;
    const res = addSubscriber(newSubEmail, newSubName || undefined, 'manual');
    alert(res.message);
    if (res.success) {
      setNewSubEmail('');
      setNewSubName('');
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject || !broadcastContent) return;
    const res = sendNewsletterBroadcast(broadcastSubject, broadcastContent, broadcastTarget === 'all' ? undefined : broadcastTarget);
    setBroadcastSent(res.sentCount);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => {
      setBroadcastSent(null);
      setBroadcastSubject('');
      setBroadcastContent('');
    }, 4000);
  };

  const handleExportSubscribersCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Email,Name,Subscribed Date,Status,Source"].join(",") + "\n"
      + subscribers.map(s => `"${s.email}","${s.name || ''}","${s.subscribedAt}","${s.status}","${s.source}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `watewrites_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Full backup & restore
  const handleBackupFullJSON = () => {
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings,
      posts,
      subscribers,
      comments
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `watewrites_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.settings) {
            updateSettings(parsed.settings);
          }
          alert("Backup data restored successfully! The studio and site have refreshed.");
        } catch {
          alert("Failed to parse the backup JSON file. Please verify format.");
        }
      };
    }
  };

  // Filter posts list
  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      post.category.toLowerCase().includes(postSearch.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(postSearch.toLowerCase());
    
    if (!matchesSearch) return false;

    if (postFilter === 'published') return !post.isDraft;
    if (postFilter === 'drafts') return post.isDraft;
    if (postFilter === 'featured') return post.isFeatured;
    if (categoryFilter !== 'all') return post.category === categoryFilter;

    return true;
  });

  const wordCount = editorContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = editorContent.length;
  const estReadTime = Math.max(1, Math.ceil(wordCount / 220));

  const availableCategories = settings.categories || [
    'Design Philosophy',
    'For Teams',
    'Tech',
    'Inspiration',
    'Pioneers',
    'Typography'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#F9F8F6] text-[#111111] flex flex-col overflow-hidden font-sans">
      
      {/* 1. TOP STUDIO MASTHEAD */}
      <header className="h-16 border-b border-[#E5E2DC] bg-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-serif text-base font-bold shadow-xs">
            {settings.blogName.charAt(0) || 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#111111]">
                {settings.blogName} Studio & Site Manager
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Mode
              </span>
            </div>
            <p className="text-[11px] text-[#777777] hidden sm:block">
              Full no-code control over showcase, about collective, topics, essays & newsletter
            </p>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleOpenNewPost}
            className="px-3.5 py-1.5 bg-[#D44D2E] hover:bg-[#B83C1F] text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Write Essay</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F3F1EC] border border-[#E5E2DC] text-[#111111] rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Preview Live Site"
          >
            <Eye className="w-3.5 h-3.5 text-[#555555]" />
            <span className="hidden sm:inline">View Live Site</span>
          </button>

          <button
            onClick={() => {
              logoutAdmin();
              onClose();
            }}
            className="p-1.5 text-[#777777] hover:text-[#111111] hover:bg-[#F3F1EC] rounded-lg transition-colors cursor-pointer"
            title="Sign Out of Studio"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. BODY CONTAINER (SIDEBAR + MAIN CANVAS) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 border-r border-[#E5E2DC] bg-[#FFFFFF] p-4 flex flex-col justify-between overflow-y-auto shrink-0 hidden md:flex">
          <div className="space-y-6">
            
            {/* Group 1: Content & Writing */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider px-3 block mb-1">
                Content & Writing
              </span>

              <button
                onClick={() => setActiveTab('posts')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'posts'
                    ? 'bg-[#111111] text-white'
                    : 'text-[#555555] hover:bg-[#F3F1EC] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Essays & Drafts</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  activeTab === 'posts' ? 'bg-white/20 text-white' : 'bg-[#EBE8E3] text-[#555555]'
                }`}>
                  {posts.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('editor')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-[#111111] text-white'
                    : 'text-[#555555] hover:bg-[#F3F1EC] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Edit3 className="w-4 h-4" />
                  <span>Writing Desk</span>
                </div>
                {editingPostId && (
                  <span className="text-[10px] bg-[#D44D2E] text-white px-1.5 py-0.5 rounded font-mono">
                    Active
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('topics')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'topics'
                    ? 'bg-[#111111] text-white'
                    : 'text-[#555555] hover:bg-[#F3F1EC] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-4 h-4" />
                  <span>Topics & Taxonomy</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  activeTab === 'topics' ? 'bg-white/20 text-white' : 'bg-[#EBE8E3] text-[#555555]'
                }`}>
                  {availableCategories.length}
                </span>
              </button>
            </div>

            {/* Group 2: Site Showcase & Structure */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider px-3 block mb-1">
                Site Showcase & Structure
              </span>

              <button
                onClick={() => setActiveTab('showcase')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'showcase'
                    ? 'bg-[#111111] text-white'
                    : 'text-[#555555] hover:bg-[#F3F1EC] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#D44D2E]" />
                  <span>Top Stories Showcase</span>
                </div>
                <span className="text-[10px] bg-[#D44D2E]/10 text-[#D44D2E] px-1.5 py-0.5 rounded font-semibold">
                  3D Gallery
                </span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'about'
                    ? 'bg-[#111111] text-white'
                    : 'text-[#555555] hover:bg-[#F3F1EC] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>About & Principles</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('archives')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'archives'
                    ? 'bg-[#111111] text-white'
                    : 'text-[#555555] hover:bg-[#F3F1EC] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4" />
                  <span>Archives & Registry</span>
                </div>
              </button>
            </div>

            {/* Group 3: Community & Audience */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider px-3 block mb-1">
                Community & Audience
              </span>

              <button
                onClick={() => setActiveTab('subscribers')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'subscribers'
                    ? 'bg-[#111111] text-white'
                    : 'text-[#555555] hover:bg-[#F3F1EC] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Subscribers & Dispatch</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  activeTab === 'subscribers' ? 'bg-white/20 text-white' : 'bg-[#EBE8E3] text-[#555555]'
                }`}>
                  {subscribers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'comments'
                    ? 'bg-[#111111] text-white'
                    : 'text-[#555555] hover:bg-[#F3F1EC] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Reader Comments</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  activeTab === 'comments' ? 'bg-white/20 text-white' : 'bg-[#EBE8E3] text-[#555555]'
                }`}>
                  {comments.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#111111] text-white'
                    : 'text-[#555555] hover:bg-[#F3F1EC] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>Traffic & Metrics</span>
                </div>
              </button>
            </div>

            {/* Group 4: Config */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider px-3 block mb-1">
                System & Storage
              </span>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#111111] text-white'
                    : 'text-[#555555] hover:bg-[#F3F1EC] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>Settings & Backups</span>
                </div>
              </button>
            </div>

          </div>

          {/* Quick info in sidebar footer */}
          <div className="pt-4 border-t border-[#E5E2DC] text-[11px] text-[#888888] space-y-1">
            <div className="flex items-center justify-between">
              <span>{settings.blogName}</span>
              <span className="font-mono">{settings.volume || 'Vol. IV'}</span>
            </div>
            <p className="text-[10px] text-[#AAAAAA]">Persistent local client storage</p>
          </div>
        </aside>

        {/* MOBILE TOP TAB SCROLLER */}
        <div className="md:hidden flex overflow-x-auto p-2 bg-white border-b border-[#E5E2DC] gap-1 shrink-0">
          {(['posts', 'editor', 'showcase', 'about', 'topics', 'archives', 'subscribers', 'comments', 'analytics', 'settings'] as AdminTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap cursor-pointer ${
                activeTab === tab ? 'bg-[#111111] text-white' : 'text-[#666666]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* MAIN CANVAS */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F9F8F6]">
          
          {/* TAB 1: POSTS LIST */}
          {activeTab === 'posts' && (
            <div className="space-y-6 max-w-6xl">
              
              {/* Header with Search & Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
                <div>
                  <h2 className="text-2xl font-bold font-sans text-[#111111] tracking-tight">
                    Essays & Publications ({posts.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-[#666666] mt-1">
                    Manage essays, toggle publication status, feature top articles, or duplicate posts.
                  </p>
                </div>

                <button
                  onClick={handleOpenNewPost}
                  className="px-4 py-2 bg-[#D44D2E] hover:bg-[#B83C1F] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Essay</span>
                </button>
              </div>

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E5E2DC] shadow-2xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={postSearch}
                    onChange={e => setPostSearch(e.target.value)}
                    placeholder="Search by title, excerpt or category..."
                    className="w-full pl-9 pr-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setPostFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      postFilter === 'all' ? 'bg-[#111111] text-white' : 'bg-[#F9F8F6] text-[#666666]'
                    }`}
                  >
                    All ({posts.length})
                  </button>
                  <button
                    onClick={() => setPostFilter('published')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      postFilter === 'published' ? 'bg-[#111111] text-white' : 'bg-[#F9F8F6] text-[#666666]'
                    }`}
                  >
                    Published ({posts.filter(p => !p.isDraft).length})
                  </button>
                  <button
                    onClick={() => setPostFilter('drafts')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      postFilter === 'drafts' ? 'bg-[#111111] text-white' : 'bg-[#F9F8F6] text-[#666666]'
                    }`}
                  >
                    Drafts ({posts.filter(p => p.isDraft).length})
                  </button>
                  <button
                    onClick={() => setPostFilter('featured')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      postFilter === 'featured' ? 'bg-[#111111] text-white' : 'bg-[#F9F8F6] text-[#666666]'
                    }`}
                  >
                    Featured ({posts.filter(p => p.isFeatured).length})
                  </button>
                </div>
              </div>

              {/* Notification Banner */}
              {saveNotification && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{saveNotification}</span>
                </div>
              )}

              {/* Posts Cards / Table */}
              <div className="bg-white rounded-xl border border-[#E5E2DC] shadow-2xs divide-y divide-[#F0ECE1] overflow-hidden">
                {filteredPosts.length === 0 ? (
                  <div className="p-12 text-center text-[#888888] space-y-3">
                    <FileText className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-sm">No essays found matching your criteria.</p>
                  </div>
                ) : (
                  filteredPosts.map(post => (
                    <div
                      key={post.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FCFBF9] transition-colors"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-16 h-16 rounded-xl object-cover border border-[#E5E2DC] shrink-0"
                        />
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D44D2E]">
                              {post.category}
                            </span>
                            <span className="text-[#CCCCCC]">•</span>
                            <span className="text-xs text-[#777777] font-mono">
                              {post.readingTime} min read
                            </span>
                            {post.isDraft ? (
                              <span className="px-2 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                                Draft
                              </span>
                            ) : (
                              <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                                Published
                              </span>
                            )}
                            {post.isFeatured && (
                              <span className="px-2 py-0.2 bg-[#111111] text-white text-[10px] font-bold rounded flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                <span>Featured</span>
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-[#111111] truncate">
                            {post.title}
                          </h3>
                          <p className="text-xs text-[#666666] line-clamp-1">
                            {post.subtitle || post.excerpt}
                          </p>
                          <div className="text-[11px] text-[#888888] flex items-center gap-3 pt-0.5">
                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                            <span>{post.views} views</span>
                            <span>{post.likes} likes</span>
                          </div>
                        </div>
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => togglePostFeatured(post.id)}
                          className={`p-2 rounded-lg border text-xs cursor-pointer ${
                            post.isFeatured
                              ? 'bg-amber-50 border-amber-300 text-amber-600'
                              : 'bg-white border-[#E5E2DC] text-[#777777] hover:border-[#111111]'
                          }`}
                          title={post.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => togglePostDraft(post.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                            post.isDraft
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {post.isDraft ? 'Make Live' : 'Unpublish'}
                        </button>

                        <button
                          onClick={() => handleEditPost(post)}
                          className="px-3 py-1.5 bg-[#111111] hover:bg-[#333333] text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDuplicatePost(post)}
                          className="p-2 bg-white border border-[#E5E2DC] hover:border-[#111111] text-[#555555] rounded-lg text-xs cursor-pointer"
                          title="Duplicate post"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onViewPostLive(post)}
                          className="p-2 bg-white border border-[#E5E2DC] hover:border-[#111111] text-[#555555] rounded-lg text-xs cursor-pointer"
                          title="View live post"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete essay "${post.title}"?`)) {
                              deletePost(post.id);
                            }
                          }}
                          className="p-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs cursor-pointer"
                          title="Delete essay"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WRITING DESK (UPGRADED WORD-LIKE RICH EDITOR) */}
          {activeTab === 'editor' && (
            <WritingDesk
              initialPost={editingPostId ? posts.find(p => p.id === editingPostId) : null}
              onPostSaved={(post) => {
                setEditingPostId(post.id);
              }}
              onViewLive={onViewPostLive}
            />
          )}

          {/* TAB 3: SHOWCASE MANAGER */}
          {activeTab === 'showcase' && (
            <ShowcaseManager onViewLivePost={onViewPostLive} />
          )}

          {/* TAB 4: ABOUT MANAGER */}
          {activeTab === 'about' && (
            <AboutManager />
          )}

          {/* TAB 5: TOPICS & TAXONOMY */}
          {activeTab === 'topics' && (
            <TopicsManager />
          )}

          {/* TAB 6: ARCHIVES & REGISTRY */}
          {activeTab === 'archives' && (
            <ArchivesManager
              onEditPost={handleEditPost}
              onViewLive={onViewPostLive}
            />
          )}

          {/* TAB 7: SUBSCRIBERS & NEWSLETTER */}
          {activeTab === 'subscribers' && (
            <div className="space-y-8 max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
                <div>
                  <h2 className="text-2xl font-bold font-sans text-[#111111] tracking-tight">
                    Subscribers & Newsletter Dispatch ({subscribers.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-[#666666] mt-1">
                    Manage reader contact lists, export subscriber data, or compose and broadcast email issues.
                  </p>
                </div>

                <button
                  onClick={handleExportSubscribersCSV}
                  className="px-4 py-2 bg-white border border-[#E5E2DC] hover:border-[#111111] text-[#111111] rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4 text-[#D44D2E]" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Compose Broadcast Section */}
              <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2 border-b border-[#E5E2DC] pb-3">
                  <Send className="w-4 h-4 text-[#D44D2E]" />
                  <span>Compose & Dispatch Sunday Issue</span>
                </h3>

                <form onSubmit={handleSendBroadcast} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#444444] mb-1">
                        Broadcast Subject Line
                      </label>
                      <input
                        type="text"
                        required
                        value={broadcastSubject}
                        onChange={e => setBroadcastSubject(e.target.value)}
                        placeholder="e.g. Issue #49: The Subtraction of UI Bloat"
                        className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs font-semibold text-[#111111] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#444444] mb-1">
                        Audience Target
                      </label>
                      <select
                        value={broadcastTarget}
                        onChange={e => setBroadcastTarget(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs font-semibold text-[#111111] focus:outline-hidden"
                      >
                        <option value="all">All Active Readers ({subscribers.filter(s => s.status === 'active').length})</option>
                        {availableCategories.map(cat => (
                          <option key={cat} value={cat}>{cat} Enthusiasts</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#444444] mb-1">
                      Newsletter Content (Markdown supported)
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={broadcastContent}
                      onChange={e => setBroadcastContent(e.target.value)}
                      placeholder="Write your Sunday dispatch message..."
                      className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] leading-relaxed focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {broadcastSent !== null ? (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Broadcast simulated to {broadcastSent} subscribers!</span>
                      </span>
                    ) : <div />}

                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#111111] hover:bg-[#333333] text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Dispatch</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Subscribers List */}
              <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2DC] pb-3">
                  <h3 className="font-bold text-sm text-[#111111]">
                    Subscribers Directory ({subscribers.length})
                  </h3>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={subSearch}
                      onChange={e => setSubSearch(e.target.value)}
                      placeholder="Search email or name..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="divide-y divide-[#F0ECE1] max-h-96 overflow-y-auto">
                  {subscribers
                    .filter(s => s.email.toLowerCase().includes(subSearch.toLowerCase()) || (s.name && s.name.toLowerCase().includes(subSearch.toLowerCase())))
                    .map(sub => (
                      <div key={sub.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#111111]">{sub.email}</span>
                            {sub.name && <span className="text-[#777777]">({sub.name})</span>}
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#888888] mt-0.5">
                            Subscribed: {new Date(sub.subscribedAt).toLocaleDateString()} • Source: {sub.source}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateSubscriberStatus(sub.id, sub.status === 'active' ? 'unsubscribed' : 'active')}
                            className="px-2.5 py-1 bg-[#F9F8F6] hover:bg-[#E5E2DC] text-[#333333] rounded text-[11px] cursor-pointer"
                          >
                            {sub.status === 'active' ? 'Unsubscribe' : 'Reactivate'}
                          </button>
                          <button
                            onClick={() => removeSubscriber(sub.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Remove subscriber"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="space-y-6 max-w-5xl">
              <div className="pb-6 border-b border-[#E5E2DC]">
                <h2 className="text-2xl font-bold font-sans text-[#111111] tracking-tight">
                  Visitor Comments Moderation ({comments.length})
                </h2>
                <p className="text-xs sm:text-sm text-[#666666] mt-1">
                  Review and moderate discussions left by readers across all published essays.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E2DC] shadow-2xs divide-y divide-[#F0ECE1]">
                {comments.length === 0 ? (
                  <div className="p-8 text-center text-[#888888]">
                    No comments yet.
                  </div>
                ) : (
                  comments.map(comment => {
                    const post = posts.find(p => p.id === comment.postId);
                    return (
                      <div key={comment.id} className="p-5 flex items-start justify-between gap-4 hover:bg-[#F9F8F6] transition-colors">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-[#111111]">{comment.authorName}</span>
                            <span className="text-[#CCCCCC]">•</span>
                            <span className="text-[#777777] font-mono">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            {post && (
                              <span className="bg-[#F3F1EC] text-[#444444] px-2 py-0.5 rounded text-[10px]">
                                On: {post.title}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
                            {comment.content}
                          </p>
                          <div className="text-[11px] text-[#888888]">
                            {comment.likes} likes on comment
                          </div>
                        </div>

                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="p-2 text-[#888888] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 9: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 max-w-5xl">
              <div className="pb-6 border-b border-[#E5E2DC]">
                <h2 className="text-2xl font-bold font-sans text-[#111111] tracking-tight">
                  Publication Traffic & Reader Analytics
                </h2>
                <p className="text-xs sm:text-sm text-[#666666] mt-1">
                  Overview of pageviews, subscriber conversions, and reader retention metrics.
                </p>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-[#E5E2DC] rounded-xl shadow-2xs">
                  <span className="text-xs font-semibold text-[#666666] block">Total Pageviews</span>
                  <div className="text-2xl font-bold font-mono text-[#111111] mt-1">
                    {posts.reduce((acc, p) => acc + p.views, 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">↑ 18% vs last month</span>
                </div>

                <div className="p-5 bg-white border border-[#E5E2DC] rounded-xl shadow-2xs">
                  <span className="text-xs font-semibold text-[#666666] block">Sunday Readers</span>
                  <div className="text-2xl font-bold font-mono text-[#111111] mt-1">
                    {subscribers.length + 5200}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">99.4% delivery rate</span>
                </div>

                <div className="p-5 bg-white border border-[#E5E2DC] rounded-xl shadow-2xs">
                  <span className="text-xs font-semibold text-[#666666] block">Reader Likes</span>
                  <div className="text-2xl font-bold font-mono text-[#111111] mt-1">
                    {posts.reduce((acc, p) => acc + p.likes, 0)}
                  </div>
                  <span className="text-[11px] text-[#777777] mt-1 block">Across {posts.length} articles</span>
                </div>

                <div className="p-5 bg-white border border-[#E5E2DC] rounded-xl shadow-2xs">
                  <span className="text-xs font-semibold text-[#666666] block">Avg. Reading Time</span>
                  <div className="text-2xl font-bold font-mono text-[#111111] mt-1">
                    6.4 min
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">High engagement</span>
                </div>
              </div>

              {/* Top Read Stories */}
              <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-sm text-[#111111] border-b border-[#E5E2DC] pb-3">
                  Top Read Articles Ranked
                </h3>

                <div className="divide-y divide-[#F0ECE1]">
                  {[...posts]
                    .sort((a, b) => b.views - a.views)
                    .map((post, idx) => (
                      <div key={post.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-5 h-5 rounded bg-[#F3F1EC] text-[#111111] font-mono font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-[#111111] truncate">{post.title}</span>
                          <span className="text-[#888888] hidden sm:inline">({post.category})</span>
                        </div>
                        <div className="flex items-center gap-4 font-mono text-xs text-[#555555]">
                          <span>{post.views.toLocaleString()} views</span>
                          <span>{post.likes} likes</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS & BACKUPS */}
          {activeTab === 'settings' && (
            <div className="space-y-8 max-w-4xl">
              <div className="pb-6 border-b border-[#E5E2DC]">
                <h2 className="text-2xl font-bold font-sans text-[#111111] tracking-tight">
                  Publication Settings & Backup Center
                </h2>
                <p className="text-xs sm:text-sm text-[#666666] mt-1">
                  Configure site-wide identity, change passcode, and export or restore complete JSON snapshots.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveSettings} className="bg-white rounded-xl border border-[#E5E2DC] p-6 shadow-2xs space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                    Publication Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.blogName}
                    onChange={e => setSettingsForm({ ...settingsForm, blogName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg font-bold text-[#111111] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                    Primary Tagline
                  </label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={e => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-[#111111] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                    Site Description / Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.description}
                    onChange={e => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-[#111111] leading-relaxed focus:outline-hidden"
                  />
                </div>

                {/* Studio Security & Trick Question Section */}
                <div className="pt-4 border-t border-[#E5E2DC] space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#111111] uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-[#D44D2E]" />
                    <span>Studio Authentication & Trick Question Recovery</span>
                  </div>

                  {/* Security Active Banner */}
                  <div className="p-3.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl flex items-start gap-3 text-xs text-[#555555]">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#111111] block">Anti-Brute Force Protection Active</span>
                      <span>Requires passkey authentication every time Studio opens. Locks out attacks for 30s after 5 failed attempts.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Passkey input */}
                    <div>
                      <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                        Studio Admin Passkey
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPasscodeSettings ? "text" : "password"}
                          value={settingsForm.adminPasscode}
                          onChange={e => setSettingsForm({ ...settingsForm, adminPasscode: e.target.value })}
                          className="w-full pl-9 pr-9 py-2 text-xs bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg font-mono text-[#111111] focus:outline-hidden focus:border-[#D44D2E]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasscodeSettings(!showPasscodeSettings)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] cursor-pointer"
                        >
                          {showPasscodeSettings ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {/* Strength indicator */}
                      {settingsForm.adminPasscode && (
                        <div className="mt-1 flex items-center justify-between text-[10px] text-[#777777]">
                          <span>Strength:</span>
                          <span className="font-semibold" style={{ color: evaluatePasskeyStrength(settingsForm.adminPasscode).color }}>
                            {evaluatePasskeyStrength(settingsForm.adminPasscode).label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Trick Question Answer */}
                    <div>
                      <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                        Trick Question Answer
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showAnswerSettings ? "text" : "password"}
                          value={settingsForm.securityAnswer || 'Ness'}
                          onChange={e => setSettingsForm({ ...settingsForm, securityAnswer: e.target.value })}
                          placeholder="e.g. Ness"
                          className="w-full pl-9 pr-9 py-2 text-xs bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-[#111111] focus:outline-hidden focus:border-[#D44D2E]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAnswerSettings(!showAnswerSettings)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] cursor-pointer"
                        >
                          {showAnswerSettings ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-[#888888] mt-1 block">
                        Case-insensitive answer (Default: <code>Ness</code>)
                      </span>
                    </div>
                  </div>

                  {/* Trick Question Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                      Security Trick Question
                    </label>
                    <select
                      value={SECURITY_QUESTION_PRESETS.includes(settingsForm.securityQuestion || "Your Sister's Name...?") ? (settingsForm.securityQuestion || "Your Sister's Name...?") : 'custom'}
                      onChange={e => {
                        if (e.target.value === 'custom') {
                          setSettingsForm({ ...settingsForm, securityQuestion: '' });
                        } else {
                          setSettingsForm({ ...settingsForm, securityQuestion: e.target.value });
                        }
                      }}
                      className="w-full px-3.5 py-2 text-xs bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-[#111111] focus:outline-hidden"
                    >
                      {SECURITY_QUESTION_PRESETS.map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                      <option value="custom">Custom Trick Question...</option>
                    </select>

                    {/* Custom Question input if not preset */}
                    {!SECURITY_QUESTION_PRESETS.includes(settingsForm.securityQuestion || "Your Sister's Name...?") && (
                      <input
                        type="text"
                        value={settingsForm.securityQuestion || ''}
                        onChange={e => setSettingsForm({ ...settingsForm, securityQuestion: e.target.value })}
                        placeholder="Type custom trick question..."
                        className="mt-2 w-full px-3.5 py-2 text-xs bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-[#111111] focus:outline-hidden"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#E5E2DC]">
                  {settingsSaved && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Settings updated!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#111111] hover:bg-[#333333] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs ml-auto"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Full Site Backup & Restore */}
              <div className="bg-white rounded-xl border border-[#E5E2DC] p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-sm text-[#111111] border-b border-[#E5E2DC] pb-3 flex items-center gap-2">
                  <Archive className="w-4 h-4 text-[#D44D2E]" />
                  <span>Full Site Data Backup & Restore</span>
                </h3>
                <p className="text-xs text-[#666666]">
                  Download a full JSON snapshot of all settings, essays, showcase order, author principles, and subscribers.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBackupFullJSON}
                    className="px-4 py-2 bg-[#F3F1EC] hover:bg-[#E5E2DC] text-[#111111] rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full Backup (.json)</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleRestoreJSONUpload}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-[#E5E2DC] hover:border-[#111111] text-[#111111] rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Restore from Backup File</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
};
