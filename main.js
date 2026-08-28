'use strict';

const { Plugin, MarkdownView, MarkdownRenderer, PluginSettingTab, Setting, SuggestModal } = require('obsidian');

const DEFAULT_SETTINGS = {
  minHeadingLevel: 1,
  maxHeadingLevel: 2,
  ignoreFirstH1: false,
  showExcerpt: true,
  activeColor: '#3b82f6',
  narrowThreshold: 600,
  enableSound: true,
  soundVolume: 50,
  dockPosition: 'left',
  hierarchyMode: 'all',
  showProgressRail: true,
  tooltipGlassmorphism: true
};

const I18N = {
  en: {
    tabTitle: 'Charter Pipeline Settings',
    showExcerptName: 'Show 3-Line Excerpt Preview',
    showExcerptDesc: 'Display a 3-line excerpt of the section with KaTeX formula rendering below the title in the hover popover card. When disabled, only the clean title is shown.',
    ignoreH1Name: 'Ignore First H1 (# Note Title)',
    ignoreH1Desc: 'When enabled, the first H1 heading at the top of the note will not generate a dash bar, showing only sub-sections.',
    dockPositionName: 'Dock Position',
    dockPositionDesc: 'Choose whether to display the outline pipeline on the left or right margin of the note.',
    dockPositionOptions: {
      'left': 'Left Margin (Default)',
      'right': 'Right Margin'
    },
    hierarchyModeName: 'Heading Hierarchy Mode',
    hierarchyModeDesc: 'Control the display mode of subheadings (H3~H6).',
    hierarchyModeOptions: {
      'all': 'All Headings Expanded (Default)',
      'hover-expand': 'Focus Mode (Collapse H3+, Expand on Hover)',
      'active-branch': 'Active Branch Only (Expand current section branch)'
    },
    showProgressRailName: 'Show Vertical Progress Rail',
    showProgressRailDesc: 'Display a smooth magnetic vertical progress guide line indicating reading position.',
    tooltipGlassmorphismName: 'Tooltip Glassmorphism & Spring Physics',
    tooltipGlassmorphismDesc: 'Enable backdrop blur glassmorphism and spring overshoot animations for hover popovers.',
    maxLevelName: 'Max Heading Level',
    maxLevelDesc: 'Filter deeper subheadings (e.g. choose H1~H3 to hide H4~H6).',
    maxLevelOptions: {
      '2': 'H1 ~ H2 (Recommended / Default)',
      '3': 'H1 ~ H3',
      '4': 'H1 ~ H4',
      '6': 'All H1 ~ H6'
    },
    activeColorName: 'Active Indicator Color',
    activeColorDesc: 'Customize the highlight color for the currently active reading section.',
    activeColorOptions: {
      '#3b82f6': 'Azure Blue (Default / Linear)',
      '#8b5cf6': 'Violet (Geek)',
      '#f59e0b': 'Sunset Amber (Warm)',
      '#ec4899': 'Sakura Pink (Vibrant)',
      'var(--interactive-accent)': 'Theme Accent Color'
    },
    narrowThresholdName: 'Narrow View Auto-Hide Threshold (px)',
    narrowThresholdDesc: 'Automatically hide the stepper when note pane width is below this threshold to prevent overlapping text.',
    soundSectionTitle: 'Tactile Sound Effects',
    enableSoundName: 'Enable Tactile Micro-Switch Sound',
    enableSoundDesc: 'Play subtle mechanical micro-switch sounds on clicking chapters and scrolling across headings.',
    soundVolumeName: 'Sound Volume (%)',
    soundVolumeDesc: 'Adjust the volume of interactive tactile sound effects (Default: 50%).'
  },
  zh: {
    tabTitle: 'Charter Pipeline 设置',
    showExcerptName: '开启正文 3 行摘要预览',
    showExcerptDesc: '在悬浮气泡中换行展示正文开头的 3 行摘要（支持 LaTeX / KaTeX 公式渲染，超出 3 行自动显示 ... 省略号）。关闭后仅展示纯净标题。',
    ignoreH1Name: '忽略文档首个一级大标题 (# 篇名)',
    ignoreH1Desc: '开启后，文章最开头的第一个 H1 大标题不会生成横线，仅展示正文小节。',
    dockPositionName: '靠栏停靠位置',
    dockPositionDesc: '选择大纲横线流停靠在笔记编辑区的左侧或右侧边栏。',
    dockPositionOptions: {
      'left': '左侧边栏 (默认)',
      'right': '右侧边栏'
    },
    hierarchyModeName: '多级标题展示模式',
    hierarchyModeDesc: '控制 H3~H6 深层子小节的折叠与聚焦策略。',
    hierarchyModeOptions: {
      'all': '全部平铺展开 (默认)',
      'hover-expand': '主干聚焦模式 (默认收起 H3+，鼠标悬停导轨时平滑展开)',
      'active-branch': '当前分支聚焦 (仅展开当前阅读章节的子小节)'
    },
    showProgressRailName: '开启垂直进度导轨',
    showProgressRailDesc: '在横线左侧显示一条极简平滑的垂直微光导轨，实时指示当前章节阅读进度。',
    tooltipGlassmorphismName: '毛玻璃质感与弹簧动效',
    tooltipGlassmorphismDesc: '开启悬浮气泡毛玻璃模糊背景 (Backdrop Blur) 与拟物弹簧微动进场动效。',
    maxLevelName: '最大展示标题层级',
    maxLevelDesc: '例如设为 2 则只展示 H1~H2 章节，过滤更深层级的子小节。',
    maxLevelOptions: {
      '2': '仅 H1 ~ H2 (默认 / 推荐)',
      '3': 'H1 ~ H3',
      '4': 'H1 ~ H4',
      '6': '全部 H1 ~ H6'
    },
    activeColorName: '激活高亮横线颜色',
    activeColorDesc: '自定义当前阅读位置的横线条加亮颜色。',
    activeColorOptions: {
      '#3b82f6': '天青蓝 (默认 / Linear 质感)',
      '#8b5cf6': '紫罗兰 (极客紫)',
      '#f59e0b': '日落琥珀 (温和橙)',
      '#ec4899': '樱花粉 (活力粉)',
      'var(--interactive-accent)': '跟随主题强调色'
    },
    narrowThresholdName: '分屏/窄屏自动隐藏宽度阈值 (px)',
    narrowThresholdDesc: '当笔记窗口宽度小于该像素时，横线流自动隐藏以避免遮挡正文。',
    soundSectionTitle: '极简拟物微动音效',
    enableSoundName: '开启拟物微动音效',
    enableSoundDesc: '在点击横线跳转及页面滚动跨越章节时，播放轻微清脆的机械微动与转轮刻度音。',
    soundVolumeName: '音效音量 (%)',
    soundVolumeDesc: '调节交互音效的音量大小（默认 50% 柔和舒适音量）。'
  }
};

