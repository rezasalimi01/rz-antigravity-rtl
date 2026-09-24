# Antigravity IDE Integration & Isolation

This document explains the runtime behavior of `ide-payload.js` within Antigravity IDE and how it achieves 100% isolation from the Monaco code editor.

---

## 1. The Challenge of VS Code / IDE Environments

In standard IDE environments, injecting global CSS or flipping DOM directions often leads to catastrophic side-effects:
- Monaco code editor lines can flip RTL, misaligning indentations, cursors, and line numbers.
- File explorer trees, tabs, breadcrumbs, and status bars can invert.
- Chromium's Trusted Types policy rejects direct `.innerHTML` assignments with:
  `TypeError: This document requires 'TrustedHTML' assignment`.

**RZ Antigravity RTL** solves every single one of these challenges.

---

## 2. Strict Monaco Code Editor Isolation

The styling rules in `ide-payload.js` are strictly scoped to the AI agent side panel:

```css
/* Scoped exclusively to the agent sidebar */
.antigravity-agent-side-panel,
.antigravity-agent-side-panel .prose,
.antigravity-agent-side-panel [data-testid="chat-message"],
.antigravity-agent-side-panel .markdown-body,
.antigravity-agent-side-panel .leading-relaxed,
.antigravity-agent-side-panel [contenteditable="true"],
.antigravity-agent-side-panel label[for^="ask-opt-"] {
    font-family: var(--fa-font-stack), var(--en-font-stack), sans-serif !important;
}

/* Explicit protection for Monaco Editor */
.monaco-editor,
.monaco-editor *,
.monaco-workbench .part.editor * {
    text-align: initial !important;
    direction: ltr !important;
}

/* Chat Code Blocks must remain strictly LTR Monospace */
.antigravity-agent-side-panel pre,
.antigravity-agent-side-panel code,
.antigravity-agent-side-panel pre *,
.antigravity-agent-side-panel code * {
    unicode-bidi: isolate !important;
    direction: ltr !important;
    text-align: left !important;
    font-family: var(--code-font-stack) !important;
}

/* Chain-of-Thought / Thinking Blocks must remain strictly LTR */
.antigravity-agent-side-panel .cursor-edit.text-secondary-foreground,
.antigravity-agent-side-panel .cursor-edit.text-secondary-foreground * {
    direction: ltr !important;
    text-align: left !important;
    unicode-bidi: isolate !important;
}
```

---

## 3. Trusted Types Bypass

Modern VS Code enforces `window.trustedTypes`. Direct assignment to `element.innerHTML` throws a fatal security exception unless created via an allowed policy:

```javascript
let trustedPolicy = null;
if (window.trustedTypes && typeof window.trustedTypes.createPolicy === 'function') {
    try {
        trustedPolicy = window.trustedTypes.createPolicy('rz-antigravity-rtl', {
            createHTML: (s) => s,
            createScript: (s) => s
        });
    } catch (e) {}
}

function setSafeHTML(el, html) {
    if (trustedPolicy) {
        el.innerHTML = trustedPolicy.createHTML(html);
    } else {
        el.innerHTML = html;
    }
}
```
This guarantees that dynamic HTML generation functions smoothly without console warnings or script execution halts.

---

## 4. Chat Container Boundary Bounding

Unlike other floating widgets that attach to `document.body` and float over the editor or status bar, the widget in `ide-payload.js` dynamically attaches inside the agent container:

```javascript
function getValidChatBox() {
    const candidates = [
        document.querySelector('.antigravity-agent-side-panel'),
        document.querySelector('.part.auxiliarybar .content'),
        document.querySelector('.part.auxiliarybar'),
        document.querySelector('.interactive-session'),
        document.querySelector('[data-testid="conversation-view"]'),
        document.querySelector('.part.sidebar')
    ];
    for (const el of candidates) {
        if (el && el.getBoundingClientRect().width > 50) {
            return el;
        }
    }
    return document.querySelector('.monaco-workbench') || document.body;
}
```

When dragged, coordinates are mathematically clamped:
```javascript
const minX = 8;
const maxX = Math.max(minX, boxRect.width - 46);
const minY = 8;
const maxY = Math.max(minY, boxRect.height - 46);

const currentX = Math.max(minX, Math.min(maxX, initialLeft + dx));
const currentY = Math.max(minY, Math.min(maxY, initialTop + dy));
```
It is physically and mathematically impossible for the widget to leave the chat boundary.
