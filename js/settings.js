/* One settings record for the whole toolbox, kept in browser storage under "rt-settings-v1":
     { version: 1, user: { "area.name": value, ... }, legacyUI: "<last imported rt-fh-ui-v1 text>" }
   setting(key) returns the person's value, or the site default from js/settings-defaults.js.
   Built so per-user settings after sign-in only change where `user` comes from, not the callers.
   Window layouts (rt-fh-dock-*), guide choices and console filters keep their own keys but travel with
   File > Export settings. */
const SETTINGS_KEY = "rt-settings-v1",
  SETTINGS_EXTRA_KEYS = /^rt-fh-(dock-.*|guide-v1|conhide)$/;
const settings = (() => {
  let rec = store.getJSON(SETTINGS_KEY, null, "settings");
  if (!rec || rec.version !== 1 || typeof rec.user !== "object" || !rec.user) rec = { version: 1, user: {} };
  const save = () => store.setJSON(SETTINGS_KEY, rec);
  /* Bring in the older separate keys. The planner's view settings are re-read whenever rt-fh-ui-v1 changes,
     because restoring a layout saved before this store existed writes that key. Old keys are left in place. */
  const ui = store.getRaw("rt-fh-ui-v1");
  if (ui !== null && ui !== rec.legacyUI) {
    try {
      rec.user["planner.view"] = JSON.parse(ui);
    } catch (e) {
      console.warn("[settings] old view settings ignored", e);
    }
    rec.legacyUI = ui;
    save();
  }
  if (!("rail.tool" in rec.user)) {
    const r = store.getJSON("rt-fh-tool-v1", null, "tool choice");
    if (r) {
      if (r.tool) rec.user["rail.tool"] = r.tool;
      rec.user["rail.collapsed"] = !!r.collapsed;
      save();
    }
  }
  function get(key) {
    return Object.prototype.hasOwnProperty.call(rec.user, key) ? rec.user[key] : RT_DEFAULTS[key];
  }
  function set(key, value) {
    if (JSON.stringify(rec.user[key]) === JSON.stringify(value)) return;
    rec.user[key] = value;
    save();
  }
  function reset(key) {
    if (!(key in rec.user)) return;
    delete rec.user[key];
    save();
  }
  /* Everything the account sync carries: the settings and the extra keys, without the export timestamp. */
  function snapshot() {
    const d = exportData();
    delete d.saved;
    return d;
  }
  const isEmpty = () => !Object.keys(rec.user).length;
  /* Everything that isn't the layout itself: settings plus window layouts, guide choices and console filters. */
  function exportData() {
    const extra = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (SETTINGS_EXTRA_KEYS.test(k)) extra[k] = localStorage.getItem(k);
    }
    return { format: "rec-toolbox-settings", version: 1, saved: new Date().toISOString(), user: rec.user, extra };
  }
  /* Checks the whole file before writing anything; the caller reloads the page afterwards. */
  function importData(o) {
    if (!o || o.format !== "rec-toolbox-settings") throw Error("This file is not a Rec Toolbox settings file.");
    if (o.version !== 1) throw Error("This settings file version is not supported.");
    if (typeof o.user !== "object" || !o.user) throw Error("The settings in this file are missing.");
    const extra = o.extra || {};
    for (const k in extra) {
      if (!SETTINGS_EXTRA_KEYS.test(k) || typeof extra[k] !== "string") throw Error(`Unexpected entry "${k}".`);
      JSON.parse(extra[k]);
    }
    rec = { version: 1, user: structuredClone(o.user), legacyUI: store.getRaw("rt-fh-ui-v1") };
    if (!save()) throw Error("The browser didn't let the settings be saved.");
    for (const k in extra) store.setRaw(k, extra[k]);
  }
  return { get, set, reset, exportData, importData, snapshot, isEmpty, isExtraKey: (k) => SETTINGS_EXTRA_KEYS.test(k) };
})();
const setting = settings.get;
