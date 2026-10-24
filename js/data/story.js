// Erzählstimme der Charaktererschaffung.
// img: Dateiname ohne Endung in assets/img/ (siehe BILDER.md)

export const CHAPTERS = [
  {
    id: 'prolog', num: '', title: 'Es war einmal', img: 'cover',
    caption: 'Das Nebelhaus',
    lead: 'Es war einmal ein Land voller Hoffnung, und die Leute erzählten sich Geschichten, die gut ausgingen.',
    text: [
      'Dann quoll der Nebel hervor und legte seine dunstigen Ranken über alles, was uns lieb ist. Mit ihm kamen Ungeheuer – und Verzweiflung.',
      'Nach Generationen der Abgeschiedenheit gehörst du zu den wenigen, die mutig genug sind, das einzige Dorf zu verlassen, das sie je gekannt haben. Dein Auftrag: das kostbarste und am schnellsten schwindende Gut deiner Heimat zu finden. Hoffnung.',
    ],
  },
  {
    id: 'stats', quote: ['„Hänsel, streck deine Finger heraus, damit ich fühle, ob du bald fett bist.“ Hänsel streckte ihr aber ein Knöchlein heraus.', 'Hänsel und Gretel'], num: 'I', title: 'Fleisch & Feuer', sheet: '1. Werte würfeln', img: 'chapter-stats',
    caption: 'Was in dir brennt',
    lead: 'Bevor der Nebel nach dir greift, wird gewogen, was du mitbringst.',
    text: ['Würfle 6W10 für jeden Wert – in dieser Reihenfolge: Stärke, Intellekt, Wille. Ein Wert von 30 gilt als gewöhnlich.'],
  },
  {
    id: 'saves', quote: ['„Kehr um, kehr um, du junge Braut, du bist in einem Mörderhaus.“', 'Der Räuberbräutigam'], num: 'II', title: 'Was dich hält', sheet: '2. Rettungswürfe würfeln', img: 'chapter-saves',
    caption: 'Der Nebel tastet',
    lead: 'Nicht alles, was dich erwartet, kannst du angreifen. Manchem kannst du nur standhalten.',
    text: ['Würfle 5W10 für jeden Rettungswurf: Körper, Verstand, Seele. Ein Wert von 25 gilt als gewöhnlich.'],
  },
  {
    id: 'class', quote: ['„Ja, wenn’s anginge, so möchte ich lernen, dass mir’s gruselte; davon verstehe ich noch gar nichts.“', 'Märchen von einem, der auszog, das Fürchten zu lernen'], num: 'III', title: 'Wer du warst', sheet: '3.–4. Klasse & Klassenmerkmal', img: null,
    caption: '',
    lead: 'Jedes Dorf braucht Hände, Köpfe und Klingen. Und manchmal spuckt der Nebel jemanden aus, den keiner gerufen hat.',
    text: ['Wähle die Klasse, die du spielen willst – nicht die, die deine Gruppe angeblich braucht. Eine ganze Gemeinschaft aus Fremden oder Jägern kann ebenso viel Spaß machen wie eine bunte Truppe.'],
  },
  {
    id: 'rucksack', quote: ['„Da hast du ein Stück Kuchen und eine Flasche Wein … und wenn du hinauskommst, so geh hübsch sittsam und lauf nicht vom Wege ab.“', 'Rotkäppchen'], num: 'IV', title: 'Was du trägst', sheet: '5. Rucksack wählen', img: null,
    caption: '',
    lead: 'Im nebelverhangenen Wildland zählt, was du bei dir trägst, oft mehr als wer du bist.',
    text: ['Jede Figur trägt einen Rucksack. Wähle einen der drei, die deiner Klasse offenstehen. Die Erkundung steht allen offen.'],
  },
  {
    id: 'cloak', quote: ['Seine Jäger mussten alle Tiere im ganzen Reiche auffangen und ihnen ein Stück von ihrer Haut abziehen; daraus ward ein Mantel aus tausenderlei Rauchwerk gemacht.', 'Allerleirauh'], num: 'V', title: 'Die Farbe deines Umhangs', sheet: '6. Umhang auswürfeln', img: 'chapter-cloak',
    caption: 'Eine Kultur der Umhänge',
    lead: 'Mit dem Nebel kam eine Kultur der Umhänge.',
    text: ['Sie wärmen, sie tarnen, sie halten eine Gruppe zusammen – und sie lassen dich im Nebel wiederfinden. Würfle 1W10 oder wähle die Farbe, die zu deiner Figur passt.'],
  },
  {
    id: 'keepsakes', quote: ['„O du Falada, da du hangest.“ – „O du Jungfer Königin, da du gangest, wenn das deine Mutter wüsste, ihr Herz tät ihr zerspringen.“', 'Die Gänsemagd'], num: 'VI', title: 'Spange & Kleinod', sheet: '6. Brosche & Kleinod auswürfeln', img: 'chapter-keepsakes',
    caption: 'Was man nicht hergibt',
    lead: 'Eine Brosche hält den Umhang. Ein Kleinod hält etwas anderes fest.',
    text: ['Broschen sind ein kleines Stück Ehrfurcht und Selbstausdruck – oft auch eine Art Erkennungszeichen. Dein Kleinod trägst du immer bei dir. Warum? Das ist persönlich.'],
  },
  {
    id: 'coin', quote: ['„Kikeriki, unsere schmutzige Jungfrau ist wieder hie.“ Das Pech aber blieb fest an ihr hängen und wollte, solange sie lebte, nicht abgehen.', 'Frau Holle'], num: 'VII', title: 'Klingende Münze', sheet: '6. Münzen auswürfeln', img: 'chapter-coin',
    caption: 'Jede Münze hat eine Geschichte',
    lead: 'Jede Figur beginnt mit einem Münzbeutel. Und jede Münze darin hat eine Herkunft, über die man nicht gern spricht.',
    text: ['Würfle 1W100. Eine Münze misst etwa einen Zoll, hundert wiegen ungefähr ein Pfund.'],
  },
  {
    id: 'artifact', quote: ['Ein großes blutiges Becken stand in der Mitte, und darin lagen tote zerhauene Menschen, daneben stand ein Holzblock, und ein blinkendes Beil lag darauf.', 'Fitchers Vogel'], num: 'VIII', title: 'Das Erbstück', sheet: '7. Erbstück auswürfeln', img: 'chapter-artifact',
    caption: 'Was aus den Geschichten blieb',
    lead: 'Manche Dinge sind älter als der Nebel. Sie stammen aus den Geschichten selbst.',
    text: ['Nur deine erste Figur erhält ein Erbstück. Stirbt sie, erbt es deine nächste. Viele halten ihr Erbstück geheim und teilen es nur mit der Spielleitung.'],
  },
  {
    id: 'skills', quote: ['„Siehst du“, sprach der Tod, „das sind die Lebenslichter der Menschen.“', 'Der Gevatter Tod'], num: 'IX', title: 'Was du gelernt hast', sheet: '8. Fertigkeiten kaufen', img: 'chapter-skills',
    caption: 'Hände, Kopf und Herz',
    lead: 'Was du kannst, hast du dir abgerungen.',
    text: ['Deine Klassenfertigkeiten sind bereits markiert. Jede weitere Fertigkeit kostet 5 Fertigkeitspunkte und verlangt eine der Voraussetzungen, die zu ihr führen. Ungenutzte Punkte behältst du.'],
  },
  {
    id: 'finish', quote: ['„Heute back ich, morgen brau ich, übermorgen hol ich der Königin ihr Kind; ach, wie gut, dass niemand weiß, dass ich Rumpelstilzchen heiß!“', 'Rumpelstilzchen'], num: 'X', title: 'Dein Name', sheet: '9. Abschluss', img: 'chapter-finish',
    caption: 'Am Rand des Nebels',
    lead: 'Fülle deinen Wasserschlauch. Zieh die Riemen fest. Und sag uns, wie man dich ruft.',
    text: ['Hoffnung beginnt bei 100. Deine Gesundheit entspricht deiner Stärke. Und da der Tod in dieser Welt beinahe gewiss ist: Erschaffe am besten gleich eine zweite Figur, die bereitsteht.'],
  },
];

// Fragen für die Chronik – {platzhalter} werden ersetzt.
export const QUESTIONS = {
  common: [
    { id: 'trinket', q: 'Warum trägst du {trinket} immer bei dir?' },
    { id: 'brooch', q: 'Wer gab dir die Brosche „{brooch}“ – oder wem hast du sie genommen?' },
    { id: 'left', q: 'Wen oder was hast du im Dorf zurückgelassen?' },
  ],
  worker: { id: 'class', q: 'Was hast du gebaut, das heute nicht mehr steht?' },
  philosopher: { id: 'class', q: 'Welche Wahrheit hoffst du im Nebel zu finden?' },
  stranger: { id: 'class', q: 'Was ist das Erste, woran du dich erinnerst?' },
  hunter: { id: 'class', q: 'Was hast du im Nebel gesehen, das du niemandem erzählst?' },
};

export const ENDINGS = [
  'Und wenn du nicht gestorben bist, dann gehst du noch heute.',
  'Das Horn des Nebelhauses ruft. Geh nicht vom Weg ab.',
];
