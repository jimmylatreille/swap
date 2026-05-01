
```
                                                                                                      
 ░███████  ░██    ░██    ░██  ░██████   ░████████  
░██        ░██    ░██    ░██       ░██  ░██    ░██ 
 ░███████   ░██  ░████  ░██   ░███████  ░██    ░██ 
       ░██   ░██░██ ░██░██   ░██   ░██  ░███   ░██ 
 ░███████     ░███   ░███     ░█████░██ ░██░█████  
                                        ░██        
                                        ░██        
                                           
```


# GSAP Page Transition Engine

> **50 Awwwards-grade, GPU-accelerated full-viewport page transitions** — built with pure JavaScript and GSAP 3. Zero dependencies. Fully bidirectional. Interrupt-safe.

---

## Table of Contents

1. [Demo](#demo)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Quick Start](#quick-start)
5. [API Reference](#api-reference)
   - [createTransition()](#createtransition)
   - [Controller Methods](#controller-methods)
6. [Transition Variants](#transition-variants)
7. [The Layer System](#the-layer-system)
   - [CSS Layers](#css-layers)
   - [Dynamic Stripe DOM](#dynamic-stripe-dom)
8. [Customisation](#customisation)
   - [Colours & Theming](#colours--theming)
   - [Adding New Transitions](#adding-new-transitions)
9. [UI Controls](#ui-controls)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [Performance Notes](#performance-notes)
12. [Browser Support](#browser-support)

---

## Demo

Open `index.html` in a local server (e.g. VS Code Live Server, `npx serve .`, or any static file host).

```bash
npx serve .
# → http://localhost:3000
```

---

## Features

| Feature | Detail |
|---|---|
| **50 unique variants** | Every conceivable transition style: wipes, irises, stripes, 3D flips, glitch, polygon morphs, elastic physics |
| **GPU-accelerated** | `force3D: true` on every timeline. Uses CSS `transform`, `clip-path`, and `filter` — nothing that triggers layout |
| **Bidirectional** | Every transition plays perfectly in both directions: `play()` and `reverse()` |
| **Interrupt-safe** | Call `reverse()` mid-`play()` — the animation reverses smoothly from wherever the playhead is |
| **Memory-safe** | All dynamically injected DOM nodes are tracked in a `cleanups[]` array and removed on `kill()` |
| **Zero dependencies** | Only requires GSAP 3 (loaded from CDN or bundled locally) |
| **Accessible** | Live region labels, `aria-hidden` management, keyboard navigation, reduced-motion aware |

---

## Project Structure

```
Page transition/
├── index.html                   # Main demo page + documentation lightbox
├── .gitignore
├── README.md
│
├── css/
│   ├── reset.css                # Minimal CSS reset
│   ├── main.css                 # All UI styles + layer system + doc lightbox
│   └── page-transtion.css       # Stage-level transition layer base styles
│
└── js/
    ├── main.js                  # Demo orchestrator: cards, state machine, UI
    ├── noise.js                 # Canvas grain effect
    ├── gsap.js                  # GSAP 3.12.5 (local fallback)
    ├── splitText.min.js         # GSAP SplitText plugin
    ├── text-anim.js             # Text animation helpers
    │
    └── transitions/
        ├── create-transition.js # ⭐ Core engine — all 50 transitions live here
        └── utils.js             # Shared DOM/GSAP utility helpers
```

---

## Quick Start

### 1. Include GSAP

Either via CDN (as in the demo):

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
```

Or use the local copy:

```html
<script src="js/gsap.js"></script>
```

### 2. Set up your HTML stage

The engine expects **4 stacked layer divs** inside the container it targets:

```html
<section id="preview-stage" class="preview-stage">
  <div class="transition-layer layer-bg"></div>
  <div class="transition-layer layer-accent"></div>
  <div class="transition-layer layer-overlay"></div>
  <div class="transition-layer layer-mask"></div>

  <!-- Your page content goes here -->
  <div class="preview-content">...</div>
</section>
```

### 3. Import and call

```js
import { createTransition } from "./js/transitions/create-transition.js";

const stage = document.querySelector("#preview-stage");

// Create a controller for transition #12 (Scale Bloom)
const ctrl = createTransition(stage, { id: 12 });

// Play forward — covers the screen
ctrl.play();

// Reverse — uncovers the screen
ctrl.reverse();

// Cleanup — removes all injected DOM, kills GSAP timeline
ctrl.kill();
```

---

## API Reference

### `createTransition(container, options)`

The factory function. Builds the GSAP timeline for the selected variant and returns a controller object.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `container` | `HTMLElement` | ✅ | The element that hosts the 4 transition layers. Usually the full-screen stage. |
| `options.id` | `Number` | ✅ | Transition index `1–50`. Selects the animation variant. See [Transition Variants](#transition-variants). |

#### Returns

A controller object with 3 methods:

### Controller Methods

#### `ctrl.play()`

Plays the timeline **forward** from the current playhead position.

- The transition layers animate **over** the viewport, covering the content.
- During coverage, you can safely swap your route, update DOM, or load a new page.
- Calling `play()` on a finished timeline restarts it from the beginning.

```js
ctrl.play();
```

---

#### `ctrl.reverse()`

Plays the timeline **backward** from the current playhead position.

- The transition layers retract, revealing the underlying content.
- Fully interrupt-safe — can be called at any point during `play()`.
- When reversing, the content text is automatically swapped back to its original state.

```js
ctrl.reverse();
```

---

#### `ctrl.kill()`

Kills the GSAP timeline and runs all cleanup callbacks.

- Removes all dynamically injected DOM nodes (stripe overlays, wrappers).
- Resets all inline GSAP styles on the layer elements.
- Should be called before creating a new transition to prevent memory leaks.

```js
ctrl.kill();
```

---

### State Machine Pattern (Recommended)

The demo uses this pattern internally for robust transition management:

```js
let activeCtrl = null;
let activeDir  = "play";

function runTransition(id) {
  // Kill the previous transition and clean up
  if (activeCtrl) activeCtrl.kill();

  // Create a fresh controller
  activeCtrl = createTransition(stage, { id });
  activeDir  = "play";
  activeCtrl.play();
}

function toggle() {
  if (!activeCtrl) return;
  if (activeDir === "play") {
    activeCtrl.reverse();
    activeDir = "reverse";
  } else {
    activeCtrl.play();
    activeDir = "play";
  }
}
```

---

## Transition Variants

Pass the `id` to `createTransition()` to select a variant.

| ID | Name | Technique |
|---|---|---|
| 01 | Drift In | `clip-path` inset wipe from left + bg parallax slide |
| 02 | Rise Up | `clip-path` inset wipe from bottom |
| 03 | Slide Left | Full `translateX` panel slide |
| 04 | Drop Down | `clip-path` inset wipe from top |
| 05 | Unshutter | `scaleX` shutter reveal + opacity |
| 06 | Iris Expand | `clip-path circle()` expand from center |
| 07 | Split Center | Dual `clip-path` halves splitting apart |
| 08 | Blind Expand | 8 vertical stripes stagger in from bottom |
| 09 | Flicker Wipe | `clip-path` inset with opacity flicker on entry |
| 10 | Pull Through | `scaleX` + `yPercent` combined panel |
| 11 | Corner Iris | `clip-path circle()` expand from bottom-left corner |
| 12 | Scale Bloom | `clip-path circle()` + bg scale bloom |
| 13 | Poly Reveal | `polygon()` clip-path morph — diamond to full |
| 14 | Bottom Lift | Full `yPercent` panel lift from bottom |
| 15 | Curtain Down | `yPercent` curtain drop from top |
| 16 | Top-Right Iris | `clip-path circle()` expand from top-right |
| 17 | Overlay Wipe | `xPercent` full-screen panel sweep |
| 18 | Top Slice | `clip-path` inset horizontal slice |
| 19 | Scale Mask | Combined `scale` + `clip-path inset()` |
| 20 | Flash Sweep | Opacity flash + `xPercent` sweep |
| 21 | Diagonal Slash | Skewed `polygon()` diagonal wipe |
| 22 | Twin Curtain | Dual `yPercent` curtain halves |
| 23 | Ripple Burst | `clip-path circle()` expanding ripple wave |
| 24 | Page Curl | 3D `rotateY` perspective page curl |
| 25 | Depth Push | `translateZ` + `scale` depth push illusion |
| 26 | Cascade Drop | 12-stripe alternating `yPercent` cascade |
| 27 | Glitch Slam | `xPercent` + opacity glitch with `steps()` easing |
| 28 | Prism Slide | 8 horizontal stripes staggered |
| 29 | Elastic Gate | Dual `scaleX` gates with `elastic.out` |
| 30 | Grand Finale | 12-stripe alternating direction bounce |
| 31 | Cinematic Bars | 2 bars from top/bottom + background `blur()` |
| 32 | Hexagon Expand | 6-point `polygon()` morph to full screen |
| 33 | Venetian Blinds | 14 stripes with 3D `rotationX` flip (perspective) |
| 34 | Diagonal Stagger | 6 stripes rotated 45° stagger across |
| 35 | Cross Split | 12-point cross `polygon()` expand to full screen |
| 36 | Shutter Twist | 8 stripes `skewX` + `yPercent` stagger |
| 37 | Diamond Sweep | 4-point diamond `polygon()` wipe |
| 38 | Accordion Fold | Alternating-origin `scaleY` accordion fold |
| 39 | Center Pinch | `inset()` clip-path horizontal centre pinch |
| 40 | Orbital Sweep | `rotationZ` + `scale` spiral entrance |
| 41 | Glitch Slice | 5 stripes `xPercent` with `steps(4)` easing |
| 42 | Triangle Unfold | Triangle `polygon()` morph reveal |
| 43 | Elastic Drop | `inset()` clip-path with `bounce.out` physics |
| 44 | The Void | `inset()` + rotation + scale — sucked into void |
| 45 | Double Door Sweep | 2 panels `xPercent` then `yPercent` exit |
| 46 | Ripple Offset | 10 stripes expanding from center outward |
| 47 | Skewed Blocks | 6 stripes `yPercent` + `skewY` stagger |
| 48 | Iris Blink | Circle blink (close/open) + `bounce.out` reveal |
| 49 | Sawtooth Wipe | 9-point jagged polygon wipe across screen |
| 50 | The Masterpiece | 3D bg depth push + 10-stripe 3D shutter |

---

## The Layer System

Every transition stage requires **4 stacked rendering layers** inside the container. They are referenced inside the engine via `nodes.bg`, `nodes.accent`, `nodes.overlay`, and `nodes.mask`.

### CSS Layers

| Class | z-index | Default colour | Role |
|---|---|---|---|
| `.layer-bg` | 0 | `var(--bg)` | Base background. Most transitions animate `scale`, `xPercent`, `yPercent`, or `rotation` on this layer to create a parallax backdrop. |
| `.layer-accent` | 1 | `var(--primary-color)` at 85% opacity | A semi-transparent colour wash. Faded in via `accentFade()` helper to add brand colour depth over the bg. |
| `.layer-overlay` | 2 | `var(--primary-color)` | Solid colour layer for full-cover panel-style transitions. Hidden by default (`opacity: 0`). |
| `.layer-mask` | 5 | `var(--bg)` | The **primary** clip-path animation layer. Most iris/wipe/polygon transitions animate `clip-path` on this element. Starts off-screen (`inset(0 100% 0 0)`). |

### Dynamic Stripe DOM

Many transitions inject additional DOM nodes at runtime. This is handled internally by the `makeStripes()` factory:

```js
// Internal function signature:
makeStripes(container, count, color = "#030409", direction = "row")
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `container` | `HTMLElement` | — | Parent element to inject the stripe wrapper into. |
| `count` | `Number` | — | Number of stripe divs to generate. |
| `color` | `String` | `"#030409"` | Background colour of each stripe. |
| `direction` | `String` | `"row"` | `"row"` → vertical stripes side-by-side. `"column"` → horizontal stripes stacked. |

All injected wrappers and stripes are pushed into the internal `cleanups[]` array. They are removed from the DOM automatically when `kill()` is called.

---

## Customisation

### Colours & Theming

All visual colours are driven by CSS custom properties. Edit the `:root` block in `css/main.css`:

```css
:root {
  --primary-color: #9CEC5B;  /* Main accent — used for overlay layers and UI highlights */
  --bg:            #141414;  /* Dark background — used for bg and mask layers           */
  --accent:        #6b7dff;  /* UI accent colour — buttons, active states               */
  --accent-2:      #ff5f92;  /* Secondary UI accent                                     */
  --text:          #f8f9ff;  /* Primary text colour                                     */
  --muted:         #888888;  /* Secondary / subdued text                                */
}
```

### Adding New Transitions

1. Open `js/transitions/create-transition.js`.
2. Inside `buildTimeline()`, find the `switch(id)` statement.
3. Add a new `case N:` block following the existing pattern:

```js
// ── 51 · My Custom Transition ─────────────────────────────
case 51: {
  // Optional: create stripe DOM
  const { wrap, stripes } = makeStripes(container, 8);
  cleanups.push(() => { if(wrap.parentNode) container.removeChild(wrap); });

  // Animate! Use any GSAP properties.
  tl.fromTo(stripes, { yPercent: -110 }, { yPercent: 0, duration: 0.6, stagger: 0.05, ease: "expo.out" }, 0)
    .to(stripes, { yPercent: 110, duration: 0.6, stagger: 0.05, ease: "power4.in" }, 0.8)
    .fromTo(bg, { scale: 1.1 }, { scale: 1, duration: 1.2, ease: "expo.out" }, 0.9);

  // Fade in accent colour
  accentFade(0.9);

  // Fade in content text
  stdContent(1.1);
  break;
}
```

4. Increment `TOTAL` in `js/main.js`:

```js
const TOTAL = 51; // was 50
```

5. Add the name to the `NAMES` array:

```js
"My Custom Transition", // 51
```

#### Key helpers available inside `buildTimeline()`

| Helper | Signature | Description |
|---|---|---|
| `accentFade` | `(startTime = 0) => void` | Fades in the `.layer-accent` element from `opacity: 0` to `0.78`. |
| `stdContent` | `(startTime = 0.22) => void` | Staggers in `contentItems` and `tags` with a premium `expo.out` + `back.out` easing. Also triggers the text swap mid-transition. |
| `makeStripes` | `(container, count, color, direction) => { wrap, stripes }` | Generates a flex stripe overlay and returns GSAP-targetable elements. |

#### Important rules for bidirectional stability

- ✅ **Always use `%` units** in `clip-path` values — never mix `px` and `%`
- ✅ **Match point counts** — polygon strings in `fromTo()` must have the same number of points
- ✅ **Use `fromTo()`** instead of chained `from()` → `to()` for reliable reverse
- ✅ **Push to `cleanups[]`** for any DOM you inject
- ✅ **Don't use `gsap.set()` after the timeline is created** — it bypasses the timeline and breaks reverse

---

## UI Controls

### Transition Carousel (Right Side Button)

The pill-shaped **"Select a transition"** button on the right side of the screen opens a horizontal carousel overlay showing all 50 transitions as scrollable cards.

- **Select:** Click any card → immediately plays that transition
- **Toggle:** Click the active card again → reverses the animation
- **Close:** Click the backdrop or press `Escape`

### Transition Label (Bottom Left)

Displays the currently active transition ID and name, with two control buttons:

| Button | Action |
|---|---|
| **Play** | Plays the active transition forward from its current playhead position |
| **Reverse** | Plays the active transition backward from its current playhead position |

### Fullscreen (Top Right)

The four-arrow icon button toggles the browser's native Fullscreen API. Ideal for client presentations.

### Documentation (Bottom Right)

The file-stack icon button opens the in-app documentation lightbox — a tabbed reference panel with Overview, API, Transitions, Layer System, and UI Controls sections.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Escape` | Closes documentation lightbox → then carousel overlay → then exits fullscreen (priority order) |

---

## Performance Notes

- **`force3D: true`** is injected into the GSAP timeline `defaults` object, forcing all animations to the GPU compositor thread.
- **`will-change: transform, opacity, clip-path`** is set on all layer elements in CSS to pre-promote them to their own compositor layers.
- **`contain: layout style paint`** and **`isolation: isolate`** are set on the stage container to create a strict paint boundary, preventing unnecessary repaints of surrounding content.
- **`backface-visibility: hidden`** prevents blurry sub-pixel rendering on 3D transforms in Safari.
- Transitions that use `filter: blur()` (e.g. T31 Cinematic Bars) are the most expensive. Use them sparingly on mobile.

---

## Browser Support

| Browser | Support |
|---|---|
| Chrome / Edge 90+ | ✅ Full |
| Firefox 89+ | ✅ Full |
| Safari 15.4+ | ✅ Full (`clip-path` polygon requires 15.4+) |
| Safari < 15.4 | ⚠️ Polygon transitions degrade gracefully |
| Mobile Chrome / Safari | ✅ Full (tested on iOS 16+) |

> **Note:** The `oklch()` colour function used in `.layer-accent` requires Chrome 111+, Firefox 113+, and Safari 15.4+. On older browsers it will silently produce no colour on that layer — all other transitions remain unaffected.

---

## License

MIT — free to use, modify, and distribute.
