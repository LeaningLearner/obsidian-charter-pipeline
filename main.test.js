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
    const styleValues = new Map();
    this.style = new Proxy({
      values: styleValues,
      setProperty: (name, value) => styleValues.set(name, String(value)),
      getPropertyValue: (name) => styleValues.get(name) || '',
    }, {
      get(target, prop) {
        if (prop in target) return target[prop];
        return styleValues.get(prop) || '';
      },
      set(target, prop, val) {
        if (prop === 'values' || prop === 'setProperty' || prop === 'getPropertyValue') {
          target[prop] = val;
        } else {
          styleValues.set(prop, String(val));
        }
        return true;
      }
    });
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

  dispatch(type, event = {}) {
    const syntheticEvent = {
      stopPropagation() {},
      preventDefault() {},
      ...event,
    };
    for (const handler of this.listeners.get(type) || []) {
      handler(syntheticEvent);
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
    this.modalEl = new FakeElement({ classes: ['modal'] });
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

class Menu {
  static instances = [];

  constructor() {
    this.items = [];
    this.event = null;
    Menu.instances.push(this);
  }

  addItem(callback) {
    const item = {
      title: '',
      clickHandler: null,
      setTitle: (title) => { item.title = title; return item; },
      onClick: (handler) => { item.clickHandler = handler; return item; },
    };
    callback(item);
    this.items.push(item);
    return this;
  }

  showAtMouseEvent(event) {
    this.event = event;
  }
}

class Notice {
  static instances = [];

  constructor(message, timeout) {
    this.message = message;
    this.timeout = timeout;
    Notice.instances.push(this);
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
      Menu,
      Notice,
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const ChapterPipelinePlugin = require('./main.js');
Module._load = originalLoad;

function createReadingHarness() {
  const body = new FakeElement();
  global.document = {
    body,
    addEventListener: (...args) => body.addEventListener(...args),
    removeEventListener: (...args) => body.removeEventListener(...args),
    elementsFromPoint: () => [],
  };
  global.window = {
    innerWidth: 1200,
    innerHeight: 800,
    localStorage: { getItem: () => 'en' },
  };
  Menu.instances = [];
  Notice.instances = [];
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

  const vaultEvents = new Map();
  const app = {
    vault: {
      cachedRead: async () => '# First\nbody\nbody\nbody\n## Second\nbody',
      on: (eventName, handler) => {
        vaultEvents.set(eventName, handler);
        return { eventName, handler };
      },
    },
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

  return { app, container, firstHeading, plugin, scroller, secondHeading, sourceScroller, vaultEvents, view };
}

test('Reading View renders the chapter pipeline and tracks its visible scroll container', async () => {
  const { container, plugin, scroller, sourceScroller, view } = createReadingHarness();

  await plugin.attachStepperToView(view);

  assert.ok(container.querySelector('.codex-stepper-container'));
  assert.equal(scroller.listeners.get('scroll')?.length, 1);
  assert.equal(sourceScroller.listeners.get('scroll'), undefined);
  const dashes = container.querySelectorAll('.codex-dash-item');
  assert.equal(dashes.length, 2);
  assert.equal(dashes[0].getAttribute('data-chapter-order'), '1');
  assert.equal(dashes[1].getAttribute('data-chapter-order'), '2');
});

test('chapter order labels are opt-in and disabled by default', async () => {
  const disabledHarness = createReadingHarness();
  await disabledHarness.plugin.attachStepperToView(disabledHarness.view);
  assert.equal(disabledHarness.container.querySelector('.codex-stepper-container').classList.contains('show-chapter-order'), false);

  const enabledHarness = createReadingHarness();
  enabledHarness.plugin.settings.showChapterOrder = true;
  await enabledHarness.plugin.attachStepperToView(enabledHarness.view);
  assert.equal(enabledHarness.container.querySelector('.codex-stepper-container').classList.contains('show-chapter-order'), true);
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

test('Obsidian reading mode aliases use Reading View tracking and scroll binding', async () => {
  const { container, plugin, scroller, sourceScroller, view } = createReadingHarness();
  view.getMode = () => 'reading';
  scroller.scrollTop = 300;
  const chapters = [
    { line: 0, headingIndex: 0 },
    { line: 4, headingIndex: 1 },
  ];

  assert.equal(plugin.getCurrentEditorTopLine(view, container, chapters), 4);
  await plugin.attachStepperToView(view);
  assert.equal(scroller.listeners.get('scroll')?.length, 1);
  assert.equal(sourceScroller.listeners.get('scroll'), undefined);
});

test('Reading View uses the section beneath the viewport baseline when headings are virtualized', () => {
  const { container, plugin, scroller, view } = createReadingHarness();
  const section = scroller.append(new FakeElement({
    classes: ['markdown-preview-section'],
    attributes: { 'data-line': '16' },
  }));
  const visibleContent = section.append(new FakeElement({ tagName: 'p', textContent: 'Visible section content' }));
  global.document.elementsFromPoint = () => [visibleContent];
  const chapters = [
    { line: 0, headingIndex: 0 },
    { line: 8, headingIndex: 1 },
    { line: 16, headingIndex: 2 },
  ];

  assert.equal(plugin.getCurrentEditorTopLine(view, container, chapters), 16);
});

test('Reading View prefers visible heading geometry over a stale first-section data line', () => {
  const { container, plugin, scroller, view } = createReadingHarness();
  scroller.scrollTop = 300;
  const staleSection = scroller.append(new FakeElement({
    classes: ['markdown-preview-section'],
    attributes: { 'data-line': '0' },
  }));
  const visibleContent = staleSection.append(new FakeElement({ tagName: 'p', textContent: 'Current chapter content' }));
  global.document.elementsFromPoint = () => [visibleContent];
  const chapters = [
    { line: 0, headingIndex: 0, level: 1, title: 'First', rawHeading: 'First' },
    { line: 4, headingIndex: 1, level: 2, title: 'Second', rawHeading: 'Second' },
  ];

  assert.equal(plugin.getCurrentEditorTopLine(view, container, chapters), 4);
});

test('Reading View tracks the scroll-owning parent when Obsidian moves scrolling outside the preview', async () => {
  const { container, firstHeading, plugin, scroller, secondHeading, view } = createReadingHarness();
  const outerScroller = new FakeElement({
    classes: ['view-content'],
    rect: { top: 100, left: 250, right: 1000, height: 650 },
  });
  outerScroller.clientHeight = 650;
  outerScroller.scrollHeight = 1600;
  outerScroller.append(container);
  firstHeading.rect.top = 80;
  secondHeading.rect.top = 150;
  scroller.scrollTop = 0;
  const chapters = [
    { line: 0, headingIndex: 0 },
    { line: 4, headingIndex: 1 },
  ];

  assert.equal(plugin.getViewScroller(container, view), outerScroller);
  assert.equal(plugin.getCurrentEditorTopLine(view, container, chapters), 4);

  await plugin.attachStepperToView(view);
  assert.equal(outerScroller.listeners.get('scroll')?.length, 1);
  assert.equal(container.querySelectorAll('.codex-dash-item')[1].classList.contains('active'), true);
});

test('Reading View prioritizes the parent that is actually scrolling over a long preview child', () => {
  const { container, plugin, scroller, view } = createReadingHarness();
  const outerScroller = new FakeElement({ classes: ['view-content'] });
  outerScroller.clientHeight = 650;
  outerScroller.scrollHeight = 2400;
  outerScroller.scrollTop = 300;
  outerScroller.append(container);
  scroller.clientHeight = 650;
  scroller.scrollHeight = 2400;
  scroller.scrollTop = 0;

  assert.equal(plugin.getViewScroller(container, view), outerScroller);
});

test('Live Preview active tracking uses the last visible heading instead of chapter zero', () => {
  const { container, plugin, sourceScroller, view } = createReadingHarness();
  view.getMode = () => 'source';
  sourceScroller.rect.top = 100;
  sourceScroller.append(new FakeElement({
    classes: ['cm-line', 'HyperMD-header', 'HyperMD-header-2'],
    textContent: '## Second',
    rect: { top: 150, left: 300, right: 900, height: 28 },
    attributes: { 'data-line': '4' },
  }));
  const chapters = [
    { line: 0, level: 1, title: 'First', rawHeading: 'First' },
    { line: 4, level: 2, title: 'Second', rawHeading: 'Second' },
  ];

  assert.equal(plugin.getCurrentEditorTopLine(view, container, chapters), 4);
});

test('Live Preview tracking falls back to the visible CodeMirror scroller', () => {
  const { container, plugin, sourceScroller, view } = createReadingHarness();
  view.getMode = () => 'source';
  sourceScroller.scrollTop = 240;
  view.editor = {
    cm: {
      lineBlockAtHeight: () => ({ from: 40 }),
      state: { doc: { lineAt: () => ({ number: 9 }) } },
    },
  };
  const chapters = [{ line: 0 }, { line: 8 }];

  assert.equal(plugin.getCurrentEditorTopLine(view, container, chapters), 8);
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
  assert.equal(plugin.settings.hierarchyMode, 'hover-expand');
  assert.equal(plugin.settings.showProgressRail, false);
  assert.equal(plugin.settings.tooltipGlassmorphism, true);
  assert.equal(plugin.settings.showChapterOrder, false);
  assert.equal(plugin.settings.readingBookmarksEnabled, false);
  assert.deepEqual(plugin.settings.readingState, { version: 1, files: {} });
});

test('Settings load preserves existing custom values', async () => {
  const { app } = createReadingHarness();
  const plugin = new ChapterPipelinePlugin(app, {});
  plugin.loadData = async () => ({
    dockPosition: 'right',
    hierarchyMode: 'all',
    showProgressRail: true,
    tooltipGlassmorphism: false,
  });
  await plugin.loadSettings();
  assert.equal(plugin.settings.dockPosition, 'right');
  assert.equal(plugin.settings.hierarchyMode, 'all');
  assert.equal(plugin.settings.showProgressRail, true);
  assert.equal(plugin.settings.tooltipGlassmorphism, false);
  assert.equal(plugin.settings.showChapterOrder, false);
  assert.equal(plugin.settings.readingBookmarksEnabled, false);
  assert.deepEqual(plugin.settings.readingState, { version: 1, files: {} });
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
  assert.equal(hierControl.value, 'hover-expand');
  await hierControl.changeHandler('all');
  assert.equal(plugin.settings.hierarchyMode, 'all');

  // Find showProgressRail toggle setting
  const railSetting = Setting.instances.find(s => s.name.includes('Progress Rail') || s.name.includes('垂直进度导轨'));
  assert.ok(railSetting, 'showProgressRail toggle setting should be rendered');
  const railControl = railSetting.controls[0];
  assert.equal(railControl.value, false);
  await railControl.changeHandler(true);
  assert.equal(plugin.settings.showProgressRail, true);

  // Find tooltipGlassmorphism toggle setting
  const glassSetting = Setting.instances.find(s => s.name.includes('Glassmorphism') || s.name.includes('毛玻璃'));
  assert.ok(glassSetting, 'tooltipGlassmorphism toggle setting should be rendered');
  const glassControl = glassSetting.controls[0];
  assert.equal(glassControl.value, true);
  await glassControl.changeHandler(false);
  assert.equal(plugin.settings.tooltipGlassmorphism, false);

  const readingSetting = Setting.instances.find(s => s.name.includes('Reading Progress') || s.name.includes('阅读断点'));
  assert.ok(readingSetting, 'reading progress toggle setting should be rendered');
  const readingControl = readingSetting.controls[0];
  assert.equal(readingControl.value, false);
  await readingControl.changeHandler(true);
  assert.equal(plugin.settings.readingBookmarksEnabled, true);

  const orderSetting = Setting.instances.find(s => s.name.includes('Active Chapter Number') || s.name.includes('当前章节序号'));
  assert.ok(orderSetting, 'showChapterOrder toggle setting should be rendered');
  const orderControl = orderSetting.controls[0];
  assert.equal(orderControl.value, false);
  await orderControl.changeHandler(true);
  assert.equal(plugin.settings.showChapterOrder, true);
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

test('onload registers navigation and reading-bookmark commands', async () => {
  const { app, vaultEvents } = createReadingHarness();
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

  const resumeCmd = plugin.commands.find(c => c.id === 'charter-pipeline-resume-last-chapter');
  const revisitCmd = plugin.commands.find(c => c.id === 'charter-pipeline-toggle-revisit-current');
  const importantCmd = plugin.commands.find(c => c.id === 'charter-pipeline-toggle-important-current');
  const clearCmd = plugin.commands.find(c => c.id === 'charter-pipeline-clear-reading-bookmarks-current');
  assert.equal(resumeCmd.name, 'Charter Pipeline: Resume last chapter');
  assert.equal(revisitCmd.name, 'Charter Pipeline: Toggle revisit bookmark for current chapter');
  assert.equal(importantCmd.name, 'Charter Pipeline: Toggle important bookmark for current chapter');
  assert.equal(clearCmd.name, 'Charter Pipeline: Clear reading progress & bookmarks for current note');
  assert.equal(resumeCmd.checkCallback(true), false, 'reading commands remain unavailable while the optional feature is off');
  assert.equal(vaultEvents.has('rename'), true, 'the vault rename listener should migrate persisted reading state');

  // Verify command execution
  let prevCalled = false;
  let nextCalled = false;
  let paletteCalled = false;
  let resumeCalled = false;
  const toggledMarkers = [];
  let cleared = false;
  plugin.jumpToPreviousChapter = () => { prevCalled = true; };
  plugin.jumpToNextChapter = () => { nextCalled = true; };
  plugin.openChapterPalette = () => { paletteCalled = true; };
  plugin.resumeLastChapter = () => { resumeCalled = true; };
  plugin.toggleCurrentChapterMarker = (markerName) => { toggledMarkers.push(markerName); };
  plugin.clearReadingBookmarks = () => { cleared = true; };

  assert.equal(prevCmd.checkCallback(true), true);
  prevCmd.checkCallback(false);
  assert.equal(prevCalled, true);

  assert.equal(nextCmd.checkCallback(true), true);
  nextCmd.checkCallback(false);
  assert.equal(nextCalled, true);

  assert.equal(paletteCmd.checkCallback(true), true);
  paletteCmd.checkCallback(false);
  assert.equal(paletteCalled, true);

  plugin.settings.readingBookmarksEnabled = true;
  assert.equal(resumeCmd.checkCallback(true), true);
  resumeCmd.checkCallback(false);
  assert.equal(resumeCalled, true);

  revisitCmd.checkCallback(false);
  importantCmd.checkCallback(false);
  clearCmd.checkCallback(false);
  assert.deepEqual(toggledMarkers, ['revisit', 'important']);
  assert.equal(cleared, true);
});

test('right docking applies dock-right class, calculates right gutter scaling, and flips tooltip positioning', async () => {
  const harness = createReadingHarness();
  const { container, view } = harness;
  harness.plugin.settings.dockPosition = 'right';

  // Add sizer with specific left and right margins inside container
  container.rect = { left: 0, right: 1000, top: 0, height: 800 };
  container.clientWidth = 1000;
  container.append(new FakeElement({
    classes: ['markdown-preview-sizer'],
    rect: { left: 150, right: 880, top: 0, height: 800 }
  }));

  await harness.plugin.attachStepperToView(view);

  const stepperContainer = container.querySelector('.codex-stepper-container');
  assert.ok(stepperContainer, 'stepper container should exist');
  assert.ok(stepperContainer.classList.contains('dock-right'), 'stepper container should have dock-right class');

  // Gutter is 1000 - 880 = 120px.
  // h1Width = Math.max(16, Math.min(38, Math.round(120 * 0.35))) = 38px.
  assert.equal(stepperContainer.style.values.get('--dash-w1'), '38px');

  // Test tooltip positioning on right-dock
  const dashItems = container.querySelectorAll('.codex-dash-item');
  assert.ok(dashItems.length > 0);
  dashItems[0].rect = { left: 960, right: 990, top: 200, height: 20 };

  dashItems[0].dispatch('mouseenter');
  const tooltip = global.document.body.querySelector('.codex-floating-tooltip');
  assert.ok(tooltip, 'tooltip should exist');
  assert.ok(tooltip.classList.contains('dock-right'), 'tooltip should have dock-right class');
  // leftX = Math.max(10, 960 - 290 - 12) = 658
  assert.equal(tooltip.style.values.get('left'), '658px');
  assert.equal(tooltip.style.values.get('top'), '210px');
});

test('left docking applies left gutter scaling and normal tooltip positioning', async () => {
  const harness = createReadingHarness();
  const { container, view } = harness;
  harness.plugin.settings.dockPosition = 'left';

  container.rect = { left: 0, right: 1000, top: 0, height: 800 };
  container.clientWidth = 1000;
  container.append(new FakeElement({
    classes: ['markdown-preview-sizer'],
    rect: { left: 120, right: 850, top: 0, height: 800 }
  }));

  await harness.plugin.attachStepperToView(view);

  const stepperContainer = container.querySelector('.codex-stepper-container');
  assert.ok(stepperContainer);
  assert.equal(stepperContainer.classList.contains('dock-right'), false);

  // Gutter is 120 - 0 = 120px -> 38px
  assert.equal(stepperContainer.style.values.get('--dash-w1'), '38px');

  const dashItems = container.querySelectorAll('.codex-dash-item');
  dashItems[0].rect = { left: 10, right: 40, top: 200, height: 20 };
  dashItems[0].dispatch('mouseenter');
  const tooltip = global.document.body.querySelector('.codex-floating-tooltip');
  assert.ok(tooltip);
  assert.equal(tooltip.classList.contains('dock-right'), false);
  // leftX = Math.min(1200 - 290 - 10, 40 + 12) = 52
  assert.equal(tooltip.style.values.get('left'), '52px');
});

test('showProgressRail creates vertical rail and indicator when enabled', async () => {
  const harness = createReadingHarness();
  const { container, plugin, view } = harness;
  plugin.settings.showProgressRail = true;

  await plugin.attachStepperToView(view);

  const track = container.querySelector('.codex-stepper-track');
  assert.ok(track, 'stepper track should exist');

  const rail = track.querySelector('.codex-progress-rail');
  assert.ok(rail, '.codex-progress-rail should exist inside track');

  const indicator = rail.querySelector('.codex-progress-indicator');
  assert.ok(indicator, '.codex-progress-indicator should exist inside rail');
  assert.equal(indicator.style.values.get('height'), '0%');
});

test('showProgressRail does not create rail when disabled', async () => {
  const harness = createReadingHarness();
  const { container, plugin, scroller, view } = harness;
  plugin.settings.showProgressRail = false;

  await plugin.attachStepperToView(view);

  const track = container.querySelector('.codex-stepper-track');
  assert.ok(track, 'stepper track should exist');
  assert.equal(track.querySelector('.codex-progress-rail'), null);
  assert.equal(track.querySelector('.codex-progress-indicator'), null);

  // Verify scrolling and clicking work without errors when rail is disabled
  scroller.scrollTop = 300;
  scroller.dispatch('scroll');
  const dashes = container.querySelectorAll('.codex-dash-item');
  assert.equal(dashes.length, 2);
  dashes[1].dispatch('click');
});

test('progress rail indicator updates smoothly on scroll and chapter click', async () => {
  const harness = createReadingHarness();
  const { container, plugin, scroller, view } = harness;
  plugin.settings.showProgressRail = true;

  await plugin.attachStepperToView(view);

  const indicator = container.querySelector('.codex-progress-indicator');
  assert.ok(indicator);
  assert.equal(indicator.style.values.get('height'), '0%');

  // Scroll to second chapter (H2 at line 4)
  scroller.scrollTop = 300;
  scroller.dispatch('scroll');
  assert.equal(indicator.style.values.get('height'), '100%');

  // Scroll back to top
  scroller.scrollTop = 0;
  scroller.dispatch('scroll');
  assert.equal(indicator.style.values.get('height'), '0%');

  // Click on second chapter
  const dashes = container.querySelectorAll('.codex-dash-item');
  dashes[1].dispatch('click');
  assert.equal(indicator.style.values.get('height'), '100%');

  // Click back on first chapter
  dashes[0].dispatch('click');
  assert.equal(indicator.style.values.get('height'), '0%');
});

test('progress rail handles single chapter and custom offset measurements gracefully', async () => {
  const harness = createReadingHarness();
  const { app, container, plugin, view } = harness;
  plugin.settings.showProgressRail = true;

  // Single chapter test
  app.metadataCache.getFileCache = () => ({
    headings: [{ heading: 'Single Chapter', level: 1, position: { start: { line: 0 } } }]
  });
  app.vault.cachedRead = async () => '# Single Chapter\nContent';

  await plugin.attachStepperToView(view);

  const indicator = container.querySelector('.codex-progress-indicator');
  assert.ok(indicator);
  assert.equal(indicator.style.values.get('height'), '100%');
});

test('hierarchyMode "all" keeps all headings visible without .is-collapsed', async () => {
  const harness = createReadingHarness();
  const { app, container, plugin, scroller, view } = harness;
  plugin.settings.hierarchyMode = 'all';

  app.metadataCache.getFileCache = () => ({
    headings: [
      { heading: 'H1 Chapter 1', level: 1, position: { start: { line: 0 } } },
      { heading: 'H2 Section 1.1', level: 2, position: { start: { line: 4 } } },
      { heading: 'H3 Topic 1.1.1', level: 3, position: { start: { line: 8 } } },
      { heading: 'H4 Detail 1.1.1.a', level: 4, position: { start: { line: 12 } } },
      { heading: 'H2 Section 1.2', level: 2, position: { start: { line: 16 } } },
      { heading: 'H3 Topic 1.2.1', level: 3, position: { start: { line: 20 } } },
    ]
  });
  app.vault.cachedRead = async () => '# H1\n## H2\n### H3\n#### H4\n## H2-2\n### H3-2';

  await plugin.attachStepperToView(view);

  const stepperContainer = container.querySelector('.codex-stepper-container');
  const track = container.querySelector('.codex-stepper-track');
  assert.ok(stepperContainer.classList.contains('hierarchy-mode-all'), 'container should have hierarchy-mode-all class');
  assert.ok(track.classList.contains('hierarchy-mode-all'), 'track should have hierarchy-mode-all class');

  const dashes = container.querySelectorAll('.codex-dash-item');
  assert.equal(dashes.length, 6);

  dashes.forEach((dash, i) => {
    assert.equal(dash.classList.contains('is-collapsed'), false, `item ${i} should NOT be collapsed in 'all' mode`);
  });

  // Scroll across chapters
  scroller.scrollTop = 300;
  scroller.dispatch('scroll');
  dashes.forEach((dash, i) => {
    assert.equal(dash.classList.contains('is-collapsed'), false, `item ${i} should NOT be collapsed after scroll in 'all' mode`);
  });
});

test('hierarchyMode "hover-expand" collapses H3-H6 items with .is-collapsed and applies hierarchy-mode-hover-expand class', async () => {
  const harness = createReadingHarness();
  const { app, container, plugin, scroller, view } = harness;
  plugin.settings.hierarchyMode = 'hover-expand';

  app.metadataCache.getFileCache = () => ({
    headings: [
      { heading: 'H1 Chapter 1', level: 1, position: { start: { line: 0 } } },
      { heading: 'H2 Section 1.1', level: 2, position: { start: { line: 4 } } },
      { heading: 'H3 Topic 1.1.1', level: 3, position: { start: { line: 8 } } },
      { heading: 'H4 Detail 1.1.1.a', level: 4, position: { start: { line: 12 } } },
      { heading: 'H2 Section 1.2', level: 2, position: { start: { line: 16 } } },
      { heading: 'H3 Topic 1.2.1', level: 3, position: { start: { line: 20 } } },
    ]
  });
  app.vault.cachedRead = async () => '# H1\n## H2\n### H3\n#### H4\n## H2-2\n### H3-2';

  await plugin.attachStepperToView(view);

  const stepperContainer = container.querySelector('.codex-stepper-container');
  const track = container.querySelector('.codex-stepper-track');
  assert.ok(stepperContainer.classList.contains('hierarchy-mode-hover-expand'), 'container should have hierarchy-mode-hover-expand class');
  assert.ok(track.classList.contains('hierarchy-mode-hover-expand'), 'track should have hierarchy-mode-hover-expand class');

  const dashes = container.querySelectorAll('.codex-dash-item');
  assert.equal(dashes.length, 6);

  // H1 and H2 should NOT be collapsed
  assert.equal(dashes[0].classList.contains('is-collapsed'), false, 'H1 should not be collapsed');
  assert.equal(dashes[1].classList.contains('is-collapsed'), false, 'H2 (index 1) should not be collapsed');
  assert.equal(dashes[4].classList.contains('is-collapsed'), false, 'H2 (index 4) should not be collapsed');

  // H3 and H4 MUST be collapsed
  assert.equal(dashes[2].classList.contains('is-collapsed'), true, 'H3 (index 2) should be collapsed');
  assert.equal(dashes[3].classList.contains('is-collapsed'), true, 'H4 (index 3) should be collapsed');
  assert.equal(dashes[5].classList.contains('is-collapsed'), true, 'H3 (index 5) should be collapsed');

  // Scrolling should maintain collapsed state in hover-expand mode
  scroller.scrollTop = 400;
  scroller.dispatch('scroll');
  assert.equal(dashes[2].classList.contains('is-collapsed'), true);
  assert.equal(dashes[3].classList.contains('is-collapsed'), true);
  assert.equal(dashes[5].classList.contains('is-collapsed'), true);
});

test('hierarchyMode "active-branch" dynamically expands current branch subheadings and collapses others on scroll and click', async () => {
  const harness = createReadingHarness();
  const { app, container, plugin, scroller, view } = harness;
  plugin.settings.hierarchyMode = 'active-branch';

  const chapters = [
    { heading: 'H1 Main', level: 1, position: { start: { line: 0 } } },
    { heading: 'H2 Section 1', level: 2, position: { start: { line: 4 } } },
    { heading: 'H3 Sub 1.1', level: 3, position: { start: { line: 8 } } },
    { heading: 'H4 Sub 1.1.1', level: 4, position: { start: { line: 12 } } },
    { heading: 'H2 Section 2', level: 2, position: { start: { line: 16 } } },
    { heading: 'H3 Sub 2.1', level: 3, position: { start: { line: 20 } } },
  ];

  app.metadataCache.getFileCache = () => ({ headings: chapters });
  app.vault.cachedRead = async () => chapters.map(c => '#'.repeat(c.level) + ' ' + c.heading).join('\n');

  scroller.empty();
  chapters.forEach((c) => {
    scroller.append(new FakeElement({
      tagName: `h${c.level}`,
      rect: { top: 100 + c.position.start.line * 20, left: 300, right: 900, height: 30 },
      attributes: { 'data-line': String(c.position.start.line) },
      scrollParent: scroller
    }));
  });

  await plugin.attachStepperToView(view);

  const stepperContainer = container.querySelector('.codex-stepper-container');
  assert.ok(stepperContainer.classList.contains('hierarchy-mode-active-branch'));

  const dashes = container.querySelectorAll('.codex-dash-item');
  assert.equal(dashes.length, 6);

  // Initial state (active item is 0 / H1 Main):
  // H1 and H2s are visible.
  assert.equal(dashes[0].classList.contains('is-collapsed'), false, 'H1 visible');
  assert.equal(dashes[1].classList.contains('is-collapsed'), false, 'H2 Sec 1 visible');
  assert.equal(dashes[4].classList.contains('is-collapsed'), false, 'H2 Sec 2 visible');

  // Subheadings under H2 Sec 1 and H2 Sec 2 should be collapsed when at H1
  assert.equal(dashes[2].classList.contains('is-collapsed'), true, 'H3 Sub 1.1 collapsed initially');
  assert.equal(dashes[3].classList.contains('is-collapsed'), true, 'H4 Sub 1.1.1 collapsed initially');
  assert.equal(dashes[5].classList.contains('is-collapsed'), true, 'H3 Sub 2.1 collapsed initially');

  // 1. Test Scrolling to line 8 (H3 Sub 1.1)
  scroller.scrollTop = 8 * 20; // 160
  scroller.dispatch('scroll');
  assert.equal(dashes[2].classList.contains('is-collapsed'), false, 'H3 Sub 1.1 expanded after scroll to line 8');
  assert.equal(dashes[3].classList.contains('is-collapsed'), false, 'H4 Sub 1.1.1 expanded after scroll to line 8');
  assert.equal(dashes[5].classList.contains('is-collapsed'), true, 'H3 Sub 2.1 collapsed after scroll to line 8');

  // 2. Test Scrolling to line 20 (H3 Sub 2.1)
  scroller.scrollTop = 20 * 20; // 400
  scroller.dispatch('scroll');
  assert.equal(dashes[2].classList.contains('is-collapsed'), true, 'H3 Sub 1.1 collapsed after scroll to line 20');
  assert.equal(dashes[3].classList.contains('is-collapsed'), true, 'H4 Sub 1.1.1 collapsed after scroll to line 20');
  assert.equal(dashes[5].classList.contains('is-collapsed'), false, 'H3 Sub 2.1 expanded after scroll to line 20');

  // 3. Test Clicking on H2 Section 1 (index 1)
  dashes[1].dispatch('click');
  assert.equal(dashes[2].classList.contains('is-collapsed'), false, 'H3 Sub 1.1 expanded when in Sec 1');
  assert.equal(dashes[3].classList.contains('is-collapsed'), false, 'H4 Sub 1.1.1 expanded when in Sec 1');
  assert.equal(dashes[5].classList.contains('is-collapsed'), true, 'H3 Sub 2.1 stays collapsed');

  // 4. Test Clicking on H4 Sub 1.1.1 (index 3)
  dashes[3].dispatch('click');
  assert.equal(dashes[2].classList.contains('is-collapsed'), false, 'H3 Sub 1.1 stays expanded');
  assert.equal(dashes[3].classList.contains('is-collapsed'), false, 'H4 Sub 1.1.1 stays expanded');
  assert.equal(dashes[5].classList.contains('is-collapsed'), true, 'H3 Sub 2.1 stays collapsed');

  // 5. Test Clicking on H2 Section 2 (index 4)
  dashes[4].dispatch('click');
  assert.equal(dashes[2].classList.contains('is-collapsed'), true, 'H3 Sub 1.1 collapsed when Sec 2 active');
  assert.equal(dashes[3].classList.contains('is-collapsed'), true, 'H4 Sub 1.1.1 collapsed when Sec 2 active');
  assert.equal(dashes[5].classList.contains('is-collapsed'), false, 'H3 Sub 2.1 expanded when Sec 2 active');
});

test('updateHierarchyFolding handles direct H3s under H1 and standalone deep headings', () => {
  const ChapterPipelinePlugin = require('./main.js');
  const updateHierarchyFolding = ChapterPipelinePlugin.updateHierarchyFolding;
  assert.ok(typeof updateHierarchyFolding === 'function', 'updateHierarchyFolding helper should exist');

  const chapters = [
    { title: 'H1 Main', level: 1 },
    { title: 'H3 Direct Child', level: 3 },
    { title: 'H3 Another Direct', level: 3 },
    { title: 'H1 Second', level: 1 },
    { title: 'H3 Under Second', level: 3 }
  ];

  const createMockElements = () => chapters.map(() => new FakeElement({ classes: ['codex-dash-item'] }));

  // Test active-branch with activeIdx = 0 (H1 Main)
  let dashEls = createMockElements();
  updateHierarchyFolding(chapters, dashEls, 0, 'active-branch');
  assert.equal(dashEls[0].classList.contains('is-collapsed'), false);
  assert.equal(dashEls[1].classList.contains('is-collapsed'), false, 'direct H3 under H1 Main should expand');
  assert.equal(dashEls[2].classList.contains('is-collapsed'), false, 'direct H3 under H1 Main should expand');
  assert.equal(dashEls[3].classList.contains('is-collapsed'), false);
  assert.equal(dashEls[4].classList.contains('is-collapsed'), true, 'H3 under second H1 should collapse');

  // Test active-branch with activeIdx = 4 (H3 Under Second)
  dashEls = createMockElements();
  updateHierarchyFolding(chapters, dashEls, 4, 'active-branch');
  assert.equal(dashEls[1].classList.contains('is-collapsed'), true, 'H3 under first H1 should collapse');
  assert.equal(dashEls[2].classList.contains('is-collapsed'), true, 'H3 under first H1 should collapse');
  assert.equal(dashEls[4].classList.contains('is-collapsed'), false, 'H3 under second H1 should expand');
});

test('tooltipGlassmorphism setting toggles .is-solid class on floating tooltip', async () => {
  const harness = createReadingHarness();
  const { container, plugin, view } = harness;

  // Case 1: Default tooltipGlassmorphism = true -> should not have is-solid
  plugin.settings.tooltipGlassmorphism = true;
  await plugin.attachStepperToView(view);

  let tooltip = global.document.body.querySelector('.codex-floating-tooltip');
  assert.ok(tooltip, 'tooltip should exist in DOM');
  assert.equal(tooltip.classList.contains('is-solid'), false, 'should not have is-solid when glassmorphism enabled');

  const dashes = container.querySelectorAll('.codex-dash-item');
  dashes[0].dispatch('mouseenter');
  assert.equal(tooltip.classList.contains('is-solid'), false, 'should not have is-solid on mouseenter when glassmorphism enabled');

  // Case 2: tooltipGlassmorphism = false -> should have is-solid
  plugin.settings.tooltipGlassmorphism = false;
  await plugin.attachStepperToView(view);

  tooltip = global.document.body.querySelector('.codex-floating-tooltip');
  assert.ok(tooltip, 'new tooltip should exist');
  assert.equal(tooltip.classList.contains('is-solid'), true, 'should have is-solid when glassmorphism disabled');

  const newDashes = container.querySelectorAll('.codex-dash-item');
  newDashes[0].dispatch('mouseenter');
  assert.equal(tooltip.classList.contains('is-solid'), true, 'should keep is-solid on mouseenter when glassmorphism disabled');
});

test('narrow viewport toggles .is-narrow on stepper container and resets tooltip visibility without display:none', async () => {
  const harness = createReadingHarness();
  const { container, plugin, view } = harness;
  plugin.settings.narrowThreshold = 600;

  // Set narrow width (< 380px threshold)
  container.clientWidth = 320;
  await plugin.attachStepperToView(view);

  const stepperContainer = container.querySelector('.codex-stepper-container');
  assert.ok(stepperContainer, 'stepper container should exist');
  assert.equal(stepperContainer.classList.contains('is-narrow'), true, 'stepper should have is-narrow class');

  const tooltip = global.document.body.querySelector('.codex-floating-tooltip');
  assert.ok(tooltip);
  assert.equal(tooltip.classList.contains('is-visible'), false, 'tooltip should not be visible when narrow');

  // Expand container width back to normal (> 380px)
  container.clientWidth = 900;
  // Trigger updateGutterDimensions via re-attaching or observer
  await plugin.attachStepperToView(view);
  const updatedStepper = container.querySelector('.codex-stepper-container');
  assert.equal(updatedStepper.classList.contains('is-narrow'), false, 'is-narrow should be removed when container expands');
});

test('ChapterSuggestModal applies .codex-suggest-modal class to modalEl and renders .codex-modal-item', () => {
  const { app, plugin, view } = createReadingHarness();
  const ChapterSuggestModal = ChapterPipelinePlugin.ChapterSuggestModal;
  assert.ok(ChapterSuggestModal);

  const chapters = [
    { title: 'Chapter 1', level: 1, line: 0, summaryMarkdown: 'First line excerpt' }
  ];

  const modal = new ChapterSuggestModal(app, plugin, view, chapters);
  assert.ok(modal.modalEl, 'modalEl should exist');
  assert.equal(modal.modalEl.classList.contains('codex-suggest-modal'), true, 'modalEl should have codex-suggest-modal class');

  const el = new FakeElement();
  modal.renderSuggestion(chapters[0], el);
  assert.equal(el.classList.contains('codex-suggest-item'), true, 'suggestion should have codex-suggest-item class');
  assert.equal(el.classList.contains('codex-modal-item'), true, 'suggestion should have codex-modal-item class');
});

test('vertical density scales gap, padding, and min-height when chapter count is large to prevent overflow', async () => {
  const harness = createReadingHarness();
  const { app, container, plugin, view } = harness;
  container.clientHeight = 500; // Constrained view height

  // Create 40 headings
  const headings = [];
  for (let i = 0; i < 40; i++) {
    headings.push({ heading: `Heading ${i + 1}`, level: (i % 2 === 0 ? 1 : 2), position: { start: { line: i * 5 } } });
  }
  app.metadataCache.getFileCache = () => ({ headings });
  plugin.settings.maxHeadingLevel = 6;

  await plugin.attachStepperToView(view);

  const stepperContainer = container.querySelector('.codex-stepper-container');
  assert.ok(stepperContainer);
  const gapStr = stepperContainer.style.getPropertyValue('--dash-item-gap');
  const paddingYStr = stepperContainer.style.getPropertyValue('--dash-item-padding-y');
  assert.ok(gapStr, 'gap variable should be defined');
  assert.ok(paddingYStr, 'padding-y variable should be defined');
  assert.ok(parseFloat(gapStr) <= 3, 'gap should be compressed for large count');
  assert.ok(parseFloat(paddingYStr) <= 2.5, 'padding-y should be compressed for large count');
});

test('tooltip mouseenter clamps vertical center within viewport bounds', async () => {
  const harness = createReadingHarness();
  const { plugin, view, container } = harness;
  global.window = { innerWidth: 1200, innerHeight: 600 };

  await plugin.attachStepperToView(view);

  const dashItems = container.querySelectorAll('.codex-dash-item');
  assert.ok(dashItems.length > 0);
  const tooltip = global.document.body.querySelector('.codex-floating-tooltip');
  assert.ok(tooltip);

  // Simulate item near top edge (top: -50px)
  dashItems[0].rect = { top: -50, height: 10, left: 20, right: 40 };
  dashItems[0].dispatch('mouseenter');
  const topVal = parseFloat(tooltip.style.top);
  assert.ok(topVal >= 70, `clamped tooltip top (${topVal}px) should not go below top bounds (~70px)`);

  // Simulate item near bottom edge (top: 800px)
  dashItems[0].rect = { top: 800, height: 10, left: 20, right: 40 };
  dashItems[0].dispatch('mouseenter');
  const bottomVal = parseFloat(tooltip.style.top);
  assert.ok(bottomVal <= 530, `clamped tooltip top (${bottomVal}px) should not exceed bottom bounds (~530px)`);
});

test('tooltip and modal escape numbered list headings to keep titles compact', async () => {
  const harness = createReadingHarness();
  const { app, plugin, view, container } = harness;

  app.vault.cachedRead = async () => '# Title\n\n## 1. First Section\nContent 1\n\n### 2.1 Sub Section\nContent 2\n';
  app.metadataCache.getFileCache = () => ({
    headings: [
      { heading: 'Title', level: 1, position: { start: { line: 0 } } },
      { heading: '1. First Section', level: 2, position: { start: { line: 2 } } },
      { heading: '2.1 Sub Section', level: 3, position: { start: { line: 5 } } },
    ],
  });

  await plugin.attachStepperToView(view);

  const dashItems = container.querySelectorAll('.codex-dash-item');
  const tooltip = global.document.body.querySelector('.codex-floating-tooltip');

  assert.ok(dashItems.length >= 3);
  dashItems[1].dispatch('mouseenter');

  const titleEl = tooltip.querySelector('.codex-tooltip-title');
  assert.ok(titleEl);
  assert.equal(titleEl.textContent, '1\\. First Section', 'numbered heading should escape period to prevent <ol> list indentation');
});

test('chapter IDs retain their identity through reordering and distinguish duplicate headings', () => {
  const settings = { minHeadingLevel: 1, maxHeadingLevel: 6, ignoreFirstH1: false, showExcerpt: false };
  const original = ChapterPipelinePlugin.ChapterParser.parse('', [
    { heading: 'Overview', level: 1, position: { start: { line: 0 } } },
    { heading: 'Details', level: 2, position: { start: { line: 2 } } },
    { heading: 'Details', level: 2, position: { start: { line: 4 } } },
  ], settings);
  const reordered = ChapterPipelinePlugin.ChapterParser.parse('', [
    { heading: 'Details', level: 2, position: { start: { line: 0 } } },
    { heading: 'Overview', level: 1, position: { start: { line: 2 } } },
    { heading: 'Details', level: 2, position: { start: { line: 4 } } },
  ], settings);

  assert.equal(original[0].id, 'h1:overview:0');
  assert.equal(original[1].id, 'h2:details:0');
  assert.equal(original[2].id, 'h2:details:1');
  assert.equal(reordered[1].id, 'h1:overview:0');
  assert.equal(reordered[0].id, 'h2:details:0');
});

test('reading state records only active-view chapter changes and resumes the saved chapter', async () => {
  const { plugin, view } = createReadingHarness();
  plugin.settings.readingBookmarksEnabled = true;
  const chapters = await plugin.getChaptersForView(view);
  const backgroundView = new MarkdownView();
  backgroundView.file = { path: 'other.md' };

  plugin.app.workspace.getActiveViewOfType = () => backgroundView;
  assert.equal(plugin.recordReadingPosition(view, chapters[1]), false, 'background views must not overwrite a resume point');

  plugin.app.workspace.getActiveViewOfType = () => view;
  assert.equal(plugin.recordReadingPosition(view, chapters[1]), true);
  const savedResume = plugin.getReadingFileState(view.file, false).resume;
  assert.equal(savedResume.chapterId, chapters[1].id);
  assert.equal(savedResume.title, 'Second');

  let jumpedTo = null;
  plugin.jumpToHeading = (targetView, chapter) => { jumpedTo = { targetView, chapter }; };
  assert.equal(await plugin.resumeLastChapter(view), true);
  assert.deepEqual(jumpedTo, { targetView: view, chapter: chapters[1] });

  clearTimeout(plugin.readingSaveTimer);
  plugin.readingSaveTimer = null;
});

test('saved resume notification is non-blocking, appears once, and preserves the saved point', async () => {
  const { plugin, view } = createReadingHarness();
  plugin.settings.readingBookmarksEnabled = true;
  const chapters = await plugin.getChaptersForView(view);
  const fileState = plugin.getReadingFileState(view.file, true);
  fileState.resume = { chapterId: chapters[1].id, title: chapters[1].title, updatedAt: 12 };
  let jumped = false;
  plugin.jumpToHeading = () => { jumped = true; };

  await plugin.attachStepperToView(view);
  await plugin.attachStepperToView(view);

  assert.equal(Notice.instances.length, 1, 'resume notice should appear once per file per app session');
  assert.equal(Notice.instances[0].message, 'Resume available: Second');
  assert.equal(jumped, false, 'a resume notice must never auto-jump');
  assert.equal(plugin.getReadingFileState(view.file, false).resume.chapterId, chapters[1].id);
});

test('revisit and important bookmarks render shapes, text labels, and context actions', async () => {
  const { container, plugin, view } = createReadingHarness();
  plugin.settings.readingBookmarksEnabled = true;
  const chapters = await plugin.getChaptersForView(view);

  await plugin.toggleChapterMarker(view, chapters[0], 'revisit');
  await plugin.toggleChapterMarker(view, chapters[0], 'important');
  await plugin.attachStepperToView(view);

  const dashItems = container.querySelectorAll('.codex-dash-item');
  assert.equal(dashItems[0].querySelectorAll('.codex-bookmark-marker').length, 2);
  assert.equal(dashItems[0].getAttribute('aria-label'), 'First — Revisit, Important');

  dashItems[0].dispatch('mouseenter');
  const tooltip = global.document.body.querySelector('.codex-floating-tooltip');
  const labels = tooltip.querySelectorAll('.codex-bookmark-label');
  assert.equal(labels.length, 2);
  assert.equal(labels[0].textContent, 'Revisit');
  assert.equal(labels[1].textContent, 'Important');

  dashItems[0].dispatch('contextmenu');
  const menu = Menu.instances.at(-1);
  assert.deepEqual(menu.items.map((item) => item.title), [
    'Remove revisit mark',
    'Remove important mark',
    'Clear chapter bookmarks'
  ]);
  await menu.items[0].clickHandler();
  assert.equal(plugin.getChapterMarkers(view.file, chapters[0]).revisit, false);
  assert.equal(plugin.getChapterMarkers(view.file, chapters[0]).important, true);
});

test('resume command fails safely and clears only an unresolvable resume point', async () => {
  const { plugin, view } = createReadingHarness();
  plugin.settings.readingBookmarksEnabled = true;
  const fileState = plugin.getReadingFileState(view.file, true);
  fileState.resume = { chapterId: 'h2:missing:0', title: 'Missing', updatedAt: 5 };
  fileState.markers['h1:first:0'] = { revisit: true, important: false };
  let jumped = false;
  plugin.jumpToHeading = () => { jumped = true; };

  assert.equal(await plugin.resumeLastChapter(view), false);
  assert.equal(jumped, false);
  assert.equal(fileState.resume, undefined);
  assert.deepEqual(fileState.markers['h1:first:0'], { revisit: true, important: false });
  assert.equal(Notice.instances.at(-1).message, 'The saved chapter is no longer available.');
});

test('renaming a note migrates and merges reading state without losing newer progress', async () => {
  const { plugin } = createReadingHarness();
  plugin.settings.readingState = {
    version: 1,
    files: {
      'old.md': {
        resume: { chapterId: 'h2:source:0', title: 'Source', updatedAt: 20 },
        markers: { 'h1:first:0': { revisit: true, important: false } }
      },
      'new.md': {
        resume: { chapterId: 'h2:target:0', title: 'Target', updatedAt: 10 },
        markers: { 'h1:first:0': { revisit: false, important: true } }
      }
    }
  };

  assert.equal(await plugin.migrateReadingState('old.md', 'new.md'), true);
  assert.equal(plugin.settings.readingState.files['old.md'], undefined);
  const migrated = plugin.settings.readingState.files['new.md'];
  assert.equal(migrated.resume.chapterId, 'h2:source:0');
  assert.deepEqual(migrated.markers['h1:first:0'], { revisit: true, important: true });
});

test('user-facing strings follow Chinese Obsidian language and fall back to English otherwise', async () => {
  const { app, view } = createReadingHarness();
  global.window.localStorage.getItem = () => 'zh-CN';
  app.workspace.on = () => {};
  app.workspace.onLayoutReady = () => {};
  app.metadataCache.on = () => {};
  const plugin = new ChapterPipelinePlugin(app, {});
  await plugin.onload();

  const prevCommand = plugin.commands.find((command) => command.id === 'charter-pipeline-jump-prev');
  const resumeCommand = plugin.commands.find((command) => command.id === 'charter-pipeline-resume-last-chapter');
  assert.equal(prevCommand.name, 'Charter Pipeline：跳转至上一章节');
  assert.equal(resumeCommand.name, 'Charter Pipeline：恢复上次阅读章节');

  plugin.settingTab.display();
  assert.equal(plugin.settingTab.containerEl.children[0].textContent, 'Charter Pipeline 设置');
  const readingSetting = Setting.instances.find((setting) => setting.name === '开启阅读断点与章节书签');
  assert.ok(readingSetting);

  plugin.settings.readingBookmarksEnabled = true;
  const modal = new ChapterPipelinePlugin.ChapterSuggestModal(app, plugin, view, []);
  assert.equal(modal.placeholder, '搜索章节或公式…');
  const chapter = (await plugin.getChaptersForView(view))[0];
  await plugin.toggleChapterMarker(view, chapter, 'revisit');
  await plugin.attachStepperToView(view);
  const firstDash = view.contentEl.querySelectorAll('.codex-dash-item')[0];
  firstDash.dispatch('contextmenu');
  assert.equal(Menu.instances.at(-1).items[0].title, '移除稍后回看标记');

  global.window.localStorage.getItem = () => 'fr-FR';
  const fallbackModal = new ChapterPipelinePlugin.ChapterSuggestModal(app, plugin, view, []);
  assert.equal(fallbackModal.placeholder, 'Search chapter or formula...');
});

test('active color is preserved across dashes, tooltips, and palette with a theme-accent fallback', async () => {
  const { app, container, plugin, view } = createReadingHarness();
  plugin.settings.activeColor = 'var(--interactive-accent)';
  await plugin.attachStepperToView(view);

  const stepper = container.querySelector('.codex-stepper-container');
  const tooltip = global.document.body.querySelector('.codex-floating-tooltip');
  assert.equal(stepper.style.getPropertyValue('--codex-active-color'), 'var(--interactive-accent, #3b82f6)');
  assert.equal(tooltip.style.getPropertyValue('--codex-active-color'), 'var(--interactive-accent, #3b82f6)');

  const modal = new ChapterPipelinePlugin.ChapterSuggestModal(app, plugin, view, []);
  assert.equal(modal.modalEl.style.getPropertyValue('--codex-active-color'), 'var(--interactive-accent, #3b82f6)');
  assert.equal(plugin.resolveActiveColor('#ec4899'), '#ec4899');
});
