const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

class FakeClassList {
  constructor(initial = []) {
    this.values = new Set(initial);
  }

  add(...names) {
    names.forEach((name) => this.values.add(name));
  }

  remove(...names) {
    names.forEach((name) => this.values.delete(name));
  }

  contains(name) {
    return this.values.has(name);
  }
}

class FakeElement {
  constructor({ tagName = 'div', classes = [], rect = {}, scrollParent = null, textContent = '', attributes = {} } = {}) {
    this.tagName = tagName.toLowerCase();
    this.classList = new FakeClassList(classes);
    this.children = [];
    this.parentElement = null;
    this.scrollParent = scrollParent;
    this.rect = { top: 0, left: 0, right: 0, height: 0, ...rect };
    this.listeners = new Map();
    this.attributes = new Map(Object.entries(attributes));
    this.textContent = textContent;
    this.clientWidth = 900;
    this.scrollTop = 0;
    this.style = {
      values: new Map(),
      setProperty: (name, value) => this.style.values.set(name, value),
    };
  }

  addClass(...names) {
    this.classList.add(...names);
    return this;
  }

  removeClass(...names) {
    this.classList.remove(...names);
    return this;
  }

  append(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  createEl(tagName, options = {}) {
    return this.append(this.createChild(tagName, options));
  }

  createDiv(options = {}) {
    return this.append(this.createChild('div', options));
  }

  createSpan(options = {}) {
    return this.append(this.createChild('span', options));
  }

  createChild(tagName, options) {
    const classes = String(options.cls || '').split(/\s+/).filter(Boolean);
    const child = new FakeElement({
      tagName,
      classes,
      textContent: options.text || options.textContent || ''
    });
    for (const [name, value] of Object.entries(options.attr || {})) {
      child.setAttribute(name, value);
    }
    return child;
  }

  empty() {
    this.children = [];
  }

  remove() {
    if (!this.parentElement) return;
    this.parentElement.children = this.parentElement.children.filter((child) => child !== this);
    this.parentElement = null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) || [];
    handlers.push(handler);
    this.listeners.set(type, handlers);
  }

  removeEventListener(type, handler) {
    const handlers = this.listeners.get(type) || [];
    const remaining = handlers.filter((candidate) => candidate !== handler);
    if (remaining.length > 0) this.listeners.set(type, remaining);
    else this.listeners.delete(type);
  }

  dispatch(type) {
    for (const handler of this.listeners.get(type) || []) {
      handler({ stopPropagation() {} });
    }
  }

  scrollTo(options) {
    this.lastScrollTo = options;
    this.scrollTop = options.top;
  }

  getBoundingClientRect() {
    const scrollOffset = this.scrollParent ? this.scrollParent.scrollTop : 0;
    return { ...this.rect, top: this.rect.top - scrollOffset };
  }

  matches(selector) {
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    return this.tagName === selector.toLowerCase();
  }

  closest(selector) {
    const selectors = selector.split(',').map((s) => s.trim());
    let current = this;
    while (current) {
      if (selectors.some((sel) => current.matches && current.matches(sel))) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const selectors = selector.split(',').map((part) => part.trim());
    const matches = [];
    const visit = (node) => {
      for (const child of node.children) {
        if (selectors.some((part) => child.matches(part))) matches.push(child);
        visit(child);
      }
    };
    visit(this);
    return matches;
  }
}

class ObsidianPlugin {
  constructor(app, manifest) {
    this.app = app;
    this.manifest = manifest;
    this.commands = [];
  }

  async loadData() {
    return {};
  }

  async saveData(data) {
    this._savedData = data;
  }

  addSettingTab(tab) {
    this.settingTab = tab;
  }

  addCommand(command) {
    this.commands.push(command);
    return command;
  }

  registerEvent() {}
}

class MarkdownView {}

class PluginSettingTab {
  constructor(app, plugin) {
    this.app = app;
    this.plugin = plugin;
    this.containerEl = new FakeElement({ tagName: 'div' });
  }
}

class SuggestModal {
  constructor(app) {
    this.app = app;
    this.isOpen = false;
    this.placeholder = '';
  }