function getLocale() {
  const lang = (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('language') : null) || (typeof navigator !== 'undefined' ? navigator.language : 'en') || 'en';
  return String(lang).toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.lastScrollTime = 0;
  }

  getAudioContext() {
    if (!this.ctx && (typeof window !== 'undefined')) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playClick(volumePct = 50) {
    if (volumePct <= 0) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      const vol = (Math.max(0, Math.min(100, volumePct)) / 100) * 0.12;
      masterGain.gain.setValueAtTime(vol, now);
      masterGain.connect(ctx.destination);

      // 1. 拟物微动清脆短脉冲（~1850Hz 带通瞬态）
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1850, now);
      filter.Q.setValueAtTime(3.5, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.032);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.038);

      // 2. 极短微撞声（~450Hz 触底瞬态）
      const oscLow = ctx.createOscillator();
      const gainLow = ctx.createGain();
      oscLow.type = 'sine';
      oscLow.frequency.setValueAtTime(450, now);
      oscLow.frequency.exponentialRampToValueAtTime(150, now + 0.02);

      gainLow.gain.setValueAtTime(0.6, now);
      gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      oscLow.connect(gainLow);
      gainLow.connect(masterGain);

      oscLow.start(now);
      oscLow.stop(now + 0.025);
    } catch (e) {
      // ignore
    }
  }

  playScrollTick(volumePct = 50) {
    if (volumePct <= 0) return;
    const nowMs = Date.now();
    if (nowMs - this.lastScrollTime < 75) return;
    this.lastScrollTime = nowMs;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      const vol = (Math.max(0, Math.min(100, volumePct)) / 100) * 0.06;
      masterGain.gain.setValueAtTime(vol, now);
      masterGain.connect(ctx.destination);

      // 机械转轮刻度轻音（~920Hz 短促柔和）
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.016);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {
      // ignore
    }
  }
}

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
          while (s.startsWith('>')) {
            s = s.substring(1).trim();
          }
          s = s.replace(/^\[![\w-]+\]\s*/i, '');
          s = s.replace(/\[\[.*?\|(.*?)\]\]/g, '$1').replace(/\[\[(.*?)\]\]/g, '$1');
          return s;
        }).filter((s) => s && !s.startsWith('#') && !s.startsWith('---') && !s.startsWith('```'));

        let fullText = cleanedLines.join('\n');
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
        rawHeading: currentH.heading,
        level: currentH.level,
        line: currentH.position.start.line,
        headingIndex: i,
        summaryMarkdown
      });
    }

    return chapters;
  }
}

function updateHierarchyFolding(chapters, dashElements, activeIdx, hierarchyMode) {
  if (!chapters || !dashElements || dashElements.length === 0) return;
  const mode = hierarchyMode || 'all';

  if (mode === 'all') {
    for (let i = 0; i < dashElements.length; i++) {
      dashElements[i].classList.remove('is-collapsed');
    }
    return;
  }

  if (mode === 'hover-expand') {
    for (let i = 0; i < dashElements.length; i++) {
      const chap = chapters[i];
      if (chap && chap.level >= 3) {
        dashElements[i].classList.add('is-collapsed');
      } else {
        dashElements[i].classList.remove('is-collapsed');
      }
    }
    return;
  }

  if (mode === 'active-branch') {
    let branchStart = -1;
    let branchEnd = -1;

    if (activeIdx >= 0 && activeIdx < chapters.length) {
      let parentIdx = activeIdx;
      while (parentIdx >= 0 && chapters[parentIdx].level > 2) {
        parentIdx--;
      }

      if (parentIdx >= 0) {
        branchStart = parentIdx + 1;
        branchEnd = chapters.length;
        for (let i = parentIdx + 1; i < chapters.length; i++) {
          if (chapters[i].level <= 2) {
            branchEnd = i;
            break;
          }
        }
      } else {
        branchStart = 0;
        branchEnd = chapters.length;
        for (let i = 0; i < chapters.length; i++) {
          if (chapters[i].level <= 2) {
            branchEnd = i;
            break;
          }
        }
      }
    }

    for (let i = 0; i < dashElements.length; i++) {
      const chap = chapters[i];
      if (chap && chap.level >= 3) {
        const inActiveBranch = (i >= branchStart && i < branchEnd);
        if (inActiveBranch) {
          dashElements[i].classList.remove('is-collapsed');
        } else {
          dashElements[i].classList.add('is-collapsed');
        }
      } else {
        dashElements[i].classList.remove('is-collapsed');
      }
    }
  }
}

class ChapterSuggestModal extends SuggestModal {
  constructor(app, plugin, view, chapters) {
    super(app);
    this.plugin = plugin;
    this.view = view;
    this.chapters = chapters || [];
    if (typeof this.setPlaceholder === 'function') {
      this.setPlaceholder('Search chapter or formula...');
    }
  }

  getItems() {
    return this.chapters;
  }

  getItemText(item) {
    return (item.title || '') + ' ' + (item.summaryMarkdown || '');
  }

  renderSuggestion(item, el) {
    if (typeof el.empty === 'function') el.empty();
    if (typeof el.addClass === 'function') {
      el.addClass('codex-suggest-item');
    } else if (el.classList && typeof el.classList.add === 'function') {
      el.classList.add('codex-suggest-item');
    }

    const headerEl = (typeof el.createDiv === 'function')
      ? el.createDiv({ cls: 'codex-modal-header' })
      : el;

    const badgeCls = `codex-level-badge level-${Math.min(item.level, 6)}`;
    if (typeof headerEl.createSpan === 'function') {
      headerEl.createSpan({
        cls: badgeCls,
        text: `H${item.level}`
      });
    }

    const titleEl = (typeof headerEl.createDiv === 'function')
      ? headerEl.createDiv({ cls: 'codex-modal-title' })
      : null;
    if (titleEl) {
      MarkdownRenderer.render(this.app, item.title, titleEl, '', this.plugin);
    }

    if (this.plugin?.settings?.showExcerpt !== false && item.summaryMarkdown) {
      const excerptEl = (typeof el.createDiv === 'function')
        ? el.createDiv({ cls: 'codex-modal-excerpt' })
        : null;
      if (excerptEl) {
        MarkdownRenderer.render(this.app, item.summaryMarkdown, excerptEl, '', this.plugin);
      }
    }
  }

