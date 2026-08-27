<div align="center">

# 🪐 Charter Pipeline

**Minimalist Linear-Style Floating Dash Stepper & Outline Navigation for Obsidian**  
*极简内嵌式 Linear 风格散落横线步进流 · KaTeX 公式预览 · 双模精准置顶*

<br/>

[![GitHub Release](https://img.shields.io/github/v/release/LeaningLearner/obsidian-charter-pipeline?style=flat-square&color=3b82f6&label=Release&sort=semver)](https://github.com/LeaningLearner/obsidian-charter-pipeline/releases)
[![Obsidian MinApp](https://img.shields.io/badge/Obsidian-%E2%89%A5%200.15.0-7c3aed?style=flat-square&logo=obsidian)](https://obsidian.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)
[![Author](https://img.shields.io/badge/Author-%E6%8B%A9%E6%A2%A6%E8%88%9F-blue?style=flat-square)](https://github.com/LeaningLearner)

<br/>

[English](#-english) • [简体中文](#-简体中文)

<br/>

<img src="assets/banner-en.png" alt="Charter Pipeline Banner" width="100%" />

</div>

---

<a name="english"></a>
## 📖 English

### 🌟 Overview

> **💡 Core Concept**: Replaces bulky outline sidebars and noisy progress bars with a few elegant, floating minimalist dash lines — hover to preview KaTeX formula excerpts, click to smooth scroll & pin to the top.

**Charter Pipeline** brings the sleek, ultra-minimalist timeline navigation of **Linear** directly into Obsidian. 

Unlike traditional bulky sidebar trees or noisy full-text minimaps, Charter Pipeline renders a clean vertical series of **floating horizontal dash bars** on the left margin of your note. With proportional heading lengths, instant hover popovers with **KaTeX math previews**, **tactile micro-switch feedback**, and **rock-solid pinned-top navigation** across both Editing and Reading views, navigating complex math and study notes has never been more effortless.

---

### ✨ Key Features

- 🪐 **Minimalist Linear-Style Floating Dashes**:
  - Pure floating horizontal lines on your note margin with zero container envelope background.
  - Distinct hierarchical dash lengths for headings: `H1` (16px), `H2` (12px), `H3` (9px), `H4~H6` (6px).
  - Magnetic jelly spring physics animations on hover and click.
- 💬 **KaTeX Hover Tooltip & 3-Line Excerpt**:
  - Instant floating card centered pixel-perfect on the hovered dash line.
  - Bold wrapped chapter title + unbolded 3-line excerpt from section content.
  - Full native **LaTeX / KaTeX formula rendering** (`$f(x)$`, `$(uv)^{(n)}$`, etc.).
  - Automatic `...` ellipsis truncation for long text.
- 📌 **Pinned-Top Navigation (Editing & Reading Views)**:
  - Supports both **Live Preview / Source Editing View** and **Reading View**.
  - Intelligent multi-frame calibration and Obsidian native lazy-load virtualization fallback guarantee that clicking any heading lands it **consistently and stably at the very top of the viewport** (with 20px comfortable breathing space).
- 🔊 **Tactile Micro-Switch Sound Effects**:
  - Built-in lightweight Web Audio synthesizer generates crisp mechanical mouse micro-switch click and tick sounds without external audio files.
- 🚀 **120 FPS Hardware-Accelerated Scroll Tracking**:
  - Uses `requestAnimationFrame` with CodeMirror 6 active line detection and Reading View visible scroll tracking.
  - Zero frame drops and zero CPU overhead even on 10,000-line math notes.
- 📱 **Split-Screen & Narrow View Auto-Hide**:
  - Automatically fades out when pane width is narrow (e.g. split-screen with PDF notes) so it never clashes with your text.
- ⚙️ **Bilingual Settings Panel**:
  - English by default with automatic Chinese localization support.
  - Toggle 3-line excerpt preview, max heading levels (default H1~H2), ignore first H1 note title, custom active colors, and tactile sound volume.

---

### 🛠️ Installation

#### 1. Via Obsidian Community Plugins (Recommended)
1. Open **Settings** -> **Community Plugins**.
2. Search for **`Charter Pipeline`**.
3. Click **Install**, then **Enable**.

#### 2. Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest [Release](https://github.com/LeaningLearner/obsidian-charter-pipeline/releases).
2. Extract or copy the files into `<YourVault>/.obsidian/plugins/chapter-pipeline/`.
3. Reload Obsidian (`Ctrl + R`) and enable **Charter Pipeline** in **Settings -> Community Plugins**.

---

### ⚙️ Settings Reference

| Setting | Description | Default |
| :--- | :--- | :--- |
| **Show 3-Line Excerpt Preview** | Display a 3-line excerpt with KaTeX formula rendering below the title in the hover popover card. When disabled, only the clean title is shown. | `Enabled (true)` |
| **Ignore First H1 (# Note Title)** | When enabled, the first H1 heading at the top of the note will not generate a dash bar, showing only sub-sections. | `Disabled (false)` |
| **Max Heading Level** | Filter deeper subheadings (`H1 ~ H2`, `H1 ~ H3`, `H1 ~ H4`, `All H1 ~ H6`). | `H1 ~ H2 (Default)` |
| **Active Indicator Color** | Customize the highlight color for the currently active reading section (`Azure Blue`, `Violet`, `Sunset Amber`, `Sakura Pink`, `Theme Accent`). | `Azure Blue (#3b82f6)` |
| **Narrow View Auto-Hide Threshold (px)** | Automatically hide the stepper when note pane width is below this threshold (px) to prevent overlapping text. | `460px` |
| **Enable Tactile Micro-Switch Sound** | Play subtle mechanical micro-switch sounds on clicking chapters and scrolling across headings. | `Enabled (true)` |
| **Sound Volume (%)** | Adjust the volume of interactive tactile sound effects (0 ~ 100%). | `50%` |

---

<br/>

<a name="简体中文"></a>
## 🇨🇳 简体中文

<div align="center">
  <img src="assets/banner-zh.png" alt="Charter Pipeline 中文横幅" width="100%" />
</div>

<br/>

### 🌟 插件简介

> **💡 一句话总结**：**把沉重的目录和复杂的进度条，精简成了几根散落悬浮的高级极简线条，悬浮能看公式摘要，点击能精准置顶跳转。**

**Charter Pipeline** 为 Obsidian 长文档与考研/学术笔记带来了 **Linear 的极简散落横线步进流** 美学。

区别于传统占用大量屏幕空间的臃肿侧边栏目录或信息杂乱的代码小地图，Charter Pipeline 在笔记左侧边缘渲染一列**纯净散落的悬浮横线条**。通过精巧的长短区分（H1~H6）、**支持 KaTeX 数学公式渲染的 3 行气泡卡片**、**清脆微动开关物理音效**、以及**编辑/阅读双模式像素级绝对置顶平滑跳转**，让长文浏览与章节检索变得优雅而极速。

---

### ✨ 核心特性

- 🪐 **Linear 级极简散落横线流**：
  - 纯粹自由散落悬浮在正文左侧，无厚重的外壳背景，还原纯粹原生质感；
  - 严格按标题层级长短区分：`H1`（16px）、`H2`（12px）、`H3`（9px）、`H4~H6`（6px）；
  - 带有弹性果冻磁吸过渡动效，极具交互质感。
- 💬 **3 行 KaTeX 公式气泡与几何中心对齐**：
  - 悬浮横线即刻浮现独立气泡，**垂直正中心 100% 精准对齐短横线**；
  - 顶部为加粗且自动换行的章节名，下方为**浅色未加粗的 3 行正文摘要**；
  - 完整支持 **LaTeX / KaTeX 数学公式**（如 `$(uv)^{(n)}$`、$\lim$ 等）精美渲染，超长自动以 `...` 截断。
- 📌 **双模式像素级绝对置顶跳转（编辑模式 + 阅读模式）**：
  - 全面支持**实时预览/源码编辑模式**与**阅读视图（Reading View）**；
  - 结合 Obsidian 原生懒加载虚拟分段内核与 16 帧几何对齐，无论点击第 1 章还是远端第 30 章，**目标章节永远绝对稳定停靠在编辑器顶部（留出 20px 舒适间距）**。
- 🔊 **机械微动开关清脆交互音效**：
  - 内置基于 Web Audio API 的微型物理合成器，点击横线与跨章节滚动时伴随清脆微动开关触感声，无需加载外置音频文件。
- 🚀 **120 FPS 硬件加速滚动节流 (`requestAnimationFrame`)**：
  - 基于 CodeMirror 6 底层视口行号与阅读模式精准检测当前阅读位置；
  - 翻阅上万字、上百公式的长篇数学笔记时，依然保持 **0 掉帧、0 CPU 负担**。
- 📱 **分屏与窄屏自适应隐藏**：
  - 左边写笔记、右边开 PDF 双拼时，自动感应宽度并智能隐去，绝不遮挡正文内容。
- ⚙️ **中英双语设置面板**：
  - 默认英文，并智能自适应中文系统语言；
  - 可选是否开启 3 行摘要预览、过滤展示层级（默认仅展示 H1~H2 保持极简）、忽略文档首个 H1 主标题、自定义高亮色系、微调音效音量。

---

### 🛠️ 安装方法

#### 1. 从 Obsidian 社区市场安装（推荐）
1. 打开 Obsidian **设置** -> **第三方插件** -> **社区插件市场**；
2. 搜索 **`Charter Pipeline`**；
3. 点击 **安装**，随后点击 **启用** 即可。

#### 2. 手动安装
1. 前往本仓库 [Releases 页面](https://github.com/LeaningLearner/obsidian-charter-pipeline/releases) 下载 `main.js`、`manifest.json` 与 `styles.css`；
2. 将这三个文件放置于笔记库的 `.obsidian/plugins/chapter-pipeline/` 目录下；
3. 在 Obsidian 中按 `Ctrl + R` 刷新，并在 **设置 -> 第三方插件** 中启用。

---

### ⚙️ 设置面板参数说明

| 配置项 | 功能说明 | 默认值 |
| :--- | :--- | :--- |
| **开启正文 3 行摘要预览** | 在悬浮气泡中换行展示正文开头的 3 行摘要（支持 LaTeX / KaTeX 公式渲染，超出 3 行自动显示 ... 省略号）。关闭后仅展示纯净标题。 | `开启 (true)` |
| **忽略文档首个一级大标题** | 开启后，文章最开头的 `# 篇名` 不会生成横线，仅展示正文小节。 | `关闭 (false)` |
| **最大展示标题层级** | 过滤更深层级的子小节（如选择 H1~H2 则仅展示大纲，过滤 H3~H6）。 | `仅 H1 ~ H2 (默认)` |
| **激活高亮横线颜色** | 自定义当前阅读章节的横线加亮颜色（天青蓝、紫罗兰、琥珀、樱花粉、主题色）。 | `天青蓝 (#3b82f6)` |
| **分屏/窄屏自动隐藏宽度阈值** | 笔记窗口宽度小于该像素时自动隐藏横线流以防止遮挡。 | `460px` |
| **开启微动开关机械音效** | 在点击章节与滚动经过标题时，播放精致的机械微动开关清脆音效。 | `开启 (true)` |
| **交互音量大小 (%)** | 自定义交互音效的播放音量（0 ~ 100%）。 | `50%` |

---

## 📄 License / 开源协议

本项目基于 [MIT License](LICENSE) 开源。  
Copyright (c) 2026 [择梦舟 (LeaningLearner)](https://github.com/LeaningLearner)
