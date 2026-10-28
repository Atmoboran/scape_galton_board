// Galton-Brett: board geometry, ball physics, drawing and interaction.
(() => {
  'use strict';

  // ============ GEOMETRY (board coordinates) ============
  // The board is described in a unit space: x in [0,1] across the width,
  // y in [0,1] from the funnel mouth down to the floor of the bins. All
  // physics runs in this space and is only scaled to pixels for drawing,
  // so the simulation behaves identically on a phone and on a desktop.
  const ROWS = 10;            // triangular pin rows
  const BINS = ROWS + 1;      // one collecting bin per landing column
  const TOP_Y = 0.17;         // first pin row
  const ROW_DY = 0.049;       // vertical pin spacing
  const COL_DX = 0.060;       // horizontal pin spacing
  // Two rows fewer than it had (12 -> 10) and the bin walls 11 points
  // higher (0.80 -> 0.69): together that is 58% more height for the
  // columns in unit space, and the frame is a tenth taller on top of that.
  // The gap between the last pin row and the bin tops is kept at roughly
  // what it was (0.09), since that is the stretch a ball uses to slide
  // back onto its own column after a shove.
  const BIN_TOP = 0.69;       // where the bin walls begin
  const FUNNEL_Y = 0.075;     // where the funnel narrows to its mouth
  const PIN_R = 0.009;        // pin radius
  const BALL_R = 0.011;       // ball radius
  // Fall time scales as 1/sqrt(g), so a quarter of the speed needs a
  // sixteenth of the gravity. The bounce is scaled with it so the arc keeps
  // the same shape rather than turning into a flat skim.
  const GRAVITY = 0.1406;     // unit-space gravity -- a full drop takes ~12s
  const BOUNCE = 0.0125;      // upward kick off a pin, so the hop is a real arc
  const SUBSTEPS = 2;
  const DT = 1 / 60 / SUBSTEPS;

  // ============ PIN GRID ============
  // Two kinds of slot share each row.
  //
  //   * Default slots sit where the classic triangle has its pins. A ball
  //     arriving at such a slot is deflected left or right by a fair coin.
  //   * In-between slots sit half a column further along, exactly in the
  //     gap a ball passes through on its way to the next row. A pin there
  //     does not catch the ball head-on; it clips the shoulder and pushes
  //     it away from that gap, which biases the choice instead of deciding
  //     it. They start empty and are only drawn once one is placed.
  //
  // Both are addressed by a half-column index h: even h is a default slot,
  // odd h an in-between one. A ball always sits on an even h.
  // A single kind of nail. Slots are addressed by a half-column index h,
  // and a ball at row r always sits on an h of the same parity as r --
  // that is simply what "one half-column per row" means. So the slots a
  // ball can ever meet are exactly those, and they are the only ones that
  // can hold a nail. The classic triangle fills |h| <= r; the slots just
  // outside it are reachable too once a ball has flown through a hole and
  // carried on outwards, so they are offered as well.
  let pins = [];            // pins[r][h + HOFF] -> boolean
  let pinPos = [];          // matching lattice positions
  let HOFF = 0;             // shifts h into a non-negative array index
  let HSPAN = 0;            // number of half-slots per row

  function slotX(row, i) { return 0.5 + (i - row / 2) * COL_DX; }
  function slotY(row) { return TOP_Y + row * ROW_DY; }

  // x of half-index h: h counts half-columns out from the board's centre,
  // so it is absolute and does not depend on the row.
  function halfX(r, h) { return 0.5 + h * COL_DX / 2; }

  const LEVELS = 2 * ROWS;    // even levels are the board's rows, odd the gaps

  // y of a level: even levels sit on the row, odd ones halfway to the next.
  function levelY(q) { return TOP_Y + (q / 2) * ROW_DY; }

  // The buffer past the last row's own reach (+1 for the everyday wedge
  // slots, +2 more on top of that for dev mode's further-out experimental
  // ones) has to fit in the array on both sides, hence +4 here rather
  // than the +1 a purely non-dev board would need.
  function buildLattice() {
    HOFF = ROWS + 4;
    HSPAN = 2 * (ROWS + 4) + 1;
    pinPos = [];
    for (let q = 0; q < LEVELS; q++) {
      const rowPos = [];
      for (let j = 0; j < HSPAN; j++) rowPos.push({ x: halfX(0, j - HOFF), y: levelY(q) });
      pinPos.push(rowPos);
    }
  }

  // A ball moves half a column per row, so after the row at level q = 2r
  // it sits on an h with |h| <= r and the parity of r. At the in-between
  // level just below, q = 2r+1, it is heading for row r+1, so the slots
  // there are the ones of row r+1. Those are the positions a nail can
  // occupy at each level -- everything else is out of reach.
  function levelReach(q) {
    return (q % 2 === 0) ? (q / 2) : ((q - 1) / 2 + 1);
  }

  // r+1 is reachable by any ball that has already been thrown outward once.
  // Dev mode opens two more columns beyond that, for experimenting with
  // configurations no ordinary chain of deflections would ever reach.
  function slotUsable(q, j) {
    const h = j - HOFF;
    const r = levelReach(q);
    const maxH = r + 1 + (devOn ? 2 : 0);
    return (((h - r) % 2) + 2) % 2 === 0 && Math.abs(h) <= maxH;
  }

  // The board's own nails: the classic triangle on the even levels.
  function isDefaultSlot(q, h) {
    if (q % 2 !== 0) return false;
    const r = q / 2;
    return (((h - r) % 2) + 2) % 2 === 0 && Math.abs(h) <= r;
  }

  function pinAt(q, h) {
    const j = h + HOFF;
    if (j < 0 || j >= HSPAN) return false;
    return pins[q][j];
  }

  function defaultPins() {
    const p = [];
    for (let q = 0; q < LEVELS; q++) {
      const row = [];
      for (let j = 0; j < HSPAN; j++) row.push(isDefaultSlot(q, j - HOFF));
      p.push(row);
    }
    return p;
  }

  // A board with every nail pulled out. Reachable in one tap, because
  // clearing it by hand would be a hundred and fifty of them -- and because
  // the empty board makes the point on its own: with nothing to deflect
  // them, every ball falls straight through into the middle bin, and a pile
  // of chance events collapses into a single certain outcome.
  function emptyPins() {
    const p = [];
    for (let q = 0; q < LEVELS; q++) {
      const row = [];
      for (let j = 0; j < HSPAN; j++) row.push(false);
      p.push(row);
    }
    return p;
  }

  // ============ THE TWO CLIMATES ============
  // Normalklima is the classic full triangle: every row of nails present,
  // every ball re-deciding left/right ten times, which is exactly what
  // makes it binomial (sigma = sqrt(10)/2 = 1.58 columns).
  //
  // Extremklima thins the board instead of adding to it. That is the
  // opposite of what intuition suggests -- *fewer* nails, not more -- and
  // it is worth spelling out why it widens the spread rather than
  // narrowing it. A nail re-rolls the dice: it sends the ball left or
  // right with a fresh coin, independent of how it arrived, and
  // independent steps are what keep a binomial narrow (they cancel each
  // other out). A gap does not re-roll anything: a ball crossing one
  // simply keeps going the way it was already going. Those carried-over
  // steps are correlated rather than independent, and correlated steps add
  // up instead of cancelling -- so the mountain gets wider and flatter,
  // with the same mean.
  //
  // The pattern: every odd row stays complete, every even row keeps only
  // half of its nails, in a checkerboard that shifts by one column from
  // one thinned row to the next. 45 nails instead of 55.
  //
  //        r=0        .           .           *           .           .
  //        r=1        .        *     *        .
  //        r=2        .     *     .     *     .
  //        r=3     *     *     *     *
  //        r=4  *     .     *     .     *
  //
  // Measured exactly (not sampled), at the centre drop point:
  //   Normalklima  sigma 1.58   peak bin 24.6%   extremes 2.1%
  //   Extremklima  sigma 1.89   peak bin 18.8%   extremes 6.4%
  //
  // Thinning *within* a row rather than emptying whole rows matters for
  // two reasons. A completely empty row (an earlier version emptied rows
  // 2, 5, 8 and 11) lets every ball through, so the correlated step is a
  // certainty rather than a coin's worth of chance, which overshoots; and
  // a board of alternate empty rows leaves only one parity of half-column
  // reachable, so a ball entering on the other one meets nothing at all
  // and the distribution collapses onto a single bin. Here every row still
  // catches about half the balls that reach it, at every drop point.
  function extremeKeeps(r, h) {
    if (r % 2 !== 0) return true;              // odd rows stay complete
    return (((h - r) % 4) + 4) % 4 === 0;      // even rows: every other nail
  }

  function scenarioPins(name) {
    const p = defaultPins();
    if (name !== 'extrem') return p;

    for (let r = 0; r < ROWS; r++) {
      const q = r * 2;                         // row r lives on level 2r
      for (let h = -r; h <= r; h += 2) {
        if (!extremeKeeps(r, h)) p[q][h + HOFF] = false;
      }
    }
    return p;
  }

  function countPins() {
    let n = 0;
    for (let q = 0; q < LEVELS; q++) {
      for (let j = 0; j < HSPAN; j++) {
        if (pins[q][j]) n++;
      }
    }
    return n;
  }

  // ============ BINS ============
  // One bin per landing column, each centred exactly on the half-lattice
  // position a ball can finish on, so a ball always lands in its own bin.
  const BIN_W = COL_DX;
  const EDGES = (function () {
    const left = 0.5 - ROWS * COL_DX / 2;   // x of the leftmost landing column
    const e = [];
    for (let i = 0; i <= BINS; i++) e.push(left - COL_DX / 2 + i * COL_DX);
    return e;
  })();

  function binIndex(x) {
    if (x <= EDGES[0]) return 0;
    if (x >= EDGES[BINS]) return BINS - 1;
    return Math.max(0, Math.min(BINS - 1, Math.floor((x - EDGES[0]) / BIN_W)));
  }

  // ============ THEORY (dev-only) ============
  // The exact probability distribution for the current pin layout, worked
  // out by dynamic programming instead of dropped balls: a state is a
  // (half-column, direction) pair, and each level updates every state's
  // probability with precisely the same branching stepBall uses -- a fair
  // coin at an on-row nail, a deterministic push at a wedge nail, a hole
  // that keeps the ball going the way it was already headed. Doing this in
  // full only takes a few hundred additions over the 24 levels, so it is
  // cheap enough to recompute on every redraw while the toggle is on and
  // always be current with whatever nails are on the board right now.
  function computeTheory() {
    let dist = { '0:0': 1 };
    for (let q = 0; q < LEVELS; q++) {
      const next = {};
      for (const key in dist) {
        const p = dist[key];
        const sep = key.indexOf(':');
        const h = parseInt(key.slice(0, sep), 10);
        const dir = parseInt(key.slice(sep + 1), 10);
        const nail = pinAt(q, h);
        let outcomes;
        if (nail && q % 2 === 0) {
          outcomes = [[h - 1, -1, 0.5], [h + 1, 1, 0.5]];
        } else if (nail) {
          const d = h > 0 ? 1 : (h < 0 ? -1 : 0);
          outcomes = d === 0
            ? [[h - 2, -1, 0.5], [h + 2, 1, 0.5]]
            : [[h + 2 * d, d, 1]];
        } else if (q % 2 === 0) {
          outcomes = [[h + dir, dir, 1]];
        } else {
          outcomes = [[h, dir, 1]];
        }
        for (let oi = 0; oi < outcomes.length; oi++) {
          const k2 = outcomes[oi][0] + ':' + outcomes[oi][1];
          next[k2] = (next[k2] || 0) + p * outcomes[oi][2];
        }
      }
      dist = next;
    }
    // A ball that ends up between two columns settles into one of them by
    // a fair coin, exactly like stepBall's own settling rule.
    const out = new Array(BINS).fill(0);
    for (const key3 in dist) {
      const h3 = parseInt(key3.slice(0, key3.indexOf(':')), 10);
      const p3 = dist[key3];
      if (((h3 % 2) + 2) % 2 !== 0) {
        out[binIndex(halfX(0, h3 - 1))] += p3 * 0.5;
        out[binIndex(halfX(0, h3 + 1))] += p3 * 0.5;
      } else {
        out[binIndex(halfX(0, h3))] += p3;
      }
    }
    // Scaled to a large, fixed total: this is the asymptotic shape the
    // math predicts, not a forecast for however many balls happen to be
    // on the board right now, so it should not visually shrink or jump
    // around as the real run's own ball count changes.
    for (let bi = 0; bi < BINS; bi++) out[bi] *= 100000;
    return out;
  }

  let bins = new Array(BINS).fill(0);
  let settled = 0;       // how many balls the bins hold, for the readout
  // The bins are the whole sample: mean, spread and extremes are read back
  // out of thirteen counters rather than out of a list with one entry per
  // ball, so topping the board up to several thousand balls costs nothing.

  // Up to three frozen snapshots of earlier bin counts (each a copy, so it
  // does not drift as the live bins keep filling), for comparing one
  // experiment against the next. Survives a reset or a scenario switch --
  // that is the entire point of keeping it around.
  const savedCurves = [null, null, null];

  // ============ BALLS ============
  let balls = [];        // live balls in flight
  let toRelease = 0;     // how many are still queued
  let releaseTimer = 0;
  let releaseEvery = 0.055;  // seconds between drops, set per run
  const MAX_SPAWN_PER_TICK = 40;  // never dump a whole queue into one frame
  // No cap on how many balls may be in flight: a batch is meant to fall as
  // one shower, and capping it made 365 balls arrive as three separate
  // waves of 120.

  // The mouth the feed drops from. Every ball is still aimed at the apex,
  // so widening the mouth only changes what the queue looks like on its way
  // down -- never which slot the ball enters the board on. Wider also means
  // fewer balls overlapping right at spawn, which is where contact used to
  // be at its most crowded and so its most visibly jumpy.
  const FEED_W = 0.14;        // how wide the stream is scattered
  const FEED_TOP = 0.030;     // topmost spawn height, inside the funnel
  const FEED_H = 0.030;       // vertical scatter of the spawn height
  const FIRST_Y = TOP_Y - PIN_R - BALL_R;   // where the apex nail is met

  // ============ DROP POINT ============
  // Where the feed enters the board, in half-columns from the middle. The
  // mean of the finished distribution follows it one-for-one: entering two
  // half-columns to the right moves the whole mountain one bin right, which
  // is the "Verschiebung des Mittels" figure, and it works on top of
  // whichever climate the nails are set to.
  //
  // The slider is finer than the lattice, so a ball cannot simply start on
  // "2.5 half-columns" -- there is no such slot. Instead each ball starts on
  // one of the two neighbouring slots, chosen so that the *average* start is
  // exactly where the slider points. The rounding adds at most 0.25
  // half-columns of variance, against a binomial 12, so it is invisible in
  // the result while keeping the mean exact.
  //
  // One honest side effect: the triangle has no margin above its flanks, so
  // a ball entering off-centre falls past the first few rows before the
  // triangle is wide enough to catch it, and those rows are decisions it
  // never makes. Measured exactly: at +1 column sigma goes 1.58 -> 1.41, at
  // +2 columns 1.58 -> 1.22. The mean stays exact throughout. Widening the
  // triangle to compensate was tried and is worse: the extra nails let balls
  // escape past the far flank, which piles them into the end bin and turns
  // the curve two-humped.
  const DROP_MAX = 4;         // half-columns either way (= 2 whole columns)
  const DROP_STEP = 2;        // one whole column per tap of the stepper
  let dropOffset = 0;       // in half-columns; 0 = the apex

  // Whole columns, not half ones, and the reason is Extremklima rather
  // than tidiness. A ball entering off-centre carries no direction yet, so
  // it does not drift: it waits in its entry column until some row has a
  // nail there. On the thinned board the rows that can catch it sit on
  // even half-columns, so an entry on an odd one is quantised down to the
  // even one below it and the shift is simply swallowed -- exactly, not
  // approximately (the DP gives mean 0.016 instead of the 0.5 asked for).
  // Whole-column steps land on the slots the board actually catches, and
  // the mean then tracks the stepper exactly in both climates.
  function dropX() { return halfX(0, dropOffset); }
  function dropSlot() { return dropOffset; }

  function spawnBall() {
    // h = the ball's position in half-columns, advanced level by level.
    // Tracking it directly is what makes the board exactly binomial.
    //
    // Balls used to start at exactly the same point with exactly the same
    // speed. Two balls released in the same frame were then welded together
    // for the whole drop -- identical height, identical timing -- and came
    // down as one horizontal front. Each ball now gets its own place in the
    // funnel mouth and its own drop speed, and the sideways speed is chosen
    // so that every one of them still arrives exactly at the apex.
    const h0 = dropSlot();
    const entry = halfX(0, h0);
    const x0 = entry + (Math.random() - 0.5) * FEED_W;
    const y0 = FEED_TOP + Math.random() * FEED_H;
    const vy0 = 0.10 + Math.random() * 0.05;

    balls.push({
      x: x0,
      y: y0,
      vx: (entry - x0) / fallTime(vy0, Math.max(0.001, FIRST_Y - y0)),
      vy: vy0,
      h: h0,
      dir: 0,
      hop: true,
      nextRow: 0,
      lastTarget: entry,
      settled: false
    });
  }

  // Vertical room a full histogram column may occupy. The absorbing height,
  // the drawn columns and the curve overlay all derive from this one value,
  // so a ball always stops exactly where the visitor sees its column end.
  const COL_AVAIL = (1 - BIN_TOP) - 0.012;

  function binMax() {
    let maxN = 1;
    for (let m = 0; m < BINS; m++) maxN = Math.max(maxN, bins[m]);
    return maxN;
  }

  // ============ WHAT THE Y-AXIS MEANS ============
  // Four ways to answer "how tall is a column", selectable in dev mode so
  // the right one can be picked by looking at it rather than by argument.
  // Every one of them answers a different question:
  //
  //  'auto'   A plain ball count, like 'fixed' -- but the ceiling is the
  //           next round number above the tallest column (10, 15, 20, 30,
  //           50, 70, 100, ...). So a column means exactly what it says,
  //           small runs are still readable, and big ones do not peg. The
  //           ceiling only ever rises as balls land, and when it does,
  //           every column shortens by the same factor at the same moment
  //           -- one legible rescale of the whole picture, rather than
  //           columns swapping heights among themselves.
  //  'peak'   Share of the tallest column. The previous default. Always
  //           fills the frame, so a 20-ball run and a 5000-ball run read
  //           the same -- but the yardstick is whatever bin is currently
  //           winning, so it moves under you: one ball fills a column
  //           solid, a second elsewhere does too, and a third stacking on
  //           the first halves both. This is the "it keeps switching"
  //           the brief complains about, and it is inherent to the mode.
  //  'share'  Share of all balls that landed, against a fixed ceiling of
  //           SHARE_FULL. This is literally the probability distribution
  //           the exhibit is about, it settles after a hundred balls or so
  //           and then stops moving no matter how many more fall, and the
  //           number has a plain-language meaning ("6% of all balls").
  //  'fixed'  Against a ceiling the visitor sets (colCap, default 1000).
  //           The shipped reading: never moves by itself, so the heap just
  //           grows; the stepper beside the columns zooms in and out.
  //
  // A fifth mode, "share of the expected peak", was tried and dropped: it
  // scaled to the theoretical peak times the number of balls *queued*, so
  // merely pressing Start again rescaled the whole histogram downwards
  // before a single new ball had landed.
  const SCALE_MODES = ['fixed', 'auto', 'peak', 'share'];
  const SCALE_LABELS = {
    auto: t('scale.auto'),
    peak: t('scale.peak'),
    share: t('scale.share'),
    fixed: t('scale.fixed')
  };
  let scaleMode = 'fixed';
  const SHARE_FULL = 0.30;    // 30% of all balls = a full column

  // The shipped reading: a column is a ball count against a ceiling the
  // visitor sets, with the small stepper beside the columns. Nothing moves
  // on its own, so a heap that is topped up keeps growing in the same
  // frame -- and when it outgrows it, zooming out is one tap rather than
  // an automatic rescale the visitor did not ask for.
  const CAP_STEPS = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  let colCap = 1000;          // balls in a full column
  const AUTO_START = 10;      // the smallest ceiling the auto mode uses
  // A plain 1-2-5 ladder would leave the tallest column at half height in
  // the worst case -- 51 balls against a ceiling of 100 -- so the picture
  // would often sit in the bottom half of the frame. These steps are still
  // round numbers to read off but never more than a factor 1.67 apart, so
  // the tallest column always fills at least 60% of the height, at the
  // price of a few more rescales over a long run.
  const AUTO_LADDER = [1, 1.5, 2, 3, 5, 7];

  // Smallest ladder number that is at least n, never below AUTO_START.
  function autoCeiling(n) {
    let pow = 1;
    while (pow <= 1e7) {
      for (let i = 0; i < AUTO_LADDER.length; i++) {
        const c = AUTO_LADDER[i] * pow;
        if (c >= AUTO_START && c >= n) return c;
      }
      pow *= 10;
    }
    return 1e7;
  }

  // The ceiling a column is measured against, in *ball counts*, so the
  // histogram, the curve tracing its tops and the tooltip all agree.
  function currentColMax() {
    let i, total;
    if (scaleMode === 'share') {
      total = 0;
      for (i = 0; i < BINS; i++) total += bins[i];
      return Math.max(1, total * SHARE_FULL);
    }
    if (scaleMode === 'fixed') return colCap;
    if (scaleMode === 'peak') return binMax();
    return autoCeiling(binMax());
  }

  // What the top of the bin area stands for, spelled out for the caption.
  function scaleCeilingText() {
    if (scaleMode === 'share') return t('scale.ceilingShare', Math.round(SHARE_FULL * 100));
    if (scaleMode === 'fixed') return t('scale.ceilingFixed', colCap);
    if (scaleMode === 'peak') return t('scale.ceilingPeak');
    return t('scale.ceilingFixed', autoCeiling(binMax()));
  }

  // Height of the drawn histogram column of a bin, in unit space.
  function heapTop(bi) {
    return 1 - COL_AVAIL * Math.min(1, bins[bi] / currentColMax());
  }

  // Time to fall dy when starting downwards at vy0: solve
  // dy = vy0*t + g*t^2/2 for t. Used for the hop from one level to the
  // next, and for aiming a freshly spawned ball at the apex.
  function fallTime(vy0, dy) {
    const a = GRAVITY / 2;
    return (-vy0 + Math.sqrt(vy0 * vy0 + 4 * a * dy)) / (2 * a);
  }

  // One hop: the ball leaves a pin on a parabola that lands exactly on the
  // next pin down. Levels are half a row apart, so a hop covers half the
  // vertical drop a full row used to.
  function hopTime(vy0) {
    return fallTime(vy0, ROW_DY / 2);
  }

  function stepBall(b) {
    b.vy += GRAVITY * DT;
    b.x += b.vx * DT;
    b.y += b.vy * DT;

    // --- reaching the next level ---
    // Even levels are the board's own rows; odd ones are the gaps between
    // them, where a visitor can wedge an extra nail.
    if (b.nextRow < LEVELS && b.y >= levelY(b.nextRow) - PIN_R - BALL_R) {
      const q = b.nextRow;
      // Ease back onto the lattice rather than snapping onto it. Contact
      // with other balls nudges a ball off its line, and a hard reset would
      // read as a teleport; the residual offset is capped so a jostled ball
      // can never appear a whole column away from the slot it is really in.
      const lat = halfX(0, b.h);
      let off = b.x - lat;
      const cap = COL_DX * 0.35;
      if (off > cap) off = cap; else if (off < -cap) off = -cap;
      b.x = lat + off * 0.5;

      // The height is eased the same way, and for a sharper reason: it used
      // to be hard-set to the level. Two balls crossing the same level in
      // the same column were therefore both teleported onto the *same*
      // point, perfectly overlapping. Contact then had to prise them apart
      // from zero distance, which takes several frames and looks exactly
      // like two balls glued together -- and when the next level finally
      // handed one of them a fresh sideways speed, it shot off, which is
      // the "sudden jump" half of the same bug. Easing keeps whatever
      // vertical gap contact has already opened up, so a column of balls
      // queues instead of collapsing.
      const latY = levelY(q) - PIN_R - BALL_R * 0.5;
      let offY = b.y - latY;
      const capY = BALL_R * 2.5;
      if (offY > capY) offY = capY; else if (offY < -capY) offY = -capY;
      b.y = latY + offY * 0.5;

      const nail = pinAt(q, b.h);

      if (nail && q % 2 === 0) {
        // A nail on the row itself: met head-on, so a fair coin sends the
        // ball half a column left or right.
        b.dir = Math.random() < 0.5 ? -1 : 1;
        b.h += b.dir;
        b.hop = true;
      } else if (nail) {
        // A nail wedged between two rows. It sits off to one side, so the
        // ball cannot split on it -- it is thrown clear, outward, past the
        // neighbouring nail and into the next column. Every ball that
        // reaches it bounces: that is what makes an added nail visible.
        // A whole column, not half, so the ball stays on the lattice the
        // bins are built on.
        b.dir = b.h > 0 ? 1 : (b.h < 0 ? -1 : (Math.random() < 0.5 ? 1 : -1));
        b.h += 2 * b.dir;
        b.hop = true;
      } else if (q % 2 === 0) {
        // A hole where one of the board's own nails should be: nothing
        // touches the ball, so it keeps flying the way it already was
        // instead of being pulled back towards the middle.
        b.h += b.dir;
        b.hop = false;
      } else {
        // Empty air between two rows.
        b.hop = false;
      }

      const nxt = halfX(0, b.h);
      if (b.hop) {
        b.vy = -BOUNCE;
        b.vx = (nxt - b.x) / hopTime(b.vy);
      } else {
        // No nail here, so no upward kick -- the ball is already falling
        // fast and crosses to the next level in a fraction of the time a
        // bounce takes. Timing this hop as if the ball were starting from
        // rest (hopTime(0)) made it about 2.7x too slow sideways, so a
        // ball that arrived with any sideways speed fell short of the slot
        // it was heading for and got yanked the rest of the way by the
        // lattice correction at the next level: the "it gets dragged
        // sideways instead of falling through" artefact, visible only on
        // balls that had bounced off a nail just before (one dropping
        // straight down has nothing to fall short of). Using its actual
        // downward speed makes the gap a smooth, steep free flight.
        b.vx = (nxt - b.x) / hopTime(b.vy);
      }
      b.nextRow++;
      if (b.nextRow >= LEVELS) {
        // A ball that ends between two columns settles into one of them.
        if (((b.h % 2) + 2) % 2 !== 0) b.h += Math.random() < 0.5 ? 1 : -1;
        b.lastTarget = halfX(0, b.h);
      }
    }

    // --- landing ---
    // Past the last pin row the ball drops straight down the column it
    // committed to; letting it keep drifting sideways here would smear the
    // result across neighbouring bins and flatten the curve.
    if (b.nextRow < LEVELS) return;
    const drift = b.lastTarget - b.x;
    if (Math.abs(drift) < 0.004) {
      b.x = b.lastTarget;
      b.vx = 0;
    } else if (b.vx === 0) {
      // Shoved off its column by another ball after it had already lined
      // up. Slide back rather than falling where the crowd left it.
      b.vx = drift * 6;
      if (b.vx > VX_MAX) b.vx = VX_MAX; else if (b.vx < -VX_MAX) b.vx = -VX_MAX;
    }
    if (b.y < BIN_TOP) return;

    // Count the ball into the column the nails chose for it, not into
    // whichever bin it happens to overlap: a late shove from a neighbour
    // must never move a result from one bin to the next.
    const bIdx = binIndex(b.lastTarget);
    const top = heapTop(bIdx);
    if (b.y + BALL_R >= top) {
      b.settled = true;
      b.bin = bIdx;
      b.y = top - BALL_R;
    }
  }

  // ============ BALL-TO-BALL CONTACT ============
  // The board stays a scripted binomial walk: a ball's column is decided at
  // the nails and its x is pulled back onto the lattice at every level.
  // Contact between balls is resolved on top of that, as a jostle -- two
  // overlapping balls are pushed apart and trade a little speed, and the
  // lattice straightens them out again on the next level. The shower reads
  // like a crowd of real balls, while the distribution stays exactly the
  // binomial the exhibit is about. Letting the collisions decide where a
  // ball goes instead would quietly bend the curve out of shape, which is
  // the one thing this board must not do.
  //
  // Pairs are found with a uniform grid of one ball diameter per cell, so
  // the work grows with the number of balls rather than with its square:
  // several thousand balls in flight still fit comfortably in a frame.
  let ballCollisions = false;   // off by default: a clean, readable fall
  // Gentler and interleaved beats strong and lumped: resolveCollisions()
  // now runs once per substep (twice a frame) rather than once after both,
  // so positions are re-integrated between correction passes instead of
  // piling the whole frame's worth of drift onto a single, larger fix.
  // COLL_ITERS dropped from 2 to 1 to match -- the total correction budget
  // per frame (passes x iters) is unchanged, only its rhythm is smoother.
  // COLL_STIFF and COLL_BOUNCE both came down too, trading a touch of
  // "instant" separation for calmer, less springy-looking contact.
  // Separation is now nearly complete in a single pass (0.9 of the overlap)
  // and gives nothing back as bounce. The earlier soft-and-springy setting
  // was an attempt to cure jumpiness by damping the symptom; the cause was
  // the hard height reset above, and with that fixed, resolving contact
  // promptly is what actually looks calm. A bounce term only injects energy
  // into a crowd that has nowhere to go, so it is off.
  const COLL_STIFF = 0.9;      // share of the overlap taken out per iteration
  const COLL_BOUNCE = 0;       // share of the closing speed given back
  const COLL_ITERS = 1;
  const COLL_DAMP = 0.985;     // per-substep bleed-off of sideways jitter
  const VX_MAX = 0.5, VY_MIN = -0.4;

  // The stage is taller than it is wide and radii are a fraction of its
  // width, so a ball is a circle in pixels but an ellipse in unit space.
  // Contact is therefore measured in "width units": y is multiplied by the
  // aspect ratio, which makes the metric isotropic again.
  let ASPECT = 4 / 3;

  let cellOf = null, cellCursor = null, cellStart = null, cellItems = null;
  const NB_DX = [1, -1, 0, 1], NB_DY = [0, 1, 1, 1];

  function ensureGrid(cells, n) {
    if (!cellStart || cellStart.length < cells + 1) {
      cellStart = new Int32Array(cells + 1);
      cellCursor = new Int32Array(cells + 1);
    }
    if (!cellOf || cellOf.length < n) {
      cellOf = new Int32Array(n * 2);
      cellItems = new Int32Array(n * 2);
    }
  }

  function contact(i, j) {
    const a = balls[i], b = balls[j];
    const dx = b.x - a.x;
    const dy = (b.y - a.y) * ASPECT;
    const d2 = dx * dx + dy * dy;
    const D = BALL_R * 2;
    if (d2 >= D * D) return;
    // Exactly coincident: nudge them apart *vertically*, along the flow.
    // A sideways nudge would be undone by the lattice at the next level,
    // leaving the pair stuck together; a vertical one survives it.
    if (d2 < 1e-12) { a.y -= 0.0006; b.y += 0.0006; return; }

    const d = Math.sqrt(d2);
    const nx = dx / d, ny = dy / d;
    const push = (D - d) * 0.5 * COLL_STIFF;
    a.x -= nx * push; a.y -= ny * push / ASPECT;
    b.x += nx * push; b.y += ny * push / ASPECT;

    // Closing speed along the contact normal, in the same width units the
    // positions are compared in. Only balls actually moving together get an
    // impulse, so a resting overlap does not pump energy into the pile.
    const rvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ASPECT * ny;
    if (rvn >= 0) return;
    const imp = -rvn * (1 + COLL_BOUNCE) * 0.5;
    a.vx -= imp * nx; a.vy -= imp * ny / ASPECT;
    b.vx += imp * nx; b.vy += imp * ny / ASPECT;
  }

  function resolveCollisions() {
    const n = balls.length;
    if (!ballCollisions || n < 2) return;

    const D = BALL_R * 2;
    const inv = 1 / D;
    let i, b;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (i = 0; i < n; i++) {
      b = balls[i];
      const py = b.y * ASPECT;
      if (b.x < minX) minX = b.x;
      if (b.x > maxX) maxX = b.x;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }

    let cols = Math.floor((maxX - minX) * inv) + 1;
    let rows = Math.floor((maxY - minY) * inv) + 1;
    if (cols < 1) cols = 1;
    if (rows < 1) rows = 1;
    const cells = cols * rows;
    if (cells > 262144) return;   // absurd spread: skip a frame rather than stall

    ensureGrid(cells, n);

    // counting sort of the balls into their cells
    for (i = 0; i <= cells; i++) cellStart[i] = 0;
    for (i = 0; i < n; i++) {
      b = balls[i];
      let cx = Math.floor((b.x - minX) * inv);
      let cy = Math.floor((b.y * ASPECT - minY) * inv);
      if (cx < 0) cx = 0; else if (cx >= cols) cx = cols - 1;
      if (cy < 0) cy = 0; else if (cy >= rows) cy = rows - 1;
      const c = cy * cols + cx;
      cellOf[i] = c;
      cellStart[c + 1]++;
    }
    for (i = 0; i < cells; i++) cellStart[i + 1] += cellStart[i];
    for (i = 0; i < cells; i++) cellCursor[i] = cellStart[i];
    for (i = 0; i < n; i++) cellItems[cellCursor[cellOf[i]]++] = i;

    // Each cell is tested against itself and the four cells that follow it
    // in scan order, which covers every neighbouring pair exactly once.
    for (let it = 0; it < COLL_ITERS; it++) {
      for (let cy2 = 0; cy2 < rows; cy2++) {
        for (let cx2 = 0; cx2 < cols; cx2++) {
          const base = cy2 * cols + cx2;
          const s0 = cellStart[base], e0 = cellStart[base + 1];
          if (s0 === e0) continue;
          for (let a = s0; a < e0; a++) {
            const ia = cellItems[a];
            for (let m = a + 1; m < e0; m++) contact(ia, cellItems[m]);
            for (let k = 0; k < 4; k++) {
              const gx = cx2 + NB_DX[k], gy = cy2 + NB_DY[k];
              if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
              const nb = gy * cols + gx;
              for (let t = cellStart[nb]; t < cellStart[nb + 1]; t++) contact(ia, cellItems[t]);
            }
          }
        }
      }
    }

    // A shove must never throw a ball off the board or send it flying, and
    // a light sideways damping bleeds off the small jitter that repeated
    // contact in a crowd builds up, instead of letting it accumulate.
    for (i = 0; i < n; i++) {
      b = balls[i];
      if (b.x < BALL_R) b.x = BALL_R; else if (b.x > 1 - BALL_R) b.x = 1 - BALL_R;
      b.vx *= COLL_DAMP;
      if (b.vx > VX_MAX) b.vx = VX_MAX; else if (b.vx < -VX_MAX) b.vx = -VX_MAX;
      if (b.vy < VY_MIN) b.vy = VY_MIN;
    }
  }

  // ============ CANVAS / LAYOUT ============
  const stage = document.getElementById('stage');
  const boardCanvas = document.getElementById('board-canvas');
  const ballCanvas = document.getElementById('ball-canvas');
  const boardCtx = boardCanvas.getContext('2d');
  const ballCtx = ballCanvas.getContext('2d');

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;

  function toPx(x, y) { return { x: x * W, y: y * H }; }

  // Radii are expressed as a fraction of the board width so that pins and
  // balls keep the same proportion to the pin spacing at any screen size.
  function radiusPx(r) { return r * W; }

  function layout() {
    const rect = stage.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    [boardCanvas, ballCanvas].forEach((c) => {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    });
    boardCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ballCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (W > 0 && H > 0) ASPECT = H / W;
  }

  // ============ DRAWING ============
  const GC = window.THEME.galton;
  const INK = GC.ink;

  // The grip under the funnel mouth, plus the rail it slides on. Drawn
  // rather than placed as a DOM control, so it lives in the same picture
  // as the funnel and survives pinch-zooming the board.
  // Drawn on the ball canvas rather than the board one, so the falling
  // stream passes *behind* the grip: a chute handle in front of the balls
  // reads as solid, a white box the balls cross reads as a glitch.
  function drawDropHandle() {
    const ctx = ballCtx;
    const mouth = dropX();
    const railY = (FUNNEL_Y + 0.030) * H;
    const x0 = halfX(0, -DROP_MAX) * W;
    const x1 = halfX(0, DROP_MAX) * W;

    ctx.strokeStyle = INK;
    ctx.globalAlpha = 0.30;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, railY);
    ctx.lineTo(x1, railY);
    ctx.stroke();
    // A notch per position it can snap to, so the steps are visible.
    for (let h = -DROP_MAX; h <= DROP_MAX; h += DROP_STEP) {
      const nx = halfX(0, h) * W;
      ctx.beginPath();
      ctx.moveTo(nx, railY - 3);
      ctx.lineTo(nx, railY + 3);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const cx = mouth * W;
    const hw = Math.max(16, 0.055 * W), hh = Math.max(11, 0.018 * H);
    ctx.fillStyle = GC.handle;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(cx - hw, railY - hh, hw * 2, hh * 2);
    ctx.fill();
    ctx.stroke();

    // Two arrowheads: the one and only thing this grip does is slide.
    ctx.fillStyle = INK;
    [-1, 1].forEach((dir) => {
      const tipX = cx + dir * (hw - 5);
      ctx.beginPath();
      ctx.moveTo(tipX, railY);
      ctx.lineTo(tipX - dir * 6, railY - 5);
      ctx.lineTo(tipX - dir * 6, railY + 5);
      ctx.closePath();
      ctx.fill();
    });
  }

  function drawBoard() {
    boardCtx.clearRect(0, 0, W, H);

    // --- funnel ---
    // The funnel *is* the Einwurf control: it leans to wherever the balls
    // enter and can be dragged along the top of the board. A separate
    // stepper under the board moved a number; this moves the thing the
    // balls actually come out of, which is what a visitor standing in
    // front of the exhibit can see happening.
    const mouth = dropX();
    boardCtx.fillStyle = INK;
    boardCtx.beginPath();
    boardCtx.moveTo(0.10 * W, 0);
    boardCtx.lineTo(0.90 * W, 0);
    boardCtx.lineTo((mouth + 0.065) * W, FUNNEL_Y * H);
    boardCtx.lineTo((mouth - 0.065) * W, FUNNEL_Y * H);
    boardCtx.closePath();
    boardCtx.fill();

    // --- the reachable wedge ---
    // A ball enters at the apex and moves at most one column per row, so
    // this triangle is exactly the region it can ever occupy. Tinting it
    // makes the tappable area obvious without a word of explanation.
    const apex = toPx(0.5, TOP_Y - ROW_DY * 0.7);
    const lastY = slotY(ROWS - 1) + ROW_DY * 0.5;
    const lastHalf = ((ROWS - 1) / 2) * COL_DX + COL_DX * 0.5;

    boardCtx.fillStyle = GC.wedge;
    boardCtx.beginPath();
    boardCtx.moveTo(apex.x, apex.y);
    boardCtx.lineTo((0.5 - lastHalf) * W, lastY * H);
    boardCtx.lineTo((0.5 + lastHalf) * W, lastY * H);
    boardCtx.closePath();
    boardCtx.fill();

    boardCtx.strokeStyle = GC.wedgeEdge;
    boardCtx.lineWidth = 1.5;
    boardCtx.beginPath();
    boardCtx.moveTo(apex.x, apex.y);
    boardCtx.lineTo((0.5 - lastHalf) * W, lastY * H);
    boardCtx.moveTo(apex.x, apex.y);
    boardCtx.lineTo((0.5 + lastHalf) * W, lastY * H);
    boardCtx.stroke();

    // --- nails ---
    // Every nail looks the same, whether it came with the board or a
    // visitor put it there: they behave identically, so they should read
    // identically. A slot without a nail is simply blank -- a hole, drawn
    // as nothing, because that is exactly what the ball meets there.
    const pr = radiusPx(PIN_R);
    boardCtx.fillStyle = INK;
    for (let q = 0; q < LEVELS; q++) {
      for (let j = 0; j < HSPAN; j++) {
        if (!pins[q][j]) continue;
        const p = pinPos[q][j];
        boardCtx.beginPath();
        boardCtx.arc(p.x * W, p.y * H, pr, 0, Math.PI * 2);
        boardCtx.fill();
      }
    }

    // --- ghost markers for the empty in-between (diagonal) slots ---
    // Default, on-row slots are easy to spot even empty: they're simply a
    // missing dot in the otherwise-familiar triangle. The in-between slots
    // have no such pattern to lean on, so an empty but usable one gets a
    // faint placeholder -- solid for the ones every visitor can tap, and
    // (only while dev mode is open) a dashed, redder one further out for
    // the experimental positions no ordinary ball would ever reach.
    boardCtx.lineWidth = 1;
    for (let gq = 1; gq < LEVELS; gq += 2) {
      const gr = levelReach(gq);
      for (let gj = 0; gj < HSPAN; gj++) {
        if (pins[gq][gj]) continue;
        if (!slotUsable(gq, gj)) continue;
        const gh = gj - HOFF;
        const extended = Math.abs(gh) > gr + 1;
        if (extended && !devOn) continue;
        const gp = pinPos[gq][gj];
        boardCtx.strokeStyle = extended ? GC.slotActive : GC.slot;
        boardCtx.setLineDash(extended ? [2, 2] : []);
        boardCtx.beginPath();
        boardCtx.arc(gp.x * W, gp.y * H, pr * 0.6, 0, Math.PI * 2);
        boardCtx.stroke();
      }
    }
    boardCtx.setLineDash([]);

    // --- bin walls ---
    boardCtx.strokeStyle = INK;
    boardCtx.lineWidth = 2;
    boardCtx.beginPath();
    for (let e = 0; e <= BINS; e++) {
      const x = EDGES[e] * W;
      boardCtx.moveTo(x, BIN_TOP * H);
      boardCtx.lineTo(x, H);
    }
    boardCtx.stroke();

    // --- extreme-threshold markers ---
    // "Extreme" is defined as the outer two bins on each side (see
    // statsFromBins); these dashed lines mark exactly where that begins,
    // so the readout's percentage has something to point at on the board.
    boardCtx.strokeStyle = GC.extreme;
    boardCtx.lineWidth = 2;
    boardCtx.setLineDash([4, 4]);
    [2, BINS - 2].forEach((edgeIdx) => {
      const ex = EDGES[edgeIdx] * W;
      boardCtx.beginPath();
      boardCtx.moveTo(ex, BIN_TOP * H);
      boardCtx.lineTo(ex, H);
      boardCtx.stroke();
    });
    boardCtx.setLineDash([]);

    // --- floor ---
    boardCtx.beginPath();
    boardCtx.moveTo(0, H - 1);
    boardCtx.lineTo(W, H - 1);
    boardCtx.stroke();
  }

  function drawBalls() {
    ballCtx.clearRect(0, 0, W, H);
    const br = radiusPx(BALL_R);

    // Settled balls are drawn as a histogram column per bin rather than as
    // a literal pile: the tallest bin always fills the bin area, so the
    // shape of the distribution reads the same for 20 or for 1200 balls.
    // (Dev mode's absolute-height toggle changes what "fills the bin area"
    // means -- see currentColMax -- but the drawing here does not need to
    // know which; it just asks for the current ceiling.)
    const maxN = currentColMax();

    for (let bi = 0; bi < BINS; bi++) {
      const n = bins[bi];
      if (n === 0) continue;
      const frac = Math.min(1, n / maxN);
      const colH = COL_AVAIL * frac;
      const x0 = EDGES[bi] * W + 2;
      const x1 = EDGES[bi + 1] * W - 2;
      const yTop = (1 - colH) * H;

      ballCtx.fillStyle = GC.binFill;
      ballCtx.strokeStyle = INK;
      ballCtx.lineWidth = 1.5;
      ballCtx.beginPath();
      ballCtx.rect(x0, yTop, x1 - x0, H - yTop);
      ballCtx.fill();
      ballCtx.stroke();

      // A few ball outlines on top keep it legible as "these are balls".
      const per = Math.max(1, Math.floor((x1 - x0) / (br * 2)));
      const capRows = Math.min(3, Math.ceil(n / per));
      ballCtx.fillStyle = GC.binBalls;
      for (let rr = 0; rr < capRows; rr++) {
        for (let cc = 0; cc < per; cc++) {
          const cxp = x0 + br + cc * ((x1 - x0 - br * 2) / Math.max(1, per - 1) || 0);
          const cyp = yTop + br + rr * br * 2;
          if (cyp + br > H) continue;
          ballCtx.beginPath();
          ballCtx.arc(cxp, cyp, br * 0.82, 0, Math.PI * 2);
          ballCtx.fill();
        }
      }
    }

    // balls in flight
    ballCtx.fillStyle = GC.ball;
    ballCtx.strokeStyle = INK;
    ballCtx.lineWidth = 1.5;
    for (let j = 0; j < balls.length; j++) {
      const b = balls[j];
      ballCtx.beginPath();
      ballCtx.arc(b.x * W, b.y * H, br, 0, Math.PI * 2);
      ballCtx.fill();
      ballCtx.stroke();
    }

    drawCurve();
    drawDropHandle();
  }

  // Draws a smoothed outline over a set of bin counts. maxOverride is the
  // ceiling to measure them against -- every caller now passes
  // currentColMax(), so the live curve traces the tops of its own bars and
  // a saved comparison line is drawn to the same scale as what is
  // currently on the board. Without it a curve is normalised to its own
  // peak, which is only ever right for a curve with nothing to compare to.
  function strokeCurve(counts, color, width, dash, maxOverride) {
    let n = 0, i;
    for (i = 0; i < BINS; i++) n += counts[i];
    if (n < 12) return;
    let maxN;
    if (maxOverride) {
      maxN = maxOverride;
    } else {
      maxN = 1;
      for (i = 0; i < BINS; i++) maxN = Math.max(maxN, counts[i]);
    }

    const pts = [];
    for (let b = 0; b < BINS; b++) {
      const cx = (EDGES[b] + EDGES[b + 1]) / 2;
      // Same scale the histogram columns use, so the curve traces their tops.
      const h = Math.min(1, counts[b] / maxN) * COL_AVAIL;
      pts.push({ x: cx * W, y: (1 - h) * H });
    }

    ballCtx.strokeStyle = color;
    ballCtx.lineWidth = width;
    ballCtx.lineJoin = 'round';
    ballCtx.setLineDash(dash || []);
    ballCtx.beginPath();
    ballCtx.moveTo(pts[0].x, pts[0].y);
    for (let k = 0; k < pts.length - 1; k++) {
      const mx = (pts[k].x + pts[k + 1].x) / 2;
      const my = (pts[k].y + pts[k + 1].y) / 2;
      ballCtx.quadraticCurveTo(pts[k].x, pts[k].y, mx, my);
    }
    ballCtx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ballCtx.stroke();
    if (dash && dash.length) ballCtx.setLineDash([]);
  }

  // The emerging "climate" (solid), plus up to three saved snapshots of
  // earlier runs (dashed, one colour per slot) kept around so several
  // experiments can be held up against each other on the same board.
  const COMPARE_COLORS = GC.compare;

  function drawCurve() {
    // Every curve is drawn against the *same* ceiling as the columns.
    // A saved comparison line used to be normalised to its own peak, so it
    // ignored the stepper completely: a 365-ball run frozen as a reference
    // was drawn as tall as a 5000-ball one, and neither matched the
    // columns underneath. A comparison line that cannot be compared with
    // what is on the board is worse than none.
    const ceiling = currentColMax();
    strokeCurve(bins, GC.curve, 3, null, ceiling);
    for (let s = 0; s < savedCurves.length; s++) {
      if (savedCurves[s]) strokeCurve(savedCurves[s], COMPARE_COLORS[s], 2.5, [7, 6], ceiling);
    }
    if (devOn && devTheory) {
      // The theory is a probability distribution; against a ceiling
      // measured in balls it only means something once it is multiplied by
      // how many balls this run has (or will have).
      const n = Math.max(1, settled + toRelease + balls.length);
      const theory = computeTheory().map((p) => (p / 100000) * n);
      strokeCurve(theory, GC.theory, 2, [1, 5], ceiling);
    }
  }

  // ============ STATISTICS ============
  // Mean, spread and the share of extremes, read straight off the bin
  // counts. A bin's index is the value every ball in it landed on, so this
  // is the exact same figure a list of samples would give.
  function statsFromBins() {
    let i, n = 0, sum = 0;
    for (i = 0; i < BINS; i++) { n += bins[i]; sum += i * bins[i]; }
    if (n === 0) return null;
    const mean = sum / n; let varr = 0;
    for (i = 0; i < BINS; i++) { const d = i - mean; varr += bins[i] * d * d; }
    // "Extreme" = the outer two bins on each side.
    const ext = bins[0] + bins[1] + bins[BINS - 2] + bins[BINS - 1];
    return { n: n, mean: mean, sd: Math.sqrt(varr / n), ext: ext };
  }

  function updateReadout() {
    updateAxisNote();     // the ceiling moves while balls land
    // Show what is still on its way, so topping the board up mid-run reads
    // as "more coming" rather than looking like nothing happened.
    const pending = toRelease + balls.length;
    roFallen.textContent = pending > 0
      ? t('readout.pending', settled, pending)
      : String(settled);
    checkTasks();

    const st = statsFromBins();
    if (!st) {
      roMean.textContent = t('readout.none');
      roSd.textContent = t('readout.none');
      roExtreme.textContent = '0 %';
      return;
    }

    // Report in "bins away from centre" so the numbers read like a
    // temperature anomaly rather than an internal index.
    const anomaly = st.mean - (BINS - 1) / 2;
    roMean.textContent = (anomaly >= 0 ? '+' : '−') +
      Math.abs(anomaly).toFixed(2).replace('.', ',');
    roSd.textContent = st.sd.toFixed(2).replace('.', ',');

    const pct = (st.ext / st.n) * 100;
    roExtreme.textContent = pct.toFixed(pct < 10 ? 1 : 0).replace('.', ',') + ' %';
  }

  // ============ DOM ============
  const roFallen = document.getElementById('ro-fallen');
  const roMean = document.getElementById('ro-mean');
  const roSd = document.getElementById('ro-sd');
  const roExtreme = document.getElementById('ro-extreme');
  const hintBadge = SCAPE.badge(document.getElementById('stage-frame'));
  const primaryBtn = document.getElementById('sim-primary');

  const primaryIcon = document.getElementById('sim-primary-icon');
  const singleBtn = document.getElementById('sim-single');
  const resetBtn = document.getElementById('sim-reset');
  const countLabel = document.getElementById('ball-count-label');
  const countDownBtn = document.getElementById('count-down');
  const countUpBtn = document.getElementById('count-up');
  const toolWipeBtn = document.getElementById('tool-wipe');
  const devPanel = document.getElementById('dev-panel');
  const devStats = document.getElementById('dev-stats');
  const devSpeedBtn = document.getElementById('dev-speed');
  const devCollideBtn = document.getElementById('dev-collide');
  const scenarioRow = document.getElementById('scenario-row');
  const scenarioToggleBtn = document.getElementById('scenario-toggle');
  const scenarioToggleLabel = document.getElementById('scenario-toggle-label');
  const scenarioPanel = document.getElementById('scenario-panel');
  const compareRow = document.getElementById('compare-row');
  const stageCard = document.getElementById('stage-frame');
  const binTooltip = document.getElementById('bin-tooltip');
  const hint = document.getElementById('hint');

  // ============ TASKS ============
  // Three small experiments; solving all of them unlocks the Merke box.
  const tasks = SCAPE.tasks(document.getElementById('gb-tasks'));
  let shiftMark = 0;   // settled count when the drop point last moved
  const TASK_BALLS = 200;
  function checkTasks() {
    if (settled >= 365) tasks.done('mountain');
    if (dropOffset !== 0 && settled - shiftMark >= TASK_BALLS) tasks.done('shift');
    if (scenarioName === 'extrem' && settled >= TASK_BALLS) tasks.done('extreme');
  }

  const ICON_PLAY = '<path d="M6 4l14 8-14 8V4z" fill="currentColor" stroke="none"/>';
  const ICON_PAUSE = '<path d="M8 4h3v16H8zM13 4h3v16h-3z" fill="currentColor" stroke="none"/>';

  // ============ STATE MACHINE ============
  const IDLE = 'idle', RUNNING = 'running', PAUSED = 'paused', DONE = 'done';
  let mode = IDLE;
  let interacted = false;

  // The button carries no caption any more -- a play triangle and a pause
  // bar say it themselves -- so the mode lives in the icon, and the words
  // move to the accessible name, where they are still needed. The ball
  // count goes in there too, since it is what pressing the button will do.
  function setMode(m) {
    mode = m;
    const paused = m === PAUSED;
    const running = m === RUNNING;
    primaryIcon.innerHTML = running ? ICON_PAUSE : ICON_PLAY;
    primaryBtn.setAttribute('aria-label',
      running ? t('primary.pauseSub')
        : paused ? t('primary.resumeSub')
          : m === DONE ? t('primary.moreSub', ballCount)
            : t('primary.startSub', ballCount));
    primaryBtn.dataset.mode = m;
  }

  // ============ PIN EDITING ============
  // getBoundingClientRect() already reports the stage's on-screen size and
  // position *after* whatever CSS transform the zoom/pan below applies to
  // it, so this fraction-of-the-box math keeps working unchanged at any
  // zoom level or pan offset -- nothing here needs to know zoom exists.
  function localPoint(ev) {
    const rect = stage.getBoundingClientRect();
    return { x: (ev.clientX - rect.left) / rect.width, y: (ev.clientY - rect.top) / rect.height };
  }

  // Nearest lattice slot within a generous touch radius — fingers are
  // blunt, so the hit area is much larger than the pin itself.
  function hitSlot(pt) {
    // Considers default and in-between slots alike, so a tap lands on
    // whichever is nearest -- that is what makes the in-between spots feel
    // like part of the same board rather than a separate mode.
    let best = null, bestD = Infinity;
    for (let q = 0; q < LEVELS; q++) {
      for (let j = 0; j < HSPAN; j++) {
        if (!slotUsable(q, j)) continue;
        const p = pinPos[q][j];
        const dx = (p.x - pt.x) * W, dy = (p.y - pt.y) * H;
        const d = Math.hypot(dx, dy);
        if (d < bestD) { bestD = d; best = { r: q, j: j, h: j - HOFF }; }
      }
    }
    const touchR = Math.max(20, radiusPx(COL_DX) * 0.5);
    return bestD <= touchR ? best : null;
  }

  // A tap toggles whatever is there: an empty usable slot gets a nail, an
  // existing nail is removed. One gesture instead of a separate add/remove
  // mode to switch between first.
  function onStageTap(pt) {
    const slot = hitSlot(pt);
    if (!slot) return;

    pins[slot.r][slot.j] = !pins[slot.r][slot.j];

    // The heap is deliberately kept: editing the board while balls keep
    // arriving is how a visitor sees the distribution bend towards the new
    // layout. Reset clears it when they want a clean comparison.

    dismissHint();
    markCustomScenario();
    drawBoard();
    updateHint();
  }

  function updateHint() {
    hint.textContent = t('hint', countPins());
  }

  // ============ BIN TOOLTIP ============
  // Hovering (mouse) or touching a histogram column shows exactly how many
  // balls landed there -- the one number the bars' relative heights alone
  // cannot give away -- plus the same count for every active comparison
  // line, colour-matched to its tile, so a hover compares them directly
  // instead of just eyeballing curve heights against each other.
  let tooltipHideT = null;
  let lastHoverPt = null;

  function updateBinTooltip(pt) {
    lastHoverPt = pt;
    if (!pt || pt.y < BIN_TOP || pt.x < 0 || pt.x > 1) { hideBinTooltip(); return; }
    const bi = binIndex(pt.x);
    const n = bins[bi];

    const lines = [];
    if (n) lines.push('<b>' + t('tooltip.balls', n) + '</b>');
    for (let s = 0; s < savedCurves.length; s++) {
      if (!savedCurves[s]) continue;
      const v = savedCurves[s][bi];
      if (!v) continue;
      lines.push('<span class="tt-dot" style="background:' + COMPARE_COLORS[s] + '"></span>' + v);
    }
    if (!lines.length) { hideBinTooltip(); return; }

    if (tooltipHideT) { clearTimeout(tooltipHideT); tooltipHideT = null; }
    const cx = (EDGES[bi] + EDGES[bi + 1]) / 2;
    binTooltip.innerHTML = lines.join('<br>');
    binTooltip.style.left = (cx * 100) + '%';
    binTooltip.style.top = (heapTop(bi) * 100) + '%';
    binTooltip.hidden = false;
  }

  function hideBinTooltip() {
    lastHoverPt = null;
    binTooltip.hidden = true;
  }

  function scheduleHideTooltip() {
    if (tooltipHideT) clearTimeout(tooltipHideT);
    tooltipHideT = setTimeout(hideBinTooltip, 1400);
  }

  // ============ ZOOM / PAN ============
  // A visual aid for placing a nail precisely: pinch to zoom in, drag to
  // pan. No on-screen +/- buttons -- two-finger zoom is a gesture people
  // already know, and there is no touchscreen to pinch on desktop anyway,
  // so a button row would only have been chrome nobody used there.
  // Implemented as a CSS transform on .stage itself -- getBoundingClientRect()
  // already reports the transformed size (see localPoint above), so every
  // hit test below keeps working with no inverse-transform math of its
  // own, and the canvases resize to the zoomed-in resolution (via layout())
  // so the result stays crisp rather than a stretched blur.
  const ZOOM_MIN = 1, ZOOM_MAX = 3.5;
  let zoom = 1, panX = 0, panY = 0;

  function clampPan() {
    const outer = stageCard.getBoundingClientRect();
    const maxPanX = Math.max(0, (zoom - 1) * outer.width / 2);
    const maxPanY = Math.max(0, (zoom - 1) * outer.height / 2);
    if (panX > maxPanX) panX = maxPanX; else if (panX < -maxPanX) panX = -maxPanX;
    if (panY > maxPanY) panY = maxPanY; else if (panY < -maxPanY) panY = -maxPanY;
  }

  function applyZoomTransform() {
    stage.style.transform = zoom === 1 ? '' :
      ('translate(' + panX.toFixed(1) + 'px,' + panY.toFixed(1) + 'px) scale(' + zoom.toFixed(3) + ')');
  }

  // The heavier step: resizes the canvas backing buffers to match the new
  // on-screen (zoomed) size and redraws. Skipped on every pointermove of a
  // pinch or drag -- applyZoomTransform() alone keeps that smooth -- and
  // only run once the gesture settles, so resizing a canvas mid-gesture
  // never fights the frame that is drawing to it. Pinching back down close
  // to the original size snaps the rest of the way to it, since there is
  // no reset button to fall back on any more.
  function finishZoomChange() {
    if (zoom <= 1.02) { zoom = 1; panX = 0; panY = 0; }
    clampPan();
    applyZoomTransform();
    layout();
    drawBoard();
    drawBalls();
  }

  // Ctrl + mouse wheel (and trackpad pinch, which browsers report the same
  // way) zooms on desktop, keeping the point under the cursor in place.
  let wheelTimer = 0;
  stage.addEventListener('wheel', (ev) => {
    if (!ev.ctrlKey) return;
    ev.preventDefault();
    const outer = stageCard.getBoundingClientRect();
    const cx = ev.clientX - (outer.left + outer.width / 2);
    const cy = ev.clientY - (outer.top + outer.height / 2);
    const z0 = zoom;
    zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom * Math.exp(-ev.deltaY * 0.002)));
    const k = zoom / z0;
    panX = cx - (cx - panX) * k;
    panY = cy - (cy - panY) * k;
    clampPan();
    applyZoomTransform();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(finishZoomChange, 160);
  }, { passive: false });

  // ============ POINTER HANDLING ============
  // One gesture model covers three different things depending on where it
  // starts and how far it moves: a still tap on the triangle toggles a
  // nail, a still tap or a drag over the bins shows their tooltip, and
  // once zoomed in, a drag anywhere pans instead of editing. A movement
  // threshold is what tells a tap from the start of a drag; pinch (two
  // pointers) always means zoom, in preference to either.
  const activePointers = {};
  let singleGesture = null;
  let pinchGesture = null;
  let dropGesture = false;
  const MOVE_THRESHOLD = 6;

  // The band across the top of the board that belongs to the funnel: the
  // funnel itself, its grip and a finger's worth of slack under it. Well
  // clear of the first nail row at TOP_Y.
  function inDropBand(pt) { return pt.y <= FUNNEL_Y + 0.055; }

  // Where along the rail the finger is, snapped to a whole column.
  function dropFromPoint(pt) {
    const raw = (pt.x - 0.5) / COL_DX;                  // in whole columns
    const snapped = Math.round(raw) * 2;                // in half-columns
    return Math.max(-DROP_MAX, Math.min(DROP_MAX, snapped));
  }

  function dragDropTo(pt) {
    const next = dropFromPoint(pt);
    if (next === dropOffset) return;
    dropOffset = next;
    shiftMark = settled;
    updateDropLabel();
    redrawDropPoint();
  }

  // The funnel is painted on the board canvas, its grip on the ball canvas
  // (so the stream passes behind it). Moving the drop point therefore has
  // to repaint *both*, or the black funnel slides out from under a grip
  // that stays put -- which is exactly what it did, except when a scenario
  // switch happened to repaint everything anyway.
  function redrawDropPoint() {
    drawBoard();
    drawBalls();
    updateHint();
  }

  function pointerCount() { return Object.keys(activePointers).length; }

  stage.addEventListener('pointerdown', (ev) => {
    try { stage.setPointerCapture(ev.pointerId); } catch (e) {}
    activePointers[ev.pointerId] = { x: ev.clientX, y: ev.clientY };

    if (pointerCount() === 2) {
      singleGesture = null;
      dropGesture = false;
      const ids = Object.keys(activePointers);
      const p1 = activePointers[ids[0]], p2 = activePointers[ids[1]];
      pinchGesture = {
        dist0: Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1,
        zoom0: zoom, panX0: panX, panY0: panY,
        midX0: (p1.x + p2.x) / 2, midY0: (p1.y + p2.y) / 2
      };
      hideBinTooltip();
    } else if (pointerCount() === 1) {
      const pt = localPoint(ev);
      singleGesture = {
        id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, moved: false,
        panX0: panX, panY0: panY, ptUnit0: pt
      };
      // A touch on the funnel band grabs the Einwurf rather than panning
      // or placing a nail, and follows the finger from the first frame --
      // tapping somewhere on the rail moves it there too.
      dropGesture = inDropBand(pt);
      if (dropGesture) { dragDropTo(pt); hideBinTooltip(); return; }
      updateBinTooltip(pt);
    }
  });

  stage.addEventListener('pointermove', (ev) => {
    if (activePointers[ev.pointerId]) activePointers[ev.pointerId] = { x: ev.clientX, y: ev.clientY };

    if (pinchGesture && pointerCount() >= 2) {
      const ids = Object.keys(activePointers);
      const p1 = activePointers[ids[0]], p2 = activePointers[ids[1]];
      const d = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchGesture.zoom0 * (d / pinchGesture.dist0)));
      const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2;
      panX = pinchGesture.panX0 + (midX - pinchGesture.midX0);
      panY = pinchGesture.panY0 + (midY - pinchGesture.midY0);
      clampPan();
      applyZoomTransform();
      return;
    }

    if (dropGesture && singleGesture && singleGesture.id === ev.pointerId) {
      dragDropTo(localPoint(ev));
      return;
    }

    if (singleGesture && singleGesture.id === ev.pointerId) {
      const dx = ev.clientX - singleGesture.x0, dy = ev.clientY - singleGesture.y0;
      if (!singleGesture.moved && Math.hypot(dx, dy) > MOVE_THRESHOLD) singleGesture.moved = true;
      if (singleGesture.moved && zoom > 1.02) {
        panX = singleGesture.panX0 + dx;
        panY = singleGesture.panY0 + dy;
        clampPan();
        applyZoomTransform();
        hideBinTooltip();
        return;
      }
    }

    // Not panning or pinching: a plain hover (mouse) or a finger dragged
    // along the bins (touch) -- either way, keep the tooltip in step.
    updateBinTooltip(localPoint(ev));
  });

  stage.addEventListener('pointerup', (ev) => {
    delete activePointers[ev.pointerId];

    if (pinchGesture) {
      if (pointerCount() < 2) { pinchGesture = null; finishZoomChange(); }
      return;
    }

    if (singleGesture && singleGesture.id === ev.pointerId) {
      if (dropGesture) dropGesture = false;
      else if (!singleGesture.moved) onStageTap(singleGesture.ptUnit0);
      singleGesture = null;
    }
    scheduleHideTooltip();
  });

  stage.addEventListener('pointercancel', (ev) => {
    delete activePointers[ev.pointerId];
    if (singleGesture && singleGesture.id === ev.pointerId) { singleGesture = null; dropGesture = false; }
    if (pointerCount() < 2) pinchGesture = null;
  });

  stage.addEventListener('pointerleave', (ev) => {
    if (pointerCount() === 0) scheduleHideTooltip();
  });

  // ============ TOOL / SCENARIO CONTROLS ============
  // Clearing the board is a hand edit like any other, only faster, so it
  // keeps the heap: the whole point is to watch the pile bend towards the
  // new layout. Reset is there for a clean slate.
  toolWipeBtn.addEventListener('click', () => {
    pins = emptyPins();
    dismissHint();
    markCustomScenario();
    drawBoard();
    updateHint();
  });

  const scenarioBtns = Array.prototype.slice.call(scenarioRow.querySelectorAll('.scenario-btn'));
  const SCENARIO_LABELS = { normal: t('scenario.normal'), extrem: t('scenario.extrem') };
  let scenarioName = 'normal';

  function setScenarioPanelOpen(open) {
    scenarioPanel.hidden = !open;
    scenarioToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  // Extremklima is a climate, not just a nail pattern: a warmer world has
  // both a shifted mean and a wider spread, so switching to it moves the
  // drop point one column to the warm side as well, and switching back to
  // Normalklima returns it to the middle. The Einwurf stepper is not
  // locked by this -- it stays free to move from wherever the scenario put
  // it, so the two effects can still be told apart by hand.
  //
  // One column rather than two: at two the entry sits so far out that the
  // triangle only catches the ball a few rows down, and the spread the
  // scenario is there to show shrinks back (sigma 1.89 at the centre, 1.62
  // one column out, 1.32 at two).
  const EXTREME_DROP = 2;     // half-columns = one whole column

  function setScenario(name) {
    // A preset swaps the whole board, so the heap is cleared: the point of
    // the presets is to compare one finished distribution with another.
    // Hand-editing single pins deliberately keeps the heap instead.
    pins = scenarioPins(name);
    scenarioName = name;
    dropOffset = name === 'extrem' ? EXTREME_DROP : 0;
    shiftMark = settled;
    updateDropLabel();
    scenarioBtns.forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-scenario') === name);
    });
    scenarioToggleLabel.textContent = SCENARIO_LABELS[name];
    setScenarioPanelOpen(false);
    clearBalls();
    drawBoard();
    drawBalls();
    updateReadout();
    updateHint();
    setMode(IDLE);
  }

  function markCustomScenario() {
    scenarioBtns.forEach((b) => { b.classList.remove('active'); });
    scenarioToggleLabel.textContent = t('scenario.custom');
    scenarioName = 'custom';
  }

  scenarioBtns.forEach((b) => {
    b.addEventListener('click', () => {
      setScenario(b.getAttribute('data-scenario'));
      dismissHint();
    });
  });

  scenarioToggleBtn.addEventListener('click', () => {
    setScenarioPanelOpen(scenarioPanel.hidden);
  });

  // ============ BALL COUNT ============
  // How many balls the next Start queues up. A pair of small +/- buttons
  // rather than the full-width drag slider this used to be: the slider
  // sat exactly where a thumb scrolling the page swept past, and kept
  // getting bumped by accident on the way down to the explainer text.
  const BALL_COUNT_MIN = 5, BALL_COUNT_MAX = 365, BALL_COUNT_STEP = 5;
  let ballCount = 365;

  function updateCountLabel() {
    countLabel.textContent = ballCount;
    countDownBtn.disabled = ballCount <= BALL_COUNT_MIN;
    countUpBtn.disabled = ballCount >= BALL_COUNT_MAX;
    // The stepper now sits directly above the button it parameterises, and
    // the button says what pressing it will do -- "365 Kugeln fallen
    // lassen" rather than a number set somewhere further up the page.
    if (mode === IDLE || mode === DONE) setMode(mode);
  }

  function stepBallCount(dir) {
    ballCount = Math.max(BALL_COUNT_MIN, Math.min(BALL_COUNT_MAX, ballCount + dir * BALL_COUNT_STEP));
    updateCountLabel();
  }

  // Press-and-hold repeats the step, so reaching either end of the range
  // does not take seventy-odd individual taps.
  function holdToRepeat(btn, fn) {
    let t = null;
    function stop() { if (t) { clearInterval(t); clearTimeout(t); t = null; } }
    btn.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      fn();
      t = setTimeout(() => { t = setInterval(fn, 90); }, 420);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((t2) => {
      btn.addEventListener(t2, stop);
    });
  }

  holdToRepeat(countDownBtn, () => { stepBallCount(-1); });
  holdToRepeat(countUpBtn, () => { stepBallCount(1); });

  // ============ DROP POINT ============
  // Moves the mean without touching the spread, so it can be combined with
  // Extremklima to get both effects of the "Verschiebung des Mittels" /
  // "Zunahme der Streuung" pair at once.
  const dropLeftBtn = document.getElementById('drop-left');
  const dropRightBtn = document.getElementById('drop-right');
  const dropValue = document.getElementById('drop-value');

  function formatDrop() {
    if (dropOffset === 0) return t('drop.middle');
    // Half-columns are what the lattice runs on, but a visitor thinks in
    // whole columns, so the readout is in those.
    const cols = dropOffset / 2;
    return (cols > 0 ? '+' : '\u2212') + Math.abs(cols);
  }

  function updateDropLabel() {
    dropValue.textContent = formatDrop();
    dropLeftBtn.disabled = dropOffset <= -DROP_MAX;
    dropRightBtn.disabled = dropOffset >= DROP_MAX;
  }

  function stepDrop(dir) {
    let next = dropOffset + dir * DROP_STEP;
    if (next < -DROP_MAX) next = -DROP_MAX;
    if (next > DROP_MAX) next = DROP_MAX;
    if (next === dropOffset) return;
    dropOffset = next;
    shiftMark = settled;
    updateDropLabel();
    redrawDropPoint();
  }

  holdToRepeat(dropLeftBtn, () => { stepDrop(-1); });
  holdToRepeat(dropRightBtn, () => { stepDrop(1); });

  // ============ AXIS CAPTION ============
  // The caption has to say which of the four readings is active, because
  // that is the whole difference between "this column is the tallest one"
  // and "this column holds 100 balls".
  // ============ COLUMN CEILING ============
  // "How many balls make a full column", as a stepper right beside the
  // columns it scales -- the one number in the picture a visitor may want
  // to change while looking at it.
  const capUpBtn = document.getElementById('cap-up');
  const capDownBtn = document.getElementById('cap-down');
  const capValue = document.getElementById('cap-value');
  const capCtl = document.getElementById('cap-ctl');

  function updateCapLabel() {
    capValue.textContent = colCap;
    const i = CAP_STEPS.indexOf(colCap);
    capDownBtn.disabled = i <= 0;
    capUpBtn.disabled = i >= CAP_STEPS.length - 1;
    // The other three readings work out their own ceiling, so the stepper
    // would be a dead control there: it says so rather than lying.
    capCtl.classList.toggle('off', scaleMode !== 'fixed');
  }

  function stepCap(dir) {
    const i = CAP_STEPS.indexOf(colCap);
    const next = Math.max(0, Math.min(CAP_STEPS.length - 1, i + dir));
    if (next === i) return;
    colCap = CAP_STEPS[next];
    updateCapLabel();
    drawBoard();
    drawBalls();
    updateReadout();
  }

  holdToRepeat(capUpBtn, () => { stepCap(1); });
  holdToRepeat(capDownBtn, () => { stepCap(-1); });
  // The board under it listens for taps to set and clear nails; the
  // stepper is on top of that, so its own taps must stop there.
  ['pointerdown', 'pointerup', 'click'].forEach((ev) => {
    capCtl.addEventListener(ev, (e) => { e.stopPropagation(); });
  });

  // The caption that used to sit under the board is gone: the ceiling is
  // printed on the stepper itself, right next to the columns it scales,
  // and a sentence repeating it only pushed the board further up the page.
  function updateAxisNote() { updateCapLabel(); }

  // ============ COMPARISON LINES ============
  const compareChips = Array.prototype.slice.call(compareRow.querySelectorAll('.compare-chip'));

  function updateCompareChips() {
    compareChips.forEach((chip) => {
      const slot = parseInt(chip.getAttribute('data-slot'), 10);
      chip.classList.toggle('filled', !!savedCurves[slot]);
    });
  }

  compareChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const slot = parseInt(chip.getAttribute('data-slot'), 10);
      if (savedCurves[slot]) {
        savedCurves[slot] = null;
      } else {
        // A copy: the live bins keep filling after this, and must not
        // drag the saved snapshot along with them.
        savedCurves[slot] = bins.slice();
      }
      updateCompareChips();
      drawBalls();
    });
  });

  // ============ DEV MODE ============
  // Not part of the exhibit: a hidden panel for trying out scenarios and
  // tunables the exhibit itself does not offer. Opened with #dev in the
  // URL, the small "(dev)" link at the page foot, or Shift+D, and
  // remembered afterwards so a phone does not have to retype the URL.
  let devOn = false;
  let timeScale = 3;          // = SPEED_DEFAULT, declared with SPEEDS below
  let devTheory = false;
  // x3 is the shipped pace: a 365-ball run then takes about half a minute
  // instead of a minute and a half, which is roughly how long someone
  // stands in front of an exhibit before losing interest. The slow steps
  // are there for looking at the collision behaviour frame by frame.
  const SPEEDS = [0.25, 0.5, 1, 2, 3, 4, 8];
  const SPEED_DEFAULT = 3;

  // How crowded a drop is allowed to get. A batch of 5000 at the exhibit's
  // own pace arrives faster than the board can swallow, and the result is
  // an unreadable wall of balls rather than a shower -- so dev mode can
  // both slow the feed down and cap how many may be in the air at once.
  // PACES are milliseconds between balls; null keeps the automatic pacing
  // that scales with the batch size. CAPS are balls in flight; 0 = no cap.
  const PACES = [null, 30, 60, 120, 250];
  const CAPS = [0, 400, 150, 60, 25];
  let devPace = null;
  let devCap = 0;

  function setDevMode(on) {
    devOn = !!on;
    devPanel.hidden = !devOn;
    if (!devOn) {
      timeScale = SPEED_DEFAULT;
      devSpeedBtn.textContent = t('dev.speed', SPEED_DEFAULT);
    } else {
      updateDevStats();
    }
    // The extended, experimental nail slots are dev-only; leaving the panel
    // must put the board straight back to what every other visitor sees.
    drawBoard();
    drawBalls();
  }

  function updateDevStats() {
    devStats.textContent = t('dev.stats', balls.length, toRelease, settled, Math.round(fps));
  }

  function setupDevMode() {
    devSpeedBtn.textContent = t('dev.speed', timeScale);
    devCollideBtn.textContent = t('dev.collide', ballCollisions);
    document.getElementById('dev-theory').textContent = t('dev.theory', devTheory);
    document.getElementById('dev-scale').textContent = t('dev.scale', SCALE_LABELS[scaleMode]);
    document.getElementById('dev-pace').textContent = t('dev.pace', devPace);
    document.getElementById('dev-cap').textContent = t('dev.cap', devCap);
    document.getElementById('dev-close').addEventListener('click', () => {
      SCAPE.setDev(false);
    });

    document.getElementById('dev-add-1000').addEventListener('click', () => {
      devDrop(1000);
    });
    document.getElementById('dev-add-5000').addEventListener('click', () => {
      devDrop(5000);
    });
    document.getElementById('dev-clear-balls').addEventListener('click', () => {
      clearBalls();
      setMode(IDLE);
      drawBalls();
      updateReadout();
      updateDevStats();
    });

    const devTheoryBtn = document.getElementById('dev-theory');
    devTheoryBtn.addEventListener('click', () => {
      devTheory = !devTheory;
      devTheoryBtn.textContent = t('dev.theory', devTheory);
      devTheoryBtn.classList.toggle('on', devTheory);
      drawBalls();
    });

    document.getElementById('dev-export').addEventListener('click', exportCSV);

    const devScaleBtn = document.getElementById('dev-scale');
    devScaleBtn.addEventListener('click', () => {
      const i = SCALE_MODES.indexOf(scaleMode);
      scaleMode = SCALE_MODES[(i + 1) % SCALE_MODES.length];
      devScaleBtn.textContent = t('dev.scale', SCALE_LABELS[scaleMode]);
      devScaleBtn.classList.toggle('on', scaleMode !== 'peak');
      updateAxisNote();
      drawBalls();
    });

    const devPaceBtn = document.getElementById('dev-pace');
    devPaceBtn.addEventListener('click', () => {
      const i = PACES.indexOf(devPace);
      devPace = PACES[(i + 1) % PACES.length];
      devPaceBtn.textContent = t('dev.pace', devPace);
      devPaceBtn.classList.toggle('on', devPace !== null);
      // Re-pace whatever is already queued, so the change is felt at once
      // instead of only from the next Start.
      if (toRelease > 0) applyPace(toRelease);
    });

    const devCapBtn = document.getElementById('dev-cap');
    devCapBtn.addEventListener('click', () => {
      const i = CAPS.indexOf(devCap);
      devCap = CAPS[(i + 1) % CAPS.length];
      devCapBtn.textContent = t('dev.cap', devCap);
      devCapBtn.classList.toggle('on', devCap !== 0);
    });

    devSpeedBtn.addEventListener('click', () => {
      const i = SPEEDS.indexOf(timeScale);
      timeScale = SPEEDS[(i + 1) % SPEEDS.length];
      devSpeedBtn.textContent = t('dev.speed', timeScale);
    });

    devCollideBtn.addEventListener('click', () => {
      ballCollisions = !ballCollisions;
      devCollideBtn.textContent = t('dev.collide', ballCollisions);
      devCollideBtn.classList.toggle('on', ballCollisions);
    });

    // ?dev, Shift+D and the faint footer link are handled by the kit.
    window.addEventListener('scape:dev', (ev) => { setDevMode(ev.detail); });
    setDevMode(SCAPE.dev);
  }

  function devDrop(n) {
    dismissHint();
    queueBalls(n);
    setMode(RUNNING);
    updateDevStats();
  }

  // Bin counts and summary stats as a CSV download -- for a teacher who
  // wants to take a run's numbers into a spreadsheet rather than just
  // read them off the readout.
  function exportCSV() {
    const st = statsFromBins();
    const lines = ['bin,count'];
    for (let i = 0; i < BINS; i++) lines.push(i + ',' + bins[i]);
    lines.push('');
    lines.push('nails,' + countPins());
    if (st) {
      lines.push('n,' + st.n);
      lines.push('mean,' + st.mean.toFixed(4));
      lines.push('sd,' + st.sd.toFixed(4));
      lines.push('extreme_count,' + st.ext);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'galton-' + Date.now() + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => { URL.revokeObjectURL(url); }, 2000);
  }

  // ============ RUN CONTROL ============
  function clearBalls() {
    balls = [];
    bins = new Array(BINS).fill(0);
    settled = 0;
    toRelease = 0;
    releaseTimer = 0;
    shiftMark = 0;
  }

  function dismissHint() {
    if (interacted) return;
    interacted = true;
    hintBadge.hide();
  }

  // A batch falls as one shower, but with enough air between balls that
  // they read as separate events rather than a solid stream. Batches far
  // beyond what the stepper offers are a dev-mode stress test, so they are
  // allowed to feed faster than the exhibit's own pace -- unless dev mode
  // has set an explicit spacing, which then applies to every batch,
  // +5000 included, because that is precisely the one that needs it.
  function applyPace(n) {
    if (devPace !== null) { releaseEvery = devPace / 1000; return; }
    const floor = n > 1000 ? 0.008 : 0.030;
    releaseEvery = Math.max(floor, Math.min(0.12, 12 / Math.max(1, n)));
  }

  function queueBalls(n) {
    // Balls are always *added* to the board. Nothing is cleared, so a
    // visitor can keep topping up the same distribution -- and can edit
    // the pins in between, which is the whole point of the exhibit.
    toRelease += n;
    applyPace(n);
  }

  function startRun() {
    dismissHint();
    queueBalls(ballCount);
    setMode(RUNNING);
  }

  function dropSingle() {
    dismissHint();
    queueBalls(1);
    releaseTimer = releaseEvery;   // release it immediately
    setMode(RUNNING);
  }

  primaryBtn.addEventListener('click', () => {
    if (mode === RUNNING) { setMode(PAUSED); return; }
    if (mode === PAUSED && toRelease > 0) { setMode(RUNNING); return; }
    startRun();
  });

  singleBtn.addEventListener('click', dropSingle);

  // Reset only clears the heap of settled and in-flight balls -- the pins
  // and whatever scenario is active stay exactly as a visitor left them.
  // Comparison lines survive it too, deliberately: clearing the current
  // run to try again against a frozen reference is the whole point.
  resetBtn.addEventListener('click', () => {
    clearBalls();
    setMode(IDLE);
    drawBalls();
    updateReadout();
  });

  // ============ ANIMATION LOOP ============
  let lastT = 0;
  let fps = 0;
  let simCredit = 0;   // fractional ticks banked between frames, for slow motion

  function simTick(dt) {
    // Release queued balls at a steady rate. The timer is deliberately not
    // allowed to run on once the queue is empty: it used to keep counting
    // up through the ten-odd seconds the last balls of a batch need to
    // fall, so the next Start found all that credit waiting and spawned a
    // few hundred balls in a single frame. Those balls were born at the
    // same point with the same speed and stayed locked together for the
    // whole drop -- the horizontal front of balls that showed up on the
    // second and every following release, but never on the first.
    if (toRelease > 0) {
      releaseTimer += dt;
      let budget = MAX_SPAWN_PER_TICK;
      // The crowd cap holds the queue back rather than dropping any of it:
      // nothing is released while the board already has its fill, and the
      // rest follows as soon as balls land and make room.
      while (releaseTimer >= releaseEvery && toRelease > 0 && budget > 0 &&
             (devCap === 0 || balls.length < devCap)) {
        releaseTimer -= releaseEvery;
        budget--;
        spawnBall();
        toRelease--;
      }
      // A frame that ran long, or a tab that was in the background, must
      // not bank time either.
      if (releaseTimer > releaseEvery) releaseTimer = releaseEvery;
    } else {
      releaseTimer = 0;
    }

    // Contact is resolved after each substep, not once after both: the
    // finer rhythm gives positions less room to drift apart before being
    // corrected, which is what reads as calmer rather than jumpy.
    for (let s = 0; s < SUBSTEPS; s++) {
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        stepBall(b);
        if (b.settled) {
          bins[b.bin]++;
          settled++;
          balls.splice(i, 1);
        }
      }
      resolveCollisions();
    }
  }

  function frame(ts) {
    requestAnimationFrame(frame);
    if (!lastT) lastT = ts;
    const dt = Math.min((ts - lastT) / 1000, 0.05);
    lastT = ts;
    if (dt > 0) fps += ((1 / dt) - fps) * 0.1;

    if (mode !== RUNNING) return;

    // timeScale is 1 for visitors; dev mode can raise or lower it. Above 1
    // that means several full ticks per frame (each tick is exactly the
    // tick everyone else gets, just more of them land in the same
    // rendered frame); below 1 it means fewer frames get a tick at all --
    // a credit accumulates by timeScale every frame and a tick only fires
    // once it reaches a whole one, so 0.25x ticks once every four frames
    // rather than running a quarter of a tick, which would need a smaller
    // dt and so would not be the same physics slowed down, just different
    // physics. Either way every tick that does happen is identical.
    simCredit += timeScale;
    while (simCredit >= 1) { simTick(dt); simCredit -= 1; }

    drawBalls();
    updateReadout();
    if (devOn) updateDevStats();
    // A finger or cursor resting over a column while more balls land
    // would otherwise show a count that is already stale.
    if (!binTooltip.hidden && lastHoverPt) updateBinTooltip(lastHoverPt);

    if (toRelease === 0 && balls.length === 0) setMode(DONE);
  }

  function relayout() {
    // A resize, orientation or view change can shrink the outer frame the
    // zoomed view is allowed to pan within, so the clamp is re-checked too.
    clampPan();
    applyZoomTransform();
    layout();
    drawBoard();
    drawBalls();
  }

  // ============ INIT / RESIZE ============
  function init() {
    buildLattice();
    pins = defaultPins();
    setupDevMode();
    layout();
    setMode(IDLE);
    updateCountLabel();
    updateDropLabel();
    updateAxisNote();
    updateCompareChips();
    drawBoard();
    drawBalls();
    updateReadout();
    updateHint();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', relayout);
  window.addEventListener('orientationchange', () => {
    setTimeout(relayout, 200);
  });

  init();
})();
