/* HA BirdNET Card – Einzelkarte, erzeugt aus dem HA Ultimate Card Package (build_birdnet_card.py). Nicht von Hand ändern. */
/* HA Ultimate Card Package – i18n core (English = source language, translation files in ./translations/<lang>.json) */
(() => {
  if (globalThis.__UCP_I18N) return;
  const stackUrl = () => { try { return (new Error().stack || "").match(/https?:\/\/[^\s)]+?ha-birdnet-card[^\s):]*\.js[^\s):]*/)?.[0] ?? ""; } catch { return ""; } };
  const scriptUrl = (() => { try { return document.currentScript?.src || stackUrl(); } catch { return ""; } })();
  const base = scriptUrl ? scriptUrl.replace(/[?#].*$/, "").replace(/[^/]*$/, "") : "/local/ha-birdnet-card/";
  const query = (scriptUrl.match(/\?[^#]*/) || [""])[0];
  const state = { dict: null, requested: undefined, cache: {}, listeners: new Set(), seen: new WeakSet() };
  const normalize = (value) => String(value || "en").toLowerCase().replace("_", "-");
  const loadFile = (code) => state.cache[code] ??= fetch(`${base}translations/${code}.json${query}`, { cache: "no-cache" })
    .then((response) => response.ok ? response.json() : null).catch(() => null);
  async function load(lang) {
    for (const code of [...new Set([lang, lang.split("-")[0]])]) {
      if (code === "en") return null;
      const dict = await loadFile(code);
      if (dict && typeof dict === "object") return dict;
    }
    return null;
  }
  const t = (text) => {
    const dict = state.dict;
    return dict && typeof text === "string" && Object.hasOwn(dict, text) ? dict[text] : text;
  };
  const ATTRS = ["aria-label", "title", "placeholder", "aria-valuetext", "alt"];
  function translateDom(root) {
    const dict = state.dict;
    if (!dict || !root) return;
    const walker = document.createTreeWalker(root, 1 | 4);
    for (let node = walker.currentNode; node; node = walker.nextNode()) {
      if (node.nodeType === 3) {
        if (state.seen.has(node)) continue;
        const raw = node.nodeValue, text = raw.trim();
        if (text && Object.hasOwn(dict, text)) { state.seen.add(node); node.nodeValue = raw.replace(text, dict[text]); }
      } else if (node.nodeType === 1 && node.localName !== "style" && node.localName !== "script") {
        for (const name of ATTRS) {
          const value = node.getAttribute(name);
          if (value && Object.hasOwn(dict, value)) node.setAttribute(name, dict[value]);
        }
      }
    }
  }
  function walkSchema(value) {
    if (Array.isArray(value)) return value.map(walkSchema);
    if (!value || typeof value !== "object") return value;
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = (key === "title" || key === "label" || key === "description" || key === "helper") && typeof item === "string" ? t(item)
        : item && typeof item === "object" ? walkSchema(item) : item;
    }
    return out;
  }
  const refreshAll = () => {
    for (const ref of [...state.listeners]) {
      const el = ref.deref();
      if (!el) { state.listeners.delete(ref); continue; }
      try {
        if (!el.isConnected) continue;
        if ("_markup" in el) el._markup = null;
        (el._i18nRefresh ?? el._render)?.call(el);
        translateDom(el.shadowRoot ?? el);
      } catch { /* ignore */ }
    }
  };
  function setLang(raw) {
    const lang = normalize(raw);
    if (lang === state.requested) return;
    state.requested = lang;
    load(lang).then((dict) => {
      if (state.requested !== lang) return;
      const changed = (dict ?? null) !== state.dict;
      state.dict = dict;
      if (changed) refreshAll();
    });
  }
  const attached = new WeakSet();
  function attach(el) {
    if (attached.has(el)) return;
    attached.add(el);
    state.listeners.add(new WeakRef(el));
    const root = el.shadowRoot ?? el;
    new MutationObserver((records) => {
      if (!state.dict) return;
      for (const record of records) {
        if (record.type === "characterData") { const node = record.target; if (!state.seen.has(node)) { const text = node.nodeValue.trim(); if (text && Object.hasOwn(state.dict, text)) { state.seen.add(node); node.nodeValue = node.nodeValue.replace(text, state.dict[text]); } } }
        else for (const node of record.addedNodes) { if (node.nodeType === 1) translateDom(node); else if (node.nodeType === 3 && node.parentNode) translateDom(node.parentNode); }
      }
    }).observe(root, { childList: true, characterData: true, subtree: true });
    translateDom(root);
  }
  globalThis.__UCP_I18N = { t, setLang, attach, schema: (schema) => state.dict ? walkSchema(schema) : schema, translateDom, base,
    label: (fn) => (...args) => t(fn(...args)) };
})();

/* Energy Values Card v1.0.0 bundled for HA Ultimate Card Package */

(() => {
const ucpT = (text) => globalThis.__UCP_I18N.t(text);
const ucpTrSchema = (schema) => globalThis.__UCP_I18N.schema(schema);
const ucpAttach = (el) => globalThis.__UCP_I18N.attach(el);
const ucpSetLang = (hass) => globalThis.__UCP_I18N.setLang(hass?.locale?.language || hass?.language);
/*
 * Neon Bar Card for Home Assistant
 *
 * Eine Lovelace-Card mit glühenden Balken:
 *   type: custom:neon-bar-card
 *   layout: horizontal | vertical      (Auswahlfeld im Editor)
 *   marquee: true                      (Laufschrift für zu lange Namen)
 *   show_knob: false                   (runden Knopf ausblenden)
 *   zero_center: true                  (Nullpunkt-Modus: negative und positive Werte, min < 0 < max;
 *                                       Schwellen gelten dann als Betrag, Farbe nach Abstand zur Null)
 *   follow_theme: true                 (Standard: Design aus dem HA-Theme)
 *
 * Mit follow_theme (Standard) übernimmt die Card Hintergrund, Rahmen, Radius,
 * Schatten, Schriftart, Schriftgrößen und Farben aus dem in Home Assistant
 * gewählten Theme (auch beim Wechsel zwischen hell und dunkel).
 * Mit follow_theme: false bleibt das dunkle Neon-Design erhalten.
 *
 * Aus Kompatibilitätsgründen bleiben custom:neon-hbar-card (horizontal) und
 * custom:neon-vbar-card (vertikal) als Kurzformen erhalten.
 * Keine Abhängigkeiten, kein Build-Schritt: reines JavaScript mit Shadow DOM.
 */

/* Farben des Neon-Designs (follow_theme: false) */

/* Rückfallwerte, falls das Theme eine Farbe nicht definiert (HA-Standardtheme) */

/** Farbstufen aus normal / warning / critical (Werte + Hex-Farben). */

/* Kurzformen für bestehende Konfigurationen */

/* ---------- Visueller Editor ---------- */

const NB_LABELS = {
  title: "Title (optional)",
  
  entities: "Entities (one bar per entity)",
  
  max: "Maximum value",

};

window.customCards = window.customCards || [];

/* ---------- HA Ultimate Card Package ---------- */

const UCP_TAG = "ha-birdnet-card";
const UCP_TYPE = "custom:" + UCP_TAG;
const UCP_EDITOR = UCP_TAG + "-editor";

const ucpText = (name) => ({ name, selector: { text: {} } });
const ucpBool = (name) => ({ name, selector: { boolean: {} } });
const ucpNumber = (name, limits = {}) => ({
  name, selector: { number: { mode: "box", step: "any", ...limits } },
});
const ucpSelect = (name, options) => ({
  name, selector: { select: { mode: "dropdown",
    options: Object.entries(options).map(([value, label]) => ({ value, label })),
  } },
});
// ids: vom Editor aus den HA-Zuständen berechnete Liste der für den Kartentyp sinnvollen Entitäten (hat Vorrang vor der Domain-Liste)
const ucpEntity = (domains, multiple = false, ids) => ({
  name: multiple ? "entities" : "entity",
  required: true,
  selector: { entity: { multiple, ...(ids?.length ? { include_entities: ids } : domains ? { domain: domains } : {}) } },
});

// Welche Entitäten eine Karte als Hauptentität sinnvoll bedienen kann (ergänzt die Domain-Auswahl um Zustand und Attribute)

// Abspielmodi für play_media (enqueue); Music Assistant unterstützt alle vier

// Feature-Flags von MediaPlayerEntityFeature

// Cover bevorzugt über die HA-eigene Adresse (entity_picture_local): gleiche Herkunft, kein CORS, auch wenn die Original-Adresse
// (z. B. der Music-Assistant-Imageproxy auf Port 8095) im Browser nicht erreichbar ist

// Energy Power Flow: Editor-Felder (Entitäten und Listen)

// Aktive Entitäten: Gruppen (Zugehörigkeit, "aktiv"-Bedingung, Farbe, Schalten per Tipp)

const UCP_CARDS = {

  birdnet: {
    label: "BirdNET",
    defaults: { name: "BirdNET", entity: "sensor.birdnet_erkennungen_heute", hm_attribute: "stunden", hm_max_rows: 10, hm_sort: "total", hm_show_values: true, hm_show_legend: true, hm_show_daylight: true, hm_sun_entity: "sun.sun", follow_energy_date: true, hm_subtitle: "Species detections per hour", bn_stats_entity: "sensor.birdnet_statistik", bn_default_tab: "overview", bn_wiki_images: true },
    schema: (c) => [ucpEntity(["sensor"]), { name: "bn_stats_entity", selector: { entity: { domain: ["sensor"] } } },
      ucpSelect("bn_default_tab", { overview: "Overview", analysis: "Analysis summary", species: "Species analysis" }),
      ucpBool("follow_energy_date"),
      ucpGrid(ucpNumber("hm_max_rows", { min: 1, max: 50, step: 1 }), ucpSelect("hm_sort", { total: "By total", name: "By name" })),
      ucpGrid(ucpBool("hm_show_values"), ucpBool("hm_show_legend")),
      ucpGrid(ucpBool("hm_show_daylight"), { name: "hm_sun_entity", selector: { entity: { domain: ["sun"] } } }),
      ucpBool("bn_wiki_images"), ucpText("bn_image_url")],
  },

};

// Style-Presets der Karten; weitere Styles hier eintragen (Schlüssel = Wert von card_style, am Host als data-card-style gesetzt)
// Ohne Preset ("default") reagieren die Karten ausschließlich auf das aktive Home-Assistant-Theme; Preset-CSS steht in UCP_PRESETS.

// Kartentypen, die das horizontale Layout (Name links, Inhalt rechts) unterstützen
// Tap-Actions: Karte, Icon, Name, State (Standard: toggle bei Light und Switch, sonst keine)

// Bereich "Actions": Tap-, Double-Tap- und Hold-Actions (je Karte, Icon, Name, State)

// Gemeinsame Optionen im Bereich "Styling" (für alle Kartentypen)
// px-Felder im Styling-Bereich: reine Zahleneingabe (Textfeld) statt Zahlenfeld mit Mini-Pfeilen

// Karten ohne Zustandswert (Status): Schriftgröße/Farbe/„Status ausblenden“ wären wirkungslos

const ucpGrid = (...schema) => ({ name: "", type: "grid", schema });
const ucpIconField = (name) => ({ name, selector: { icon: {} } });

// Kopfzeilen des Editors (für alle Kartentypen gleich): Name | Icon, Name ausblenden | Icon ausblenden, Status ausblenden | Laufschrift

// Optionen, die im aufklappbaren Bereich "Styling" (Farben, Größen, Schriftgrößen) landen

// Sortiert [token, eintrag]-Paare nach der gespeicherten Reihenfolge (detail_order); nicht gelistete Einträge folgen in Standardreihenfolge

// Winkel (0–360°) → Himmelsrichtung; Texte (z. B. "NW") bleiben unverändert

// Einheit eines Attributs (alle Entitätsklassen): 1) "<attribut>_unit"  2) Einheit laut Attributname/Muster
// (Systemeinheiten aus hass.config.unit_system)  3) Min/Max/Step-Attribute erben die Einheit der Entität

// Temporarily expose only the verified statistics functions.

// Farbwert für alle Farbfelder: gültige CSS-Farbe, var(--…) oder Theme-Variable auch ohne var() ("primary-color", "--primary-color"); sonst ""

// Löst eine (ggf. Theme-)Farbe in [r, g, b] auf, z. B. für Home-Assistant-Dienste

// Standard-Details, die ohne eigene Einstellung ausgeblendet sind (Wert steht schon an anderer Stelle der Karte)
// Farbauswahl der Light-Karte: fünf Farben (Konfiguration light_colors, Hex kommagetrennt); Lampen ohne Farbe nutzen fünf Farbtemperaturen

const UCP_LABELS = {
  bn_wiki_images: "Species images from the internet", bn_stats_entity: "Statistics entity (BirdNET package)", bn_default_tab: "Start tab", bn_image_url: "Image URL (optional)",
   hm_max_rows: "Maximum rows", hm_sort: "Sort rows", hm_show_values: "Show values in the cells", hm_show_legend: "Show legend",   hm_show_daylight: "Show daylight bar", hm_sun_entity: "Sun entity (for the daylight bar)", 

  name: "Name (optional)", 

          title_icon: "Icon", 

   follow_energy_date: "Follow energy date selection",

  ...NB_LABELS,   entity: "Entity", icon: "Icon (optional, e.g. mdi:lightbulb)",

};

const ucpType = () => "birdnet";

function ucpConfig(config) {
  const { title, ...settings } = config;
  const card_type = ucpType(config.card_type);
  const name = config.name ?? title;
  const name_marquee = config.name_marquee ?? ((!!config.marquee));
  const horizontal = config.card_layout === "horizontal" && false;
  const toggleTap = ({});
  return { detail_align: horizontal ? "left" : "center", led_segments: 24, ...toggleTap,
    // Das große Icon in der Mitte gibt es nicht mehr (Schalten über den Status-Text)
    hide_main_icon: true,
    ...(({})),
    ...UCP_CARDS[card_type].defaults, ...settings, title_align: horizontal ? "left" : "center", hide_main_icon: true, name, name_marquee, type: UCP_TYPE, card_type };
}

class UltimateCardEditor extends HTMLElement {
  set hass(hass) {
    ucpSetLang(hass); ucpAttach(this);
    const first = !this._hass;
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    if (first && this._config) this._render();
  }

  setConfig(config) {
    ucpAttach(this);
    this._config = ucpConfig(config);
    this._render();
  }

  _render() {
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (field) => ucpT(UCP_LABELS[field.name] ?? field.name);
      this._form.addEventListener("value-changed", (event) => {
        event.stopPropagation();
        this._change(event.detail.value);
      });
      this.append(this._form);
    }
    const c = this._config;
    this._form.schema = ucpTrSchema([ucpGrid(ucpText("name"), ucpIconField("title_icon")), ...UCP_CARDS.birdnet.schema(c)]);
    this._form.hass = this._hass;
    this._form.data = { ...c };
  }

  _change(value) {
    if (!value) return;
    const next = { ...this._config };
    const fields = (schema) => schema.flatMap((field) => field.schema && !field.name ? fields(field.schema) : [field.name]);
    for (const name of fields(this._form.schema)) {
      const fieldValue = value[name];
      if (fieldValue === undefined || fieldValue === null || fieldValue === "") delete next[name];
      else next[name] = fieldValue;
    }
    this._config = ucpConfig(next);
    this._render();
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
  }
}

// Eigene Styling-Werte (Hintergrund, Rahmen, Schatten) überschreiben Theme und Style-Preset; nur aktiv, wenn ein Wert gesetzt ist
const UCP_CUSTOM_CSS = `
  :host([data-c-bg]) ha-card { background-color: var(--c-bgc) !important; background-image: var(--c-bgi, none) !important; }
  :host([data-c-border]) ha-card { border: var(--c-bw, 1px) var(--c-bs, solid) var(--c-bc, var(--divider-color, currentColor)) !important; }
  :host([data-c-shadow]) ha-card { box-shadow: var(--c-shadow) !important; }
`;

// Hintergrund: Farbe oder Farbverlauf (linear-/radial-/conic-gradient, auch repeating)

// Statusfarben (an/aus) für Karte, Icon, Name und State

// Eigene Styling-Presets (pro HA-Benutzer gespeichert). Zurückgesetzt wird beim Style-Wechsel: Farben, Hintergrund, Rahmen, Schatten, Status-Farben

// Einfacher Dialog (an document.body): liefert { button, value } oder null bei Abbruch

// Status-Stil einer Zusatzinformation: Hintergrund/Schatten je nach an/aus der zugehörigen Entität

// "an" = Entität eingeschaltet/aktiv; Climate: heizt/kühlt, Mediaplayer: spielt, sonst alles außer aus/zu/inaktiv/nicht verfügbar

// Schatten: Größe = Unschärfe in px (Versatz halb so groß), Winkel in Grad (0° = oben, 90° = rechts, 180° = unten), Deckkraft in %

// Setzt die CSS-Variablen am Host und liefert, welche Schalter-Attribute gesetzt werden sollen

// Vorhandenes DOM an neues Markup angleichen, statt es zu ersetzen: Elemente (und ihre CSS-Animationen) bleiben erhalten

const UCP_STYLE = /* css */ `
  ${UCP_CUSTOM_CSS}
  :host { display: block; height: 100%; --u-bg: var(--ha-card-background, var(--card-background-color)); --u-text: var(--primary-text-color); --u-muted: var(--secondary-text-color, var(--u-text)); --u-accent: var(--primary-color, var(--u-text)); --u-second: var(--accent-color, var(--u-accent)); --u-good: var(--success-color, var(--u-accent)); --u-warn: var(--warning-color, var(--u-second)); --u-error: var(--error-color, var(--u-warn)); --u-surface: color-mix(in srgb, var(--u-text) 6%, transparent); --u-edge: var(--divider-color, color-mix(in srgb, var(--u-text) 18%, transparent)); }
  .body { height: 100%; }
  h3 .title-label { display: inline-flex; flex-direction: column; align-items: center; gap: 4px; }
  h3 .title-icon { margin-inline-end: 0; }
  :host([data-layout="horizontal"]) ha-card { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; align-content: center; column-gap: 12px; }
  :host([data-layout="horizontal"]) ha-card > * { grid-column: 1 / -1; }
  :host([data-layout="horizontal"]) ha-card > h3 { grid-column: 1 / 3; margin: 0; text-align: start; }
  :host([data-layout="horizontal"]) ha-card > h3 + .center { grid-column: 3; }
  :host([data-layout="horizontal"]) h3 .title-label { flex-direction: row; gap: 8px; }
  :host([data-layout="horizontal"]) h3 .title-icon { margin-inline-end: 0; }
  :host([data-layout="horizontal"]) ha-card > h3 { display: flex; align-items: center; align-self: center; line-height: 1; min-height: var(--title-icon-size, 25px); }
  :host([data-layout="horizontal"]) h3 .title-label { align-items: center; line-height: 1; }
  :host([data-layout="horizontal"]) h3 .title-icon { display: inline-flex; align-items: center; line-height: 0; }
  :host([data-layout="horizontal"]) ha-card > h3 + .center { align-self: center; align-content: center; margin: 0; }
  ha-card { box-sizing: border-box; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; padding: 15px; overflow: hidden; color: var(--u-text); background: var(--u-bg); border-radius: var(--ha-card-border-radius, 16px); box-shadow: var(--ha-card-box-shadow, none); font-family: var(--primary-font-family, inherit); }
  ha-card > .center { flex: 1 1 auto; align-content: center; }
  h3 { margin: 0 0 14px; font-weight: 500; overflow-wrap: anywhere; }
  .center { display: grid; justify-items: center; gap: 8px; text-align: center; min-width: 0; }
  .muted, .stat dt { color: var(--u-muted); }
  .value { font-weight: 650; font-variant-numeric: tabular-nums; line-height: 1.1; }
  .unit { color: var(--u-muted); }
  .stat { min-width: 0; overflow-wrap: anywhere; }
  .stat dt, .stat dd { margin: 0; }
  .stat dd { font-weight: 600; color: var(--stat-fg, inherit); }
  .stat[style*="--stat-fg"] dt, .stat[style*="--stat-fg"] dt ha-icon { color: var(--stat-fg); }
  .stat dt ha-icon { color: var(--u-accent); --mdc-icon-size: 14px; margin-inline-end: 3px; }
  button, select { font: inherit; color: inherit; }
  button { cursor: pointer; background: var(--u-surface); border: 1px solid var(--u-edge); border-radius: 999px; }
  button:disabled, input:disabled { opacity: .45; cursor: default; }
  button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid var(--u-accent); outline-offset: 3px; }
  button:hover:not(:disabled) { border-color: var(--u-accent); }
  .round { display: inline-grid; place-items: center; }
  .round { width: 36px; height: 36px; color: var(--u-accent); }
  .controls { display: flex; justify-content: center; align-items: center; gap: 7px; flex-wrap: wrap; }
  .range { width: 100%; min-width: 0; accent-color: var(--u-accent); margin: 0; }
  .hm { --hm-c: var(--title-icon-color, var(--u-accent, #3ba7d9)); container-type: inline-size; width: 100%; text-align: start; }
  .hm-sub { font-size: var(--u-font-s, 12px); color: var(--u-text); opacity: .65; margin: -4px 0 12px; }
  .hm-grid { display: grid; grid-template-columns: fit-content(28%) repeat(24, minmax(0, 1fr)); gap: 4px 4px; align-items: center; }
  .hm-hh { font-size: 10px; text-align: center; opacity: .65; color: var(--u-text); }
  .hm-name { display: flex; align-items: center; gap: 8px; min-width: 0; font-size: var(--u-font-s, 12px); font-weight: 500; color: var(--u-text); padding-inline-end: 6px; }
  .hm-nt { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hm-img { width: 26px; height: 26px; border-radius: 6px; object-fit: cover; flex: none; }
  .hm-dl-label { font-weight: 400; opacity: .7; }
  .hm-c { display: grid; place-items: center; height: 26px; border-radius: 5px; min-width: 0; background: color-mix(in srgb, var(--hm-c) calc(var(--lv) * 11.5%), color-mix(in srgb, var(--u-text, #888) 7%, transparent)); }
  .hm-v { font-size: 11px; font-weight: 600; color: var(--u-text); }
  .hm-d { display: grid; place-items: center; height: 22px; border-radius: 5px; min-width: 0; background: #1b1d4a; }
  .hm-d ha-icon { --mdc-icon-size: 14px; color: #fff; }
  .hm-dawn { background: #3a3f8f; }
  .hm-dusk { background: #4a3a85; }
  .hm-rise { background: #ff9f2e; }
  .hm-set { background: #c58be8; }
  .hm-day { background: color-mix(in srgb, #d8c13a calc(35% + var(--dl, 0) * 45%), #4b3d1c); }
  ha-card.hm-card .title-label { display: inline-flex; flex-direction: row; align-items: center; gap: 8px; }
  ha-card.hm-card .title-icon { display: inline-flex; }
  ha-card.hm-card .title-icon ha-icon, ha-card.hm-card .title-icon ha-state-icon { --title-icon-size: 22px; }
  ha-card.hm-light .hm-d { background: #b9b6c8; }
  ha-card.hm-light .hm-dawn, ha-card.hm-light .hm-dusk { background: #e1def8; }
  ha-card.hm-light .hm-rise { background: #ff8c1a; }
  ha-card.hm-light .hm-set { background: #c85fd8; }
  ha-card.hm-light .hm-day { background: color-mix(in srgb, #ffcf4d calc(30% + var(--dl, 0) * 60%), #fff3b8); }
  .bn { container-type: inline-size; width: 100%; text-align: start; color: var(--u-text); --hm-c: var(--title-icon-color, var(--u-accent, #3ba7d9)); }
  .bn-tabs { display: flex; gap: 2px; border-bottom: 1px solid color-mix(in srgb, var(--u-text, #888) 18%, transparent); margin-bottom: 14px; overflow-x: auto; }
  .bn-tab { appearance: none; background: none; border: 0; border-bottom: 2px solid transparent; color: var(--u-text); opacity: .65; font: inherit; font-size: var(--u-font-s, 13px); padding: 8px 12px; cursor: pointer; white-space: nowrap; border-radius: 0; }
  .bn-tab.on { opacity: 1; font-weight: 600; border-bottom-color: var(--hm-c); }
  .bn-range { display: flex; align-items: center; gap: 6px; font-size: var(--u-font-s, 12px); opacity: .7; margin: -6px 0 10px; --mdc-icon-size: 16px; }
  .bn-h { display: flex; flex-direction: column; margin-bottom: 8px; }
  .bn-h b { font-size: var(--u-font-m, 14px); font-weight: 600; }
  .bn-h span { font-size: var(--u-font-s, 12px); opacity: .65; }
  .bn-sec { margin-top: 16px; }
  .bn-quiet { text-align: center; opacity: .6; font-size: var(--u-font-s, 12px); padding: 14px 0; }
  .bn-box { border: 1px solid color-mix(in srgb, var(--u-text, #888) 14%, transparent); border-radius: 10px; padding: 12px; margin-top: 12px; min-width: 0; }
  .bn-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  .bn-kpis2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bn-kpi { display: flex; flex-direction: column; border: 1px solid color-mix(in srgb, var(--u-text, #888) 14%, transparent); border-radius: 10px; padding: 10px 12px; min-width: 0; }
  .bn-kpi b { font-size: 22px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bn-kl, .bn-ks { font-size: var(--u-font-s, 12px); opacity: .65; }
  .bn-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 12px; }
  .bn-bar { display: grid; grid-template-columns: minmax(70px, 28%) 1fr auto; align-items: center; gap: 8px; margin: 5px 0; font-size: var(--u-font-s, 12px); }
  .bn-bar i { display: block; height: 16px; border-radius: 4px; }
  .bn-bar em { font-style: normal; opacity: .7; }
  .bn-bl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: end; }
  .bn-cols { display: flex; align-items: flex-end; gap: 10px; height: 130px; }
  .bn-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 4px; font-size: 11px; }
  .bn-col i { display: block; width: 100%; border-radius: 4px 4px 0 0; }
  .bn-col em { font-style: normal; opacity: .7; }
  .bn-col span { opacity: .7; }
  .bn-trend { width: 100%; height: 120px; display: block; }
  .bn-axis { display: flex; justify-content: space-between; font-size: 11px; opacity: .6; }
  .bn-sel, .bn-q input { font: inherit; font-size: var(--u-font-s, 12px); color: var(--u-text); background: transparent; border: 1px solid color-mix(in srgb, var(--u-text, #888) 25%, transparent); border-radius: 8px; padding: 6px 8px; min-width: 0; }
  .bn-sel option { color: #222; }
  .bn-tbl { width: 100%; border-collapse: collapse; font-size: var(--u-font-s, 12px); }
  .bn-tbl th { text-align: start; font-weight: 600; opacity: .75; padding: 6px 6px; }
  .bn-tbl td { padding: 6px; border-top: 1px solid color-mix(in srgb, var(--u-text, #888) 12%, transparent); vertical-align: middle; }
  .bn-cbar { display: inline-block; width: 60px; height: 8px; border-radius: 4px; background: color-mix(in srgb, var(--u-text, #888) 14%, transparent); vertical-align: middle; overflow: hidden; }
  .bn-cbar i { display: block; height: 100%; }
  .bn-pic { position: relative; display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 6px; overflow: hidden; flex: none; background: color-mix(in srgb, var(--hm-c) 22%, transparent); }
  a.bn-pic { color: inherit; text-decoration: none; cursor: pointer; }
  a.bn-pic:hover img, a.bn-pic:hover .bn-ph { filter: brightness(1.12); }
  .bn-ph { font-size: 12px; font-weight: 600; }
  .bn-pic img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .bn-spl { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
  .bn-spn { display: flex; flex-direction: column; min-width: 0; }
  .bn-spn b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bn-spn small, .bn-ai small { opacity: .65; font-size: 11px; }
  .bn-nm { display: flex; align-items: center; gap: 4px; min-width: 0; }
  .bn-star { --mdc-icon-size: 14px; color: #f0a030; }
  .bn-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px; }
  .bn-sp { display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 1px solid color-mix(in srgb, var(--u-text, #888) 14%, transparent); border-left: 3px solid #f0a030; border-radius: 8px; padding: 8px 10px; min-width: 0; font-size: var(--u-font-s, 12px); }
  .bn-sp .bn-spl { flex: 1; }
  .bn-live { border-left-color: #2fb86a; justify-content: flex-start; }
  .bn-badge { background: #2fb86a; color: #06240f; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
  .bn-filter { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
  .bn-filter label { display: flex; flex-direction: column; gap: 4px; font-size: var(--u-font-s, 12px); }
  .bn-q { flex: 1; min-width: 140px; }
  .bn-q input { width: 100%; box-sizing: border-box; }
  .bn-views { display: inline-flex; gap: 4px; margin-inline-start: auto; }
  .bn-views button { appearance: none; border: 1px solid color-mix(in srgb, var(--u-text, #888) 25%, transparent); background: transparent; color: var(--u-text); border-radius: 8px; width: 34px; height: 32px; cursor: pointer; display: grid; place-items: center; --mdc-icon-size: 18px; }
  .bn-views button.on { background: color-mix(in srgb, var(--hm-c) 22%, transparent); border-color: var(--hm-c); }
  .bn-arts { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
  .bn-art { display: flex; flex-direction: column; gap: 8px; border-radius: 10px; padding: 10px; background: color-mix(in srgb, var(--u-text, #888) 6%, transparent); min-width: 0; }
  .bn-art .bn-pic { width: 100%; height: 110px; border-radius: 8px; }
  .bn-art .bn-ph { font-size: 32px; }
  .bn-ai b { display: block; font-weight: 600; }
  .bn-ai small { display: block; font-style: italic; margin-bottom: 6px; }
  .bn-ai dl { display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; margin: 0; font-size: 11px; }
  .bn-ai dt { opacity: .65; }
  .bn-ai dd { margin: 0; font-weight: 600; text-align: end; }
  .bn-list { grid-template-columns: 1fr; }
  .bn-list .bn-art { flex-direction: row; align-items: center; }
  .bn-list .bn-art .bn-pic { width: 44px; height: 44px; }
  .bn-list .bn-ai { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 0 12px; }
  .bn-list .bn-ai small { margin: 0; grid-column: 1; }
  .bn-list .bn-ai dl { grid-column: 2; grid-row: 1 / span 2; display: flex; gap: 12px; }
  .bn-list .bn-ai dt { display: none; }
  @container (max-width: 520px) {
  .bn-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bn-two { grid-template-columns: 1fr; }
  .bn-tbl th:nth-child(4), .bn-tbl td:nth-child(4) { display: none; }
  }
  ha-card.hm-light .bn-sp { background: transparent; }
  .hm-legend { display: flex; align-items: center; justify-content: flex-end; gap: 3px; margin-top: 10px; font-size: 11px; color: var(--u-text); opacity: .75; }
  .hm-legend i { width: 10px; height: 10px; border-radius: 2px; background: color-mix(in srgb, var(--hm-c) calc(var(--lv) * 11.5%), color-mix(in srgb, var(--u-text, #888) 7%, transparent)); }
  .hm-legend span:first-child { margin-inline-end: 3px; }
  .hm-legend span:last-child { margin-inline-start: 3px; }
  @container (max-width: 480px) {
  .hm-x { visibility: hidden; }
  .hm-v { display: none; }
  .hm-grid { gap: 3px 2px; }
  .hm-c { height: 18px; border-radius: 3px; }
  .hm-d { height: 16px; }
  .hm-img { display: none; }
  }
  .al-empty { width: 100%; font-size: var(--u-font-m, 14px); color: var(--u-text); opacity: .75; padding: 4px 0; }
  .range.vertical { writing-mode: vertical-lr; direction: rtl; width: 28px; height: 96px; }
  .progress { width: min(100%, 280px); height: 3px; border-radius: 4px; overflow: hidden; background: var(--u-edge); }
  .progress span { display: block; height: 100%; width: var(--level); background: var(--u-accent); }
  .round.on { color: var(--u-second); border-color: var(--u-second); }
  .forecast { display: flex; justify-content: center; flex-wrap: wrap; gap: 2px; margin: 12px -8px 0; }
  .forecast > div { flex: 1 1 46px; min-width: 46px; padding: 5px 3px; border: 1px solid var(--u-edge); border-radius: 9px; display: grid; justify-items: center; gap: 3px; }
  .forecast > div > span { white-space: nowrap; }
  .forecast ha-icon { --mdc-icon-size: var(--fc-icon, 19px); color: var(--fc-icon-color, var(--u-accent)); }
  .chart { display: block; width: 100%; height: 100%; grid-column: 2; }
  .chart .grid { stroke: var(--u-edge); }
  .status .value { overflow-wrap: anywhere; }
  .status .value { font-size: var(--state-font-size, inherit); }
  select { border-radius: 8px; border: 1px solid var(--u-edge); background: var(--u-bg); padding: 4px; max-width: 100%; }
  :host { --u-font-m: var(--ha-font-size-m, var(--paper-font-body1_-_font-size, inherit)); --u-font-s: var(--ha-font-size-s, var(--u-font-m)); --u-font-l: var(--ha-font-size-l, var(--u-font-m)); --u-font-xl: var(--ha-font-size-xl, var(--u-font-l)); --u-font-xxl: var(--ha-font-size-2xl, var(--u-font-xl)); }
  ha-card { font-size: var(--u-font-m); }
  h3 { font-size: var(--title-font-size, var(--u-font-m)); text-align: var(--title-align, left); color: var(--title-color, inherit); }
  .value { font-size: var(--u-font-xl); }
  .unit, .muted { font-size: var(--u-font-s); }
  .stat dt { font-size: var(--clock-detail-font-size, var(--ha-ultimate-card-detail-title-font-size, var(--u-font-s))); }
  .stat dd { font-size: var(--clock-detail-font-size, var(--ha-ultimate-card-detail-info-font-size, var(--u-font-s))); }
  .stat { text-align: var(--detail-align, left); }
  .forecast > div { font-size: var(--fc-font, var(--u-font-s)); }
  .title-label { display: inline-block; max-width: 100%; }
  .title-icon { display: inline-flex; vertical-align: middle; margin-inline-end: 5px; }
  .title-icon ha-icon, .title-icon ha-state-icon { --mdc-icon-size: var(--title-icon-size, 25px); color: var(--title-icon-color, var(--u-accent)); }
`;

const ucpEscape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const ucpTitleIcon = (name) => {
  const icon = typeof name === "string" ? name.trim() : "";
  return icon ? '<ha-icon data-title-icon="' + ucpEscape(icon.includes(":") ? icon.replace(/\s*:\s*/, ":") : "mdi:" + icon) + '" aria-hidden="true"></ha-icon>' : "";
};
function ucpBindTitleIcons(container) {
  container.querySelectorAll?.("[data-title-icon]").forEach((element) => {
    const icon = element.dataset.titleIcon;
    element.setAttribute("icon", icon);
    if (customElements.get("ha-icon")) element.icon = icon;
    else customElements.whenDefined?.("ha-icon").then(() => { if (element.isConnected) element.icon = icon; });
  });
}

// BirdNET: Artbilder und Artikel von Wikipedia (https), einmal geladen und im Browser gemerkt: Schlüssel -> { img, page }
const UCP_BN_IMG = new Map();
try { for (const [k, v] of Object.entries(JSON.parse(localStorage.getItem("ucp-bn-img-v2") || "{}"))) if (v?.img) UCP_BN_IMG.set(k, v); } catch { /* ohne Speicher weiter */ }
const UCP_BN_STATE = new Map();
let ucpBnChain = Promise.resolve();
const ucpBnQueue = (job) => { const run = ucpBnChain.then(job, job); ucpBnChain = run.then(() => new Promise((r) => setTimeout(r, 250))); return run; };

class UltimateCardPackage extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>${UCP_STYLE}</style><div class="body"></div>`;
    this._body = this.shadowRoot.querySelector(".body");
    this._body.addEventListener("click", ({ target }) => {
      if (target.closest?.("a[data-bn-link]")) return;
      const bnTab = target.closest?.("[data-bn-tab]");
      if (bnTab) { this._bnTab = Number(bnTab.dataset.bnTab); this._render(); return; }
      const bnView = target.closest?.("[data-bn-view]");
      if (bnView) { this._bnView = bnView.dataset.bnView; this._render(); }
    });
    this._body.addEventListener("input", ({ target }) => {
      if (!target.matches?.("[data-bn-q]")) return;
      this._bnQuery = target.value;
      this._render();
    });
    this._body.addEventListener("change", ({ target }) => {
      if (target.matches?.("[data-bn-sort]")) { this._bnSort = target.value; this._render(); }
    });
  }

  static getConfigElement() { return document.createElement(UCP_EDITOR); }
  static getStubConfig() { return ucpConfig({}); }
  getCardSize() { return 8; }
  // Standardgröße im Sections-View: [Spalten, Zeilen]; Zeilen sind bewusst knapp (Zeile = 56 px + 8 px Abstand) und per Drag änderbar
  
  getGridOptions() { return { columns: 12, rows: 8, min_columns: 3, min_rows: 1 }; }
  // Hintergrund/Rahmen/Schatten: Variablen am Host (erben in innere Karten), Schalter-Attribute auch an Balken-/Energie-Karte
  // Wirksame Farben: Statusfarbe (an/aus) hat Vorrang vor der normalen Farbe; Änderungen nur bei Statuswechsel neu anwenden

  get _state() { return this._hass?.states?.[this._config?.entity]; }
  get _attrs() { return this._state?.attributes ?? {}; }

  setConfig(config) {
    this._stopData();
    this._config = ucpConfig(config);
    this._markup = null;
    this._render();
    this._startData();
  }

  set hass(hass) {
    ucpSetLang(hass); ucpAttach(this);
    if (this._hass?.connection !== hass?.connection) this._stopData();
    this._hass = hass;
    this._startData();
    this._render();
  }

  // Icon neben dem Namen: eigenes Icon, sonst das Icon der Entität (dynamisch, z. B. Batteriestand oder Wetterzustand)
  _titleIcon() {
    const c = this._config;
    if (c.title_icon) return ucpTitleIcon(c.title_icon);
    return c.entity && this._hass?.states?.[c.entity] ? '<ha-state-icon data-state-icon="' + ucpEscape(c.entity) + '" aria-hidden="true"></ha-state-icon>' : "";
  }

  // Elemente mit eigener Funktion lösen keine Tap-Action aus

  // Aktion einer Zone (Icon, Name, State); ist dafür nichts gesetzt, gilt die Aktion der Karte (ausdrücklich "none" bleibt "none")

  // Einfach- und Doppeltippen (Doppeltippen nur wartend, wenn dafür eine Aktion gesetzt ist)

  // Aktion ausführen (zone: card | icon | name | state; kind: tap | double | hold)

  // Popup: Abschnitt (Überschrift = Name) eines Popup-Dashboards als Dialog anzeigen.
  // Aufruf über die Aktion "Navigate" mit navigation_path "popup:<Abschnitt>" oder "popup:<Dashboard>::<Abschnitt>".

  _bindStateIcons(root = this._body) {
    root.querySelectorAll("[data-state-icon]").forEach((element) => {
      const state = this._hass?.states?.[element.dataset.stateIcon];
      if (!state) return;
      if (customElements.get("ha-state-icon")) {
        element.hass = this._hass;
        element.stateObj = state;
      } else if (state.attributes?.icon) {
        const icon = document.createElement("ha-icon");
        icon.setAttribute("icon", state.attributes.icon);
        icon.setAttribute("aria-hidden", "true");
        element.replaceWith(icon);
      }
    });
  }

  connectedCallback() { this._startData(); this._render(); }
  disconnectedCallback() { this._stopData(); }

  // Wert eines Attributs (mit Einheit, Datumsformat, Windrichtung als Himmelsrichtung)

  _render() {
    const c = this._config;
    if (!c) return;
    const content = c.entity ? this._birdnet() : `<div class="muted">${"Please select an entity."}</div>`;
    const titleIcon = this._titleIcon();
    const titleText = c.name || ucpT(UCP_CARDS.birdnet.label);
    const markup = `<ha-card class="hm-card" style="--title-align:left">${titleText || titleIcon ? `<h3><span class="title-label">${titleIcon ? `<span class="title-icon">${titleIcon}</span>` : ""}${ucpEscape(titleText)}</span></h3>` : ""}${content}</ha-card>`;
    const active = this.shadowRoot.activeElement;
    if (markup === this._markup || active?.matches("input:active")) return;
    const bnCaret = active?.hasAttribute?.("data-bn-q") ? active.selectionStart : null;
    this._body.innerHTML = markup;
    ucpBindTitleIcons(this._body);
    this._bindStateIcons();
    this._markup = markup;
    this._hmTheme();
    if (bnCaret != null) { const q = this._body.querySelector("[data-bn-q]"); q?.focus({ preventScroll: true }); q?.setSelectionRange?.(bnCaret, bnCaret); }
  }

  // DWD: Laufschrift für zu breite Zeilen (vertikales Layout) und Popover für aufgeklappte Beschreibungen

  // WashData: zugehörige Entitäten werden über den Gerätenamen (friendly_name-Präfix) und die Rollenbezeichnung gefunden

  // Pi-hole: Entitäten werden über das friendly_name-Präfix und die Rollenbezeichnung (deutsch/englisch) gefunden

  // DWD-Wetterwarnungen: Sensoren der Integration „Deutscher Wetterdienst (DWD) Weather Warnings"

  // Heller Karten-Hintergrund (dunkle Schrift): helle Tageslicht-Farben
  _hmTheme() {
    const card = this._body.querySelector("ha-card.hm-card");
    if (!card) return;
    const m = /rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/.exec(getComputedStyle(card).color || "");
    card.classList.toggle("hm-light", !!m && (0.299 * m[1] + 0.587 * m[2] + 0.114 * m[3]) < 140);
  }

  // Heatmap: Zeilen (Name) x 24 Stunden aus einem Attribut {Name: [24 Werte]}, Zellfarbe nach Anzahl
  _heatmap() {
    const c = this._config;
    const raw = this._attrs[c.hm_attribute || "stunden"];
    const period = this._energyPeriod();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const includesToday = !period || (period.selectedEnd ?? Infinity) >= todayStart;
    const live = includesToday && raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const map = {};
    for (const source of [live, this._hmPast?.map ?? {}]) for (const [name, values] of Object.entries(source)) {
      const sum = map[name] ??= Array(24).fill(0);
      if (Array.isArray(values)) for (let i = 0; i < 24; i++) sum[i] += Number(values[i]) || 0;
    }
    const lang = this._hass?.locale?.language;
    let rows = Object.entries(map).map(([name, v]) => {
      const a = Array.from({ length: 24 }, (_, i) => Math.max(0, Number(Array.isArray(v) ? v[i] : 0) || 0));
      return { name, a, total: a.reduce((x, y) => x + y, 0) };
    }).filter((r) => r.total > 0);
    rows.sort(c.hm_sort === "name" ? (a, b) => a.name.localeCompare(b.name, lang) : (a, b) => b.total - a.total || a.name.localeCompare(b.name, lang));
    rows = rows.slice(0, Math.max(1, Number(c.hm_max_rows) || 10));
    if (!rows.length) return `<div class="al-empty">${ucpEscape(c.hm_empty_text || ucpT("No data yet"))}</div>`;
    const max = Math.max(1, ...rows.flatMap((r) => r.a));
    const level = (n) => n <= 0 ? 0 : Math.max(1, Math.ceil(n / max * 8));
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
    // Tageslicht aus der Sonnen-Entität: Aufgangs-/Untergangsstunde, dazwischen Tag, davor/danach Dämmerung und Nacht
    const sun = c.hm_show_daylight !== false ? this._hass?.states?.[c.hm_sun_entity || "sun.sun"] : null;
    const hourOf = (v) => { const d = v ? new Date(v) : null; return d && !Number.isNaN(+d) ? d.getHours() : null; };
    const rise = hourOf(sun?.attributes?.next_rising), set = hourOf(sun?.attributes?.next_setting);
    let daylight = "";
    if (rise != null && set != null && set > rise) {
      const cells = hours.map((h, i) => {
        let kind = "night", extra = "";
        if (i === rise) kind = "rise"; else if (i === set) kind = "set";
        else if (i > rise && i < set) { kind = "day"; extra = `--dl:${Math.sin(Math.PI * (i - rise) / (set - rise)).toFixed(2)}`; }
        else if (i >= rise - 2 && i < rise) kind = "dawn"; else if (i > set && i <= set + 2) kind = "dusk";
        const icon = kind === "rise" ? "mdi:weather-sunset-up" : kind === "set" ? "mdi:weather-sunset-down" : "";
        return `<span class="hm-d hm-${kind}" style="${extra}" title="${ucpEscape(h + ":00")}">${icon ? `<ha-icon icon="${icon}"></ha-icon>` : ""}</span>`;
      }).join("");
      daylight = `<span class="hm-name hm-dl-label">${ucpEscape(ucpT("Daylight"))}</span>${cells}`;
    }
    const head = `<span></span>${hours.map((h, i) => `<span class="hm-hh${i % 3 ? " hm-x" : ""}">${h}</span>`).join("")}`;
    const img = (name) => c.hm_image_url ? `<img class="hm-img" src="${ucpEscape(String(c.hm_image_url).replace("{name}", encodeURIComponent(name)))}" alt="" loading="lazy" onerror="this.remove()">` : "";
    const body = rows.map((r) => `<span class="hm-name" title="${ucpEscape(r.name)}">${img(r.name)}<span class="hm-nt">${ucpEscape(r.name)}</span></span>${r.a.map((n, i) =>
      `<span class="hm-c" style="--lv:${level(n)}" title="${ucpEscape(`${r.name}: ` + ucpT(n === 1 ? "{n} detection at {h}:00" : "{n} detections at {h}:00").replace("{n}", n).replace("{h}", hours[i]))}">${n > 0 && c.hm_show_values !== false ? `<b class="hm-v">${n}</b>` : ""}</span>`).join("")}`).join("");
    const legend = c.hm_show_legend === false ? "" : `<div class="hm-legend"><span>${ucpEscape(ucpT("Less"))}</span>${Array.from({ length: 9 }, (_, i) => `<i style="--lv:${i}"></i>`).join("")}<span>${ucpEscape(ucpT("More"))}</span></div>`;
    const sub = c.hm_subtitle ? `<div class="hm-sub">${ucpEscape(ucpT(c.hm_subtitle))}</div>` : "";
    return `<div class="hm">${sub}<div class="hm-grid">${daylight}${head}${body}</div>${legend}</div>`;
  }

  // Zeitraum der Karte: ohne Energie-Datumsauswahl die Gesamtstatistik, sonst Summe der Tageswerte aus der Historie
  _bnAgg() {
    const d = this._bnData();
    const period = this._energyPeriod();
    const lang = this._hass?.locale?.language;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const key = (t) => { const x = new Date(t); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
    const out = { mode: "all", species: {}, part: {}, perDay: [], total: 0, log: d.log, caption: ucpT("All time"), wiss: {}, ok: d.ok };
    for (const [name, s] of Object.entries(d.species)) out.wiss[name] = s.wiss || "";
    if (!period) {
      for (const [name, s] of Object.entries(d.species)) out.species[name] = { n: +s.n || 0, sum: +s.sum || 0, max: +s.max || 0, first: +s.first || 0, last: +s.last || +s.first || 0, wiss: s.wiss || "" };
      out.part = d.part; out.total = d.total;
      for (let i = 29; i >= 0; i--) { const t = new Date(todayStart); t.setDate(t.getDate() - i); out.perDay.push({ label: key(t).slice(5), n: Number(d.days[key(t)]) || 0 }); }
      return out;
    }
    out.mode = "range";
    const endMs = Math.min(period.selectedEnd ?? Infinity, todayStart + 86400000);
    const days = [...(this._hmPast?.days ?? [])];
    if ((period.selectedEnd ?? Infinity) >= todayStart) days.push({ ts: todayStart, arten: this._attrs.arten, konf: this._attrs.konf, zeit: this._attrs.zeit });
    const perDay = new Map();
    const obj = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
    for (const day of days) {
      let n = 0;
      for (const [name, k] of Object.entries(obj(day.arten))) {
        const sp = out.species[name] ??= { n: 0, sum: 0, max: 0, first: +d.species[name]?.first || 0, last: 0, wiss: d.species[name]?.wiss || "" };
        sp.n += +k || 0; n += +k || 0;
        const o = obj(day.konf)[name];
        if (Array.isArray(o)) { sp.sum += +o[0] || 0; sp.max = Math.max(sp.max, +o[1] || 0); sp.last = Math.max(sp.last, +o[2] || 0); }
      }
      for (const [k, v] of Object.entries(obj(day.zeit))) out.part[k] = (out.part[k] || 0) + (+v || 0);
      perDay.set(key(day.ts), (perDay.get(key(day.ts)) || 0) + n);
    }
    for (const [name, sp] of Object.entries(out.species)) {
      const all = d.species[name];
      if (!all) continue;
      if (!sp.sum && +all.n) { sp.sum = (+all.sum / +all.n) * sp.n; sp.max = +all.max || 0; }
      if (!sp.last) sp.last = +all.last || +all.first || 0;
    }
    out.total = [...perDay.values()].reduce((x, y) => x + y, 0);
    const from = Math.max(period.start, todayStart - 365 * 86400000);
    for (let t = new Date(from).setHours(0, 0, 0, 0); t < endMs; t += 86400000) {
      const x = new Date(t); const k = key(x);
      out.perDay.push({ label: `${String(x.getDate()).padStart(2, "0")}.${String(x.getMonth() + 1).padStart(2, "0")}.`, n: perDay.get(k) || 0 });
    }
    out.log = d.log.filter((e) => e.ts * 1000 >= period.start && e.ts * 1000 < endMs);
    const f = (t) => new Date(t).toLocaleDateString(lang, { day: "2-digit", month: "2-digit", year: "numeric" });
    out.caption = endMs - period.start <= 86400000 ? f(period.start) : `${f(period.start)} – ${f(endMs - 1)}`;
    return out;
  }

  // BirdNET: drei Tabs (Übersicht, Analysen – Zusammenfassung, Arten – Analysen) auf Basis des Packages birdnet_auswertung
  _bnData() {
    const c = this._config;
    const obj = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
    const stat = this._hass?.states?.[c.bn_stats_entity || "sensor.birdnet_statistik"];
    const a = stat?.attributes ?? {};
    return { species: obj(a.arten_gesamt), log: Array.isArray(a.verlauf) ? a.verlauf : [], days: obj(a.tage), part: obj(a.tageszeit), total: Number(stat?.state) || 0, ok: !!stat };
  }

  _bnWiki(sci, name) {
    // lateinischer Name: englische Wikipedia; deutscher Artname: deutsche Wikipedia, erst „Name (Art)“, dann „Name“
    // Anfragen laufen nacheinander (Wikipedia bremst viele gleichzeitige Anfragen aus); bei Fehlern wird später erneut versucht
    const term = String(sci || name || "").trim();
    if (!term) return {};
    const key = sci ? term : `de:${term}`;
    const hit = UCP_BN_IMG.get(key);
    if (hit?.img) return hit;
    const st = UCP_BN_STATE.get(key) || { n: 0, at: 0, busy: false };
    if (st.busy || st.n >= 6 || Date.now() < st.at) return {};
    st.busy = true;
    UCP_BN_STATE.set(key, st);
    const cands = sci ? [["en", term]] : [["de", `${term} (Art)`], ["de", term]];
    const next = async (i, transient) => {
      if (i >= cands.length) return { res: null, transient };
      const [lg, t] = cands[i];
      try {
        const r = await fetch(`https://${lg}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g, "_"))}`);
        if (r.ok) {
          const j = await r.json();
          const img = j?.thumbnail?.source;
          if (j?.type !== "disambiguation" && img && String(img).startsWith("https://")) return { res: { img, page: j?.content_urls?.desktop?.page } };
        } else if (r.status === 429 || r.status >= 500) transient = true;
      } catch { transient = true; }
      return next(i + 1, transient);
    };
    ucpBnQueue(() => next(0, false)).then(({ res, transient }) => {
      st.busy = false;
      if (!res) {
        // Kein Bild gefunden: endgültig; Fehler/Begrenzung: später erneut (4 s, 8 s, 16 s …)
        st.n = transient ? st.n + 1 : 99;
        if (transient) { st.at = Date.now() + Math.min(60000, 4000 * 2 ** st.n); setTimeout(() => { if (this.isConnected) this._render(); }, st.at - Date.now() + 50); }
        return;
      }
      UCP_BN_IMG.set(key, res);
      try { localStorage.setItem("ucp-bn-img-v2", JSON.stringify(Object.fromEntries([...UCP_BN_IMG].filter(([, v]) => v?.img)))); } catch { /* ohne Speicher weiter */ }
      this._render();
    });
    return {};
  }

  _bnPic(name, sci) {
    const c = this._config;
    const wiki = c.bn_wiki_images !== false ? this._bnWiki(sci, name) : {};
    const url = c.bn_image_url ? String(c.bn_image_url).replace("{name}", encodeURIComponent(name)).replace("{sci}", encodeURIComponent(sci || name)) : wiki.img || "";
    const term = String(sci || name).trim().replace(/ /g, "_");
    const hl = String(this._hass?.locale?.language || this._hass?.language || "en").split("-")[0].toLowerCase();
    const guess = `https://${sci ? (/^[a-z]{2,3}$/.test(hl) ? hl : "en") : "de"}.wikipedia.org/wiki/${encodeURIComponent(term)}`;
    const page = sci ? guess : /^https:\/\/de\.wikipedia\.org\//.test(wiki.page || "") ? wiki.page : guess;
    return `<a class="bn-pic" href="${ucpEscape(page)}" target="_blank" rel="noopener noreferrer" data-bn-link title="${ucpEscape(name)} – Wikipedia"><span class="bn-ph">${ucpEscape(String(name).charAt(0).toUpperCase())}</span>${url ? `<img src="${ucpEscape(url)}" alt="" loading="lazy" onerror="this.remove()">` : ""}</a>`;
  }

  _birdnet() {
    const c = this._config;
    const lang = this._hass?.locale?.language;
    const tab = [0, 1, 2].includes(this._bnTab) ? this._bnTab : Math.max(0, ["overview", "analysis", "species"].indexOf(c.bn_default_tab));
    const d = this._bnAgg();
    const fmtDate = (ts, time = true) => new Date(ts * 1000).toLocaleString(lang, time ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "2-digit", year: "numeric" });
    const colors = ["#7aa7f7", "#6fd1b0", "#f6c66f", "#f08fc0", "#b79cf0", "#f2927c", "#8fd35f", "#5fc9e0", "#e6b0e0", "#b3b3b3"];
    const kpi = (label, value, sub = "") => `<div class="bn-kpi"><span class="bn-kl">${ucpEscape(ucpT(label))}</span><b>${ucpEscape(String(value))}</b>${sub ? `<span class="bn-ks">${ucpEscape(sub)}</span>` : ""}</div>`;
    const names = Object.keys(d.species).filter((n) => d.species[n].n > 0);
    const sumN = names.reduce((s, n) => s + (Number(d.species[n].n) || 0), 0);
    const sumC = names.reduce((s, n) => s + (Number(d.species[n].sum) || 0), 0);
    const sumNC = names.reduce((s, n) => s + (Number(d.species[n].sum) ? Number(d.species[n].n) || 0 : 0), 0);
    const avg = sumNC ? (sumC / sumNC).toFixed(1).replace(".", lang?.startsWith("de") ? "," : ".") + " %" : "–";
    const tabs = ["Overview", "Analysis summary", "Species analysis"];
    const bar = `<div class="bn-tabs" role="tablist">${tabs.map((t, i) => `<button type="button" role="tab" class="bn-tab${i === tab ? " on" : ""}" aria-selected="${i === tab}" data-bn-tab="${i}">${ucpEscape(ucpT(t))}</button>`).join("")}</div>`;
    const head = (title, sub) => `<div class="bn-h"><b>${ucpEscape(ucpT(title))}</b>${sub ? `<span>${ucpEscape(ucpT(sub))}</span>` : ""}</div>`;
    const today0 = new Date().setHours(0, 0, 0, 0) / 1000;
    let pane = "";
    if (!d.ok && tab !== 0) return `<div class="bn">${bar}<div class="al-empty">${ucpEscape(ucpT("No data yet"))}</div></div>`;
    if (tab === 0) {
      const last = d.log[0];
      const heard = last && Date.now() / 1000 - last.ts < 60;
      const todayMap = this._attrs.arten && typeof this._attrs.arten === "object" ? this._attrs.arten : {};
      const maxToday = {};
      for (const e of d.log) if (e.ts >= today0) maxToday[e.art] = Math.max(maxToday[e.art] ?? 0, Number(e.konf) || 0);
      const konfToday = this._attrs.konf && typeof this._attrs.konf === "object" ? this._attrs.konf : {};
      for (const [n, o] of Object.entries(konfToday)) if (Array.isArray(o) && +o[1]) maxToday[n] = Math.max(maxToday[n] ?? 0, +o[1]);
      for (const n of Object.keys(todayMap)) if (!maxToday[n] && +d.species[n]?.max) maxToday[n] = +d.species[n].max;
      const cards = Object.entries(todayMap).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0], lang)).map(([n, k]) => {
        const s = d.species[n], isNew = s && s.first >= today0;
        return `<div class="bn-sp"><span class="bn-spl">${this._bnPic(n, s?.wiss)}<span class="bn-spn"><span class="bn-nm"><b>${ucpEscape(n)}</b>${isNew ? `<ha-icon icon="mdi:star" class="bn-star"></ha-icon>` : ""}</span><small>${ucpEscape(ucpT(k === 1 ? "{n} detection" : "{n} detections").replace("{n}", k))}</small></span></span>${maxToday[n] ? `<span class="bn-badge">${ucpEscape(ucpT("Max."))} ${Math.round(maxToday[n])} %</span>` : ""}</div>`;
      }).join("");
      pane = `${head("Daily activity", "")}${this._heatmap()}
        <div class="bn-sec">${head("Just heard", "Species are identified in real time")}${heard ? `<div class="bn-sp bn-live">${this._bnPic(last.art, last.wiss)}<span class="bn-spn"><b>${ucpEscape(last.art)}</b><small>${ucpEscape(Math.round(last.konf) + " %")}</small></span></div>` : `<div class="bn-quiet">${ucpEscape(ucpT("All quiet – no birds detected right now"))}</div>`}</div>
        <div class="bn-sec">${head("New and returning species", "First detections and recently returned species")}${cards ? `<div class="bn-grid">${cards}</div>` : `<div class="bn-quiet">${ucpEscape(ucpT("No data yet"))}</div>`}</div>`;
    } else if (tab === 1) {
      const top = names.map((n) => [n, Number(d.species[n].n) || 0]).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0], lang)).slice(0, 10);
      const topMax = Math.max(1, ...top.map((t) => t[1]));
      const partKeys = [["nacht", "Night"], ["morgen", "Morning"], ["tag", "Day"], ["abend", "Evening"]];
      const partMax = Math.max(1, ...partKeys.map(([k]) => Number(d.part[k]) || 0));
      const vals = d.perDay.map((p) => p.n);
      const vMax = Math.max(1, ...vals);
      const W = 600, H = 120, px = (i) => 10 + i * (W - 20) / Math.max(1, vals.length - 1), py = (v) => H - 8 - v / vMax * (H - 20);
      const trend = `<svg class="bn-trend" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img"><polyline fill="none" stroke="var(--hm-c)" stroke-width="2" vector-effect="non-scaling-stroke" points="${vals.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ")}"/>${vals.map((v, i) => v ? `<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="3" fill="var(--hm-c)"/>` : "").join("")}</svg><div class="bn-axis"><span>${ucpEscape(d.perDay[0]?.label ?? "")}</span><span>${ucpEscape(d.perDay.at(-1)?.label ?? "")}</span></div>`;
      const rows = d.log.slice(0, 8).map((e) => {
        const h = new Date(e.ts * 1000).getHours();
        const p = h >= 5 && h < 11 ? "Morning" : h >= 11 && h < 17 ? "Day" : h >= 17 && h < 21 ? "Evening" : "Night";
        const col = e.konf >= 85 ? "#2fb86a" : e.konf >= 75 ? "#f0a030" : "#e0603a";
        return `<tr><td>${ucpEscape(fmtDate(e.ts))}</td><td><span class="bn-spl">${this._bnPic(e.art, e.wiss)}<span class="bn-spn"><b>${ucpEscape(e.art)}</b><small>${ucpEscape(e.wiss || "")}</small></span></span></td><td><span class="bn-cbar"><i style="width:${Math.min(100, Math.round(e.konf))}%;background:${col}"></i></span> ${ucpEscape(String(e.konf).replace(".", lang?.startsWith("de") ? "," : "."))} %</td><td>${ucpEscape(ucpT(p))}</td></tr>`;
      }).join("");
      pane = `<div class="bn-kpis">${kpi("Total detections", d.total)}${kpi("Unique species", names.length)}${kpi("Average confidence", avg)}${kpi("Most frequent", top[0]?.[0] ?? "–", top[0] ? ucpT("{n} detections").replace("{n}", top[0][1]) : "")}</div>
        <div class="bn-two"><div class="bn-box">${head("Top 10 species", "")}${top.map(([n, k], i) => `<div class="bn-bar"><span class="bn-bl">${ucpEscape(n)}</span><i style="width:${Math.max(3, k / topMax * 100)}%;background:${colors[i % colors.length]}"></i><em>${k}</em></div>`).join("") || `<div class="bn-quiet">${ucpEscape(ucpT("No data yet"))}</div>`}</div>
        <div class="bn-box">${head("Detections by time of day", "")}<div class="bn-cols">${partKeys.map(([k, l], i) => `<div class="bn-col"><em>${Number(d.part[k]) || 0}</em><i style="height:${Math.max(2, (Number(d.part[k]) || 0) / partMax * 100)}%;background:${colors[i * 2 % colors.length]}"></i><span>${ucpEscape(ucpT(l))}</span></div>`).join("")}</div></div></div>
        <div class="bn-box">${head("Detection trend", "")}${trend}</div>
        <div class="bn-box">${head("Recent detections", "")}${rows ? `<table class="bn-tbl"><thead><tr><th>${ucpEscape(ucpT("Date and time"))}</th><th>${ucpEscape(ucpT("Species"))}</th><th>${ucpEscape(ucpT("Confidence"))}</th><th>${ucpEscape(ucpT("Time of day"))}</th></tr></thead><tbody>${rows}</tbody></table>` : `<div class="bn-quiet">${ucpEscape(ucpT("No data yet"))}</div>`}</div>`;
    } else {
      const q = String(this._bnQuery ?? "").trim().toLowerCase();
      const sort = this._bnSort || "count";
      const view = this._bnView === "list" ? "list" : "grid";
      let list = names.map((name) => ({ name, ...d.species[name] })).filter((s) => !q || s.name.toLowerCase().includes(q) || String(s.wiss ?? "").toLowerCase().includes(q));
      const avgOf = (x) => x.n ? x.sum / x.n : 0;
      const by = { count: (x, y) => y.n - x.n, fewest: (x, y) => x.n - y.n, name: (x, y) => x.name.localeCompare(y.name, lang), namez: (x, y) => y.name.localeCompare(x.name, lang),
        firstnew: (x, y) => y.first - x.first, firstold: (x, y) => x.first - y.first, lastnew: (x, y) => y.last - x.last, lastold: (x, y) => x.last - y.last,
        conf: (x, y) => avgOf(y) - avgOf(x), confl: (x, y) => avgOf(x) - avgOf(y), max: (x, y) => y.max - x.max, maxl: (x, y) => x.max - y.max };
      list.sort((x, y) => (by[sort] ?? by.count)(x, y) || x.name.localeCompare(y.name, lang));
      const dec = (v) => v.toFixed(1).replace(".", lang?.startsWith("de") ? "," : ".");
      const cards = list.map((s) => `<div class="bn-art">${this._bnPic(s.name, s.wiss)}<div class="bn-ai"><b>${ucpEscape(s.name)}</b><small>${ucpEscape(s.wiss || "")}</small>
        <dl><dt>${ucpEscape(ucpT("Detections"))}</dt><dd>${s.n}</dd><dt>${ucpEscape(ucpT("Confidence"))}</dt><dd>${s.sum ? dec(s.sum / s.n) + " %" : "–"}</dd><dt>${ucpEscape(ucpT("First"))}</dt><dd>${s.first ? ucpEscape(fmtDate(s.first, false)) : "–"}</dd><dt>${ucpEscape(ucpT("Last"))}</dt><dd>${s.last ? ucpEscape(fmtDate(s.last, false)) : "–"}</dd></dl></div></div>`).join("");
      pane = `<div class="bn-kpis bn-kpis2">${kpi("Species total", names.length, ucpT("{n} detections").replace("{n}", sumN))}${kpi("Average confidence", avg, ucpT("Overall average"))}</div>
        <div class="bn-box">${head("Filter data", "")}<div class="bn-filter"><label>${ucpEscape(ucpT("Sort by"))}<select class="bn-sel" data-bn-sort>${[["count", "Most detections"], ["fewest", "Fewest detections"], ["name", "Name (A–Z)"], ["namez", "Name (Z–A)"], ["firstnew", "Recently first seen"], ["firstold", "Earliest first seen"], ["lastnew", "Recently last seen"], ["lastold", "Earliest last seen"], ["conf", "Highest confidence"], ["confl", "Lowest confidence"], ["max", "Highest max. confidence"], ["maxl", "Lowest max. confidence"]].map(([k, l]) => `<option value="${k}"${k === sort ? " selected" : ""}>${ucpEscape(ucpT(l))}</option>`).join("")}</select></label>
        <label class="bn-q">${ucpEscape(ucpT("Search species"))}<input type="search" data-bn-q value="${ucpEscape(this._bnQuery ?? "")}" placeholder="${ucpEscape(ucpT("Search by name…"))}"></label>
        <span class="bn-views"><button type="button" class="${view === "grid" ? "on" : ""}" data-bn-view="grid" aria-label="${ucpEscape(ucpT("Tiles"))}"><ha-icon icon="mdi:view-grid"></ha-icon></button><button type="button" class="${view === "list" ? "on" : ""}" data-bn-view="list" aria-label="${ucpEscape(ucpT("List"))}"><ha-icon icon="mdi:view-list"></ha-icon></button></span></div></div>
        <div class="bn-box">${head("Species list", "")}${cards ? `<div class="bn-arts ${view === "list" ? "bn-list" : ""}">${cards}</div>` : `<div class="bn-quiet">${ucpEscape(ucpT("No data yet"))}</div>`}</div>`;
    }
    return `<div class="bn">${bar}${tab ? `<div class="bn-range"><ha-icon icon="mdi:calendar"></ha-icon>${ucpEscape(d.caption)}</div>` : ""}${pane}</div>`;
  }

  // Aktive Entitäten: nach Gruppen (Lampen, Fenster …) sortierte Liste dessen, was gerade an/offen ist

  // Raum-Dialog der Minimal-Ansicht: Geräte dieses Raums in der Gruppe, bei Lampen/Schaltern mit "Alle ausschalten"

  // Energy Power Flow: Energie-/Leistungsfluss des Hauses als SVG (Netz, PV, Speicher, Verbraucher, E-Auto um den Wechselrichter)
  // Animationen nach jedem Neuaufbau auf dieselbe Zeitbasis legen, damit Schein und Punkte gleichmäßig und im selben Takt laufen

  // ===== Mediaplayer (inkl. Music-Assistant-Bibliothek) =====

  // Beim Schließen zurück zur Bibliotheksübersicht (beim nächsten Öffnen wird sie neu geladen)

  // Optional: Einträge der Home-Assistant-Medienquelle (media-source://, z. B. Ordner „Medien“) ausblenden

  // Aktuelle Wiedergabeposition (Sekunden), bei laufender Wiedergabe seit der letzten Aktualisierung fortgeschrieben

  // Visualizer wie beim Kartentyp Clock-Music: Balken am unteren Kartenrand, Farben aus dem Cover

  // Suche: bevorzugt media_player/search_media, sonst der Music-Assistant-Dienst music_assistant.search

  _stopData() {
    this._dataToken = null;
    clearInterval(this._interval);
    clearInterval(this._energyWatch);
    if (this._unsubscribe) {
      Promise.resolve(this._unsubscribe()).catch(() => {});
      this._unsubscribe = null;
    }
  }

  _startData() {
    const c = this._config;
    if (!c || !this.isConnected || this._dataToken) return;
    if (c.entity && c.follow_energy_date && this._hass?.callApi) {
      const token = this._dataToken = {};
      this._hmLoad(token);
      this._interval = setInterval(() => this._hmLoad(token), 300000);
      this._energyWatch = setInterval(() => {
        if (this._energyPeriod()?.key !== token.periodKey) this._hmLoad(token);
      }, 500);
    }
  }

  _energyPeriod() {
    const c = this._config;
    const connection = this._hass?.connection;
    if (!c?.follow_energy_date || !connection) return null;
    const custom = typeof c.collection_key === "string" ? c.collection_key.trim() : "";
    const panel = this._hass.panelUrl || globalThis.location?.pathname.split("/")[1];
    const keys = custom ? [custom.startsWith("_") ? custom : "_" + custom]
      : panel ? ["_energy_" + panel, "_energy"] : ["_energy"];
    for (const key of keys) {
      const collection = connection[key];
      if (!collection || collection.start == null) continue;
      const start = +new Date(collection.start);
      const selectedEnd = collection.end == null ? null : +new Date(collection.end);
      if (!Number.isFinite(start) || (selectedEnd !== null && (!Number.isFinite(selectedEnd) || selectedEnd <= start))) continue;
      return { start, selectedEnd, key: [key, start, selectedEnd].join("/") };
    }
    return null;
  }

  // Heatmap: vergangene Tage der Energie-Datumsauswahl aus der Verlaufs-Datenbank (letzter Zustand je Tag, Attribut {Name: [24 Werte]})
  async _hmLoad(token) {
    const period = this._energyPeriod();
    const key = period?.key ?? "live";
    const changed = token.periodKey !== key;
    token.periodKey = key;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    if (!period || period.start >= todayStart) {
      if (this._hmPast) { this._hmPast = null; this._render(); }
      return;
    }
    if (token.loading && !changed) return;
    if (changed) { this._hmPast = null; this._render(); }
    const request = {};
    token.loading = request;
    const attr = this._config.hm_attribute || "stunden";
    const start = Math.max(period.start, todayStart - 366 * 86400000);
    const end = Math.min(period.selectedEnd ?? todayStart, todayStart);
    const current = () => this._dataToken === token && token.loading === request;
    let map = {};
    const days = [];
    try {
      const query = new URLSearchParams({ filter_entity_id: this._config.entity, end_time: new Date(end).toISOString(), significant_changes_only: "0" });
      const rows = await this._hass.callApi("GET", `history/period/${encodeURIComponent(new Date(start).toISOString())}?${query}`);
      const lastOfDay = new Map();
      for (const state of Array.isArray(rows?.[0]) ? rows[0] : []) {
        const d = new Date(state.last_changed ?? state.last_updated);
        if (Number.isNaN(+d)) continue;
        const day = d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
        if (state.attributes?.[attr] && typeof state.attributes[attr] === "object") lastOfDay.set(day, { attrs: state.attributes, ts: new Date(d).setHours(0, 0, 0, 0) });
      }
      for (const { attrs, ts } of lastOfDay.values()) {
        days.push({ ts, arten: attrs.arten, konf: attrs.konf, zeit: attrs.zeit });
        for (const [name, values] of Object.entries(attrs[attr])) {
          const sum = map[name] ??= Array(24).fill(0);
          if (Array.isArray(values)) for (let i = 0; i < 24; i++) sum[i] += Number(values[i]) || 0;
        }
      }
    } catch { map = {}; }
    if (!current()) return;
    token.loading = null;
    this._hmPast = { key, map, days };
    this._render();
  }

}

if (!customElements.get(UCP_EDITOR)) customElements.define(UCP_EDITOR, UltimateCardEditor);
if (!customElements.get(UCP_TAG)) customElements.define(UCP_TAG, UltimateCardPackage);
if (!window.customCards.some((card) => card.type === UCP_TAG)) {
  window.customCards.push({
    type: UCP_TAG,
    name: "BirdNET",
    description: "BirdNET-Go detections: daily activity, analysis summary and species list (tabs).",
    preview: true,
  });
}
})();
