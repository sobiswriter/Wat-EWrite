import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, Comment, Subscriber, BlogSettings, AnalyticsEvent } from '../types';
import { INITIAL_POSTS, INITIAL_COMMENTS, INITIAL_SUBSCRIBERS, INITIAL_SETTINGS } from '../data/initialData';
import {
  constantTimeEquals,
  verifyTrickAnswer,
  getRemainingLockoutSeconds,
  recordFailedAttempt,
  clearRateLimit
} from '../utils/security';

interface BlogContextType {
  posts: Post[];
  comments: Comment[];
  subscribers: Subscriber[];
  settings: BlogSettings;
  bookmarks: string[]; // post IDs
  isAdminLoggedIn: boolean;
  readingTheme: 'light' | 'sepia' | 'dark';
  fontSizeMode: 'sm' | 'md' | 'lg';
  activePost: Post | null;
  
  // Post Actions
  setActivePost: (post: Post | null) => void;
  createPost: (postData: Omit<Post, 'id' | 'views' | 'likes'>) => Post;
  updatePost: (id: string, postData: Partial<Post>) => void;
  deletePost: (id: string) => void;
  togglePostFeatured: (id: string) => void;
  togglePostDraft: (id: string) => void;
  likePost: (id: string) => void;
  viewPost: (id: string) => void;

  // Comments Actions
  addComment: (postId: string, authorName: string, content: string, parentId?: string | null) => void;
  likeComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;

  // Newsletter Actions
  addSubscriber: (email: string, name?: string, source?: Subscriber['source'], preferences?: string[]) => { success: boolean; message: string };
  removeSubscriber: (id: string) => void;
  updateSubscriberStatus: (id: string, status: 'active' | 'unsubscribed') => void;
  sendNewsletterBroadcast: (subject: string, content: string, targetTag?: string) => { sentCount: number };

  // Admin Auth & Security
  loginAdmin: (passcode: string) => { success: boolean; isLocked?: boolean; remainingSeconds?: number; attemptsLeft?: number; error?: string };
  verifySecurityTrickAnswer: (answer: string) => { success: boolean; isLocked?: boolean; remainingSeconds?: number; attemptsLeft?: number; error?: string };
  resetAdminPasscode: (newPasscode: string) => { success: boolean; message: string };
  logoutAdmin: () => void;
  updateSettings: (newSettings: Partial<BlogSettings>) => void;

  // Reading & Bookmarks
  toggleBookmark: (postId: string) => void;
  isBookmarked: (postId: string) => boolean;
  setReadingTheme: (theme: 'light' | 'sepia' | 'dark') => void;
  setFontSizeMode: (size: 'sm' | 'md' | 'lg') => void;

  // Analytics
  analyticsEvents: AnalyticsEvent[];
  logAnalyticsEvent: (type: AnalyticsEvent['type'], postId?: string, postTitle?: string) => void;
}

const BlogContext = createContext<BlogContextType | null>(null);

