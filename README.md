# SCAPE° — Galton-Brett ("Klima ist Statistik")

A browser-only Galton board: one ball is weather, the mountain of many balls
is climate. Visitors set or remove nails, shift the drop point and switch
between "Normalklima" and "Extremklima" to see the three effects of climate
change on a distribution: shift of the mean, wider spread, many more
extremes. Up to three runs can be frozen as dashed comparison lines.

Three tasks (365 balls; shift the drop point; extreme climate) sit behind
a full-width button under the controls that carries the progress, and open
in the same modal the other SCAPE° exhibits use — except that these check
themselves off while the visitor plays, so an item has no answer field.

## Run

Open `index.html` (double-click works, no build, no server, works offline),
or serve the folder with any static file server / GitHub Pages.

URL switches for staff:

- `?kiosk` – exhibit mode: back to the start after 3 minutes without touch.
- `?dev` (or Shift+D, or the faint "(dev)" link in the footer) – staff panel:
  +1000/+5000 balls, time-lapse, collisions, exact theory curve, CSV export,
  y-axis scaling, feed pacing.

Zoom: two fingers on touch screens, Ctrl + mouse wheel on desktop.

## Files

```
index.html          structure only (data-t placeholders for every text)
css/kit.css         shared SCAPE° components (same in every app)
css/app.css         layout of this app
js/view.js          phone/desktop layout switch (loaded in <head>)
js/texts.js         fills the texts from content/
js/brand.js         fills logo and footer line from the theme
js/kit.js           fullscreen button, hint badge, info notes, tasks/Merke, kiosk, dev switch
js/app.js           board geometry, ball physics, drawing and interaction
content/texts.de.js every visible text (edit or translate here)
theme/              the design: font, palette, logo, colours (see theme/README.md)
```

## Controls

Under the board, two rows and nothing else. The first is everything that
makes balls fall — ball count, play/pause, a single ball, reset-the-balls —
as pictograms, with one `(i)` that shows them again and names them (a tap
on the count steps by one, holding it winds through in fives, 1…2000); captions would double
the height of the block and a play triangle needs none. The second is
everything that changes the board: a **Klima** dropdown (Normalklima /
Extremklima, or "Angepasst" once nails are edited by hand) and
two board buttons and its own `(i)`. The climate is a plain `<select>`,
so a third climate is one `<option>` away rather than another button
fighting for width; "Angepasst" is in the list but hidden, because it is a
state the board can be in, never something to choose. The first board
button resets to Normalklima (full triangle, drop point centred, heap
cleared) — the exhibit's opening state — and the second strips every nail
off the board, which is its own small lesson: with nothing to deflect
them, every ball lands in the same bin. Pressed again on an empty board
it puts the nails back exactly as they were, hand-placed ones included —
otherwise it would be a dead control at precisely the moment a visitor
wants a way out of the state it just created. On the board itself: the funnel is the drop
point, fullscreen sits top right, and the two things you set about the
columns sit on either side of them — the ceiling stepper bottom left, the
three comparison tiles bottom right, each in the colour of the line it
freezes.

The readout above the controls is a four-column grid of equal fractions
rather than content-sized blocks: while balls are in the air the first
value reads "0 (+365)" instead of "0", and content sizing made every other
number jump sideways the moment a run started.

## Layout

Phone: board settings, the square board, readout, Start/Einzeln/Reset,
comparison, tasks. Desktop (automatic from 1000 px, or via the
"Desktop-/Handy-Ansicht" toggle, remembered for this app only): the board on
the left, sized to the screen; all controls and tasks on the right.

## Model notes

Three decisions in `js/app.js` are not obvious from the code alone:

- **Extremklima thins the board, it does not add to it.** Every odd row
  stays complete, every even row keeps only half of its nails, in a
  checkerboard that shifts by one column from one thinned row to the next
  (45 nails instead of 55). A nail re-rolls the dice; a gap does not, so a
  ball crossing one keeps the direction it already had, and those
  correlated steps add up instead of cancelling. Exactly (not sampled):
  σ 1.58 → 1.89, peak column 24.6 % → 18.8 %, extremes 2.1 % → 6.4 %,
  mean untouched. Adding the between-row nails instead widens nothing —
  they are deterministic outward deflectors, and switching them all on
  gives a bimodal U (σ = 6.0). Emptying whole rows overshoots (every ball
  passes, instead of half of them); emptying every second row collapses the
  board onto one bin, because only one parity of half-column stays
  reachable.
- **The drop point is the funnel.** It is dragged along a notched rail at
  the top of the board rather than set with a stepper under it, so a
  visitor standing in front of the exhibit sees the thing the balls come
  out of move. The grip is drawn on the ball canvas, after the balls, so
  the stream passes behind it. A pair of visually hidden buttons
  (`#drop-ctl`) keeps it reachable by keyboard and screen reader.
- **The drop point steps in whole columns.** A ball enters carrying no
  direction, so it does not drift: it waits in its entry column until some
  row has a nail there. On the thinned board those rows sit on even
  half-columns, so a half-column entry is quantised down and the shift is
  swallowed — the exact DP gives a mean of 0.016 where 0.5 was asked for.
  With whole columns the mean tracks the stepper exactly in both climates
  (measured over 2 920 balls: +0.99 and +2.02). The triangle has no margin
  beyond its flanks, so an off-centre drop does cost spread: σ 1.58 → 1.41
  → 1.22 in Normalklima, 1.89 → 1.62 → 1.32 in Extremklima.
- **A column is a ball count against a ceiling the visitor sets.** The
  stepper beside the columns runs 10 · 20 · 50 · 100 · 200 · 500 · 1000 ·
  2000 · 5000 and starts at 200, which puts the default 365-ball run at
  about half the available height. Nothing rescales by itself: a heap that
  is topped up just keeps growing in the same frame, and zooming out is a
  tap rather than something that happens to you. When a column does reach
  the ceiling the `+` lights up and says "Säule voll", because at that
  point every further ball lands in a bar that cannot grow and the picture
  quietly stops being true. Three other readings (an auto-growing ceiling, share of the
  tallest column, share of all balls) stay in the dev panel.
- **A ball flies one arc from nail to nail**, not one per level. Where a
  nail is missing nothing touches the ball, so it has to sail straight
  over the empty slot — and an arc is only straight if nothing re-aims it
  halfway. Re-aiming per level made a ball visibly veer sideways exactly
  where a nail had been taken out, because the flight to the next level is
  far shorter in time than a bounce arc (already falling fast, no upward
  kick) and covering the same sideways distance in it needed a burst of
  speed. The lattice bookkeeping is untouched — same half-columns in the
  same order, so the distribution is unchanged (measured over 5 000 balls:
  σ 1.56 normal, mean +0.98 / σ 1.63 in Extremklima at its drop point).
- **Ten pin rows, not twelve, and the bin walls start at 0.69 instead of
  0.80.** Together with a frame a tenth taller than wide that is about
  75 % more height for the columns. The simulation lives in a unit space,
  so a taller box only maps each unit of height to more pixels; nail
  spacing, ball size and the fall are untouched. Ten rows means 11 bins and
  an ideal σ of √10/2 = 1.581 (measured 1.57).

## Adapting

Design: `theme/` only (board colours in `THEME.galton`). Texts:
`content/texts.de.js` only. Founders Grotesk is used when installed,
otherwise the system fallback.
