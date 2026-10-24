# Fatherfog · Charaktererschaffung

Ein immersiver, erzählerischer Charaktergenerator für das Märchen-Horror-Rollenspiel **Fatherfog** (Zero Edition v0.2). Schritt für Schritt – Werte, Rettungswürfe, Klasse, Rucksack, Umhang, Brosche, Kleinod, Münzen, Erbstück, Fertigkeiten – und am Ende ein **ausgefülltes deutsches Charakterblatt als PDF**.

## Funktionen

- 10 Kapitel mit Erzählstimme, Bildtafeln und Nebel-Übergängen
- Animierte W10/W100 – oder **eigene Würfel**: Ergebnisse selbst eintragen (Optionen ⋯)
- Klassenwahl mit Live-Vorschau der veränderten Werte (Obergrenze 75)
- Fertigkeitsbaum wie auf dem Bogen, mit Voraussetzungen, Punktekonto und Spezialgebieten
- Münzgeschichten mit Effekten (Fertigkeiten, Punkte, maximale Hoffnung, Schulden)
- Erbstück mit Siegel – optional geheim auf einem eigenen Beiblatt
- Ersatzfigur-Modus (ohne Erbstück)
- PDF: Seite 1 = ausgefülltes Charakterblatt (inkl. Porträt), Seite 2 = Chronik, Seite 3 = versiegeltes Erbstück
- Speichern/Laden als `.json`, Fortschritt bleibt im Browser erhalten
- Texte tauchen beim Scrollen aus dem Nebel auf, mobil nutzbar, ohne Build-Schritt

## Lokal starten

ES-Module und das PDF brauchen einen Webserver (nicht per Doppelklick öffnen):

```bash
cd fatherfog-creator
python3 serve.py
# → http://localhost:8000  (ohne Browser-Cache – Änderungen sind nach Neuladen sofort sichtbar)
```

## Auf GitHub Pages veröffentlichen

1. Neues Repository anlegen, Inhalt dieses Ordners hochladen.
2. *Settings → Pages → Deploy from branch → `main` / root*.
3. Nach ~1 Minute unter `https://<name>.github.io/<repo>/` erreichbar.

## Aufbau

```
index.html
css/style.css
js/main.js          Kapitel, Ablauf, UI
js/character.js     Datenmodell & abgeleitete Werte
js/pdf.js           PDF-Erzeugung (pdf-lib)
js/dice.js          Würfelanimation
js/data/rules.js    Klassen, Rucksäcke, Umhänge
js/data/skills.js   Fertigkeiten + Voraussetzungen + Positionen auf dem Bogen
js/data/tables.js   Broschen, Kleinode, Münzen, Erbstücke (W100)
js/data/story.js    Erzähltexte & Chronik-Fragen
assets/img/         Motive – siehe BILDER.md
assets/sheet/       Charakterblatt (Hintergrund für das PDF)
assets/fonts/       IM Fell, UnifrakturMaguntia (SIL OFL)
assets/vendor/      pdf-lib 1.17.1, fontkit 1.1.1 (MIT)
```

Bilder hinzufügen: Datei mit dem Namen aus `BILDER.md` in `assets/img/` legen – fertig.

## Hinweis

Privates Projekt für die eigene Spielrunde.
