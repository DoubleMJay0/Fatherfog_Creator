# Bildliste – Motive für den Charaktergenerator

Alle Bilder liegen in `assets/img/`. Der Generator sucht je Motiv nach **`.webp`, dann `.png`, dann `.jpg`** – du kannst die Dateien also direkt aus OpenAI übernehmen. Fehlt ein Bild, erscheint automatisch ein Platzhalter mit dem Dateinamen.

**Empfehlung:** vor dem Hochladen auf max. ~1500 px Kantenlänge verkleinern und als WebP (Qualität ~82) speichern – das hält die Seite schnell.

## Stil-Basis (an jeden Prompt anhängen)

Abgeleitet von `class-worker.webp` (The Worker):

> Detailed black ink engraving and stipple illustration on plain near-white paper (#f7f8f4), no frame, the scene fading softly into the paper at all edges, dark fairytale horror, limited palette: black ink plus a single muted sage/fog green accent, swirling stylized fog tendrils with faint ghostly faces hidden in the mist, gnarled twisted trees, ruined castle silhouettes in the background, heavy cross-hatching, woodcut-like linework, vignette fading to white paper at the edges, no text, no lettering, no border.

## Motive

| Datei                      | Format          | Kapitel                | Motiv (Prompt-Kern)                                                                                                                                                                                                |
| -------------------------- | --------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cover`                    | 2:3 (1024×1536) | Prolog                 | A lone tall Foghouse tower in a misty forest, great flame beacon burning at its top, a robed keeper blowing a huge curved horn from the balcony, travelers with cloaks and rucksacks approaching on a winding path |
| `chapter-stats`            | 2:3             | I · Werte              | Close-up of weathered hands rolling bone ten-sided dice on a scarred wooden table by candlelight, fog creeping in through a cracked window, an hourglass and a knife beside the dice                               |
| `chapter-saves`            | 2:3             | II · Rettung           | A hooded traveler bracing with a raised lantern while long fog tendrils with grasping hands and hollow faces reach toward them on a narrow forest path                                                             |
| `class-worker`             | 2:3             | III · Klasse           | ✔ vorhanden                                                                                                                                                                                                        |
| `class-philosopher`        | 2:3             | III · Klasse           | A gaunt scholar in a patched cloak kneeling in the fog, examining a strange specimen with a magnifying lens, specimen jars, quill and open tome on a satchel, spectacles, ruins behind                             |
| `class-stranger`           | 2:3             | III · Klasse           | An unsettling pale figure with no eyebrows and too-calm eyes stepping out of a wall of fog, fog clinging to them like a cloak, face partly wrapped in a scarf, villagers' silhouettes recoiling in the background  |
| `class-hunter`             | 2:3             | III · Klasse           | A lean hunter crouching on a mossy fallen tree, drawing a bow toward something huge in the mist, quiver and short sword, a slain boar hanging from a pole, antlered skulls in the trees                            |
| `rucksack-excavation`      | 3:2 (1536×1024) | IV · Arbeiter i.       | Still life of a leather rucksack with toolbelt, prybar, hammer, chisel, pouch of nails, one torch and a ration bundle                                                                                              |
| `rucksack-exertion`        | 3:2             | IV · Arbeiter ii.      | A small wooden rowboat pulled onto a foggy shore, a great two-handed hammer leaning on it, a glowing jar of fireflies on the bench                                                                                 |
| `rucksack-examination`     | 3:2             | IV · Philosoph i.      | Still life: surgical knife, parchment, ink and quill, bandage kits, bundles of medicinal herbs, a filled oil lamp, on an open satchel                                                                              |
| `rucksack-experimentation` | 3:2             | IV · Philosoph ii.     | Still life: a good spade, three glass specimen jars with clasps, magnifying lens, a single candle, three heavy tomes                                                                                               |
| `rucksack-extraction`      | 3:2             | IV · Fremder i.        | Still life: coiled whip, knuckle dusters, a leather lock-pick wallet, a face scarf, a fan of throwing daggers, a torch                                                                                             |
| `rucksack-excommunication` | 3:2             | IV · Fremder ii.       | A gnarled walking staff, an iron lantern and many small oil flasks, a pile of wrapped rations, on a misty stone                                                                                                    |
| `rucksack-extermination`   | 3:2             | IV · Jäger i.          | Still life: longbow, quiver of arrows, leather armor, short sword, three torches                                                                                                                                   |
| `rucksack-exhibition`      | 3:2             | IV · Jäger ii.         | Still life: long rifle, ammo pouch and powder shot, an elegant rapier, a tinderbox                                                                                                                                 |
| `rucksack-exploration`     | 3:2             | IV · alle iii.         | Still life: hand axe, coil of rope, bundle of torches, tinderbox, stack of rations, rucksack open on a forest floor                                                                                                |
| `chapter-cloak`            | 2:3             | V · Umhang             | A heavy hooded traveling cloak hanging on a crooked branch in the fog, worn over a rucksack shape like a hunchback, a brooch glinting at the clasp                                                                 |
| `chapter-keepsakes`        | 2:3             | VI · Brosche & Kleinod | A cabinet of curiosities: odd brooches pinned to velvet, a music box, teeth necklace, pressed flower, tarot cards, a murky sealed jar                                                                              |
| `chapter-coin`             | 2:3             | VII · Münzen           | A worn leather coin purse spilling old coins onto a table, a crow pecking at one coin, a severed monkey's paw and a golden egg in the shadows                                                                      |
| `chapter-artifact`         | 2:3             | VIII · Erbstück        | An old iron-bound chest in the fog, lid slightly open with eerie light, a red wax seal broken, strange relics half visible inside (feather, mirror, lamp)                                                          |
| `chapter-skills`           | 3:2             | IX · Fertigkeiten      | A crowded workbench and study: tools, anvil, open anatomy book, herbs, map and compass, bow, all in one composition                                                                                                |
| `chapter-finish`           | 2:3             | X · Abschluss          | A small party of cloaked travelers with rucksacks seen from behind at the edge of the village palisade, staring into a towering wall of fog, a distant foghouse beacon glowing                                     |

## Optional / später

- `chapter-death` – für eine künftige „Tod & Nachfolge“-Funktion
- Hintergrund-Textur (Papier) – derzeit per CSS erzeugt
