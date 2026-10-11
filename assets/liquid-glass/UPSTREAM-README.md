# liquid-glass

[![npm](https://img.shields.io/npm/v/@dpawlikowski/liquid-glass)](https://www.npmjs.com/package/@dpawlikowski/liquid-glass)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@dpawlikowski/liquid-glass)](https://bundlephobia.com/package/@dpawlikowski/liquid-glass)

Liquid glass refraction effect built entirely from CSS and SVG — no WebGL, no canvas, no runtime dependencies.

- Refraction via `feTurbulence` + `feDisplacementMap` on a duplicated scene layer
- Chromatic edge aberration via `mix-blend-mode: screen` pseudo-elements
- Animated turbulence that auto-pauses for `prefers-reduced-motion`
- `backdrop-filter: blur() saturate()` frosted glass surface
- Three presets (`subtle`, `vivid`, `vision`) with full CSS variable override
- React component with TypeScript declarations included

**[Live demo →](https://dpawlikowski0.github.io/liquid-glass/)**

---

## Install

```sh
npm install @dpawlikowski/liquid-glass
```

---

## Quick start

### HTML + vanilla JS

```html
<link rel="stylesheet" href="node_modules/@dpawlikowski/liquid-glass/src/core/liquid-glass.css">

<div class="liquid-glass liquid-glass--vivid">
  <span class="liquid-glass__refraction" aria-hidden="true"></span>
  <div class="liquid-glass__content">
    Hello
  </div>
</div>

<script type="module">
  import { injectLiquidGlassFilter } from "@dpawlikowski/liquid-glass";
  injectLiquidGlassFilter();
</script>
```

Set `--lg-scene-background` to match your page background for strongest refraction:

```css
.liquid-glass {
  --lg-scene-background: url("./bg.svg");
}
```

### React

```jsx
import "@dpawlikowski/liquid-glass/css";
import { LiquidGlass } from "@dpawlikowski/liquid-glass/react";

export function Card() {
  return (
    <LiquidGlass intensity="vision" style={{ "--lg-radius": "36px" }}>
      Settings
    </LiquidGlass>
  );
}
```

---

## Presets

| Class | Description |
|---|---|
| `liquid-glass--subtle` | Minimal blur, low opacity — good for chrome and overlays |
| `liquid-glass--vivid` | Strong saturation, sharp refraction — the default |
| `liquid-glass--vision` | visionOS-style: large radius, deep shadow, wide blur |

---

## CSS variables

| Variable | Default | Description |
|---|---|---|
| `--lg-blur` | `8px` | `backdrop-filter` blur radius |
| `--lg-saturate` | `180%` | `backdrop-filter` saturation |
| `--lg-opacity` | `0.58` | White tint fill opacity |
| `--lg-radius` | `24px` | Border radius |
| `--lg-border-opacity` | `0.45` | Top/side border alpha |
| `--lg-tint` | `255 255 255` | Tint RGB (space-separated, used in `rgb()`) |
| `--lg-shadow` | `0 22px 70px …` | Box shadow |
| `--lg-scene-background` | `transparent` | Background on `.liquid-glass__refraction` |

Override any variable on the element or a parent:

```css
.my-panel {
  --lg-blur: 16px;
  --lg-opacity: 0.3;
  --lg-radius: 32px;
}
```

---

## JavaScript API

```js
import {
  injectLiquidGlassFilter,
  updateLiquidGlassFilter,
  setLiquidGlassMotion,
  filterDefaults,
  SCALE_MIN,
  SCALE_MAX,
} from "@dpawlikowski/liquid-glass";

// Inject once — idempotent, safe to call multiple times.
injectLiquidGlassFilter({ scale: filterDefaults.scale });

// Live-update without re-injection.
updateLiquidGlassFilter("liquid-glass-filter", { scale: 14 });

// Pause / resume the turbulence animation.
setLiquidGlassMotion("liquid-glass-filter", false);

// Scale is clamped to [SCALE_MIN, SCALE_MAX] = [0, 25].
console.log(SCALE_MIN, SCALE_MAX); // 0 25
```

### `injectLiquidGlassFilter(options?)`

| Option | Default | Description |
|---|---|---|
| `id` | `"liquid-glass-filter"` | SVG filter element id |
| `baseFrequency` | `0.008` | `feTurbulence` base frequency |
| `numOctaves` | `2` | Turbulence octaves |
| `scale` | `18` | `feDisplacementMap` scale (clamped to `[0, 25]`) |
| `seed` | `7` | Noise seed |
| `animate` | `true` | Animate turbulence frequency |
| `duration` | `"7s"` | Animation cycle duration |

All defaults are available as `filterDefaults` so you never need to hardcode them:

```js
import { filterDefaults } from "@dpawlikowski/liquid-glass";

// Reference defaults instead of duplicating magic numbers.
injectLiquidGlassFilter({ scale: filterDefaults.scale * 0.75 });
```

### `updateLiquidGlassFilter(id, options)`

Live-updates scale or baseFrequency on an already-injected filter. Returns the `<filter>` element, or `null` if the id is not found.

### `setLiquidGlassMotion(id, enabled, options?)`

Enables or disables the `<animate>` turbulence animation. Pass `{ baseFrequency, duration }` in `options` to change animation parameters at the same time.

---

## React component

```jsx
import "@dpawlikowski/liquid-glass/css";
import { LiquidGlass } from "@dpawlikowski/liquid-glass/react";

<LiquidGlass
  intensity="vivid"       // preset suffix
  refractive={true}       // include refraction layer
  filterId="my-filter"    // custom SVG filter id
  as="section"            // root element type
  style={{ "--lg-radius": "28px" }}
>
  Glass content
</LiquidGlass>
```

### Props

| Prop | Default | Description |
|---|---|---|
| `intensity` | `"vivid"` | Preset: `"subtle"`, `"vivid"`, `"vision"`, or a custom suffix |
| `refractive` | `true` | Include `.liquid-glass__refraction` layer |
| `as` | `"div"` | Root element tag |
| `filterId` | `"liquid-glass-filter"` | SVG filter id — the filter is injected automatically |
| `style` | — | Forwarded; merge CSS variable overrides here |

All other props (`className`, `onClick`, `aria-*`, etc.) are forwarded to the root element.

---

## Browser support

| Browser | Status |
|---|---|
| Chrome / Edge 105+ | Full |
| Safari 16+ | Full (keep `scale ≤ 18` to avoid artifacts) |
| Firefox 103+ | Full |
| No `backdrop-filter` | Graceful fallback: opaque white tint |

---

## Performance

SVG turbulence and displacement map have a real GPU cost. Follow these rules to keep the effect smooth:

- Keep `scale` between `12` and `18`. Values above `25` are clamped and cause Safari artifacts.
- Animate one or two hero surfaces — not every card on the page.
- Use `refractive={false}` (or omit `.liquid-glass__refraction`) when exact backdrop mirroring is not needed.
- Test on a mid-range Android device, not just a desktop browser.
- Use `setLiquidGlassMotion(id, false)` to pause animation on low-power or battery-saver conditions.

---

## Development

```sh
npm install
npm test            # unit tests (node:test + happy-dom)
npm run check       # smoke check — validates files, API surface, and CSS selectors
npm run dev         # interactive demo server
npm run build:demo  # production demo build → dist-demo/
npm pack            # preview the published tarball (runs test + check via prepack)
```

## Publish

The package is published as `@dpawlikowski/liquid-glass` (the unscoped `liquid-glass` name is taken on npm).

```sh
npm login
npm publish --access public
```

---

## License

MIT © Dominik Pawlikowski
