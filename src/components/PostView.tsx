import React, { useState, useEffect, useRef } from 'react';
import { Post, Comment } from '../types';
import { useBlog } from '../context/BlogContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Bookmark,
  Heart,
  Share2,
  Check,
  MessageSquare,
  Send,
  CornerDownRight,
  Sun,
  Moon,
  Type,
  BookOpen,
  Mail,
  ThumbsUp,
  Trash2,
  Copy
} from 'lucide-react';

interface PostViewProps {
  post: Post;
  onBack: () => void;
  onSelectPost: (post: Post) => void;
}

export const PostView: React.FC<PostViewProps> = ({
  post,
  onBack,
  onSelectPost
}) => {
  const {
    posts,
    comments,
    addComment,
    likeComment,
    deleteComment,
    likePost,
    viewPost,
    isBookmarked,
    toggleBookmark,
    addSubscriber,
    readingTheme,
    setReadingTheme,
    fontSizeMode,
    setFontSizeMode,
    isAdminLoggedIn,
    settings
  } = useBlog();

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Comments form
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyText, setReplyText] = useState('');

  // Newsletter in post footer
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState<string | null>(null);

  // Table of Contents
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  // Views logger on mount
  useEffect(() => {
    viewPost(post.id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [post.id]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parse markdown headings for Table of Contents
  useEffect(() => {
    const lines = post.content.split('\n');
    const extracted: { id: string; text: string; level: number }[] = [];
    lines.forEach(line => {
      const match = line.match(/^(#{2,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        extracted.push({ id, text, level });
      }
    });
    setHeadings(extracted);
  }, [post.content]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    addComment(post.id, commentName, commentText);
    setCommentText('');
  };

  const handleAddReply = (parentId: string) => {
    if (!replyName.trim() || !replyText.trim()) return;
    addComment(post.id, replyName, replyText, parentId);
    setReplyToId(null);
    setReplyText('');
  };

  const handleFooterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    const res = addSubscriber(newsletterEmail, undefined, 'post_footer', [post.category]);
    setNewsletterMsg(res.message);
    if (res.success) {
      setNewsletterEmail('');
    }
  };

  // Filter comments for this post
  const postComments = comments.filter(c => c.postId === post.id);
  const rootComments = postComments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => postComments.filter(c => c.parentId === parentId);

  // Related posts
  const relatedPosts = posts
    .filter(p => p.id !== post.id && !p.isDraft && (p.category === post.category || p.tags.some(t => post.tags.includes(t))))
    .slice(0, 2);

  // Reading theme classes
  const themeClasses = {
    light: 'bg-[#F9F8F6] text-[#1A1A1A]',
    sepia: 'bg-[#F3EBE1] text-[#332A22]',
    dark: 'bg-[#141414] text-[#E0DDD7]'
  }[readingTheme];

  const contentFontSizeClass = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl leading-relaxed'
  }[fontSizeMode];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeClasses}`}>
      
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-[#E5E2DC]/50">
        <div
          className="h-full bg-[#D44D2E] transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Navigation & Reader Controls Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E5E2DC] mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#6B665F] hover:text-[#1A1A1A] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to all essays</span>
          </button>

          {/* Reader Preferences Bar */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs p-1 rounded-xl border border-[#E5E2DC] shadow-2xs">
            {/* Font Size Adjust */}
            <button
              onClick={() => setFontSizeMode(fontSizeMode === 'sm' ? 'md' : fontSizeMode === 'md' ? 'lg' : 'sm')}
              className="px-2 py-1 text-xs font-semibold text-[#6B665F] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F3F1EC] transition-colors flex items-center gap-1 cursor-pointer"
              title={`Font size: ${fontSizeMode.toUpperCase()}`}
            >
              <Type className="w-3.5 h-3.5" />
              <span className="uppercase text-[10px]">{fontSizeMode}</span>
            </button>

            {/* Reading Theme Switcher */}
            <div className="flex items-center border-l border-[#E5E2DC] pl-1.5 ml-0.5 gap-1">
              <button
                onClick={() => setReadingTheme('light')}
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] cursor-pointer ${
                  readingTheme === 'light' ? 'border-[#D44D2E] bg-[#F9F8F6] font-bold' : 'border-[#E5E2DC] bg-white'
                }`}
                title="Light mode"
              >
                A
              </button>
              <button
                onClick={() => setReadingTheme('sepia')}
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] cursor-pointer ${
                  readingTheme === 'sepia' ? 'border-[#8B5E3C] bg-[#F3EBE1] text-[#332A22] font-bold' : 'border-[#E5E2DC] bg-[#F3EBE1]'
                }`}
                title="Sepia mode"
              >
                A
              </button>
              <button
                onClick={() => setReadingTheme('dark')}
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] cursor-pointer ${
                  readingTheme === 'dark' ? 'border-[#D44D2E] bg-[#141414] text-white font-bold' : 'border-stone-700 bg-[#242424] text-white'
                }`}
                title="Night mode"
              >
                A
              </button>
            </div>
          </div>
        </div>

        {/* Article Header */}
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#D44D2E] uppercase tracking-widest mb-3">
            <span>{post.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1 normal-case tracking-normal text-[#6B665F]">
              <Clock className="w-3.5 h-3.5" /> {post.readingTime} min read
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-[1.15]">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="mt-4 text-base sm:text-xl text-[#6B665F] font-serif italic">
              {post.subtitle}
            </p>
          )}

          {/* Author info & date */}
          <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-[#E5E2DC] text-xs text-[#6B665F]">
            <img
              src={post.author?.avatar || settings.authorAvatar}
              alt={post.author?.name || settings.authorName}
              className="w-9 h-9 rounded-full object-cover border border-[#E5E2DC]"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <div className="font-semibold text-[#1A1A1A]">{post.author?.name || settings.authorName}</div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <Calendar className="w-3 h-3 text-[#D44D2E]" />
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="my-8 rounded-2xl overflow-hidden shadow-md border border-[#E5E2DC] aspect-16/9 bg-[#F3F1EC]">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Floating/Sticky Action Bar on the side or bottom */}
        <div className="sticky top-20 z-30 float-right hidden lg:flex flex-col gap-3 -mr-20 ml-6 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-[#E5E2DC] shadow-lg">
          <button
            onClick={() => likePost(post.id)}
            className="p-2.5 rounded-xl hover:bg-rose-50 text-[#6B665F] hover:text-rose-600 transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
            title="Like essay"
          >
            <Heart className="w-5 h-5 fill-current text-rose-500" />
            <span className="text-[10px] font-bold">{post.likes}</span>
          </button>

          <button
            onClick={() => toggleBookmark(post.id)}
            className={`p-2.5 rounded-xl transition-colors flex flex-col items-center gap-0.5 cursor-pointer ${
              isBookmarked(post.id)
                ? 'bg-[#F9EBE7] text-[#942C17]'
                : 'hover:bg-[#F3F1EC] text-[#6B665F]'
            }`}
            title="Save for later"
          >
            <Bookmark className="w-5 h-5 fill-current" />
            <span className="text-[10px] font-medium">Save</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl hover:bg-[#F3F1EC] text-[#6B665F] hover:text-[#1A1A1A] transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
            title="Copy link"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            <span className="text-[10px] font-medium">{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="p-2.5 rounded-xl hover:bg-[#F3F1EC] text-[#6B665F] hover:text-[#1A1A1A] transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
            title="Jump to comments"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">{postComments.length}</span>
          </button>
        </div>

        {/* Table of Contents (if 2+ headings) */}
        {headings.length > 1 && (
          <nav className="my-8 p-5 bg-white/80 rounded-2xl border border-[#E5E2DC] shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B665F] mb-3">
              <BookOpen className="w-4 h-4 text-[#D44D2E]" />
              <span>Table of Contents</span>
            </div>
            <ul className="space-y-2 text-sm">
              {headings.map(h => (
                <li key={h.id} style={{ marginLeft: `${(h.level - 2) * 1}rem` }}>
                  <a
                    href={`#${h.id}`}
                    className="text-[#6B665F] hover:text-[#D44D2E] transition-colors font-medium flex items-center gap-1.5"
                  >
                    <span className="text-[#D44D2E] text-xs">§</span>
                    <span>{h.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Markdown Content Article Body */}
        <article className={`markdown-content ${contentFontSizeClass} max-w-none pt-4`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ node, children, ...props }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                return (
                  <h2 id={id} className="scroll-mt-20 font-serif" {...props}>
                    {children}
                  </h2>
                );
              },
              h3: ({ node, children, ...props }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                return (
                  <h3 id={id} className="scroll-mt-20 font-serif" {...props}>
                    {children}
                  </h3>
                );
              },
              blockquote: ({ node, ...props }) => (
                <blockquote className="font-serif border-l-4 border-[#D44D2E] bg-[#F9EBE7]/50 p-4 rounded-r-xl" {...props} />
              )
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Post Tags & Bottom Social Bar */}
        <div className="mt-12 pt-6 border-t border-[#E5E2DC] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="text-xs bg-[#F3F1EC] text-[#6B665F] px-3 py-1 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => likePost(post.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>{post.likes} Applause</span>
            </button>
            <button
              onClick={() => toggleBookmark(post.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isBookmarked(post.id)
                  ? 'bg-[#D44D2E] text-white'
                  : 'bg-[#F3F1EC] text-[#6B665F] hover:bg-[#E5E2DC]'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
              <span>{isBookmarked(post.id) ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#F3F1EC] text-[#6B665F] hover:bg-[#E5E2DC] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Author Bio Card */}
        <div className="my-12 p-6 sm:p-8 bg-white rounded-2xl border border-[#E5E2DC] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={post.author?.avatar || settings.authorAvatar}
            alt={post.author?.name || settings.authorName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-[#E5E2DC] shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Written by {post.author?.name || settings.authorName}</h3>
              <span className="text-xs bg-[#F9EBE7] text-[#942C17] font-semibold px-2 py-0.5 rounded-full">
                Author
              </span>
            </div>
            <p className="mt-2 text-sm text-[#6B665F] leading-relaxed">
              {settings.authorBio}
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-[#D44D2E]">
              {settings.socialLinks.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="hover:underline">
                  Instagram
                </a>
              )}
              {settings.socialLinks.github && (
                <a href={settings.socialLinks.github} target="_blank" rel="noreferrer" className="hover:underline">
                  GitHub
                </a>
              )}
              {settings.socialLinks.website && (
                <a href={settings.socialLinks.website} target="_blank" rel="noreferrer" className="hover:underline">
                  Website
                </a>
              )}
              {settings.socialLinks.email && (
                <a href={`mailto:${settings.socialLinks.email}`} className="hover:underline">
                  Email
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Post Footer Newsletter CTA */}
        <div className="my-12 p-6 sm:p-8 bg-[#1A1A1A] text-white rounded-2xl shadow-xl">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[#E06D53] text-xs font-semibold tracking-wider uppercase mb-2">
              <Mail className="w-4 h-4" />
              <span>Enjoyed this essay?</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              Subscribe to {settings.newsletterTitle}
            </h3>
            <p className="mt-2 text-sm text-[#D3CEC4] leading-relaxed">
              Get {settings.authorName ? `${settings.authorName}’s` : 'the'} next essay delivered cleanly to your inbox every Sunday morning. No spam, ever.
            </p>
            <form onSubmit={handleFooterSubscribe} className="mt-5 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="Your email address..."
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-[#9C968B] text-sm focus:outline-hidden focus:border-[#E06D53] focus:bg-white/15"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#D44D2E] hover:bg-[#B83C1F] text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer"
              >
                Join Free
              </button>
            </form>
            {newsletterMsg && (
              <p className="mt-3 text-xs text-[#E06D53] font-medium">
                {newsletterMsg}
              </p>
            )}
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="my-14">
            <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-6">
              Further Reading
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => onSelectPost(rel)}
                  className="p-5 bg-white rounded-2xl border border-[#E5E2DC] hover:border-[#D44D2E]/50 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <span className="text-[10px] uppercase font-semibold text-[#D44D2E] tracking-wider">
                    {rel.category}
                  </span>
                  <h4 className="font-serif font-bold text-lg text-[#1A1A1A] group-hover:text-[#D44D2E] transition-colors mt-1">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-[#6B665F] line-clamp-2 mt-2">
                    {rel.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISITOR COMMENTS SECTION */}
        <section id="comments-section" className="mt-16 pt-10 border-t border-[#E5E2DC]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                Discussion ({postComments.length})
              </h3>
              <p className="text-xs sm:text-sm text-[#6B665F] mt-1">
                Share your thoughts or perspective. No account or email needed.
              </p>
            </div>
          </div>

          {/* New Comment Box */}
          <form onSubmit={handleAddComment} className="p-5 bg-white rounded-2xl border border-[#E5E2DC] shadow-xs mb-10">
            <div className="mb-3">
              <label htmlFor="comment-author-name" className="block text-xs font-semibold text-[#6B665F] uppercase tracking-wider mb-1.5">
                Your Name *
              </label>
              <input
                id="comment-author-name"
                type="text"
                required
                placeholder="e.g. Maria Gonzalez"
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl focus:outline-hidden focus:border-[#D44D2E]"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="comment-content-text" className="block text-xs font-semibold text-[#6B665F] uppercase tracking-wider mb-1.5">
                Comment *
              </label>
              <textarea
                id="comment-content-text"
                required
                rows={3}
                placeholder="Write a thoughtful reflection, question, or feedback..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl focus:outline-hidden focus:border-[#D44D2E]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#9C968B]">
                Visitors can comment anonymously with just a name.
              </span>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#332F2A] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Post Comment
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {rootComments.length > 0 ? (
              rootComments.map(comment => {
                const replies = getReplies(comment.id);
                return (
                  <div
                    key={comment.id}
                    className="p-5 bg-white rounded-2xl border border-[#E5E2DC] shadow-2xs space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#F9EBE7] text-[#942C17] font-bold flex items-center justify-center text-sm font-serif">
                          {comment.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#1A1A1A]">
                              {comment.authorName}
                            </span>
                            {comment.isAuthorReply && (
                              <span className="text-[10px] bg-[#942C17] text-white px-1.5 py-0.2 rounded font-semibold">
                                Author
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#6B665F]">
                            {new Date(comment.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {isAdminLoggedIn && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="text-[#9C968B] hover:text-red-600 transition-colors p-1"
                          title="Delete comment (Admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-[#4D4842] leading-relaxed pl-12">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4 pl-12 pt-1 text-xs text-[#6B665F]">
                      <button
                        onClick={() => likeComment(comment.id)}
                        className="flex items-center gap-1 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{comment.likes}</span>
                      </button>

                      <button
                        onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                        className="flex items-center gap-1 hover:text-[#D44D2E] font-medium transition-colors cursor-pointer"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>{replyToId === comment.id ? 'Cancel' : 'Reply'}</span>
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyToId === comment.id && (
                      <div className="ml-12 mt-3 p-4 bg-[#F9F8F6] rounded-xl border border-[#E5E2DC] animate-in fade-in duration-150">
                        <div className="mb-2">
                          <input
                            type="text"
                            placeholder="Your Name"
                            value={replyName}
                            onChange={e => setReplyName(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E2DC] rounded-lg mb-2 focus:outline-hidden focus:border-[#D44D2E]"
                          />
                          <textarea
                            rows={2}
                            placeholder={`Reply to ${comment.authorName}...`}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#E5E2DC] rounded-lg focus:outline-hidden focus:border-[#D44D2E]"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyToId(null)}
                            className="px-3 py-1 text-xs text-[#6B665F] hover:text-[#1A1A1A] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddReply(comment.id)}
                            className="px-4 py-1 bg-[#1A1A1A] text-white rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Submit Reply
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                      <div className="ml-12 space-y-3 pt-3 border-t border-[#F3F1EC]">
                        {replies.map(reply => (
                          <div key={reply.id} className="p-3.5 bg-[#F9F8F6] rounded-xl border border-[#E5E2DC]/80">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-[#1A1A1A]">{reply.authorName}</span>
                                {reply.isAuthorReply && (
                                  <span className="text-[9px] bg-[#942C17] text-white px-1.5 py-0.2 rounded font-semibold">
                                    Author
                                  </span>
                                )}
                                <span className="text-[10px] text-[#9C968B]">
                                  {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              {isAdminLoggedIn && (
                                <button
                                  onClick={() => deleteComment(reply.id)}
                                  className="text-[#9C968B] hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-[#4D4842] leading-relaxed">
                              {reply.content}
                            </p>
                            <div className="mt-2">
                              <button
                                onClick={() => likeComment(reply.id)}
                                className="flex items-center gap-1 text-[11px] text-[#6B665F] hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E2DC] p-6">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-[#9C968B]" />
                <p className="font-serif text-base font-semibold text-[#1A1A1A]">No comments yet</p>
                <p className="text-xs text-[#6B665F] mt-1">
                  Be the first to share a thought on this essay!
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
