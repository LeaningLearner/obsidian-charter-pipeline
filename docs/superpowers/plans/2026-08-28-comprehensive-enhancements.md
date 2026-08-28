# Comprehensive Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement navigation commands, `ChapterSuggestModal` quick switcher, left/right docking configuration, smooth vertical progress rail, dynamic hierarchy focus/folding modes, and ultra-refined glassmorphism animations for Charter Pipeline (v1.1.0).

**Architecture:** Extend Obsidian's plugin settings and I18N dictionary, introduce `ChapterSuggestModal` and navigation commands, adjust track alignment and tooltip positioning dynamically based on dock position, integrate a vertical progress rail with active section tracking, implement CSS-driven hierarchy folding with smooth transitions, and expand the native Node.js test suite.

**Tech Stack:** Vanilla JavaScript (ES6+), Obsidian Plugin API (`SuggestModal`, `PluginSettingTab`, `MarkdownView`, `MarkdownRenderer`), CSS3 (backdrop-filter, cubic-bezier spring transforms, CSS variables), Node.js native test runner (`node:test`, `node:assert/strict`).

**Spec:** [docs/superpowers/specs/2026-08-28-comprehensive-enhancements-design.md](file:///d:/123pan/kaoyan/.obsidian/plugins/chapter-pipeline/docs/superpowers/specs/2026-08-28-comprehensive-enhancements-design.md)

## Global Constraints

- Zero external runtime bundle dependencies (maintain single-file Vanilla JS runtime).
- 100% backward compatibility with existing settings and note metadata.
- Rock-solid pinned-top navigation (20px breathing room) in both Editing and Reading views.
- Strict anti-collision with note text and Callout containers.
- 100% test pass rate with Node native test runner (`npm test`).

---

### Task 1: Settings & I18N Schema Expansion

**Files:**
- Modify: `main.js:5-80` (DEFAULT_SETTINGS, I18N dictionaries)
- Modify: `main.js:282-402` (ChapterPipelineSettingTab)
- Modify: `main.js:485-505` (loadSettings)
- Test: `main.test.js`

**Interfaces:**
- Produces: `plugin.settings.dockPosition` ('left' | 'right'), `plugin.settings.hierarchyMode` ('all' | 'hover-expand' | 'active-branch'), `plugin.settings.showProgressRail` (boolean), `plugin.settings.tooltipGlassmorphism` (boolean).

- [ ] **Step 1: Write the failing test for new settings defaults and loading**

```javascript
test('Settings load new default properties with backward compatibility', async () => {
  const plugin = new ChapterPipelinePlugin(createMockApp(), {});
  await plugin.loadSettings();
  assert.equal(plugin.settings.dockPosition, 'left');
  assert.equal(plugin.settings.hierarchyMode, 'all');
  assert.equal(plugin.settings.showProgressRail, true);
  assert.equal(plugin.settings.tooltipGlassmorphism, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test main.test.js`
Expected: FAIL due to missing default properties.

- [ ] **Step 3: Update `DEFAULT_SETTINGS`, `I18N`, and `ChapterPipelineSettingTab` in `main.js`**

Add `dockPosition`, `hierarchyMode`, `showProgressRail`, `tooltipGlassmorphism` to `DEFAULT_SETTINGS` and `I18N.en`/`I18N.zh`, and add corresponding controls (Dropdowns and Toggles) in `ChapterPipelineSettingTab`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test main.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add main.js main.test.js
git commit -m "feat(settings): add dockPosition, hierarchyMode, showProgressRail, and tooltipGlassmorphism settings"
```

---

### Task 2: Navigation Commands & `ChapterSuggestModal`

**Files:**
- Modify: `main.js` (add `ChapterSuggestModal` class, `registerCommands` in `ChapterPipelinePlugin.onload`)
- Test: `main.test.js`

**Interfaces:**
- Produces:
  - `class ChapterSuggestModal extends SuggestModal`
  - `plugin.jumpToPreviousChapter(view)`
  - `plugin.jumpToNextChapter(view)`
  - `plugin.openChapterPalette(view)`

- [ ] **Step 1: Write the failing test for previous/next chapter jumps and suggest modal**

```javascript
test('jumpToNextChapter and jumpToPreviousChapter navigate correctly across chapters', async () => {
  const plugin = new ChapterPipelinePlugin(createMockApp(), {});
  // simulate mock view with chapters
  // verify active index jumps forward and backward within bounds
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test main.test.js`
Expected: FAIL due to undefined methods.

- [ ] **Step 3: Implement `ChapterSuggestModal` and navigation commands in `main.js`**

Implement `ChapterSuggestModal` inheriting from `SuggestModal` with `getItems`, `getItemText`, `renderSuggestion`, and `onChooseItem`. Add `jumpToPreviousChapter`, `jumpToNextChapter`, `openChapterPalette` methods and register Obsidian commands in `onload()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test main.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add main.js main.test.js
git commit -m "feat(nav): implement navigation commands and ChapterSuggestModal quick switcher"
```

---

### Task 3: Left / Right Docking & Dynamic Gutter Scaling

**Files:**
- Modify: `main.js` (`attachStepperToView`, `updateGutterDimensions`)
- Modify: `styles.css` (`.codex-stepper-container.dock-right`, `.codex-dash-bar`, `.codex-floating-tooltip`)
- Test: `main.test.js`

**Interfaces:**
- Consumes: `plugin.settings.dockPosition`
- Produces: Dynamic right/left CSS class bindings, gutter calculations for `rightGutter`, and tooltip left coordinate calculation.

- [ ] **Step 1: Write failing test for dockPosition right layout**

```javascript
test('dockPosition right sets dock-right class and calculates right gutter', async () => {
  const plugin = new ChapterPipelinePlugin(createMockApp(), {});
  plugin.settings.dockPosition = 'right';
  // verify container has 'dock-right' class and tooltip calculates left position
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test main.test.js`
Expected: FAIL

- [ ] **Step 3: Implement right-dock positioning and gutter calculation in `main.js` and `styles.css`**

Add `dock-right` class handling to `stepperContainer`, calculate `rightGutter` from sizer when docked right, position tooltip to the left of the dash bar with viewport clamping, and add CSS rules for `.dock-right`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test main.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add main.js styles.css main.test.js
git commit -m "feat(dock): add right docking support with dynamic gutter scaling and tooltip flipping"
```

---

### Task 4: Smooth Magnetic Vertical Progress Rail

**Files:**
- Modify: `main.js` (`attachStepperToView`, `updateActiveByRealLine`)
- Modify: `styles.css` (`.codex-progress-rail`, `.codex-progress-indicator`)
- Test: `main.test.js`

**Interfaces:**
- Consumes: `plugin.settings.showProgressRail`
- Produces: Vertical rail DOM elements and active progress height / translate calculations.

- [ ] **Step 1: Write failing test for progress rail creation and update**

```javascript
test('showProgressRail creates vertical rail and updates indicator position', async () => {
  const plugin = new ChapterPipelinePlugin(createMockApp(), {});
  plugin.settings.showProgressRail = true;
  // verify .codex-progress-rail element exists and syncs on scroll
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test main.test.js`
Expected: FAIL

- [ ] **Step 3: Implement vertical progress rail in `main.js` and `styles.css`**

Create `.codex-progress-rail` and `.codex-progress-indicator` inside `.codex-stepper-track` when `showProgressRail` is enabled. Update indicator position in `updateActiveByRealLine()` smoothly.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test main.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add main.js styles.css main.test.js
git commit -m "feat(rail): add smooth magnetic vertical progress rail indicator"
```

---

### Task 5: Dynamic Hierarchy Focus & Folding

**Files:**
- Modify: `main.js` (`attachStepperToView`, `updateActiveByRealLine`)
- Modify: `styles.css` (`.codex-dash-item.is-collapsed`, `.codex-stepper-track:hover`)
- Test: `main.test.js`

**Interfaces:**
- Consumes: `plugin.settings.hierarchyMode` ('all' | 'hover-expand' | 'active-branch')
- Produces: CSS classes and dynamic expansion on hover and active section shift.

- [ ] **Step 1: Write failing test for hierarchyMode folding**

```javascript
test('hierarchyMode hover-expand marks H3+ as is-collapsed', async () => {
  const plugin = new ChapterPipelinePlugin(createMockApp(), {});
  plugin.settings.hierarchyMode = 'hover-expand';
  // verify H3 items have is-collapsed class
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test main.test.js`
Expected: FAIL

- [ ] **Step 3: Implement hierarchy focus modes in `main.js` and `styles.css`**

Add logic to tag H3+ items with `is-collapsed` based on `hierarchyMode`. For `hover-expand`, add hover handlers/CSS. For `active-branch`, update collapsed states when `activeIdx` changes. Add CSS transitions for height and opacity.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test main.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add main.js styles.css main.test.js
git commit -m "feat(hierarchy): implement dynamic hierarchy focus and folding modes"
```

---

### Task 6: CSS Glassmorphism, Micro-Spring Physics & Viewport Resilience

**Files:**
- Modify: `styles.css` (Tooltip backdrop-filter, cubic-bezier physics, narrow pane transitions)
- Modify: `main.js` (threshold checks and graceful fade handling)
- Test: `main.test.js`

**Interfaces:**
- Consumes: `plugin.settings.tooltipGlassmorphism`
- Produces: Translucent saturated glassmorphism, spring entrance animations, and smooth pane scale down on narrow widths.

- [ ] **Step 1: Write test for narrow view transition and glassmorphism styling classes**

```javascript
test('narrow width applies is-narrow with smooth transition and class states', async () => {
  // verify is-narrow toggling and tooltipGlassmorphism class bindings
});
```

- [ ] **Step 2: Run test to verify it fails or validates properties**

Run: `node --test main.test.js`

- [ ] **Step 3: Implement CSS polish and refined styling in `styles.css` and `main.js`**

Add `backdrop-filter: blur(24px) saturate(180%)`, soft gradient borders, `scale(0.96) -> scale(1)` spring transitions, and smooth `scale(0.92)` narrow container fading.

- [ ] **Step 4: Run all tests to verify everything passes**

Run: `node --test main.test.js`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add styles.css main.js main.test.js
git commit -m "style: enhance glassmorphism, spring physics, and viewport transition resilience"
```

---

### Task 7: Full Verification, Documentation & Release Packaging (v1.1.0)

**Files:**
- Modify: `manifest.json` (bump version to 1.1.0)
- Modify: `package.json` (bump version to 1.1.0)
- Modify: `README.md` (document new settings, commands, and features in EN & ZH)
- Generate: `chapter-pipeline-1.1.0.zip`

- [ ] **Step 1: Run complete test suite**

Run: `npm test`
Expected: 100% PASS

- [ ] **Step 2: Update version numbers in `manifest.json` and `package.json`**

Bump versions to `1.1.0`.

- [ ] **Step 3: Update `README.md` with complete documentation for all new features**

Document new settings (`Dock Position`, `Hierarchy Mode`, `Progress Rail`, `Glassmorphism`), commands (`Jump to Previous`, `Jump to Next`, `Search & Switch Chapter`), and bilingual guides.

- [ ] **Step 4: Build release zip archive**

Run:
```powershell
Compress-Archive -Path main.js, manifest.json, styles.css -DestinationPath "chapter-pipeline-1.1.0.zip" -Force
```

- [ ] **Step 5: Commit release preparation**

```bash
git add manifest.json package.json README.md
git commit -m "release: bump version to 1.1.0 with comprehensive feature upgrades"
```