  onChooseItem(item, evt) {
    if (!item) return;
    if (this.plugin?.settings?.enableSound !== false) {
      const vol = this.plugin?.settings?.soundVolume !== undefined ? this.plugin.settings.soundVolume : 50;
      this.plugin?.soundEngine?.playClick(vol);
    }
    this.plugin?.jumpToHeading(this.view, item);
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

    const locale = getLocale();
    const t = I18N[locale] || I18N.en;

    containerEl.createEl('h2', { text: t.tabTitle });

    new Setting(containerEl)
      .setName(t.showExcerptName)
      .setDesc(t.showExcerptDesc)
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
      .setName(t.ignoreH1Name)
      .setDesc(t.ignoreH1Desc)
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
      .setName(t.dockPositionName)
      .setDesc(t.dockPositionDesc)
      .addDropdown((drop) => {
        for (const [key, val] of Object.entries(t.dockPositionOptions)) {
          drop.addOption(key, val);
        }
        drop
          .setValue(this.plugin.settings.dockPosition || 'left')
          .onChange(async (value) => {
            this.plugin.settings.dockPosition = value;
            await this.plugin.saveSettings();
            this.plugin.updateAllMarkdownViews();
          });
      });

    new Setting(containerEl)
      .setName(t.hierarchyModeName)
      .setDesc(t.hierarchyModeDesc)
      .addDropdown((drop) => {
        for (const [key, val] of Object.entries(t.hierarchyModeOptions)) {
          drop.addOption(key, val);
        }
        drop
          .setValue(this.plugin.settings.hierarchyMode || 'all')
          .onChange(async (value) => {
            this.plugin.settings.hierarchyMode = value;
            await this.plugin.saveSettings();
            this.plugin.updateAllMarkdownViews();
          });
      });

    new Setting(containerEl)
      .setName(t.showProgressRailName)
      .setDesc(t.showProgressRailDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showProgressRail !== false)
          .onChange(async (value) => {
            this.plugin.settings.showProgressRail = value;
            await this.plugin.saveSettings();
            this.plugin.updateAllMarkdownViews();
          })
      );

    new Setting(containerEl)
      .setName(t.tooltipGlassmorphismName)
      .setDesc(t.tooltipGlassmorphismDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.tooltipGlassmorphism !== false)
          .onChange(async (value) => {
            this.plugin.settings.tooltipGlassmorphism = value;
            await this.plugin.saveSettings();
            this.plugin.updateAllMarkdownViews();
          })
      );

    const levelSetting = new Setting(containerEl)
      .setName(t.maxLevelName)
      .setDesc(t.maxLevelDesc)
      .addDropdown((drop) => {
        for (const [key, val] of Object.entries(t.maxLevelOptions)) {
          drop.addOption(key, val);
        }
        drop
          .setValue(String(this.plugin.settings.maxHeadingLevel))
          .onChange(async (value) => {
            this.plugin.settings.maxHeadingLevel = parseInt(value, 10);
            await this.plugin.saveSettings();
            this.plugin.updateAllMarkdownViews();
          });
      });

    const colorSetting = new Setting(containerEl)
      .setName(t.activeColorName)
      .setDesc(t.activeColorDesc)
      .addDropdown((drop) => {
        for (const [key, val] of Object.entries(t.activeColorOptions)) {
          drop.addOption(key, val);
        }
        drop
          .setValue(this.plugin.settings.activeColor)
          .onChange(async (value) => {
            this.plugin.settings.activeColor = value;
            await this.plugin.saveSettings();
            this.plugin.updateAllMarkdownViews();
          });
      });

    new Setting(containerEl)
      .setName(t.narrowThresholdName)
      .setDesc(t.narrowThresholdDesc)
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

    containerEl.createEl('h3', { text: t.soundSectionTitle });

    new Setting(containerEl)
      .setName(t.enableSoundName)
      .setDesc(t.enableSoundDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableSound !== false)
          .onChange(async (value) => {
            this.plugin.settings.enableSound = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t.soundVolumeName)
      .setDesc(t.soundVolumeDesc)
      .addSlider((slider) =>
        slider
          .setLimits(0, 100, 5)
          .setValue(this.plugin.settings.soundVolume !== undefined ? this.plugin.settings.soundVolume : 50)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.soundVolume = value;
            await this.plugin.saveSettings();
            if (this.plugin.settings.enableSound !== false) {
              this.plugin.soundEngine.playClick(value);
            }
          })
      );
  }
}

