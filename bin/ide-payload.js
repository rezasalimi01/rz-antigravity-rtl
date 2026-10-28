/* RZ ANTIGRAVITY RTL - IDE PAYLOAD */
(function() {
    // 1. Configuration Management
    let rtlConfig = {
        faFont: '',
        enFont: '',
        codeFont: '',
        lh: '1.7',
        fs: '15',
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

    // 2. Permanent Widget & Base CSS (#D0FE1B on #000000 Theme)
    if (!document.getElementById('rtl-widget-style')) {
        const widgetStyle = document.createElement('style');
        widgetStyle.id = 'rtl-widget-style';
        widgetStyle.textContent = `
            /* Topbar Button Styling in IDE Header */
            #rtl-topbar-wrapper,
            .rtl-topbar-wrapper {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                position: relative !important;
                margin: 0 2px !important;
                padding: 0 !important;
                flex-shrink: 0 !important;
                line-height: 1 !important;
            }

            /* Topbar Button Base (Twin of Desktop button adapted for IDE Header) */
            #rtl-topbar-btn,
            .rtl-topbar-btn {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                height: 28px !important;
                padding: 0 10px !important;
                gap: 6px !important;
                font-size: 13.5px !important;
                font-weight: 500 !important;
                line-height: 1 !important;
                border-radius: 6px !important;
                border: 1px solid rgba(255, 255, 255, 0.14) !important;
                background-color: transparent !important;
                color: #a1a1aa !important;
                cursor: pointer !important;
                outline: none !important;
                user-select: none !important;
                white-space: nowrap !important;
                transition: all 0.16s ease !important;
                font-family: inherit !important;
                box-sizing: border-box !important;
            }

            #rtl-topbar-btn #rtl-topbar-text,
            .rtl-topbar-btn #rtl-topbar-text {
                color: inherit !important;
                font-weight: 500 !important;
                font-size: 12px !important;
                line-height: 1 !important;
                transition: color 0.16s ease, text-shadow 0.16s ease !important;
            }

            #rtl-topbar-btn svg,
            .rtl-topbar-btn svg {
                color: inherit !important;
                stroke: currentColor !important;
                transition: stroke 0.16s ease, filter 0.16s ease !important;
                flex-shrink: 0 !important;
            }

            /* Default Inactive Hover */
            #rtl-topbar-btn:not(.active):hover,
            .rtl-topbar-btn:not(.active):hover {
                background-color: rgba(255, 255, 255, 0.08) !important;
                color: #ffffff !important;
                border-color: rgba(255, 255, 255, 0.25) !important;
            }

            /* Active State: text and icon turn to Volt primary neon green (#D0FE1B) */
            #rtl-topbar-btn.active,
            .rtl-topbar-btn.active {
                border-color: rgba(208, 254, 27, 0.45) !important;
                background-color: rgba(208, 254, 27, 0.08) !important;
                color: #D0FE1B !important;
            }

            #rtl-topbar-btn.active:hover,
            .rtl-topbar-btn.active:hover {
                background-color: rgba(208, 254, 27, 0.16) !important;
                border-color: rgba(208, 254, 27, 0.6) !important;
                color: #D0FE1B !important;
            }

            #rtl-topbar-btn.active #rtl-topbar-text,
            .rtl-topbar-btn.active #rtl-topbar-text {
                color: #D0FE1B !important;
                font-weight: 600 !important;
                text-shadow: 0 0 10px rgba(208, 254, 27, 0.35) !important;
            }

            #rtl-topbar-btn.active svg,
            .rtl-topbar-btn.active svg {
                stroke: #D0FE1B !important;
                color: #D0FE1B !important;
                filter: drop-shadow(0 0 6px rgba(208, 254, 27, 0.4)) !important;
            }

            /* Panel Open State */
            #rtl-topbar-btn.panel-open:not(.active),
            .rtl-topbar-btn.panel-open:not(.active) {
                background-color: rgba(255, 255, 255, 0.12) !important;
                color: #ffffff !important;
            }

            /* Portaled Obsidian & Volt Panel */
            #rtl-widget-panel-portal {
                position: fixed !important;
                z-index: 2147483647 !important;
                width: 264px !important;
                box-sizing: border-box !important;
                background: rgba(8, 8, 10, 0.95) !important;
                backdrop-filter: blur(24px) saturate(190%) !important;
                -webkit-backdrop-filter: blur(24px) saturate(190%) !important;
                color: #ffffff !important;
                border: 1px solid rgba(208, 254, 27, 0.25) !important;
                border-radius: 16px !important;
                padding: 13px 14px !important;
                box-shadow: 0 28px 56px -10px rgba(0, 0, 0, 0.96), 0 16px 32px -6px rgba(0, 0, 0, 0.86), 0 0 25px rgba(208, 254, 27, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
                transform-origin: top right !important;
                transform: scale(0.85) translateY(-8px) !important;
                opacity: 0 !important;
                filter: blur(8px) !important;
                pointer-events: none !important;
                will-change: transform, opacity, filter !important;
                transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.34, 1.45, 0.64, 1), filter 0.2s ease !important;
                user-select: none !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                direction: ltr !important;
                color-scheme: dark !important;
            }

            #rtl-widget-panel-portal.open {
                transform: scale(1) translateY(0) !important;
                opacity: 1 !important;
                filter: blur(0px) !important;
                pointer-events: auto !important;
            }
            .rtl-panel-header {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding-bottom: 4px !important;
                margin-bottom: 0 !important;
                border-bottom: none !important;
                user-select: none !important;
            }
            .rtl-header-title {
                font-size: 11px !important;
                font-weight: 600 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.06em !important;
                color: #a1a1aa !important;
                line-height: 1.2 !important;
                white-space: nowrap !important;
            }
            /* Shortcut KBD Badge */
            .rtl-kbd {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                min-width: 17px !important;
                height: 17px !important;
                padding: 0 4px !important;
                font-size: 10px !important;
                font-weight: 600 !important;
                line-height: 1 !important;
                color: #a1a1aa !important;
                background-color: rgba(255, 255, 255, 0.08) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 4px !important;
                box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2) !important;
            }
            .rtl-row {
                position: relative !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 8px !important;
                height: 28px !important;
                min-height: 28px !important;
                margin-bottom: 0 !important;
                font-size: 12px !important;
                box-sizing: border-box !important;
            }
            .rtl-label {
                font-size: 12px !important;
                font-weight: 500 !important;
                color: #d4d4d8 !important;
                opacity: 0.9 !important;
                white-space: nowrap !important;
                line-height: 1.2 !important;
            }
            .rtl-separator {
                display: block !important;
                height: 1px !important;
                background-color: rgba(255, 255, 255, 0.08) !important;
                margin: 8px -14px !important;
                width: calc(100% + 28px) !important;
                box-sizing: border-box !important;
                border: none !important;
            }
            .rtl-separator-spaced {
                margin-top: 13px !important;
                margin-bottom: 13px !important;
            }
            .rtl-row-section-start {
                margin-top: 8px !important;
            }
            
            /* Animated Sliders & Number Badges with Counter Effect */
            .rtl-slider-val {
                font-weight: 500 !important;
                color: #D0FE1B !important;
                font-size: 11px !important;
                width: 36px !important;
                min-width: 36px !important;
                max-width: 36px !important;
                box-sizing: border-box !important;
                height: 18px !important;
                text-align: center !important;
                background: rgba(208, 254, 27, 0.1) !important;
                border: 1px solid rgba(208, 254, 27, 0.28) !important;
                border-radius: 5px !important;
                padding: 0 !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                overflow: hidden !important;
                position: relative !important;
                flex-shrink: 0 !important;
                transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, box-shadow 0.2s ease !important;
            }

            .rtl-slider-val.val-pop {
                transform: scale(1.18) !important;
                background: rgba(208, 254, 27, 0.25) !important;
                box-shadow: 0 0 10px rgba(208, 254, 27, 0.45) !important;
            }

            .rtl-val-text {
                display: inline-block !important;
                line-height: 1 !important;
            }

            .rtl-val-text.slide-up {
                animation: rtlValSlideUp 0.16s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
            }

            .rtl-val-text.slide-down {
                animation: rtlValSlideDown 0.16s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
            }

            @keyframes rtlValSlideUp {
                0% { transform: translateY(7px); opacity: 0.2; }
                100% { transform: translateY(0); opacity: 1; }
            }

            @keyframes rtlValSlideDown {
                0% { transform: translateY(-7px); opacity: 0.2; }
                100% { transform: translateY(0); opacity: 1; }
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
                color-scheme: dark !important;
                scrollbar-width: thin !important;
                scrollbar-color: rgba(255, 255, 255, 0.2) transparent !important;
            }

            .rtl-dropdown-menu::-webkit-scrollbar {
                width: 5px !important;
                height: 5px !important;
            }

            .rtl-dropdown-menu::-webkit-scrollbar-track {
                background: transparent !important;
                margin: 4px 0 !important;
            }

            .rtl-dropdown-menu::-webkit-scrollbar-thumb {
                background-color: rgba(255, 255, 255, 0.2) !important;
                border-radius: 9999px !important;
            }

            .rtl-dropdown-menu::-webkit-scrollbar-thumb:hover {
                background-color: rgba(255, 255, 255, 0.35) !important;
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

            /* Switches (Matching base code: h-6 w-11) */
            .rtl-toggle-btn-reset {
                position: relative !important;
                display: inline-flex !important;
                align-items: center !important;
                width: 44px !important;
                height: 24px !important;
                border-radius: 9999px !important;
                border: none !important;
                cursor: pointer !important;
                outline: none !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                flex-shrink: 0 !important;
                background-color: rgba(255, 255, 255, 0.16) !important;
                transition: background-color 0.2s ease, box-shadow 0.2s ease !important;
            }
            .rtl-toggle-btn-reset:hover {
                background-color: rgba(255, 255, 255, 0.22) !important;
            }
            .rtl-toggle-btn-reset.active {
                background-color: #D0FE1B !important;
                box-shadow: 0 0 12px rgba(208, 254, 27, 0.45) !important;
            }
            .rtl-toggle-knob {
                position: absolute !important;
                top: 4px !important;
                left: 4px !important;
                width: 16px !important;
                height: 16px !important;
                border-radius: 50% !important;
                background-color: #ffffff !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4) !important;
                transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease !important;
                transform: translateX(0px) !important;
            }
            .rtl-toggle-btn-reset.active .rtl-toggle-knob {
                transform: translateX(20px) !important;
                background-color: #08080a !important;
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
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                line-height: 1.3 !important;
                white-space: normal !important;
                box-sizing: border-box !important;
                width: 140px !important;
                max-width: 140px !important;
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
            .rtl-reset-btn {
                background: none !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                cursor: pointer !important;
                opacity: 0.65 !important;
                color: #71717a !important;
                padding: 2px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: opacity 0.2s ease, color 0.2s ease !important;
                -webkit-tap-highlight-color: transparent !important;
            }
            .rtl-reset-btn:focus,
            .rtl-reset-btn:focus-visible {
                outline: none !important;
                box-shadow: none !important;
                border: none !important;
            }
            .rtl-reset-btn:hover {
                opacity: 1 !important;
                color: #D0FE1B !important;
                outline: none !important;
                box-shadow: none !important;
            }
            .rtl-reset-btn:active {
                opacity: 1 !important;
                color: #D0FE1B !important;
                outline: none !important;
                box-shadow: none !important;
            }
            .rtl-reset-btn svg {
                display: block !important;
                transform-origin: center center !important;
            }
            .rtl-reset-btn.recoiling svg {
                animation: rtlResetRecoil 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
            }
            @keyframes rtlResetRecoil {
                0% { transform: rotate(0deg); }
                55% { transform: rotate(-180deg); }
                80% { transform: rotate(12deg); }
                100% { transform: rotate(0deg); }
            }
            .rtl-panel-footer {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                width: 100% !important;
                box-sizing: border-box !important;
                padding: 8px 0 4px 0 !important;
                margin: 0 !important;
            }
            .rtl-version-badge {
                display: inline-flex !important;
                align-items: center !important;
                font-size: 10px !important;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
                font-weight: 500 !important;
                color: #71717a !important;
                background-color: rgba(255, 255, 255, 0.05) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 4px !important;
                padding: 1px 5px !important;
                letter-spacing: 0.3px !important;
                line-height: 1.2 !important;
                user-select: none !important;
                transition: color 0.15s ease, border-color 0.15s ease !important;
            }
            .rtl-version-badge:hover {
                color: #a1a1aa !important;
                border-color: rgba(255, 255, 255, 0.16) !important;
            }
            .rtl-github-link {
                display: inline-flex !important;
                align-items: center !important;
                gap: 5px !important;
                font-size: 11px !important;
                font-weight: 600 !important;
                color: #D0FE1B !important;
                text-decoration: none !important;
                opacity: 0.85 !important;
                transition: opacity 0.15s ease, transform 0.15s ease, text-shadow 0.15s ease !important;
                transform-origin: left center !important;
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

        // English / General Font:
        // When enFont is empty (Default), preserve the IDE's real native font: var(--font-sans)
        // (which resolves to Inter or Google Sans Flex)
        // When enFont is specified (OpenSans, Roboto, FiraSans), place it right after Persian font.
        const defaultSansStack = 'var(--font-sans, var(--vscode-font-family, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif))';
        const textFontFamily = `${faFontStr}, ${enFont ? `'${enFont}', ` : ''}${defaultSansStack}`;

        // Code Font:
        // When codeFont is empty (Default), preserve the IDE's real native editor font:
        // var(--editor-font-family, var(--font-mono, 'Google Sans Code', monospace))
        // When codeFont is specified (FiraCode, JetBrainsMono), place it first!
        const defaultCodeStack = 'var(--editor-font-family, var(--font-mono, "Google Sans Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace))';
        const codeFontStack = codeFont
            ? `'${codeFont}', ${defaultCodeStack}`
            : defaultCodeStack;

        const forceRtlRule = (isRTL && forceRTL) ? `
            .antigravity-agent-side-panel .prose > *:not(pre):not(code),
            [data-testid="conversation-view"] .prose > *:not(pre):not(code),
            .part.auxiliarybar .prose > *:not(pre):not(code),
            .agent-driven-pane .prose > *:not(pre):not(code),
            .antigravity-agent-side-panel [data-testid="chat-message"] > *:not(pre):not(code),
            [data-testid="conversation-view"] [data-testid="chat-message"] > *:not(pre):not(code),
            .part.auxiliarybar [data-testid="chat-message"] > *:not(pre):not(code),
            .agent-driven-pane [data-testid="chat-message"] > *:not(pre):not(code),
            .antigravity-agent-side-panel .markdown-body > *:not(pre):not(code),
            [data-testid="conversation-view"] .markdown-body > *:not(pre):not(code),
            .part.auxiliarybar .markdown-body > *:not(pre):not(code),
            .antigravity-agent-side-panel .leading-relaxed > *:not(pre):not(code),
            [data-testid="conversation-view"] .leading-relaxed > *:not(pre):not(code),
            .part.auxiliarybar .leading-relaxed > *:not(pre):not(code),
            .antigravity-agent-side-panel [data-testid="user-input-step"],
            .antigravity-agent-side-panel [data-testid="user-input-step"] > *:not(pre):not(code),
            [data-testid="conversation-view"] [data-testid="user-input-step"],
            [data-testid="conversation-view"] [data-testid="user-input-step"] > *:not(pre):not(code),
            .antigravity-agent-side-panel div:has(> [role="radiogroup"]),
            [data-testid="conversation-view"] div:has(> [role="radiogroup"]),
            .antigravity-agent-side-panel label[for^="ask-opt-"],
            [data-testid="conversation-view"] label[for^="ask-opt-"],
            .interactive-session .value > *:not(pre):not(code),
            .monaco-chat-response > *:not(pre):not(code) {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }
        ` : '';

        rtlStyle.textContent = `
            /* Dynamic CSS Custom Properties for Chat */
            :root, :host, body {
                ${enFont ? `--font-sans: '${enFont}', var(--vscode-font-family, system-ui, sans-serif) !important;` : ''}
                ${codeFont ? `--editor-font-family: '${codeFont}', var(--font-mono, monospace) !important; --font-mono: '${codeFont}', monospace !important;` : ''}
            }

            /* Bundled Persian Fonts */
            @font-face {
                font-family: 'PersianOnlyFont';
                src: url('/Vazirmatn-Variable.woff2') format('woff2'),
                     url('./Vazirmatn-Variable.woff2') format('woff2'),
                     local('Vazirmatn'), local('Vazirmatn-Variable');
                font-weight: 100 900;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'IRANSansX';
                src: url('/fonts/persian/IRANSansX-Regular.woff2') format('woff2'),
                     url('./fonts/persian/IRANSansX-Regular.woff2') format('woff2'),
                     local('IRANSansX'), local('IRANSansX-Regular');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'IRANSansX';
                src: url('/fonts/persian/IRANSansX-Bold.woff2') format('woff2'),
                     url('./fonts/persian/IRANSansX-Bold.woff2') format('woff2'),
                     local('IRANSansX-Bold');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'IRANYekanX';
                src: url('/fonts/persian/IRANYekanX-Regular.woff2') format('woff2'),
                     url('./fonts/persian/IRANYekanX-Regular.woff2') format('woff2'),
                     local('IRANYekanX'), local('IRANYekanX-Regular');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'IRANYekanX';
                src: url('/fonts/persian/IRANYekanX-Bold.woff2') format('woff2'),
                     url('./fonts/persian/IRANYekanX-Bold.woff2') format('woff2'),
                     local('IRANYekanX-Bold');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Kalameh';
                src: url('/fonts/persian/Kalameh-Regular.woff2') format('woff2'),
                     url('./fonts/persian/Kalameh-Regular.woff2') format('woff2'),
                     local('Kalameh'), local('Kalameh-Regular');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Kalameh';
                src: url('/fonts/persian/Kalameh-Bold.woff2') format('woff2'),
                     url('./fonts/persian/Kalameh-Bold.woff2') format('woff2'),
                     local('Kalameh-Bold');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Noora';
                src: url('/fonts/persian/Noora-Regular.woff2') format('woff2'),
                     url('./fonts/persian/Noora-Regular.woff2') format('woff2'),
                     local('Noora'), local('Noora-Regular');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Noora';
                src: url('/fonts/persian/Noora-Bold.woff2') format('woff2'),
                     url('./fonts/persian/Noora-Bold.woff2') format('woff2'),
                     local('Noora-Bold');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Pelak';
                src: url('/fonts/persian/Pelak-Regular.woff2') format('woff2'),
                     url('./fonts/persian/Pelak-Regular.woff2') format('woff2'),
                     local('Pelak'), local('Pelak-Regular');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Pelak';
                src: url('/fonts/persian/Pelak-Bold.woff2') format('woff2'),
                     url('./fonts/persian/Pelak-Bold.woff2') format('woff2'),
                     local('Pelak-Bold');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Ravi';
                src: url('/fonts/persian/Ravi-Regular.woff2') format('woff2'),
                     url('./fonts/persian/Ravi-Regular.woff2') format('woff2'),
                     local('Ravi'), local('Ravi-Regular');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'Ravi';
                src: url('/fonts/persian/Ravi-Bold.woff2') format('woff2'),
                     url('./fonts/persian/Ravi-Bold.woff2') format('woff2'),
                     local('Ravi-Bold');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'YekanBakh';
                src: url('/fonts/persian/YekanBakh-Regular.woff2') format('woff2'),
                     url('./fonts/persian/YekanBakh-Regular.woff2') format('woff2'),
                     local('YekanBakh'), local('YekanBakh-Regular');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'YekanBakh';
                src: url('/fonts/persian/YekanBakh-Bold.woff2') format('woff2'),
                     url('./fonts/persian/YekanBakh-Bold.woff2') format('woff2'),
                     local('YekanBakh-Bold');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }

            /* Bundled English Fonts */
            @font-face {
                font-family: 'OpenSans';
                src: url('/fonts/english/OpenSans.ttf') format('truetype'),
                     url('./fonts/english/OpenSans.ttf') format('truetype'),
                     local('Open Sans'), local('OpenSans');
                font-weight: 100 900;
            }
            @font-face {
                font-family: 'Roboto';
                src: url('/fonts/english/Roboto.ttf') format('truetype'),
                     url('./fonts/english/Roboto.ttf') format('truetype'),
                     local('Roboto');
                font-weight: 100 900;
            }
            @font-face {
                font-family: 'FiraSans';
                src: url('/fonts/english/FiraSans-Regular.ttf') format('truetype'),
                     url('./fonts/english/FiraSans-Regular.ttf') format('truetype'),
                     local('Fira Sans'), local('FiraSans');
                font-weight: 400;
            }
            @font-face {
                font-family: 'FiraSans';
                src: url('/fonts/english/FiraSans-Bold.ttf') format('truetype'),
                     url('./fonts/english/FiraSans-Bold.ttf') format('truetype'),
                     local('Fira Sans Bold'), local('FiraSans-Bold');
                font-weight: 700;
            }

            /* Bundled Code Fonts */
            @font-face {
                font-family: 'FiraCode';
                src: url('/fonts/code/FiraCode-Regular.woff2') format('woff2'),
                     url('./fonts/code/FiraCode-Regular.woff2') format('woff2'),
                     local('Fira Code'), local('FiraCode');
                font-weight: 400;
            }
            @font-face {
                font-family: 'FiraCode';
                src: url('/fonts/code/FiraCode-Bold.woff2') format('woff2'),
                     url('./fonts/code/FiraCode-Bold.woff2') format('woff2'),
                     local('Fira Code Bold'), local('FiraCode-Bold');
                font-weight: 700;
            }
            @font-face {
                font-family: 'JetBrainsMono';
                src: url('/fonts/code/JetBrainsMono-Regular.woff2') format('woff2'),
                     url('./fonts/code/JetBrainsMono-Regular.woff2') format('woff2'),
                     local('JetBrains Mono'), local('JetBrainsMono');
                font-weight: 400;
            }
            @font-face {
                font-family: 'JetBrainsMono';
                src: url('/fonts/code/JetBrainsMono-Bold.woff2') format('woff2'),
                     url('./fonts/code/JetBrainsMono-Bold.woff2') format('woff2'),
                     local('JetBrains Mono Bold'), local('JetBrainsMono-Bold');
                font-weight: 700;
            }

            /* 
             * STRICT ISOLATION:
             * Apply RTL typography ONLY to Chat Panels and User Inputs.
             * Main Monaco Code Editor, Tree views, Menus and Tabs stay 100% UNTOUCHED.
             */
            .antigravity-agent-side-panel,
            [data-view-id="antigravity.agentSidePanel"],
            [data-testid="conversation-view"],
            .agent-driven-pane,
            .part.auxiliarybar,
            .antigravity-agent-side-panel .prose,
            [data-testid="conversation-view"] .prose,
            .part.auxiliarybar .prose,
            .prose,
            [data-testid="chat-message"],
            .markdown-body,
            .leading-relaxed,
            [contenteditable="true"],
            [data-lexical-text="true"],
            label[for^="ask-opt-"],
            textarea[data-testid="ask-question-writein"],
            .interactive-session .value,
            .monaco-chat-request,
            .monaco-chat-response,
            .interactive-input-part {
                font-family: ${textFontFamily} !important;
            }

            /* Chat Paragraphs and Font Sizing */
            .antigravity-agent-side-panel .prose,
            [data-testid="conversation-view"] .prose,
            .part.auxiliarybar .prose,
            .antigravity-agent-side-panel [data-testid="chat-message"],
            [data-testid="conversation-view"] [data-testid="chat-message"],
            .part.auxiliarybar [data-testid="chat-message"],
            .antigravity-agent-side-panel .markdown-body,
            [data-testid="conversation-view"] .markdown-body,
            .part.auxiliarybar .markdown-body,
            .antigravity-agent-side-panel .leading-relaxed,
            [data-testid="conversation-view"] .leading-relaxed,
            .part.auxiliarybar .leading-relaxed,
            .antigravity-agent-side-panel [contenteditable="true"],
            [data-testid="conversation-view"] [contenteditable="true"],
            .part.auxiliarybar [contenteditable="true"],
            .antigravity-agent-side-panel [contenteditable="true"] p,
            [data-testid="conversation-view"] [contenteditable="true"] p,
            .part.auxiliarybar [contenteditable="true"] p,
            .interactive-session .value,
            .monaco-chat-response {
                font-size: ${fs}px !important;
            }

            .antigravity-agent-side-panel p,
            [data-testid="conversation-view"] p,
            .part.auxiliarybar p,
            .antigravity-agent-side-panel h1,
            [data-testid="conversation-view"] h1,
            .antigravity-agent-side-panel h2,
            [data-testid="conversation-view"] h2,
            .antigravity-agent-side-panel h3,
            [data-testid="conversation-view"] h3,
            .antigravity-agent-side-panel h4,
            [data-testid="conversation-view"] h4,
            .antigravity-agent-side-panel h5,
            [data-testid="conversation-view"] h5,
            .antigravity-agent-side-panel h6,
            [data-testid="conversation-view"] h6,
            .antigravity-agent-side-panel ul,
            [data-testid="conversation-view"] ul,
            .antigravity-agent-side-panel ol,
            [data-testid="conversation-view"] ol,
            .interactive-session p,
            .monaco-chat-response p {
                unicode-bidi: plaintext;
                text-align: start;
            }

            .antigravity-agent-side-panel label[for^="ask-opt-"],
            [data-testid="conversation-view"] label[for^="ask-opt-"] {
                unicode-bidi: plaintext;
                text-align: start;
            }
            .antigravity-agent-side-panel label[for^="ask-opt-"][dir="rtl"],
            [data-testid="conversation-view"] label[for^="ask-opt-"][dir="rtl"] {
                direction: rtl;
                text-align: right;
            }
            .antigravity-agent-side-panel textarea[data-testid="ask-question-writein"],
            [data-testid="conversation-view"] textarea[data-testid="ask-question-writein"] {
                unicode-bidi: plaintext;
                text-align: start;
            }

            ${forceRtlRule}

            /* RTL List Padding Fixes */
            .antigravity-agent-side-panel ul:not(#_)[dir="rtl"], 
            [data-testid="conversation-view"] ul:not(#_)[dir="rtl"],
            .part.auxiliarybar ul:not(#_)[dir="rtl"],
            .antigravity-agent-side-panel ol:not(#_)[dir="rtl"],
            [data-testid="conversation-view"] ol:not(#_)[dir="rtl"],
            .part.auxiliarybar ol:not(#_)[dir="rtl"],
            .antigravity-agent-side-panel [dir="rtl"] ul:not(#_), 
            [data-testid="conversation-view"] [dir="rtl"] ul:not(#_),
            .part.auxiliarybar [dir="rtl"] ul:not(#_),
            .antigravity-agent-side-panel [dir="rtl"] ol:not(#_),
            [data-testid="conversation-view"] [dir="rtl"] ol:not(#_),
            .part.auxiliarybar [dir="rtl"] ol:not(#_) {
                padding-left: 0 !important;
                padding-right: 1.25rem !important;
            }
            
            .antigravity-agent-side-panel [dir="rtl"] ul:not(#_) ul:not(#_), 
            [data-testid="conversation-view"] [dir="rtl"] ul:not(#_) ul:not(#_),
            .antigravity-agent-side-panel [dir="rtl"] ul:not(#_) ol:not(#_),
            [data-testid="conversation-view"] [dir="rtl"] ul:not(#_) ol:not(#_),
            .antigravity-agent-side-panel [dir="rtl"] ol:not(#_) ul:not(#_), 
            [data-testid="conversation-view"] [dir="rtl"] ol:not(#_) ul:not(#_),
            .antigravity-agent-side-panel [dir="rtl"] ol:not(#_) ol:not(#_),
            [data-testid="conversation-view"] [dir="rtl"] ol:not(#_) ol:not(#_) {
                padding-left: 0 !important;
                padding-right: 2.5rem !important;
            }

            /* Thinking & Chain-of-Thought Blocks (Must stay strictly LTR) */
            .antigravity-agent-side-panel .cursor-edit.text-secondary-foreground,
            .antigravity-agent-side-panel .cursor-edit.text-secondary-foreground *,
            [data-testid="conversation-view"] .cursor-edit.text-secondary-foreground,
            [data-testid="conversation-view"] .cursor-edit.text-secondary-foreground *,
            .part.auxiliarybar .cursor-edit.text-secondary-foreground,
            .part.auxiliarybar .cursor-edit.text-secondary-foreground * {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
            }

            /* Code Blocks and Monospaced Text in Chat (Strictly LTR and Monospace) */
            pre,
            code,
            pre *,
            code *,
            .code-block,
            .code-block *,
            .font-mono,
            kbd,
            samp {
                unicode-bidi: isolate !important;
                direction: ltr !important;
                text-align: left !important;
                font-family: ${codeFontStack} !important;
            }

            /* Chat Line Height */
            .antigravity-agent-side-panel .leading-relaxed,
            [data-testid="conversation-view"] .leading-relaxed,
            .part.auxiliarybar .leading-relaxed {
                line-height: ${lh} !important;
            }

            .antigravity-agent-side-panel .prose p, 
            [data-testid="conversation-view"] .prose p,
            .antigravity-agent-side-panel .prose li, 
            [data-testid="conversation-view"] .prose li,
            .antigravity-agent-side-panel .markdown-body p, 
            [data-testid="conversation-view"] .markdown-body p,
            .antigravity-agent-side-panel [data-testid="chat-message"] p, 
            [data-testid="conversation-view"] [data-testid="chat-message"] p,
            .antigravity-agent-side-panel [data-testid="chat-message"] .leading-relaxed, 
            [data-testid="conversation-view"] [data-testid="chat-message"] .leading-relaxed,
            .antigravity-agent-side-panel [data-testid="user-input-step"], 
            [data-testid="conversation-view"] [data-testid="user-input-step"],
            .antigravity-agent-side-panel [data-testid="user-input-step"] div, 
            [data-testid="conversation-view"] [data-testid="user-input-step"] div,
            .antigravity-agent-side-panel [data-lexical-text="true"], 
            [data-testid="conversation-view"] [data-lexical-text="true"],
            .antigravity-agent-side-panel [contenteditable="true"], 
            [data-testid="conversation-view"] [contenteditable="true"],
            .antigravity-agent-side-panel [contenteditable="true"] p, 
            [data-testid="conversation-view"] [contenteditable="true"] p,
            .antigravity-agent-side-panel label[for^="ask-opt-"],
            [data-testid="conversation-view"] label[for^="ask-opt-"],
            .part.auxiliarybar .prose p,
            .part.auxiliarybar [contenteditable="true"],
            .interactive-session .value p {
                line-height: ${lh} !important;
            }

            /* Input Area */
            .antigravity-agent-side-panel [contenteditable="true"], 
            .antigravity-agent-side-panel [contenteditable="true"] *,
            [data-testid="conversation-view"] [contenteditable="true"], 
            [data-testid="conversation-view"] [contenteditable="true"] *,
            .part.auxiliarybar [contenteditable="true"], 
            .part.auxiliarybar [contenteditable="true"] * {
                unicode-bidi: isolate !important;
                text-align: start !important;
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
            [data-testid="conversation-view"] [contenteditable="true"] p,
            [data-testid="conversation-view"] [contenteditable="true"],
            [data-testid="conversation-view"] textarea,
            .antigravity-agent-side-panel [contenteditable="true"] p,
            .antigravity-agent-side-panel [contenteditable="true"],
            .antigravity-agent-side-panel textarea[data-testid="ask-question-writein"],
            .part.auxiliarybar [contenteditable="true"] p,
            .part.auxiliarybar [contenteditable="true"],
            .part.auxiliarybar textarea,
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
            [data-testid="conversation-view"] .prose > *,
            [data-testid="conversation-view"] [data-testid="chat-message"] > *,
            [data-testid="conversation-view"] .markdown-body > *,
            [data-testid="conversation-view"] .leading-relaxed > *,
            [data-testid="conversation-view"] [data-testid="user-input-step"],
            [data-testid="conversation-view"] [data-testid="user-input-step"] > *,
            [data-testid="conversation-view"] div:has(> [role="radiogroup"]),
            [data-testid="conversation-view"] label[for^="ask-opt-"],
            .antigravity-agent-side-panel .prose > *,
            .antigravity-agent-side-panel [data-testid="chat-message"] > *,
            .antigravity-agent-side-panel .markdown-body > *,
            .antigravity-agent-side-panel .leading-relaxed > *,
            .antigravity-agent-side-panel [data-testid="user-input-step"],
            .antigravity-agent-side-panel [data-testid="user-input-step"] > *,
            .antigravity-agent-side-panel div:has(> [role="radiogroup"]),
            .antigravity-agent-side-panel label[for^="ask-opt-"],
            .part.auxiliarybar .prose > *,
            .part.auxiliarybar [data-testid="chat-message"] > *,
            .part.auxiliarybar .markdown-body > *,
            .part.auxiliarybar .leading-relaxed > *,
            .part.auxiliarybar [data-testid="user-input-step"],
            .part.auxiliarybar [data-testid="user-input-step"] > *,
            .part.auxiliarybar div:has(> [role="radiogroup"]),
            .part.auxiliarybar label[for^="ask-opt-"],
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
    document.body.addEventListener('input', updateDir, { capture: true });
    document.body.addEventListener('focusin', updateDir, { capture: true });
    
    // Keyboard Shortcuts: Alt + R
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.code === 'KeyR') {
            e.preventDefault();
            setRTLActive(!isRTL);
        }
    });

    const isMac = /Mac/i.test(navigator.userAgent || navigator.platform);
    const shortcutKbdHtml = isMac 
        ? '<span class="flex items-center gap-1" style="display:inline-flex;align-items:center;gap:3px;"><kbd class="rtl-kbd">⌥</kbd><kbd class="rtl-kbd">R</kbd></span>'
        : '<span class="flex items-center gap-0.5" style="display:inline-flex;align-items:center;gap:2px;"><kbd class="rtl-kbd">Alt</kbd><span class="opacity-40 text-[9px] mx-0.5" style="opacity:0.4;font-size:9px;margin:0 2px;">+</span><kbd class="rtl-kbd">R</kbd></span>';

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

    // Clean up any legacy or duplicate RTL widget/panels from previous versions
    const legacyWidgets = document.querySelectorAll('.rtl-widget-container, .rtl-widget-trigger, #rtl-toggle-btn');
    legacyWidgets.forEach(el => {
        const container = el.closest('.rtl-widget-container') || el.closest('.fixed') || el;
        if (container && container.parentNode) container.parentNode.removeChild(container);
    });

    // 3. Create Native Header Button Trigger (RZ RTL)
    const widgetWrapper = document.createElement('div');
    widgetWrapper.id = 'rtl-topbar-wrapper';
    widgetWrapper.className = 'rtl-topbar-wrapper relative inline-flex items-center shrink-0';
    widgetWrapper.style.appRegion = 'no-drag';
    setSafeHTML(widgetWrapper, `
        <!-- Topbar Button in IDE Header -->
        <button id="rtl-topbar-btn" type="button" class="rtl-topbar-btn inline-flex items-center font-medium transition-colors select-none outline-none cursor-pointer justify-center border border-border bg-transparent text-secondary-foreground hover:text-foreground hover:bg-secondary h-7 text-sm rounded-md gap-1.5 px-2.5 whitespace-nowrap ${isRTL ? 'active' : ''}" style="app-region: no-drag;" title="RZ Antigravity RTL (${isMac ? '⌥R' : 'Alt+R'})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg><span id="rtl-topbar-text">RZ RTL</span></button>
    `);

    // 4. Create Portaled Panel
    const panel = document.createElement('div');
    panel.id = 'rtl-widget-panel-portal';
    setSafeHTML(panel, `
            <!-- Header -->
            <div class="rtl-panel-header flex items-center justify-between pb-1">
                <span class="rtl-header-title text-xs font-semibold uppercase tracking-wider text-muted-foreground">RZ Antigravity RTL</span>
                ${shortcutKbdHtml}
            </div>
            
            <div class="rtl-separator"></div>

            <!-- Toggles Category (Enable & Force RTL) -->
            <div class="flex flex-col gap-1.5" style="display: flex; flex-direction: column; gap: 6px;">
              <!-- Enable Toggle -->
              <div class="rtl-row flex items-center justify-between gap-4 h-7">
                <span id="rtl-toggle-label" class="rtl-label font-medium text-xs opacity-90">${isRTL ? 'Enabled' : 'Disabled'}</span>
                <button id="rtl-toggle-btn" type="button" role="switch" aria-checked="${isRTL}" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-6 w-11 ${isRTL ? 'active' : ''} cursor-pointer">
                  <span id="rtl-toggle-knob" class="rtl-toggle-knob"></span>
                </button>
              </div>

              <!-- Force RTL Toggle -->
              <div id="rtl-force-row" class="rtl-row flex items-center justify-between gap-2 h-7 transition-opacity ${isRTL ? '' : 'opacity-40 pointer-events-none'}" style="${isRTL ? '' : 'opacity: 0.4; pointer-events: none;'}">
                <div class="flex items-center" style="display: flex; align-items: center;">
                  <span class="rtl-label font-medium text-xs opacity-80 whitespace-nowrap">Force RTL</span>
                  <div class="rtl-info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor"><path d="M450-290h60V-520H450v230Zm52.92-307.75q9.38-9.29 9.38-23.02t-9.29-23.02T480-653.07t-23.02,9.29t-9.29,23.02t9.38,23.02T480-588.46t22.92-9.29ZM480.07-100q-78.84,0-148.2-29.92T211.18-211.13T129.93-331.76T100-479.93t29.92-148.2t81.21-120.68t120.63-81.25T479.93-860t148.2,29.92t120.68,81.21t81.25,120.63T860-480.07t-29.92,148.2T748.87-211.18T628.24-129.93T480.07-100ZM480-160q134,0 227-93t93-227T707-707T480-800T253-707T160-480t93,227t227,93Zm0-320Z"></path></svg>
                    <div class="rtl-tooltip">Forces Chat to RTL even if starting with English.</div>
                  </div>
                </div>
                <button id="rtl-force-btn" type="button" role="switch" aria-checked="${forceRTL}" class="rtl-toggle-btn-reset relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 h-6 w-11 ${forceRTL ? 'active' : ''} cursor-pointer">
                  <span class="rtl-toggle-knob"></span>
                </button>
              </div>
            </div>
            
            <div class="rtl-separator rtl-separator-spaced"></div>
            
            <!-- Settings Controls -->
            <div id="rtl-settings-wrapper" class="flex flex-col gap-1.5 transition-all duration-300 ${isRTL ? '' : 'opacity-40 pointer-events-none'}" style="display: flex; flex-direction: column; gap: 6px; transition: opacity 0.2s; ${isRTL ? '' : 'opacity: 0.4; pointer-events: none;'}">
                
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
                <div class="rtl-row rtl-row-section-start">
                  <span class="rtl-label" title="Chat Line Height">Line Height</span>
                  <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                    <input id="rtl-lh-input" type="range" min="1.2" max="2.5" step="0.1" value="${rtlConfig.lh || '1.7'}" style="width: 90px; cursor: pointer; accent-color: #D0FE1B; margin-right: 6px;">
                    <span id="rtl-lh-val" class="rtl-slider-val"><span class="rtl-val-text">${rtlConfig.lh || '1.7'}</span></span>
                    <button id="rtl-lh-reset" type="button" class="rtl-reset-btn" title="Reset to 1.7">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </button>
                  </div>
                </div>

                <!-- Font Size Slider + Animated Value + Reset -->
                <div class="rtl-row">
                  <span class="rtl-label" title="Chat Font Size">Font Size</span>
                  <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                    <input id="rtl-fs-input" type="range" min="11" max="22" step="1" value="${rtlConfig.fs || '15'}" style="width: 90px; cursor: pointer; accent-color: #D0FE1B; margin-right: 6px;">
                    <span id="rtl-fs-val" class="rtl-slider-val"><span class="rtl-val-text">${rtlConfig.fs || '15'}px</span></span>
                    <button id="rtl-fs-reset" type="button" class="rtl-reset-btn" title="Reset to 15px">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </button>
                  </div>
                </div>
                
            </div>
            
            <div class="rtl-separator"></div>
            
            <!-- Footer: GitHub & Version -->
            <div class="rtl-panel-footer">
              <a href="https://github.com/rezasalimi01/rz-antigravity-rtl" target="_blank" class="rtl-github-link">
                <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
                Star on GitHub
              </a>
              <span class="rtl-version-badge">v1.1.6</span>
            </div>
    `);

    function findDirectChild(parent, node) {
        if (!parent || !node) return null;
        if (node.parentElement === parent) return node;
        let curr = node;
        while (curr && curr.parentElement && curr.parentElement !== parent) {
            curr = curr.parentElement;
        }
        return (curr && curr.parentElement === parent) ? curr : null;
    }

    function isInsideExplorerOrPrimarySidebar(el) {
        if (!el) return false;
        // Strictly protect and ignore the primary sidebar (file tree/explorer), activity bar, and status bar
        return el.closest('.part.sidebar') !== null ||
               el.closest('[id*="workbench.parts.sidebar"]') !== null ||
               el.closest('.explorer-viewlet') !== null ||
               el.closest('[id="workbench.view.explorer"]') !== null ||
               el.closest('.part.activitybar') !== null ||
               el.closest('[id*="workbench.parts.activitybar"]') !== null ||
               el.closest('.part.statusbar') !== null ||
               el.closest('[id*="workbench.parts.statusbar"]') !== null;
    }

    function isMoreButton(node) {
        if (!node) return false;
        if (isInsideExplorerOrPrimarySidebar(node)) return false;

        const testId = (node.getAttribute('data-testid') || '').toLowerCase();
        if (testId.includes('titlebar-more-actions') || testId.includes('overflow-menu') || testId.includes('more-actions')) return true;
        if (node.querySelector && node.querySelector('[data-testid*="titlebar-more-actions"], [data-testid*="overflow-menu"], [data-testid*="more-actions"]')) return true;

        const txt = ((node.getAttribute('title') || '') + ' ' + 
                     (node.getAttribute('aria-label') || '') + ' ' + 
                     (node.textContent || '') + ' ' + 
                     (node.getAttribute('data-tooltip-id') || '')).toLowerCase();
        const html = node.outerHTML || '';
        return node.querySelector('.codicon-more, .codicon-ellipsis, .codicon-kebab-vertical, [name="more_vert"], [name="more_horiz"]') !== null ||
               html.includes('codicon-more') || html.includes('codicon-ellipsis') ||
               html.includes('more_vert') || html.includes('more_horiz') ||
               html.includes('name="more_vert"') || html.includes('name="more_horiz"') ||
               txt.includes('more action') || txt.includes('more option') || txt.includes('more...') ||
               txt.includes('additional option') || txt.includes('views and more actions') ||
               txt.includes('...') || txt.includes('…');
    }

    function isPlusButton(node) {
        if (!node) return false;
        if (isInsideExplorerOrPrimarySidebar(node)) return false;

        const testId = (node.getAttribute('data-testid') || '').toLowerCase();
        if (testId.includes('new-conversation') || testId === 'extension-new-conversation') return true;
        if (node.querySelector && node.querySelector('[data-testid*="new-conversation"]')) return true;

        const txt = ((node.getAttribute('title') || '') + ' ' + 
                     (node.getAttribute('aria-label') || '') + ' ' + 
                     (node.textContent || '') + ' ' + 
                     (node.getAttribute('data-tooltip-id') || '')).toLowerCase();
        const html = node.outerHTML || '';
        return node.querySelector('.codicon-add, .codicon-plus, [name="add"], [name="chat_add_on"]') !== null ||
               html.includes('codicon-add') || html.includes('codicon-plus') ||
               html.includes('name="add"') || html.includes('name="chat_add_on"') || html.includes('name="plus"') ||
               txt.includes('new conversation') || txt.includes('new chat') || txt.includes('new session') ||
               txt.includes('add chat') || txt.includes('start new') ||
               (txt.trim() === '+' || (node.innerText && node.innerText.trim() === '+'));
    }

    function resolveCluster(cluster) {
        if (!cluster || isInsideExplorerOrPrimarySidebar(cluster)) return null;

        const targetCluster = cluster.querySelector('ul.actions-container') || cluster.querySelector('.flex.items-center') || cluster;
        const items = Array.from(targetCluster.children).filter(el => el !== widgetWrapper && el.id !== 'rtl-topbar-wrapper');
        if (items.length === 0) return { cluster: targetCluster, moreItem: null, plusItem: null };

        let moreItem = null;
        let plusItem = null;

        for (const child of items) {
            if (isMoreButton(child)) {
                moreItem = child;
            }
            if (isPlusButton(child)) {
                plusItem = child;
            }
        }

        // Deep check if child contains the target buttons:
        if (!moreItem && targetCluster.querySelector) {
            const nestedMore = targetCluster.querySelector('[data-testid="titlebar-more-actions"], [data-testid*="overflow-menu"], .codicon-more, .codicon-ellipsis, [name="more_vert"], [name="more_horiz"]');
            if (nestedMore) {
                moreItem = findDirectChild(targetCluster, nestedMore);
            }
        }
        if (!plusItem && targetCluster.querySelector) {
            const nestedPlus = targetCluster.querySelector('[data-testid="extension-new-conversation"], [data-testid="new-conversation-button"], [aria-label="New Conversation"], .codicon-add, .codicon-plus, [name="add"], [name="chat_add_on"]');
            if (nestedPlus) {
                plusItem = findDirectChild(targetCluster, nestedPlus);
            }
        }

        // Positional fallback inside cluster if items count >= 2:
        if (!moreItem && items.length >= 2) {
            moreItem = items[items.length - 1];
        }
        if (!plusItem && moreItem) {
            const idx = items.indexOf(moreItem);
            if (idx > 0) {
                plusItem = items[idx - 1];
            }
        }

        return { cluster: targetCluster, moreItem, plusItem, isChatHeader: true };
    }

    function findChatHeaderTarget() {
        // Priority 1 (DIRECT): The official titlebar-more-actions button in Antigravity IDE
        const directMore = document.querySelector('[data-testid="titlebar-more-actions"]');
        const directPlus = document.querySelector('[data-testid="extension-new-conversation"]');

        if (directMore && !isInsideExplorerOrPrimarySidebar(directMore)) {
            const cluster = directMore.parentElement;
            if (cluster && cluster.tagName === 'DIV' && !isInsideExplorerOrPrimarySidebar(cluster)) {
                return {
                    cluster,
                    moreItem: directMore,
                    plusItem: (directPlus && directPlus.parentElement === cluster) ? directPlus : null,
                    isChatHeader: true
                };
            }
        }

        // Priority 2 (DIRECT): The extension-new-conversation button
        if (directPlus && !isInsideExplorerOrPrimarySidebar(directPlus)) {
            const cluster = directPlus.parentElement;
            if (cluster && cluster.tagName === 'DIV' && !isInsideExplorerOrPrimarySidebar(cluster)) {
                return {
                    cluster,
                    moreItem: (directMore && directMore.parentElement === cluster) ? directMore : null,
                    plusItem: directPlus,
                    isChatHeader: true
                };
            }
        }

        // Priority 3 (DIRECT): The pane-titlebar-toolbar container
        const paneToolbar = document.querySelector('[data-testid="pane-titlebar-toolbar"]');
        if (paneToolbar && !isInsideExplorerOrPrimarySidebar(paneToolbar)) {
            const cluster = paneToolbar.querySelector('.flex.items-center.gap-1') ||
                            paneToolbar.querySelector('.flex.items-center') ||
                            paneToolbar.firstElementChild;
            if (cluster && cluster.tagName === 'DIV' && !isInsideExplorerOrPrimarySidebar(cluster)) {
                const moreBtn = cluster.querySelector('[data-testid="titlebar-more-actions"]');
                const plusBtn = cluster.querySelector('[data-testid="extension-new-conversation"]');
                if (moreBtn || plusBtn) {
                    return {
                        cluster,
                        moreItem: moreBtn || null,
                        plusItem: plusBtn || null,
                        isChatHeader: true
                    };
                }
            }
        }

        // Priority 4: Search relative to conversation view container ([data-testid="conversation-view"])
        const convView = document.querySelector('[data-testid="conversation-view"]');
        if (convView) {
            const panel = convView.closest('.composite, .view-pane, .pane, .part, [data-cascade-id]') || convView.parentElement;
            if (panel && !isInsideExplorerOrPrimarySidebar(panel)) {
                const toolbars = panel.querySelectorAll('[data-testid="pane-titlebar-toolbar"], .actions-container, .title-actions, header');
                for (const tb of toolbars) {
                    const cluster = tb.tagName === 'DIV' || tb.tagName === 'UL' ? tb : tb.querySelector('.flex.items-center, .actions-container');
                    if (cluster && cluster.tagName !== 'BUTTON' && !isInsideExplorerOrPrimarySidebar(cluster)) {
                        const moreBtn = cluster.querySelector('[data-testid="titlebar-more-actions"], .codicon-more, .codicon-ellipsis');
                        const plusBtn = cluster.querySelector('[data-testid="extension-new-conversation"], .codicon-add, .codicon-plus');
                        if (moreBtn || plusBtn) {
                            return {
                                cluster,
                                moreItem: moreBtn ? findDirectChild(cluster, moreBtn) : null,
                                plusItem: plusBtn ? findDirectChild(cluster, plusBtn) : null,
                                isChatHeader: true
                            };
                        }
                    }
                }
            }
        }

        return null;
    }

    function syncButtonWithChatHeader(refBtn) {
        const btn = widgetWrapper ? widgetWrapper.querySelector('#rtl-topbar-btn') : null;
        if (!btn || !refBtn) return;
        try {
            const cs = window.getComputedStyle(refBtn);
            const h = parseFloat(cs.height);
            if (h >= 18 && h <= 36 && btn.style.height !== cs.height) {
                btn.style.setProperty('height', cs.height, 'important');
            }
            if (cs.borderRadius && btn.style.borderRadius !== cs.borderRadius) {
                btn.style.setProperty('border-radius', cs.borderRadius, 'important');
            }
        } catch(e) {}
    }

    function attachElements() {
        // Remove lingering legacy widget if present
        const legacy = document.querySelectorAll('.rtl-widget-container, .rtl-widget-trigger');
        legacy.forEach(el => {
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });

        if (!document.getElementById('rtl-widget-panel-portal')) {
            document.body.appendChild(panel);
        }

        const target = findChatHeaderTarget();
        if (!target || !target.cluster) return;

        const { cluster, moreItem, plusItem } = target;

        // Strictly safeguard: cluster must be a container DIV or UL, NEVER a button or span
        if (cluster.tagName !== 'DIV' && cluster.tagName !== 'UL') return;

        // Positioning rule: strictly BETWEEN the + button (plusItem) and three dots (moreItem)
        if (moreItem && moreItem.parentElement === cluster) {
            // Placing BEFORE moreItem puts widgetWrapper right after plusItem and before moreItem
            if (widgetWrapper.nextElementSibling !== moreItem || widgetWrapper.parentElement !== cluster) {
                cluster.insertBefore(widgetWrapper, moreItem);
            }
        } else if (plusItem && plusItem.parentElement === cluster) {
            // If moreItem is not present, place immediately after plusItem
            if (plusItem.nextElementSibling !== widgetWrapper || widgetWrapper.parentElement !== cluster) {
                cluster.insertBefore(widgetWrapper, plusItem.nextSibling);
            }
        } else if (cluster) {
            if (!cluster.contains(widgetWrapper)) {
                cluster.appendChild(widgetWrapper);
            }
        }

        const refBtn = moreItem || plusItem;
        if (refBtn) {
            syncButtonWithChatHeader(refBtn);
        }
    }

    attachElements();

    const topbarBtn = widgetWrapper.querySelector('#rtl-topbar-btn');
    const toggleBtn = panel.querySelector('#rtl-toggle-btn');
    const toggleLabel = panel.querySelector('#rtl-toggle-label');
    const settingsWrapper = panel.querySelector('#rtl-settings-wrapper');
    const forceBtn = panel.querySelector('#rtl-force-btn');
    const forceRow = panel.querySelector('#rtl-force-row');
    const lhInput = panel.querySelector('#rtl-lh-input');
    const lhVal = panel.querySelector('#rtl-lh-val');
    const lhResetBtn = panel.querySelector('#rtl-lh-reset');
    const fsInput = panel.querySelector('#rtl-fs-input');
    const fsVal = panel.querySelector('#rtl-fs-val');
    const fsResetBtn = panel.querySelector('#rtl-fs-reset');

    // Setup Custom Dropdowns
    function setupDropdown(dropdownId, currentValue, onChange) {
        const dropdown = panel.querySelector('#' + dropdownId) || document.getElementById(dropdownId);
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

    function updateDropdownPosition() {
        if (!topbarBtn || !panel) return;
        const rect = topbarBtn.getBoundingClientRect();
        panel.style.top = (rect.bottom + 6) + 'px';
        
        const panelWidth = 256;
        const rightPos = window.innerWidth - rect.right;
        if (rect.right < panelWidth + 8) {
            panel.style.left = Math.max(8, rect.left) + 'px';
            panel.style.right = 'auto';
            panel.style.transformOrigin = 'top left';
        } else {
            panel.style.right = Math.max(8, rightPos) + 'px';
            panel.style.left = 'auto';
            panel.style.transformOrigin = 'top right';
        }
        panel.style.bottom = 'auto';
    }

    function togglePanel(show) {
        if (!panel || !topbarBtn) return;
        const isVisible = panel.classList.contains('open');
        const nextState = show !== undefined ? show : !isVisible;
        if (nextState) {
            updateDropdownPosition();
            panel.classList.add('open');
            topbarBtn.classList.add('panel-open');
            topbarBtn.setAttribute('aria-expanded', 'true');
        } else {
            panel.classList.remove('open');
            panel.querySelectorAll('.rtl-dropdown.open').forEach(d => d.classList.remove('open'));
            topbarBtn.classList.remove('panel-open');
            topbarBtn.setAttribute('aria-expanded', 'false');
        }
    }

    if (topbarBtn) {
        topbarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel();
        });
    }

    panel.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!e.target.closest('.rtl-dropdown')) {
            panel.querySelectorAll('.rtl-dropdown.open').forEach(d => d.classList.remove('open'));
        }
    });

    document.addEventListener('click', (e) => {
        if (panel && !panel.contains(e.target) && topbarBtn && !topbarBtn.contains(e.target)) {
            togglePanel(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            togglePanel(false);
        }
    });

    window.addEventListener('resize', () => {
        if (panel && panel.classList.contains('open')) {
            updateDropdownPosition();
        }
    });

    window.addEventListener('scroll', () => {
        if (panel && panel.classList.contains('open')) {
            updateDropdownPosition();
        }
    }, true);

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
            forceRTL: forceRTL
        };
        try {
            localStorage.setItem('rz-antigravity-rtl-config', JSON.stringify(cfg));
        } catch (e) {}
        console.log("SAVE_RTL_CONFIG|" + JSON.stringify(cfg));
    };

    function clearRTL() {
        if (rtlStyle.parentNode) rtlStyle.parentNode.removeChild(rtlStyle);
        document.querySelectorAll(`
            .antigravity-agent-side-panel [dir],
            [data-testid="conversation-view"] [dir],
            .part.auxiliarybar [dir],
            .agent-driven-pane [dir],
            [data-testid="chat-message"] [dir],
            .prose [dir]
        `).forEach(el => el.removeAttribute('dir'));
        document.querySelectorAll('[dir]').forEach(el => {
            if (!el.closest('.monaco-editor') && !el.closest('.part.sidebar')) el.removeAttribute('dir');
        });
        window.dispatchEvent(new Event('resize'));
    }

    function setRTLActive(active) {
        isRTL = active;
        saveConfig();
        toggleBtn.setAttribute('aria-checked', String(isRTL));
        toggleBtn.classList.toggle('active', isRTL);
        toggleLabel.innerText = isRTL ? 'Enabled' : 'Disabled';
        if (topbarBtn) topbarBtn.classList.toggle('active', isRTL);

        if (isRTL) {
            if (forceRow) {
                forceRow.style.opacity = '';
                forceRow.style.pointerEvents = '';
            }
            settingsWrapper.style.opacity = '';
            settingsWrapper.style.pointerEvents = '';
            if (!rtlStyle.parentNode) document.head.appendChild(rtlStyle);
            updateDynamicCSS(faDropdown.getValue(), enDropdown.getValue(), codeDropdown.getValue(), lhInput.value, fsInput.value);
            updateDir();
        } else {
            if (forceRow) {
                forceRow.style.opacity = '0.4';
                forceRow.style.pointerEvents = 'none';
            }
            settingsWrapper.style.opacity = '0.4';
            settingsWrapper.style.pointerEvents = 'none';
            clearRTL();
        }
    }
    window.setRTLActive = setRTLActive;

    toggleBtn.addEventListener('click', () => {
        setRTLActive(!isRTL);
    });

    forceBtn.addEventListener('click', () => {
        if (!isRTL) return;
        forceRTL = !forceRTL;
        saveConfig();
        forceBtn.setAttribute('aria-checked', String(forceRTL));
        forceBtn.classList.toggle('active', forceRTL);
        updateDynamicCSS(faDropdown.getValue(), enDropdown.getValue(), codeDropdown.getValue(), lhInput.value, fsInput.value);
        updateDir();
    });

    let popTimeouts = new WeakMap();
    let prevValues = new WeakMap();
    prevValues.set(lhVal, parseFloat(lhInput.value) || 1.7);
    prevValues.set(fsVal, parseFloat(fsInput.value) || 15);

    function updateValBadge(badgeEl, text, numVal) {
        let textSpan = badgeEl.querySelector('.rtl-val-text');
        if (!textSpan) {
            badgeEl.innerHTML = '<span class="rtl-val-text">' + text + '</span>';
            textSpan = badgeEl.querySelector('.rtl-val-text');
        } else {
            const prev = prevValues.has(badgeEl) ? prevValues.get(badgeEl) : numVal;
            textSpan.classList.remove('slide-up', 'slide-down');
            void textSpan.offsetWidth;
            if (numVal > prev) {
                textSpan.classList.add('slide-up');
            } else if (numVal < prev) {
                textSpan.classList.add('slide-down');
            }
            textSpan.textContent = text;
        }
        prevValues.set(badgeEl, numVal);

        badgeEl.classList.add('val-pop');
        if (popTimeouts.has(badgeEl)) {
            clearTimeout(popTimeouts.get(badgeEl));
        }
        const t = setTimeout(() => {
            badgeEl.classList.remove('val-pop');
        }, 220);
        popTimeouts.set(badgeEl, t);
    }

    function animateCounter(inputEl, badgeEl, targetVal, isFloat, suffix, onDone) {
        let current = parseFloat(inputEl.value);
        const target = parseFloat(targetVal);
        if (isNaN(current) || current === target) {
            inputEl.value = targetVal;
            updateValBadge(badgeEl, targetVal + suffix, target);
            if (onDone) onDone();
            return;
        }

        const step = isFloat ? 0.1 : 1;
        const direction = target > current ? 1 : -1;

        function tick() {
            if ((direction === 1 && current < target) || (direction === -1 && current > target)) {
                current = Math.round((current + direction * step) * 10) / 10;
                if ((direction === 1 && current > target) || (direction === -1 && current < target)) {
                    current = target;
                }
                const displayVal = isFloat ? current.toFixed(1) : String(Math.round(current));
                inputEl.value = displayVal;
                updateValBadge(badgeEl, displayVal + suffix, current);
                if (current !== target) {
                    setTimeout(tick, 30);
                } else {
                    if (onDone) onDone();
                }
            }
        }
        tick();
    }

    function triggerResetRecoil(btn) {
        btn.classList.remove('recoiling');
        void btn.offsetWidth;
        btn.classList.add('recoiling');
        setTimeout(() => {
            btn.classList.remove('recoiling');
        }, 450);
    }

    lhInput.addEventListener('input', () => {
        updateValBadge(lhVal, lhInput.value, parseFloat(lhInput.value));
        onFontChange();
    });

    fsInput.addEventListener('input', () => {
        updateValBadge(fsVal, fsInput.value + 'px', parseFloat(fsInput.value));
        onFontChange();
    });

    lhResetBtn.addEventListener('click', () => {
        triggerResetRecoil(lhResetBtn);
        animateCounter(lhInput, lhVal, '1.7', true, '', () => {
            onFontChange();
        });
    });

    fsResetBtn.addEventListener('click', () => {
        triggerResetRecoil(fsResetBtn);
        animateCounter(fsInput, fsVal, '15', false, 'px', () => {
            onFontChange();
        });
    });

    // Observer & Periodic sync
    let updateDirRAF = null;
    const observer = new MutationObserver(() => {
        attachElements();
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

    setInterval(attachElements, 250);
    setInterval(updateDir, 400);

    function init() {
        attachElements();
        if (isRTL) {
            updateDir();
        } else {
            clearRTL();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setTimeout(attachElements, 100);
    setTimeout(attachElements, 300);
    setTimeout(attachElements, 600);
    setTimeout(attachElements, 1000);
    setTimeout(attachElements, 1500);
    setTimeout(attachElements, 2500);
    setTimeout(attachElements, 4000);
    setTimeout(attachElements, 6000);
    setTimeout(attachElements, 9000);
    setTimeout(attachElements, 12000);
})();
