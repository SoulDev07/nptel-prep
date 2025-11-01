# NPTEL Prep App

Purpose
- A lightweight, client-side web app to practice multiple-choice questions (MCQs) in NPTEL-style.
- Shows one question at a time, provides immediate feedback, tracks progress, and persists session state in localStorage.
- Responsive (desktop & mobile) and keyboard-friendly for fast practice.

Quick highlights
- Randomized question order on start / restart.
- Immediate correct/wrong feedback; correct option shown when wrong.
- Linear progress bar in the header showing answered / total and percent.
- Local persistence using localStorage (key: `nptel_prep_state_v1`).
- Logo and social preview images live in `public/` (logo.svg, og-card.svg, og-card-dark.svg).

Keyboard & accessibility
- ← or A : Previous question
- → or D : Next question (or advanced if answer revealed)
- 1–5      : Choose option 1..5 (works when that index exists)
- W / S    : Move focus up / down between options
- Enter / Space : Select focused option
- R        : Restart (clear progress and reshuffle)
- Options are focusable and selectable via keyboard; progress bar has ARIA attributes.

Project structure
- index.html — app entry, SEO and OG metadata, preconnect for fonts.
- public/
  - logo.svg — site logo (used in header & favicon).
  - og-card.svg, og-card-dark.svg — Open Graph social cards.
- src/
  - main.jsx — mount React app, import CSS.
  - App.jsx — main app state, question flow and wiring.
  - index.css — global styles and responsive rules.
  - assets/data.json — questions array.
  - components/
    - Header.jsx — header (logo, score, progress, restart).
    - Progress.jsx — progress bar component.
    - QuestionCard.jsx — question + options rendering.
  - hooks/
    - useKeyboard.js — centralized keyboard handling.
  - utils/
    - index.js — shared helpers (shuffleIndices, loadState, saveState).

Data format (src/assets/data.json)
- Expect an array of objects:
```json
[
  {
    "question": "In which year was the Earth Summit held?",
    "options": ["1982", "1992", "2002", "2012"],
    "correctAnswer": "1992"
  }
]
```
- `options` can be 3–5 items (1–5 keyboard mapping supported).
- `correctAnswer` should be the exact option string.

Run locally
1. Install:
   npm install

2. Start dev server:
   npm run dev
   Open http://localhost:5173

3. Build for production:
   npm run build
   npm run preview

Deployment
- Build output is in `dist/`. Deploy to any static host (Netlify, Vercel, GitHub Pages).
- Ensure `public/` assets (logo & og images) are included.

Customizing
- Add or edit questions in `src/assets/data.json`. Press Restart (or R) to reshuffle and reset.
- Adjust colors and layout in `src/index.css`.
- Utilities are in `src/utils/index.js` for reuse.

Accessibility & notes
- Options are focusable and selectable by keyboard (Enter/Space).
- Progress uses ARIA attributes on the progressbar for screen readers.
- LocalStorage key: `nptel_prep_state_v1`.
