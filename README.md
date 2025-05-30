# Code-Unscramble Tool

_A lightweight, browser-based code-puzzle game for classrooms (≈ 50 students)_

---

## 1. Project Overview

Code-Unscramble Tool turns any code snippet into a **drag-and-drop puzzle**.  
Teachers paste well-formatted code, the app scrambles the lines and produces a shareable link.  
Students open the link, reorder the lines, and receive **instant visual feedback** when they discover the correct solution.

The goal is to help learners:

* strengthen reading flow and control-structure intuition  
* practice debugging, indentation, and algorithm comprehension  
* engage in friendly competition during short in-class challenges

---

## 2. How It Works

| Role | Action | Result |
|------|--------|--------|
| **Teacher** | 1. Opens _Create Scramble_ page <br>2. Pastes any JS code <br>3. (Optional) enables “Show correctness indicator” | Link is generated containing: <br>• lines in **scrambled** order <br>• 6-char hash of the original (unscrambled) code when indicator is enabled |
| **Student** | 1. Opens the link <br>2. Sees the scrambled lines with grip icons <br>3. Drags lines until code “looks right” | A floating badge shows **✓** (green) when their current ordering’s hash matches the teacher’s hash, otherwise **✗** (red) |

The hash guarantees the correct order can be verified _without_ exposing it in the URL.

---

## 3. Feature Highlights

* **Drag-and-Drop Interface** – powered by SortableJS, smooth animations  
* **Live Prettier Formatting** – formatted preview updates on every move  
* **Correctness Checkmark (new!)**  
  * Large circular badge (✓ / ✗) with single-sentence hint  
  * Activated only when the `hash` param is present  
* **URL-Only Puzzles** – no server, no database, easy to share  
* **Whitespace-Insensitive Hashing** – lines are trimmed before hashing so `{  }` vs `}` indent differences don’t leak order hints  
* **Copy-to-Clipboard Buttons** for links and solved code

---

## 4. Quick Start Guide

### Teacher – Create a Puzzle

1. Open `new_scramble.html` in a browser.
2. Paste or type a JavaScript snippet in the editor.
3. _Optional_: Tick **Show correctness indicator** to enable ✓/✗ for students.
4. Click **Copy** to copy the generated link.
5. Share the link with learners (e.g., chat, LMS).

### Student – Solve the Puzzle

1. Open the shared link.
2. Drag the grip-icons to reorder lines.
3. Watch the formatted preview update.
4. When the badge turns **green ✓**, celebrate!

---

## 5. Technical Details

| Area | Implementation |
|------|----------------|
| **Stack** | Vanilla HTML / CSS / JS + Bootstrap 5 + FontAwesome |
| **Formatting** | [Prettier 3](https://prettier.io/) (stand-alone CDN) |
| **Drag-n-Drop** | [SortableJS](https://sortablejs.github.io/) |
| **Hashing** | Base64 of trimmed lines → first 6 chars (`btoa(lines.join('')).substr(0,6)`) |
| **Indicator Logic** | `hash` param present ⇒ enabled <br>`hash` absent/blank ⇒ disabled |
| **Security Note** | Only 6 chars are used — strong secrecy is _not_ required for this small educational setting. |

---

## 6. Repository Structure

```
.
├── index.html          # Student puzzle page
├── new_scramble.html   # Teacher creation page
├── script.js           # Shared logic & UI behaviour
├── .vscode/            # Editor hints
└── README.md           # You are here
```

_No build step, everything runs client-side._

---

## 7. Running / Deploying

Local development:

```bash
# inside repo root
python3 -m http.server 8000
# open http://localhost:8000/new_scramble.html
```

Deployment options:

* **Static Hosting** – GitHub Pages, Netlify, Vercel, or any static bucket.
* **Embed in LMS** – Upload the three files above; no backend needed.

Because the entire state lives in the URL, multiple teachers can host a single copy and still generate unique puzzles.

---

## 8. Educational Use-Cases

* **Exit-Ticket Challenges** – 5-minute unscramble at lesson end.
* **Pair-Programming Warm-ups** – partners discuss code flow while dragging.
* **Algorithm Reveal** – gradually introduce new constructs by letting students “discover” them.
* **Assessment** – quick formative check of comprehension without grading overhead.

> Designed for **~50 learners**; lightweight enough to run in school networks with zero server load.

---

### Screenshots (Alt-Text Descriptions)

1. _Teacher View_: Dark-theme editor on left, preview link field on right, “Show correctness indicator” checkbox highlighted.  
2. _Student View_: Two-column layout – left column shows pale blue draggable list with grip icons, right column shows formatted code, circular badge (red ✗) floats top-right.  
3. _Solved State_: Same layout but badge is green ✓, code preview is neatly formatted.

---

Happy unscrambling! 🙌
