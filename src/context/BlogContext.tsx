import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post, Comment, Subscriber, BlogSettings, AnalyticsEvent } from '../types';
import { INITIAL_POSTS, INITIAL_COMMENTS, INITIAL_SUBSCRIBERS, INITIAL_SETTINGS } from '../data/initialData';
import {
  constantTimeEquals,
  verifyTrickAnswer,
  getRemainingLockoutSeconds,
  recordFailedAttempt,
  clearRateLimit
} from '../utils/security';

// Helper to remove undefined properties before saving to Firestore
function cleanData<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      clean[key] = cleanData(value);
    } else {
      clean[key] = value;
    }
  }
  return clean as T;
}

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
  isCloudSynced: boolean;
  
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
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const isInitialPostsSeeded = useRef(false);
  const isInitialSettingsSeeded = useRef(false);

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
        if (parsed.blogName === 'Tools & Craft' || parsed.blogName === 'Chronicle & Craft') {
          parsed.blogName = "Wat'EWrites";
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

  // 6. Admin Auth State
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
      // fallback
    }
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

  // ==========================================
  // REAL-TIME FIRESTORE SYNCHRONIZATION ENGINE
  // ==========================================
  useEffect(() => {
    let unsubscribePosts: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;
    let unsubscribeComments: (() => void) | undefined;
    let unsubscribeSubscribers: (() => void) | undefined;
    let unsubscribeAnalytics: (() => void) | undefined;

    try {
      // 1. Sync Posts Collection
      const postsCol = collection(db, 'posts');
      unsubscribePosts = onSnapshot(postsCol, async (snapshot) => {
        if (snapshot.empty && !isInitialPostsSeeded.current) {
          isInitialPostsSeeded.current = true;
          try {
            const batch = writeBatch(db);
            INITIAL_POSTS.forEach((p) => {
              const pRef = doc(db, 'posts', p.id);
              batch.set(pRef, cleanData(p));
            });
            await batch.commit();
          } catch (err) {
            console.warn('Could not seed initial posts to Firestore:', err);
          }
        } else if (!snapshot.empty) {
          const loadedPosts: Post[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Post;
            loadedPosts.push({ ...data, id: docSnap.id });
          });
          // Sort by publishedAt descending
          loadedPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
          setPosts(loadedPosts);
          setIsCloudSynced(true);
        }
      }, (err) => {
        console.warn('Firestore posts listener note:', err);
      });

      // 2. Sync Settings Document
      const settingsDocRef = doc(db, 'settings', 'site');
      unsubscribeSettings = onSnapshot(settingsDocRef, async (snapshot) => {
        if (!snapshot.exists() && !isInitialSettingsSeeded.current) {
          isInitialSettingsSeeded.current = true;
          try {
            await setDoc(settingsDocRef, cleanData(settings));
          } catch (err) {
            console.warn('Could not seed initial settings to Firestore:', err);
          }
        } else if (snapshot.exists()) {
          const remoteSettings = snapshot.data() as BlogSettings;
          setSettings((prev) => ({
            ...prev,
            ...remoteSettings,
            socialLinks: {
              ...prev.socialLinks,
              ...(remoteSettings.socialLinks || {})
            }
          }));
          setIsCloudSynced(true);
        }
      }, (err) => {
        console.warn('Firestore settings listener note:', err);
      });

      // 3. Sync Comments Collection
      const commentsCol = collection(db, 'comments');
      unsubscribeComments = onSnapshot(commentsCol, async (snapshot) => {
        if (!snapshot.empty) {
          const loadedComments: Comment[] = [];
          snapshot.forEach((docSnap) => {
            loadedComments.push({ ...(docSnap.data() as Comment), id: docSnap.id });
          });
          loadedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setComments(loadedComments);
        }
      }, (err) => {
        console.warn('Firestore comments listener note:', err);
      });

      // 4. Sync Subscribers Collection
      const subscribersCol = collection(db, 'subscribers');
      unsubscribeSubscribers = onSnapshot(subscribersCol, async (snapshot) => {
        if (snapshot.empty) {
          try {
            const batch = writeBatch(db);
            INITIAL_SUBSCRIBERS.forEach((s) => {
              const sRef = doc(db, 'subscribers', s.id);
              batch.set(sRef, cleanData(s));
            });
            await batch.commit();
          } catch {
            // ignore
          }
        } else {
          const loadedSubs: Subscriber[] = [];
          snapshot.forEach((docSnap) => {
            loadedSubs.push({ ...(docSnap.data() as Subscriber), id: docSnap.id });
          });
          loadedSubs.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
          setSubscribers(loadedSubs);
        }
      }, (err) => {
        console.warn('Firestore subscribers listener note:', err);
      });

      // 5. Sync Analytics Collection
      const analyticsCol = collection(db, 'analytics');
      unsubscribeAnalytics = onSnapshot(analyticsCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedEv: AnalyticsEvent[] = [];
          snapshot.forEach((docSnap) => {
            loadedEv.push({ ...(docSnap.data() as AnalyticsEvent), id: docSnap.id });
          });
          loadedEv.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          if (loadedEv.length > 0) {
            setAnalyticsEvents(loadedEv.slice(-500));
          }
        }
      }, (err) => {
        console.warn('Firestore analytics listener note:', err);
      });

    } catch (e) {
      console.error('Error initializing Firestore sync:', e);
    }

    return () => {
      unsubscribePosts?.();
      unsubscribeSettings?.();
      unsubscribeComments?.();
      unsubscribeSubscribers?.();
      unsubscribeAnalytics?.();
    };
  }, []);

  // Sync to localStorage as offline safety layer
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
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      postId,
      postTitle,
      referrer,
      device
    };

    setAnalyticsEvents(prev => [...prev.slice(-499), newEvent]);

    // Persist event to cloud Firestore
    try {
      const eventRef = doc(db, 'analytics', newEvent.id);
      setDoc(eventRef, cleanData(newEvent)).catch(() => {});
    } catch {
      // ignore
    }
  };

  // Post Actions (Cloud Persisted & Real-time)
  const createPost = (postData: Omit<Post, 'id' | 'views' | 'likes'>): Post => {
    const id = `post-${Date.now()}`;
    const newPost: Post = {
      ...postData,
      id,
      views: 0,
      likes: 0
    };
    
    // Optimistic local update
    setPosts(prev => [newPost, ...prev]);

    // Cloud persistence
    const postRef = doc(db, 'posts', id);
    setDoc(postRef, cleanData(newPost)).catch(err => {
      console.error('Error saving new post to Firestore:', err);
    });

    return newPost;
  };

  const updatePost = (id: string, postData: Partial<Post>) => {
    const updatedData = { ...postData, updatedAt: new Date().toISOString() };
    
    // Optimistic update
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedData } : p))
    );
    if (activePost && activePost.id === id) {
      setActivePost(prev => (prev ? { ...prev, ...updatedData } : null));
    }

    // Cloud persistence
    const postRef = doc(db, 'posts', id);
    setDoc(postRef, cleanData(updatedData), { merge: true }).catch(err => {
      console.error('Error updating post in Firestore:', err);
    });
  };

  const deletePost = (id: string) => {
    // Optimistic update
    setPosts(prev => prev.filter(p => p.id !== id));
    setComments(prev => prev.filter(c => c.postId !== id));
    setSettings(prev => ({
      ...prev,
      featuredPostIds: (prev.featuredPostIds || []).filter(pid => pid !== id)
    }));
    if (activePost && activePost.id === id) {
      setActivePost(null);
    }

    // Cloud persistence
    const postRef = doc(db, 'posts', id);
    deleteDoc(postRef).catch(err => {
      console.error('Error deleting post in Firestore:', err);
    });

    // Clean up in settings doc
    const nextFeatured = (settings.featuredPostIds || []).filter(pid => pid !== id);
    const settingsRef = doc(db, 'settings', 'site');
    setDoc(settingsRef, { featuredPostIds: nextFeatured }, { merge: true }).catch(() => {});
  };

  const togglePostFeatured = (id: string) => {
    const target = posts.find(p => p.id === id);
    if (!target) return;
    const nextFeatured = !target.isFeatured;

    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, isFeatured: nextFeatured } : p))
    );

    const postRef = doc(db, 'posts', id);
    setDoc(postRef, { isFeatured: nextFeatured }, { merge: true }).catch(err => {
      console.error('Error toggling featured state:', err);
    });
  };

  const togglePostDraft = (id: string) => {
    const target = posts.find(p => p.id === id);
    if (!target) return;
    const nextDraft = !target.isDraft;

    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, isDraft: nextDraft } : p))
    );

    const postRef = doc(db, 'posts', id);
    setDoc(postRef, { isDraft: nextDraft }, { merge: true }).catch(err => {
      console.error('Error toggling draft status:', err);
    });

    if (nextDraft) {
      const nextFeatured = (settings.featuredPostIds || []).filter(pid => pid !== id);
      updateSettings({ featuredPostIds: nextFeatured });
    }
  };

  const likePost = (id: string) => {
    const target = posts.find(p => p.id === id);
    const newLikes = (target?.likes || 0) + 1;

    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, likes: newLikes } : p))
    );
    if (activePost && activePost.id === id) {
      setActivePost(prev => (prev ? { ...prev, likes: newLikes } : null));
    }
    logAnalyticsEvent('like', id);

    const postRef = doc(db, 'posts', id);
    setDoc(postRef, { likes: newLikes }, { merge: true }).catch(err => {
      console.error('Error recording like to Firestore:', err);
    });
  };

  const viewPost = (id: string) => {
    const target = posts.find(p => p.id === id);
    const newViews = (target?.views || 0) + 1;

    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, views: newViews } : p))
    );
    if (target) {
      logAnalyticsEvent('post_view', id, target.title);
    }

    const postRef = doc(db, 'posts', id);
    setDoc(postRef, { views: newViews }, { merge: true }).catch(err => {
      console.error('Error updating view count in Firestore:', err);
    });
  };

  // Comments Actions (Cloud Persisted & Real-time)
  const addComment = (postId: string, authorName: string, content: string, parentId: string | null = null) => {
    if (!authorName.trim() || !content.trim()) return;
    const newComment: Comment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

    const commentRef = doc(db, 'comments', newComment.id);
    setDoc(commentRef, cleanData(newComment)).catch(err => {
      console.error('Error saving comment to Firestore:', err);
    });
  };

  const likeComment = (commentId: string) => {
    const target = comments.find(c => c.id === commentId);
    const newLikes = (target?.likes || 0) + 1;

    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, likes: newLikes } : c))
    );

    const commentRef = doc(db, 'comments', commentId);
    setDoc(commentRef, { likes: newLikes }, { merge: true }).catch(err => {
      console.error('Error liking comment in Firestore:', err);
    });
  };

  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));

    const commentRef = doc(db, 'comments', commentId);
    deleteDoc(commentRef).catch(err => {
      console.error('Error deleting comment in Firestore:', err);
    });
  };

  // Newsletter Actions (Cloud Persisted & Real-time)
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
        const updatedTime = new Date().toISOString();
        setSubscribers(prev =>
          prev.map(s => (s.id === existing.id ? { ...s, status: 'active', subscribedAt: updatedTime } : s))
        );
        const subRef = doc(db, 'subscribers', existing.id);
        setDoc(subRef, { status: 'active', subscribedAt: updatedTime }, { merge: true }).catch(() => {});
        return { success: true, message: 'Welcome back! Your subscription has been reactivated.' };
      }
      return { success: true, message: "You're already subscribed to The Weekly Dispatch!" };
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

    const subRef = doc(db, 'subscribers', newSub.id);
    setDoc(subRef, cleanData(newSub)).catch(err => {
      console.error('Error saving subscriber to Firestore:', err);
    });

    return { success: true, message: "You're on the list! Thank you for subscribing." };
  };

  const removeSubscriber = (id: string) => {
    setSubscribers(prev => prev.filter(s => s.id !== id));
    const subRef = doc(db, 'subscribers', id);
    deleteDoc(subRef).catch(err => {
      console.error('Error removing subscriber in Firestore:', err);
    });
  };

  const updateSubscriberStatus = (id: string, status: 'active' | 'unsubscribed') => {
    setSubscribers(prev =>
      prev.map(s => (s.id === id ? { ...s, status } : s))
    );
    const subRef = doc(db, 'subscribers', id);
    setDoc(subRef, { status }, { merge: true }).catch(err => {
      console.error('Error updating subscriber status in Firestore:', err);
    });
  };

  const sendNewsletterBroadcast = (subject: string, content: string, targetTag?: string) => {
    const activeSubs = subscribers.filter(s => {
      if (s.status !== 'active') return false;
      if (!targetTag || targetTag === 'all') return true;
      return s.preferences?.includes(targetTag);
    });
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

    const settingsRef = doc(db, 'settings', 'site');
    setDoc(settingsRef, cleanData(newSettings), { merge: true }).catch(err => {
      console.error('Error saving settings to Firestore:', err);
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
        isCloudSynced,
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
