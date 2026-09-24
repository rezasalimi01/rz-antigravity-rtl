# Typography & Offline Fonts

This document explains the typography engine, unicode-range font binding, automatic direction heuristics, and keyboard remapping implemented in **RZ Antigravity RTL**.

---

## 1. Curated Offline Fonts (22 Assets)

To eliminate any dependency on Google Fonts or internet connectivity, 22 high-performance fonts are bundled directly inside `bin/fonts/`:

### Persian & Arabic Fonts:
- **Default (Vazirmatn)**: Modern, highly legible variable webfont created by Saber Rastikerdar.
- **IRANSans X**: Regular (400) and Bold (700) woff2.
- **IRANYekanX Pro**: Regular (400) and Bold (700) woff2.
- **Kalameh**: Regular (400) and Bold (700) woff2.
- **Noora**: Regular (400) and Bold (700) woff2.
- **Pelak**: Regular (400) and Bold (700) woff2.
- **Ravi**: Regular (400) and Bold (700) woff2.
- **Yekan Bakh**: Regular (400) and Bold (700) woff2.

### English Fonts:
- **Open Sans**: Standard modern sans-serif (TrueType).
- **Roboto**: Standard developer interface font (TrueType).
- **Fira Sans**: Regular (400) and Bold (700) TrueType.

### Monospace Code Fonts:
- **Fira Code**: Developer ligatures, Regular (400) and Bold (700) woff2.
- **JetBrains Mono**: Engineered for code readability, Regular (400) and Bold (700) woff2.

---

## 2. Unicode-Range Font Subsetting

To prevent Persian fonts from overriding English characters or punctuation in mixed texts, Persian font-faces are restricted strictly to Arabic and Persian Unicode blocks:

```css
@font-face {
    font-family: 'SelectedFaFont';
    src: url('./fonts/persian/IRANSansX-Regular.woff2') format('woff2');
    font-weight: 400;
    unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
}
```

### Font Stack Composition:
When fonts are applied, they are stacked in precedence order:
```css
font-family: 'SelectedFaFont', 'PersianOnlyFont', 'SelectedEnFont', ui-sans-serif, system-ui, sans-serif !important;
```
1. The browser checks for Persian/Arabic characters: rendered using `SelectedFaFont` (or default `PersianOnlyFont`).
2. Latin characters fall through to `SelectedEnFont` (or system UI).
3. Emojis fall through to OS color emoji fonts.

---

## 3. Auto-Direction Detection Heuristic

The typography engine observes user inputs (`contenteditable` and `textarea`) as well as AI responses. It determines text direction dynamically:

```javascript
function updateDir() {
    const text = (raw || '').replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
    if (text.length > 0) {
        // Matches the first non-punctuation, non-Latin character
        const isRtlText = /^[^a-zA-Z]*[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(text);
        const newDir = isRtlText ? 'rtl' : 'ltr';
        el.setAttribute('dir', newDir);
    }
}
```

### Performance Optimization:
`updateDir` is scheduled using `requestAnimationFrame` and a throttled `MutationObserver` to ensure 60fps scrolling and zero typing lag in large chat sessions.

---

## 4. Persian Keyboard `@` Symbol Remap

On standard Persian keyboard layouts in Windows and Linux, pressing `Shift + 2` outputs the Persian thousands separator (`٬`) or comma (`،`) instead of the commercial `@` symbol needed for AI mentions:

```javascript
document.addEventListener('keydown', (e) => {
    if (!fixAtSign) return;
    if (e.code === 'Digit2' && e.shiftKey) {
        if (e.key === '٬' || e.key === '،') {
            e.preventDefault();
            document.execCommand('insertText', false, '@');
        }
    }
}, { capture: true });
```
When enabled, pressing `Shift + 2` instantly inserts `@` without requiring the user to switch keyboard layouts.
