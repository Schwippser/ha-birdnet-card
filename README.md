# HA BirdNET Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![Status](https://img.shields.io/badge/status-beta-yellow)

<a href="https://www.buymeacoffee.com/tomreim0s" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me a Coffee" style="height: 60px !important;width: 217px !important;" ></a>

*[Deutsche Version](README.de.md)*

A Lovelace card for [BirdNET-Go](https://github.com/tphakala/birdnet-go) detections in Home Assistant, modelled on the BirdNET-Go web interface. One card with three tabs and a visual editor.

> **Beta release.** Things may change between versions. Please report problems in the [issue tracker](../../issues).

## Screenshots

<img width="381" height="135" alt="image" src="https://github.com/user-attachments/assets/d813d4f9-0a4b-45ac-9c7a-fe5cd436cc72" /> <img width="274" height="135" alt="image" src="https://github.com/user-attachments/assets/2d48c35f-0fbe-4dc1-ae15-7ed2108e088d" /> <img width="224" height="135" alt="image" src="https://github.com/user-attachments/assets/cce0015c-a099-49a1-a339-566c6eb02017" />




## Tabs

- **Overview** – daily activity (detections per hour and species, with a daylight bar and the date selection of the energy dashboard), "Just heard", new and returning species
- **Analysis summary** – key figures, top 10 species, detections by time of day, trend, recent detections
- **Species analysis** – species list as tiles or list, sorted by detections, name, first/last seen, confidence and maximum confidence, with search

Species images come from Wikipedia (switchable); a click on the image opens the Wikipedia article in the language of your Home Assistant. Light and dark styles are supported.

## Requirements

1. BirdNET-Go publishing to an MQTT broker that Home Assistant uses (MQTT discovery).
2. The evaluation package in [`packages/birdnet_auswertung.yaml`](packages/birdnet_auswertung.yaml). It turns the detections into the sensors the card needs (`sensor.birdnet_erkennungen_heute`, `sensor.birdnet_statistik`).
   - Copy it to `/config/packages/` and make sure `configuration.yaml` contains `homeassistant: packages: !include_dir_named packages`.
   - If your BirdNET-Go device is not called "garten", replace `birdnet_go_garten` in the file.
   - Restart Home Assistant. The statistics fill with every new detection.

## Installation via HACS (custom repository)

[![Open your Home Assistant instance and open this repository in HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Schwippser&repository=ha-birdnet-card&category=dashboard)

1. In Home Assistant open **HACS → ⋮ → Custom repositories**.
2. Add `https://github.com/Schwippser/ha-birdnet-card` with type **Dashboard**.
3. Install **HA BirdNET Card** (enable *Show beta versions* to get beta releases).
4. Reload the browser (Ctrl+F5).

## Manual installation

1. Download `ha-birdnet-card.zip` from the latest [release](../../releases) and extract it to `config/www/ha-birdnet-card/` (script and `translations` folder together).
2. Add the resource `/local/ha-birdnet-card/ha-birdnet-card.js` of type *JavaScript module*.
3. Reload the browser (Ctrl+F5).

## Usage

Add a card and choose **BirdNET**, or use YAML (more in [`examples/dashboard.yaml`](examples/dashboard.yaml)):

```yaml
type: custom:ha-birdnet-card
entity: sensor.birdnet_erkennungen_heute
bn_stats_entity: sensor.birdnet_statistik
```

| Option | Default | Description |
|---|---|---|
| `entity` | `sensor.birdnet_erkennungen_heute` | daily counter from the package |
| `bn_stats_entity` | `sensor.birdnet_statistik` | statistics sensor from the package |
| `bn_default_tab` | `overview` | `overview`, `analysis` or `species` |
| `follow_energy_date` | `true` | follow the date selection of the energy dashboard |
| `hm_max_rows` / `hm_sort` | `10` / `total` | rows and sorting of the activity table |
| `hm_show_daylight` / `hm_sun_entity` | `true` / `sun.sun` | daylight bar |
| `bn_wiki_images` | `true` | load species images from Wikipedia |
| `bn_image_url` | – | own image source with `{name}` / `{sci}`, takes priority |

## Privacy note

With `bn_wiki_images` on, your browser requests species images and article data from wikipedia.org (scientific name, or the German species name). Turn the option off to avoid this.

## Using it together with the HA Ultimate Card Package

Both can be installed at the same time. The card type `birdnet` of the package and this single card are built from the same source. Translations are loaded from the first one that loads, so keep both up to date.

## Translations

English is the default. German is included in `translations/de.json` (flat `"English text": "translation"`). The language of the Home Assistant user is used. To add a language copy `de.json`, translate the values and open a pull request.

## License

[MIT](LICENSE)
