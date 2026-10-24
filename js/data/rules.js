// Fatherfog – Regeldaten für die Charaktererschaffung (Zero Edition v0.2)
// Positionen (pdf: {...}) beziehen sich auf assets/sheet/charakterblatt-de.pdf,
// in PDF-Punkten mit Ursprung oben links.

export const STAT_CAP = 75;
export const START_HOPE = 100;
export const SKILL_COST = 5;

export const STATS = [
  { id: 'str', name: 'Stärke', short: 'STÄ', dice: 6,
    blurb: 'Schwere Lasten heben, gestürzte Gefährten tragen, Armdrücken. Deine Stärke ist zugleich deine maximale Gesundheit.' },
  { id: 'int', name: 'Intellekt', short: 'INT', dice: 6,
    blurb: 'Unter Druck an deine Ausbildung denken, schlussfolgern, begreifen.' },
  { id: 'wil', name: 'Wille', short: 'WIL', dice: 6,
    blurb: 'Jenseits von Körper und Geist: dein Antrieb. Mühe, Leidenschaft, Verlangen.' },
];

export const SAVES = [
  { id: 'body', name: 'Körper', dice: 5,
    blurb: 'Hunger widerstehen, Krankheit abwehren, Sucht verhindern. Je höher, desto eher verhandelt der Tod mit dir, statt dich einfach zu holen.' },
  { id: 'mind', name: 'Verstand', dice: 5,
    blurb: 'Einen kühlen Kopf bewahren angesichts von Furcht, Chaos und allem, was an deinem Geist zerrt.' },
  { id: 'spirit', name: 'Seele', dice: 5,
    blurb: 'Blitzschnelle Reflexe: nach der Kante greifen, im Fallen sicher landen, ausweichen.' },
];

