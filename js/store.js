/* Browser storage for the planner: one place for every localStorage read and write.
   - A failed save (storage full, blocked, private window) is reported once in the status bar instead of failing silently.
   - Saved data that can no longer be read is copied to "<key>-unreadable-<date>" before anything overwrites it. */
const store = (() => {
  let warned = false;
  function say(text) {
    console.warn("[store]", text);
    try {
      if (typeof status === "function") status(text);
    } catch (e) {
      /* the page is still starting */
    }
  }
  function failed(action, key, err) {
    console.warn(`[store] ${action} failed for ${key}`, err);
    if (!warned) {
      warned = true;
      say(
        "The browser didn't let the planner save its data (storage full or blocked). Use File > Export to keep a copy of your layout.",
      );
    }
  }
  function getRaw(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      failed("Reading", key, e);
      return null;
    }
  }
  function setRaw(key, text) {
    try {
      localStorage.setItem(key, text);
      warned = false;
      return true;
    } catch (e) {
      failed("Saving", key, e);
      return false;
    }
  }
  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      failed("Removing", key, e);
    }
  }
  /* Keep a copy of data that can't be read, so the next save doesn't destroy it. */
  function keepUnreadable(key, text, what) {
    const copy = `${key}-unreadable-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`;
    setRaw(copy, text);
    say(
      `Your saved ${what} couldn't be read, so the planner started fresh. The old data is kept in browser storage as "${copy}".`,
    );
  }
  /* Parse JSON stored under key. Missing → fallback. Unreadable → copied aside, then fallback. */
  function getJSON(key, fallback, what) {
    const text = getRaw(key);
    if (text === null) return fallback;
    try {
      return JSON.parse(text);
    } catch (e) {
      keepUnreadable(key, text, what || "settings");
      return fallback;
    }
  }
  function setJSON(key, value) {
    return setRaw(key, JSON.stringify(value));
  }
  return { getRaw, setRaw, remove, getJSON, setJSON, keepUnreadable };
})();

/* Deep copy for plain layout data. */
const clone = (v) => structuredClone(v);
