# Wat'EWrites — Modern Editorial Journal & Studio

**Wat'EWrites** is a high-craft, aesthetic digital publication and content management studio designed for essays, technology commentary, visual arts, and thoughtful writing.

---

## 🌟 Key Features

### 1. Reader Experience & Typography
- **Editorial Design System**: Crafted with Fraunces (Display Serif), Plus Jakarta Sans (Interface), and JetBrains Mono (Technical blocks).
- **Themes & Reading Modes**: Instant toggling between **Editorial Light**, **Sepia Warmth**, and **Obsidian Dark**.
- **Interactive Reading**: Audio read-aloud TTS speech engine, estimated reading times, curated tags, and real-time bookmarking.
- **Audience Engagement**: Interactive comment section with nested replies, like counts, and instant moderation capabilities.
- **The Weekly Dispatch Newsletter**: Built-in subscriber management and email broadcast dispatch system.

### 2. Studio Writing Desk (Word-Style Rich Editor)
- **Formatting Toolbar**: One-click headings (H1, H2, H3), bold, italics, strikethrough, underline, quotes, code blocks, lists, callout boxes, and markdown tables.
- **Desktop File Uploads**: Direct drag-and-drop support for cover banners, profile avatars, and inline body imagery.
- **Live Canvas Split View**: Seamless switching between **Split Mode**, **Full Write Canvas**, and **Article Live Preview**.
- **Metrics Bar**: Live word counter, character tally, paragraph counter, and estimated read time calculator.
- **AI Assist**: Integrated headline generation and lead excerpt generation.

### 3. Studio Authentication & Hardened Security
- **Mandatory Passkey Verification**: Every entrance to the Studio requires the passkey to prevent unauthorized access.
- **Trick Question Recovery**: Instant fallback challenge for forgotten passkeys (Default: *"Your Sister's Name...?"* &rarr; **`Ness`**).
- **Brute-Force Rate Limiting**: Automatic 30-second lockout cooldown after 5 consecutive failed attempts.
- **Timing-Safe Evaluation**: Constant-time string matching to guard against side-channel timing attacks.
- **Passkey Strength Evaluator**: Visual real-time password strength diagnostics.

---

## 🚀 Getting Started

### Installation

```bash
# Clone repository
git clone <repository-url>
cd wat-ewrites

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```
Starts the local development server at `http://localhost:3000`.

### Production Build

```bash
npm run build
```
Generates a zero-error, minified, static production bundle ready for Cloud Run, Vercel, Netlify, Nginx, or any standard static/SPA web server in `dist/`.

### Preview Production Build

```bash
npm run preview
```

---

## 🔑 Default Studio Credentials

- **Default Studio Passkey**: `admin123`
- **Default Recovery Trick Question**: `Your Sister's Name...?`
- **Default Recovery Answer**: `Ness`

*(You can customize your passkey, question, and recovery answer at any time in **Studio > Settings & Preferences**).*

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4 + PostCSS
- **Icons**: Lucide React
- **Content Engine**: React Markdown + Remark GFM
- **Animations & Effects**: Canvas Confetti + Motion
- **Persistence**: LocalStorage with schema versioning and reactive context state

---

## 📦 Deployment & Server Readiness

This project is fully verified, type-checked, and **ready to push and deploy**.
All builds run with clean `0` TypeScript errors and zero external server dependencies for static deployments.