// Klassen. skills: feste Fertigkeiten; choices: je eine Option aus der Liste wählen.
export const CLASSES = [
  {
    id: 'worker', name: 'der Arbeiter', short: 'Arbeiter',
    tagline: 'Ein Meister des Tuns.',
    text: [
      'Werkzeug und Handwerk sind deine Macht. Deine Begabung liegt in deinen Händen – im Basteln, im Erschaffen, im Umgang mit Gerät. Ist es kaputt, reparierst du es. Brauchen sie es, baust du es.',
      'Du glaubst, dass harte Arbeit und Einfallsreichtum die besten Waffen der Menschen gegen den Nebel sind. Schweiß und Mühe sind das Rückgrat des Überlebens. Ruhe ist ein Luxus, denn es gibt immer etwas zu tun. Dein Antrieb: Neues erfinden, neue Handwerke lernen, neue Werkzeuge nutzen.',
    ],
    mods: { str: 10, body: 5, mind: 5, spirit: 5 },
    skills: ['tinkering'],
    choices: [['alchemy', 'boating']],
    points: 10,
    traits: [{ name: 'Beharrlichkeit', text: 'Bei einem kritischen Erfolg erhältst du 1 Fertigkeitspunkt.' }],
    rucksacks: ['excavation', 'exertion', 'exploration'],
    pdf: { box: [136, 198], skills: { tinkering: [138.1, 251.9], alchemy: [138.2, 266.8], boating: [199.7, 266.8] } },
  },
  {
    id: 'philosopher', name: 'der Philosoph', short: 'Philosoph',
    tagline: 'Die Gelehrten.',
    text: [
      'Deine Macht kommt aus dem Wissen um das, was die meisten nicht wissen. Anders als andere verschwendest du keine Zeit mit Fantastereien oder moralischen Debatten. Du glaubst, dass objektive Wahrheit und reine Vernunft die Heilmittel für die Leiden der Welt sind.',
      'Du trennst Glauben von Logik. Dein Antrieb: Wissen erlangen, indem du neue Proben sammelst und studierst. Ihr seid die Ärzte, Chronisten und Forschenden.',
    ],
    mods: { int: 10, mind: 5 },
    skills: ['literacy'],
    choices: [['basiccare', 'alchemy'], ['knowledge', 'perception']],
    points: 7,
    traits: [
      { name: 'Vernunft', text: 'Bei einem kritischen Erfolg erhalten nahe Gefährten 5 Hoffnung.' },
      { name: 'Verlust der Vernunft', text: 'Bei einem kritischen Fehlschlag verlieren nahe Gefährten 5 Hoffnung.' },
    ],
    rucksacks: ['examination', 'experimentation', 'exploration'],
    pdf: { box: [136, 298], skills: { literacy: [138.1, 337.3], basiccare: [138.2, 352.2], alchemy: [205.5, 352.2], knowledge: [138.2, 367], perception: [207.4, 367] } },
  },
  {
    id: 'stranger', name: 'der Fremde', short: 'Fremder',
    tagline: 'Ein verstörendes Rätsel.',
    text: [
      'Du gehörst zu den seltenen Wesen, die aus dem Nebel treten – oft schon erwachsen, ohne jede Erinnerung an die eigene Herkunft. Man fürchtet oder hasst dich; die anderen tun sich schwer, dich anzunehmen. Ob blasse Haut, fehlende Augenbrauen oder etwas anderes: Es ist beinahe unmöglich, zu verbergen, dass du ein Fremder bist.',
      'Deine Stärke liegt in deiner Verbindung zum Nebel. Du hast eine unheimliche Eingebung, wie eine zweite Stimme, die dich jenseits deines Verstehens leitet. Du sehnst dich danach, mit dem Nebel Zwiesprache zu halten und seine großzügigen Gaben zu ernten.',
    ],
    mods: { int: 5, wil: 5, body: -10, mind: 40, spirit: -10 },
    skills: ['foglore', 'fogvision'],
    choices: [],
    points: 5,
    traits: [{ name: 'Seltsame Präsenz', text: 'Berühren dich Gefährten, die keine Fremden sind, oder erwachen sie nahe bei dir, verlieren sie 2 Hoffnung.' }],
    rucksacks: ['extraction', 'excommunication', 'exploration'],
    pdf: { box: [136, 398], skills: { foglore: [138.1, 452.4], fogvision: [138.2, 467.3] } },
  },
  {
    id: 'hunter', name: 'der Jäger', short: 'Jäger',
    tagline: 'Die Tapferen.',
    text: [
      'Von klein auf im Kampf und im Überleben geschult, gehörst du zu den wenigen Kühnen, die regelmäßig in den Nebel ziehen, um Nahrung für das Dorf zu finden. Das Fleisch, das du bringst, wird stets geschätzt – und reicht doch nie.',
      'Gefahr ist eine Lebensart: unvermeidlich, aber lohnend, wenn man sie richtig angeht. Du willst töten, jagen und überleben.',
    ],
    mods: { wil: 10, body: 5, spirit: 10 },
    skills: [],
    choices: [['archery', 'firearms'], ['hiding', 'animals']],
    points: 5,
    traits: [
      { name: 'Jagdfieber', text: 'Bei einem kritischen Erfolg bei einer Willensprobe steigt dein Wille um 1.' },
      { name: 'Zur Beute werden', text: 'Wenn du verzweifelst, müssen alle nahen Gefährten auf Hoffnung retten oder ebenfalls verzweifeln.' },
    ],
    rucksacks: ['extermination', 'exhibition', 'exploration'],
    pdf: { box: [136, 498], skills: { archery: [138.1, 552.7], firearms: [197.3, 552.7], hiding: [138.1, 567.5], animals: [194.2, 567.5] } },
  },
];

