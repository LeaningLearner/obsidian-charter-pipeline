'use strict';

const { Plugin, MarkdownView, MarkdownRenderer, PluginSettingTab, Setting } = require('obsidian');

const DEFAULT_SETTINGS = {
  minHeadingLevel: 1,
  maxHeadingLevel: 6,
  ignoreFirstH1: false,
  showExcerpt: true,
  activeColor: '#3b82f6',
  narrowThreshold: 460
};

class ChapterParser {
  static parse(content, headings, settings) {
    if (!headings || headings.length === 0) return [];
    const chapters = [];

    const minLevel = settings ? settings.minHeadingLevel : 1;
    const maxLevel = settings ? settings.maxHeadingLevel : 6;
    const ignoreFirstH1 = settings ? settings.ignoreFirstH1 : false;
    const showExcerpt = settings ? (settings.showExcerpt !== false) : true;

    const lines = content ? content.split(/\r?\n/) : [];
    const totalLines = lines.length;

    let skippedFirstH1 = false;

    for (let i = 0; i < headings.length; i++) {
      const currentH = headings[i];
      const nextH = headings[i + 1];

      if (ignoreFirstH1 && !skippedFirstH1 && currentH.level === 1) {
        skippedFirstH1 = true;
        continue;
      }

      if (currentH.level < minLevel || currentH.level > maxLevel) {
        continue;
      }

      // 清理标题中的注释、Tag 和属性标记
      let cleanTitle = currentH.heading
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/#([\w\u4e00-\u9fa5-]+)/g, '')
        .replace(/\[status::.*?\]/gi, '')
        .trim();

      if (!cleanTitle) cleanTitle = currentH.heading;

      // 纯净提取正文前 3 行摘要（过滤 Callout 容器框，保留 LaTeX 数学公式）
      let summaryMarkdown = '';
      if (showExcerpt && lines.length > 0) {
        const startLine = currentH.position.start.line;
        const endLine = nextH ? nextH.position.start.line - 1 : totalLines - 1;
        const chapterLines = lines.slice(startLine + 1, endLine + 1);

        const cleanedLines = chapterLines.map((l) => {
          let s = l.replace(/<!--[\s\S]*?-->/g, '').trim();
          // 剥除所有引用前缀 >
          while (s.startsWith('>')) {
            s = s.substring(1).trim();
          }
          // 剥除 Callout 标记如 [!problem] 或 [!solution]
          s = s.replace(/^\[![\w-]+\]\s*/i, '');
          // 剥除双链 [[...|...]]
          s = s.replace(/\[\[.*?\|(.*?)\]\]/g, '$1').replace(/\[\[(.*?)\]\]/g, '$1');
          return s;
        }).filter((s) => s && !s.startsWith('#') && !s.startsWith('---') && !s.startsWith('```'));

        let fullText = cleanedLines.join('\n');
        // 将块级公式 $$...$$ 转为行内 $...$，在气泡中紧凑展示并被 KaTeX 渲染
        fullText = fullText.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (match, math) => {
          const compact = math.replace(/\r?\n/g, ' ').replace(/\\\\/g, ' ').trim();
          return '$' + compact + '$';
        });

        let singleLine = fullText.split(/\r?\n/).join(' ').replace(/\s+/g, ' ').trim();
        if (singleLine.length > 200) {
          singleLine = singleLine.substring(0, 200);
        }

        if (singleLine) {
          summaryMarkdown = singleLine;
        }
      }

      chapters.push({
        title: cleanTitle,
        level: currentH.level,
        line: currentH.position.start.line,
        summaryMarkdown
      });
    }

    return chapters;
  }
}

class ChapterPipelineSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Charter Pipeline 设置' });

    new Setting(containerEl)
      .setName('开启正文 3 行摘要预览')
      .setDesc('开启后在悬浮气泡中换行展示正文开头的 3 行摘要（支持 LaTeX / KaTeX 公式渲染，超出 3 行自动显示 ... 省略号）。关闭后仅展示纯净标题。')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showExcerpt !== false)
          .onChange(async (value) => {
            this.plugin.settings.showExcerpt = value;
            await this.plugin.saveSettings();
            this.plugin.updateAllMarkdownViews();
          })
      );

    new Setting(containerEl)
      .setName('忽略文档首个一级大标题 (# 篇名)')
      .setDesc('开启后，文章最开头的第一个 H1 大标题不会生成横线，仅展示正文小节。')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.ignoreFirstH1)
          .onChange(async (value) => {
            this.plugin.settings.ignoreFirstH1 = value;
            await this.plugin.saveSettings();
            this.plugin.updateAllMarkdownViews();
          })
      );

    new Setting(containerEl)
      .setName('最大展示标题层级')
      .setDesc('例如设为 3 则只展示 H1~H3 章节，过滤更深层级的子小节。')
      .addDropdown((drop) =>
        drop
          .addOption('2', '仅 H1 ~ H2')
          .addOption('3', 'H1 ~ H3')
          .addOption('4', 'H1 ~ H4')
          .addOption('6', '全部 H1 ~ H6 (推荐)')
          .setValue(String(this.plugin.settings.maxHeadingLevel))
          .onChange(async (value) => {
            this.plugin.settings.maxHeadingLevel = parseInt(value, 10);
            await this.plugin.saveSettings();
            this.plugin.updateAllMarkdownViews();
          })
      );

    new Setting(containerEl)
      .setName('激活高亮横线颜色')
      .setDesc('自定义当前阅读位置的横线条加亮颜色。')
      .addDropdown((drop) =>
        drop
          .addOption('#3b82f6', '天青蓝 (默认 / Linear 质感)')
          .addOption('#8b5cf6', '紫罗兰 (极客紫)')
          .addOption('#f59e0b', '日落琥珀 (温和橙)')
          .addOption('#ec4899', '樱花粉 (活力粉)')
          .addOption('var(--interactive-accent)', '跟随主题强调色')
          .setValue(this.plugin.settings.activeColor)
          .onChange(async (value) => {
            this.plugin.settings.activeColor = value;
            await this.plugin.saveSettings();
            this.plugin.updateAllMarkdownViews();
          })
      );

    new Setting(containerEl)
      .setName('分屏/窄屏自动隐藏宽度阈值 (px)')
      .setDesc('当笔记窗口宽度小于该像素时，横线流自动隐藏以避免遮挡正文。')
      .addSlider((slider) =>
        slider
          .setLimits(350, 700, 10)
          .setValue(this.plugin.settings.narrowThreshold)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.narrowThreshold = value;
            await this.plugin.saveSettings();
            this.plugin.updateAllMarkdownViews();
          })
      );
  }
}

