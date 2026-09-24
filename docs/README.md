# RZ Antigravity RTL — Technical Documentation

Welcome to the technical documentation for **RZ Antigravity RTL**. This guide provides an end-to-end breakdown of how the patcher works, how it safely modifies both Antigravity Desktop and Antigravity IDE, and how the underlying typography and UI engines operate.

---

## 📑 Table of Contents

| Document | Description |
| :--- | :--- |
| [**Architecture Overview**](./architecture.md) | High-level system architecture, dual-app patching pipeline, injection anchors, and safety/backup mechanisms. |
| [**Antigravity IDE Integration**](./ide-integration.md) | Deep dive into the IDE workbench (`workbench.html`), Content Security Policy (CSP) bypass, and strict Monaco editor isolation. |
| [**Antigravity Desktop Integration**](./desktop-integration.md) | Deep dive into the Desktop app, Electron ASAR unpacking and repacking, `dist/utils.js`, and IPC bridge. |
| [**UI System & Micro-Animations**](./ui-system.md) | The Volt Lime (`#D0FE1B`) design system, custom animated spring dropdowns, 4-corner snap mathematics, and debounce pulse animations. |
| [**Typography & Offline Fonts**](./typography-fonts.md) | Curated 22 offline webfonts, unicode-range subsetting, automatic RTL/LTR detection algorithm, and Persian keyboard remap. |

---

## 🛠️ Project Directory Layout

```
RZ Antigravity RTL/
├── bin/
│   ├── fonts/                       # 22 Curated offline webfonts
│   │   ├── code/                    # FiraCode, JetBrainsMono (woff2)
│   │   ├── english/                 # OpenSans, Roboto, FiraSans (ttf)
│   │   └── persian/                 # IRANSansX, IRANYekanX, Kalameh, Noora, Pelak, Ravi, YekanBakh (woff2)
│   ├── ide-payload.js               # Injected script specifically tailored for Antigravity IDE
│   ├── index.js                     # CLI executable entrypoint (npx runner & patcher)
│   ├── payload.js                   # Injected script tailored for Antigravity Desktop (Electron ASAR)
│   └── Vazirmatn-Variable.woff2     # Default fallback Persian variable font
├── docs/                            # In-depth architectural & developer documentation
│   ├── README.md                    # Documentation index (this file)
│   ├── architecture.md              # System design & patching flow
│   ├── ide-integration.md           # Antigravity IDE workbench integration & Monaco isolation
│   ├── desktop-integration.md       # Antigravity Desktop ASAR repacking & IPC bridge
│   ├── ui-system.md                 # UI design, spring dropdowns, and snap math
│   └── typography-fonts.md          # Typography engine & unicode heuristics
├── package.json                     # NPM package configuration
└── README.md                        # User-facing manual and quick start guide
```

---

## 🎯 Guiding Design Principles

1. **Zero External Dependencies at Runtime**:
   Both Antigravity Desktop and Antigravity IDE run in strictly firewalled, corporate, or offline environments. All 22 fonts, icons, styles, and logic are 100% self-contained and bundled offline.
2. **Strict Monaco Editor Isolation**:
   Coding requires strictly Left-to-Right (LTR) alignment and monospace rendering. Under no circumstances should any code editor tab, terminal, tree view, or code block (`<pre>`, `<code>`) be flipped or styled with RTL typography.
3. **Non-Destructive Patching**:
   Original binaries and HTML files are automatically backed up prior to modification (`.bak` files). The patcher can fully revert any changes at any time with `npx rz-antigravity-rtl --restore`.
