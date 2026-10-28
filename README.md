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

The decisions in `js/app.js` that are not obvious from the code alone:

- **Every nail is a fair coin; a missing one lets the ball fall on.** A
  ball meeting a nail — on a row, or one a visitor added between two rows
  — goes half a column left or right; a ball meeting no nail falls
  straight down to the next nail below it (two rows on, if it is between
  the nails of the row directly underneath). Earlier versions had two
  shortcuts here: an added nail threw a ball a whole column outward, and a
  gap kept it travelling sideways half a column per row for as long as the
  gaps lasted. Both showed as long, flat throws no real ball makes. A
  continuous physics simulation of this exact board was tried as the
  alternative and is no better: with the triangle's sides open nearly
  every ball escapes outward (a U-shape), and with the sides as walls the
  result is far too wide (σ ≈ 2.7), lumpy, and unstable — balls come to
  rest on nails.
- **Five climates, each changing one thing in one direction.** Under
  honest rules the spread is set by how many nails a ball meets and the
  mean by where it starts, so:

  | Klima | Nails | Mean | σ |
  |---|---|---|---|
  | Normalklima | small triangle, rows 5–10 (21) | 0 | 1.22 |
  | Wärmeres Klima | the same, one column right | +1 | 1.22 |
  | Kälteres Klima | the same, one column left | −1 | 1.22 |
  | Extremeres Klima | full triangle (55) | 0 | 1.58 |
  | Weniger extremes Klima | rows 7–10 (10) | 0 | 1.00 |

  (Exact; measured over 5 000 balls each: 1.23 · +1.03/1.23 · −0.99/1.23 ·
  1.58 · 1.01.) Warmer and colder move the small triangle along with the
  funnel: the funnel alone would hit the triangle on its flank, miss its
  top rows and come out narrower too (σ 1.00), so the shift would not be
  shown on its own. Every empty place of the full triangle shows a faint
  ring, so in Normalklima the rings *are* the nails that make the climate
  more extreme, and a visitor can build it by hand; places between rows
  are no longer offered.
- **The drop point is the funnel.** It is dragged along a notched rail at
  the top of the board rather than set with a stepper under it, so a
  visitor standing in front of the exhibit sees the thing the balls come
  out of move. The grip is drawn on the ball canvas, after the balls, so
  the stream passes behind it. A pair of visually hidden buttons
  (`#drop-ctl`) keeps it reachable by keyboard and screen reader.
- **The drop point steps in whole columns**, ±2, by dragging the funnel.
  The triangle has no margin beyond its flanks, so an off-centre drop
  costs spread — a ball entering out there falls a few rows before the
  board is wide enough to catch it: σ 1.58 → 1.41 → 1.22 at one and two
  columns out. The mean stays exact.
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
- **A ball flies one arc from nail to nail**, not one per level, and is
  only eased back onto the lattice where something actually touches it.
  Re-aiming at every level put a kink in the path exactly where a nail was
  missing.
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
