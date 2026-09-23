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
its tails.

Two controls under the board turn that into the two textbook cases, and
they are deliberately independent so they can be combined. **Einwurf** — a
small −/+ stepper — slides the point where balls enter the board, up to two
columns either way in half-column steps, and the whole heap follows it one
for one (measured over 1 460 balls: mean +0.52 at +0.5 columns, +1.06 at
+1.0), which is *Verschiebung des Mittels*. The funnel mouth leans towards
the new entry point so the cause is visible on the board and not just in a
number. **Extremklima**, the second of the two board states next to
*Normalklima*, empties four pin rows (2, 5, 8 and 11 — 48 nails instead of
78). That is the counter-intuitive part and it is the whole lesson: a nail
re-rolls the dice, a gap does not. A ball falling through an empty row
keeps the direction it already had, so those carried-over steps add up
instead of cancelling, and the curve gets wider and flatter with the mean
untouched — σ 1.75 → 2.25, extremes 0.8 % → 3.8 %, peak column 22.6 % →
17.2 %. Set both at once and the third effect falls out by itself: at
Extremklima with the drop two columns right, 9.0 % of balls land beyond the
extreme markers against 0.8 % in the baseline.

*Adding* pins would be the intuitive way to widen the curve, and it does
not work on this board: the between-row nails are deterministic outward
deflectors rather than extra coin flips, so switching all of them on turns
the distribution into a bimodal U (σ = 6.0, 100 % extremes). Removing rows
is the mechanism that actually produces the *Zunahme der Streuung* figure.
Which rows matters too: emptying *every other* row collapses the board to
a single bin, because a ball on an even half-column then never meets an
odd one — rows 2/5/8/11 keep both parities in play and stay well behaved at
every drop point. One honest cost: the triangle has no margin beyond its
flanks, so a ball dropped off-centre falls a few rows before the board is
wide enough to catch it and loses those decisions — σ 1.73 → 1.58 at one
column out, → 1.41 at two. The mean stays exact. Widening the entry with an
apron was tried and is worse (balls escape past the far flank and pile into
the end bin, bimodal at ±2 columns).

Tap or hover a histogram column for its exact ball count. What a column's
full height *stands for* is a real question with no single right answer, so
dev mode carries four readings of the y-axis to choose between and the
caption under the board always names the active one in plain words — see
the dev-panel notes below; the tooltip gives the real number on demand,
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
tapping the scenario button (labelled with whichever state is active) opens
a small panel with *Normalklima* and *Extremklima*, which closes itself
again once you pick one. The **Einwurf** stepper sits in its own row just
below, with its own `?`.

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
  with gentler correction and a touch of sideways damping; the x-lattice
  correction at each level crossing eases the ball onto the lattice instead
  of snapping it there, which is what stopped two balls in the same column
  being teleported onto the same point and then slowly prising themselves
  apart — the "glued, then suddenly flung away" motion (frames holding a
  stuck pair: 38.6 % → 4.2 %, longest stuck streak 22 frames → 2). The feed
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
  enough to bend a distribution by hand — placed well inside the triangle
  so no ball is thrown past the rows below.
- The drop point lands on a lattice of half-columns, but the stepper moves
  in fractions of one. Rather than rounding — which would quietly make
  "+0.5 columns" mean "+1" — a fractional offset starts each ball on one of
  the two neighbouring slots at random, weighted so the *mean* entry point
  is exactly where the readout says it is.
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
  same physics slowed down). Two crowding controls, for the +5 000 runs
  that used to arrive as an unreadable wall: **Abstand** fixes the gap
  between releases (30/60/120/250 ms instead of the automatic pacing), and
  **Max. gleichzeitig** caps how many balls may be in flight at once
  (400/150/60/25), holding the rest in the queue until there is room —
  measured with the cap at 60, a 5 000-ball run peaks at 60 balls in flight
  instead of 1 115. A **Theorie-Kurve** toggle computes the *exact*
  probability distribution for whatever is currently on the board — a small
  dynamic program over (half-column, direction) states, using the identical
  branching stepBall itself uses, just without the dice — and draws it
  dotted, scaled to a fixed large total so it neither shrinks nor jumps
  around as the real run's own ball count changes; it is the same check
  that keeps the "exactly binomial" claim above honest. A **Y-Achse**
  button cycles through four answers to "what does a full column mean?",
  each with its own trade-off, so the exhibit can be judged on real runs
  rather than in the abstract: *Anteil der höchsten Säule* (the original —
  always uses the full height, but the reference moves, which is why one
  ball fills a column solid and a third ball stacking onto it halves the
  neighbours), *Anteil aller Kugeln* (a column is full at 30 % of
  everything that has landed — stable once a few hundred balls are down,
  meaningless for the first few), *Anteil der erwarteten Spitze* (full =
  the *Theorie-Kurve* peak scaled to however many balls are queued, so
  columns climb smoothly towards their real final height) and *Kugeln je
  Säule* (a flat 100 balls — genuinely absolute, but a 20-ball run is then
  a barely visible smear). The caption under the board rewrites itself to
  name the active one and what the top of the axis stands for. A
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