// Rucksäcke. items: Text oder { t: Text mit {n}, roll: 'XdY' }
export const RUCKSACKS = {
  excavation: { name: 'Ausgrabung', num: 'i.', items: ['Werkzeuggürtel', 'Brecheisen', 'Hammer', 'Meißel', { t: '{n} Nägel', roll: '3d10' }, '1 Fackel', { t: '1 Ration', rations: 1 }] },
  exertion: { name: 'Kraftakt', num: 'ii.', items: ['Ruderboot', 'Großer Hammer', 'Glas voller Glühwürmchen (2 m Licht)', { t: '1 Ration', rations: 1 }] },
  examination: { name: 'Untersuchung', num: 'i.', items: ['Skalpell', 'Pergament', 'Tinte & Feder', { t: '{n} Erste-Hilfe-Sets', roll: '1d10' }, { t: '{n} Heilkräuter', roll: '1d10' }, 'Öllampe (gefüllt)', { t: '2 Rationen', rations: 2 }] },
  experimentation: { name: 'Experiment', num: 'ii.', items: ['Eine gute Schaufel', '3 Probengläser', 'Lupe', '1 Kerze', '3 Wälzer des Wissens (nach Wahl)', { t: '1 Ration', rations: 1 }] },
  extraction: { name: 'Entwendung', num: 'i.', items: ['Peitsche', 'Schlagring', 'Dietrich-Set', 'Gesichtstuch', { t: '{n} Wurfdolche', roll: '1d10' }, '1 Fackel', { t: '2 Rationen', rations: 2 }] },
  excommunication: { name: 'Verbannung', num: 'ii.', items: ['Stab (+1 Abwehr)', 'Laterne', { t: '{n} Lampenölflaschen', roll: '1d10' }, { t: '10 Rationen', rations: 10 }], defense: 1 },
  extermination: { name: 'Vernichtung', num: 'i.', items: ['Bogen', 'Köcher', { t: '{n} Pfeile', roll: '2d10' }, 'Lederrüstung (1 Abwehr)', 'Kurzschwert', '3 Fackeln', { t: '2 Rationen', rations: 2 }], defense: 1 },
  exhibition: { name: 'Schaustück', num: 'ii.', items: ['Gewehr', 'Munitionsbeutel', { t: '{n} Pulverladungen', roll: '1d10' }, 'Rapier', 'Zunderbüchse', { t: '1 Ration', rations: 1 }] },
  exploration: { name: 'Erkundung', num: 'iii.', items: ['Handbeil', 'Seil (15 m)', { t: '{n} Fackeln', roll: '1d10' }, 'Zunderbüchse', { t: '{n} Rationen', roll: '1d10', rations: 'n' }] },
};

export const CLOAKS = [
  { name: 'Schwarz', hex: '#1b1b1a', meaning: 'Die Farbe von Tod, Täuschung, Heimlichkeit und Einsamkeit.' },
  { name: 'Rot', hex: '#8f2a22', meaning: 'Die Farbe von Leidenschaft, Liebe, Zorn, Mut, Gefahr und aufgewühlten Gefühlen.' },
  { name: 'Orange', hex: '#b8672a', meaning: 'Die Farbe von Tatendrang, Kühnheit, Helligkeit, Naivität, Jugend, Neugier und Geborgenheit.' },
  { name: 'Gelb', hex: '#c9a63a', meaning: 'Die Farbe der verhangenen Sonne, von Hoffnung, Aufmerksamkeit, Wärme, Münzen und Vergnügen.' },
  { name: 'Grün', hex: '#4c6b3f', meaning: 'Die Farbe von Leben, Lebenskraft, Fruchtbarkeit, Schnelligkeit und Einheit mit der Natur und ihren Tieren.' },
  { name: 'Blau', hex: '#2f4f6e', meaning: 'Die Farbe von Frieden, Ruhe, Achtsamkeit, Verbundenheit und Klugheit.' },
  { name: 'Violett', hex: '#5a3a63', meaning: 'Die Farbe von Königtum, Geheimnis, dem Unbekannten, Ehrfurcht, Raffinesse und Luxus.' },
  { name: 'Grau', hex: '#7d827f', meaning: 'Die Farbe des Nebels bei Nacht, von Ernst, Verzweiflung und der äußersten Macht der Loslösung.' },
  { name: 'Weiß', hex: '#e9e6dc', meaning: 'Die Farbe des Narren, von Unschuld, Kindlichkeit, Reinheit und Glückseligkeit.' },
  { name: 'Braun', hex: '#6b4a2f', meaning: 'Die Farbe des einfachen Volkes, von Erde, Pragmatismus, Zähigkeit und harter Arbeit.' },
];

export const CLOAK_WEAR = [
  { id: 'over', name: 'Über dem Rucksack', text: 'Am gebräuchlichsten und am praktischsten auf Reisen: Der Umhang schützt das Gepäck vor Regen und Dieben und zeigt deine Farbe. Das gibt dir einen Buckel – aber die Arme bleiben frei.' },
  { id: 'under', name: 'Unter dem Rucksack', text: 'Schneller Zugriff auf dein Gepäck. Seltener – und kritisiert, weil es weder vor Wetter schützt noch gesehen wird. Umhänge sollen dich schließlich verbergen oder sichtbar machen.' },
  { id: 'rolled', name: 'Eingerollt', text: 'Bei gutem Wetter oben oder unten an den Rucksack geschnürt. Gilt als unhöflich – und als gefährlich.' },
];
