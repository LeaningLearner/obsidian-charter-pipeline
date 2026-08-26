# Charter Pipeline (Obsidian Plugin)

> **Minimalist Codex-style floating horizontal dash stepper for Obsidian with KaTeX formula previews and pinned top navigation.**  
> 极简内嵌式文章章节横线步进导航插件：散落悬浮、LaTeX / KaTeX 公式预览、精准置顶平滑跳转与分屏自适应隐藏。

---

## ✨ Features / 核心特性

- 🪐 **Codex / Linear Minimalist Aesthetic (极简散落横线流)**:
  - Embeds native floating horizontal dash lines on the left edge of your notes.
  - Automatically structures H1-H6 heading hierarchy with proportional dash lengths (`16px`, `12px`, `9px`, `6px`).
  - No bulky background envelopes — 100% clean floating UI.

- 💬 **Hover Tooltip with 3-Line Excerpt & KaTeX (悬浮气泡与 KaTeX 渲染)**:
  - Instant hover popover centered pixel-perfect on the dash line.
  - Bold chapter title with automatic text wrapping.
  - 3-line unbolded excerpt from section text with full **LaTeX / KaTeX** formula support (`$f(x)$`, `$(uv)^{(n)}$`, etc.).
  - Automatic `...` ellipsis truncation for long content.

- 📌 **Pinned Top Navigation (像素级绝对置顶跳转)**:
  - Clicking any horizontal dash bar smoothly scrolls the target heading **straight to the top edge of the editor** (with 20px comfortable breathing room).
  - Two-pass virtual layout correction ensures rock-solid positioning on long notes.

- 🚀 **120 FPS Hardware Accelerated Scroll Tracking (`requestAnimationFrame`)**:
  - Real-time line position matching based on CodeMirror 6 active viewport lines.
  - 0 CPU overhead, 0 frame drops even during rapid scrolling on 10,000-line math notes.

- 📱 **Split-Screen & Narrow View Auto-Hide (窄屏自适应隐藏)**:
  - Automatically hides when pane width is below threshold (e.g. when splitting screen with PDF notes) to prevent overlapping with text.

- ⚙️ **Customizable Settings Panel (丰富的设置选项)**:
  - Toggle 3-line excerpt preview.
  - Ignore the first H1 note title.
  - Filter heading levels (H1~H2, H1~H3, H1~H6).
  - Customizable active highlight color (Azure Blue default, Violet, Amber, Sakura Pink, Theme Accent).
  - Configurable auto-hide threshold width.

---

## 🛠️ Installation / 安装方法

### From Obsidian Community Plugins (Official) / 社区市场安装
1. Open **Obsidian Settings** -> **Community Plugins**.
2. Search for **`Charter Pipeline`**.
3. Click **Install**, then **Enable**.

### Manual Installation / 手动安装
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest [GitHub Release](https://github.com/LeaningLearner/obsidian-charter-pipeline/releases).
2. Create a folder named `chapter-pipeline` inside your Obsidian vault: `<VaultFolder>/.obsidian/plugins/chapter-pipeline/`.
3. Place the three downloaded files inside.
4. Reload Obsidian (`Ctrl + R`) and enable the plugin under **Settings -> Community Plugins**.

---

## ⚙️ Settings / 配置说明

| Setting | Description | Default |
| :--- | :--- | :--- |
| **开启正文 3 行摘要预览** | 在悬浮气泡中换行展示正文开头的 3 行摘要（支持 KaTeX 公式）。关闭后仅展示纯净标题。 | `true` (开启) |
| **忽略文档首个一级大标题** | 文章开头的第一个 `# 篇名` 不会生成横线，仅展示正文小节。 | `false` |
| **最大展示标题层级** | 过滤更深层级的子小节（如选择 H1~H3 或全部 H1~H6）。 | `H1 ~ H6` |
| **激活高亮横线颜色** | 自定义当前阅读章节的加亮颜色（默认天青蓝）。 | `天青蓝 (#3b82f6)` |
| **分屏自动隐藏阈值 (px)** | 当笔记窗口宽度小于该像素时自动隐藏横线流。 | `460px` |

---

## 📄 License

[MIT License](LICENSE) © 2026 [择梦舟 (LeaningLearner)](https://github.com/LeaningLearner)
