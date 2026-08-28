# Charter Pipeline Comprehensive Enhancements Design Specification

**Date**: 2026-08-28  
**Topic**: Navigation Commands, Docking Selection, Progress Rail, Dynamic Hierarchy Focus, Glassmorphism, and Chapter Palette  
**Target Version**: v1.1.0  

---

## 1. Overview & Goals

Charter Pipeline is an ultra-minimalist, Linear-inspired floating outline navigation plugin for Obsidian. This specification defines six major cohesive enhancements:
1. **Navigation Commands & Keybindings**: Previous/Next chapter jump commands and a fuzzy-searchable Chapter Quick Switcher (`SuggestModal`).
2. **Left / Right Dock Position**: Customizable docking on either the left or right note margin with automatic anti-collision gutter scaling and tooltip flipping.
3. **Smooth Magnetic Progress Rail**: An optional vertical guide with a sliding active-progress indicator aligned with the currently read section.
4. **Dynamic Hierarchy Focus**: Three configurable hierarchy modes (`all`, `hover-expand`, `active-branch`) providing uncluttered main trunk lines with seamless expansion.
5. **Glassmorphism & Spring Physics Upgrade**: Ultra-refined tooltip popovers with 24px saturated backdrop blur, micro-spring entry/exit animations, and smooth fade transitions across viewport thresholds.
6. **Extreme Layout Resilience**: Enhanced split-screen and ultra-narrow pane detection and transitions.

---

## 2. Configuration & Settings Schema

`DEFAULT_SETTINGS` is extended with full backward compatibility:

```javascript
const DEFAULT_SETTINGS = {
  // Existing settings
  minHeadingLevel: 1,
  maxHeadingLevel: 2,
  ignoreFirstH1: false,
  showExcerpt: true,
  activeColor: '#3b82f6',
  narrowThreshold: 600,
  enableSound: true,
  soundVolume: 50,

  // New settings
  dockPosition: 'left',              // 'left' | 'right'
  hierarchyMode: 'all',              // 'all' | 'hover-expand' | 'active-branch'
  showProgressRail: true,            // boolean
  tooltipGlassmorphism: true         // boolean
};
```

Bilingual I18N strings (English & Simplified Chinese) will be updated in `I18N.en` and `I18N.zh` to support all new settings.

---

## 3. Subsystem Specifications

### 3.1 Commands & `ChapterSuggestModal`

#### Registered Commands:
1. `charter-pipeline:jump-prev`: "Charter Pipeline: Jump to Previous Chapter" / "跳转至上一章"
2. `charter-pipeline:jump-next`: "Charter Pipeline: Jump to Next Chapter" / "跳转至下一章"
3. `charter-pipeline:open-palette`: "Charter Pipeline: Search & Switch Chapter (Palette)" / "搜索并跳转章节 (速览面板)"

#### `ChapterSuggestModal` Implementation:
- Extends `SuggestModal`.
- On open, extracts all parsed chapters for the currently active markdown view.
- `getItems()` returns the array of chapters.
- `getItemText(item)` combines `item.title` and `item.summaryMarkdown` for fuzzy matching.
- `renderSuggestion(item, el)`:
  - Linear level badge `H1`~`H6` (`.codex-level-badge`);
  - Bold rendered heading with KaTeX math rendering;
  - Section excerpt (when available and enabled).
- `onChooseItem(item)`: Triggers `jumpToHeading(view, item)` and plays the tactile click sound.

---

### 3.2 Left / Right Docking & Dynamic Gutter Scaling

#### Layout Mechanics:
- **Left Docking (`left`)**:
  - Container: `left: 8px; right: auto; align-items: flex-start;`
  - Dash Bar: `transform-origin: left center;`
  - Tooltip: Appears to the right (`leftX = itemRect.right + 12`).
  - Gutter Distance: `leftGutter = sizerRect.left - containerRect.left`.
- **Right Docking (`right`)**:
  - Container: `right: 8px; left: auto; align-items: flex-end;`
  - Dash Bar: `transform-origin: right center;`
  - Tooltip: Appears to the left (`leftX = itemRect.left - tooltipWidth - 12`).
  - Gutter Distance: `rightGutter = containerRect.right - sizerRect.right`.
- Viewport boundary detection ensures tooltips never overflow screen edges in any mode.

---

### 3.3 Vertical Progress Rail

- Rendered inside `.codex-stepper-track` when `showProgressRail === true`.
- Background track line: `1.5px` vertical baseline styled with subtle translucent theme border color.
- Active Indicator Pill (`.codex-progress-indicator`):
  - Height dynamically adjusts or translates smoothly (`cubic-bezier(0.16, 1, 0.3, 1)`) to reflect reading progress from the first heading to the currently active heading.
  - Styled with `--codex-active-color` and gentle glow.

---

### 3.4 Dynamic Hierarchy Focus & Folding

Controlled by `hierarchyMode`:
1. **`all` (Default)**: All headings within `minHeadingLevel` ~ `maxHeadingLevel` are continuously rendered and visible.
2. **`hover-expand`**:
   - By default, H3~H6 items receive `.is-collapsed` (`max-height: 0; opacity: 0; margin: 0; padding: 0; pointer-events: none; overflow: hidden;`).
   - When hovering over `.codex-stepper-track`, `.is-collapsed` is lifted via smooth CSS transition (`max-height: 20px; opacity: 0.7;`).
3. **`active-branch`**:
   - H1 and H2 nodes are always visible.
   - H3~H6 nodes belonging to the currently active H1/H2 section remain expanded.
   - Other sub-branches are collapsed until the user hovers over their respective parent.

---

### 3.5 Glassmorphism & Micro-Spring Physics

- **Card Styling**: `backdrop-filter: blur(24px) saturate(180%)`, soft gradient borders, box shadows optimized for dark and light modes.
- **Spring Overshoot Animation**: Popover entry utilizes `cubic-bezier(0.34, 1.56, 0.64, 1)` with `scale(0.96) -> scale(1.0)`.
- **Split-Screen Graceful Fade**: Smooth fade out and scale down (`scale(0.92)`) when pane width drops below `narrowThreshold`.

---

## 4. Verification & Testing Strategy

1. **Automated Unit & Integration Tests (`main.test.js`)**:
   - Verify previous/next chapter navigation state tracking and boundary clamping.
   - Verify `dockPosition === 'right'` DOM classes and geometry calculations.
   - Verify `showProgressRail` indicator positioning and visibility toggle.
   - Verify `hierarchyMode` classes (`.is-collapsed`, hover expansion, active branch resolution).
   - Verify `ChapterSuggestModal` item filtering and selection execution.
   - Preserve 100% pass rate for existing 13 tests.
2. **Manual Visual & Interaction Check**:
   - Obsidian Live Preview and Reading views on light/dark themes.
   - Left/Right dock switching without page reload.
   - Keyboard navigation using commands.
