# SCAPE° — Galton-Brett

An interactive Galton board in the browser: a metaphor for the difference
between **weather** (a single ball, unpredictable) and **climate** (the
distribution many balls form together) — and for what climate change does
to that distribution.

Tap the board to **add or remove pins**, choose how many balls to drop, and
press **Start**. Because a ball that meets no pin keeps drifting the way it
was already going, editing the pin field is not neutral: thinning the right
flank shifts the whole distribution towards the warm end, while thinning
both outer flanks leaves the mean alone but widens the curve and fattens
its tails. Three presets — *Normalklima*, *Wärmer*, *Mehr Extreme* —
demonstrate the shift-of-mean, increase-of-variance and effect-on-extremes
cases that the accompanying text explains.

- Pure client-side canvas + JavaScript — no build step, no server, no
  dependencies beyond a Google Fonts stylesheet.
- Simulation: each ball tracks which column it occupies and makes one
  left/right decision per pin row, so the board is exactly binomial
  (measured σ ≈ 1.70 against an ideal σ = 1.73 for 12 rows). Balls may only
  settle once every pin row is behind them, so a growing heap can never
  intercept a ball that is still choosing its column.
- Design: SCAPE° corporate design (Archivo, thick ink borders, poster-hero
  layout), mobile-first and optimized for touch, with a desktop view that
  is auto-detected and can be toggled by hand.

Open `index.html` directly, or serve the folder with any static file server.