class ChapterPipelinePlugin extends Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.observers = new Map();
    this.settings = DEFAULT_SETTINGS;
  }

  async onload() {
    console.log('Loading Charter Pipeline Pro with Pure KaTeX Text & Alignment...');

    await this.loadSettings();
    this.addSettingTab(new ChapterPipelineSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        this.updateAllMarkdownViews();
      })
    );

    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.updateAllMarkdownViews();
      })
    );

    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView && activeView.file && activeView.file.path === file.path) {
          this.attachStepperToView(activeView);
        }
      })
    );

    this.app.workspace.onLayoutReady(() => {
      this.updateAllMarkdownViews();
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (this.settings.showExcerpt === undefined) {
      this.settings.showExcerpt = true;
    }
    if (this.settings.activeColor === '#10b981') {
      this.settings.activeColor = '#3b82f6';
    }
    await this.saveSettings();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  updateAllMarkdownViews() {
    const leaves = this.app.workspace.getLeavesOfType('markdown');
    leaves.forEach((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        this.attachStepperToView(leaf.view);
      }
    });
  }

  async attachStepperToView(view) {
    if (!view || !view.file) return;

    const container = view.contentEl;
    if (!container) return;

    const existing = container.querySelector('.codex-stepper-container');
    if (existing) existing.remove();

    const existingTooltip = document.body.querySelector('.codex-floating-tooltip');
    if (existingTooltip) existingTooltip.remove();

    if (this.observers.has(container)) {
      this.observers.get(container).disconnect();
      this.observers.delete(container);
    }

    const file = view.file;
    const content = await this.app.vault.cachedRead(file);
    const fileCache = this.app.metadataCache.getFileCache(file);
    const headings = fileCache ? fileCache.headings || [] : [];

    const chapters = ChapterParser.parse(content, headings, this.settings);
    if (chapters.length === 0) return;

    // 1. 创建散落横线容器
    const stepperContainer = container.createDiv({ cls: 'codex-stepper-container' });
    stepperContainer.style.setProperty('--codex-active-color', this.settings.activeColor || '#3b82f6');
    const track = stepperContainer.createDiv({ cls: 'codex-stepper-track' });

    const count = chapters.length;
    let dynamicGap = 5;
    if (count > 30) dynamicGap = 2;
    else if (count > 20) dynamicGap = 3;
    else if (count > 10) dynamicGap = 4;
    else dynamicGap = 5;

    track.style.gap = `${dynamicGap}px`;

    // 2. 创建悬浮章节名独立气泡浮层（直接挂载到 document.body，采用全局屏幕坐标精准对齐）
    const floatingTooltip = document.body.createDiv({ cls: 'codex-floating-tooltip' });

    // 3. 页面过窄自适应隐藏检测
    const checkWidth = (width) => {
      const threshold = this.settings.narrowThreshold || 460;
      if (width < threshold) {
        stepperContainer.classList.add('is-narrow');
        floatingTooltip.classList.remove('is-visible');
      } else {
        stepperContainer.classList.remove('is-narrow');
      }
    };

    checkWidth(container.clientWidth);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        checkWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(container);
    this.observers.set(container, resizeObserver);

    const dashElements = [];
    let isClickScrolling = false;
    let clickTimeout = null;

    chapters.forEach((chap) => {
      const dashItem = track.createDiv({
        cls: `codex-dash-item level-${Math.min(chap.level, 6)}`,
        attr: { 'data-line': chap.line }
      });

      // 散落横线条
      dashItem.createSpan({ cls: 'codex-dash-bar' });

      // 鼠标悬浮：横线屏幕绝对中心点 100% 对齐气泡垂直几何中心
      dashItem.addEventListener('mouseenter', () => {
        const itemRect = dashItem.getBoundingClientRect();

        // 横线条的精确屏幕垂直几何中点
        const centerY = itemRect.top + (itemRect.height / 2);
        const leftX = itemRect.right + 12;

        floatingTooltip.style.top = `${centerY}px`;
        floatingTooltip.style.left = `${leftX}px`;

        floatingTooltip.empty();

        // 1. 标题区（加粗，固定宽度自动折行，支持行内公式）
        const titleEl = floatingTooltip.createDiv({ cls: 'codex-tooltip-title' });
        MarkdownRenderer.render(this.app, chap.title, titleEl, '', this);

        // 2. 正文 3 行纯文本摘要（支持 KaTeX 公式渲染，彻底过滤 Callout 容器）
        if (this.settings.showExcerpt !== false && chap.summaryMarkdown) {
          const excerptEl = floatingTooltip.createDiv({ cls: 'codex-tooltip-excerpt' });
          MarkdownRenderer.render(this.app, chap.summaryMarkdown, excerptEl, '', this);
        }

        floatingTooltip.classList.add('is-visible');
      });

      dashItem.addEventListener('mouseleave', () => {
        floatingTooltip.classList.remove('is-visible');
      });

      // 点击横线：纯净置顶平滑跳转
      dashItem.addEventListener('click', (e) => {
        e.stopPropagation();
        isClickScrolling = true;
        if (clickTimeout) clearTimeout(clickTimeout);

        dashElements.forEach(d => d.classList.remove('active'));
        dashItem.classList.add('active');

        this.jumpToHeading(view, chap.line);

        clickTimeout = setTimeout(() => {
          isClickScrolling = false;
        }, 500);
      });

      dashElements.push(dashItem);
    });

    // 4. 基于真实行号与 120 FPS rAF 硬件加速节流
    let rAF = null;
    const updateActiveByRealLine = () => {
      if (isClickScrolling) return;

      const currentLine = this.getCurrentEditorTopLine(view, container);
      
      let activeIdx = 0;
      for (let i = 0; i < chapters.length; i++) {
        if (chapters[i].line <= currentLine + 2) {
          activeIdx = i;
        } else {
          break;
        }
      }

      dashElements.forEach((el, i) => {
        if (i === activeIdx) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });
    };

    const throttledScroll = () => {
      if (rAF) return;
      rAF = requestAnimationFrame(() => {
        updateActiveByRealLine();
        rAF = null;
      });
    };

    updateActiveByRealLine();

    const scroller = container.querySelector('.cm-scroller') || container.querySelector('.markdown-preview-view');
    if (scroller) {
      scroller.addEventListener('scroll', throttledScroll, { passive: true });
    }
  }

  getCurrentEditorTopLine(view, container) {
    try {
      const cm = view.editor?.cm;
      if (cm && cm.scrollDOM) {
        const topOffset = cm.scrollDOM.scrollTop + 50;
        const lineBlock = cm.lineBlockAtHeight(topOffset);
        if (lineBlock) {
          return cm.state.doc.lineAt(lineBlock.from).number - 1;
        }
      }

      const scroller = container.querySelector('.markdown-preview-view');
      if (scroller) {
        const scrollerRect = scroller.getBoundingClientRect();
        const headings = scroller.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let closestLine = 0;
        for (const h of Array.from(headings)) {
          const rect = h.getBoundingClientRect();
          if (rect.top - scrollerRect.top <= 120) {
            const lineAttr = h.getAttribute('data-line') || h.getAttribute('data-heading-line');
            if (lineAttr) closestLine = parseInt(lineAttr, 10);
          }
        }
        return closestLine;
      }
    } catch (e) {
      // ignore
    }
    return 0;
  }

  jumpToHeading(view, line) {
    if (view.editor) {
      const cm = view.editor.cm;
      if (cm && cm.scrollDOM) {
        const doc = cm.state.doc;
        const targetLineNum = Math.min(Math.max(1, line + 1), doc.lines);
        const lineObj = doc.line(targetLineNum);

        view.editor.setCursor({ line: line, ch: 0 });

        const lineBlock = cm.lineBlockAt(lineObj.from);
        const targetTop = Math.max(0, lineBlock.top - 20);
        cm.scrollDOM.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });

        setTimeout(() => {
          try {
            const coords = cm.coordsAtPos(lineObj.from);
            if (coords) {
              const editorRect = cm.scrollDOM.getBoundingClientRect();
              const delta = coords.top - editorRect.top - 20;
              if (Math.abs(delta) > 3) {
                cm.scrollDOM.scrollBy({ top: delta, behavior: 'smooth' });
              }
            }
          } catch (err) {}
        }, 80);
        return;
      }

      view.editor.scrollIntoView(
        { from: { line: line, ch: 0 }, to: { line: line, ch: 0 } },
        false
      );
      view.editor.setCursor({ line: line, ch: 0 });
    } else if (view.leaf) {
      view.leaf.openFile(view.file, {
        eState: { line: line }
      });
    }
  }

  onunload() {
    console.log('Unloading Charter Pipeline Pro');
    this.observers.forEach(obs => obs.disconnect());
    this.observers.clear();
    document.querySelectorAll('.codex-stepper-container').forEach(el => el.remove());
    document.querySelectorAll('.codex-floating-tooltip').forEach(el => el.remove());
  }
}

module.exports = ChapterPipelinePlugin;
module.exports.default = ChapterPipelinePlugin;
