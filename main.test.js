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

  append(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  createDiv(options = {}) {
    return this.append(this.createChild('div', options));
  }

  createSpan(options = {}) {
    return this.append(this.createChild('span', options));
  }

  createChild(tagName, options) {
    const classes = String(options.cls || '').split(/\s+/).filter(Boolean);
    const child = new FakeElement({ tagName, classes });
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
  }
}

class MarkdownView {}
class PluginSettingTab {}
class Setting {}

const originalLoad = Module._load;
Module._load = function loadWithObsidianStub(request, parent, isMain) {
  if (request === 'obsidian') {
    return {
      Plugin: ObsidianPlugin,
      MarkdownView,
      MarkdownRenderer: { render() {} },
      PluginSettingTab,
      Setting,
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
    narrowThreshold: 460,
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

test('Reading View navigation calls previewMode.applyScroll when heading is not yet mounted in DOM', () => {
  const { plugin, view } = createReadingHarness();
  let appliedScrollLine = null;
  view.currentMode = {
    applyScroll: (line) => { appliedScrollLine = line; }
  };

  plugin.jumpToHeading(view, {
    level: 2,
    title: 'Off-screen Heading',
    rawHeading: 'Off-screen Heading',
    line: 200
  });

  assert.equal(appliedScrollLine, 200);
});
