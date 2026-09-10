# SCAPE° — Galton-Brett

An interactive Galton board in the browser: a metaphor for the difference
between **weather** (a single ball, unpredictable) and **climate** (the
distribution many balls form together) — and for what climate change does
to that distribution.

Tap the board to **add or remove pins**, drop a single ball with **Einzeln**
or a whole batch with **Start**. Balls are always *added* to what is already
there, so the board can be topped up again and again — and the pins edited
in between — while the heap stays put and visibly bends towards the new
layout. Because a ball that meets no pin keeps drifting the way it
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
  (measured σ ≈ 1.71 against an ideal σ = 1.73 for 12 rows). Between two
  rows it follows a real parabola — an upward kick off the pin plus exactly
  the sideways speed needed to arrive on the next one — so it visibly
  bounces rather than gliding, and crosses the board in about 1.5 s. Balls
  may only settle once every pin row is behind them, so a growing heap can
  never intercept a ball that is still choosing its column.
- Slots are addressed by a half-column index h whose parity follows the
  row's, because the ball moves one half-step per row. The classic triangle
  sits on the slots sharing that parity; the *in-between* slots are the
  opposite parity, exactly half a column along, and start empty. A pin
  there does not catch a ball head-on but clips its shoulder, biasing the
  left/right choice rather than deciding it. They are not drawn until a
  visitor places one, so the triangle stays legible.
- A ball enters at the apex and moves at most one column per row, so it can
  only ever reach |h| <= r at row r. That wedge is tinted on the board and
  bounds where pins can go: a pin outside it is provably unreachable, and
  offering one would be a dead control.
- Design: SCAPE° corporate design (Archivo, thick ink borders, poster-hero
  layout), mobile-first and optimized for touch, with a desktop view that
  is auto-detected and can be toggled by hand.

Open `index.html` directly, or serve the folder with any static file server.
