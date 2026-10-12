# SCAPE° — Galton-Brett ("Klima ist Statistik")

A browser-only Galton board: one ball is weather, the mountain of many balls
is climate. Visitors set or remove nails, shift the drop point and switch
between "Normalklima" and "Extremklima" to see the three effects of climate
change on a distribution: shift of the mean, wider spread, many more
extremes. Up to three runs can be frozen as dashed comparison lines.

Three tasks (365 balls; shift the drop point; extreme climate) unlock the
"Merke" box. Longer explanations sit in collapsible topics below.

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

## Layout

Phone: board settings, the square board, readout, Start/Einzeln/Reset,
comparison, tasks. Desktop (automatic from 1000 px, or via the
"Desktop-/Handy-Ansicht" toggle, remembered for this app only): the board on
the left, sized to the screen; all controls and tasks on the right.

## Adapting

Design: `theme/` only (board colours in `THEME.galton`). Texts:
`content/texts.de.js` only. Founders Grotesk is used when installed,
otherwise the system fallback.
