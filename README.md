# SCAPE° — Galton-Brett

An interactive Galton board in the browser: a metaphor for the difference
between **weather** (a single ball, unpredictable) and **climate** (the
distribution many balls form together) — and for what climate change does
to that distribution.

Tap an empty spot to **set a pin**, tap an existing one to **remove it** — one
gesture, no mode to switch first — or clear the whole field with **Alle
entfernen**, which is its own small lesson: with nothing left to deflect
them, every ball falls straight into the middle bin and a pile of chance
events collapses into one certain outcome. Drop a single ball with
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

Tap or hover a histogram column for its exact ball count — bar height is
always *relative to the tallest column*, not an absolute scale, which is
what keeps a 20-ball run and a 5 000-ball run equally readable; the caption
under the board says so, and the tooltip gives the real number on demand,
plus one line per active comparison line at that same column. Two dashed
red lines mark where the "Extreme" percentage in the readout starts
counting. Up to three **Vergleichslinien** — a compact row of numbered
tiles right under the board — freeze the current distribution as a dashed
reference curve: tap an empty tile to save it, a filled one to clear it, so
one experiment can be held up against the next, across a **Reset** or a
scenario switch (Reset only clears the current heap of balls; it leaves
the pins and the scenario exactly as they were). Pinch to zoom the board
itself for placing a pin precisely, and drag to pan once zoomed in — no
on-screen buttons for it, since it is a gesture people already know and
there is nothing to pinch on desktop anyway.

**Szenario** and **Alle entfernen** collapse into one row under the board:
tapping the scenario button (labelled with whichever preset is active)
opens a small panel with the three presets, which closes itself again once
you pick one.

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
  stays exactly binomial (measured over 40 000 balls: σ = 1.72–1.73 with
  contact, against an ideal 1.732). Pairs are found with a uniform grid of
  one ball diameter per cell, so the cost grows with the number of balls
  rather than with its square: 1 000 balls in flight hold a locked 60 fps.
  Contact is resolved once per physics substep rather than once per frame,
  with gentler correction and a touch of sideways damping, and the feed
  spawns balls across a wider mouth — together that is what keeps a crowded
  drop looking like a jostle rather than a jitter.
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
- The wedged, between-row slots have no dot pattern of their own to hint at,
  unlike the classic triangle's on-row ones, so an empty usable slot gets a
  faint hollow placeholder — otherwise a visitor could tap the board for a
  while without ever finding out a wedged pin was possible at all.
- A dev panel, not part of the exhibit, drops 1 000 or 5 000 balls at
  once, toggles ball-to-ball contact, clears just the balls, and runs the
  simulation from 0.25&times; up to 8&times; speed. Above 1&times; that means
  several full ticks per rendered frame; below 1&times; it means a tick only
  fires once every few frames, via a fractional credit that accumulates by
  `timeScale` each frame — slow motion made of the exact same ticks as
  normal speed, at a lower rate, rather than the same number of ticks fed a
  smaller time step (which would quietly be *different* physics, not the
  same physics slowed down). A **Theorie-Kurve** toggle computes the *exact*
  probability distribution for whatever is currently on the board — a small
  dynamic program over (half-column, direction) states, using the identical
  branching stepBall itself uses, just without the dice — and draws it
  dotted, scaled to a fixed large total so it neither shrinks nor jumps
  around as the real run's own ball count changes; it is the same check
  that keeps the "exactly binomial" claim above honest. A **S&auml;ulenh&ouml;he
  absolut** toggle changes what a column's "full" height means: normally
  it is simply whichever bin currently holds the most balls, which is why
  one ball could fill a column solid, only for a second ball landing
  elsewhere to also fill solid, and a third stacking onto the first to
  suddenly halve both — the "full" mark kept chasing whatever had just
  landed. Absolute mode measures against a fixed target instead — the
  *Theorie-Kurve* peak, scaled to however many balls are actually queued —
  so a column climbs smoothly towards its real, stable height as balls
  land, rather than lurching every time the current leader changes. A
  **CSV exportieren** button downloads the current bin counts and summary
  stats. Dev mode also opens up two more columns of otherwise-unreachable,
  further-out diagonal pin slots (drawn as faint red dashed ghosts) for
  experimenting with configurations no ordinary chain of deflections would
  produce. Open the panel with `#dev` or `?dev=1` in the URL, the small
  `(dev)` link at the page foot, or Shift+D; it is remembered afterwards,
  and every dev-only effect switches off the moment the panel is closed.
- The board itself is about 25% shorter than it first was (a square
  aspect ratio instead of 3:4), reclaiming a good chunk of vertical space
  on a phone without changing any of the physics -- everything about a
  ball's motion is defined in a resolution-independent unit space, so a
  shorter box just means each unit of that space maps to fewer pixels
  vertically; nail spacing, ball size and the fall itself all stay exactly
  as tuned.
- Design: SCAPE° corporate design (Archivo, thick ink borders, poster-hero
  layout), mobile-first and optimized for touch, with a desktop view that
  is auto-detected and can be toggled by hand.

Open `index.html` directly, or serve the folder with any static file server.
