# velocity-borb

Internal smoke-and-mirrors preview for the Velocity concept — three demo formats explaining the AI-native pre-IPO SOX 404 self-serve play.

**Live:** https://sandersonboard.github.io/velocity-borb/
**Code:** `BORB`

## What's here

| File | Purpose |
|---|---|
| `index.html` | Landing — the three demo options as cards |
| `option-1.html` | **Scripted wizard click-through.** Full 5-step wizard with fake streaming. Best for "feels like a product" demos. |
| `option-2.html` | **Split-screen race.** Big 4 timeline vs Velocity, same clock. Best for exec / board pitch. |
| `option-3.html` | **Long-scroll narrative.** Sarah's story, end-to-end. Best as a shareable URL. |
| `pdf-sample.html` | The "exported" PDF report. Linked from options 1 and 3. |
| `shared.css` / `shared.js` | Common styles, fake streaming, password gate, Helios Robotics fixture data. |

## How it works

Zero build step. Plain HTML/CSS/JS with Tailwind not even loaded — everything is in `shared.css`. Deploys to GitHub Pages from `main`.

The password gate (`BORB`) is intentionally soft — a `sessionStorage` flag, client-side check. Anyone with browser dev tools can bypass it. Its only job is to keep the URL from being casually shared or indexed.

## Anonymization

All names are anonymized:
- "Auditborb" / "Velocity" instead of the real company / product
- "Helios Robotics" is a fictional Series D customer
- "Sarah Chen" is a fictional Controller
- "Deloitte" is named generically as the customer's chosen auditor
