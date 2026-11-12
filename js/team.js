/* Teams (docs/ACCOUNTS_PLAN.md phase 3): share gear and layouts with family or bandmates.
   - Account panel › Team: create a team, invite people by their sign-in email, join or decline invites sent to you,
     see members, remove a member (owner), leave, delete the team (owner). No email is sent: an invite waits in the
     database and shows in the invited person's Account panel when they sign in with that email.
   - "Use this team's gear": the owned gear (mic counts, cables, stands, accessories, your own mic models; see
     ownedGear() in app.js) lives in the team's row of the "inventories" table instead of in each layout. What a
     layout plans to buy ("Added") stays with the layout. Changes upload a couple of seconds later with a version
     check; if a teammate saved first, the two are merged item by item (your change wins only for items you changed).
   - Layouts are shared from File › Save as and File › Open (js/files.js).
   Without an account, or without a team, nothing here runs. */
const team = (() => {
  const GEAR_KEY = "rt-team-gear", // { user, team, version, base }: the team gear this browser last matched
    PUSH_DELAY = 2000;
  let teams = [],
    members = [],
    names = {},
    sent = [],
    invites = [],
    gear = store.getJSON(GEAR_KEY, null, "team gear"),
    latest = null, // this browser's gear since the last change (to re-apply after opening a layout)
    applying = false,
    pushing = false,
    pending = false,
    timer = 0;

  const cl = () => account.client();
  const me = () => account.user;
  const say = (t) => ($("teamMsg").textContent = t || "");
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const active = () => (gear && me() && gear.user === me().id ? gear : null);
  const setGear = (g) => {
    gear = g;
    g ? store.setJSON(GEAR_KEY, g) : store.remove(GEAR_KEY);
  };
  const check = (r) => {
    if (r && r.error) throw Error(r.error.message);
    return r;
  };
  const teamName = (id) => teams.find((t) => t.id === id)?.name || "";

  /* ---------- reading ---------- */
  async function refresh() {
    if (!me()) {
      teams = members = sent = invites = [];
      render();
      return;
    }
    try {
      const c = await cl();
      const [t, m, p, i, mine] = await Promise.all([
        c.from("teams").select("id,name,created_by,created_at").order("created_at"),
        c.from("team_members").select("team_id,user_id,role"),
        c.from("profiles").select("id,display_name"),
        c.from("team_invites").select("id,team_id,email,accepted_at"),
        c.rpc("my_invites"),
      ]);
      [t, m, p, i, mine].forEach(check);
      teams = t.data || [];
      members = m.data || [];
      names = Object.fromEntries((p.data || []).map((x) => [x.id, x.display_name]));
      sent = (i.data || []).filter((x) => !x.accepted_at && isOwner(x.team_id));
      invites = mine.data || [];
      const g = active();
      if (g && !teams.some((x) => x.id === g.team)) {
        setGear(null); // removed from the team, or it was deleted: the gear stays as it is, now your own
        status("You're no longer in the team whose gear you were using; your gear is your own again.");
      }
    } catch (e) {
      say("Couldn't load your teams: " + e.message);
    }
    render();
  }
  const isOwner = (t) => members.some((m) => m.team_id === t && m.user_id === me()?.id && m.role === "owner");

  /* ---------- the panel ---------- */
  function render() {
    const box = $("acctTeam");
    if (!box) return;
    if (!me()) {
      box.innerHTML = "";
      return;
    }
    const g = active();
    let h = `<h3>Team</h3><p class="m">Share your gear list and layouts with family or bandmates. Everyone signs in with their own account.</p>`;
    for (const x of invites)
      h += `<div class="teamInvite" data-invite="${esc(x.id)}"><p><b>${esc(x.invited_by_name || "Someone")}</b> invited you to the team <b>${esc(x.team_name || "")}</b>.</p><div class="row"><button data-team="accept">Join</button><button data-team="decline">Decline</button></div></div>`;
    for (const t of teams) {
      const own = isOwner(t.id),
        ms = members.filter((m) => m.team_id === t.id),
        pend = sent.filter((x) => x.team_id === t.id);
      h += `<div class="teamCard" data-teamid="${esc(t.id)}"><div class="row"><b style="flex:1">${esc(t.name)}</b><span class="m">${own ? "you own this team" : "member"}</span></div>
        <ul class="teamList">${ms
          .map(
            (m) =>
              `<li data-user="${esc(m.user_id)}">${esc(names[m.user_id] || "(no name yet)")}${m.user_id === me().id ? " (you)" : ""}${m.role === "owner" ? ' <span class="badge">owner</span>' : ""}${own && m.user_id !== me().id ? ` <button class="hb" data-team="removeMember">Remove</button>` : ""}</li>`,
          )
          .join("")}${pend.map((x) => `<li data-inviteid="${esc(x.id)}" class="m">${esc(x.email)}: invited, not joined yet <button class="hb" data-team="cancelInvite">Cancel</button></li>`).join("")}</ul>
        ${own ? `<div class="row"><input type="email" class="teamEmail" placeholder="Their sign-in email" aria-label="Email to invite to ${esc(t.name)}"><button data-team="invite">Invite</button></div>` : ""}
        <label class="m"><input type="checkbox" data-team="useGear" ${g && g.team === t.id ? "checked" : ""}> Use this team's gear (owned mics, cables, stands, accessories)</label>
        <div class="row">${own ? `<button data-team="deleteTeam" class="danger">Delete team</button>` : `<button data-team="leave">Leave team</button>`}</div></div>`;
    }
    h += `<div class="row"><input id="teamNewName" maxlength="80" placeholder="${teams.length ? "Another team's name" : "Team name, e.g. Rizzo gear"}" aria-label="New team name"><button data-team="create">Create team</button></div>
      <p id="teamMsg" class="m" aria-live="polite"></p>`;
    box.innerHTML = h;
  }

  const actions = {
    create: async (c) => {
      const name = $("teamNewName").value.trim().slice(0, 80);
      if (!name) throw Error("Enter a team name.");
      const r = check(await c.from("teams").insert({ name, created_by: me().id }).select("id").single());
      await refresh();
      await useGear(r.data.id, true);
      say(`Team “${name}” created and using your gear. Invite people below.`);
    },
    invite: async (c, el) => {
      const card = el.closest("[data-teamid]"),
        email = card.querySelector(".teamEmail").value.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw Error("Enter the email they sign in with.");
      if (sent.some((x) => x.team_id === card.dataset.teamid && x.email === email)) throw Error("They're already invited.");
      check(await c.from("team_invites").insert({ team_id: card.dataset.teamid, email, invited_by: me().id }));
      await refresh();
      say(`Invited ${email}. No email is sent: tell them to sign in to Rec Toolbox with that address and open Account to join.`);
    },
    cancelInvite: async (c, el) => {
      check(await c.from("team_invites").delete().eq("id", el.closest("[data-inviteid]").dataset.inviteid));
      await refresh();
    },
    accept: async (c, el) => {
      const r = check(await c.rpc("accept_invite", { invite: el.closest("[data-invite]").dataset.invite }));
      await refresh();
      say(`You joined “${teamName(r.data)}”. Tick “Use this team's gear” to plan with the team's gear; shared layouts are in File › Open.`);
    },
    decline: async (c, el) => {
      check(await c.from("team_invites").delete().eq("id", el.closest("[data-invite]").dataset.invite));
      await refresh();
    },
    removeMember: async (c, el) => {
      const card = el.closest("[data-teamid]"),
        u = el.closest("[data-user]").dataset.user;
      if (!confirm(`Remove ${names[u] || "this member"} from “${teamName(card.dataset.teamid)}”? They lose access to its gear and shared layouts.`)) return;
      check(await c.from("team_members").delete().eq("team_id", card.dataset.teamid).eq("user_id", u));
      await refresh();
    },
    leave: async (c, el) => {
      const t = el.closest("[data-teamid]").dataset.teamid;
      if (!confirm(`Leave “${teamName(t)}”? You keep a copy of its gear as your own; its shared layouts are no longer yours to open.`)) return;
      check(await c.from("team_members").delete().eq("team_id", t).eq("user_id", me().id));
      if (active()?.team === t) setGear(null);
      await refresh();
    },
    deleteTeam: async (c, el) => {
      const t = el.closest("[data-teamid]").dataset.teamid;
      if (!confirm(`Delete the team “${teamName(t)}” for everyone? Its gear list is deleted; shared layouts go back to only their owners.`)) return;
      check(await c.from("teams").delete().eq("id", t));
      if (active()?.team === t) setGear(null);
      await refresh();
    },
    useGear: async (c, el) => useGear(el.closest("[data-teamid]").dataset.teamid, el.checked),
  };

  /* ---------- shared gear ---------- */
  // Three-way merge, item by item: an item changed here (compared with the last synced copy) keeps this browser's
  // value; everything else takes the server's.
  function merge(base, mine, theirs) {
    const out = {};
    for (const sec of new Set([...Object.keys(mine || {}), ...Object.keys(theirs || {})])) {
      const b = (base || {})[sec] || {},
        m = (mine || {})[sec] || {},
        t = (theirs || {})[sec] || {};
      out[sec] = {};
      for (const k of new Set([...Object.keys(m), ...Object.keys(t)])) {
        const v = !same(m[k], b[k]) ? m[k] : t[k];
        if (v !== undefined) out[sec][k] = v;
      }
    }
    return out;
  }
  function apply(g) {
    applying = true;
    try {
      applyOwnedGear(g);
      heatDirty = true;
      draw(true);
    } finally {
      applying = false;
    }
    latest = ownedGear();
  }
  async function useGear(t, on) {
    if (!on) {
      setGear(null);
      status("Your gear is your own again; the counts stay as they are.");
      return render();
    }
    const c = await cl(),
      r = check(await c.from("inventories").select("data,version").eq("team_id", t).maybeSingle());
    if (!r.data) {
      // The team has no gear list yet: start it from this browser's.
      const data = ownedGear(),
        ins = check(await c.from("inventories").insert({ team_id: t, data }).select("version").single());
      setGear({ user: me().id, team: t, version: ins.data.version, base: data });
      status(`The team “${teamName(t)}” now shares your gear list.`);
    } else {
      apply(r.data.data);
      setGear({ user: me().id, team: t, version: r.data.version, base: r.data.data });
      status(`Using the gear of “${teamName(t)}”.`);
    }
    render();
  }
  async function pull() {
    const g = active();
    if (!g) return;
    try {
      const r = check(await (await cl()).from("inventories").select("data,version").eq("team_id", g.team).maybeSingle());
      if (!r.data) return; // deleted with the team; refresh() notices
      const mine = ownedGear(),
        merged = merge(g.base, mine, r.data.data);
      if (!same(merged, mine)) apply(merged);
      setGear({ ...g, version: r.data.version, base: r.data.data });
      if (!same(merged, r.data.data)) changed(0); // this browser had changes of its own: upload them
    } catch (e) {
      say("Couldn't load the team's gear: " + e.message);
    }
  }
  function changed(delay = PUSH_DELAY) {
    if (applying || !active()) return;
    latest = ownedGear();
    if (same(latest, active().base)) return;
    pending = true;
    clearTimeout(timer);
    timer = setTimeout(push, delay);
  }
  async function push() {
    const g = active();
    if (!g || pushing) return;
    pushing = true;
    pending = false;
    const data = ownedGear();
    try {
      const r = check(await (await cl()).from("inventories").update({ data }).eq("team_id", g.team).eq("version", g.version).select("version"));
      if (!r.data || !r.data.length) {
        pushing = false;
        status("A teammate changed the gear list too; merging their changes with yours.");
        return pull(); // merges and uploads again
      }
      setGear({ ...g, version: r.data[0].version, base: data });
    } catch (e) {
      pending = true; // offline: upload when back
      status("Team gear not uploaded yet (" + (e.message || "offline") + "); it will upload when you're back online.");
    } finally {
      pushing = false;
    }
  }
  // Opening a layout (or undo) brings back the gear saved with it; with team gear on, the team's wins.
  function afterLayout() {
    const g = active();
    if (!g) return;
    applying = true;
    try {
      applyOwnedGear(latest || g.base);
    } finally {
      applying = false;
    }
  }
  window.addEventListener("online", () => pending && push());

  /* ---------- start ---------- */
  function init() {
    $("acctModal").addEventListener("click", (e) => {
      const b = e.target.closest("[data-team]");
      if (!b || (b.type === "checkbox") !== (e.type === "change")) return;
      run(b);
    });
    $("acctModal").addEventListener("change", (e) => {
      const b = e.target.closest("[data-team]");
      if (b && b.type === "checkbox") run(b);
    });
    $("acctModal").addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      if (e.target.id === "teamNewName") run(e.target.parentNode.querySelector('[data-team="create"]'));
      if (e.target.classList.contains("teamEmail")) run(e.target.parentNode.querySelector('[data-team="invite"]'));
    });
    account.onChange(async (u) => {
      if (!u) {
        teams = members = sent = invites = [];
        return render();
      }
      await refresh();
      await pull();
      render();
    });
  }
  async function run(b) {
    say("");
    try {
      await actions[b.dataset.team](await cl(), b);
    } catch (e) {
      render();
      say(e.message || String(e));
    }
  }
  return {
    init,
    refresh,
    changed,
    afterLayout,
    gearName: () => (active() ? teamName(active().team) || "your team" : ""),
    teams: () => teams.slice(),
    nameOf: (u) => names[u] || "",
    get gear() { return active(); },
    _push: push,
    _pull: pull,
  };
})();
team.init();
