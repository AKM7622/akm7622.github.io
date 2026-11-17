# Akash Majumdar // Technical Blueprint Portfolio

A clean, minimalist, geometric static portfolio website following a strict **Technical CAD / Engineering Blueprint Aesthetic**.

Deployed natively via [GitHub Pages](https://akm7622.github.io).

---

## Aesthetic & Design Rules Enforced

- **Zero Rounded Corners**: Global `border-radius: 0 !important;` across all elements, badges, inputs, and cards.
- **Zero Glassmorphism**: `backdrop-filter: none !important;` — crisp solid geometric surfaces with sharp 1px borders.
- **Zero Gradients**: No CSS linear, radial, or conic gradients. Solid fills, high-contrast borders, and clean geometric markers.
- **Pure Monospace Typography**: Rendered exclusively in `JetBrains Mono` across all headings, body text, tables, and metadata chips.
- **CAD Crosshair Markers**: Precision corner markers (`+`) on all schematic cards.

---

## Features

- **Live System Telemetry**: Real-time local time and UTC timestamp clock display.
- **Theme Modes**: Dark Technical Drafting Board (default) and Light Blueprint Paper with zero FOUC (`light-dark()`, `<meta name="color-scheme">`).
- **Discipline Filter**: Instant categorization for Featured Projects (`[ALL]`, `[WEB]`, `[SYSTEMS]`, `[HARDWARE]`).
- **Copy-to-Clipboard**: One-click email copy with instant visual feedback.
- **Keyboard Navigation**:
  - `1`: Jump to System Identification (`#about`)
  - `2`: Jump to Capabilities Matrix (`#skills`)
  - `3`: Jump to Project Schematics (`#projects`)
  - `4`: Jump to Chronological Logs (`#experience`)
  - `5`: Jump to Communication Dispatch (`#contact`)
  - `T`: Toggle Dark / Light Theme

---

## Local Development & Preview

Run any lightweight static server:

```bash
# Python 3
python -m http.server 8000
```

Open `http://localhost:8000` in any browser.
