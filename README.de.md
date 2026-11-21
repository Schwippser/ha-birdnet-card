# HA BirdNET Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![Status](https://img.shields.io/badge/status-beta-yellow)

<a href="https://www.buymeacoffee.com/tomreim0s" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me a Coffee" style="height: 60px !important;width: 217px !important;" ></a>

*[English version](README.md)*

Lovelace-Karte für die Erkennungen von [BirdNET-Go](https://github.com/tphakala/birdnet-go) in Home Assistant, nach dem Vorbild der BirdNET-Go-Oberfläche. Eine Karte mit drei Tabs und visuellem Editor.

> **Beta-Version.** Zwischen Versionen kann sich etwas ändern. Probleme bitte im [Issue-Tracker](../../issues) melden.

## Screenshots

<img width="381" height="135" alt="image" src="https://github.com/user-attachments/assets/d813d4f9-0a4b-45ac-9c7a-fe5cd436cc72" /> <img width="274" height="135" alt="image" src="https://github.com/user-attachments/assets/2d48c35f-0fbe-4dc1-ae15-7ed2108e088d" /> <img width="224" height="135" alt="image" src="https://github.com/user-attachments/assets/cce0015c-a099-49a1-a339-566c6eb02017" />


## Tabs

- **Übersicht** – Tagesaktivität (Erkennungen pro Stunde und Art, mit Tageslicht-Leiste und der Datumsauswahl des Energie-Dashboards), „Gerade gehört“, neue und zurückkehrende Arten
- **Analysen – Zusammenfassung** – Kennzahlen, Top 10 Arten, Erkennungen nach Tageszeit, Trend, aktuelle Erkennungen
- **Arten – Analysen** – Artenliste als Kacheln oder Liste, sortierbar nach Erkennungen, Name, zum ersten/zuletzt gesehen, Konfidenz und maximaler Konfidenz, mit Suche

Die Artenbilder kommen von Wikipedia (abschaltbar). Ein Klick auf das Bild öffnet den Wikipedia-Artikel in der Sprache deines Home Assistant. Helle und dunkle Styles werden unterstützt.

## Voraussetzungen

1. BirdNET-Go sendet an einen MQTT-Broker, den Home Assistant nutzt (MQTT-Discovery).
2. Das Auswertungs-Package [`packages/birdnet_auswertung.yaml`](packages/birdnet_auswertung.yaml). Es macht aus den Erkennungen die Sensoren, die die Karte braucht (`sensor.birdnet_erkennungen_heute`, `sensor.birdnet_statistik`).
   - Nach `/config/packages/` kopieren; in der `configuration.yaml` muss `homeassistant: packages: !include_dir_named packages` stehen.
   - Heißt dein BirdNET-Go-Gerät nicht „garten“, ersetze `birdnet_go_garten` in der Datei.
   - Home Assistant neu starten. Die Statistik füllt sich mit jeder neuen Erkennung.
  
## Auswertungs-Package installieren

Die Karte liest BirdNET-Go nicht direkt. Sie braucht einige Sensoren, die das Auswertungs-Package [`packages/birdnet_auswertung.yaml`](packages/birdnet_auswertung.yaml) aus den MQTT-Erkennungen von BirdNET-Go erzeugt.

1. **MQTT-Entitäten prüfen.** Unter *Einstellungen → Geräte & Dienste → MQTT* sollte dein BirdNET-Go-Gerät die Sensoren `sensor.birdnet_go_<name>_last_species`, `_confidence` und `_scientific_name` liefern. Das Package erwartet den Gerätenamen `garten`.
2. **Datei kopieren:** `birdnet_auswertung.yaml` nach `/config/packages/` kopieren (Ordner anlegen, falls er fehlt).
3. **Packages aktivieren** in der `configuration.yaml` (entfällt, wenn du Packages schon nutzt):
   ```yaml
   homeassistant:
     packages: !include_dir_named packages
   ```
4. **Gerätenamen anpassen.** Heißt dein Gerät nicht `garten`, in der Datei überall `birdnet_go_garten` ersetzen (Suchen und Ersetzen).
5. **Benachrichtigung (optional).** Die Automation „BirdNET neue Art heute“ meldet eine neue Art des Tages. `notify.notify` durch deinen Dienst ersetzen, z. B. `notify.mobile_app_<handy>`. Kommt die Konfidenz in Prozent (z. B. 87), `above: 0.79` in `79` ändern. Ohne Benachrichtigungen den Block `automation:` löschen.
6. **Konfiguration prüfen** (*Entwicklerwerkzeuge → YAML → Konfiguration prüfen*) und **Home Assistant neu starten**. Ein Neuladen der Templates reicht nicht und kann die Tageszähler zurücksetzen.

Erzeugte Sensoren: `sensor.birdnet_erkennungen_heute`, `sensor.birdnet_statistik`, `sensor.birdnet_arten_heute`, `sensor.birdnet_top_art_heute`. Die Statistik startet leer und füllt sich mit jeder neuen Erkennung, frühere Erkennungen erscheinen also nicht.

## Installation über HACS (benutzerdefiniertes Repository)

[![Open your Home Assistant instance and open this repository in HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Schwippser&repository=ha-birdnet-card&category=dashboard)

1. In Home Assistant **HACS → ⋮ → Benutzerdefinierte Repositories** öffnen.
2. `https://github.com/Schwippser/ha-birdnet-card` mit dem Typ **Dashboard** hinzufügen.
3. **HA BirdNET Card** installieren (für Beta-Versionen *Beta-Versionen anzeigen* aktivieren).
4. Browser neu laden (Strg+F5).

## Manuelle Installation

1. `ha-birdnet-card.zip` aus dem neuesten [Release](../../releases) laden und nach `config/www/ha-birdnet-card/` entpacken (Skript und Ordner `translations` zusammen).
2. Die Ressource `/local/ha-birdnet-card/ha-birdnet-card.js` vom Typ *JavaScript-Modul* hinzufügen.
3. Browser neu laden (Strg+F5).

## Verwendung

Karte hinzufügen und **BirdNET** wählen, oder per YAML (mehr in [`examples/dashboard.yaml`](examples/dashboard.yaml)):

```yaml
type: custom:ha-birdnet-card
entity: sensor.birdnet_erkennungen_heute
bn_stats_entity: sensor.birdnet_statistik
```

| Option | Standard | Beschreibung |
|---|---|---|
| `entity` | `sensor.birdnet_erkennungen_heute` | Tageszähler aus dem Package |
| `bn_stats_entity` | `sensor.birdnet_statistik` | Statistik-Sensor aus dem Package |
| `bn_default_tab` | `overview` | `overview`, `analysis` oder `species` |
| `follow_energy_date` | `true` | folgt der Datumsauswahl des Energie-Dashboards |
| `hm_max_rows` / `hm_sort` | `10` / `total` | Zeilen und Sortierung der Aktivitätstabelle |
| `hm_show_daylight` / `hm_sun_entity` | `true` / `sun.sun` | Tageslicht-Leiste |
| `bn_wiki_images` | `true` | Artenbilder von Wikipedia laden |
| `bn_image_url` | – | eigene Bildquelle mit `{name}` / `{sci}`, hat Vorrang |

## Hinweis zum Datenschutz

Bei eingeschaltetem `bn_wiki_images` fragt dein Browser Artenbilder und Artikeldaten bei wikipedia.org ab (lateinischer oder deutscher Artname). Zum Vermeiden die Option ausschalten.

## Zusammen mit dem HA Ultimate Card Package

Beides kann gleichzeitig installiert sein. Der Kartentyp `birdnet` des Packages und diese Einzelkarte entstehen aus demselben Quelltext. Übersetzungen werden von dem geladen, das zuerst startet; halte daher beides aktuell.

## Übersetzungen

Englisch ist Standard. Deutsch liegt in `translations/de.json` (flach `"English text": "Übersetzung"`). Es gilt die Sprache des Home-Assistant-Benutzers. Für eine neue Sprache `de.json` kopieren, Werte übersetzen und einen Pull Request öffnen.

## Lizenz

[MIT](LICENSE)
