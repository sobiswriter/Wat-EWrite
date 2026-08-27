import { Post, Comment, Subscriber, BlogSettings } from '../types';

export const INITIAL_SETTINGS: BlogSettings = {
  blogName: "Wat'EWrites",
  tagline: "Thoughts on the future of work, technology, and craft.",
  description: "Thoughts on the future of work, design systems, and digital architecture, from the people and teams creating it.",
  volume: "Vol. IV",
  issue: "Issue #48",
  journalSeason: "Autumn 2026 Journal",
  heroTitle: "Where Thoughtful Software Meets Timeless Craft.",
  heroSubtitle: "An independent digital journal dedicated to human-computer interaction, spatial tools, optical typography, and zero-bloat architecture.",
  featuredPostIds: [
    "post-ai-plastic",
    "post-hbr-knowledge",
    "post-1",
    "post-2",
    "post-3"
  ],
  categories: [
    "Notion HQ",
    "For Teams",
    "Tech",
    "Design Philosophy",
    "Inspiration",
    "Pioneers",
    "Typography"
  ],
  metrics: [
    { value: "5,200+", label: "Sunday Dispatch Readers" },
    { value: "0 Trackers", label: "Pure Content Privacy" },
    { value: "100/100", label: "Lighthouse Performance" },
    { value: "GSAP + React", label: "Fluid Interactive Motion" }
  ],
  authorName: "Sobi",
  authorBio: "Writer, engineer, and creator exploring technology, thoughtful software, and digital craftsmanship.",
  authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  authorRole: "Author & Creator",
  authorLocation: "Global",
  aboutEditorialThesis: "The modern digital landscape is overwhelmed with noise: ephemeral timelines, clickbait hype cycles, and superficial feature races. Wat'EWrites exists as a publication for deliberate thought, lasting tools, and human-computer symbiosis.",
  aboutEditorialSubtitle: "We explore software engineering with the reverence of an artisanal craft. Exceptional software is quiet, durable, fast, and crafted with deep respect for typography and human attention.",
  aboutPrinciples: [
    {
      number: "01",
      title: "Dignity of Subtraction",
      desc: "We measure tool quality by how much unnecessary complexity we can safely remove without sacrificing capability."
    },
    {
      number: "02",
      title: "Optical Typography",
      desc: "Typography is the interface. Mathematical step scales and baseline rhythm provide effortless reading comfort."
    },
    {
      number: "03",
      title: "Enduring Architecture",
      desc: "We favor foundational primitives and clean architecture that will endure decades rather than ephemeral trend cycles."
    }
  ],
  aboutColophon: "This publication is typeset in Plus Jakarta Sans for interface and headings and Fraunces for editorial accents and pull quotes. Monospace code blocks are rendered in JetBrains Mono.",
  socialLinks: {
    instagram: "https://instagram.com/sobi",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "editorial@watewrites.dev",
    website: "https://sobi.codes"
  },
  newsletterTitle: "The Weekly Dispatch",
  newsletterSubtitle: "Join 5,200+ founders, designers, and engineers receiving deep-dives on digital craft and curated web discoveries every Sunday.",
  newsletterReadersCount: "5,200+",
  adminPasscode: "admin123",
  securityQuestion: "Your Sister's Name...?",
  securityAnswer: "Ness"
};

