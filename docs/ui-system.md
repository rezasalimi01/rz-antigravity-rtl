# UI System & Micro-Animations

This document details the visual design system, spring animation physics, and mathematical geometry powering the **RZ Antigravity RTL** floating interface.

---

## 1. Color Palette: Volt Lime & Pitch Black

The UI is built around high-contrast, modern developer aesthetics:

| Token | Hex / Value | Purpose |
| :--- | :--- | :--- |
| **Primary Accent** | `#D0FE1B` | Electric Volt Lime. Used for active switches, hover glows, icons, and highlights. |
| **Pitch Black** | `#000000` | Pure black background for container trigger and high-contrast surfaces. |
| **Panel Surface** | `#050505` | Dark surface color for popover panels. |
| **Menu Surface** | `#09090b` | Dark zinc background for custom dropdown popup menus. |
| **Subtle Border** | `rgba(208, 254, 27, 0.22)` | Subtle neon-tinted border lines. |
| **Muted Text** | `#71717a` / `#9ca3af` | Unselected / default font labels, idle trigger icons, and chevrons. |

---

## 2. Trigger States: Calm Idle vs. Neon Active

The floating trigger button follows a non-intrusive philosophy:
1. **Idle State**:
   - Background: Pure black (`#000000`)
   - Border: Subtle zinc (`1.5px solid #27272a`)
   - Icon: Muted gray (`#9ca3af`)
   - Shadow: Neutral dark shadow (`0 4px 12px rgba(0, 0, 0, 0.75)`)
   *Does not distract or draw the eye when reading code or conversations.*
2. **Hover State**:
   - Scale: `scale(1.1)`
   - Border: `#D0FE1B`
   - Icon: `#D0FE1B`
   - Shadow: Neon glow (`0 0 16px rgba(208, 254, 27, 0.45)`)
3. **Open / Clicked State**:
   - Background: `#D0FE1B`
   - Icon: Pure black (`#000000`)
   - Shadow: High-intensity neon glow (`0 0 20px rgba(208, 254, 27, 0.7)`)

---

## 3. Custom Animated Spring Dropdowns

Native OS `<select>` elements are rigid, square, and impossible to animate smoothly. RZ Antigravity RTL replaces them with custom DOM dropdowns:

```
[Trigger Button]  ──(Click)──►  [Rotate Chevron 180°]
                                       │
                                [Spring Physics Menu]
                                 • opacity: 0 -> 1
                                 • translateY(-8px) -> 0
                                 • scale(0.95) -> 1
                                 • cubic-bezier(0.16, 1, 0.3, 1)
```

### Behavior:
- **Default State**: Labels for default fonts display with explicit names (`Default (Vazirmatn)`, `Default (System)`, `Default (Monospace)`) and take a `.muted` (`#71717a`) class.
- **Active State**: Custom chosen fonts take an `.active` (`#D0FE1B`) class with green checkmark indicators.
- **Dismissal**: Closes automatically when clicking outside or selecting an option.

---

## 4. Draggable 4-Corner Snap Mathematics

When dragging the trigger button, the engine tracks user input relative to the chat container:

```javascript
// Clamped inside chat container boundaries
const minX = 8;
const maxX = Math.max(minX, boxRect.width - 46);
const minY = 8;
const maxY = Math.max(minY, boxRect.height - 46);

const currentX = Math.max(minX, Math.min(maxX, initialLeft + dx));
const currentY = Math.max(minY, Math.min(maxY, initialTop + dy));
```

On release (`mouseup`), the widget determines its nearest quadrant:
```javascript
const centerX = (elemRect.left + elemRect.right) / 2 - boxRect.left;
const centerY = (elemRect.top + elemRect.bottom) / 2 - boxRect.top;

const isLeft = centerX < (boxRect.width / 2);
const isTop = centerY < (boxRect.height / 2);

const corner = (isTop ? 't' : 'b') + (isLeft ? 'l' : 'r');
applyCorner(corner);
```

### Corner Adaptivity:
The popover panel automatically alters its origin and positioning based on the snapped corner:
- **`corner-br` (Bottom-Right)**: Opens upwards and leftwards (`transform-origin: bottom right`).
- **`corner-bl` (Bottom-Left)**: Opens upwards and rightwards (`transform-origin: bottom left`).
- **`corner-tr` (Top-Right)**: Opens downwards and leftwards (`transform-origin: top right`).
- **`corner-tl` (Top-Left)**: Opens downwards and rightwards (`transform-origin: top left`).

---

## 5. Micro-Animations: Debounced Value Pulse

When a user drags a Line Height or Font Size slider:
1. The badge `.rtl-slider-val` immediately scales up to `1.18x` with an electric lime background pulse.
2. A `WeakMap` debounce timer resets on every input event:
```javascript
let popTimeouts = new WeakMap();
function triggerValPop(el, text) {
    el.textContent = text;
    el.classList.add('val-pop');
    if (popTimeouts.has(el)) clearTimeout(popTimeouts.get(el));
    popTimeouts.set(el, setTimeout(() => {
        el.classList.remove('val-pop');
    }, 300));
}
```
3. Once sliding finishes, after exactly **300ms**, `.val-pop` is removed, smoothly transitioning the badge back to `scale(1)`.