  setPlaceholder(text) {
    this.placeholder = text;
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }
}

class Setting {
  static instances = [];

  constructor(containerEl) {
    this.containerEl = containerEl;
    this.name = '';
    this.desc = '';
    this.controls = [];
    Setting.instances.push(this);
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setDesc(desc) {
    this.desc = desc;
    return this;
  }

  addToggle(cb) {
    const toggle = {
      value: false,
      setValue: (val) => { toggle.value = val; return toggle; },
      onChange: (fn) => { toggle.changeHandler = fn; return toggle; },
    };
    cb(toggle);
    this.controls.push(toggle);
    return this;
  }

  addDropdown(cb) {
    const drop = {
      options: {},
      value: '',
      addOption: (k, v) => { drop.options[k] = v; return drop; },
      setValue: (val) => { drop.value = val; return drop; },
      onChange: (fn) => { drop.changeHandler = fn; return drop; },
    };
    cb(drop);
    this.controls.push(drop);
    return this;
  }

  addSlider(cb) {
    const slider = {
      min: 0,
      max: 100,
      step: 1,
      value: 0,
      setLimits: (min, max, step) => { slider.min = min; slider.max = max; slider.step = step; return slider; },
      setValue: (val) => { slider.value = val; return slider; },
      setDynamicTooltip: () => slider,
      onChange: (fn) => { slider.changeHandler = fn; return slider; },
    };
    cb(slider);
    this.controls.push(slider);
    return this;
  }
}

const originalLoad = Module._load;
Module._load = function loadWithObsidianStub(request, parent, isMain) {
  if (request === 'obsidian') {
    return {
      Plugin: ObsidianPlugin,
      MarkdownView,
      MarkdownRenderer: {
        render(app, markdown, el, path, component) {
          if (el) {
            el.textContent = markdown;
            if (typeof el.createSpan === 'function') {
              el.createSpan({ text: markdown });
            }
          }
        }
      },
      PluginSettingTab,
      Setting,
      SuggestModal,
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const ChapterPipelinePlugin = require('./main.js');
Module._load = originalLoad;

function createReadingHarness() {
  const body = new FakeElement();
  global.document = { body };
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    disconnect() {}
  };
  global.__mutationObservers = [];
  global.MutationObserver = class MutationObserver {
    constructor(callback) {
      this.callback = callback;
      global.__mutationObservers.push(this);
    }
    observe() {}
    disconnect() {}
    trigger() {
      this.callback();
    }
  };
  global.requestAnimationFrame = (callback) => {
    callback();
    return 1;
  };

  const container = new FakeElement();
  const sourceScroller = container.append(new FakeElement({ classes: ['cm-scroller'] }));
  const scroller = container.append(new FakeElement({
    classes: ['markdown-preview-view'],
    rect: { top: 100, left: 250, right: 1000, height: 650 },
  }));
  const firstHeading = scroller.append(new FakeElement({
    tagName: 'h1',
    rect: { top: 180, left: 300, right: 900, height: 40 },
    scrollParent: scroller,
  }));
  const secondHeading = scroller.append(new FakeElement({
    tagName: 'h2',
    rect: { top: 420, left: 300, right: 900, height: 36 },
    scrollParent: scroller,
  }));

  const view = new MarkdownView();
  view.file = { path: 'note.md' };
  view.contentEl = container;
  view.getMode = () => 'preview';

  const app = {
    vault: { cachedRead: async () => '# First\nbody\nbody\nbody\n## Second\nbody' },
    metadataCache: {
      getFileCache: () => ({
        headings: [
          { heading: 'First', level: 1, position: { start: { line: 0 } } },
          { heading: 'Second', level: 2, position: { start: { line: 4 } } },
        ],
      }),
    },
    workspace: { getActiveViewOfType: () => view },
  };

  const plugin = new ChapterPipelinePlugin(app, {});
  plugin.settings = {
    minHeadingLevel: 1,
    maxHeadingLevel: 6,
    ignoreFirstH1: false,
    showExcerpt: true,
    activeColor: '#3b82f6',
    narrowThreshold: 600,
    enableSound: false,
  };

  app.workspace.getLeavesOfType = () => [{ view }];

  return { app, container, firstHeading, plugin, scroller, secondHeading, sourceScroller, view };
}

test('Reading View renders the chapter pipeline and tracks its visible scroll container', async () => {
  const { container, plugin, scroller, sourceScroller, view } = createReadingHarness();

  await plugin.attachStepperToView(view);

  assert.ok(container.querySelector('.codex-stepper-container'));
  assert.equal(scroller.listeners.get('scroll')?.length, 1);
  assert.equal(sourceScroller.listeners.get('scroll'), undefined);
  assert.equal(container.querySelectorAll('.codex-dash-item').length, 2);
});

test('Reading View active tracking ignores the hidden editor state', () => {
  const { container, plugin, scroller, sourceScroller, view } = createReadingHarness();
  sourceScroller.scrollTop = 0;
  scroller.scrollTop = 300;
  view.editor = {
    cm: {
      scrollDOM: sourceScroller,
      lineBlockAtHeight: () => ({ from: 0 }),
      state: { doc: { lineAt: () => ({ number: 1 }) } },
    },
  };
  const chapters = [
    { line: 0, headingIndex: 0 },
    { line: 4, headingIndex: 1 },
  ];

  assert.equal(plugin.getCurrentEditorTopLine(view, container, chapters), 4);
});

test('clicking a Reading View chapter aligns its heading to the top baseline', async () => {
  const { container, plugin, scroller, secondHeading, view } = createReadingHarness();
  await plugin.attachStepperToView(view);

  const secondDash = container.querySelectorAll('.codex-dash-item')[1];
  assert.ok(secondDash, 'the second chapter dash should exist in Reading View');

  secondDash.dispatch('click');

  assert.equal(scroller.lastScrollTo.top, 300);
  assert.equal(secondHeading.getBoundingClientRect().top, scroller.getBoundingClientRect().top + 20);
});

test('editing-mode navigation keeps the cursor and heading on the 20px baseline', () => {
  const { app, sourceScroller, plugin, view } = createReadingHarness();
  let cursor = null;
  view.getMode = () => 'source';
  sourceScroller.rect.top = 100;
  view.editor = {
    setCursor: (position) => { cursor = position; },
    scrollIntoView() {},
  };
  view.editor.cm = {
    scrollDOM: sourceScroller,
    state: {
      doc: {
        lines: 10,
        line: () => ({ from: 40 }),
      },
    },
    lineBlockAt: () => ({ top: 420 }),
    coordsAtPos: () => ({ top: 520 - sourceScroller.scrollTop }),
  };
  app.workspace.getActiveViewOfType = () => view;

  plugin.jumpToHeading(view, { line: 4, headingIndex: 1 });

  assert.deepEqual(cursor, { line: 4, ch: 0 });
  assert.equal(sourceScroller.scrollTop, 400);
});

test('chapter navigation targets the view that owns the clicked pipeline', () => {
  const origin = createReadingHarness();
  const other = createReadingHarness();
  origin.app.workspace.getActiveViewOfType = () => other.view;

  origin.plugin.jumpToHeading(origin.view, { line: 4, headingIndex: 1 });

  assert.equal(origin.scroller.lastScrollTo?.top, 300);
  assert.equal(other.scroller.lastScrollTo, undefined);
});

test('a layout refresh reattaches the pipeline after Obsidian replaces the Reading View DOM', async () => {
  const { plugin, view } = createReadingHarness();
  const replacement = createReadingHarness();

  plugin.scheduleUpdateAllMarkdownViews();
  view.contentEl = replacement.container;

  await new Promise((resolve) => setTimeout(resolve, 200));

  assert.ok(view.contentEl.querySelector('.codex-stepper-container'));
});

test('Reading View DOM replacement reattaches the pipeline without another workspace event', async () => {
  const { container, plugin, view } = createReadingHarness();
  await plugin.attachStepperToView(view);

  container.querySelector('.codex-stepper-container').remove();
  const viewObserver = global.__mutationObservers[0];
  assert.ok(viewObserver, 'the Markdown view should be observed for rendered DOM replacement');

  viewObserver.trigger();
  await Promise.resolve();

  assert.ok(container.querySelector('.codex-stepper-container'));
});

test('concurrent view refreshes keep only the newest pipeline instance', async () => {
  const { app, container, plugin, view } = createReadingHarness();
  const pendingReads = [];
  app.vault.cachedRead = () => new Promise((resolve) => pendingReads.push(resolve));

  const firstRefresh = plugin.attachStepperToView(view);
  const secondRefresh = plugin.attachStepperToView(view);
  assert.equal(pendingReads.length, 2);

  pendingReads.forEach((resolve) => resolve('# First\nbody\nbody\nbody\n## Second\nbody'));
  await Promise.all([firstRefresh, secondRefresh]);

  assert.equal(container.querySelectorAll('.codex-stepper-container').length, 1);
});

test('repeated refreshes keep only one scroll listener per view', async () => {
  const { plugin, scroller, view } = createReadingHarness();

  await plugin.attachStepperToView(view);
  await plugin.attachStepperToView(view);

  assert.equal(scroller.listeners.get('scroll')?.length, 1);
});

test('Reading View ignores headings rendered inside embedded notes', () => {
  const { plugin, scroller, secondHeading, view } = createReadingHarness();
  
  // Insert an embedded note with its own heading before the second heading
  const embed = new FakeElement({ classes: ['internal-embed'] });
  const embedHeading = new FakeElement({ tagName: 'h2', textContent: 'Embedded Heading' });
  embed.append(embedHeading);
  scroller.children.splice(1, 0, embed);

  const matched = plugin.getReadingHeading(view, { line: 4, headingIndex: 1, title: 'Second' });
  assert.equal(matched, secondHeading);
});

test('Reading View accurately matches H2 and H3 headings even with inline titles present', () => {
  const { plugin, scroller, view } = createReadingHarness();
  
  // Add an inline-title h1 at the top of scroller
  const inlineTitle = new FakeElement({ tagName: 'h1', classes: ['inline-title'], textContent: 'Note Title' });
  scroller.children.unshift(inlineTitle);

  const h2Element = new FakeElement({
    tagName: 'h2',
    attributes: { 'data-heading': '2.2 导数的计算' },
    textContent: '2.2 导数的计算',
    rect: { top: 400, left: 250, right: 1000, height: 40 }
  });
  const h3Element = new FakeElement({
    tagName: 'h3',
    attributes: { 'data-heading': '2.2.1 具体函数可导性的判断' },
    textContent: '2.2.1 具体函数可导性的判断',
    rect: { top: 700, left: 250, right: 1000, height: 35 }
  });
  scroller.append(h2Element);
  scroller.append(h3Element);

  const matchedH2 = plugin.getReadingHeading(view, {
    level: 2,
    title: '2.2 导数的计算',
    rawHeading: '2.2 导数的计算',
    line: 10
  });
  assert.equal(matchedH2, h2Element);

  const matchedH3 = plugin.getReadingHeading(view, {
    level: 3,
    title: '2.2.1 具体函数可导性的判断',
    rawHeading: '2.2.1 具体函数可导性的判断',
    line: 25
  });
  assert.equal(matchedH3, h3Element);
});

test('Reading View navigation calls previewMode.applyScroll and setEphemeralState with subpath', () => {
  const { plugin, view } = createReadingHarness();
  let appliedScrollLine = null;
  let ephemeralState = null;
  view.currentMode = {
    applyScroll: (line) => { appliedScrollLine = line; }
  };
  view.setEphemeralState = (state) => {
    ephemeralState = state;
  };

  plugin.jumpToHeading(view, {
    level: 2,
    title: '2.4.1 脱帽法',
    rawHeading: '2.4.1 脱帽法',
    line: 21
  });

  assert.equal(appliedScrollLine, 21);
  assert.equal(ephemeralState?.subpath, '#2.4.1 脱帽法');
  assert.equal(ephemeralState?.line, 21);
});

test('chapter items render with level classes and mouseenter displays the Linear level badge', async () => {
  const { container, plugin, view } = createReadingHarness();
  await plugin.attachStepperToView(view);

  const stepperContainer = container.querySelector('.codex-stepper-container');
  assert.ok(stepperContainer);
  assert.ok(stepperContainer.style.values.has('--dash-w1'));
  assert.ok(stepperContainer.style.values.has('--dash-hover-w1'));

  const dashItems = container.querySelectorAll('.codex-dash-item');
  assert.equal(dashItems.length, 2);
  assert.ok(dashItems[0].classList.contains('level-1'));
  assert.ok(dashItems[1].classList.contains('level-2'));

  // Test mouseenter on H1 item (active by default at scroll 0)
  dashItems[0].dispatch('mouseenter');
  const tooltip = global.document.body.querySelector('.codex-floating-tooltip');
  assert.ok(tooltip);
  assert.ok(tooltip.classList.contains('is-visible'));

  const badgeH1 = tooltip.querySelector('.codex-level-badge');
  assert.ok(badgeH1);
  assert.ok(badgeH1.classList.contains('level-1'));
  assert.ok(badgeH1.classList.contains('is-active'));
  assert.equal(badgeH1.textContent, 'H1');

  // Test mouseenter on H2 item (not active)
  dashItems[1].dispatch('mouseenter');
  const badgeH2 = tooltip.querySelector('.codex-level-badge');
  assert.ok(badgeH2);
  assert.ok(badgeH2.classList.contains('level-2'));
  assert.equal(badgeH2.classList.contains('is-active'), false);
  assert.equal(badgeH2.textContent, 'H2');

  // Switch active to H2 item and test mouseenter
  dashItems[0].classList.remove('active');
  dashItems[1].classList.add('active');
  dashItems[1].dispatch('mouseenter');
  const badgeH2Active = tooltip.querySelector('.codex-level-badge');
  assert.ok(badgeH2Active);
  assert.ok(badgeH2Active.classList.contains('is-active'));
});

test('Settings load new default properties with backward compatibility', async () => {
  const { app } = createReadingHarness();
  const plugin = new ChapterPipelinePlugin(app, {});
  await plugin.loadSettings();
  assert.equal(plugin.settings.dockPosition, 'left');
  assert.equal(plugin.settings.hierarchyMode, 'all');
  assert.equal(plugin.settings.showProgressRail, true);
  assert.equal(plugin.settings.tooltipGlassmorphism, true);
});

test('Settings load preserves existing custom values', async () => {
  const { app } = createReadingHarness();
  const plugin = new ChapterPipelinePlugin(app, {});
  plugin.loadData = async () => ({
    dockPosition: 'right',
    hierarchyMode: 'hover-expand',
    showProgressRail: false,
    tooltipGlassmorphism: false,
  });
  await plugin.loadSettings();
  assert.equal(plugin.settings.dockPosition, 'right');
  assert.equal(plugin.settings.hierarchyMode, 'hover-expand');
  assert.equal(plugin.settings.showProgressRail, false);
  assert.equal(plugin.settings.tooltipGlassmorphism, false);
});

test('ChapterPipelineSettingTab renders all controls and updates settings', async () => {
  Setting.instances = [];
  const { app } = createReadingHarness();
  app.workspace.on = () => {};
  app.workspace.onLayoutReady = () => {};
  app.metadataCache = { on: () => {} };
  const plugin = new ChapterPipelinePlugin(app, {});
  await plugin.onload();

  assert.ok(plugin.settingTab);
  let viewsUpdated = 0;
  plugin.updateAllMarkdownViews = () => { viewsUpdated++; };

  plugin.settingTab.display();

  // Find dockPosition dropdown setting
  const dockSetting = Setting.instances.find(s => s.controls.some(c => c.options && 'left' in c.options && 'right' in c.options));
  assert.ok(dockSetting, 'dockPosition dropdown setting should be rendered');
  const dockControl = dockSetting.controls[0];
  assert.equal(dockControl.value, 'left');
  await dockControl.changeHandler('right');
  assert.equal(plugin.settings.dockPosition, 'right');
  assert.equal(viewsUpdated, 1);

  // Find hierarchyMode dropdown setting
  const hierSetting = Setting.instances.find(s => s.controls.some(c => c.options && 'hover-expand' in c.options));
  assert.ok(hierSetting, 'hierarchyMode dropdown setting should be rendered');
  const hierControl = hierSetting.controls[0];
  assert.equal(hierControl.value, 'all');
  await hierControl.changeHandler('hover-expand');
  assert.equal(plugin.settings.hierarchyMode, 'hover-expand');

  // Find showProgressRail toggle setting
  const railSetting = Setting.instances.find(s => s.name.includes('Progress Rail') || s.name.includes('垂直进度导轨'));
  assert.ok(railSetting, 'showProgressRail toggle setting should be rendered');
  const railControl = railSetting.controls[0];
  assert.equal(railControl.value, true);
  await railControl.changeHandler(false);
  assert.equal(plugin.settings.showProgressRail, false);

  // Find tooltipGlassmorphism toggle setting
  const glassSetting = Setting.instances.find(s => s.name.includes('Glassmorphism') || s.name.includes('毛玻璃'));
  assert.ok(glassSetting, 'tooltipGlassmorphism toggle setting should be rendered');
  const glassControl = glassSetting.controls[0];
  assert.equal(glassControl.value, true);
  await glassControl.changeHandler(false);
  assert.equal(plugin.settings.tooltipGlassmorphism, false);
});

test('ChapterSuggestModal provides items, search text, renders badge/title/excerpt, and handles selection with sound', () => {
  const { app, plugin, view } = createReadingHarness();
  let jumpedTo = null;
  let clickedSoundVolume = null;
  plugin.settings.enableSound = true;
  plugin.settings.soundVolume = 60;
  plugin.jumpToHeading = (v, chap) => { jumpedTo = { view: v, chap }; };
  plugin.soundEngine.playClick = (vol) => { clickedSoundVolume = vol; };

  const chapters = [
    { title: 'Chapter 1', level: 1, line: 0, summaryMarkdown: 'First line excerpt' },
    { title: 'Chapter 2', level: 2, line: 10, summaryMarkdown: '' }
  ];

  const ChapterSuggestModal = ChapterPipelinePlugin.ChapterSuggestModal;
  assert.ok(ChapterSuggestModal, 'ChapterSuggestModal class should exist');

  const modal = new ChapterSuggestModal(app, plugin, view, chapters);
  assert.deepEqual(modal.getItems(), chapters);
  assert.equal(modal.getItemText(chapters[0]), 'Chapter 1 First line excerpt');
  assert.equal(modal.getItemText(chapters[1]), 'Chapter 2 ');

  // Test renderSuggestion for item with excerpt
  const el1 = new FakeElement();
  modal.renderSuggestion(chapters[0], el1);
  const badge1 = el1.querySelector('.codex-level-badge');
  assert.ok(badge1, 'should render level badge');
  assert.ok(badge1.classList.contains('level-1'));
  assert.equal(badge1.textContent, 'H1');
  const title1 = el1.querySelector('.codex-modal-title');
  assert.ok(title1, 'should render title element');
  assert.ok(title1.textContent.includes('Chapter 1'));
  const excerpt1 = el1.querySelector('.codex-modal-excerpt');
  assert.ok(excerpt1, 'should render excerpt element');
  assert.ok(excerpt1.textContent.includes('First line excerpt'));

  // Test renderSuggestion for item without excerpt
  const el2 = new FakeElement();
  modal.renderSuggestion(chapters[1], el2);
  const excerpt2 = el2.querySelector('.codex-modal-excerpt');
  assert.equal(excerpt2, null, 'should not render excerpt element if empty');

  // Test onChooseItem
  modal.onChooseItem(chapters[0]);
  assert.deepEqual(jumpedTo, { view, chap: chapters[0] });
  assert.equal(clickedSoundVolume, 60);
});

test('jumpToPreviousChapter and jumpToNextChapter navigate with sound feedback', async () => {
  const { app, container, plugin, scroller, view } = createReadingHarness();
  let clickedSoundVolume = null;
  plugin.settings.enableSound = true;
  plugin.settings.soundVolume = 45;
  plugin.soundEngine.playClick = (vol) => { clickedSoundVolume = vol; };

  // Currently at line 0 (chapter 0)
  scroller.scrollTop = 0;

  // Jump next: from chapter 0 (H1 at line 0) to chapter 1 (H2 at line 4)
  await plugin.jumpToNextChapter(view);
  assert.equal(scroller.lastScrollTo?.top, 300);
  assert.equal(clickedSoundVolume, 45);

  // Jump next again at last chapter (stays at chapter 1)
  clickedSoundVolume = null;
  scroller.scrollTop = 300;
  await plugin.jumpToNextChapter(view);
  assert.equal(scroller.lastScrollTo?.top, 300);
  assert.equal(clickedSoundVolume, 45);

  // Jump prev: from chapter 1 back to chapter 0
  clickedSoundVolume = null;
  await plugin.jumpToPreviousChapter(view);
  assert.equal(scroller.lastScrollTo?.top, 60);
  assert.equal(clickedSoundVolume, 45);
});

test('openChapterPalette extracts chapters and opens ChapterSuggestModal', async () => {
  const { app, plugin, view } = createReadingHarness();
  const modal = await plugin.openChapterPalette(view);

  assert.ok(modal, 'openChapterPalette should return the modal instance');
  assert.equal(modal.isOpen, true);
  assert.equal(modal.getItems().length, 2);
});

test('onload registers jump-prev, jump-next, and open-palette commands', async () => {
  const { app } = createReadingHarness();
  app.workspace.on = () => {};
  app.workspace.onLayoutReady = () => {};
  app.metadataCache = { on: () => {} };
  const plugin = new ChapterPipelinePlugin(app, {});
  await plugin.onload();

  const prevCmd = plugin.commands.find(c => c.id === 'charter-pipeline-jump-prev');
  assert.ok(prevCmd, 'jump-prev command should be registered');
  assert.equal(prevCmd.name, 'Charter Pipeline: Jump to previous chapter');

  const nextCmd = plugin.commands.find(c => c.id === 'charter-pipeline-jump-next');
  assert.ok(nextCmd, 'jump-next command should be registered');
  assert.equal(nextCmd.name, 'Charter Pipeline: Jump to next chapter');

  const paletteCmd = plugin.commands.find(c => c.id === 'charter-pipeline-open-palette');
  assert.ok(paletteCmd, 'open-palette command should be registered');
  assert.equal(paletteCmd.name, 'Charter Pipeline: Search & switch chapter (Palette)');

  // Verify command execution
  let prevCalled = false;
  let nextCalled = false;
  let paletteCalled = false;
  plugin.jumpToPreviousChapter = () => { prevCalled = true; };
  plugin.jumpToNextChapter = () => { nextCalled = true; };
  plugin.openChapterPalette = () => { paletteCalled = true; };

  assert.equal(prevCmd.checkCallback(true), true);
  prevCmd.checkCallback(false);
  assert.equal(prevCalled, true);

  assert.equal(nextCmd.checkCallback(true), true);
  nextCmd.checkCallback(false);
  assert.equal(nextCalled, true);

  assert.equal(paletteCmd.checkCallback(true), true);
  paletteCmd.checkCallback(false);
  assert.equal(paletteCalled, true);
});


