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
    headline: 'Klima ist<br>Statistik',
    lead: 'Das Galtonbrett zeigt die Theorie hinter Wahrscheinlichkeitsverteilungen.'
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
    more: 'Mehr Kugeln je Säule (herauszoomen)',
    less: 'Weniger Kugeln je Säule (hineinzoomen)'
  },

  controls: {
    infoAria: 'Knöpfe erklären',
    note: '<p><b>▶ Start</b> lässt die eingestellte Zahl Kugeln fallen – während sie fallen wird daraus <b>Pause</b>, danach <b>Mehr</b>: Jeder weitere Start legt Kugeln auf den vorhandenen Berg drauf. Mit <b>− / +</b> daneben stellst du ein, wie viele es pro Start sind.</p><p><b>Einzelne Kugel</b> wirft genau eine – das ist ein Wettertag, und man sieht, dass er nichts beweist.</p><p><b>Kugeln zurücksetzen</b> leert nur den Berg; Nägel, Klima und Einwurf bleiben, wie sie sind. <b>Nägel zurücksetzen</b> räumt umgekehrt das Brett leer – ohne Nagel fällt jede Kugel in dieselbe Mitte, aus lauter Zufall wird ein sicheres Ergebnis.</p><p>Unten rechts am Brett frieren die drei nummerierten Kästchen die aktuelle Verteilung als gestrichelte Vergleichslinie ein – unten links stellst du ein, wie viele Kugeln eine volle Säule sind. Oben rechts geht das Brett auf Vollbild.</p>'
  },

  scenario: {
    group: 'Klima',
    selectAria: 'Klima wählen',
    resetBoardAria: 'Brett auf Normalklima zurücksetzen',
    wipeAria: 'Alle Nägel entfernen',
    normal: 'Normalklima',
    extrem: 'Extremklima',
    normalBtn: 'Normal­klima',
    extremBtn: 'Extrem­klima',
    custom: 'Angepasst',
    wipe: 'Alle entfernen',
    infoAria: 'Brett, Klima und Nägel erklären',
    note: '<p>Aktuell stecken <b id="board-help-count">55</b> Nägel im Brett. Tippe auf eine <b>leere Stelle</b> im hellen Dreieck, um dort einen Nagel zu setzen. Tippe auf einen <b>vorhandenen Nagel</b>, um ihn wieder zu entfernen.</p><p>Entfernte Nägel hinterlassen eine Lücke: Kugeln fliegen dort ungebremst weiter, statt zur Mitte zurückgelenkt zu werden. Zusätzliche Nägel kannst du <b>zwischen</b> zwei Reihen setzen – dort erscheint ein feiner Punkt als Platzhalter. So ein Nagel wirft jede Kugel, die ihn erreicht, eine Spalte nach außen.</p><p>Der schwarze <b>Trichter</b> oben ist verschiebbar: Zieh ihn nach links oder rechts, dann fallen die Kugeln dort ins Brett, und der ganze Berg wandert mit – die <b>Verschiebung des Mittels</b>. Bis zu zwei Säulen weit, in ganzen Säulenschritten.</p><p>Der Pfeil mit den Nägeln setzt das Brett auf <b>Normalklima</b> zurück: volles Dreieck, Einwurf in der Mitte, Berg geleert. Das durchgestrichene Dreieck daneben <b>leert das ganze Brett</b> – der Berg bleibt liegen, nur trifft jede weitere Kugel auf keinen Nagel mehr.</p><p><b>Normalklima</b> ist das volle Dreieck: Jede Kugel entscheidet zehnmal neu, der Einwurf liegt in der Mitte. <b>Extremklima</b> dünnt jede zweite Reihe auf Lücke aus <i>und</i> setzt den Einwurf eine Säule nach rechts – wärmere Welt heißt beides zugleich. Ein Nagel würfelt neu, eine Lücke nicht: Wer durch eine Lücke fällt, behält die Richtung von vorher, und solche Schritte summieren sich. Ergebnis: Der Berg wandert nach rechts <i>und</i> wird breiter, mit deutlich mehr Kugeln jenseits der roten Linien. Mit <b>Einwurf</b> lässt sich die Verschiebung jederzeit wieder zurücknehmen, um die beiden Effekte einzeln zu sehen.</p>'
  },

  drop: {
    label: 'Einwurf',
    left: 'Einwurf eine Säule nach links',
    right: 'Einwurf eine Säule nach rechts',
    middle: 'Mitte',
    note: '<p>Zieh den schwarzen Trichter oben am Brett nach links oder rechts, um bis zu zwei Säulen. Der ganze Berg wandert eins zu eins mit: eine Säule weiter rechts heißt ein Feld wärmerer Mittelwert – die <b>Verschiebung des Mittels</b>.</p><p><b>Extremklima</b> schiebt den Trichter selbst eine Säule nach rechts – verschobener Mittelwert und größere Streuung zugleich, so wie es echte Messreihen zeigen. Zurück auf <b>Mitte</b> gestellt zeigt Extremklima nur die größere Streuung, ohne Verschiebung.</p><p>Weit außen fällt eine Kugel erst ein paar Reihen, bevor das Dreieck breit genug ist – diese Reihen fehlen ihr als Entscheidungen, die Streuung wird etwas kleiner. Der Mittelwert bleibt exakt.</p>'
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
    title: 'Aufgaben',
    mountain: 'Lass mindestens 365 Kugeln fallen – ein Jahr voller Wettertage. Erkennst du die Glocke?',
    shift: 'Zieh den Trichter oben zur Seite und gib 200 Kugeln dazu. Wohin wandert der Berg?',
    extreme: 'Schalte auf Extremklima und gib 200 Kugeln dazu. Was passiert an den Rändern?',
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
      outro: '<p>Alle drei Effekte kannst du am Brett nachstellen. Der verschiebbare <b>Trichter</b> ändert die Stelle, an der die Kugeln hineinfallen – der ganze Berg wandert mit, das ist Effekt 1. <b>Extremklima</b> dünnt jede zweite Nagelreihe auf Lücke aus: Wer durch eine Lücke fällt, behält seine Richtung, und solche Schritte summieren sich zu größeren Ausschlägen – gleicher Mittelwert, breiterer Berg, Effekt 2. Beide zusammen ergeben Effekt 3: Schon ein Feld Verschiebung plus größere Streuung vervielfacht die Kugeln jenseits der roten Linien.</p>'
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
