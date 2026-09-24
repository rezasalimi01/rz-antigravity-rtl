/* RZ ANTIGRAVITY RTL - IDE PAYLOAD */
(function() {
    // 1. Configuration Management
    let rtlConfig = {
        faFont: '',
        enFont: '',
        codeFont: '',
        lh: '1.6',
        fs: '14',
        isRTL: true,
        forceRTL: false,
        fixAtSign: true
    };

    function normalizeFont(val) {
        if (!val || val === 'Vazirmatn' || val === 'Vazir' || val === 'System' || val === 'Monospace' || val === 'PersianOnlyFont' || val === 'Default') return '';
        return val;
    }

    try {
        const saved = localStorage.getItem('rz-antigravity-rtl-config') || localStorage.getItem('smart-rtl-config');
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

    // 2. Permanent Widget & Base CSS (#D0FE1B on #000000 Theme)
    if (!document.getElementById('rtl-widget-style')) {
        const widgetStyle = document.createElement('style');
        widgetStyle.id = 'rtl-widget-style';
        widgetStyle.textContent = `
            /* Widget Container & Smart Positioning */
            .rtl-widget-container {
                position: absolute !important;
                width: 38px !important;
                height: 38px !important;
                z-index: 2147483647 !important;
                direction: ltr !important;
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

            /* 4 Corners strictly relative to chat box */
            .rtl-widget-container.corner-br {
                right: 14px !important;
                bottom: 18px !important;
                left: auto !important;
                top: auto !important;
            }
            .rtl-widget-container.corner-bl {
                left: 14px !important;
                bottom: 18px !important;
                right: auto !important;
                top: auto !important;
            }
            .rtl-widget-container.corner-tr {
                right: 14px !important;
                top: 18px !important;
                left: auto !important;
                bottom: auto !important;
            }
            .rtl-widget-container.corner-tl {
                left: 14px !important;
                top: 18px !important;
                right: auto !important;
                bottom: auto !important;
            }

            /* Trigger Button */
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

            /* Settings Panel */
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

            /* Smart Popover Alignment */
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

            /* Open State Animation */
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

            .rtl-dropdown-item-check {
                font-size: 10px !important;
                color: #D0FE1B !important;
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
        `;
        document.head.appendChild(widgetStyle);
    }

    // 3. Dynamic Styles Scoped STRICTLY to Chat Elements (Preserving Monaco Code Editor)
    const rtlStyle = document.createElement('style');
    rtlStyle.id = 'rz-antigravity-rtl-style';

    const updateDynamicCSS = (faFont, enFont, codeFont, lh, fs) => {
        const faFontStr = faFont ? `'${faFont}', 'PersianOnlyFont'` : "'PersianOnlyFont'";
        const enFontStr = enFont ? `'${enFont}', ` : '';
        const codeFontStr = codeFont
            ? `'${codeFont}', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
            : 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

        const forceRtlRule = forceRTL ? `
            .antigravity-agent-side-panel .prose > *:not(pre):not(code),
            .antigravity-agent-side-panel [data-testid="chat-message"] > *:not(pre):not(code),
            .antigravity-agent-side-panel .markdown-body > *:not(pre):not(code),
            .antigravity-agent-side-panel .leading-relaxed > *:not(pre):not(code),
            .antigravity-agent-side-panel [data-testid="user-input-step"],
            .antigravity-agent-side-panel [data-testid="user-input-step"] > *:not(pre):not(code),
            .antigravity-agent-side-panel div:has(> [role="radiogroup"]),
            .antigravity-agent-side-panel label[for^="ask-opt-"],
            .interactive-session .value > *:not(pre):not(code),
            .monaco-chat-response > *:not(pre):not(code) {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }
        ` : '';

        rtlStyle.textContent = `
            /* Bundled Persian Fonts */
            @font-face {
                font-family: 'PersianOnlyFont';
                src: url('./Vazirmatn-Variable.woff2') format('woff2'),
                     local('Vazirmatn'), local('Vazirmatn-Variable');
                font-weight: 100 900;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'IRANSansX';
                src: url('./fonts/persian/IRANSansX-Regular.woff2') format('woff2');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'IRANSansX';
                src: url('./fonts/persian/IRANSansX-Bold.woff2') format('woff2');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'IRANYekanX';
                src: url('./fonts/persian/IRANYekanX-Regular.woff2') format('woff2');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'IRANYekanX';
                src: url('./fonts/persian/IRANYekanX-Bold.woff2') format('woff2');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Kalameh';
                src: url('./fonts/persian/Kalameh-Regular.woff2') format('woff2');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Kalameh';
                src: url('./fonts/persian/Kalameh-Bold.woff2') format('woff2');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Noora';
                src: url('./fonts/persian/Noora-Regular.woff2') format('woff2');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Noora';
                src: url('./fonts/persian/Noora-Bold.woff2') format('woff2');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Pelak';
                src: url('./fonts/persian/Pelak-Regular.woff2') format('woff2');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Pelak';
                src: url('./fonts/persian/Pelak-Bold.woff2') format('woff2');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Ravi';
                src: url('./fonts/persian/Ravi-Regular.woff2') format('woff2');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Ravi';
                src: url('./fonts/persian/Ravi-Bold.woff2') format('woff2');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'YekanBakh';
                src: url('./fonts/persian/YekanBakh-Regular.woff2') format('woff2');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'YekanBakh';
                src: url('./fonts/persian/YekanBakh-Bold.woff2') format('woff2');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }

            /* Bundled English Fonts */
            @font-face {
                font-family: 'OpenSans';
                src: url('./fonts/english/OpenSans.ttf') format('truetype');
                font-weight: 100 900;
            }
            @font-face {
                font-family: 'Roboto';
                src: url('./fonts/english/Roboto.ttf') format('truetype');
                font-weight: 100 900;
            }
            @font-face {
                font-family: 'FiraSans';
                src: url('./fonts/english/FiraSans-Regular.ttf') format('truetype');
                font-weight: 400;
            }
            @font-face {
                font-family: 'FiraSans';
                src: url('./fonts/english/FiraSans-Bold.ttf') format('truetype');
                font-weight: 700;
            }

            /* Bundled Code Fonts */
            @font-face {
                font-family: 'FiraCode';
                src: url('./fonts/code/FiraCode-Regular.woff2') format('woff2');
                font-weight: 400;
            }
            @font-face {
                font-family: 'FiraCode';
                src: url('./fonts/code/FiraCode-Bold.woff2') format('woff2');
                font-weight: 700;
            }
            @font-face {
                font-family: 'JetBrainsMono';
                src: url('./fonts/code/JetBrainsMono-Regular.woff2') format('woff2');
                font-weight: 400;
            }
            @font-face {
                font-family: 'JetBrainsMono';
                src: url('./fonts/code/JetBrainsMono-Bold.woff2') format('woff2');
                font-weight: 700;
            }

            /* 
             * STRICT ISOLATION:
             * Apply RTL typography ONLY to Chat Panels and User Inputs.
             * Main Monaco Code Editor, Tree views, Menus and Tabs stay 100% UNTOUCHED.
             */
            .antigravity-agent-side-panel,
            .antigravity-agent-side-panel .prose,
            .antigravity-agent-side-panel [data-testid="chat-message"],
            .antigravity-agent-side-panel .markdown-body,
            .antigravity-agent-side-panel .leading-relaxed,
            .antigravity-agent-side-panel [contenteditable="true"],
            .antigravity-agent-side-panel [data-lexical-text="true"],
            .antigravity-agent-side-panel label[for^="ask-opt-"],
            .antigravity-agent-side-panel textarea[data-testid="ask-question-writein"],
            .interactive-session .value,
            .monaco-chat-request,
            .monaco-chat-response,
            .interactive-input-part {
                font-family: ${faFontStr}, ${enFontStr} var(--vscode-font-family, ui-sans-serif), system-ui, sans-serif !important;
            }

            /* Chat Paragraphs and Font Sizing */
            .antigravity-agent-side-panel .prose,
            .antigravity-agent-side-panel [data-testid="chat-message"],
            .antigravity-agent-side-panel .markdown-body,
            .antigravity-agent-side-panel .leading-relaxed,
            .antigravity-agent-side-panel [contenteditable="true"],
            .antigravity-agent-side-panel [contenteditable="true"] p,
            .interactive-session .value,
            .monaco-chat-response {
                font-size: ${fs}px !important;
            }

            .antigravity-agent-side-panel p,
            .antigravity-agent-side-panel h1,
            .antigravity-agent-side-panel h2,
            .antigravity-agent-side-panel h3,
            .antigravity-agent-side-panel h4,
            .antigravity-agent-side-panel h5,
            .antigravity-agent-side-panel h6,
            .antigravity-agent-side-panel ul,
            .antigravity-agent-side-panel ol,
            .interactive-session p,
            .monaco-chat-response p {
                unicode-bidi: plaintext;
                text-align: start;
            }

            .antigravity-agent-side-panel label[for^="ask-opt-"] {
                unicode-bidi: plaintext;
                text-align: start;
            }
            .antigravity-agent-side-panel label[for^="ask-opt-"][dir="rtl"] {
                direction: rtl;
                text-align: right;
            }
            .antigravity-agent-side-panel textarea[data-testid="ask-question-writein"] {
                unicode-bidi: plaintext;
                text-align: start;
            }

            ${forceRtlRule}

            /* RTL List Padding Fixes */
            .antigravity-agent-side-panel ul:not(#_)[dir="rtl"], 
            .antigravity-agent-side-panel ol:not(#_)[dir="rtl"],
            .antigravity-agent-side-panel [dir="rtl"] ul:not(#_), 
            .antigravity-agent-side-panel [dir="rtl"] ol:not(#_) {
                padding-left: 0 !important;
                padding-right: 1.25rem !important;
            }
            
            .antigravity-agent-side-panel [dir="rtl"] ul:not(#_) ul:not(#_), 
            .antigravity-agent-side-panel [dir="rtl"] ul:not(#_) ol:not(#_),
            .antigravity-agent-side-panel [dir="rtl"] ol:not(#_) ul:not(#_), 
            .antigravity-agent-side-panel [dir="rtl"] ol:not(#_) ol:not(#_) {
                padding-left: 0 !important;
                padding-right: 2.5rem !important;
            }

            /* Thinking & Chain-of-Thought Blocks (Must stay strictly LTR) */
            .antigravity-agent-side-panel .cursor-edit.text-secondary-foreground,
            .antigravity-agent-side-panel .cursor-edit.text-secondary-foreground * {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
            }

            /* Code Blocks in Chat (Must stay strictly LTR and Monospace) */
            .antigravity-agent-side-panel pre,
            .antigravity-agent-side-panel code,
            .antigravity-agent-side-panel pre *,
            .antigravity-agent-side-panel code * {
                unicode-bidi: isolate !important;
                direction: ltr !important;
                text-align: left !important;
                font-family: ${codeFontStr} !important;
            }

            /* Chat Line Height */
            .antigravity-agent-side-panel .leading-relaxed {
                line-height: ${lh} !important;
            }

            .antigravity-agent-side-panel .prose p, 
            .antigravity-agent-side-panel .prose li, 
            .antigravity-agent-side-panel .markdown-body p, 
            .antigravity-agent-side-panel [data-testid="chat-message"] p, 
            .antigravity-agent-side-panel [data-testid="chat-message"] .leading-relaxed, 
            .antigravity-agent-side-panel [data-testid="user-input-step"], 
            .antigravity-agent-side-panel [data-testid="user-input-step"] div, 
            .antigravity-agent-side-panel [data-lexical-text="true"], 
            .antigravity-agent-side-panel [contenteditable="true"], 
            .antigravity-agent-side-panel [contenteditable="true"] p, 
            .antigravity-agent-side-panel label[for^="ask-opt-"],
            .interactive-session .value p {
                line-height: ${lh} !important;
            }

            /* Input Area */
            .antigravity-agent-side-panel [contenteditable="true"], 
            .antigravity-agent-side-panel [contenteditable="true"] * {
                unicode-bidi: isolate !important;
                text-align: start !important;
            }

            /* Protection for Monaco Code Editor */
            .monaco-editor,
            .monaco-editor *,
            .monaco-workbench .part.editor * {
                text-align: initial;
            }
        `;
    };

    if (isRTL) {
        document.head.appendChild(rtlStyle);
        updateDynamicCSS(rtlConfig.faFont, rtlConfig.enFont, rtlConfig.codeFont, rtlConfig.lh, rtlConfig.fs);
    }

    // 4. Direction Updater Function (Scoped to Chat)
    function updateDir() {
        if (!isRTL) return;

        const inputs = document.querySelectorAll(`
            .antigravity-agent-side-panel [contenteditable="true"] p,
            .antigravity-agent-side-panel [contenteditable="true"],
            .antigravity-agent-side-panel textarea[data-testid="ask-question-writein"],
            .interactive-input-part [contenteditable="true"],
            .interactive-input-part textarea
        `);

        inputs.forEach(el => {
            const raw = el.tagName === 'TEXTAREA' ? el.value : el.textContent;
            const text = (raw || '').replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
            if (text.length > 0) {
                const isRtlText = /^[^a-zA-Z]*[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(text);
                const newDir = isRtlText ? 'rtl' : 'ltr';
                if (el.getAttribute('dir') !== newDir) el.setAttribute('dir', newDir);
            } else {
                if (el.hasAttribute('dir')) el.removeAttribute('dir');
            }
        });

        const chatOutputs = document.querySelectorAll(`
            .antigravity-agent-side-panel .prose > *,
            .antigravity-agent-side-panel [data-testid="chat-message"] > *,
            .antigravity-agent-side-panel .markdown-body > *,
            .antigravity-agent-side-panel .leading-relaxed > *,
            .antigravity-agent-side-panel [data-testid="user-input-step"],
            .antigravity-agent-side-panel [data-testid="user-input-step"] > *,
            .antigravity-agent-side-panel div:has(> [role="radiogroup"]),
            .antigravity-agent-side-panel label[for^="ask-opt-"],
            .interactive-session .value > *,
            .monaco-chat-response > *
        `);

        chatOutputs.forEach(el => {
            if (el.tagName === 'PRE' || el.tagName === 'CODE') return;
            if (el.closest('pre, code, .cursor-edit.text-secondary-foreground')) return;

            const text = (el.textContent || '').replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
            let dir = 'auto';

            if (forceRTL) {
                dir = 'rtl';
            } else if (text) {
                const firstChar = text.match(/[A-Za-z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/);
                if (firstChar) {
                    const isPersianOrArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(firstChar[0]);
                    dir = isPersianOrArabic ? 'rtl' : 'ltr';
                }
            }

            if (el.getAttribute('dir') !== dir) {
                el.setAttribute('dir', dir);
            }
        });
    }

    document.addEventListener('input', updateDir, { capture: true });
    document.addEventListener('focusin', updateDir, { capture: true });

    // Locate Chat Box specifically in IDE
    function getChatBox() {
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

    function attachWidget() {
        let container = document.querySelector('.rtl-widget-container');
        if (!container) {
            createWidget();
            container = document.querySelector('.rtl-widget-container');
            if (!container) return;
        }

        const chatBox = getChatBox();
        if (chatBox && chatBox !== document.body) {
            const cs = window.getComputedStyle(chatBox);
            if (cs.position === 'static') {
                chatBox.style.setProperty('position', 'relative', 'important');
            }
            if (container.parentNode !== chatBox) {
                chatBox.appendChild(container);
            }
        } else if (container.parentNode !== document.body) {
            document.body.appendChild(container);
        }
    }

    let updateDirRAF = null;
    const observer = new MutationObserver(() => {
        attachWidget();
        if (!isRTL) return;
        if (updateDirRAF) cancelAnimationFrame(updateDirRAF);
        updateDirRAF = requestAnimationFrame(updateDir);
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    setInterval(updateDir, 600);

    // Keyboard Shortcuts: Alt + R to toggle, Shift + 2 for @
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

    // 7. Create Floating Settings Widget with Smart 4-Corner Snap CONFINED TO CHAT BOX
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

    function createWidget() {
        if (document.querySelector('.rtl-widget-container')) return;

        const widgetWrapper = document.createElement('div');
        setSafeHTML(widgetWrapper, `
            <div class="rtl-widget-container corner-${currentCorner}">
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
                        <svg height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 14h6m-6-4h16m-6 8h6M4 6h16"/>
                        </svg>
                        <span>RZ Antigravity RTL</span>
                    </div>

                    <!-- Enabled Toggle -->
                    <div class="rtl-row">
                        <div style="display: flex; align-items: center;">
                            <span id="rtl-toggle-label" class="rtl-label">${isRTL ? 'Enabled' : 'Disabled'}</span>
                            <div class="rtl-info-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor">
                                    <path d="M450-290h60V-520H450v230Zm52.92-307.75q9.38-9.29 9.38-23.02t-9.29-23.02T480-653.07t-23.02,9.29t-9.29,23.02t9.38,23.02T480-588.46t22.92-9.29ZM480.07-100q-78.84,0-148.2-29.92T211.18-211.13T129.93-331.76T100-479.93t29.92-148.2t81.21-120.68t120.63-81.25T479.93-860t148.2,29.92t120.68,81.21t81.25,120.63T860-480.07t-29.92,148.2T748.87-211.18T628.24-129.93T480.07-100ZM480-160q134,0 227-93t93-227T707-707T480-800T253-707T160-480t93,227t227,93Zm0-320Z"></path>
                                </svg>
                                <div class="rtl-tooltip">Shortcut: Alt + R</div>
                            </div>
                        </div>
                        <button id="rtl-toggle-btn" type="button" role="switch" aria-checked="${isRTL}" class="rtl-toggle-btn-reset ${isRTL ? 'active' : ''}">
                            <span id="rtl-toggle-knob" class="rtl-toggle-knob"></span>
                        </button>
                    </div>

                    <!-- Settings Controls -->
                    <div id="rtl-settings-wrapper" style="display: flex; flex-direction: column; gap: 4px; transition: opacity 0.2s; ${isRTL ? '' : 'opacity: 0.4; pointer-events: none;'}">
                        <!-- Force RTL Switch -->
                        <div class="rtl-row">
                            <div style="display: flex; align-items: center;">
                                <span class="rtl-label">Force RTL</span>
                                <div class="rtl-info-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor">
                                        <path d="M450-290h60V-520H450v230Zm52.92-307.75q9.38-9.29 9.38-23.02t-9.29-23.02T480-653.07t-23.02,9.29t-9.29,23.02t9.38,23.02T480-588.46t22.92-9.29ZM480.07-100q-78.84,0-148.2-29.92T211.18-211.13T129.93-331.76T100-479.93t29.92-148.2t81.21-120.68t120.63-81.25T479.93-860t148.2,29.92t120.68,81.21t81.25,120.63T860-480.07t-29.92,148.2T748.87-211.18T628.24-129.93T480.07-100ZM480-160q134,0 227-93t93-227T707-707T480-800T253-707T160-480t93,227t227,93Zm0-320Z"></path>
                                    </svg>
                                    <div class="rtl-tooltip" style="width: 170px;">Forces Chat messages to RTL even if starting with English.</div>
                                </div>
                            </div>
                            <button id="rtl-force-btn" type="button" role="switch" aria-checked="${forceRTL}" class="rtl-toggle-btn-reset ${forceRTL ? 'active' : ''}">
                                <span class="rtl-toggle-knob"></span>
                            </button>
                        </div>

                        <div class="rtl-separator"></div>

                        <!-- Persian Font Dropdown (Custom Animated) -->
                        <div class="rtl-row">
                            <span class="rtl-label" title="Persian/Arabic Font">FA/AR Font</span>
                            <div class="rtl-dropdown" id="rtl-fafont-dropdown">
                                <div class="rtl-dropdown-trigger">
                                    <span class="rtl-dropdown-label ${rtlConfig.faFont ? 'active' : 'muted'}">Default (Vazirmatn)</span>
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
                                    <span class="rtl-dropdown-label ${rtlConfig.enFont ? 'active' : 'muted'}">Default (System)</span>
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
                                    <span class="rtl-dropdown-label ${rtlConfig.codeFont ? 'active' : 'muted'}">Default (Monospace)</span>
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
                                <input id="rtl-lh-input" type="range" min="1.2" max="2.5" step="0.1" value="${rtlConfig.lh || '1.6'}" style="width: 70px; cursor: pointer; accent-color: #D0FE1B;">
                                <span id="rtl-lh-val" class="rtl-slider-val">${rtlConfig.lh || '1.6'}</span>
                                <button id="rtl-lh-reset" type="button" style="background: none; border: none; cursor: pointer; opacity: 0.65; color: inherit; padding: 2px;" title="Reset to 1.6">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                </button>
                            </div>
                        </div>

                        <!-- Font Size Slider + Animated Value + Reset -->
                        <div class="rtl-row">
                            <span class="rtl-label" title="Chat Font Size">Font Size</span>
                            <div style="display: flex; align-items: center; gap: 5px;">
                                <input id="rtl-fs-input" type="range" min="11" max="22" step="1" value="${rtlConfig.fs || '14'}" style="width: 70px; cursor: pointer; accent-color: #D0FE1B;">
                                <span id="rtl-fs-val" class="rtl-slider-val">${rtlConfig.fs || '14'}px</span>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor">
                                        <path d="M450-290h60V-520H450v230Zm52.92-307.75q9.38-9.29 9.38-23.02t-9.29-23.02T480-653.07t-23.02,9.29t-9.29,23.02t9.38,23.02T480-588.46t22.92-9.29ZM480.07-100q-78.84,0-148.2-29.92T211.18-211.13T129.93-331.76T100-479.93t29.92-148.2t81.21-120.68t120.63-81.25T479.93-860t148.2,29.92t120.68,81.21t81.25,120.63T860-480.07t-29.92,148.2T748.87-211.18T628.24-129.93T480.07-100ZM480-160q134,0 227-93t93-227T707-707T480-800T253-707T160-480t93,227t227,93Zm0-320Z"></path>
                                    </svg>
                                    <div class="rtl-tooltip" style="width: 160px;">Forces Shift+2 to type '@' instead of '٬' on Persian keyboard.</div>
                                </div>
                            </div>
                            <button id="rtl-at-btn" type="button" role="switch" aria-checked="${fixAtSign}" class="rtl-toggle-btn-reset ${fixAtSign ? 'active' : ''}">
                                <span class="rtl-toggle-knob"></span>
                            </button>
                        </div>
                    </div>

                    <div class="rtl-separator"></div>

                    <!-- GitHub Star Link -->
                    <a href="https://github.com/rezasalimi01/rz-antigravity-rtl" target="_blank" class="rtl-github-link">
                        <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                        </svg>
                        Star on GitHub
                    </a>
                </div>
            </div>
        `);

        const widgetEl = widgetWrapper.firstElementChild;
        if (!widgetEl) return;

        const chatBox = getChatBox() || document.querySelector('.monaco-workbench') || document.body;
        if (chatBox) {
            if (chatBox.style.position !== 'relative' && chatBox.style.position !== 'absolute') {
                chatBox.style.position = 'relative';
            }
            chatBox.appendChild(widgetEl);
        }

        // Bind Controls
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
                // Close other open dropdowns
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

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            document.querySelectorAll('.rtl-dropdown.open').forEach(d => d.classList.remove('open'));
        });

        // Initialize Dropdowns
        const faDropdown = setupDropdown('rtl-fafont-dropdown', rtlConfig.faFont, () => onFontChange());
        const enDropdown = setupDropdown('rtl-enfont-dropdown', rtlConfig.enFont, () => onFontChange());
        const codeDropdown = setupDropdown('rtl-codefont-dropdown', rtlConfig.codeFont, () => onFontChange());

        // Apply Corner Styling & Position
        function applyCorner(corner) {
            currentCorner = corner;
            localStorage.setItem('rz-widget-corner', corner);
            container.classList.remove('corner-br', 'corner-bl', 'corner-tr', 'corner-tl');
            container.classList.add(`corner-${corner}`);
            container.style.removeProperty('left');
            container.style.removeProperty('right');
            container.style.removeProperty('top');
            container.style.removeProperty('bottom');
        }

        applyCorner(currentCorner);

        // Smart Dragging STRICTLY CONFINED TO CHAT BOX
        let isMouseDown = false;
        let isDragging = false;
        let startX = 0, startY = 0;
        let initialLeft = 0, initialTop = 0;
        let boxRect = null;

        trigger.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            isMouseDown = true;
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;

            const chatBox = getChatBox();
            boxRect = chatBox ? chatBox.getBoundingClientRect() : document.body.getBoundingClientRect();
            const elemRect = container.getBoundingClientRect();

            initialLeft = elemRect.left - boxRect.left;
            initialTop = elemRect.top - boxRect.top;
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
                if (!boxRect) {
                    const chatBox = getChatBox();
                    boxRect = chatBox ? chatBox.getBoundingClientRect() : document.body.getBoundingClientRect();
                }
                const minX = 8;
                const maxX = Math.max(minX, boxRect.width - 46);
                const minY = 8;
                const maxY = Math.max(minY, boxRect.height - 46);

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

                const chatBox = getChatBox();
                const bRect = chatBox ? chatBox.getBoundingClientRect() : document.body.getBoundingClientRect();
                const elemRect = container.getBoundingClientRect();
                const centerX = (elemRect.left + elemRect.right) / 2 - bRect.left;
                const centerY = (elemRect.top + elemRect.bottom) / 2 - bRect.top;

                const isLeft = centerX < (bRect.width / 2);
                const isTop = centerY < (bRect.height / 2);

                const corner = (isTop ? 't' : 'b') + (isLeft ? 'l' : 'r');
                applyCorner(corner);

                setTimeout(() => { isDragging = false; }, 60);
            } else {
                // Regular Click: Toggle Open
                e.stopPropagation();
                container.classList.toggle('open');
                if (!container.classList.contains('open')) {
                    document.querySelectorAll('.rtl-dropdown.open').forEach(d => d.classList.remove('open'));
                }
            }
            boxRect = null;
        });

        // Close on clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                container.classList.remove('open');
                document.querySelectorAll('.rtl-dropdown.open').forEach(d => d.classList.remove('open'));
            }
        });

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
            } catch (e) {}
        };

        window.setRTLActive = function(active) {
            isRTL = active;
            saveConfig();
            toggleBtn.setAttribute('aria-checked', String(isRTL));
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

                // Clear dir attributes in chat
                document.querySelectorAll('.antigravity-agent-side-panel [dir]').forEach(el => el.removeAttribute('dir'));
            }
        };

        toggleBtn.addEventListener('click', () => {
            setRTLActive(!isRTL);
        });

        forceBtn.addEventListener('click', () => {
            forceRTL = !forceRTL;
            saveConfig();
            forceBtn.setAttribute('aria-checked', String(forceRTL));
            forceBtn.classList.toggle('active', forceRTL);
            updateDynamicCSS(faDropdown.getValue(), enDropdown.getValue(), codeDropdown.getValue(), lhInput.value, fsInput.value);
            updateDir();
        });

        atBtn.addEventListener('click', () => {
            fixAtSign = !fixAtSign;
            saveConfig();
            atBtn.setAttribute('aria-checked', String(fixAtSign));
            atBtn.classList.toggle('active', fixAtSign);
        });

        const onFontChange = () => {
            saveConfig();
            updateDynamicCSS(faDropdown.getValue(), enDropdown.getValue(), codeDropdown.getValue(), lhInput.value, fsInput.value);
        };

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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createWidget();
            attachWidget();
            updateDir();
        });
    } else {
        createWidget();
        attachWidget();
        updateDir();
    }

    setTimeout(attachWidget, 400);
    setTimeout(attachWidget, 1200);
    setTimeout(attachWidget, 2500);
    setTimeout(attachWidget, 5000);
})();
