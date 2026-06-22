<div align="center">

<br />

# 🎯 AnswerHub

### *The Intelligent Community Q&A Platform*

<br />

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br />

**A production-grade, community-driven Q&A and FAQ platform** engineered for institutional portals, university hubs, and knowledge-sharing communities. Featuring a moderated answer pipeline, reputation & badge gamification, AI-powered summaries, multi-language translation, voice-enabled search, text-to-speech accessibility, real-time leaderboards, and a cinematic dark/light developer aesthetic.

<br />

[🚀 Getting Started](#-getting-started) · [✨ Features](#-feature-highlights) · [🏆 Gamification](#-reputation--badge-system) · [🏗️ Architecture](#%EF%B8%8F-architecture) · [📄 License](#-license)

<br />

</div>

---

## ✨ Feature Highlights

<table>
<tr>
<td width="50%">

### 🔐 Role-Based Access Control
Fine-grained RBAC with three permission tiers:
- **Guest** — Browse verified answers, search, view FAQs
- **User** — Ask questions, submit answers, upvote, track notifications
- **Admin** — Full moderation dashboard with bulk operations, metrics, flagging review, and content management

</td>
<td width="50%">

### 🛡️ Moderated Answer Pipeline
Enterprise-grade content quality assurance:
- Submitted answers are **private by default** until admin verification
- Four-state workflow: `pending` → `verified` / `rejected` / `spam`
- Authors receive **real-time notifications** with admin feedback notes
- ✅ **Accepted Answer** — Question owners can mark the best answer

</td>
</tr>
<tr>
<td width="50%">

### 🏆 Reputation & Badge System
Full gamification engine to drive engagement:
- **Reputation Points** — Earn points for asking, answering, upvotes, accepted answers, and daily logins
- **🥉🥈🥇 Tiered Badges** — Bronze, Silver, Gold, and Special badges
- **📈 Progress Tracker** — Visual progress bar toward next badge
- **🔥 Leaderboard** — Live rankings of top contributors

</td>
<td width="50%">

### 🎙️ Voice Search (Voice Chat)
Hands-free voice input powered by the **Web Speech API**:
- **Search bar** — Tap the microphone to speak your query
- **Ask Question** — Dictate both title and description fields
- **FAQ search** — Voice-enabled FAQ filtering
- Real-time interim transcription with automatic finalization
- Graceful fallback for unsupported browsers

</td>
</tr>
<tr>
<td width="50%">

### 🔊 Text-to-Speech (TTS)
Built-in accessibility for content consumption:
- **Listen to any question** — One-tap playback on question cards
- **FAQ answers read aloud** — Audio playback for every FAQ entry
- Visual speaking indicator with stop/play toggle
- Uses native `SpeechSynthesis` API — zero external dependencies

</td>
<td width="50%">

### 🌐 Multi-Language Translation
Break language barriers with real-time translation:
- Translate questions and answers into **multiple languages**
- Seamless inline translation UI
- Supports global user communities
- Powered by translation API integration

</td>
</tr>
<tr>
<td width="50%">

### 🔍 Type-Ahead Autocomplete
Instant search suggestions as you type:
- Real-time query predictions from existing questions
- Reduces search time and improves discoverability
- Keyboard-navigable suggestion dropdown
- Powered by fuzzy matching with **Fuse.js**

</td>
<td width="50%">

### 🚩 Content Flagging
Community-driven content moderation:
- **Flag inappropriate questions or answers** for admin review
- Flag reasons include: spam, offensive, off-topic, duplicate
- Flagged content enters the **admin moderation queue**
- Keeps the community safe and professional

</td>
</tr>
<tr>
<td width="50%">

### 🧠 Smart Duplicate Detection
AI-powered question deduplication:
- **Fuse.js fuzzy matching** scans existing questions in real-time as you type
- Displays similarity scores and matching questions before submission
- Users can "View Existing Answers" or choose to "Ask Anyway"

</td>
<td width="50%">

### 🚫 Heuristic Spam Detector
Automatic content quality filtering:
- Scans for repeated characters, excessive URLs, promotional keywords, and ALL-CAPS
- Flagged answers are **auto-redirected** to admin moderation queue as `spam`
- Zero false positive tolerance with multi-signal heuristic scoring

</td>
</tr>
<tr>
<td width="50%">

### 🔮 Client-Side AI Summarizer
100% free, privacy-first NLP summaries:
- Extractive NLP algorithm runs **entirely in-browser** in under 5ms
- Sentence frequency scoring with stop-word filtering
- Extracts top 2 key insights from long answers (350+ characters)
- Rendered in a collapsible `✨ AI Sparkle Summary` glassmorphic drawer

</td>
<td width="50%">

### 📍 Track Your Questions
Never lose sight of your submissions:
- **Real-time status tracking** for all your questions
- See answer count, views, upvotes, and verification status
- Get notified when answers are posted or verified
- Full activity history on your profile dashboard

</td>
</tr>
<tr>
<td width="50%">

### 🔑 Authentication System
Flexible, secure authentication:
- **Email/Password** sign-up and login
- **Forgot Password** — Email-based password reset flow
- Session persistence across page refreshes
- Automatic session recovery with watchdog timer

</td>
<td width="50%">

### 🎨 Obsidian & Paper Theme System
Cinematic dual-theme experience:
- **Obsidian Dark** — Deep dark mode with cosmic particle backdrops
- **Paper Light** — Pristine light mode with subtle gradients
- localStorage-persisted theme preference
- Spring-physics page transitions via Framer Motion
- Self-drawing SVG toast notifications

</td>
</tr>
</table>

---

## 🏆 Reputation & Badge System

### Point System

| Action | Points |
|:-------|-------:|
| Ask a Question | **+5** |
| Post an Answer | **+10** |
| Answer Gets Upvoted | **+10** |
| Question Gets Upvoted | **+5** |
| Accepted Answer | **+30** |
| Daily Login | **+2** |
| Downvote Received | **-2** |

### Badge Tiers

<table>
<tr>
<td width="33%" align="center">

#### 🥉 Bronze Badges
**Beginner Contributor** — 10 pts<br/>
**First Question** — Ask your first question<br/>
**First Answer** — Post your first answer

</td>
<td width="33%" align="center">

#### 🥈 Silver Badges
**Knowledge Sharer** — 100 pts<br/>
**10 Accepted Answers**<br/>
**Helpful Member**

</td>
<td width="33%" align="center">

#### 🥇 Gold Badges
**Expert Contributor** — 500 pts<br/>
**50 Upvotes Received**<br/>
**Problem Solver**

</td>
</tr>
</table>

### 🌟 Special Badges

| Badge | Criteria |
|:------|:---------|
| 👑 **Community Leader** | Top reputation holder in the community |
| 🔥 **Top Contributor of the Month** | Most active contributor in the current month |
| 🚀 **Fast Responder** | Consistently answers within minutes |
| 💡 **Innovation Guru** | Answers with highest quality ratings |

### 🎯 Progress Tracker

Visual progress bars show users how close they are to their next badge:

```
Knowledge Sharer Badge
████████░░ 80/100 Points

Expert Contributor Badge
██░░░░░░░░ 120/500 Points
```

### 🔥 Leaderboard

Live rankings of top contributors displayed platform-wide:

```
🏅 1. Vishal Soni     1,250 pts   👑🥇🔥
🏅 2. Arnav             980 pts   🥇🥈
🏅 3. Aryan             870 pts   🥈🥈
🏅 4. Priya             650 pts   🥈
🏅 5. Rahul             420 pts   🥉
```

---

## ✅ Accepted Answer System

- Question owners can **mark one answer as the accepted answer**
- ✅ Green checkmark appears on the accepted answer
- Accepted answer is **pinned to the top** of the answer list
- The answerer receives **+30 reputation points**
- Improves content discoverability for future visitors

---

## 📈 User Profile Dashboard

Every registered user gets a comprehensive profile showcasing:

| Metric | Description |
|:-------|:------------|
| 🏆 **Total Reputation** | Cumulative reputation points earned |
| 🎖️ **Badges Earned** | All bronze, silver, gold, and special badges |
| ❓ **Questions Asked** | Total questions submitted |
| 💬 **Answers Posted** | Total answers contributed |
| ✅ **Accepted Answers** | Number of answers marked as accepted |
| 📊 **Ranking Position** | Current leaderboard position |

| 🎯 **Progress to Next Badge** | Visual progress bar |

---

## 🏗️ Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (SPA)                             │
│   React 19 · Vite 8 · Tailwind CSS v4 · Framer Motion 12        │
├────────┬────────┬────────┬────────┬────────┬────────┬────────────┤
│  Auth  │Question│ Answer │ Search │ Voice  │Translation│
│Context │  Hook  │  Hook  │  Hook  │STT/TTS │  Engine   │
├────────┴────────┴────────┴────────┴────────┴───────────┤
│  Reputation Engine · Badge System · Leaderboard                  │
├──────────────────────────────────────────────────────────────────┤
│               Supabase JS Client (v2.106+)                       │
│              ┌──────────┬──────────┬──────────┐                  │
│              │   Auth   │ Database │ Storage  │                  │
│              │  (JWT)   │ (REST)   │ (S3-API) │                  │
└──────────────┴──────────┴──────────┴──────────┴──────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────────────┐
│                      SUPABASE BACKEND                            │
│   PostgreSQL · Row-Level Security · Edge Functions · Realtime    │
├──────────────────────────────────────────────────────────────────┤
│   8+ Tables · 5+ RPC Functions · 16+ RLS Policies · 9+ Indexes  │
│   Cascade Deletes · Composite Constraints · Auto Triggers        │
└──────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
Answerhub/
├── public/                        # Static assets
├── supabase/
│   └── schema.sql                 # Full database schema, triggers, RLS policies
├── src/
│   ├── components/
│   │   ├── admin/                 # Moderation dashboard, flagging review
│   │   ├── answers/               # Answer cards, forms, accepted answer UI
│   │   ├── auth/                  # ProtectedRoute, GuestRoute guards
│   │   ├── layout/                # Navbar, Sidebar, Footer, Layout shell
│   │   ├── notifications/         # Real-time notification bell & dropdown
│   │   ├── questions/             # QuestionCard, QuestionForm, QuestionFeed
│   │   ├── search/                # SearchBar with voice input & type-ahead
│   │   └── ui/                    # Design system: Button, Modal, Toast,
│   │                              #   Card, Input, Avatar, Badge, Skeleton,
│   │                              #   Tooltip, ThemeToggle, BackToTop
│   ├── config/
│   │   └── supabase.js            # Supabase client initialization
│   ├── contexts/
│   │   └── AuthContext.jsx        # Global auth state with session persistence
│   ├── hooks/
│   │   ├── useAdmin.js            # Admin moderation & flagging operations
│   │   ├── useAnswers.js          # Answer CRUD + verification + accepted answers
│   │   ├── useAuth.js             # Auth context consumer
│   │   ├── useCategories.js       # Category fetching
│   │   ├── useFileUpload.js       # Supabase Storage file uploads
│   │   ├── useNotifications.js    # Notification state management
│   │   ├── useQuestions.js        # Question CRUD + upvoting + deletion
│   │   ├── useSearch.js           # Fuzzy search + type-ahead + analytics
│   │   ├── useSpeechToText.js     # 🎙️ Web Speech API (STT) hook
│   │   ├── useTextToSpeech.js     # 🔊 SpeechSynthesis (TTS) hook
│   │   └── useUpvote.js           # Optimistic upvote toggling
│   ├── lib/                       # Utility functions
│   ├── pages/
│   │   ├── AdminDashboard.jsx     # Metrics, bulk moderation, flag queue
│   │   ├── AskQuestionPage.jsx    # Question form with voice dictation
│   │   ├── FaqPage.jsx            # FAQ browser with STT & TTS
│   │   ├── ForgotPasswordPage.jsx # Email-based password reset
│   │   ├── HomePage.jsx           # Main feed with category filtering
│   │   ├── LoginPage.jsx          # Email/password login
│   │   ├── NotFoundPage.jsx       # Animated 404 page
│   │   ├── ProfilePage.jsx        # Stats, reputation, badges
│   │   ├── QuestionDetailPage.jsx # Full question + answers + accepted
│   │   ├── SearchPage.jsx         # Global search results
│   │   └── SignupPage.jsx         # User registration
│   ├── App.jsx                    # Route definitions with AnimatePresence
│   ├── main.jsx                   # App entry point
│   └── index.css                  # Global styles & design tokens
├── index.html
├── vite.config.js
├── vercel.json                    # Vercel SPA routing config
└── package.json
```

---

## 💻 Technology Stack

| Layer | Technology | Version | Purpose |
|:------|:-----------|:--------|:--------|
| **Frontend Framework** | React | 19 | Component architecture with hooks |
| **Build Tool** | Vite | 8 | Lightning-fast HMR and optimized production builds |
| **Styling** | Tailwind CSS | v4 | CSS-first utility engine with design tokens |
| **Animations** | Framer Motion | 12 | Spring-physics transitions & micro-interactions |
| **Icons** | Lucide React | 1.17 | Consistent, tree-shakeable icon library |
| **Forms** | React Hook Form | 7 | Performant form state management |
| **Routing** | React Router | 7 | Client-side navigation with route guards |
| **Backend & DB** | Supabase | PostgreSQL | Auth, Database, Storage, Realtime |
| **Search Engine** | Fuse.js | 7 | Client-side fuzzy matching & similarity scoring |
| **Voice Input** | Web Speech API | Native | Browser speech-to-text recognition |
| **Audio Output** | SpeechSynthesis API | Native | Browser text-to-speech playback |

| **Deployment** | Vercel | — | Edge-optimized SPA hosting |

---

## 🗄️ Database Schema

The PostgreSQL database is organized into **8+ core tables** with strict relational constraints, Row-Level Security (RLS) policies, and cascade delete rules:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    auth.users     │────▶│      users       │     │    categories    │
│  (Supabase Auth)  │     │  id, name, email │     │  id, name, icon  │
└──────────────────┘     │  role, avatar    │     └────────┬─────────┘
                          │  reputation, rank │              │
                          └───────┬──────────┘              │
                                  │                         │
                    ┌─────────────┼─────────────────────────┘
                    │             │
              ┌─────▼─────────────▼──────┐
              │        questions          │
              │  id, title, description   │
              │  category, tags, views    │
              │  upvotes, attachment_url  │
              │  flags                    │
              └──────┬───────────┬───────┘
                     │           │
        ┌────────────▼──┐  ┌────▼───────────────┐
        │    answers     │  │ question_upvotes   │
        │  id, content   │  │ question_id,       │
        │  verification  │  │ user_id (PK)       │
        │  is_accepted   │  └────────────────────┘
        │  admin_note    │
        └──────┬─────────┘
               │
        ┌──────▼─────────────┐     ┌──────────────────┐
        │  answer_upvotes    │     │   notifications   │
        │  answer_id,        │     │  id, user_id,     │
        │  user_id (PK)      │     │  message, is_read │
        └────────────────────┘     └──────────────────┘

        ┌──────────────────────┐
        │  search_analytics    │
        │  id, search_term,    │
        │  user_id, created_at │
        └──────────────────────┘
```

### Key Database Features

| Feature | Implementation |
|:--------|:---------------|
| **Auto User Profiles** | Database trigger on `auth.users` INSERT automatically creates a `public.users` row |
| **Cascade Deletes** | Deleting a question removes all associated answers, upvotes, and notifications |
| **Duplicate Vote Prevention** | Composite primary keys on upvote tables enforce one-vote-per-user |
| **Trending Analytics** | RPC function `get_trending_searches()` returns top 10 search terms from the past 7 days |
| **Toggle Upvotes** | RPC functions atomically insert/delete upvote records and update counters |
| **16+ RLS Policies** | Fine-grained row-level security ensuring users only access authorized data |
| **Reputation Tracking** | Points calculated from user actions and stored for leaderboard rankings |


---

## 🎙️ Voice & Accessibility Features

### Speech-to-Text (Voice Search / Voice Chat)

The `useSpeechToText` hook wraps the native **Web Speech Recognition API** to provide hands-free voice input across the platform:

| Feature | Details |
|:--------|:--------|
| **Continuous Recognition** | Keeps listening until manually stopped |
| **Interim Results** | Shows real-time transcription as you speak |
| **Multi-Language** | Defaults to `en-US`, configurable via `lang` parameter |
| **Error Recovery** | Graceful handling of microphone permission errors |
| **Used In** | Search bar, Ask Question (title + description), FAQ search |

### Text-to-Speech (Read Aloud)

The `useTextToSpeech` hook uses the native **SpeechSynthesis API** for audio content playback:

| Feature | Details |
|:--------|:--------|
| **One-Tap Playback** | Single button to play/stop on any content |
| **Unique Tracking** | Each content item has a unique speech ID to track active playback |
| **Auto Cleanup** | Speech synthesis is cancelled on component unmount |
| **Used In** | Question cards, FAQ answer panels |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Minimum Version |
|:------------|:----------------|
| **Node.js** | v18+ |
| **npm** | v9+ |
| **Supabase Account** | [Free Tier](https://supabase.com) |

### Installation

**1. Clone & Install**

```bash
git clone https://github.com/sonivishal66666/Answerhub.git
cd Answerhub
npm install
```

**2. Database Setup**

1. Create a new project on the [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor** → **New Query** → **Blank Query**
3. Copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and paste into the editor
4. Click **Run** — this creates all tables, triggers, RLS policies, indexes, and seed data

**3. Storage Configuration**

1. In the Supabase Dashboard, go to **Storage**
2. Click **New Bucket** → name it `attachments`
3. Toggle **Public Bucket** to **ON** → Click **Create**

**4. Environment Configuration**

```bash
cp .env.example .env
```

Update `.env` with your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**5. Launch Development Server**

```bash
npm run dev
```

Open [**http://localhost:5173**](http://localhost:5173) in your browser.

**6. Production Build**

```bash
npm run build
npm run preview     # Preview the production build locally
```

---

## 🔑 Admin Dashboard Setup

To activate the admin moderation dashboard:

1. **Create an account** on the running application via Sign Up
2. Open the **Supabase Dashboard** → **Table Editor** → `users` table
3. Locate your user row and change the `role` column from `user` to `admin`
4. **Refresh your browser** — the **Admin** link will appear in the navigation bar

### Admin Capabilities

| Capability | Description |
|:-----------|:------------|
| 📊 **Platform Metrics** | Total questions, answers, pending reviews, user counts, and reputation stats |
| ✅ **Bulk Moderation** | Approve, reject, or flag multiple answers at once |
| 🗑️ **Question Deletion** | Delete any question with premium animated confirmation dialogs |
| 🚩 **Flag Review Queue** | Review and resolve community-flagged content |
| 📝 **Admin Notes** | Attach feedback notes to reviewed answers |
| 🔔 **Auto-Notifications** | Authors are notified of verification decisions in real-time |
| 🏆 **Reputation Management** | View and manage user reputation and badge assignments |

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your repository to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — the included `vercel.json` handles SPA routing automatically

### Manual Build

```bash
npm run build          # Outputs to ./dist
npx serve dist         # Serve locally for testing
```

---

## 🎯 Complete Feature Summary

| # | Feature | Description |
|:-:|:--------|:------------|
| 1 | 🔐 Role-Based Access Control | Guest, User, and Admin permission tiers |
| 2 | 🛡️ Moderated Answer Pipeline | Admin-verified answers with 4-state workflow |
| 3 | 🏆 Reputation System | Points for actions (ask, answer, upvote, accepted) |
| 4 | 🎖️ Badge System | Bronze, Silver, Gold, and Special achievement badges |
| 5 | 🔥 Leaderboard | Live rankings of top contributors |
| 6 | ✅ Accepted Answers | Question owners mark the best answer (+30 pts) |
| 7 | 📈 Progress Tracker | Visual progress bars toward next badge |
| 8 | 🎙️ Voice Search (Voice Chat) | Hands-free voice input across the platform |
| 9 | 🔊 Text-to-Speech | Listen to questions and FAQ answers |
| 10 | 🌐 Translation | Multi-language translation for questions & answers |
| 11 | 🔍 Type-Ahead | Autocomplete search suggestions as you type |
| 12 | 🚩 Content Flagging | Flag inappropriate questions or answers |
| 13 | 📍 Track Your Questions | Real-time status tracking for submissions |
| 14 | 🔑 Forgot Password | Email-based password reset flow |
| 15 | 🧠 Duplicate Detection | Fuse.js fuzzy matching with similarity scores |
| 16 | 🚫 Spam Detector | Heuristic auto-flagging of spam content |
| 17 | 🔮 AI Summarizer | Client-side NLP extractive summaries |
| 18 | 📎 File Attachments | Upload images and documents to questions/answers |
| 19 | 🔔 Real-Time Notifications | In-app notification bell with live updates |
| 20 | 🎨 Obsidian & Paper Themes | Cinematic dark/light theme system |
| 21 | ✨ Spring-Physics Animations | Framer Motion transitions & micro-interactions |
| 22 | 🌌 Cosmic Particle Backdrops | Floating particle emitter with ambient nebulas |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

<br />

**Built with ❤️ for knowledge-sharing communities**

<br />

[![GitHub Stars](https://img.shields.io/github/stars/sonivishal66666/Answerhub?style=social)](https://github.com/sonivishal66666/Answerhub)
[![GitHub Forks](https://img.shields.io/github/forks/sonivishal66666/Answerhub?style=social)](https://github.com/sonivishal66666/Answerhub)

</div>