function normalizeHeadingText(text) {
  if (!text) return '';
  return String(text)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\[\[.*?\|(.*?)\]\]/g, '$1')
    .replace(/\[\[(.*?)\]\]/g, '$1')
    .replace(/\[status::.*?\]/gi, '')
    .replace(/[\$#\*=`~_\[\]\(\)（）:：·、\.,，。!！\?？\\/+\-—\s\u200B-\u200D\uFEFF]/g, '')
    .toLowerCase();
}

class ChapterPipelinePlugin extends Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.observers = new Map();
    this.viewObservers = new Map();
    this.renderVersions = new Map();
    this.scrollBindings = new Map();
    this.soundEngine = new SoundEngine();
    this.settings = DEFAULT_SETTINGS;
    this.refreshFrame = null;
    this.refreshTimer = null;
  }

  async onload() {
    console.log('Loading Charter Pipeline Pro with Bilingual Settings & Tactile Sound...');

    await this.loadSettings();
    this.addSettingTab(new ChapterPipelineSettingTab(this.app, this));

    // 监听活动 Leaf 切换
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        this.scheduleUpdateAllMarkdownViews();
      })
    );

    // 监听文件打开（确保编辑与阅读模式开篇即加载横线流）
    this.registerEvent(
      this.app.workspace.on('file-open', () => {
        this.scheduleUpdateAllMarkdownViews();
      })
    );

    // 监听视图布局与视图模式切换（如 Ctrl+E 编辑/阅读视图切换）
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.scheduleUpdateAllMarkdownViews();
      })
    );

    // 监听编辑模式输入（防抖实时刷新章节大纲）
    let editorChangeTimeout = null;
    this.registerEvent(
      this.app.workspace.on('editor-change', (editor, info) => {
        if (editorChangeTimeout) clearTimeout(editorChangeTimeout);
        editorChangeTimeout = setTimeout(() => {
          if (info && info.file) {
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView && activeView.file && activeView.file.path === info.file.path) {
              this.attachStepperToView(activeView);
            }
          }
        }, 300);
      })
    );

    // 监听元数据缓存更新
    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView && activeView.file && activeView.file.path === file.path) {
          this.attachStepperToView(activeView);
        }
      })
    );

    // 注册快捷跳转与章节搜索命令
    this.addCommand({
      id: 'charter-pipeline-jump-prev',
      name: 'Charter Pipeline: Jump to previous chapter',
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
          if (!checking) {
            this.jumpToPreviousChapter(view);
          }
          return true;
        }
        return false;
      }
    });

    this.addCommand({
      id: 'charter-pipeline-jump-next',
      name: 'Charter Pipeline: Jump to next chapter',
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
          if (!checking) {
            this.jumpToNextChapter(view);
          }
          return true;
        }
        return false;
      }
    });

    this.addCommand({
      id: 'charter-pipeline-open-palette',
      name: 'Charter Pipeline: Search & switch chapter (Palette)',
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
          if (!checking) {
            this.openChapterPalette(view);
          }
          return true;
        }
        return false;
      }
    });

    this.app.workspace.onLayoutReady(() => {
      this.scheduleUpdateAllMarkdownViews();
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
    if (this.settings.enableSound === undefined) {
      this.settings.enableSound = true;
    }
    if (this.settings.soundVolume === undefined) {
      this.settings.soundVolume = 50;
    }
    if (!this.settings.dockPosition) {
      this.settings.dockPosition = 'left';
    }
    if (!this.settings.hierarchyMode) {
      this.settings.hierarchyMode = 'all';
    }
    if (this.settings.showProgressRail === undefined) {
      this.settings.showProgressRail = true;
    }
    if (this.settings.tooltipGlassmorphism === undefined) {
      this.settings.tooltipGlassmorphism = true;
    }
    await this.saveSettings();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  scheduleUpdateAllMarkdownViews() {
    this.updateAllMarkdownViews();

    if (this.refreshFrame !== null) {
      cancelAnimationFrame(this.refreshFrame);
    }
    this.refreshFrame = requestAnimationFrame(() => {
      this.refreshFrame = null;
      this.updateAllMarkdownViews();
    });

    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      this.updateAllMarkdownViews();
    }, 180);
  }

  updateAllMarkdownViews() {
    const leaves = this.app.workspace.getLeavesOfType('markdown');
    leaves.forEach((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        this.attachStepperToView(leaf.view);
      }
    });
  }

  extractChapters(content, file) {
    const fileCache = this.app.metadataCache.getFileCache(file);
    let headings = fileCache ? fileCache.headings || [] : [];

    // 若缓存尚未就绪，使用正则极速从正文提取标题作为保底，确保任何模式百分百加载
    if (!headings || headings.length === 0) {
      headings = [];
      const lines = content ? content.split(/\r?\n/) : [];
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          headings.push({
            heading: match[2].trim(),
            level: match[1].length,
            position: {
              start: { line: i, col: 0, offset: 0 },
              end: { line: i, col: lines[i].length, offset: 0 }
            }
          });
        }
      }
    }

    return ChapterParser.parse(content, headings, this.settings);
  }

  async getChaptersForView(view) {
    const targetView = (view && view.file)
      ? view
      : this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!targetView || !targetView.file) return [];

    const file = targetView.file;
    const content = await this.app.vault.cachedRead(file);
    return this.extractChapters(content, file);
  }

  getActiveChapterIndex(view, chapters) {
    if (!chapters || chapters.length === 0) return -1;
    const container = view?.contentEl;
    const currentLine = this.getCurrentEditorTopLine(view, container, chapters);
    let activeIdx = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].line <= currentLine + 2) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }

  async jumpToPreviousChapter(view) {
    const targetView = (view && view.file)
      ? view
      : this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!targetView) return;

    const chapters = await this.getChaptersForView(targetView);
    if (!chapters || chapters.length === 0) return;

    const activeIdx = this.getActiveChapterIndex(targetView, chapters);
    const prevIdx = Math.max(0, activeIdx - 1);
    const targetChapter = chapters[prevIdx];
    if (targetChapter) {
      if (this.settings.enableSound !== false) {
        const vol = this.settings.soundVolume !== undefined ? this.settings.soundVolume : 50;
        this.soundEngine.playClick(vol);
      }
      this.jumpToHeading(targetView, targetChapter);
    }
  }

  async jumpToNextChapter(view) {
    const targetView = (view && view.file)
      ? view
      : this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!targetView) return;

    const chapters = await this.getChaptersForView(targetView);
    if (!chapters || chapters.length === 0) return;

    const activeIdx = this.getActiveChapterIndex(targetView, chapters);
    const nextIdx = Math.min(chapters.length - 1, activeIdx + 1);
    const targetChapter = chapters[nextIdx];
    if (targetChapter) {
      if (this.settings.enableSound !== false) {
        const vol = this.settings.soundVolume !== undefined ? this.settings.soundVolume : 50;
        this.soundEngine.playClick(vol);
      }
      this.jumpToHeading(targetView, targetChapter);
    }
  }

  async openChapterPalette(view) {
    const targetView = (view && view.file)
      ? view
      : this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!targetView) return null;

    const chapters = await this.getChaptersForView(targetView);
    if (!chapters || chapters.length === 0) return null;

    const modal = new ChapterSuggestModal(this.app, this, targetView, chapters);
    modal.open();
    return modal;
  }

  async attachStepperToView(view) {
    if (!view || !view.file) return;

    const container = view.contentEl;
    if (!container) return;

    const renderVersion = (this.renderVersions.get(view) || 0) + 1;
    this.renderVersions.set(view, renderVersion);

    this.observeViewContainer(view, container);

    const existing = container.querySelector('.codex-stepper-container');
    if (existing) existing.remove();

    const existingTooltip = document.body.querySelector('.codex-floating-tooltip');
    if (existingTooltip) existingTooltip.remove();

    if (this.observers.has(container)) {
      this.observers.get(container).disconnect();
      this.observers.delete(container);
    }

    if (this.scrollBindings.has(container)) {
      const binding = this.scrollBindings.get(container);
      if (binding?.scroller && binding?.handler) {
        binding.scroller.removeEventListener('scroll', binding.handler);
      }
      this.scrollBindings.delete(container);
    }

    const file = view.file;
    const content = await this.app.vault.cachedRead(file);
    if (this.renderVersions.get(view) !== renderVersion) {
      return;
    }
    const chapters = this.extractChapters(content, file);
    if (chapters.length === 0) return;

    // 1. 创建散落横线容器
    const stepperContainer = container.createDiv({ cls: 'codex-stepper-container' });
    if (this.settings.dockPosition === 'right') {
      stepperContainer.classList.add('dock-right');
    }
    const hierarchyMode = this.settings.hierarchyMode || 'all';
    stepperContainer.classList.add(`hierarchy-mode-${hierarchyMode}`);
    stepperContainer.style.setProperty('--codex-active-color', this.settings.activeColor || '#3b82f6');
    const track = stepperContainer.createDiv({ cls: 'codex-stepper-track' });
    track.classList.add(`hierarchy-mode-${hierarchyMode}`);

    let railEl = null;
    let railIndicator = null;
    if (this.settings.showProgressRail !== false) {
      railEl = track.createDiv({ cls: 'codex-progress-rail' });
      railIndicator = railEl.createDiv({ cls: 'codex-progress-indicator' });
    }

    const count = chapters.length;
    let dynamicGap = 5;
    if (count > 30) dynamicGap = 2;
    else if (count > 20) dynamicGap = 3;
    else if (count > 10) dynamicGap = 4;
    else dynamicGap = 5;

    track.style.gap = `${dynamicGap}px`;

    // 2. 创建悬浮章节名独立气泡浮层（直接挂载到 document.body，采用全局屏幕坐标精准对齐）
    const floatingTooltip = document.body.createDiv({ cls: 'codex-floating-tooltip' });

    // 3. 动态留白空间感知与绝对防触碰正文计算
    const updateGutterDimensions = () => {
      const containerWidth = container.clientWidth || 0;
      // 只有在视口极度狭窄（< 360px，如极小手机或超窄卡片分栏）时才隐藏，避免在普通分屏或打开双侧边栏时误隐藏
      const threshold = Math.min(this.settings.narrowThreshold || 380, 380);

      if (containerWidth > 0 && containerWidth < threshold) {
        stepperContainer.classList.add('is-narrow');
        floatingTooltip.classList.remove('is-visible');
        return;
      }

      stepperContainer.classList.remove('is-narrow');

      // 寻找实际正文 Sizer（编辑视图 .cm-sizer 或阅读视图 .markdown-preview-sizer）
      const sizer = container.querySelector('.cm-sizer') || container.querySelector('.markdown-preview-sizer');
      let gutter = 0;
      const isRightDock = this.settings.dockPosition === 'right';

      if (sizer && typeof sizer.getBoundingClientRect === 'function') {
        const containerRect = typeof container.getBoundingClientRect === 'function' ? container.getBoundingClientRect() : { left: 0, right: containerWidth };
        const sizerRect = sizer.getBoundingClientRect();
        if (isRightDock) {
          const containerRight = (containerRect.right !== undefined) ? containerRect.right : (containerRect.left + containerWidth);
          gutter = Math.max(0, containerRight - sizerRect.right);
        } else {
          gutter = Math.max(0, sizerRect.left - containerRect.left);
        }
      }

      // 如果未探测到有效正文 Sizer（例如 0），基于容器宽度估算留白
      if (gutter <= 0 && containerWidth > 0) {
        gutter = Math.max(30, (containerWidth - 650) / 2);
      }

      // 留白越大横线越长（范围 16px ~ 38px，悬浮 22px ~ 44px）
      const h1Width = Math.max(16, Math.min(38, Math.round(gutter * 0.35) || 18));
      const h1Hover = Math.min(h1Width + 5, Math.max(20, (gutter > 30 ? gutter - 12 : 24)));

      const w1 = h1Width;
      const w2 = Math.max(9, Math.round(h1Width * 0.60));
      const w3 = Math.max(5, Math.round(h1Width * 0.35));
      const w4 = Math.max(3, Math.round(h1Width * 0.20));

      const hw1 = h1Hover;
      const hw2 = Math.max(12, Math.round(h1Hover * 0.65));
      const hw3 = Math.max(8, Math.round(h1Hover * 0.45));
      const hw4 = Math.max(4, Math.round(h1Hover * 0.25));

      stepperContainer.style.setProperty('--dash-w1', `${w1}px`);
      stepperContainer.style.setProperty('--dash-w2', `${w2}px`);
      stepperContainer.style.setProperty('--dash-w3', `${w3}px`);
      stepperContainer.style.setProperty('--dash-w4', `${w4}px`);

      stepperContainer.style.setProperty('--dash-hover-w1', `${hw1}px`);
      stepperContainer.style.setProperty('--dash-hover-w2', `${hw2}px`);
      stepperContainer.style.setProperty('--dash-hover-w3', `${hw3}px`);
      stepperContainer.style.setProperty('--dash-hover-w4', `${hw4}px`);
    };

    updateGutterDimensions();

    let resizeRaf = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        updateGutterDimensions();
        resizeRaf = null;
      });
    });
    resizeObserver.observe(container);
    this.observers.set(container, resizeObserver);

    const dashElements = [];
    let isClickScrolling = false;
    let clickTimeout = null;

    const updateRailIndicator = (idx) => {
      if (!railIndicator) return;
      const total = chapters.length;
      if (total <= 1) {
        railIndicator.style.height = '100%';
        return;
      }
      const activeItem = dashElements[idx];
      if (activeItem && typeof activeItem.offsetTop === 'number' && activeItem.offsetTop > 0) {
        const targetHeight = activeItem.offsetTop + (activeItem.offsetHeight || 10) / 2;
        railIndicator.style.height = `${targetHeight}px`;
      } else {
        const pct = Math.round((idx / (total - 1)) * 100);
        railIndicator.style.height = `${pct}%`;
      }
    };

    chapters.forEach((chap, i) => {
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
        const isRightDock = this.settings.dockPosition === 'right';
        const tooltipWidth = floatingTooltip.offsetWidth || 290;
        let leftX;

        if (isRightDock) {
          floatingTooltip.classList.add('dock-right');
          leftX = Math.max(10, itemRect.left - tooltipWidth - 12);
        } else {
          floatingTooltip.classList.remove('dock-right');
          const winWidth = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1200;
          leftX = Math.min(winWidth - tooltipWidth - 10, itemRect.right + 12);
        }

        floatingTooltip.style.top = `${centerY}px`;
        floatingTooltip.style.left = `${leftX}px`;

        floatingTooltip.empty();

        // 1. 标题区（头部容器：Linear 风格微胶囊徽章 + 加粗标题，当前激活章节高亮，支持行内公式）
        const headerEl = floatingTooltip.createDiv({ cls: 'codex-tooltip-header' });
        const isActive = dashItem.classList.contains('active');
        const badgeCls = `codex-level-badge level-${Math.min(chap.level, 6)}${isActive ? ' is-active' : ''}`;
        headerEl.createSpan({
          cls: badgeCls,
          text: `H${chap.level}`
        });
        const titleEl = headerEl.createDiv({ cls: 'codex-tooltip-title' });
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

      // 点击横线：拟物微动音效 + 纯净置顶平滑跳转
      dashItem.addEventListener('click', (e) => {
        e.stopPropagation();
        isClickScrolling = true;
        if (clickTimeout) clearTimeout(clickTimeout);

        dashElements.forEach(d => d.classList.remove('active'));
        dashItem.classList.add('active');
        updateHierarchyFolding(chapters, dashElements, i, this.settings.hierarchyMode);
        updateRailIndicator(i);

        // 触发清脆机械微动按键音
        if (this.settings.enableSound !== false) {
          const vol = this.settings.soundVolume !== undefined ? this.settings.soundVolume : 50;
          this.soundEngine.playClick(vol);
        }

        this.jumpToHeading(view, chap);

        clickTimeout = setTimeout(() => {
          isClickScrolling = false;
        }, 600);
      });

      dashElements.push(dashItem);
    });

    // 4. 基于真实行号与 120 FPS rAF 硬件加速节流
    let rAF = null;
    let previousActiveIdx = -1;
    const updateActiveByRealLine = () => {
      if (isClickScrolling) return;

      const currentLine = this.getCurrentEditorTopLine(view, container, chapters);
      
      let activeIdx = 0;
      for (let i = 0; i < chapters.length; i++) {
        if (chapters[i].line <= currentLine + 2) {
          activeIdx = i;
        } else {
          break;
        }
      }

      // 滚动跨越新章节时触发机械转轮刻度轻音
      if (activeIdx !== previousActiveIdx) {
        if (previousActiveIdx !== -1 && this.settings.enableSound !== false) {
          const vol = this.settings.soundVolume !== undefined ? this.settings.soundVolume : 50;
          this.soundEngine.playScrollTick(vol);
        }
        previousActiveIdx = activeIdx;
      }

      dashElements.forEach((el, i) => {
        if (i === activeIdx) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });

      updateHierarchyFolding(chapters, dashElements, activeIdx, this.settings.hierarchyMode);
      updateRailIndicator(activeIdx);
    };

    const throttledScroll = () => {
      if (rAF) return;
      let executed = false;
      rAF = requestAnimationFrame(() => {
        executed = true;
        updateActiveByRealLine();
        rAF = null;
      });
      if (executed) {
        rAF = null;
      }
    };

    updateActiveByRealLine();

    const scroller = this.getViewScroller(container, view);
    if (scroller) {
      scroller.addEventListener('scroll', throttledScroll, { passive: true });
      this.scrollBindings.set(container, { scroller, handler: throttledScroll });
    }
  }

  getViewScroller(container, view = null) {
    if (!container) return null;
    const mode = view?.getMode ? view.getMode() : view?.currentMode?.type;
    if (mode === 'preview') {
      return container.querySelector('.markdown-preview-view');
    }
    return container.querySelector('.cm-scroller') || container.querySelector('.markdown-preview-view');
  }

  clearFlashHighlights(container) {
    if (!container || typeof container.querySelectorAll !== 'function') return;
    const flashEls = container.querySelectorAll('.is-flashing, .flashing, .is-highlighted, .highlighted, .mod-highlighted');
    for (let i = 0; i < flashEls.length; i++) {
      const el = flashEls[i];
      el.classList.remove('is-flashing', 'flashing', 'is-highlighted', 'highlighted', 'mod-highlighted');
    }
  }

  observeViewContainer(view, container) {
    if (this.viewObservers.has(container) || typeof MutationObserver === 'undefined') return;

    let refreshQueued = false;
    const observer = new MutationObserver(() => {
      this.clearFlashHighlights(container);
      if (refreshQueued || container.querySelector('.codex-stepper-container')) return;
      if (!this.getViewScroller(container, view)) return;

      refreshQueued = true;
      requestAnimationFrame(() => {
        refreshQueued = false;
        if (!container.querySelector('.codex-stepper-container')) {
          this.attachStepperToView(view);
        }
      });
    });

    observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    this.viewObservers.set(container, observer);
  }

  getReadingHeading(view, chap) {
    if (!view || !chap) return null;
    const scroller = view.contentEl?.querySelector('.markdown-preview-view');
    if (!scroller) return null;

    const renderedHeadings = Array.from(scroller.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .filter((el) => {
        if (el.classList && el.classList.contains('inline-title')) return false;
        if (typeof el.closest === 'function') {
          return !el.closest('.internal-embed, .markdown-embed, .markdown-embed-content, .popover, .codex-floating-tooltip, .mod-header');
        }
        return true;
      });

    const targetTag = chap.level ? `H${chap.level}`.toUpperCase() : null;
    const cleanNorm = normalizeHeadingText(chap.title);
    const rawNorm = normalizeHeadingText(chap.rawHeading || chap.title);

    // 1. 优先：通过包含目标行号的 section 精确匹配
    if (chap.line !== undefined) {
      const section = scroller.querySelector(`.markdown-preview-section[data-line="${chap.line}"]`);
      if (section) {
        const headingsInSection = Array.from(section.querySelectorAll('h1, h2, h3, h4, h5, h6'))
          .filter(h => !h.classList.contains('inline-title') && !h.closest('.internal-embed, .markdown-embed'));
        if (headingsInSection.length > 0) {
          const exact = headingsInSection.find(h => {
            const tagMatch = !targetTag || h.tagName.toUpperCase() === targetTag;
            const dataNorm = normalizeHeadingText(h.getAttribute('data-heading'));
            const textNorm = normalizeHeadingText(h.textContent);
            return tagMatch && ((dataNorm && (dataNorm === cleanNorm || dataNorm === rawNorm)) ||
                                (textNorm && (textNorm === cleanNorm || textNorm === rawNorm)));
          });
          if (exact) return exact;
          const tagOnly = targetTag ? headingsInSection.find(h => h.tagName.toUpperCase() === targetTag) : null;
          if (tagOnly) return tagOnly;
          return headingsInSection[0];
        }
        return section;
      }

      const byLine = renderedHeadings.find((heading) => {
        const lineAttr = heading.getAttribute('data-line') || heading.getAttribute('data-heading-line') || (typeof heading.closest === 'function' ? heading.closest('[data-line]')?.getAttribute('data-line') : null);
        return lineAttr !== null && parseInt(lineAttr, 10) === chap.line;
      });
      if (byLine) return byLine;
    }

    // 2. 层级严格匹配 (H2/H3/...) + 归一化文本完全对齐
    if (targetTag && (cleanNorm || rawNorm)) {
      const matchExact = renderedHeadings.find((h) => {
        const tag = (h.tagName || '').toUpperCase();
        if (tag !== targetTag) return false;
        const dataNorm = normalizeHeadingText(h.getAttribute('data-heading'));
        const textNorm = normalizeHeadingText(h.textContent);
        return (dataNorm && (dataNorm === cleanNorm || dataNorm === rawNorm)) ||
               (textNorm && (textNorm === cleanNorm || textNorm === rawNorm));
      });
      if (matchExact) return matchExact;
    }

    // 3. 层级严格匹配 + 子串包含对齐
    if (targetTag && cleanNorm) {
      const matchPartial = renderedHeadings.find((h) => {
        const tag = (h.tagName || '').toUpperCase();
        if (tag !== targetTag) return false;
        const dataNorm = normalizeHeadingText(h.getAttribute('data-heading'));
        const textNorm = normalizeHeadingText(h.textContent);
        const matchData = Boolean(dataNorm) && (dataNorm.includes(cleanNorm) || cleanNorm.includes(dataNorm));
        const matchText = Boolean(textNorm) && (textNorm.includes(cleanNorm) || cleanNorm.includes(textNorm));
        return matchData || matchText;
      });
      if (matchPartial) return matchPartial;
    }

    // 4. 不限层级的归一化文本完全匹配
    if (cleanNorm || rawNorm) {
      const byExactText = renderedHeadings.find((h) => {
        const dataNorm = normalizeHeadingText(h.getAttribute('data-heading'));
        const textNorm = normalizeHeadingText(h.textContent);
        return (dataNorm && (dataNorm === cleanNorm || dataNorm === rawNorm)) ||
               (textNorm && (textNorm === cleanNorm || textNorm === rawNorm));
      });
      if (byExactText) return byExactText;
    }

    // 5. 不限层级的子串包含匹配
    if (cleanNorm) {
      const byPartialText = renderedHeadings.find((h) => {
        const dataNorm = normalizeHeadingText(h.getAttribute('data-heading'));
        const textNorm = normalizeHeadingText(h.textContent);
        return (Boolean(dataNorm) && (dataNorm.includes(cleanNorm) || cleanNorm.includes(dataNorm))) ||
               (Boolean(textNorm) && (textNorm.includes(cleanNorm) || cleanNorm.includes(textNorm)));
      });
      if (byPartialText) return byPartialText;
    }

    // 6. 保底：headingIndex 匹配
    if (Number.isInteger(chap.headingIndex) && renderedHeadings[chap.headingIndex]) {
      return renderedHeadings[chap.headingIndex];
    }

    return null;
  }

  getCurrentEditorTopLine(view, container, chapters = []) {
    try {
      const mode = view.getMode ? view.getMode() : (view.currentMode?.type || 'source');
      if (mode !== 'preview') {
        const cm = view.editor?.cm || view.editMode?.editor?.cm;
        if (cm && cm.scrollDOM) {
          const topOffset = cm.scrollDOM.scrollTop + 50;
          const lineBlock = cm.lineBlockAtHeight(topOffset);
          if (lineBlock) {
            const doc = cm.state.doc;
            const line = doc.lineAt(lineBlock.from);
            return line.number - 1;
          }
        }
      } else {
        const scroller = view.contentEl?.querySelector('.markdown-preview-view');
        if (!scroller) return 0;
        const scrollerRect = scroller.getBoundingClientRect();
        const activeBaseline = scrollerRect.top + 70;

        let closestLine = 0;
        for (const chap of chapters) {
          const heading = this.getReadingHeading(view, chap);
          if (heading) {
            if (heading.getBoundingClientRect().top <= activeBaseline) {
              closestLine = chap.line;
            } else {
              break;
            }
          } else {
            const section = scroller.querySelector(`.markdown-preview-section[data-line="${chap.line}"]`);
            if (section) {
              if (section.getBoundingClientRect().top <= activeBaseline) {
                closestLine = chap.line;
              } else {
                break;
              }
            }
          }
        }
        return closestLine;
      }
    } catch (e) {
      // ignore
    }
    return 0;
  }

  jumpToHeading(view, chap) {
    const targetView = (view && view.file)
      ? view
      : this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!targetView) return;

    const line = (typeof chap === 'number') ? chap : chap.line;
    if (line === undefined) return;

    const headingText = (typeof chap === 'object' && chap) ? (chap.rawHeading || chap.title) : '';
    const subpath = headingText ? `#${headingText}` : '';

    // 0. 调用 Obsidian 原生状态机制（自动解除折叠、唤醒虚拟DOM、跨模式对齐，focus: false 彻底避免选中文字与背景高亮）
    try {
      if (typeof targetView.setEphemeralState === 'function') {
        targetView.setEphemeralState(subpath ? { subpath, line, focus: false } : { line, focus: false });
      }
      this.clearFlashHighlights(targetView.contentEl);
    } catch (e) {
      // ignore
    }

    const mode = targetView.getMode ? targetView.getMode() : (targetView.currentMode?.type || 'source');
    if (mode === 'preview') {
      const previewScroller = targetView.contentEl?.querySelector('.markdown-preview-view');
      const previewMode = targetView.currentMode || targetView.previewMode;

      if (previewMode && typeof previewMode.applyScroll === 'function') {
        previewMode.applyScroll(line);
      }

      if (previewScroller) {
        const topMargin = 20;
        let targetHeading = typeof chap === 'object' ? this.getReadingHeading(targetView, chap) : null;

        if (targetHeading) {
          const scrollerRect = previewScroller.getBoundingClientRect();
          const headingRect = targetHeading.getBoundingClientRect();
          const targetTop = Math.max(
            0,
            previewScroller.scrollTop + headingRect.top - scrollerRect.top - topMargin
          );
          previewScroller.scrollTo({ top: targetTop, behavior: 'smooth' });
        }

        let frames = 0;
        const maxFrames = 24;
        const calibratePreview = () => {
          frames++;
          if (!targetHeading && typeof chap === 'object') {
            targetHeading = this.getReadingHeading(targetView, chap);
            if (targetHeading) {
              const scrollerRect = previewScroller.getBoundingClientRect();
              const headingRect = targetHeading.getBoundingClientRect();
              const targetTop = Math.max(
                0,
                previewScroller.scrollTop + headingRect.top - scrollerRect.top - topMargin
              );
              previewScroller.scrollTo({ top: targetTop, behavior: 'smooth' });
            }
          }

          if (targetHeading) {
            const freshScrollerRect = previewScroller.getBoundingClientRect();
            const freshHeadingRect = targetHeading.getBoundingClientRect();
            const delta = freshHeadingRect.top - freshScrollerRect.top - topMargin;
            if (Math.abs(delta) > 1) {
              previewScroller.scrollTop = Math.max(0, previewScroller.scrollTop + delta);
            }
          }
          if (frames < maxFrames) {
            requestAnimationFrame(calibratePreview);
          }
        };
        requestAnimationFrame(calibratePreview);
        return;
      }
    }

    const editor = targetView.editor;
    const cm = editor?.cm || editor?.editor?.cm || targetView.editMode?.editor?.cm || targetView.editMode?.cm;
    const scroller = targetView.contentEl?.querySelector('.cm-scroller');

    if (editor?.setCursor) {
      editor.setCursor({ line, ch: 0 });
    }

    if (editor?.scrollIntoView) {
      editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, false);
    }

    if (cm && cm.state && cm.state.doc) {
      const doc = cm.state.doc;
      const targetLineNum = Math.min(Math.max(1, line + 1), doc.lines);
      const lineObj = doc.line(targetLineNum);
      const targetPos = lineObj.from;

      try {
        const EditorViewClass = cm.constructor;
        if (EditorViewClass && typeof EditorViewClass.scrollIntoView === 'function') {
          cm.dispatch({
            effects: EditorViewClass.scrollIntoView(targetPos, { y: 'start', yMargin: 20 })
          });
        } else {
          const block = cm.lineBlockAt(targetPos);
          if (scroller && block) {
            scroller.scrollTop = Math.max(0, block.top - 20);
          }
        }
      } catch (e) {
        if (editor) {
          editor.scrollIntoView({ from: { line: line, ch: 0 }, to: { line: line, ch: 0 } }, false);
        }
      }

      // 2. 毫秒级多帧高精物理像素校准（消除 LaTeX 公式/卡片渲染重排导致的微小位移）
      if (scroller) {
        let frames = 0;
        const calibrate = () => {
          frames++;
          const scrollerRect = scroller.getBoundingClientRect();
          const coords = cm.coordsAtPos ? cm.coordsAtPos(targetPos) : null;

          if (coords) {
            const delta = coords.top - scrollerRect.top - 20;
            if (Math.abs(delta) > 1) {
              scroller.scrollTop += delta;
            }
          } else {
            try {
              const freshBlock = cm.lineBlockAt(targetPos);
              if (freshBlock) {
                const delta = freshBlock.top - scroller.scrollTop - 20;
                if (Math.abs(delta) > 1) {
                  scroller.scrollTop = Math.max(0, freshBlock.top - 20);
                }
              }
            } catch (err) {
              // ignore
            }
          }

          if (frames < 12) {
            requestAnimationFrame(calibrate);
          }
        };
        requestAnimationFrame(calibrate);
      }
      return;
    }

    // 降级保底
    if (editor) {
      editor.scrollIntoView({ from: { line: line, ch: 0 }, to: { line: line, ch: 0 } }, false);
    }
  }

  onunload() {
    console.log('Unloading Charter Pipeline Pro');
    if (this.refreshFrame !== null) cancelAnimationFrame(this.refreshFrame);
    if (this.refreshTimer !== null) clearTimeout(this.refreshTimer);
    this.observers.forEach(obs => obs.disconnect());
    this.observers.clear();
    this.viewObservers.forEach(obs => obs.disconnect());
    this.viewObservers.clear();
    this.renderVersions.clear();
    this.scrollBindings.forEach(({ scroller, handler }) => {
      scroller.removeEventListener('scroll', handler);
    });
    this.scrollBindings.clear();
    document.querySelectorAll('.codex-stepper-container').forEach(el => el.remove());
    document.querySelectorAll('.codex-floating-tooltip').forEach(el => el.remove());
  }
}

ChapterPipelinePlugin.ChapterSuggestModal = ChapterSuggestModal;
ChapterPipelinePlugin.ChapterParser = ChapterParser;
ChapterPipelinePlugin.SoundEngine = SoundEngine;
ChapterPipelinePlugin.updateHierarchyFolding = updateHierarchyFolding;
ChapterPipelinePlugin.prototype.updateHierarchyFolding = updateHierarchyFolding;

module.exports = ChapterPipelinePlugin;
module.exports.default = ChapterPipelinePlugin;
module.exports.ChapterSuggestModal = ChapterSuggestModal;
module.exports.ChapterParser = ChapterParser;
module.exports.SoundEngine = SoundEngine;
module.exports.updateHierarchyFolding = updateHierarchyFolding;

