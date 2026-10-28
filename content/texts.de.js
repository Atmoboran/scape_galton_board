// Every visible text of the app. Edit or translate this file to adapt the
// exhibit; index.html only holds data-t="path.to.key" placeholders that
// js/texts.js fills from here. Entries written as functions build a sentence
// around runtime values. Lines marked LOCAL refer to SCAPE° or its region.
window.TEXTS = {
  lang: 'de',
  pageTitle: 'Klima ist Statistik – Galtonbrett',
  description: 'Ein interaktives Galton-Brett: Setze und entferne Nägel, lass Kugeln fallen und beobachte, wie sich die Verteilung verschiebt und verbreitert – über Wetter, Klima und Klimawandel.',

  kit: {
    viewToDesktop: 'Desktop-Ansicht',
    viewToMobile: 'Handy-Ansicht',
    viewToDesktopAria: 'Zur Desktop-Ansicht wechseln',
    viewToMobileAria: 'Zur Handy-Ansicht wechseln',
    fullscreenEnter: 'Vollbild',
    fullscreenExit: 'Vollbild beenden',
    infoAria: 'Erklärung anzeigen',
    merkeLocked: 'Löse die Aufgaben – dann erscheint hier, was du herausgefunden hast.',
    devLink: '(dev)'
  },

  poster: {
    headline: 'Klima ist Statistik',
    lead: 'Wetter ist Chaos in Mustern – dem Klima. Das Galtonbrett zeigt diesen Zusammenhang.'
  },
  stageAria: 'Galton-Brett mit Nägeln und gesammelten Kugeln',
  badge: 'Tippe ins Brett, um Nägel zu setzen oder zu entfernen',

  compare: {
    label: 'Vergleich',
    infoAria: 'Vergleichslinien erklären',
    note: '<p>Tippe auf eine leere Kachel, um die aktuelle Verteilung dort als gestrichelte Linie einzufrieren. Tippe auf eine belegte Kachel, um sie wieder zu löschen.</p><p>So lassen sich bis zu drei Experimente übereinander vergleichen – auch über einen Reset oder Szenariowechsel hinweg. Beim Berühren einer Säule zeigt die Sprechblase auch die Werte aktiver Vergleichslinien.</p>',
    slotAria: n => 'Vergleichslinie ' + n
  },

  scale: {
    auto: 'Kugeln je Säule (mitwachsend)',
    peak: 'Anteil der höchsten Säule',
    share: 'Anteil aller Kugeln',
    fixed: 'Kugeln je Säule',
    ceilingShare: pct => pct + ' % aller Kugeln',
    ceilingFixed: n => n + ' Kugeln',
    ceilingPeak: 'die höchste Säule'
  },

  cap: {
    unit: 'Kugeln je Säule',
    full: 'Säule voll',
    more: 'Mehr Kugeln je Säule (herauszoomen)',
    less: 'Weniger Kugeln je Säule (hineinzoomen)'
  },

  controls: {
    infoAria: 'Knöpfe erklären',
    note: '<p><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4l14 8-14 8V4z" fill="currentColor" stroke="none"/></svg></span> lässt die eingestellte Zahl Kugeln fallen, dann <b>Pause</b>, danach <b>Mehr</b> – jeder Start legt auf den vorhandenen Berg drauf. <b>−/+</b> stellt die Zahl: ein Tipp eine Kugel, gedrückt halten spult in Fünfern.</p><p><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="3" fill="currentColor" stroke="none"/><path d="M12 12v7M9 16l3 3 3-3"/></svg></span> wirft genau eine Kugel – ein Wettertag.</p><p><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/></svg></span> leert nur den Berg. Nägel, Klima und Einwurf bleiben.</p><p>Am Brett: Trichter oben ziehen verschiebt den Einwurf, unten links die Kugeln je Säule, unten rechts frieren <b>1 2 3</b> die Kurve als Vergleich ein.</p>'
  },

  scenario: {
    group: 'Klima',
    selectAria: 'Klima wählen',
    resetBoardAria: 'Brett auf Normalklima zurücksetzen',
    wipeAria: 'Alle Nägel entfernen',
    restoreAria: 'Nägel wieder einsetzen',
    normal: 'Normalklima',
    warm: 'Wärmeres Klima',
    cold: 'Kälteres Klima',
    extrem: 'Extremeres Klima',
    mild: 'Weniger extremes Klima',
    custom: 'Angepasst',
    wipe: 'Alle entfernen',
    infoAria: 'Brett, Klima und Nägel erklären',
    note: '<p>Auf einen <b>leeren Kreis</b> tippen setzt einen Nagel, auf einen <b>Nagel</b> entfernt ihn. Aktuell: <b id="board-help-count">21</b>.</p><p>Jeder Nagel ist eine Entscheidung links oder rechts. Mehr Nägel auf dem Weg: breiterer Berg, mehr Extreme. Weniger Nägel: schmaler.</p><p><b>Normalklima</b>: kleines Dreieck. <b>Wärmer</b> / <b>Kälter</b>: dasselbe Dreieck mit Trichter eine Säule weiter rechts bzw. links – der Berg wandert, seine Form bleibt. <b>Extremer</b>: alle leeren Kreise aufgefüllt – der Berg wird breiter. <b>Weniger extrem</b>: ein noch kleineres Dreieck – schmaler.</p><p><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/><circle cx="9.4" cy="13.6" r="1.5" fill="currentColor" stroke="none"/><circle cx="14.6" cy="13.6" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="9.6" r="1.5" fill="currentColor" stroke="none"/></svg></span> zurück auf Normalklima. <span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4.5L20.5 19.5H3.5z"/><path d="M8 9.5l8 8M16 9.5l-8 8" stroke-width="1.6"/></svg></span> räumt alle Nägel ab – noch einmal gedrückt holt es dieselben zurück. Ohne Nagel fällt jede Kugel ins selbe Fach.</p>'
  },

  drop: {
    label: 'Einwurf',
    left: 'Einwurf eine Säule nach links',
    right: 'Einwurf eine Säule nach rechts',
    middle: 'Mitte',
    note: '<p>Zieh den schwarzen Trichter oben am Brett nach links oder rechts, um bis zu zwei Säulen. Der ganze Berg wandert eins zu eins mit: eine Säule weiter rechts heißt ein Feld wärmerer Mittelwert – die <b>Verschiebung des Mittels</b>.</p><p><b>Wärmeres</b> und <b>Kälteres Klima</b> setzen den Trichter samt Nageldreieck eine Säule nach rechts bzw. links. Kombiniert mit mehr Nägeln zeigt das Brett beides zugleich: verschobenen Mittelwert und größere Streuung.</p><p>Weit außen fällt eine Kugel erst ein paar Reihen, bevor das Dreieck breit genug ist – diese Reihen fehlen ihr als Entscheidungen, die Streuung wird etwas kleiner. Der Mittelwert bleibt exakt.</p>'
  },

  readout: {
    balls: 'Kugeln',
    mean: 'Mittelwert',
    sd: 'Streuung',
    extremes: 'Extreme',
    start: 'Start',
    fewer: 'Weniger Kugeln pro Start',
    more: 'Mehr Kugeln pro Start',
    pending: (settled, pending) => settled + ' (+' + pending + ')',
    none: '—'
  },
  tooltip: {
    balls: n => n + (n === 1 ? ' Kugel' : ' Kugeln')
  },

  primary: {
    start: 'Start', startSub: n => n + ' Kugeln fallen lassen',
    startAria: 'Kugeln fallen lassen',
    singleAria: 'Eine einzelne Kugel fallen lassen',
    resetAria: 'Kugeln zurücksetzen, Nägel bleiben',
    pause: 'Pause', pauseSub: 'Kugelregen anhalten',
    resume: 'Weiter', resumeSub: 'Kugelregen fortsetzen',
    more: 'Mehr', moreSub: n => n + ' weitere Kugeln zugeben',
    single: 'Einzeln', singleSub: 'Eine Kugel',
    reset: 'Reset', resetSub: 'Nur die Kugeln'
  },
  hint: n => 'Nägel im Brett: ' + n + '. Ein einzelner Wurf sagt nichts, erst viele Kugeln zeigen das Klima. Das Brett ist ein Modell: Echtes Wetter hängt von viel mehr ab als von zehn Nagelreihen.',

  tasks: {
    open: 'Aufgaben',
    title: 'Aufgaben',
    closeAria: 'Aufgaben schließen',
    intro: 'Drei Dinge, die das Brett zeigen kann. Sie haken sich von selbst ab, sobald du sie gemacht hast.',
    progress: (done, total) => done + '/' + total,
    mountain: 'Lass mindestens 365 Kugeln fallen – ein Jahr voller Wettertage. Erkennst du die Glocke?',
    shift: 'Zieh den Trichter oben zur Seite und gib 200 Kugeln dazu. Wohin wandert der Berg?',
    extreme: 'Füll alle leeren Kreise mit Nägeln auf (oder wähle „Extremeres Klima“) und gib 200 Kugeln dazu. Was passiert an den Rändern?',
    doneMountain: 'Geschafft: Aus Zufall wird eine Glocke.',
    doneShift: 'Der ganze Berg ist mitgewandert.',
    doneExtreme: 'Breiter und flacher – mehr Extreme an beiden Rändern.'
  },

  dev: {
    title: 'Dev-Modus',
    close: 'Schließen',
    add1000: '+1000 Kugeln',
    add5000: '+5000 Kugeln',
    speed: x => 'Zeitraffer ×' + x,
    collide: on => 'Kollisionen: ' + (on ? 'an' : 'aus'),
    clearBalls: 'Kugeln zurücksetzen',
    theory: on => 'Theorie-Kurve: ' + (on ? 'an' : 'aus'),
    exportCsv: 'CSV exportieren',
    scale: label => 'Y-Achse: ' + label,
    pace: ms => 'Abstand: ' + (ms === null ? 'automatisch' : ms + ' ms'),
    cap: n => 'Max. gleichzeitig: ' + (n === 0 ? 'ohne' : n),
    stats: (active, queue, landed, fps) => 'aktiv ' + active + ' · Warteschlange ' + queue + ' · gelandet ' + landed + ' · ' + fps + ' fps',
    note: '<b>Y-Achse</b> schaltet zwischen vier Lesarten der Säulenhöhe durch – die Bildunterschrift unter dem Brett sagt jeweils, worauf sich die Höhe bezieht: <i>Kugeln je Säule (mitwachsend)</i> (eine Säule ist eine Kugelzahl, volle Höhe ist die nächste runde Zahl über der höchsten Säule – 10, 15, 20, 30, 50, 70, 100 …; sie steigt nur, und dann schrumpfen alle Säulen gleichzeitig um denselben Faktor); <i>Anteil der höchsten Säule</i> (vorheriger Standard, füllt immer das Bild, aber der Maßstab wandert mit); <i>Anteil aller Kugeln</i> (volle Höhe = 30 % aller gefallenen Kugeln – die Wahrscheinlichkeitsverteilung); <i>Kugeln je Säule</i> (neuer Standard: volle Höhe = der Wert am Regler neben den Säulen, voreingestellt 1000; ändert sich nie von selbst). <i>Anteil der erwarteten Spitze</i> ist raus: der Maßstab hing an der angeforderten Kugelzahl, ein zweiter Start skalierte das Bild herunter, bevor eine neue Kugel gefallen war. <b>Abstand</b> und <b>Max. gleichzeitig</b> entzerren große Schübe. <b>Zeitraffer</b> rechnet mehrere Simulationsschritte pro Bild. <b>Theorie-Kurve</b> zeigt die exakte Wahrscheinlichkeitsverteilung für das aktuelle Nagelbild gepunktet.'
  },

  topics: {
    weather: {
      title: 'Wetter oder Klima?',
      body: '<p>Eine einzelne Kugel läuft durch das Brett und landet irgendwo. Wo genau, kann niemand vorhersagen – an jedem Nagel entscheidet ein Hauch von Zufall über links oder rechts. Das ist <b>Wetter</b>: ein einzelnes Ereignis, kurzfristig, launisch, im Detail nicht planbar. Ein kalter Julitag, ein Sturm, ein Rekordsommer – jeweils eine Kugel.</p><p>Lässt du viele hundert Kugeln fallen, entsteht aus lauter Zufall etwas erstaunlich Stabiles: eine glockenförmige Verteilung. Sie sagt nichts über die nächste Kugel, aber alles über das System als Ganzes. Das ist <b>Klima</b> – die <b>Statistik des Wetters</b> über lange Zeit, meist über 30 Jahre gemittelt.</p><p>Deshalb ist der Satz „Es war doch letzte Woche kalt, also gibt es keinen Klimawandel“ ein Denkfehler: Er verwechselt eine Kugel mit dem Berg. Selbst in einem viel wärmeren Klima fällt noch die eine oder andere Kugel weit links – nur seltener.</p>'
    },
    change: {
      title: 'Was der Klimawandel mit dem Brett macht',
      intro: '<p>Der Klimawandel würfelt nicht die einzelnen Kugeln neu – er baut das Brett um. Mehr Treibhausgase verändern die Spielregeln, nach denen sich das Wetter einstellt. Statistiker sprechen von drei Effekten, die sich in Messdaten weltweit zeigen.</p>',
      shiftTitle: '1. Verschiebung des Mittels',
      shiftCaption: '<b>Der ganze Berg wandert nach rechts.</b> Die Streuung bleibt gleich, aber alles wird wärmer: Was früher ein heißer Sommer war, ist nun ein durchschnittlicher. Neue Rekordhitze taucht auf, extreme Kälte wird selten.',
      shiftFigAria: 'Zwei Glockenkurven, die zweite nach rechts verschoben',
      spreadTitle: '2. Zunahme der Streuung',
      spreadCaption: '<b>Der Berg wird breiter und flacher.</b> Der Mittelwert kann gleich bleiben – trotzdem schwankt das Wetter stärker. Beide Enden wachsen: mehr Hitze und mehr Ausreißer nach unten, mehr Dürre und mehr Starkregen.',
      spreadFigAria: 'Eine schmale und eine breite, flachere Glockenkurve',
      extremeTitle: '3. Wirkung auf die Extreme',
      extremeCaption: '<b>Am Rand wird aus wenig sehr viel.</b> Eine kleine Verschiebung des Mittels vervielfacht die Fälle jenseits der Schwelle – weil die Glockenkurve dort steil abfällt. Aus einem „Jahrhundertsommer“ wird so in wenigen Jahrzehnten ein Ereignis, das mehrmals pro Generation vorkommt.',
      extremeFigAria: 'Verschobene und verbreiterte Kurve mit stark vergrößertem rechten Ende',
      cold: 'KALT',
      hot: 'HEISS',
      threshold: 'EXTREM-SCHWELLE',
      outro: '<p>Alle drei Effekte kannst du am Brett nachstellen. Der verschiebbare <b>Trichter</b> ändert die Stelle, an der die Kugeln hineinfallen – der ganze Berg wandert mit, das ist Effekt 1. <b>Mehr Nägel</b> – das kleine Dreieck bis oben aufgefüllt – bedeuten mehr Zufallsentscheidungen pro Kugel: breiterer Berg, Effekt 2. Beide zusammen ergeben Effekt 3: Schon ein Feld Verschiebung plus größere Streuung vervielfacht die Kugeln jenseits der roten Linien.</p>'
    },
    bell: {
      title: 'Warum ausgerechnet eine Glockenkurve?',
      intro: '<p>Die Glocke ist kein Zufall und keine Behauptung – man kann sie abzählen. An jedem Nagel teilt sich jeder Weg in zwei gleich wahrscheinliche Hälften. Die Zahl in einem Fach ist, auf wie vielen verschiedenen Wegen man dorthin kommt.</p>',
      figAria: 'Nagelreihen mit sich verzweigenden Wegen; unten die Zahlen 1, 4, 6, 4, 1 und die Wahrscheinlichkeiten 1/16, 4/16, 6/16, 4/16, 1/16',
      figCaption: '<b>Mitte = viele Wege, Rand = ein Weg.</b> Nach vier Reihen führen sechs verschiedene Wege in das mittlere Fach, aber nur ein einziger ganz nach links: zweimal links und zweimal rechts lässt sich auf sechs Arten mischen, viermal links nur auf eine. Deshalb ist die Mitte sechsmal so wahrscheinlich wie der Rand – nicht, weil die Kugeln die Mitte „magisch“ suchen. Mit zehn Reihen wird aus 1–4–6–4–1 die Reihe 1–10–45–120–210–252–…, und die Glocke wird immer glatter.',
      body: '<p>Das Galton-Brett, benannt nach dem britischen Forscher Francis Galton (1822–1911), zeigt einen der wichtigsten Sätze der Mathematik: den <b>zentralen Grenzwertsatz</b>. Viele kleine, unabhängige Zufallseinflüsse – hier das Abprallen an jedem Nagel – addieren sich fast immer zu einer Normalverteilung, der berühmten Glockenkurve.</p><p>Genau das passiert in der Atmosphäre: Die Temperatur eines Tages ergibt sich aus unzähligen Einflüssen – Bewölkung, Windrichtung, Bodenfeuchte, Meeresströmungen. Deshalb sind Klimagrößen wie die Tagesmitteltemperatur ungefähr glockenförmig verteilt. Andere Größen, etwa Niederschlagsmengen, sind stark unsymmetrisch – auch das kannst du nachbauen, indem du die Nägel ungleichmäßig setzt.</p><p>Und noch etwas zeigt das Brett: wie viele Kugeln man braucht, um überhaupt eine Form zu erkennen. Mit 20 Kugeln sieht das Ergebnis chaotisch aus, mit 365 wird die Glocke deutlich. Deshalb mitteln Klimaforscherinnen und Klimaforscher über 30 Jahre: Kürzere Zeiträume sind zu verrauscht, um ein Signal vom Zufall zu trennen.</p>'
    },
    use: {
      title: 'So benutzt du das Brett',
      body: '<p>Mit <b>Einzeln</b> schickst du eine einzige Kugel los und siehst, wie wenig sie verrät; mit <b>Start</b> kommt ein ganzer Schwall.</p><p>Du kannst jederzeit weitere Kugeln zugeben und dabei Nägel setzen oder entfernen – der Berg bleibt liegen und biegt sich sichtbar in die neue Form. Die Nägel sind die Spielregeln des Systems: Änderst du sie, ändert sich die ganze Verteilung. Zum genauen Setzen kannst du das Brett mit zwei Fingern oder Strg + Mausrad vergrößern.</p>'
    }
  }
};
