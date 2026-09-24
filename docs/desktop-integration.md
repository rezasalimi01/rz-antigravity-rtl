# Antigravity Desktop Integration

This document covers the execution model of `bin/payload.js` within the standalone Electron-based **Antigravity Desktop** application.

---

## 1. Electron Main Process Injection

In Antigravity Desktop, the main window is created and managed inside `dist/utils.js`. The patcher replaces the window's `win.loadURL(url)` call with a combined IPC listener, URL loader, and `dom-ready` injector.

```javascript
/* RZ ANTIGRAVITY RTL PATCH */
win.webContents.on('console-message', (event, ...args) => {
    let message = args.length === 1 && typeof args[0] === 'object' && args[0] !== null
        ? args[0].message
        : args[1];

    if (typeof message === 'string' && message.startsWith('SAVE_RTL_CONFIG|')) {
        try {
            const data = message.substring(16);
            const configPath = require('path').join(require('os').homedir(), '.antigravity-rtl.json');
            require('fs').writeFileSync(configPath, data);
        } catch (e) {}
    }
});

void win.loadURL(url);
```

---

## 2. Configuration Persistence Bridge

Because Electron renderer processes often operate with context isolation enabled, standard renderer `fs` calls are restricted. 

To bridge configuration changes from the renderer UI to the user's filesystem:
1. When a user changes a setting in the floating UI, the browser emits:
   ```javascript
   console.log("SAVE_RTL_CONFIG|" + JSON.stringify(cfg));
   ```
2. The main process intercepts this console message via `win.webContents.on('console-message')`.
3. The configuration is written directly to `~/.antigravity-rtl.json` in the user's home directory.
4. On the next application launch, the main process reads `~/.antigravity-rtl.json` and seeds `rtlConfig` before DOM initialization.

---

## 3. Base64 Font Serialization

Unlike the IDE where font files can be loaded via relative HTTP requests (`./fonts/...`), the Desktop app's renderer pages may be loaded from custom protocols or remote hosts.

To guarantee font loading:
1. During `dom-ready`, Node.js reads all 22 font files from the unpacked ASAR directory into memory:
   ```javascript
   function readFontB64(key, rel) {
       const full = require('path').join(fontsDir, rel);
       if (require('fs').existsSync(full)) {
           fontsB64[key] = require('fs').readFileSync(full).toString('base64');
       }
   }
   ```
2. The Base64 dictionary is stringified and injected into the renderer script.
3. The dynamic `@font-face` rules bind directly to `data:font/woff2;base64,...` sources.
4. This ensures that every offline font renders flawlessly regardless of renderer security policies.
