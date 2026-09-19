# SCAPE° — Galton-Brett

An interactive Galton board in the browser: a metaphor for the difference
between **weather** (a single ball, unpredictable) and **climate** (the
distribution many balls form together) — and for what climate change does
to that distribution.

Tap the board to **add or remove pins** — or clear the whole field with
**Alle Nägel entfernen**, which is its own small lesson: with nothing left
to deflect them, every ball falls straight into the middle bin and a pile of
chance events collapses into one certain outcome. Drop a single ball with
**Einzeln** or a whole batch with **Start**. Balls are always *added* to what is already
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
  (measured σ = 1.729 over 40 000 balls against an ideal σ = 1.732 for
  12 rows). Between two
  rows it follows a real parabola — an upward kick off the pin plus exactly
  the sideways speed needed to arrive on the next one — so it visibly
  bounces rather than gliding, and crosses the board in about 1.5 s. Balls
  may only settle once every pin row is behind them, so a growing heap can
  never intercept a ball that is still choosing its column.
- Balls collide with one another. The board itself stays a scripted
  binomial walk — a ball's column is decided at the nails, and its x is
  eased back onto the lattice at every level — so contact is resolved on
  top of that as a jostle: overlapping balls are pushed apart and trade a
  little speed, and the lattice straightens them out again on the next
  level. The shower reads like a crowd of real balls while the distribution
  stays exactly binomial (measured over 40 000 balls: σ = 1.725 with
  contact, 1.729 without, against an ideal 1.732). Pairs are found with a
  uniform grid of one ball diameter per cell, so the cost grows with the
  number of balls rather than with its square: 1 000 balls in flight hold a
  locked 60 fps.
- The feed scatters balls across the funnel mouth and gives each its own
  drop speed, aiming every one of them at the apex so the board stays
  binomial. Two balls released in the same frame used to be born at the
  same point with the same speed and stayed welded together for the whole
  drop; together with a release timer that kept banking credit while the
  last balls of a batch were still falling — and then spent it all in one
  frame — that is what made the second and every following release come
  down as a single horizontal front of balls.
- Every nail behaves the same way and every ball that reaches one bounces
  off it. A nail on a row is met head-on and splits the flow with a fair
  coin (half a column either way). A nail wedged between two rows is met
  off-centre, so it cannot split the flow: it throws the ball clear, a
  whole column outward. A whole column rather than half keeps landings on
  the lattice the bins are built on, which is what stops the histogram
  breaking into a comb.
- Because a wedged nail deflects every ball that reaches it, a handful is
  enough: the presets use four nails for a warmer climate and six for a
  wilder one, placed well inside the triangle so no ball is thrown past
  the rows below.
- A ball enters at the apex and moves at most one column per row, so it can
  only ever reach |h| <= r at row r. That wedge is tinted on the board and
  bounds where pins can go: a pin outside it is provably unreachable, and
  offering one would be a dead control.
- A dev panel, not part of the exhibit, drops 1 000 or 5 000 balls at
  once, toggles ball-to-ball contact, and runs the simulation at up to
  eight times speed (whole extra simulation ticks per frame, so the
  statistics are untouched and only the waiting shrinks). It also holds a
  ball-spacing slider that slows Start and Einzeln down to a visible
  trickle for testing the drop feel (0 ms = the exhibit's own automatic
  pacing; the +1 000/+5 000 buttons are unaffected, since they exist to
  load the board fast rather than to feel realistic), a nail-size slider
  that enlarges the drawn pins for a demo without changing where a ball
  actually bounces, and a button that freezes the current distribution as
  a dashed reference curve so a second experiment can be held up against
  it. Open the panel with `#dev` or `?dev=1` in the URL, the small `(dev)`
  link at the page foot, or Shift+D; it is remembered afterwards, and
  every dev-only effect (pacing, nail size, the reference curve) switches
  off the moment the panel is closed.
- Design: SCAPE° corporate design (Archivo, thick ink borders, poster-hero
  layout), mobile-first and optimized for touch, with a desktop view that
  is auto-detected and can be toggled by hand.

Open `index.html` directly, or serve the folder with any static file server.
