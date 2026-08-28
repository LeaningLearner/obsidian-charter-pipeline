<div align="center">

# 🪐 Charter Pipeline

**Minimalist Linear-Style Floating Dash Stepper & Outline Navigation for Obsidian**  
*极简内嵌式 Linear 风格散落横线步进流 · KaTeX 公式预览 · 双模精准置顶*

<br/>

[![GitHub Release](https://img.shields.io/github/v/release/LeaningLearner/obsidian-charter-pipeline?style=flat-square&color=3b82f6&label=Release&sort=semver)](https://github.com/LeaningLearner/obsidian-charter-pipeline/releases)
[![GitHub Downloads](https://img.shields.io/github/downloads/LeaningLearner/obsidian-charter-pipeline/total?style=flat-square&color=f59e0b&label=Downloads&logo=github)](https://github.com/LeaningLearner/obsidian-charter-pipeline/releases)
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
  - Distinct hierarchical dash lengths and tactile thickness: `H1` (20px / 3.5px), `H2` (12px / 2.8px), `H3` (7px / 2.2px), `H4~H6` (4px / 1.8px).
  - 100% strict vertical left-alignment with dynamic gutter anti-collision scaling.
  - Magnetic jelly spring physics animations on hover and click.
- 📐 **Left / Right Margin Docking**:
  - Choose to dock the pipeline stepper on either the **Left** or **Right** margin of the note pane.
  - Automatic right gutter distance calculation and inverted popover card positioning when right-docked.
- 🌲 **Smart Hierarchy Folding & Focus Modes**:
  - **All Headings Expanded (`all`)**: Standard flat display of all headings up to the configured max level.
  - **Focus Mode (`hover-expand`)**: Keeps view clean by collapsing `H3+` subheadings until you hover over the pipeline rail to gracefully expand them with spring physics.
  - **Active Branch Only (`active-branch`)**: Intelligently expands only the subheadings of the section you are currently reading while folding others.
- 📏 **Vertical Progress Rail & Active Indicator**:
  - Optional subtle magnetic vertical guide line indicating your exact reading progress through the document's structure.
  - Smoothly tracking indicator reflecting the currently active section.
- 💬 **KaTeX Hover Tooltip & 3-Line Excerpt**:
  - Instant floating card centered pixel-perfect on the hovered dash line.
  - Bold wrapped chapter title + unbolded 3-line excerpt from section content.
  - Full native **LaTeX / KaTeX formula rendering** (`$f(x)$`, `$(uv)^{(n)}$`, etc.).
  - Automatic `...` ellipsis truncation for long text.
  - Saturated glassmorphism backdrop blur and spring overshoot entrance animations (toggleable).
- 🔍 **Chapter Palette Quick Switcher & Keyboard Jump**:
  - Open a dedicated fuzzy search modal (`Charter Pipeline: Search & switch chapter`) to search and jump to any chapter with instant formula previews and hierarchy badges.
  - Bindable hotkeys for **Jump to Previous Chapter** and **Jump to Next Chapter**.
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
  - Fine-grained controls for excerpt preview, heading levels, dock position, hierarchy mode, progress rail, glassmorphism, active colors, and sound effects.

---

### ⌨️ Commands & Shortcuts

Charter Pipeline provides commands that you can bind to custom hotkeys in **Settings -> Hotkeys**:

| Command ID | Command Name | Description |
| :--- | :--- | :--- |
| `charter-pipeline-jump-prev` | **Charter Pipeline: Jump to previous chapter** | Navigate directly to the previous heading with pinned-top landing. |
| `charter-pipeline-jump-next` | **Charter Pipeline: Jump to next chapter** | Navigate directly to the next heading with pinned-top landing. |
| `charter-pipeline-open-palette` | **Charter Pipeline: Search & switch chapter (Palette)** | Open a fuzzy search modal with chapter titles, badges, and formula excerpts. |

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
| **Show 3-Line Excerpt Preview** (`showExcerpt`) | Display a 3-line excerpt with KaTeX formula rendering below the title in the hover popover card. When disabled, only the clean title is shown. | `Enabled (true)` |
| **Ignore First H1 (# Note Title)** (`ignoreFirstH1`) | When enabled, the first H1 heading at the top of the note will not generate a dash bar, showing only sub-sections. | `Disabled (false)` |
| **Dock Position** (`dockPosition`) | Choose whether to display the outline pipeline on the left or right margin of the note (`Left Margin`, `Right Margin`). | `Left Margin (left)` |
| **Heading Hierarchy Mode** (`hierarchyMode`) | Control the display mode of subheadings: `All Headings Expanded` (all), `Focus Mode (Hover Expand)` (hover-expand), or `Active Branch Only` (active-branch). | `All Headings Expanded (all)` |
| **Show Vertical Progress Rail** (`showProgressRail`) | Display a smooth magnetic vertical progress guide line indicating reading position. | `Disabled (false)` |
| **Tooltip Glassmorphism & Spring Physics** (`tooltipGlassmorphism`) | Enable backdrop blur glassmorphism and spring overshoot animations for hover popovers. | `Enabled (true)` |
| **Max Heading Level** (`maxHeadingLevel`) | Filter deeper subheadings (`H1 ~ H2`, `H1 ~ H3`, `H1 ~ H4`, `All H1 ~ H6`). | `H1 ~ H2 (Default)` |
| **Active Indicator Color** (`activeColor`) | Customize the highlight color for the currently active reading section (`Azure Blue`, `Violet`, `Sunset Amber`, `Sakura Pink`, `Theme Accent`). | `Azure Blue (#3b82f6)` |
| **Narrow View Auto-Hide Threshold (px)** (`narrowThreshold`) | Automatically hide the stepper when note pane width is below this threshold (px) to prevent overlapping text. | `600px` |
| **Enable Tactile Micro-Switch Sound** (`enableSound`) | Play subtle mechanical micro-switch sounds on clicking chapters and scrolling across headings. | `Enabled (true)` |
| **Sound Volume (%)** (`soundVolume`) | Adjust the volume of interactive tactile sound effects (0% - 100%). | `50%` |

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
  - 纯粹自由散落悬浮在正文边距，无厚重的外壳背景，还原纯粹原生质感；
  - 严格按标题层级长短与粗细区分：`H1`（20px / 3.5px）、`H2`（12px / 2.8px）、`H3`（7px / 2.2px）、`H4~H6`（4px / 1.8px）；
  - 严格 100% 垂直左对齐基线，内置动态边距防遮挡缩放；
  - 带有弹性果冻磁吸过渡动效，极具交互质感。
- 📐 **左右边距自由停靠（Dock Position）**：
  - 支持将章节步进流停靠在笔记**左侧边栏**或**右侧边栏**；
  - 停靠在右侧时自动计算右侧边距并镜像气泡对齐方向。
- 🌲 **智能多级标题折叠与聚焦模式（Hierarchy Modes）**：
  - **全部平铺展开（all）**：传统平铺展示所有层级标题；
  - **主干聚焦模式（hover-expand）**：默认收起 H3~H6 深层子小节，仅保留 H1/H2 主干；鼠标悬停导轨区域时平滑展开全部子节；
  - **当前分支聚焦（active-branch）**：智能跟随阅读进度，仅动态展开当前正在阅读的章节分支，自动折叠其余分支。
- 📏 **垂直微光进度导轨（Progress Rail）**：
  - 可选极简微光垂直导轨线，配合磁吸小圆点/光标实时指示整篇笔记的阅读进度。
- 💬 **3 行 KaTeX 公式气泡与几何中心对齐**：
  - 悬浮横线即刻浮现独立气泡，**垂直正中心 100% 精准对齐短横线**；
  - 顶部为加粗且自动换行的章节名，下方为**浅色未加粗的 3 行正文摘要**；
  - 完整支持 **LaTeX / KaTeX 数学公式**（如 `$(uv)^{(n)}$`、$\lim$ 等）精美渲染，超长自动以 `...` 截断；
  - 支持高级高饱和毛玻璃模糊背景（Backdrop Blur）与拟物弹簧微动进场动效（可开关）。
- 🔍 **章节搜索指令面板（Palette）与快捷键快速跳转**：
  - 提供专属模糊搜索指令面板（`Charter Pipeline: 搜索并快速跳转章节 (Palette)`），支持快捷输入搜索章节名并预览公式与层级标签；
  - 提供**跳转到上一章节**与**跳转到下一章节**命令，可自由绑定自定义快捷键。
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
  - 支持摘要预览、展示层级、左右停靠、折叠模式、进度导轨、毛玻璃动效、高亮色系与音效微调。

---

### ⌨️ 命令与快捷键导航

您可以在 Obsidian **设置 -> 快捷键** 中为以下命令绑定专属快捷键：

| 命令 ID | 命令名称 | 功能说明 |
| :--- | :--- | :--- |
| `charter-pipeline-jump-prev` | **Charter Pipeline: Jump to previous chapter** (跳转至上一章节) | 平滑滚动并绝对置顶跳转至上一个标题。 |
| `charter-pipeline-jump-next` | **Charter Pipeline: Jump to next chapter** (跳转至下一章节) | 平滑滚动并绝对置顶跳转至下一个标题。 |
| `charter-pipeline-open-palette` | **Charter Pipeline: Search & switch chapter (Palette)** (搜索并快速跳转章节) | 弹出快速搜索面板，支持模糊检索章节、展示公式摘要并直达目标。 |

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
| **开启正文 3 行摘要预览** (`showExcerpt`) | 在悬浮气泡中换行展示正文开头的 3 行摘要（支持 LaTeX / KaTeX 公式渲染，超出 3 行自动显示 ... 省略号）。关闭后仅展示纯净标题。 | `开启 (true)` |
| **忽略文档首个一级大标题** (`ignoreFirstH1`) | 开启后，文章最开头的 `# 篇名` 不会生成横线，仅展示正文小节。 | `关闭 (false)` |
| **靠栏停靠位置** (`dockPosition`) | 选择大纲横线流停靠在笔记编辑区的左侧或右侧边栏（`左侧边栏`、`右侧边栏`）。 | `左侧边栏 (left)` |
| **多级标题展示模式** (`hierarchyMode`) | 控制 H3~H6 深层子小节的展示策略：`全部平铺展开 (all)`、`主干聚焦模式 (hover-expand)`、`当前分支聚焦 (active-branch)`。 | `全部平铺展开 (all)` |
| **开启垂直进度导轨** (`showProgressRail`) | 在横线左侧显示一条极简平滑的垂直微光导轨，实时指示当前章节阅读进度。 | `关闭 (false)` |
| **毛玻璃质感与弹簧动效** (`tooltipGlassmorphism`) | 开启悬浮气泡毛玻璃模糊背景 (Backdrop Blur) 与拟物弹簧微动进场动效。 | `开启 (true)` |
| **最大展示标题层级** (`maxHeadingLevel`) | 过滤更深层级的子小节（如选择 `H1 ~ H2` 则仅展示大纲，过滤 `H3 ~ H6`）。 | `仅 H1 ~ H2 (默认)` |
| **激活高亮横线颜色** (`activeColor`) | 自定义当前阅读章节的横线加亮颜色（天青蓝、紫罗兰、琥珀、樱花粉、主题色）。 | `天青蓝 (#3b82f6)` |
| **分屏/窄屏自动隐藏宽度阈值** (`narrowThreshold`) | 笔记窗口宽度小于该像素时自动隐藏横线流以防止遮挡。 | `600px` |
| **开启微动开关机械音效** (`enableSound`) | 在点击章节与滚动经过标题时，播放精致的机械微动开关清脆音效。 | `开启 (true)` |
| **交互音量大小 (%)** (`soundVolume`) | 自定义交互音效的播放音量（0% - 100%）。 | `50%` |

---

## 📄 License / 开源协议

本项目基于 [MIT License](LICENSE) 开源。  
Copyright (c) 2026 [择梦舟 (LeaningLearner)](https://github.com/LeaningLearner)
