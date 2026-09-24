/* RZ ANTIGRAVITY RTL PATCH */
win.webContents.on('console-message', (event, ...args) => {
    let message = '';
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
        message = args[0].message;
    } else {
        message = args[1];
    }
    if (typeof message === 'string' && message.startsWith('SAVE_RTL_CONFIG|')) {
        try {
            const data = message.substring(16);
            const configPath = require('path').join(require('os').homedir(), '.antigravity-rtl.json');
            require('fs').writeFileSync(configPath, data);
        } catch (e) {}
    }
});
void win.loadURL(url);

win.webContents.on('dom-ready', () => {
    try {
        const fontPath = require('path').join(__dirname, 'Vazirmatn-Variable.woff2');
        const fontBase64 = require('fs').existsSync(fontPath) ? require('fs').readFileSync(fontPath).toString('base64') : '';
        
        // Read offline fonts if present
        const fontsDir = require('path').join(__dirname, 'fonts');
        const fontsB64 = {};
        function readFontB64(key, rel) {
            try {
                const full = require('path').join(fontsDir, rel);
                if (require('fs').existsSync(full)) {
                    fontsB64[key] = require('fs').readFileSync(full).toString('base64');
                }
            } catch(e) {}
        }

        readFontB64('IRANSansX-Regular', 'persian/IRANSansX-Regular.woff2');
        readFontB64('IRANSansX-Bold', 'persian/IRANSansX-Bold.woff2');
        readFontB64('IRANYekanX-Regular', 'persian/IRANYekanX-Regular.woff2');
        readFontB64('IRANYekanX-Bold', 'persian/IRANYekanX-Bold.woff2');
        readFontB64('Kalameh-Regular', 'persian/Kalameh-Regular.woff2');
        readFontB64('Kalameh-Bold', 'persian/Kalameh-Bold.woff2');
        readFontB64('Noora-Regular', 'persian/Noora-Regular.woff2');
        readFontB64('Noora-Bold', 'persian/Noora-Bold.woff2');
        readFontB64('Pelak-Regular', 'persian/Pelak-Regular.woff2');
        readFontB64('Pelak-Bold', 'persian/Pelak-Bold.woff2');
        readFontB64('Ravi-Regular', 'persian/Ravi-Regular.woff2');
        readFontB64('Ravi-Bold', 'persian/Ravi-Bold.woff2');
        readFontB64('YekanBakh-Regular', 'persian/YekanBakh-Regular.woff2');
        readFontB64('YekanBakh-Bold', 'persian/YekanBakh-Bold.woff2');

        readFontB64('OpenSans', 'english/OpenSans.ttf');
        readFontB64('Roboto', 'english/Roboto.ttf');
        readFontB64('FiraSans-Regular', 'english/FiraSans-Regular.ttf');
        readFontB64('FiraSans-Bold', 'english/FiraSans-Bold.ttf');

        readFontB64('FiraCode-Regular', 'code/FiraCode-Regular.woff2');
        readFontB64('FiraCode-Bold', 'code/FiraCode-Bold.woff2');
        readFontB64('JetBrainsMono-Regular', 'code/JetBrainsMono-Regular.woff2');
        readFontB64('JetBrainsMono-Bold', 'code/JetBrainsMono-Bold.woff2');

        function normalizeFont(val) {
            if (!val || val === 'Vazirmatn' || val === 'Vazir' || val === 'System' || val === 'Monospace' || val === 'PersianOnlyFont' || val === 'Default') return '';
            return val;
        }

        // Read config
        let rtlConfig = { faFont: '', enFont: '', codeFont: '', lh: '1.6', fs: '14', isRTL: true, forceRTL: false, fixAtSign: true };
        try {
            const configPath = require('path').join(require('os').homedir(), '.antigravity-rtl.json');
            if (require('fs').existsSync(configPath)) {
                const cfg = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
                rtlConfig = { 
                    ...rtlConfig, 
                    ...cfg,
                    faFont: normalizeFont(cfg.faFont),
                    enFont: normalizeFont(cfg.enFont),
                    codeFont: normalizeFont(cfg.codeFont)
                };
            }
        } catch (e) {}

        // Unified injection for RTL Toggle, CSS, and JS
        win.webContents.executeJavaScript(`
            const fontBase64 = '${fontBase64}';
            const fontsB64 = ${JSON.stringify(fontsB64)};
            let rtlConfig = ${JSON.stringify(rtlConfig)};
            
            function normalizeFont(val) {
                if (!val || val === 'Vazirmatn' || val === 'Vazir' || val === 'System' || val === 'Monospace' || val === 'PersianOnlyFont' || val === 'Default') return '';
                return val;
            }

            try {
                const saved = localStorage.getItem('rz-antigravity-rtl-config');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    rtlConfig = {
                        ...rtlConfig,
                        ...parsed,
                        faFont: normalizeFont(parsed.faFont),
                        enFont: normalizeFont(parsed.enFont),
                        codeFont: normalizeFont(parsed.codeFont)
                    };
                }
            } catch (e) {}
            
            let isRTL = rtlConfig.isRTL;
            let forceRTL = rtlConfig.forceRTL || false;
            let fixAtSign = rtlConfig.fixAtSign !== false;
            let currentCorner = localStorage.getItem('rz-widget-corner') || 'br';
            
            // Permanent widget styles (#D0FE1B Volt on #000000 Pitch Black)
            if (!document.getElementById('rtl-widget-style')) {
                let widgetStyle = document.createElement('style');
                widgetStyle.id = 'rtl-widget-style';
                widgetStyle.textContent = \`
                    .rtl-widget-container {
                        position: fixed !important;
                        width: 38px !important;
                        height: 38px !important;
                        direction: ltr !important;
                        z-index: 2147483647 !important;
                        overflow: visible !important;
                        user-select: none !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                        transition: transform 0.2s ease, left 0.3s cubic-bezier(0.16, 1, 0.3, 1), top 0.3s cubic-bezier(0.16, 1, 0.3, 1), right 0.3s cubic-bezier(0.16, 1, 0.3, 1), bottom 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    }

                    .rtl-widget-container.dragging {
                        transition: none !important;
                        cursor: grabbing !important;
                        right: auto !important;
                        bottom: auto !important;
                    }

                    /* 4 Corners */
                    .rtl-widget-container.corner-br {
                        right: 18px !important;
                        bottom: 18px !important;
                        left: auto !important;
                        top: auto !important;
                    }
                    .rtl-widget-container.corner-bl {
                        left: 18px !important;
                        bottom: 18px !important;
                        right: auto !important;
                        top: auto !important;
                    }
                    .rtl-widget-container.corner-tr {
                        right: 18px !important;
                        top: 18px !important;
                        left: auto !important;
                        bottom: auto !important;
                    }
                    .rtl-widget-container.corner-tl {
                        left: 18px !important;
                        top: 18px !important;
                        right: auto !important;
                        bottom: auto !important;
                    }

                    .rtl-widget-trigger {
                        position: relative !important;
                        width: 38px !important;
                        height: 38px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        border-radius: 50% !important;
                        background-color: #000000 !important;
                        border: 1.5px solid #27272a !important;
                        color: #9ca3af !important;
                        cursor: grab !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.75) !important;
                        user-select: none !important;
                        -webkit-user-drag: none !important;
                        touch-action: none !important;
                        transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease !important;
                    }
                    .rtl-widget-trigger:hover {
                        transform: scale(1.1) !important;
                        border-color: #D0FE1B !important;
                        color: #D0FE1B !important;
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.9), 0 0 16px rgba(208, 254, 27, 0.45) !important;
                    }
                    .rtl-widget-container.open .rtl-widget-trigger {
                        background-color: #D0FE1B !important;
                        border-color: #D0FE1B !important;
                        color: #000000 !important;
                        box-shadow: 0 0 20px rgba(208, 254, 27, 0.7) !important;
                    }
                    .rtl-widget-container.dragging .rtl-widget-trigger {
                        cursor: grabbing !important;
                        transform: scale(1.12) !important;
                        border-color: #D0FE1B !important;
                        color: #D0FE1B !important;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.95), 0 0 20px rgba(208, 254, 27, 0.6) !important;
                    }
                    .rtl-widget-panel {
                        position: absolute !important;
                        width: 254px !important;
                        background-color: #050505 !important;
                        color: #ffffff !important;
                        border: 1px solid rgba(208, 254, 27, 0.22) !important;
                        border-radius: 16px !important;
                        padding: 13px 14px !important;
                        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.95), 0 0 20px rgba(208, 254, 27, 0.12) !important;
                        transform: scale(0.85) translateY(10px) !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                    }
                    
                    /* Corner Alignment for Panel */
                    .rtl-widget-container.corner-br .rtl-widget-panel {
                        bottom: 48px !important;
                        right: 0 !important;
                        top: auto !important;
                        left: auto !important;
                        transform-origin: bottom right !important;
                    }
                    .rtl-widget-container.corner-bl .rtl-widget-panel {
                        bottom: 48px !important;
                        left: 0 !important;
                        top: auto !important;
                        right: auto !important;
                        transform-origin: bottom left !important;
                    }
                    .rtl-widget-container.corner-tr .rtl-widget-panel {
                        top: 48px !important;
                        right: 0 !important;
                        bottom: auto !important;
                        left: auto !important;
                        transform-origin: top right !important;
                    }
                    .rtl-widget-container.corner-tl .rtl-widget-panel {
                        top: 48px !important;
                        left: 0 !important;
                        bottom: auto !important;
                        right: auto !important;
                        transform-origin: top left !important;
                    }

                    .rtl-widget-container.open .rtl-widget-panel {
                        transform: scale(1) translateY(0) !important;
                        opacity: 1 !important;
                        pointer-events: auto !important;
                    }
                    .rtl-panel-header {
                        text-align: center !important;
                        font-weight: 600 !important;
                        font-size: 13px !important;
                        padding-bottom: 9px !important;
                        margin-bottom: 9px !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                        gap: 7px !important;
                        color: #D0FE1B !important;
                        letter-spacing: 0.4px !important;
                        text-shadow: 0 0 10px rgba(208, 254, 27, 0.3) !important;
                    }
                    .rtl-row {
                        position: relative !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        gap: 8px !important;
                        margin-bottom: 7px !important;
                        font-size: 11px !important;
                    }
                    .rtl-label {
                        font-weight: 500 !important;
                        color: #d4d4d8 !important;
                        white-space: nowrap !important;
                    }
                    
                    /* Animated Sliders & Number Badges */
                    .rtl-slider-val {
                        font-weight: 500 !important;
                        color: #D0FE1B !important;
                        font-size: 11px !important;
                        min-width: 32px !important;
                        text-align: center !important;
                        background: rgba(208, 254, 27, 0.1) !important;
                        border: 1px solid rgba(208, 254, 27, 0.28) !important;
                        border-radius: 5px !important;
                        padding: 1px 4px !important;
                        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, box-shadow 0.2s ease !important;
                        display: inline-block !important;
                    }

                    .rtl-slider-val.val-pop {
                        transform: scale(1.18) !important;
                        background: rgba(208, 254, 27, 0.25) !important;
                        box-shadow: 0 0 10px rgba(208, 254, 27, 0.45) !important;
                    }

                    /* Custom Animated Dropdown */
                    .rtl-dropdown {
                        position: relative !important;
                        width: 124px !important;
                    }

                    .rtl-dropdown-trigger {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        background-color: #121214 !important;
                        border: 1px solid rgba(255, 255, 255, 0.14) !important;
                        border-radius: 7px !important;
                        padding: 4px 7px !important;
                        font-size: 11px !important;
                        cursor: pointer !important;
                        transition: all 0.2s ease !important;
                    }

                    .rtl-dropdown-trigger:hover,
                    .rtl-dropdown.open .rtl-dropdown-trigger {
                        border-color: #D0FE1B !important;
                        box-shadow: 0 0 8px rgba(208, 254, 27, 0.25) !important;
                    }

                    .rtl-dropdown-label {
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                        white-space: nowrap !important;
                        font-weight: 500 !important;
                        transition: color 0.2s ease !important;
                    }

                    .rtl-dropdown-label.muted {
                        color: #71717a !important;
                    }

                    .rtl-dropdown-label.active {
                        color: #D0FE1B !important;
                    }

                    .rtl-dropdown-arrow {
                        color: #71717a !important;
                        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease !important;
                        flex-shrink: 0 !important;
                        margin-left: 4px !important;
                    }

                    .rtl-dropdown.open .rtl-dropdown-arrow {
                        transform: rotate(180deg) !important;
                        color: #D0FE1B !important;
                    }

                    .rtl-dropdown-menu {
                        position: absolute !important;
                        top: calc(100% + 4px) !important;
                        right: 0 !important;
                        width: 138px !important;
                        max-height: 175px !important;
                        overflow-y: auto !important;
                        background-color: #09090b !important;
                        border: 1px solid rgba(208, 254, 27, 0.3) !important;
                        border-radius: 9px !important;
                        padding: 4px !important;
                        z-index: 1000005 !important;
                        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.9), 0 0 14px rgba(208, 254, 27, 0.15) !important;
                        opacity: 0 !important;
                        transform: translateY(-8px) scale(0.95) !important;
                        pointer-events: none !important;
                        transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    }

                    .rtl-dropdown.open .rtl-dropdown-menu {
                        opacity: 1 !important;
                        transform: translateY(0) scale(1) !important;
                        pointer-events: auto !important;
                    }

                    .rtl-dropdown-item {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        padding: 5px 7px !important;
                        border-radius: 5px !important;
                        font-size: 11px !important;
                        color: #a1a1aa !important;
                        cursor: pointer !important;
                        transition: all 0.15s ease !important;
                    }

                    .rtl-dropdown-item:hover {
                        background-color: rgba(208, 254, 27, 0.14) !important;
                        color: #D0FE1B !important;
                        transform: translateX(-2px) !important;
                    }

                    .rtl-dropdown-item.active {
                        color: #D0FE1B !important;
                        font-weight: 600 !important;
                        background-color: rgba(208, 254, 27, 0.09) !important;
                    }

                    /* Switches */
                    .rtl-toggle-btn-reset {
                        position: relative !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        width: 38px !important;
                        height: 20px !important;
                        border-radius: 10px !important;
                        border: none !important;
                        cursor: pointer !important;
                        outline: none !important;
                        padding: 0 !important;
                        box-sizing: border-box !important;
                        flex-shrink: 0 !important;
                        background-color: #27272a !important;
                        transition: background-color 0.2s ease, box-shadow 0.2s ease !important;
                    }
                    .rtl-toggle-btn-reset.active {
                        background-color: #D0FE1B !important;
                        box-shadow: 0 0 10px rgba(208, 254, 27, 0.4) !important;
                    }
                    .rtl-toggle-knob {
                        position: absolute !important;
                        top: 2px !important;
                        left: 2px !important;
                        width: 16px !important;
                        height: 16px !important;
                        border-radius: 50% !important;
                        background-color: #ffffff !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5) !important;
                        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease !important;
                        transform: translateX(0px) !important;
                    }
                    .rtl-toggle-btn-reset.active .rtl-toggle-knob {
                        transform: translateX(18px) !important;
                        background-color: #000000 !important;
                    }
                    .rtl-info-icon {
                        position: relative !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        cursor: pointer !important;
                        color: #71717a !important;
                        margin-left: 4px !important;
                        transition: color 0.2s !important;
                    }
                    .rtl-info-icon:hover {
                        color: #D0FE1B !important;
                    }
                    .rtl-tooltip {
                        visibility: hidden !important;
                        opacity: 0 !important;
                        position: absolute !important;
                        bottom: calc(100% + 6px) !important;
                        left: 50% !important;
                        transform: translateX(-50%) !important;
                        background-color: #000000 !important;
                        color: #e4e4e7 !important;
                        border: 1px solid rgba(208, 254, 27, 0.3) !important;
                        border-radius: 6px !important;
                        padding: 4px 8px !important;
                        font-size: 10px !important;
                        line-height: 1.3 !important;
                        white-space: normal !important;
                        width: 140px !important;
                        text-align: center !important;
                        z-index: 1000000 !important;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.9) !important;
                        pointer-events: none !important;
                        transition: opacity 0.2s ease-in-out !important;
                    }
                    .rtl-info-icon:hover .rtl-tooltip {
                        visibility: visible !important;
                        opacity: 1 !important;
                    }
                    .rtl-separator {
                        height: 1px !important;
                        background-color: rgba(255, 255, 255, 0.08) !important;
                        margin: 6px 0 !important;
                    }
                    .rtl-github-link {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 5px !important;
                        font-size: 11px !important;
                        font-weight: 600 !important;
                        color: #D0FE1B !important;
                        text-decoration: none !important;
                        opacity: 0.85 !important;
                        padding-top: 4px !important;
                        transition: opacity 0.15s ease, transform 0.15s ease !important;
                    }
                    .rtl-github-link:hover {
                        opacity: 1 !important;
                        transform: scale(1.03) !important;
                        text-decoration: underline !important;
                        text-shadow: 0 0 8px rgba(208, 254, 27, 0.4) !important;
                    }
                \`;
                document.head.appendChild(widgetStyle);
            }
            
            // 1. Dynamic RTL Style Tag
            const rtlStyle = document.createElement('style');
            rtlStyle.id = 'antigravity-rtl-style';
            
            const updateDynamicCSS = (faFont, enFont, codeFont, lh, fs) => {
                let faFontRule = '';
                let faFontName = "'PersianOnlyFont'";
                
                if (faFont && fontsB64[faFont + '-Regular']) {
                    faFontName = "'SelectedFaFont', 'PersianOnlyFont'";
                    faFontRule = \`
                        @font-face {
                            font-family: 'SelectedFaFont';
                            src: url('data:font/woff2;base64,\${fontsB64[faFont + '-Regular']}') format('woff2');
                            font-weight: 400;
                            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                        }
                        @font-face {
                            font-family: 'SelectedFaFont';
                            src: url('data:font/woff2;base64,\${fontsB64[faFont + '-Bold'] || fontsB64[faFont + '-Regular']}') format('woff2');
                            font-weight: 700;
                            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                        }
                    \`;
                }

                let enFontRule = '';
                let enFontStr = 'ui-sans-serif, system-ui, sans-serif';
                if (enFont) {
                    if (fontsB64[enFont]) {
                        enFontStr = "'SelectedEnFont', ui-sans-serif, system-ui, sans-serif";
                        enFontRule = \`
                            @font-face {
                                family: 'SelectedEnFont';
                                src: url('data:font/ttf;base64,\${fontsB64[enFont]}') format('truetype');
                                font-weight: 100 900;
                            }
                        \`;
                    } else if (fontsB64[enFont + '-Regular']) {
                        enFontStr = "'SelectedEnFont', ui-sans-serif, system-ui, sans-serif";
                        enFontRule = \`
                            @font-face {
                                font-family: 'SelectedEnFont';
                                src: url('data:font/ttf;base64,\${fontsB64[enFont + '-Regular']}') format('truetype');
                                font-weight: 400;
                            }
                            @font-face {
                                font-family: 'SelectedEnFont';
                                src: url('data:font/ttf;base64,\${fontsB64[enFont + '-Bold'] || fontsB64[enFont + '-Regular']}') format('truetype');
                                font-weight: 700;
                            }
                        \`;
                    }
                }

                let codeFontRule = '';
                let codeFontStr = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
                if (codeFont && fontsB64[codeFont + '-Regular']) {
                    codeFontStr = "'SelectedCodeFont', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
                    codeFontRule = \`
                        @font-face {
                            font-family: 'SelectedCodeFont';
                            src: url('data:font/woff2;base64,\${fontsB64[codeFont + '-Regular']}') format('woff2');
                            font-weight: 400;
                        }
                        @font-face {
                            font-family: 'SelectedCodeFont';
                            src: url('data:font/woff2;base64,\${fontsB64[codeFont + '-Bold'] || fontsB64[codeFont + '-Regular']}') format('woff2');
                            font-weight: 700;
                        }
                    \`;
                }
                
                let forceRtlStyle = forceRTL ? \`
                    .prose > *:not(pre):not(code), 
                    [data-testid="chat-message"] > *:not(pre):not(code), 
                    .markdown-body > *:not(pre):not(code), 
                    .leading-relaxed > *:not(pre):not(code),
                    [data-testid="user-input-step"],
                    [data-testid="user-input-step"] > *:not(pre):not(code),
                    div:has(> [role="radiogroup"]),
                    label[for^="ask-opt-"] {
                        direction: rtl !important;
                        text-align: right !important;
                        unicode-bidi: isolate !important;
                    }
                \` : '';
                
                rtlStyle.textContent = \`
                    \${faFontRule}
                    \${enFontRule}
                    \${codeFontRule}
                    @font-face {
                        font-family: 'PersianOnlyFont';
                        src: url('data:font/woff2;base64,\${fontBase64}') format('woff2');
                        font-weight: 100 900;
                        unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                    }
                    :root, :host, html, body {
                        font-family: \${faFontName}, \${enFontStr}, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
                    }
                    .prose, [data-testid="chat-message"], .markdown-body, .leading-relaxed, [contenteditable="true"], [contenteditable="true"] p {
                        font-size: \${fs}px !important;
                    }
                    p, h1, h2, h3, h4, h5, h6, ul, ol {
                        unicode-bidi: plaintext;
                        text-align: start;
                    }
                    .prose > *, [data-testid="chat-message"] > *, .markdown-body > * {
                        unicode-bidi: plaintext;
                        text-align: start;
                    }
                    label[for^="ask-opt-"] {
                        unicode-bidi: plaintext;
                        text-align: start;
                    }
                    label[for^="ask-opt-"][dir="rtl"] {
                        direction: rtl;
                        text-align: right;
                    }
                    textarea[data-testid="ask-question-writein"] {
                        unicode-bidi: plaintext;
                        text-align: start;
                    }
                    
                    \${forceRtlStyle}
                    
                    /* RTL List Padding Fix */
                    ul:not(#_)[dir="rtl"], ol:not(#_)[dir="rtl"],
                    [dir="rtl"] ul:not(#_), [dir="rtl"] ol:not(#_) {
                        padding-left: 0 !important;
                        padding-right: 1.25rem !important;
                    }
                    
                    /* Nested RTL List Padding Fix */
                    [dir="rtl"] ul:not(#_) ul:not(#_), [dir="rtl"] ul:not(#_) ol:not(#_),
                    [dir="rtl"] ol:not(#_) ul:not(#_), [dir="rtl"] ol:not(#_) ol:not(#_),
                    ul:not(#_)[dir="rtl"] ul:not(#_), ul:not(#_)[dir="rtl"] ol:not(#_),
                    ol:not(#_)[dir="rtl"] ul:not(#_), ol:not(#_)[dir="rtl"] ol:not(#_) {
                        padding-left: 0 !important;
                        padding-right: 2.5rem !important;
                    }
                    
                    /* Thinking Blocks (Keep LTR) */
                    .cursor-edit.text-secondary-foreground,
                    .cursor-edit.text-secondary-foreground * {
                        direction: ltr !important;
                        text-align: left !important;
                        unicode-bidi: isolate !important;
                    }
                    
                    /* Code Blocks */
                    pre, code, pre *, code * {
                        unicode-bidi: isolate !important;
                        direction: ltr !important;
                        text-align: left !important;
                        font-family: \${codeFontStr} !important;
                    }
                    
                    /* Line Height */
                    .leading-relaxed {
                        line-height: \${lh} !important;
                    }
                    
                    [contenteditable="true"], [contenteditable="true"] * {
                        unicode-bidi: isolate !important;
                        text-align: start !important;
                    }
                    
                    [role="navigation"][aria-label="Sidebar"] *, .truncate {
                        unicode-bidi: plaintext !important;
                        text-align: start !important;
                    }
                    .prose p, .prose li, .markdown-body p, [data-testid="chat-message"] p, [data-testid="chat-message"] .leading-relaxed, .leading-relaxed, [data-testid="user-input-step"], [data-testid="user-input-step"] div, [data-lexical-text="true"], [contenteditable="true"], [contenteditable="true"] p, .pointer-events-none.absolute.overflow-hidden, label[for^="ask-opt-"] {
                        line-height: \${lh} !important;
                    }
                \`;
            };
            
            if (isRTL) {
                document.head.appendChild(rtlStyle);
                updateDynamicCSS(rtlConfig.faFont, rtlConfig.enFont, rtlConfig.codeFont, rtlConfig.lh, rtlConfig.fs);
            }
            
            // 2. Input Observer Logic
            function updateDir() {
                if (!isRTL) return;
                
                // Inputs
                document.querySelectorAll('[contenteditable="true"] p, [contenteditable="true"], textarea[data-testid="ask-question-writein"]').forEach(el => {
                    const raw = el.tagName === 'TEXTAREA' ? el.value : el.textContent;
                    const text = (raw || '').replace(/[\\u200B-\\u200F\\uFEFF]/g, '').trim();
                    if (text.length > 0) {
                        const isRtlText = /^[^a-zA-Z]*[\\u0591-\\u07FF\\uFB1D-\\uFDFD\\uFE70-\\uFEFC]/.test(text);
                        const newDir = isRtlText ? 'rtl' : 'ltr';
                        if (el.getAttribute('dir') !== newDir) el.setAttribute('dir', newDir);
                    } else {
                        if (el.hasAttribute('dir')) el.removeAttribute('dir');
                    }
                });
                
                // Chat Output
                document.querySelectorAll(\`
                    .prose > *, 
                    [data-testid="chat-message"] > *, 
                    .markdown-body > *, 
                    .leading-relaxed > *,
                    [data-testid="user-input-step"],
                    [data-testid="user-input-step"] > *,
                    div:has(> [role="radiogroup"]),
                    label[for^="ask-opt-"]
                \`).forEach(el => {
                    if (el.tagName === 'PRE' || el.tagName === 'CODE') return;
                    if (el.closest('pre, code, .cursor-edit.text-secondary-foreground')) return;
                    
                    const text = (el.textContent || '').replace(/[\\u200B-\\u200F\\uFEFF]/g, '').trim();
                    let dir = 'auto';
                    
                    if (forceRTL) {
                        dir = 'rtl';
                    } else if (text) {
                        const firstChar = text.match(/[A-Za-z\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/);
                        if (firstChar) {
                            const isPersianOrArabic = /[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/.test(firstChar[0]);
                            dir = isPersianOrArabic ? 'rtl' : 'ltr';
                        }
                    }
                    
                    if (el.getAttribute('dir') !== dir) {
                        el.setAttribute('dir', dir);
                    }
                });
            }

            document.body.addEventListener('input', updateDir, { capture: true });
            document.body.addEventListener('focusin', updateDir, { capture: true });
            const observer = new MutationObserver(updateDir);
            observer.observe(document.body, { childList: true, subtree: true });
            setInterval(updateDir, 500);
            
            // Keyboard Shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.altKey && e.code === 'KeyR') {
                    e.preventDefault();
                    setRTLActive(!isRTL);
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (!fixAtSign) return;
                if (e.code === 'Digit2' && e.shiftKey) {
                    if (e.key === '٬' || e.key === '،') {
                        e.preventDefault();
                        document.execCommand('insertText', false, '@');
                    }
                }
            }, { capture: true });

            // 3. Create Floating Widget
            const widgetWrapper = document.createElement('div');
            widgetWrapper.innerHTML = \`
                <div class="rtl-widget-container corner-\${currentCorner}">
                  <!-- Trigger Icon -->
                  <div class="rtl-widget-trigger" title="RZ Antigravity RTL (Click to open, Drag to move)">
                    <svg style="pointer-events: none;" height="19" width="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M2 12h20"></path>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  
                  <!-- Panel -->
                  <div class="rtl-widget-panel">
                    <!-- Header -->
                    <div class="rtl-panel-header">
                        <svg height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6m-6-4h16m-6 8h6M4 6h16"/></svg>
                        <span>RZ Antigravity RTL</span>
                    </div>
                    
                    <!-- Toggle -->
                    <div class="rtl-row">
                      <div style="display: flex; align-items: center;">
                        <span id="rtl-toggle-label" class="rtl-label">\${isRTL ? 'Enabled' : 'Disabled'}</span>
                        <div class="rtl-info-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor"><path d="M450-290h60V-520H450v230Zm52.92-307.75q9.38-9.29 9.38-23.02t-9.29-23.02T480-653.07t-23.02,9.29t-9.29,23.02t9.38,23.02T480-588.46t22.92-9.29ZM480.07-100q-78.84,0-148.2-29.92T211.18-211.13T129.93-331.76T100-479.93t29.92-148.2t81.21-120.68t120.63-81.25T479.93-860t148.2,29.92t120.68,81.21t81.25,120.63T860-480.07t-29.92,148.2T748.87-211.18T628.24-129.93T480.07-100ZM480-160q134,0 227-93t93-227T707-707T480-800T253-707T160-480t93,227t227,93Zm0-320Z"></path></svg>
                          <div class="rtl-tooltip">Shortcut: Alt + R</div>
                        </div>
                      </div>
                      <button id="rtl-toggle-btn" type="button" role="switch" aria-checked="\${isRTL}" class="rtl-toggle-btn-reset \${isRTL ? 'active' : ''}">
                        <span id="rtl-toggle-knob" class="rtl-toggle-knob"></span>
                      </button>
                    </div>
                    
                    <!-- Settings Controls -->
                    <div id="rtl-settings-wrapper" style="display: flex; flex-direction: column; gap: 4px; transition: opacity 0.2s; \${isRTL ? '' : 'opacity: 0.4; pointer-events: none;'}">
                        <!-- Force RTL Toggle -->
                        <div class="rtl-row">
                          <div style="display: flex; align-items: center;">
                            <span class="rtl-label">Force RTL</span>
                            <div class="rtl-info-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor"><path d="M450-290h60V-520H450v230Zm52.92-307.75q9.38-9.29 9.38-23.02t-9.29-23.02T480-653.07t-23.02,9.29t-9.29,23.02t9.38,23.02T480-588.46t22.92-9.29ZM480.07-100q-78.84,0-148.2-29.92T211.18-211.13T129.93-331.76T100-479.93t29.92-148.2t81.21-120.68t120.63-81.25T479.93-860t148.2,29.92t120.68,81.21t81.25,120.63T860-480.07t-29.92,148.2T748.87-211.18T628.24-129.93T480.07-100ZM480-160q134,0 227-93t93-227T707-707T480-800T253-707T160-480t93,227t227,93Zm0-320Z"></path></svg>
                              <div class="rtl-tooltip" style="width: 170px;">Forces Chat to RTL even if starting with English.</div>
                            </div>
                          </div>
                          <button id="rtl-force-btn" type="button" role="switch" aria-checked="\${forceRTL}" class="rtl-toggle-btn-reset \${forceRTL ? 'active' : ''}">
                            <span class="rtl-toggle-knob"></span>
                          </button>
                        </div>
                        
                        <div class="rtl-separator"></div>
                        
                        <!-- Persian Font Dropdown (Custom Animated) -->
                        <div class="rtl-row">
                          <span class="rtl-label" title="Persian/Arabic Font">FA/AR Font</span>
                          <div class="rtl-dropdown" id="rtl-fafont-dropdown">
                            <div class="rtl-dropdown-trigger">
                              <span class="rtl-dropdown-label \${rtlConfig.faFont ? 'active' : 'muted'}">Default (Vazirmatn)</span>
                              <svg class="rtl-dropdown-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                            <div class="rtl-dropdown-menu">
                              <div class="rtl-dropdown-item" data-value=""><span>Default (Vazirmatn)</span></div>
                              <div class="rtl-dropdown-item" data-value="IRANSansX"><span>IRANSans X</span></div>
                              <div class="rtl-dropdown-item" data-value="IRANYekanX"><span>IRANYekanX Pro</span></div>
                              <div class="rtl-dropdown-item" data-value="Kalameh"><span>Kalameh</span></div>
                              <div class="rtl-dropdown-item" data-value="Noora"><span>Noora</span></div>
                              <div class="rtl-dropdown-item" data-value="Pelak"><span>Pelak</span></div>
                              <div class="rtl-dropdown-item" data-value="Ravi"><span>Ravi</span></div>
                              <div class="rtl-dropdown-item" data-value="YekanBakh"><span>Yekan Bakh</span></div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- English Font Dropdown (Custom Animated) -->
                        <div class="rtl-row">
                          <span class="rtl-label" title="English Font">EN Font</span>
                          <div class="rtl-dropdown" id="rtl-enfont-dropdown">
                            <div class="rtl-dropdown-trigger">
                              <span class="rtl-dropdown-label \${rtlConfig.enFont ? 'active' : 'muted'}">Default (System)</span>
                              <svg class="rtl-dropdown-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                            <div class="rtl-dropdown-menu">
                              <div class="rtl-dropdown-item" data-value=""><span>Default (System)</span></div>
                              <div class="rtl-dropdown-item" data-value="OpenSans"><span>Open Sans</span></div>
                              <div class="rtl-dropdown-item" data-value="Roboto"><span>Roboto</span></div>
                              <div class="rtl-dropdown-item" data-value="FiraSans"><span>Fira Sans</span></div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Code Font Dropdown (Custom Animated) -->
                        <div class="rtl-row">
                          <span class="rtl-label" title="Code Font">Code Font</span>
                          <div class="rtl-dropdown" id="rtl-codefont-dropdown">
                            <div class="rtl-dropdown-trigger">
                              <span class="rtl-dropdown-label \${rtlConfig.codeFont ? 'active' : 'muted'}">Default (Monospace)</span>
                              <svg class="rtl-dropdown-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                            <div class="rtl-dropdown-menu">
                              <div class="rtl-dropdown-item" data-value=""><span>Default (Monospace)</span></div>
                              <div class="rtl-dropdown-item" data-value="FiraCode"><span>Fira Code</span></div>
                              <div class="rtl-dropdown-item" data-value="JetBrainsMono"><span>JetBrains Mono</span></div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Line Height Slider + Animated Value + Reset -->
                        <div class="rtl-row">
                          <span class="rtl-label" title="Chat Line Height">Line Height</span>
                          <div style="display: flex; align-items: center; gap: 5px;">
                            <input id="rtl-lh-input" type="range" min="1.2" max="2.5" step="0.1" value="\${rtlConfig.lh || '1.6'}" style="width: 70px; cursor: pointer; accent-color: #D0FE1B;">
                            <span id="rtl-lh-val" class="rtl-slider-val">\${rtlConfig.lh || '1.6'}</span>
                            <button id="rtl-lh-reset" type="button" style="background: none; border: none; cursor: pointer; opacity: 0.65; color: inherit; padding: 2px;" title="Reset to 1.6">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            </button>
                          </div>
                        </div>

                        <!-- Font Size Slider + Animated Value + Reset -->
                        <div class="rtl-row">
                          <span class="rtl-label" title="Chat Font Size">Font Size</span>
                          <div style="display: flex; align-items: center; gap: 5px;">
                            <input id="rtl-fs-input" type="range" min="11" max="22" step="1" value="\${rtlConfig.fs || '14'}" style="width: 70px; cursor: pointer; accent-color: #D0FE1B;">
                            <span id="rtl-fs-val" class="rtl-slider-val">\${rtlConfig.fs || '14'}px</span>
                            <button id="rtl-fs-reset" type="button" style="background: none; border: none; cursor: pointer; opacity: 0.65; color: inherit; padding: 2px;" title="Reset to 14px">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            </button>
                          </div>
                        </div>
                        
                        <div class="rtl-separator"></div>

                        <!-- Fix Shift+2 @ Toggle -->
                        <div class="rtl-row">
                          <div style="display: flex; align-items: center;">
                            <span class="rtl-label">Shift+2 = @</span>
                            <div class="rtl-info-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor"><path d="M450-290h60V-520H450v230Zm52.92-307.75q9.38-9.29 9.38-23.02t-9.29-23.02T480-653.07t-23.02,9.29t-9.29,23.02t9.38,23.02T480-588.46t22.92-9.29ZM480.07-100q-78.84,0-148.2-29.92T211.18-211.13T129.93-331.76T100-479.93t29.92-148.2t81.21-120.68t120.63-81.25T479.93-860t148.2,29.92t120.68,81.21t81.25,120.63T860-480.07t-29.92,148.2T748.87-211.18T628.24-129.93T480.07-100ZM480-160q134,0 227-93t93-227T707-707T480-800T253-707T160-480t93,227t227,93Zm0-320Z"></path></svg>
                              <div class="rtl-tooltip" style="width: 160px;">Forces Shift+2 to type '@' instead of '٬' on Persian keyboard.</div>
                            </div>
                          </div>
                          <button id="rtl-at-btn" type="button" role="switch" aria-checked="\${fixAtSign}" class="rtl-toggle-btn-reset \${fixAtSign ? 'active' : ''}">
                            <span class="rtl-toggle-knob"></span>
                          </button>
                        </div>
                    </div>
                    
                    <div class="rtl-separator"></div>
                    
                    <!-- GitHub -->
                    <a href="https://github.com/rezasalimi01/rz-antigravity-rtl" target="_blank" class="rtl-github-link">
                      <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
                      Star on GitHub
                    </a>
                  </div>
                </div>
            \`;
            document.body.appendChild(widgetWrapper.firstElementChild);
            
            const container = document.querySelector('.rtl-widget-container');
            const trigger = container.querySelector('.rtl-widget-trigger');
            const toggleBtn = document.getElementById('rtl-toggle-btn');
            const toggleLabel = document.getElementById('rtl-toggle-label');
            const settingsWrapper = document.getElementById('rtl-settings-wrapper');
            const forceBtn = document.getElementById('rtl-force-btn');
            const atBtn = document.getElementById('rtl-at-btn');
            const lhInput = document.getElementById('rtl-lh-input');
            const lhVal = document.getElementById('rtl-lh-val');
            const lhResetBtn = document.getElementById('rtl-lh-reset');
            const fsInput = document.getElementById('rtl-fs-input');
            const fsVal = document.getElementById('rtl-fs-val');
            const fsResetBtn = document.getElementById('rtl-fs-reset');

            // Setup Custom Dropdowns
            function setupDropdown(dropdownId, currentValue, onChange) {
                const dropdown = document.getElementById(dropdownId);
                if (!dropdown) return { getValue: () => currentValue, setValue: () => {} };

                const triggerEl = dropdown.querySelector('.rtl-dropdown-trigger');
                const labelEl = dropdown.querySelector('.rtl-dropdown-label');
                const menuEl = dropdown.querySelector('.rtl-dropdown-menu');
                const items = menuEl.querySelectorAll('.rtl-dropdown-item');

                let val = currentValue || '';

                function updateUI(newVal) {
                    val = newVal;
                    let found = false;
                    items.forEach(it => {
                        const itemVal = it.getAttribute('data-value') || '';
                        if (itemVal === val) {
                            it.classList.add('active');
                            labelEl.textContent = it.textContent.trim();
                            found = true;
                        } else {
                            it.classList.remove('active');
                        }
                    });

                    if (!found && items.length > 0) {
                        val = items[0].getAttribute('data-value') || '';
                        items[0].classList.add('active');
                        labelEl.textContent = items[0].textContent.trim();
                    }

                    if (val === '') {
                        labelEl.classList.add('muted');
                        labelEl.classList.remove('active');
                    } else {
                        labelEl.classList.remove('muted');
                        labelEl.classList.add('active');
                    }
                }

                updateUI(val);

                triggerEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.rtl-dropdown.open').forEach(d => {
                        if (d !== dropdown) d.classList.remove('open');
                    });
                    dropdown.classList.toggle('open');
                });

                items.forEach(it => {
                    it.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const chosen = it.getAttribute('data-value') || '';
                        updateUI(chosen);
                        dropdown.classList.remove('open');
                        onChange(chosen);
                    });
                });

                return {
                    getValue: () => val,
                    setValue: (v) => updateUI(v)
                };
            }

            document.addEventListener('click', () => {
                document.querySelectorAll('.rtl-dropdown.open').forEach(d => d.classList.remove('open'));
            });

            // Apply Corner Position
            function applyCorner(corner) {
                currentCorner = corner;
                localStorage.setItem('rz-widget-corner', corner);
                container.classList.remove('corner-br', 'corner-bl', 'corner-tr', 'corner-tl');
                container.classList.add(\`corner-\${corner}\`);
                container.style.removeProperty('left');
                container.style.removeProperty('right');
                container.style.removeProperty('top');
                container.style.removeProperty('bottom');
            }

            applyCorner(currentCorner);

            // Dragging with 4-Corner Snap
            let isMouseDown = false;
            let isDragging = false;
            let startX = 0, startY = 0;
            let initialLeft = 0, initialTop = 0;

            trigger.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                isMouseDown = true;
                isDragging = false;
                startX = e.clientX;
                startY = e.clientY;

                const elemRect = container.getBoundingClientRect();
                initialLeft = elemRect.left;
                initialTop = elemRect.top;
            });

            window.addEventListener('mousemove', (e) => {
                if (!isMouseDown) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (!isDragging && Math.hypot(dx, dy) > 3) {
                    isDragging = true;
                    container.classList.add('dragging');
                    container.classList.remove('corner-br', 'corner-bl', 'corner-tr', 'corner-tl', 'open');
                    document.querySelectorAll('.rtl-dropdown.open').forEach(d => d.classList.remove('open'));
                }

                if (isDragging) {
                    const minX = 10;
                    const maxX = Math.max(minX, window.innerWidth - 48);
                    const minY = 10;
                    const maxY = Math.max(minY, window.innerHeight - 48);

                    const currentX = Math.max(minX, Math.min(maxX, initialLeft + dx));
                    const currentY = Math.max(minY, Math.min(maxY, initialTop + dy));

                    container.style.setProperty('left', currentX + 'px', 'important');
                    container.style.setProperty('top', currentY + 'px', 'important');
                    container.style.setProperty('right', 'auto', 'important');
                    container.style.setProperty('bottom', 'auto', 'important');
                }
            });

            window.addEventListener('mouseup', (e) => {
                if (!isMouseDown) return;
                isMouseDown = false;

                if (isDragging) {
                    container.classList.remove('dragging');
                    const elemRect = container.getBoundingClientRect();
                    const centerX = (elemRect.left + elemRect.right) / 2;
                    const centerY = (elemRect.top + elemRect.bottom) / 2;

                    const isLeft = centerX < (window.innerWidth / 2);
                    const isTop = centerY < (window.innerHeight / 2);

                    const corner = (isTop ? 't' : 'b') + (isLeft ? 'l' : 'r');
                    applyCorner(corner);

                    setTimeout(() => { isDragging = false; }, 60);
                } else {
                    e.stopPropagation();
                    container.classList.toggle('open');
                    if (!container.classList.contains('open')) {
                        document.querySelectorAll('.rtl-dropdown.open').forEach(d => d.classList.remove('open'));
                    }
                }
            });

            document.addEventListener('click', (e) => {
                if (!container.contains(e.target)) {
                    container.classList.remove('open');
                    document.querySelectorAll('.rtl-dropdown.open').forEach(d => d.classList.remove('open'));
                }
            });

            const onFontChange = () => {
                saveConfig();
                updateDynamicCSS(faDropdown.getValue(), enDropdown.getValue(), codeDropdown.getValue(), lhInput.value, fsInput.value);
            };

            const faDropdown = setupDropdown('rtl-fafont-dropdown', rtlConfig.faFont, () => onFontChange());
            const enDropdown = setupDropdown('rtl-enfont-dropdown', rtlConfig.enFont, () => onFontChange());
            const codeDropdown = setupDropdown('rtl-codefont-dropdown', rtlConfig.codeFont, () => onFontChange());

            const saveConfig = () => {
                const cfg = {
                    faFont: faDropdown.getValue(),
                    enFont: enDropdown.getValue(),
                    codeFont: codeDropdown.getValue(),
                    lh: lhInput.value,
                    fs: fsInput.value,
                    isRTL: isRTL,
                    forceRTL: forceRTL,
                    fixAtSign: fixAtSign
                };
                try {
                    localStorage.setItem('rz-antigravity-rtl-config', JSON.stringify(cfg));
                } catch(e) {}
                console.log("SAVE_RTL_CONFIG|" + JSON.stringify(cfg));
            };

            function setRTLActive(active) {
                isRTL = active;
                saveConfig();
                toggleBtn.setAttribute('aria-checked', isRTL);
                toggleBtn.classList.toggle('active', isRTL);
                toggleLabel.innerText = isRTL ? 'Enabled' : 'Disabled';
                
                if (isRTL) {
                    settingsWrapper.style.opacity = '';
                    settingsWrapper.style.pointerEvents = '';
                    if (!rtlStyle.parentNode) document.head.appendChild(rtlStyle);
                    updateDynamicCSS(faDropdown.getValue(), enDropdown.getValue(), codeDropdown.getValue(), lhInput.value, fsInput.value);
                    updateDir();
                } else {
                    settingsWrapper.style.opacity = '0.4';
                    settingsWrapper.style.pointerEvents = 'none';
                    if (rtlStyle.parentNode) rtlStyle.parentNode.removeChild(rtlStyle);
                    
                    const selectors = [
                        '.leading-relaxed p', '.leading-relaxed li', '.leading-relaxed h1', '.leading-relaxed h2', '.leading-relaxed h3', '.leading-relaxed h4',
                        '[data-testid="conversation-view"] p', '[data-testid="conversation-view"] li', '[data-testid="conversation-view"] h1', '[data-testid="conversation-view"] h2', '[data-testid="conversation-view"] h3', '[data-testid="conversation-view"] h4',
                        '[data-testid="user-input-step"]', '[data-testid="user-input-step"] p', '[data-testid^="convo-pill-"]', '.truncate', '[contenteditable="true"]', '[contenteditable="true"] p'
                    ];
                    document.querySelectorAll(selectors.join(', ')).forEach(el => {
                        if (el.hasAttribute('dir')) el.removeAttribute('dir');
                    });
                }
            }

            forceBtn.addEventListener('click', () => {
                forceRTL = !forceRTL;
                saveConfig();
                forceBtn.setAttribute('aria-checked', forceRTL);
                forceBtn.classList.toggle('active', forceRTL);
                updateDynamicCSS(faDropdown.getValue(), enDropdown.getValue(), codeDropdown.getValue(), lhInput.value, fsInput.value);
                updateDir();
            });

            atBtn.addEventListener('click', () => {
                fixAtSign = !fixAtSign;
                saveConfig();
                atBtn.setAttribute('aria-checked', fixAtSign);
                atBtn.classList.toggle('active', fixAtSign);
            });

            let popTimeouts = new WeakMap();
            function triggerValPop(el, text) {
                el.textContent = text;
                el.classList.add('val-pop');
                if (popTimeouts.has(el)) {
                    clearTimeout(popTimeouts.get(el));
                }
                const t = setTimeout(() => {
                    el.classList.remove('val-pop');
                }, 300);
                popTimeouts.set(el, t);
            }

            lhInput.addEventListener('input', () => {
                triggerValPop(lhVal, lhInput.value);
                onFontChange();
            });

            fsInput.addEventListener('input', () => {
                triggerValPop(fsVal, fsInput.value + 'px');
                onFontChange();
            });

            lhResetBtn.addEventListener('click', () => {
                lhInput.value = '1.6';
                triggerValPop(lhVal, '1.6');
                onFontChange();
            });

            fsResetBtn.addEventListener('click', () => {
                fsInput.value = '14';
                triggerValPop(fsVal, '14px');
                onFontChange();
            });

            toggleBtn.addEventListener('click', () => {
                setRTLActive(!isRTL);
            });
        `).catch(err => console.error("Failed to inject RTL features:", err));

    } catch(e) {
        console.error("Failed to read offline font", e);
    }
});
/* END RZ ANTIGRAVITY RTL PATCH */

