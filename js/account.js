/* Accounts (UI plan / docs/ACCOUNTS_PLAN.md, phase 1): sign in with Google or email + password, a profile name,
   and settings that follow you between browsers. Without signing in everything works as before, from browser storage.
   - The Supabase library (vendor/) loads only when needed: when you open the Account panel or are already signed in.
   - Sign-in needs a web address (rectoolbox.net, or a local server for testing); a page opened from disk can't do it.
   - Settings sync: the whole settings snapshot (settings.snapshot(): settings, window layouts, guide choices, console
     filters) is one row in user_settings. Changes upload a few seconds later; the row's version number stops a stale
     browser from overwriting newer settings (it loads the newer ones instead). The first sign-in in a browser that
     already has settings asks whether to upload them or use the account's.
   Tests swap the real client for a stand-in through window.__fakeSupabase (tests/fake_supabase.js). */
const account = (() => {
  const cfg = typeof RT_SUPABASE === "object" ? RT_SUPABASE : {},
    ref = cfg.url ? new URL(cfg.url).hostname.split(".")[0] : "",
    SESSION_KEY = `sb-${ref}-auth-token`, // where the Supabase library keeps the session
    SYNC_KEY = "rt-account-sync", // { user, version }: which account and settings version this browser last matched
    PUSH_DELAY = 3000;
  let client = null,
    user = null,
    profile = null,
    pushTimer = 0,
    pushing = false,
    dirty = false,
    applying = false,
    recovering = false,
    lastSync = null;

  const usable = () => !!(cfg.url && cfg.key) && (!!window.__fakeSupabase || /^https?:$/.test(location.protocol));
  const here = () => location.origin + location.pathname;
  const syncState = () => store.getJSON(SYNC_KEY, null, "account sync state");
  const setSyncState = (version) => store.setJSON(SYNC_KEY, { user: user.id, version });
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const say = (t) => ($("acctMsg").textContent = t || "");

  async function getClient() {
    if (client) return client;
    if (window.__fakeSupabase) client = window.__fakeSupabase(cfg);
    else {
      await loadScript(cfg.lib);
      client = supabase.createClient(cfg.url, cfg.key, {
        auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
    }
    client.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        recovering = true; // came back from a "set a new password" email: show that box
        setTimeout(open, 0);
      }
      setTimeout(() => onSession(session, event), 0); // never call the client from inside its own callback
    });
    return client;
  }

  /* ---------- signed-in state ---------- */
  async function onSession(session, event) {
    const next = session ? session.user : null,
      changed = (next && next.id) !== (user && user.id);
    user = next;
    if (!user) {
      profile = null;
      render();
      return;
    }
    if (changed || event === "SIGNED_IN") {
      await loadProfile();
      await pullSettings();
    }
    render();
  }
  async function loadProfile() {
    const { data } = await client.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
    profile = data || { display_name: "" };
  }

  /* ---------- settings sync ---------- */
  async function pullSettings() {
    const { data, error } = await client.from("user_settings").select("data,version").eq("user_id", user.id).maybeSingle();
    if (error) return say("Couldn't read your account settings: " + error.message);
    const local = settings.snapshot(),
      known = syncState(),
      knownHere = known && known.user === user.id;
    if (!data) {
      // New account: nothing stored yet.
      if (settings.isEmpty()) return createRow(local);
      return ask(
        "This browser has settings (view options, window layouts, smart route choice…). Upload them to your account?",
        [
          ["Upload them", () => createRow(local)],
          ["Start the account empty", () => createRow({ ...local, user: {}, extra: {} })],
        ],
      );
    }
    lastSync = new Date();
    if (same(data.data.user, local.user) && same(data.data.extra, local.extra)) return setSyncState(data.version);
    if (knownHere && known.version === data.version) return pushSoon(0); // only this browser changed: upload
    if (!knownHere && !settings.isEmpty())
      return ask("Your account has settings, and so does this browser. Which should win?", [
        ["Use my account's", () => applyServer(data)],
        ["Keep this browser's (replace the account's)", () => push(data.version)],
      ]);
    applyServer(data); // the account is newer
  }
  async function createRow(snap) {
    const { data, error } = await client.from("user_settings").insert({ user_id: user.id, data: snap }).select("version").single();
    if (error) return say("Couldn't save to your account: " + error.message);
    setSyncState(data.version);
    lastSync = new Date();
    if (snap.user && !Object.keys(snap.user).length && !settings.isEmpty()) return; // started empty; local stays as is
    say("Your settings are saved to your account.");
    render();
  }
  function applyServer(row) {
    applying = true;
    try {
      settings.importData({ format: "rec-toolbox-settings", version: 1, ...row.data });
    } catch (e) {
      applying = false;
      return say("Your account's settings couldn't be applied: " + e.message);
    }
    setSyncState(row.version);
    status("Loaded your settings from your account. Reloading…");
    if (!window.__fakeSupabase) location.reload();
    else applying = false;
  }
  function pushSoon(delay = PUSH_DELAY) {
    if (!user || applying) return;
    dirty = true;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => push(), delay);
  }
  async function push(overVersion) {
    if (!user || pushing) return;
    const known = syncState(),
      version = overVersion ?? (known && known.user === user.id ? known.version : null);
    if (version == null) return pullSettings();
    pushing = true;
    dirty = false;
    try {
      const { data, error } = await client
        .from("user_settings")
        .update({ data: settings.snapshot() })
        .eq("user_id", user.id)
        .eq("version", version)
        .select("version");
      if (error) throw error;
      if (!data || !data.length) {
        // Someone else saved first (another browser): take theirs.
        status("Your settings were changed in another browser; loading those.");
        await pullSettings();
        return;
      }
      setSyncState(data[0].version);
      lastSync = new Date();
      render();
    } catch (e) {
      dirty = true; // offline or refused: try again when back online
      say("Settings not uploaded yet (" + (e.message || "offline") + "). They'll upload when you're back online.");
    } finally {
      pushing = false;
    }
  }
  store.onWrite((key) => {
    if (user && !applying && (key === SETTINGS_KEY || settings.isExtraKey(key))) pushSoon();
  });
  window.addEventListener("online", () => dirty && push());
  window.addEventListener("beforeunload", () => dirty && push());

  /* ---------- actions ---------- */
  async function act(fn) {
    say("");
    $("acctModal").querySelectorAll("button").forEach((b) => (b.disabled = true));
    try {
      await fn(await getClient());
    } catch (e) {
      say(e.message || String(e));
    } finally {
      $("acctModal").querySelectorAll("button").forEach((b) => (b.disabled = false));
      render();
    }
  }
  const fields = () => ({ email: $("acctEmail").value.trim(), password: $("acctPass").value });
  function needFields(f, needPass = true) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) throw Error("Enter your email address.");
    if (needPass && f.password.length < 8) throw Error("Passwords need at least 8 characters.");
  }
  const actions = {
    google: (c) => c.auth.signInWithOAuth({ provider: "google", options: { redirectTo: here() } }).then(check),
    signIn: async (c) => {
      const f = fields();
      needFields(f);
      check(await c.auth.signInWithPassword(f));
      $("acctPass").value = "";
    },
    signUp: async (c) => {
      const f = fields();
      needFields(f);
      const r = check(await c.auth.signUp({ ...f, options: { emailRedirectTo: here() } }));
      $("acctPass").value = "";
      say(r.data && r.data.session ? "Account created." : "Check your email for a link to confirm your account, then sign in.");
    },
    reset: async (c) => {
      const f = fields();
      needFields(f, false);
      check(await c.auth.resetPasswordForEmail(f.email, { redirectTo: here() }));
      say("If that email has an account, a link to set a new password is on its way.");
    },
    newPassword: async (c) => {
      const p = $("acctNewPass").value;
      if (p.length < 8) throw Error("Passwords need at least 8 characters.");
      check(await c.auth.updateUser({ password: p }));
      recovering = false;
      $("acctNewPass").value = "";
      say("Password changed.");
    },
    saveName: async (c) => {
      const name = $("acctName").value.trim().slice(0, 80);
      check(await c.from("profiles").update({ display_name: name }).eq("id", user.id));
      profile = { display_name: name };
      say("Name saved.");
    },
    syncNow: async () => {
      clearTimeout(pushTimer);
      await pullSettings();
      if (!dirty) say("Settings are up to date.");
    },
    download: async (c) => {
      const [p, s] = await Promise.all([
        c.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        c.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      const blob = new Blob([JSON.stringify({ account: { id: user.id, email: user.email }, profile: p.data, settings: s.data }, null, 1)], {
          type: "application/json",
        }),
        url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), { href: url, download: "rec-toolbox-my-data.json" }).click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    signOut: async (c) => {
      if (dirty) await push();
      check(await c.auth.signOut());
      say("Signed out. Your settings stay in this browser.");
    },
    deleteAccount: async (c) => {
      if ($("acctDelConfirm").value.trim().toLowerCase() !== "delete") throw Error('Type "delete" to confirm.');
      check(await c.rpc("delete_my_account"));
      store.remove(SYNC_KEY);
      await c.auth.signOut();
      $("acctDelConfirm").value = "";
      say("Your account and everything stored with it are deleted. This browser keeps its own copy of your settings.");
    },
  };
  function check(r) {
    if (r && r.error) throw Error(r.error.message);
    return r;
  }
  function ask(question, choices) {
    $("acctAsk").hidden = false;
    $("acctAskQ").textContent = question;
    $("acctAskBtns").innerHTML = "";
    choices.forEach(([label, fn]) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = () => {
        $("acctAsk").hidden = true;
        fn();
      };
      $("acctAskBtns").appendChild(b);
    });
    open();
  }

  /* ---------- panel ---------- */
  function render() {
    const btn = $("railAccount");
    if (btn) {
      btn.querySelector(".rl").textContent = user ? profile?.display_name || user.email : "Sign in";
      btn.title = user ? `Account: ${user.email}` : "Sign in to keep your settings in your account";
      btn.classList.toggle("signedIn", !!user);
    }
    const ok = usable();
    $("acctNoWeb").hidden = ok;
    $("acctOut").hidden = !ok || !!user;
    $("acctIn").hidden = !ok || !user;
    $("acctRecover").hidden = !recovering || !user;
    if (user) {
      $("acctWho").textContent = user.email;
      if (document.activeElement !== $("acctName")) $("acctName").value = profile?.display_name || "";
      $("acctSync").textContent = dirty
        ? "Settings changed here; uploading…"
        : lastSync
          ? `Settings in sync (checked ${lastSync.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}).`
          : "";
    }
  }
  function open() {
    closeMenus();
    $("acctModal").hidden = false;
    render();
    if (usable()) getClient().then((c) => c.auth.getSession().then(({ data }) => onSession(data.session, "INITIAL_SESSION")));
  }
  function close() {
    $("acctModal").hidden = true;
  }

  /* ---------- start ---------- */
  function init() {
    $("acctModal").addEventListener("click", (e) => {
      if (e.target.id === "acctModal" || e.target.closest("[data-acctclose]")) close();
      const b = e.target.closest("[data-acct]");
      if (b && actions[b.dataset.acct]) act(actions[b.dataset.acct]);
    });
    $("acctModal").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.id === "acctPass") act(actions.signIn);
    });
    // Escape closes the panel even when focus has left it (e.g. after signing in, the buttons re-render).
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("acctModal").hidden) close();
    });
    render();
    // Only wake the library if this browser is signed in or is coming back from a sign-in link.
    const returning = /[?&#](code|access_token|error_description)=/.test(location.search + location.hash);
    if (usable() && (store.getRaw(SESSION_KEY) || returning || window.__fakeSupabase))
      getClient().then((c) =>
        c.auth.getSession().then(({ data }) => {
          onSession(data.session, "INITIAL_SESSION");
          if (returning) history.replaceState(null, "", here());
        }),
      );
  }
  return { init, open, close, client: getClient, get user() { return user; }, pushSoon, _push: push };
})();
account.init();
