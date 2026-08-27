export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string; // ISO date string
  updatedAt?: string;
  readingTime: number; // in minutes
  isFeatured: boolean;
  isDraft: boolean;
  views: number;
  likes: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  likes: number;
  isAuthorReply?: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source: 'hero' | 'post_footer' | 'popup' | 'newsletter_page' | 'manual';
  preferences?: string[];
}

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  type: 'pageview' | 'post_view' | 'subscribe' | 'comment' | 'like';
  postId?: string;
  postTitle?: string;
  referrer: string;
  device: 'desktop' | 'mobile' | 'tablet';
}

export interface AboutPrinciple {
  number: string;
  title: string;
  desc: string;
}

export interface MetricItem {
  value: string;
  label: string;
}

export interface BlogSettings {
  blogName: string;
  tagline: string;
  description: string;
  volume: string;
  issue: string;
  journalSeason: string;
  heroTitle: string;
  heroSubtitle: string;
  featuredPostIds: string[]; // Ordered list of post IDs for top showcase
  categories: string[];
  metrics: MetricItem[];
  authorName: string;
  authorBio: string;
  authorAvatar: string;
  authorRole: string;
  authorLocation: string;
  aboutEditorialThesis: string;
  aboutEditorialSubtitle: string;
  aboutPrinciples: AboutPrinciple[];
  aboutColophon: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
    email?: string;
    website?: string;
  };
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterReadersCount: string;
  adminPasscode: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

export type ViewMode = 'home' | 'post' | 'archive' | 'newsletter' | 'about' | 'admin';
