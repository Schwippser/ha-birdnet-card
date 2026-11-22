# Changelog

## Einträge

### Artenbilder zuverlässig laden
- Viele Artenbilder fehlten: Wikipedia bremst viele gleichzeitige Anfragen aus, und die Karte versuchte es danach nicht mehr. Die Anfragen laufen jetzt nacheinander, und bei Fehlern oder Begrenzung wird nach 4, 8, 16 … Sekunden erneut versucht (bis zu sechsmal).
- Arten ohne Wikipedia-Bild werden nicht wiederholt abgefragt.

### Erste Version (Beta)
- Einzelkarte „BirdNET“ mit drei Tabs: Übersicht, Analysen – Zusammenfassung, Arten – Analysen.
- Artenbilder von Wikipedia, Klick auf das Bild öffnet den Artikel in der Home-Assistant-Sprache.
- Zeitraum über die Datumsauswahl des Energie-Dashboards, Sortierung der Artenliste wie in BirdNET-Go.
- Schlanker Editor: nur Name/Icon und die BirdNET-Optionen, ohne Style-Auswahl, Styling, Aktionen und Zusatzinfos.
- Code auf das Nötige reduziert (66 KB), ohne Package-Styles, Aktionen und andere Kartentypen.
- Auswertungs-Package `packages/birdnet_auswertung.yaml` (Tageszähler, Statistik, Benachrichtigung bei neuer Art).