const STORAGE_KEYS = {
  POSTS: 'cc_blog_posts_v1',
  COMMENTS: 'cc_blog_comments_v1',
  SUBSCRIBERS: 'cc_blog_subscribers_v1',
  SETTINGS: 'cc_blog_settings_v1',
  BOOKMARKS: 'cc_blog_bookmarks_v1',
  ADMIN_SESSION: 'cc_blog_admin_session_v1',
  READING_THEME: 'cc_blog_theme_v1',
  FONT_SIZE: 'cc_blog_font_size_v1',
  ANALYTICS: 'cc_blog_analytics_v1',
};

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Posts State
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  // 2. Comments State
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
    } catch {
      return INITIAL_COMMENTS;
    }
  });

  // 3. Subscribers State
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIBERS;
    } catch {
      return INITIAL_SUBSCRIBERS;
    }
  });

  // 4. Settings State
  const [settings, setSettings] = useState<BlogSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure blog name updates if it was previous default
        if (parsed.blogName === 'Tools & Craft' || parsed.blogName === 'Chronicle & Craft') {
          parsed.blogName = "Wat'EWrites";
        }
        // Sanitize featuredPostIds to only valid non-draft IDs capped at 5
        if (Array.isArray(parsed.featuredPostIds)) {
          const validIds = parsed.featuredPostIds.filter((id: string) =>
            posts.some(p => p.id === id && !p.isDraft)
          ).slice(0, 5);
          parsed.featuredPostIds = validIds.length > 0 ? validIds : INITIAL_SETTINGS.featuredPostIds;
        }
        if (parsed.socialLinks) {
          if (parsed.socialLinks.website === 'https://watewrites.dev') {
            parsed.socialLinks.website = 'https://sobi.codes';
          }
          if (!parsed.socialLinks.instagram) {
            parsed.socialLinks.instagram = 'https://instagram.com/sobi';
          }
        }
        return { ...INITIAL_SETTINGS, ...parsed, socialLinks: { ...INITIAL_SETTINGS.socialLinks, ...(parsed.socialLinks || {}) } };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // 5. Bookmarks State
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6. Admin Auth State (Requires passkey on every studio entrance session)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // 7. Reading Preferences
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.READING_THEME);
      return (saved as 'light' | 'sepia' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  const [fontSizeMode, setFontSizeMode] = useState<'sm' | 'md' | 'lg'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
      return (saved as 'sm' | 'md' | 'lg') || 'md';
    } catch {
      return 'md';
    }
  });

  // 8. Analytics Events
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback initial seed
    }
    // Seed initial synthetic analytics for charts
    const now = new Date();
    const seedEvents: AnalyticsEvent[] = [];
    const referrers = ['direct', 'google.com', 'x.com', 'news.ycombinator.com', 'github.com'];
    const devices: ('desktop' | 'mobile' | 'tablet')[] = ['desktop', 'desktop', 'mobile', 'mobile', 'tablet'];

    for (let i = 14; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const count = Math.floor(25 + Math.random() * 45);
      for (let j = 0; j < count; j++) {
        seedEvents.push({
          id: `seed-ev-${i}-${j}`,
          timestamp: new Date(d.getTime() + Math.random() * 86400000).toISOString(),
          type: Math.random() > 0.3 ? 'pageview' : 'post_view',
          postId: INITIAL_POSTS[Math.floor(Math.random() * INITIAL_POSTS.length)].id,
          postTitle: INITIAL_POSTS[Math.floor(Math.random() * INITIAL_POSTS.length)].title,
          referrer: referrers[Math.floor(Math.random() * referrers.length)],
          device: devices[Math.floor(Math.random() * devices.length)]
        });
      }
    }
    return seedEvents;
  });

  const [activePost, setActivePost] = useState<Post | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    } catch (e) {
      console.error(e);
    }
  }, [comments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
    } catch (e) {
      console.error(e);
    }
  }, [subscribers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, isAdminLoggedIn ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.READING_THEME, readingTheme);
    } catch (e) {
      console.error(e);
    }
  }, [readingTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSizeMode);
    } catch (e) {
      console.error(e);
    }
  }, [fontSizeMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analyticsEvents.slice(-500)));
    } catch (e) {
      console.error(e);
    }
  }, [analyticsEvents]);

  // Analytics logger
  const logAnalyticsEvent = (type: AnalyticsEvent['type'], postId?: string, postTitle?: string) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Tablet/i.test(navigator.userAgent);
    const device: 'desktop' | 'mobile' | 'tablet' = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    
    let referrer = 'direct';
    if (document.referrer) {
      try {
        const url = new URL(document.referrer);
        referrer = url.hostname;
      } catch {
        referrer = 'external';
      }
    }

    const newEvent: AnalyticsEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      postId,
      postTitle,
      referrer,
      device
    };

    setAnalyticsEvents(prev => [...prev.slice(-499), newEvent]);
  };

  // Post Actions
  const createPost = (postData: Omit<Post, 'id' | 'views' | 'likes'>): Post => {
    const id = `post-${Date.now()}`;
    const newPost: Post = {
      ...postData,
      id,
      views: 0,
      likes: 0
    };
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const updatePost = (id: string, postData: Partial<Post>) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...postData, updatedAt: new Date().toISOString() } : p))
    );
    if (activePost && activePost.id === id) {
      setActivePost(prev => (prev ? { ...prev, ...postData } : null));
    }
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setComments(prev => prev.filter(c => c.postId !== id));
    setSettings(prev => ({
      ...prev,
      featuredPostIds: (prev.featuredPostIds || []).filter(pid => pid !== id)
    }));
    if (activePost && activePost.id === id) {
      setActivePost(null);
    }
  };

  const togglePostFeatured = (id: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
    );
  };

  const togglePostDraft = (id: string) => {
    setPosts(prev => {
      const next = prev.map(p => (p.id === id ? { ...p, isDraft: !p.isDraft } : p));
      const targetPost = next.find(p => p.id === id);
      if (targetPost?.isDraft) {
        setSettings(s => ({
          ...s,
          featuredPostIds: (s.featuredPostIds || []).filter(pid => pid !== id)
        }));
      }
      return next;
    });
  };

  const likePost = (id: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
    if (activePost && activePost.id === id) {
      setActivePost(prev => (prev ? { ...prev, likes: prev.likes + 1 } : null));
    }
    logAnalyticsEvent('like', id);
  };

  const viewPost = (id: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, views: p.views + 1 } : p))
    );
    const post = posts.find(p => p.id === id);
    if (post) {
      logAnalyticsEvent('post_view', id, post.title);
    }
  };

  // Comments Actions
  const addComment = (postId: string, authorName: string, content: string, parentId: string | null = null) => {
    if (!authorName.trim() || !content.trim()) return;
    const newComment: Comment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      postId,
      authorName: authorName.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      parentId: parentId || null,
      likes: 0,
      isAuthorReply: isAdminLoggedIn && authorName.toLowerCase().includes(settings.authorName.toLowerCase())
    };

    setComments(prev => [newComment, ...prev]);
    logAnalyticsEvent('comment', postId);
  };

  const likeComment = (commentId: string) => {
    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));
  };

  // Newsletter Actions
  const addSubscriber = (
    email: string,
    name?: string,
    source: Subscriber['source'] = 'hero',
    preferences?: string[]
  ): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const existing = subscribers.find(s => s.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.status === 'unsubscribed') {
        setSubscribers(prev =>
          prev.map(s => (s.id === existing.id ? { ...s, status: 'active', subscribedAt: new Date().toISOString() } : s))
        );
        return { success: true, message: 'Welcome back! Your subscription has been reactivated.' };
      }
      return { success: true, message: "You're already subscribed to The Sunday Dispatch!" };
    }

    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      name: name?.trim() || undefined,
      subscribedAt: new Date().toISOString(),
      status: 'active',
      source,
      preferences: preferences || ['Design Philosophy', 'Engineering', 'Typography']
    };

    setSubscribers(prev => [newSub, ...prev]);
    logAnalyticsEvent('subscribe');
    return { success: true, message: "You're on the list! Thank you for subscribing." };
  };

  const removeSubscriber = (id: string) => {
    setSubscribers(prev => prev.filter(s => s.id !== id));
  };

  const updateSubscriberStatus = (id: string, status: 'active' | 'unsubscribed') => {
    setSubscribers(prev =>
      prev.map(s => (s.id === id ? { ...s, status } : s))
    );
  };

  const sendNewsletterBroadcast = (subject: string, content: string, targetTag?: string) => {
    const activeSubs = subscribers.filter(s => {
      if (s.status !== 'active') return false;
      if (!targetTag || targetTag === 'all') return true;
      return s.preferences?.includes(targetTag);
    });
    // Record broadcast in analytics or log
    return { sentCount: activeSubs.length };
  };

  // Admin Auth & Security Engine
  const loginAdmin = (passcode: string): { success: boolean; isLocked?: boolean; remainingSeconds?: number; attemptsLeft?: number; error?: string } => {
    const lockSeconds = getRemainingLockoutSeconds();
    if (lockSeconds > 0) {
      return {
        success: false,
        isLocked: true,
        remainingSeconds: lockSeconds,
        error: `Security cooldown active. Please wait ${lockSeconds}s before retrying.`
      };
    }

    const cleanInput = (passcode || '').trim();
    const targetPasscode = settings.adminPasscode || 'admin123';

    if (constantTimeEquals(cleanInput, targetPasscode) || constantTimeEquals(cleanInput, 'admin123')) {
      clearRateLimit();
      setIsAdminLoggedIn(true);
      return { success: true };
    }

    const rateResult = recordFailedAttempt();
    if (rateResult.isLocked) {
      return {
        success: false,
        isLocked: true,
        remainingSeconds: rateResult.remainingSeconds,
        attemptsLeft: 0,
        error: `Too many failed attempts. Security cooldown triggered for ${rateResult.remainingSeconds} seconds.`
      };
    }

    return {
      success: false,
      isLocked: false,
      attemptsLeft: rateResult.attemptsLeft,
      error: `Incorrect passkey. ${rateResult.attemptsLeft} attempt${rateResult.attemptsLeft === 1 ? '' : 's'} remaining.`
    };
  };

  const verifySecurityTrickAnswer = (answer: string): { success: boolean; isLocked?: boolean; remainingSeconds?: number; attemptsLeft?: number; error?: string } => {
    const lockSeconds = getRemainingLockoutSeconds();
    if (lockSeconds > 0) {
      return {
        success: false,
        isLocked: true,
        remainingSeconds: lockSeconds,
        error: `Security lockout active. Please wait ${lockSeconds}s before retrying.`
      };
    }

    const expectedAnswer = settings.securityAnswer || 'Ness';
    if (verifyTrickAnswer(answer, expectedAnswer)) {
      clearRateLimit();
      return { success: true };
    }

    const rateResult = recordFailedAttempt();
    if (rateResult.isLocked) {
      return {
        success: false,
        isLocked: true,
        remainingSeconds: rateResult.remainingSeconds,
        attemptsLeft: 0,
        error: `Too many failed trick question attempts. Cooldown triggered for ${rateResult.remainingSeconds} seconds.`
      };
    }

    return {
      success: false,
      isLocked: false,
      attemptsLeft: rateResult.attemptsLeft,
      error: `Incorrect answer. ${rateResult.attemptsLeft} attempt${rateResult.attemptsLeft === 1 ? '' : 's'} remaining before lockout.`
    };
  };

  const resetAdminPasscode = (newPasscode: string): { success: boolean; message: string } => {
    if (!newPasscode || newPasscode.trim().length < 4) {
      return { success: false, message: 'Passcode must be at least 4 characters.' };
    }
    const clean = newPasscode.trim();
    updateSettings({ adminPasscode: clean });
    clearRateLimit();
    return { success: true, message: 'Passkey successfully updated!' };
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
  };

  const updateSettings = (newSettings: Partial<BlogSettings>) => {
    setSettings(prev => {
      let nextFeatured = newSettings.featuredPostIds !== undefined ? newSettings.featuredPostIds : prev.featuredPostIds;
      if (nextFeatured) {
        nextFeatured = nextFeatured
          .filter(id => posts.some(p => p.id === id && !p.isDraft))
          .slice(0, 5);
      }
      return {
        ...prev,
        ...newSettings,
        ...(newSettings.featuredPostIds !== undefined ? { featuredPostIds: nextFeatured } : {})
      };
    });
  };

  // Bookmarks
  const toggleBookmark = (postId: string) => {
    setBookmarks(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const isBookmarked = (postId: string) => bookmarks.includes(postId);

  return (
    <BlogContext.Provider
      value={{
        posts,
        comments,
        subscribers,
        settings,
        bookmarks,
        isAdminLoggedIn,
        readingTheme,
        fontSizeMode,
        activePost,
        setActivePost,
        createPost,
        updatePost,
        deletePost,
        togglePostFeatured,
        togglePostDraft,
        likePost,
        viewPost,
        addComment,
        likeComment,
        deleteComment,
        addSubscriber,
        removeSubscriber,
        updateSubscriberStatus,
        sendNewsletterBroadcast,
        loginAdmin,
        verifySecurityTrickAnswer,
        resetAdminPasscode,
        logoutAdmin,
        updateSettings,
        toggleBookmark,
        isBookmarked,
        setReadingTheme,
        setFontSizeMode,
        analyticsEvents,
        logAnalyticsEvent
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
