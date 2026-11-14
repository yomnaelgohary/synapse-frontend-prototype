# Synapse

**Synapse** is a frontend prototype of an AI-assisted exam assessment platform for primary school (Grades 1–5). Teachers, students and parents each get their own view of the same exam workflow: from uploading handwritten exam pages, through text verification and grading, to feedback, learning gaps and progress.

> **Prototype notice:** Synapse runs entirely in the browser with built-in demo data. There is no backend, no database, no real OCR engine and no real AI model. "AI" and "OCR" results are simulated so the full workflow can be demonstrated and evaluated. See [Important notes](#8-important-notes).

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Main features](#2-main-features)
3. [Technologies used](#3-technologies-used)
4. [Project structure](#4-project-structure)
5. [Installation and setup](#5-installation-and-setup)
6. [How to run the project](#6-how-to-run-the-project)
7. [Login and demo access](#7-login-and-demo-access)
8. [Important notes](#8-important-notes)

---

## 1. Project overview

### What the system does

Synapse supports the assessment of handwritten paper exams:

- Students (or their parents) photograph or upload their exam pages.
- Students rate how sure they felt about each answer (**Sure-Check**).
- The system extracts the handwritten text (OCR) and suggests grades (AI); the **teacher always verifies the text and confirms or overrides every grade** before anything is released.
- Once released, students and parents see grades and teacher feedback, and the teacher sees recurring learning gaps and possible "red flags" across exams.

### The problem it addresses

Grading handwritten exams by hand is slow, and the patterns behind mistakes (a missing concept, a language problem, a confident but wrong answer) are easy to miss when each paper is graded on its own. Synapse speeds up grading with AI suggestions while keeping the teacher in control, and turns graded answers into learning insights: skill-level understanding, recurring mistakes across exams, and targeted practice and feedback.

### Main users

| Role | What they do in Synapse |
|---|---|
| **Teacher** | Creates exams, verifies extracted text, confirms or overrides AI-suggested grades, releases results, reviews learning gaps and red flags, writes feedback, answers help requests. |
| **Student** | Uploads exam pages, gives Sure-Check ratings, reads grades and feedback, practises weak skills, follows their progress, asks the teacher for help. |
| **Parent** | Reads the child's confirmed grades and feedback (read-only), follows skill progress and teacher-confirmed support needs, gets notified about new grades, and can upload exam pages for the child. |

### Main workflow

```
Teacher creates exam (questions, marks, skills, model answer, Sure-Check settings)
        │
        ▼
Student / parent uploads exam pages ──► Student gives Sure-Check ratings
        │
        ▼
Teacher verifies the extracted (OCR) text, side by side with the scan
        │
        ▼
Teacher reviews AI-suggested grades: accept, override with a reason, or regrade
        │
        ▼
Teacher releases results ──► Students and parents see grades and feedback
        │
        ▼
Teacher reviews learning gaps and red flags ──► confirms/dismisses flags,
sends practice, messages and feedback ──► students and parents see confirmed support
```

The exam status moves through: **Uploaded → Text being checked → Being graded → Grade confirmed**.

---

## 2. Main features

All features below are implemented in the user interface and work with the built-in demo data. Where a feature depends on simulated data, this is noted.

### Teacher

- **Dashboard** – greeting, workflow status of exams, statistics (papers uploaded, answers checked, released papers, class average, pass rate), understanding by skill, open red flags and new help requests.
- **Exams** – list of exams with their workflow stage; newly created exams are highlighted.
- **Create an exam** – exam information (title, subject, class, exam language, date), model answer upload or text, questions with marks, skill tags and model-answer criteria, and **Sure-Check** settings.
  - Face icons for younger grades can be switched on; for the Grade 1 demo class (**Class 1A**) they are always on and cannot be turned off.
  - A confirmation dialog is shown before the exam is saved; unsaved exams can be discarded.
- **Verify extracted text** – the scanned answer next to the extracted text, uncertain words highlighted, zoom in/out, inline correction, "mark as unreadable", and confirmation per paper/question before grading.
- **Confirm AI grades** – AI-suggested scores with the suggested cause (e.g. concept vs. language error), accept a suggestion (with undo), override with a mandatory reason, manual grading, edit the model answer and **regrade** (teacher-overridden grades go to a *Second check* list), German/English keyword pairs for language errors, and **release results** (blocked until the release rules are met). Released results become read-only.
- **Learning gaps & red flags** – class misconception map, patterns across exams, recurring mistakes by student, red flag list with **confirm** or **dismiss** (with a private dismissal comment), send practice to students with a gap, message a group of students.
- **Student profile** – progress across exams, private teacher notes (never shown to students or parents), send feedback to the student.
- **Help requests** – inbox of student requests, reply, send practice, book an office-hour slot (taken slots cannot be double-booked).
- **Notifications** – the bell opens a list of notifications; each item opens its section.
- **Language** – the whole teacher interface switches between English and German at any time.
- **Feedback** – confirmation dialogs, loading states, banners and toasts (some with undo) for every action.

### Student

- **Home** – greeting, latest news, and the booked office hour.
- **Upload exam** – a four-step flow:
  1. Choose a subject and an exam (with the exam language shown).
  2. Add pages by camera (simulated) or by choosing a sample file; a **quality check** rejects blurry, too dark or cut-off pages; pages can be reordered by drag-and-drop or keyboard.
  3. **Sure-Check**: rate each answer as *Sure*, *Not sure* or *Guessed*, and mark if the words were hard to understand. Grade 1–2 students see face icons.
  4. Review and submit; a receipt shows the status tracker.
- **My results** – submitted exams with status, total grade, a note from the teacher, per-question scores, the **teacher's comment on wrong answers**, difficult words shown in German and English for language errors, a "Look again" hint and solution for confident mistakes, skills to practise in child-friendly words, supportive notes for teacher-confirmed red flags, and practice exercises that can be **marked as done**.
- **My progress** – skill states (e.g. Secure, Wobbly, Known gap), improvements, a grade history chart and a support note.
- **Ask for help** – send a private help request to the teacher (subject, topic and optional message).
- **Notifications** – the bell lists new grades, feedback, practice and help replies; each item opens the matching section.
- **Language switch** (English/German) and **sign out**.

### Parent

The parent view is intentionally limited to four features:

- **Grades and feedback (read-only)** – the child's exams with status, confirmed grades, the teacher's note and feedback on wrong answers. There are no edit controls.
- **Progress** – the child's skill progress and grade history (the same components as the student view, with parent wording), plus **only the red flags the teacher has confirmed**, written for parents. Pending or dismissed flags, private notes and AI suggestions are never shown.
- **Notifications** – a new grade was released, or the teacher confirmed a support need.
- **Upload exam pages** – choose the exam, add pages (camera or sample file, with the same quality check), review and send. The parent **cannot** enter or change Sure-Check ratings; the child gives them.
- **Language switch** (English/German) and **sign out**.

---

## 3. Technologies used

Identified from `package.json`, the configuration files and the source code.

| Area | Technology |
|---|---|
| Frontend framework | [Next.js](https://nextjs.org/) **16.4.3** (App Router, `app/` directory) with **React 19** |
| Language | **TypeScript** 5.7.3 (`.tsx` / `.ts`) and **CSS** |
| Styling | **Tailwind CSS** 4 (via `@tailwindcss/postcss` and PostCSS), `tw-animate-css`, and hand-written global stylesheets (`app/*.css`) for the "sticker" design system |
| UI libraries | **shadcn/ui** setup (`components.json`, `components/ui/button.tsx`), **Base UI** (`@base-ui/react`), **class-variance-authority**, **clsx**, **tailwind-merge** (`lib/utils.ts`) |
| Icons | **lucide-react** |
| Fonts | Google Fonts through `next/font/google`: Fredoka, Nunito, Inter, Caveat (handwriting on simulated scans) |
| Analytics | **Vercel Analytics** (`@vercel/analytics`), loaded only in production builds |
| Backend | **None.** All logic runs in the browser. |
| Database / storage | **None.** Demo data is defined in the source code; the teacher workflow state is kept in the browser's `localStorage` during a session (see [Important notes](#8-important-notes)). |
| Package manager | **pnpm** (declared as `"packageManager": "pnpm@12.3.4"`, lockfile `pnpm-lock.yaml`) |
| Hosting | Preview deployments run on **Vercel** (no configuration needed to run locally) |

---

## 4. Project structure

```
synapse-frontend-prototype/
├── app/
│   ├── layout.tsx          # Root layout: metadata, global stylesheets, Vercel Analytics (production only)
│   ├── page.tsx            # The single page: login, app shell, student pages, role switching
│   ├── globals.css         # Tailwind import, design tokens and the base student "sticker" styles
│   ├── student.css         # Student view additions (upload, notifications, results, header)
│   ├── teacher.css         # Teacher view styles (prefixes t- / ts-)
│   ├── login.css           # Login page with the student / parent / teacher themes (prefix lg-)
│   └── parent.css          # Parent view theme (prefix parent-)
├── components/
│   ├── login-syna.tsx          # Syna, the mascot, for the login page and parent heroes
│   ├── student-upload-flow.tsx # Upload flow (student and parent mode): pages, quality check, Sure-Check, review
│   ├── student-results.tsx     # "My results": grades, feedback, tricky words, practice
│   ├── student/
│   │   └── StudentSidebar.tsx  # Sidebar / phone tab bar for the student and parent views
│   ├── parent/
│   │   └── parent-view.tsx     # Parent pages: grades and feedback, progress, upload, notifications
│   ├── teacher-workspace.tsx   # All teacher screens and the demo exam/grading data
│   ├── teacher-views.tsx       # Older teacher screens (not used by the current app)
│   ├── teacher/
│   │   ├── TeacherShell.tsx    # Teacher layout frame (header, content, footer, translation)
│   │   ├── TeacherHeader.tsx   # Navigation, language switch, notification menu, sign out
│   │   ├── TeacherFooter.tsx   # Footer
│   │   ├── PageHeader.tsx      # Page titles with icon tiles
│   │   ├── WorkflowStepper.tsx # Exam workflow step bar
│   │   ├── feedback.tsx        # Confirm dialogs, toasts and banners
│   │   ├── ocr.tsx             # Simulated OCR: scan view, uncertain words, zoom, editor
│   │   ├── sticker.tsx         # Sticker-style building blocks (hero, chips, cards)
│   │   ├── ui.tsx              # Teacher UI primitives (buttons, fields, tabs, modal, badges)
│   │   ├── i18n.tsx            # English ⇄ German switching for the teacher interface
│   │   └── i18n-de.ts          # German dictionary for the teacher interface
│   └── ui/
│       └── button.tsx          # shadcn/ui button
├── lib/
│   └── utils.ts            # cn() helper (clsx + tailwind-merge)
├── public/                 # Icons and placeholder images
├── components.json         # shadcn/ui configuration
├── next.config.mjs         # Next.js configuration (unoptimized images, TypeScript build errors ignored)
├── postcss.config.mjs      # PostCSS with the Tailwind CSS plugin
├── tsconfig.json           # TypeScript configuration (path alias @/* → project root)
├── package.json            # Scripts and dependencies
├── pnpm-lock.yaml          # Locked dependency versions
├── pnpm-workspace.yaml     # pnpm settings
└── AGENTS.md               # Notes for AI coding agents (generated by `next dev`)
```

There are no URL routes per screen: the app is a single page (`/`) and switches screens with React state.

---

## 5. Installation and setup

### Required software

| Software | Version |
|---|---|
| [Node.js](https://nodejs.org/) | **20.9.0 or newer** (required by Next.js 16; Node 22 LTS recommended) |
| [pnpm](https://pnpm.io/) | the version in `package.json` (`pnpm@12.3.4`), installed through Corepack (below) |
| [Git](https://git-scm.com/) | any recent version |

Check your Node.js version:

```bash
node -v
```

### Step 1 – Clone the repository

```bash
git clone https://github.com/yomnaelgohary/synapse-frontend-prototype.git
```

```bash
cd synapse-frontend-prototype
```

### Step 2 – Enable pnpm

Corepack ships with Node.js and installs the pnpm version declared in `package.json`:

```bash
corepack enable
```

```bash
pnpm -v
```

### Step 3 – Install dependencies

```bash
pnpm install
```

### Step 4 – Environment variables

**None are required.** The project does not read any custom environment variables and does not need a `.env` file. (`NODE_ENV` is set automatically by Next.js; Vercel Analytics is only loaded in production builds.)

### Step 5 – External services

**None are required** to run locally. There is no database, API or AI/OCR service to configure. The fonts are downloaded from Google Fonts by Next.js, so the first start needs an internet connection.

---

## 6. How to run the project

Open a terminal **in the project root** (the `synapse-frontend-prototype` folder that contains `package.json`).

### Development server

```bash
pnpm dev
```

Then open **http://localhost:3000** in your browser. (If port 3000 is busy, Next.js prints the port it chose instead.)

To stop the server, press **`Ctrl + C`** in the terminal where it is running.

### Production build (optional)

```bash
pnpm build
```

```bash
pnpm start
```

`pnpm start` serves the built app at **http://localhost:3000**. Stop it with **`Ctrl + C`**.

The available scripts, as defined in `package.json`:

| Command | What it does |
|---|---|
| `pnpm dev` | Starts the development server (`next dev`) |
| `pnpm build` | Creates a production build (`next build`) |
| `pnpm start` | Serves the production build (`next start`) |

---

## 7. Login and demo access

The login page has a role selector (**Student**, **Parent**, **Teacher**). Select a role, then sign in with that role's demo account. The demo account is also shown under the sign-in button.

| Role | Username | Password | Signs in as |
|---|---|---|---|
| Student | `malak` | `student123` | Malak Adel, Class 4B (Grade 4) |
| Student (Grade 1 demo) | `lina` | `student123` | Lina Hamdy, Class 1A (Grade 1) – sees face icons in Sure-Check |
| Parent | `parent` | `parent123` | Malak's parent |
| Teacher | `nadine` | `teacher123` | Ms. Nadine |

Notes:

- The credentials only work with the matching role selected (for example, `nadine` only signs in when **Teacher** is selected).
- The **EN | DE** button on the login page chooses the interface language; it can be changed again at any time after signing in.
- Use the **sign-out** button in the header to return to the login page.
- These are demo accounts checked in the browser; there is no real authentication or user database.

---

## 8. Important notes

### What is implemented vs. simulated

| Area | Status |
|---|---|
| All three user interfaces, navigation, forms, validation, dialogs, notifications, EN/DE switching | **Implemented** (client-side) |
| Teacher workflow (create exam, verify text, confirm/override grades, release, red flags, notes, help inbox) | **Implemented** on demo data, kept in `localStorage` for the session |
| OCR (handwriting → text) | **Simulated.** The scans are rendered text in a handwriting font; word confidence is generated deterministically from the text (numbers are treated as less certain). |
| AI grading and suggested causes | **Simulated.** Suggested scores and causes come from the demo data; "regrade" re-scores the not-yet-confirmed demo answers against the edited model answer with simple rules, not a real model. |
| File and camera upload | **Simulated.** "Upload a file" offers sample scans (clear, blurry, too dark, cut off); nothing is read from your computer and the camera is a mock. |
| Login | **Simulated.** Fixed demo accounts, checked in the browser. |
| Backend, database, e-mail/push notifications | **Not present.** |

### How data behaves

- The demo data is built into the source code.
- The teacher workflow state is saved in the browser's `localStorage` under the key `synapse-teacher-workflow-v1`. It is **reset every time the page is reloaded**, so each demo starts from the same state.
- Changes are shared between roles **within one page session**: for example, if the teacher confirms a red flag, then signs out (without reloading) and you sign in as the student or parent, the confirmed flag appears there.
- Some connections are not wired between views: a student's or parent's uploaded pages and a student's help request do not appear in the teacher's lists, and student/parent grade lists use fixed demo grades.

### Other limitations

- The app is a single page (`/`); screens are not separate URLs, so the browser back button and deep links do not move between screens.
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `pnpm build` does not fail on type errors. Run a type check separately if needed:

  ```bash
  pnpm exec tsc --noEmit
  ```

- There is no lint script or test suite in `package.json`.
- The first run needs internet access so Next.js can download the Google Fonts.
