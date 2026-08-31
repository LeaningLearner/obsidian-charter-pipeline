# Charter Pipeline - Agent Guidelines & Architecture Manual

You are the dedicated AI maintainer and pair-programmer for **Charter Pipeline** (`obsidian-charter-pipeline`), a minimalist Linear-style floating dash stepper and outline navigation plugin for Obsidian.

---

## 🪐 Core Philosophy & Aesthetic Principles

1. **Linear Industrial Minimalist Aesthetic**:
   - Replaces bulky sidebars and noisy minimaps with sleek, floating horizontal dash bars on the note's left margin (`left: 8px`).
   - Pure floating elements with zero container background envelopes or noisy borders.
   - Distinct heading hierarchy (H1 20px / H2 12px / H3 7px / H4~H6 4px) with bold, tactile thickness (H1 3.5px / H2 2.8px / H3 2.2px / H4 1.8px).
2. **100% Strict Left-Alignment**:
   - All dash bars align along a clean vertical baseline without messy rightward indentation.
3. **Dynamic Gutter Scaling & Anti-Collision**:
   - Measures real-time left margin distance (`leftGutter`) to the text sizer (`.cm-sizer` in editing mode, `.markdown-preview-sizer` in reading mode).
   - Wide screens expand bars up to ~40px; compact screens shrink them to ~18px.
   - Always guarantees $\ge 20\text{px}$ breathing safety buffer, never touching note text or Callout boxes.
4. **Rich KaTeX Formula Excerpts**:
   - Hover popovers parse inline/block LaTeX formulas with 3-line section summaries.
   - Highlights the active reading section with a vivid solid accent badge (`.codex-level-badge.is-active`).
5. **Rock-Solid Pinned-Top Navigation**:
   - Multi-frame calibration across both Live Preview / Source and Reading views, landing headings stably at viewport top with 20px comfortable padding.
6. **Built-in Web Audio Synthesizer**:
   - Crisp mechanical micro-switch audio feedback without external audio files.

---

## 🛠️ Codebase Structure

- `main.js`: Main plugin implementation (Vanilla JS, zero external runtime bundle dependencies).
  - `ChapterPipelinePlugin`: Lifecycle, view attachment, DOM tracking, scroll listener.
  - `ChapterParser`: Headings & KaTeX excerpt parsing.
  - `SoundEngine`: Lightweight Web Audio synthesizer.
  - `ChapterPipelineSettingTab`: User settings panel.
- `styles.css`: CSS styling for dash bars, magnetic physics, tooltips, and badges.
- `manifest.json`: Obsidian plugin metadata.
- `package.json`: NPM package metadata and test scripts.
- `main.test.js`: Node.js native test suite (`node --test`).

---

## 🧪 Verification & Testing

Always run the test suite before committing or releasing:
```bash
npm test
# or: node --test main.test.js
```

---

## 🚀 Release Workflow

When releasing a new version:
1. Ensure all tests pass (`npm test`).
2. Bump version in `manifest.json` and `package.json`.
3. Package release archive:
   ```powershell
   Compress-Archive -Path main.js, manifest.json, styles.css -DestinationPath "chapter-pipeline-<version>.zip" -Force
   ```
4. Commit, push, tag, and publish with GitHub CLI (`gh release create`).
