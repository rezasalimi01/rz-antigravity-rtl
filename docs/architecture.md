# Architecture Overview

This document details the architectural design and execution flow of the **RZ Antigravity RTL Patcher**.

---

## 1. Dual-Target Strategy

Antigravity exists in two distinct software distributions:
1. **Antigravity Desktop App**: A standalone Electron application running Google DeepMind's agentic workspace UI inside an Electron BrowserView / BrowserWindow.
2. **Antigravity IDE**: A customized fork of Visual Studio Code (Code-OSS) with deeply integrated agent sidebars and chat experiences.

Because their internal architectures differ fundamentally, **RZ Antigravity RTL** employs a dual-pipeline strategy:

```
                          ┌───────────────────────────┐
                          │   npx rz-antigravity-rtl   │
                          └─────────────┬─────────────┘
                                        │
                         [Platform Detection & Prompt]
                                        │
                  ┌─────────────────────┴─────────────────────┐
                  ▼                                           ▼
      ┌───────────────────────┐                   ┌───────────────────────┐
      │   patchDesktop()      │                   │      patchIDE()       │
      ├───────────────────────┤                   ├───────────────────────┤
      │ • Backup app.asar     │                   │ • Backup workbench    │
      │ • Extract ASAR        │                   │ • Patch CSP in HTML   │
      │ • Inject payload.js   │                   │ • Copy ide-payload.js │
      │ • Bundle font files   │                   │ • Copy 22 font assets │
      │ • Repack app.asar     │                   │ • Clean script tags   │
      └───────────────────────┘                   └───────────────────────┘
```

---

## 2. Desktop Patching Pipeline (`patchDesktop`)

The Desktop distribution bundles its main-process and preload logic inside an Electron archive (`app.asar`), typically located at:
- **Windows**: `%LOCALAPPDATA%\Programs\Antigravity\resources\app.asar`
- **macOS**: `/Applications/Antigravity.app/Contents/Resources/app.asar`
- **Linux**: `/opt/Antigravity/resources/app.asar`

### Execution Steps:
1. **Pre-flight Conflict Resolution**: Scans global NPM packages (`cleanupConflictingGlobalPackages`) and uninstalls any conflicting packages (like legacy `antigravity-rtl`).
2. **Backup Verification**: Creates `app.asar.bak` if not present. If a backup already exists, it is restored first to ensure clean state.
3. **ASAR Extraction**: Unpacks `app.asar` into a temporary directory using `@electron/asar`.
4. **Anchor Cleaning & Injection in `dist/utils.js`**:
   The patcher scans `dist/utils.js` and purges ANY previous RTL patches (original `/* ANTIGRAVITY RTL PATCH */`, older RZ blocks, or third-party hooks) via `purgePreviousRtlPatchesFromUtils`, ensuring a clean baseline. It then locates the URL load anchor:
   ```javascript
   void win.loadURL(url);
   ```
   and replaces it with `bin/payload.js`.
5. **DevTools Activation**: Replaces `devTools: !app.isPackaged` with `devTools: true` to enable developer inspect tools.
6. **Asset Injection**: Copies `Vazirmatn-Variable.woff2` and the `bin/fonts/` tree into `dist/fonts/`.
7. **ASAR Repack**: Reconstructs `app.asar` atomically and removes the temporary extraction directory.

---

## 3. IDE Patching Pipeline (`patchIDE`)

Antigravity IDE runs a VS Code architecture. The workbench files reside in:
- **Path**: `%LOCALAPPDATA%\Programs\Antigravity IDE\resources\app\out\vs\code\electron-browser\workbench`
- Target HTML files: `workbench.html` and `workbench-jetski-agent.html`.

### Execution Steps:
1. **Backups**: Creates `.original.bak` backups for both HTML entrypoints.
2. **Legacy File & Tag Removal**:
   - Removes obsolete files from previous RTL tools (`payload.js`, `rtl.js`, `rtl.css`).
   - Purges any previous RTL script/link tags and comments from all workbench HTML files.
3. **Payload & Font Placement**:
   - Copies `bin/ide-payload.js` directly into `workbench/ide-payload.js`.
   - Recursively copies `bin/fonts/` into `workbench/fonts/`.
   - Copies `Vazirmatn-Variable.woff2` into `workbench/`.
4. **Content Security Policy (CSP) Bypass**:
   VS Code enforces strict CSP rules that block inline scripts, local fonts, and untrusted DOM mutations:
   - Removes `require-trusted-types-for` and `trusted-types` directives.
   - Appends `data:` and `'self'` to the `font-src` directive.
   - Appends `'unsafe-inline'` to the `script-src` directive.
5. **Script Tag Injection**:
   Injects:
   ```html
   <!-- RZ ANTIGRAVITY RTL -->
   <script src="./ide-payload.js"></script>
   ```
   immediately before `</body>`.

---

## 4. Safety & Rollback Guarantee

The patcher includes built-in disaster recovery:
```bash
npx rz-antigravity-rtl --restore
```
- Replaces patched `app.asar` with `app.asar.bak`.
- Restores original `workbench.html` and `workbench-jetski-agent.html` from `.bak` backups.
- Cleans up `ide-payload.js` and injected font directories.
