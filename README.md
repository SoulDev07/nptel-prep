<p align="center">
  <img src="/public/logo.svg" alt="NPTEL Prep" width="110" />
</p>

<h1 align="center">NPTEL Prep App</h1>

<p align="center">
  Lightweight web app to practice NPTEL assignment MCQs. One question at a time, instant feedback, persistent progress, and a polished responsive UI for desktop & mobile.
</p>

---

## Screenshots

![Home](/public/home.webp)
![Stats](/public/stats.webp)

---

## Features

- Focused single-question UI with immediate correct/wrong feedback.
- Practice official NPTEL course assignment questions.
- Assignment JSON importer & PDF-to-JSON LLM prompt helper.
- Keyboard shortcuts for rapid, seamless practice.

---

## Keyboard shortcuts

- `1`–`5` - Select option 1..5
- `W` / `S` - Move option focus up / down
- `Enter` / `Space` - Select focused option
- `←` / `A` - Previous question
- `→` / `D` - Next question (or advance if answered / skip)
- `R` - Restart session (clears progress and reshuffles)
- `?` / `H` - Open keyboard shortcuts guide

---

## Data format

Edit `src/assets/data.json` or import custom JSON files. Expected structure:

```json
[
  {
    "question": "In which year was the Earth Summit held?",
    "options": ["1982", "1992", "2002", "2012"],
    "correctAnswer": "1992"
  }
]
```

Notes:

- `options` may contain 3–5 items. Keys `1`–`5` map to each option.
- `correctAnswer` must exactly match an option string.

---

## Run locally

### 1. Clone the repository

```bash
git clone https://github.com/SoulDev07/nptel-prep.git
cd nptel-prep
```

### 2. Install dependencies

```bash
pnpm install
```

> Or use `npm install`.

### 3. Start development server

```bash
pnpm dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production (optional)

```bash
pnpm build
pnpm preview
```

---

<p align="center">
  Built with ❤️ using React & Vite - optimized for quick focused practice.
</p>