export const INITIAL_POSTS: Post[] = [
  {
    id: "post-ai-plastic",
    slug: "ai-is-the-new-plastic",
    title: "AI is the new plastic",
    subtitle: "Plastic is in your car, your kitchen, the chair you're sitting on right now. AI is doing the same.",
    excerpt: "Plastic is in your car, your kitchen, the chair you're sitting on right now. And just as our most ubiquitous material transformed the world in a matter of decades, AI is doing the same.",
    content: `# AI is the new plastic

Plastic is in your car, your kitchen, the chair you're sitting on right now. And just as our most ubiquitous synthetic material transformed the material world in a matter of decades, artificial intelligence is undergoing the exact same trajectory.

When Bakelite was patented in 1907, people saw it as an exotic novelty—a cheap imitation of amber or ivory. Within forty years, polymers formed the invisible scaffolding of modern civilization: electrical insulation, medical syringes, aviation cockpits, and food preservation.

> "A transformative technology does not win by remaining miraculous; it wins by becoming mundane, invisible, and structural."

## From Novelty to Utility

Today, we are moving past the "novelty" epoch of AI—the phase characterized by chat boxes that write pirate limericks or generate surreal imagery. We are entering the **structural era**, where machine intelligence acts as a pliable, invisible computational substrate.

Here is how the shift is reorganizing software design:

1. **Ambient Inference over Chat Modals**: Users do not want to hold conversations with their database; they want their database to proactively organize, normalize, and surface relevant context without prompt gymnastics.
2. **Deterministic-Probabilistic Hybrids**: The greatest digital tools pair rigorous, predictable interfaces (fast search, reliable undo, transparent tables) with subtle heuristic elasticity.
3. **The Sanitation of Interfaces**: We must treat cognitive fatigue with the same seriousness that 20th-century urban planners treated environmental acoustics.

### The True Measure of Craft

The measure of great software craft in the AI decade will not be how flashy the model demo looks on social media, but how quietly and respectfully it integrates into the flow of human contemplation.`,
    coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80",
    category: "Notion HQ",
    tags: ["Artificial Intelligence", "Future of Work", "Software Craft", "Philosophy"],
    author: {
      name: "Sobi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      role: "Author"
    },
    publishedAt: "2026-08-25T10:00:00Z",
    readingTime: 4,
    isFeatured: true,
    isDraft: false,
    views: 3120,
    likes: 184,
    seoTitle: "AI is the new plastic — Wat'EWrites",
    seoDescription: "How artificial intelligence is shifting from conversational novelty into the invisible material substrate of modern knowledge work."
  },
  {
    id: "post-hbr-knowledge",
    slug: "how-ai-is-quietly-revolutionizing-knowledge-management",
    title: "Harvard Business Review: How AI is Quietly Revolutionizing Knowledge Management",
    subtitle: "AI is already streamlining the way we work. Might it be reshaping knowledge management and productivity at other companies too?",
    excerpt: "AI is already streamlining the way we work at scale. Might it be reshaping knowledge management, documentation hygiene, and organizational velocity at other companies too?",
    content: `# Harvard Business Review: How AI is Quietly Revolutionizing Knowledge Management

Knowledge management has historically been the graveyard of good intentions. Companies mandate wikis, internal documentation hubs, and meeting repository systems, yet within eighteen months, 60% of that data falls obsolete, unverified, and forgotten.

## The Entropy Problem

Human organizations generate information at an exponential rate, but human capacity to organize, tag, index, and prune that information scales linearly at best.

### Three Paradigms of the Intelligent Workspace

* **Automated Lineage**: Document edits automatically associate with meeting audio, PR reviews, and project tickets without manual cross-linking.
* **Semantic Verification**: Heuristics detect conflicting statements between product specs and roadmaps, prompting authors for resolution before confusion propagates.
* **Instant Synthesis**: Querying across two thousand engineering docs yields concise, grounded answers with strict citation backlinks.

> "When documentation updates itself, teams spend less time cataloging what was done and more time creating what comes next."`,
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
    category: "For Teams",
    tags: ["Knowledge Management", "Teams", "Productivity", "Enterprise"],
    author: {
      name: "Sobi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      role: "Author"
    },
    publishedAt: "2026-08-22T14:30:00Z",
    readingTime: 6,
    isFeatured: true,
    isDraft: false,
    views: 2450,
    likes: 142,
    seoTitle: "How AI is Quietly Revolutionizing Knowledge Management",
    seoDescription: "An exploration into modern knowledge architectures, organizational hygiene, and autonomous indexing."
  },
  {
    id: "post-1",
    slug: "the-art-of-restraint-in-modern-software",
    title: "The Art of Restraint in Modern Software Design",
    subtitle: "Why subtraction is the most potent engineering superpower we frequently ignore.",
    excerpt: "Every button we omit, every configuration toggle we decline to add, and every millisecond of cognitive load we eliminate is a quiet victory for the human sitting on the other side of the screen.",
    content: `# The Art of Restraint in Modern Software Design

In an era saturated with feature-bloated tools and endless notification pings, the most courageous design decision is often doing **less**.

> "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away."
> — Antoine de Saint-Exupéry

When we build software today, the default gravitational pull is always towards *addition*. We add settings tabs, we introduce modals where a simple search bar would suffice, and we clutter visual landscapes with gradients and popups.

## The Cognitive Cost of Optionality

Every dropdown choice imposes a tax on user attention. When psychological research examines decision fatigue, the findings are stark: users don't want infinite dials; they want **opinionated defaults created with immense empathy**.

Here are three pillars to cultivate architectural restraint:

1. **The Rule of Three Invocations**: Never abstract or create a configurable setting until at least three separate user cohorts run into a hard wall without it.
2. **Visual Silence**: Give interfaces breathing room. Whitespace is not empty void; it is the visual rhythm that lets typography articulate meaning.
3. **Subtractive Refactoring**: In every sprint, budget time for removing obsolete code paths, unread notification badges, and forgotten settings.

\`\`\`typescript
// Thoughtful, readable functional composition
export function calculateReadingTime(content: string, wpm = 220): number {
  const words = content.trim().split(/\\s+/).length;
  const minutes = Math.ceil(words / wpm);
  return Math.max(1, minutes);
}
\`\`\`

## Embracing Intentional Constraints

When you build with constraints, you are forced to solve root problems rather than masking them with peripheral features.`,
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80",
    category: "Design Philosophy",
    tags: ["Product Design", "Minimalism", "Craft", "Philosophy"],
    author: {
      name: "Sobi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      role: "Author"
    },
    publishedAt: "2026-08-20T09:30:00Z",
    readingTime: 4,
    isFeatured: true,
    isDraft: false,
    views: 1420,
    likes: 89,
    seoTitle: "The Art of Restraint in Modern Software Design",
    seoDescription: "Why subtraction is the most potent engineering superpower we frequently ignore in modern digital product design."
  },
  {
    id: "post-2",
    slug: "typography-systems-for-editorial-web",
    title: "Crafting Timeless Typography Systems on the Web",
    subtitle: "A practical guide to mathematical step scales, optical hierarchy, and baseline rhythm.",
    excerpt: "Typography is 95% of web design. When typography works in harmonious proportion, the reader forgets the interface entirely and communes directly with the thoughts.",
    content: `# Crafting Timeless Typography Systems on the Web

Typography is not merely the choice of a pretty typeface. It is the architectural foundation of information hierarchy, pacing, and human reading comfort.

## The Mathematical Step Scale

To achieve visual harmony, we reject arbitrary font sizes like \`17px\` or \`23px\`. Instead, we ground our typography in a musical ratio:

* **Major Second (1.125)**: Ideal for dense, functional dashboard applications.
* **Minor Third (1.200)**: Clean, balanced rhythm for technical documentation.
* **Major Third (1.250)**: Perfect for editorial magazines and reflective essays.

### Setting the Baseline Rhythm

When designing for long-form reading, keep these rules inviolable:

* **Measure**: Line width must remain between 60 and 75 characters (\`65ch\`).
* **Leading**: Body text requires a line-height of \`1.65\` to \`1.8\` for optical comfort.
* **Contrast Ratio**: Never drop below 4.5:1 against the background for standard text.

\`\`\`css
/* Clean editorial typographic scale */
:root {
  --font-serif: "Fraunces", Georgia, serif;
  --font-sans: "Plus Jakarta Sans", sans-serif;
  --measure-editorial: 68ch;
}
\`\`\`

## Pairing Sans and Serif with Intention

By combining a warm, expressive serif heading with a crisp, geometric sans body, we bridge historical warmth with digital precision.`,
    coverImage: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=1200&auto=format&fit=crop&q=80",
    category: "Typography",
    tags: ["Typography", "CSS", "UI Design", "Systems"],
    author: {
      name: "Sobi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      role: "Author"
    },
    publishedAt: "2026-08-14T14:15:00Z",
    readingTime: 5,
    isFeatured: false,
    isDraft: false,
    views: 980,
    likes: 64,
    seoTitle: "Crafting Timeless Typography Systems on the Web",
    seoDescription: "A practical guide to mathematical step scales, optical hierarchy, and baseline rhythm in modern web design."
  },
  {
    id: "post-3",
    slug: "building-fast-resilient-web-applications",
    title: "Building Fast, Zero-Dependency Architecture for the Long Haul",
    subtitle: "How to ship delightful user experiences while avoiding the 200MB node_modules trap.",
    excerpt: "Modern web tools are powerful, but complexity compounds quickly. Here is an architectural blueprint for shipping resilient web applications that run fast on any device.",
    content: `# Building Fast, Zero-Dependency Architecture for the Long Haul

Every dependency in your package manifest is an implicit contract: you inherit its bugs, security vulnerabilities, bundle weight, and maintenance lifecycle.

## Why Lightweight Architecture Wins

When we audit contemporary web performance, 80% of latency bottlenecks stem from excessive JavaScript execution time rather than network transmission.

### Guiding Principles

1. **Platform-First**: Use native browser APIs (\`IntersectionObserver\`, \`ResizeObserver\`, \`localStorage\`, \`URLSearchParams\`) before pulling an npm package.
2. **Tree-Shaking Discipline**: Keep bundle footprints tiny by inspecting module import overhead.
3. **Instant Interactive Previews**: Prioritize perceived performance with optimistic local updates.

\`\`\`typescript
// Native observer without external libraries
export function setupScrollProgress(
  onProgress: (percent: number) => void
): () => void {
  const handler = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const current = window.scrollY;
    onProgress(total > 0 ? (current / total) * 100 : 0);
  };
  
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}
\`\`\``,
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    category: "Tech",
    tags: ["Architecture", "Performance", "TypeScript", "Frontend"],
    author: {
      name: "Sobi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      role: "Author"
    },
    publishedAt: "2026-08-08T11:00:00Z",
    readingTime: 6,
    isFeatured: false,
    isDraft: false,
    views: 750,
    likes: 42,
    seoTitle: "Building Fast, Zero-Dependency Architecture",
    seoDescription: "An architectural blueprint for shipping resilient web applications that run fast on any device."
  },
  {
    id: "post-4",
    slug: "digital-gardens-vs-chronological-streams",
    title: "Why You Should Grow a Digital Garden",
    subtitle: "Rethinking the ephemeral social media feed in favor of cumulative personal knowledge.",
    excerpt: "Social feeds demand immediacy and outrage; digital gardens invite cultivation, slow thought, and interlinked ideas that ripen over years.",
    content: `# Why You Should Grow a Digital Garden

For the past fifteen years, the web has been dominated by the **stream**: chronological timelines that prioritize what was published five minutes ago over what is timeless.

## The Problem with the Stream

* Everything decays in relevance within 24 hours.
* Nuance is penalized in favor of provocative soundbites.
* Previous thoughts become buried rather than refined.

### Cultivating a Garden

A digital garden is fundamentally different. It is a collection of notes, essays, and experiments in varying states of growth.`,
    coverImage: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&auto=format&fit=crop&q=80",
    category: "Inspiration",
    tags: ["Digital Garden", "Writing", "Knowledge", "Culture"],
    author: {
      name: "Sobi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      role: "Author"
    },
    publishedAt: "2026-07-28T16:45:00Z",
    readingTime: 3,
    isFeatured: false,
    isDraft: false,
    views: 610,
    likes: 38,
    seoTitle: "Why You Should Grow a Digital Garden",
    seoDescription: "Rethinking ephemeral social media feeds in favor of cumulative personal knowledge and slow thought."
  },
  {
    id: "post-pioneers-engelbart",
    slug: "douglas-engelbarts-mother-of-all-demos",
    title: "The Mother of All Demos at 58: Lessons for Modern Toolmakers",
    subtitle: "What Douglas Engelbart understood about augmenting human intellect that we still struggle to grasp today.",
    excerpt: "In 1968, Doug Engelbart unveiled windowed computing, real-time collaborative text editing, and the computer mouse. Today's software tools are still catching up to his original vision.",
    content: `# The Mother of All Demos at 58: Lessons for Modern Toolmakers

On December 9, 1968, Douglas Engelbart and his team at the Stanford Research Institute gave a 90-minute live demonstration that fundamentally mapped the terrain of modern computing.

He didn't present a calculator or an accounting machine. He presented an **augmentation framework for the human intellect**.

## Beyond Automation

Most modern software strives for *automation*—taking human tasks and executing them in the dark. Engelbart advocated for *augmentation*—amplifying human perception, working memory, and collaborative reasoning.`,
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    category: "Pioneers",
    tags: ["History", "Engelbart", "HCI", "Pioneers"],
    author: {
      name: "Sobi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      role: "Author"
    },
    publishedAt: "2026-07-15T08:00:00Z",
    readingTime: 7,
    isFeatured: false,
    isDraft: false,
    views: 1890,
    likes: 110,
    seoTitle: "The Mother of All Demos at 58 — Wat'EWrites",
    seoDescription: "Lessons in augmenting human intellect from Douglas Engelbart's landmark 1968 demonstration."
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: "comm-1",
    postId: "post-ai-plastic",
    authorName: "Sarah Jenkins",
    content: "The comparison to Bakelite is brilliant. When technology becomes ambient and ubiquitous, that's when it truly reshapes culture.",
    createdAt: "2026-08-25T11:20:00Z",
    likes: 14
  },
  {
    id: "comm-2",
    postId: "post-ai-plastic",
    authorName: "Marcus Chen",
    content: "Totally agree on ambient inference over chat bots. I don't want a conversation, I want structured assistance.",
    createdAt: "2026-08-25T12:45:00Z",
    likes: 9
  },
  {
    id: "comm-3",
    postId: "post-1",
    authorName: "Eleanor Sterling",
    content: "The distinction between optionality and empathy is so well put. As a product manager, I constantly fight against the urge to add 'just one toggle'. Bookmarked this essay to share with our design team tomorrow morning!",
    createdAt: "2026-08-21T11:20:00Z",
    likes: 12
  }
];

export const INITIAL_SUBSCRIBERS: Subscriber[] = [
  {
    id: "sub-1",
    email: "elena.rostova@designlab.io",
    name: "Elena Rostova",
    subscribedAt: "2026-08-24T10:15:00Z",
    status: "active",
    source: "hero",
    preferences: ["Design Philosophy", "Typography"]
  },
  {
    id: "sub-2",
    email: "david.miller@techcraft.dev",
    name: "David Miller",
    subscribedAt: "2026-08-22T14:40:00Z",
    status: "active",
    source: "post_footer",
    preferences: ["Engineering", "Architecture"]
  },
  {
    id: "sub-3",
    email: "clara.oswald@typeworks.co",
    name: "Clara Oswald",
    subscribedAt: "2026-08-19T09:05:00Z",
    status: "active",
    source: "hero",
    preferences: ["Typography", "Writing & Thought"]
  }
];
