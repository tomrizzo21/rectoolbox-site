/* Notes for the Mic techniques tool (docs/MIC_TECHNIQUES_NOTES_PLAN.md): where each instrument's sound comes from,
   the accessories a setup needs or would benefit from, and processing starting points with actual settings.
   STATUS: DRAFT, written 2026-11-11 from the references listed with each instrument; Tom to review. The sound-source
   notes follow the references; the processing values are common practice (starting points to adjust by ear), not
   measurements, and are written as ranges on purpose.
   Keyed by the guide's instrument name (js/guide.js `n`). Shape:
     source: [text]                                      where the sound comes from and what that means for miking
     acc:    [{ item, level: "needed" | "suggested", why, cond, out }]   cond: true = only matters with a condenser mic;
             out: true = needed outdoors, suggested indoors (the planner's Room setting decides)
             item names match Inventory › Accessories where one exists, so the gear list can count them
     proc:   { rec: [{ kind, set: [[parameter, value]], why }], live: [...] }   live lists only what differs
     refs:   [[title, url]]                                                                                       */
const GUIDE_NOTES_STATUS = "draft";
const GUIDE_REFS = {
  dpaWB: ["DPA Mic University: How to mic woodwinds and brass", "https://www.dpamicrophones.com/mic-university/how-to-mic-woodwinds-and-brass"],
  dpaTpt: ["DPA Mic University: How to mic a trumpet and trombone", "https://www.dpamicrophones.com/mic-university/how-to-mic-a-trumpet-and-trombone"],
  dpaClar: ["DPA Mic University: How to mic a clarinet", "https://www.dpamicrophones.com/mic-university/how-to-mic/how-to-mic-a-clarinet/"],
  dpaFlute: ["DPA Mic University: How to mic a flute or recorder", "https://dpamicrophones.com/mic-university/how-to-mic-a-flute-or-recorder"],
  dpaPiano: ["DPA Mic University: How to mic a grand piano", "https://www.dpamicrophones.com/mic-university/how-to-mic-a-grand-piano"],
  dpaMount: ["DPA Mic University: How to mount an instrument microphone", "https://www.dpamicrophones.com/mic-university/how-to-mount-an-instrument-microphone"],
  dpaClose: ["DPA Mic University: 10 points on close miking for live performances", "https://www.dpamicrophones.com/mic-university/10-points-on-close-miking-for-live-performances"],
  sosClar: ["Sound On Sound: What's the best way to mic a clarinet?", "https://www.soundonsound.com/sound-advice/q-what-best-way-mike-clarinet"],
  atBrass: ["Audio-Technica: Tips for recording brass instruments", "https://audio-technica.com/en-us/blog/basic-recording-techniques-tips-recording-brass-instruments"],
  recBrass: ["Recording Magazine: Miking brass and winds", "https://recordingmag.com/resources/recording-info/miking-brass-and-winds"],
  shure: ["Shure: Making an independent recording (points to Shure's Microphone Techniques for Recording booklet)", "https://www.shure.com/en-US/insights/making-an-independent-recording-part-2"],
};
// Shared processing blocks, so the same idea reads the same everywhere.
const GP = {
  hpf: (f, why) => ({ kind: "EQ: high-pass", set: [["Frequency", f], ["Slope", "12–18 dB/oct"]], why: why || "Removes rumble, handling and stand noise below the instrument's range." }),
  comp: (ratio, atk, rel, gr, why) => ({
    kind: "Compressor",
    set: [["Threshold", `set for ${gr} of gain reduction on the loudest notes`], ["Ratio", ratio], ["Attack", atk], ["Release", rel], ["Knee", "soft"], ["Make-up gain", "match the bypassed level"]],
    why,
  }),
  verb: (type, pre, why) => ({ kind: "Reverb (send)", set: [["Type", type], ["Pre-delay", pre], ["Send level", "to taste; start low"]], why }),
  align: (why) => ({ kind: "Phase / time alignment", set: [["Polarity", "check each mic against the closest one; flip if the low end thins"], ["Delay", "nudge the farther mic(s) to line up with the close mic, or leave the room mic late on purpose"]], why }),
};
const GUIDE_NOTES = {
  Vocalist: {
    source: [
      "The voice comes from the mouth, with breath and plosive bursts (p, b) firing straight forward from it.",
      "Sibilance (s, sh, t) is strongest on-axis at about 5–8 kHz; angling the mic slightly off the mouth line softens it.",
      "Close in, a directional mic adds bass (proximity effect); moving in and out on loud notes keeps the level and tone steady.",
    ],
    acc: [
      { item: "Pop filter", level: "needed", why: "Stops plosive bursts hitting the capsule within a few inches of the mouth.", cond: true },
      { item: "Foam windscreen", level: "suggested", why: "For dynamics on stage or outdoors; a pop filter does this job in the studio." },
      { item: "Shock mount", level: "suggested", why: "Keeps stand and floor thumps out of a condenser.", cond: true },
    ],
    proc: {
      rec: [
        GP.hpf("80–100 Hz (lower for deep voices)"),
        { kind: "EQ", set: [["Cut", "200–400 Hz, 2–3 dB, wide (Q 1), if it sounds boxy or close"], ["Boost", "3–5 kHz, 1–3 dB, for presence"], ["Air", "high shelf at 10–12 kHz, +1–3 dB"]], why: "Clears up close-mic muddiness and brings the words forward." },
        GP.comp("3:1–4:1", "5–15 ms", "50–100 ms (or auto)", "3–6 dB", "Evens out the level so every word sits in the mix."),
        { kind: "De-esser", set: [["Frequency", "5–8 kHz (find the harshest 's')"], ["Reduction", "3–6 dB on s sounds only"]], why: "Tames sibilance that EQ and compression make worse." },
        GP.verb("plate or small hall", "40–80 ms", "The pre-delay keeps the words clear of the reverb."),
      ],
      live: [GP.hpf("100–120 Hz", "Cuts stage rumble and handling noise and gives feedback less low end to grab."), GP.comp("4:1", "5–10 ms", "60–100 ms", "4–8 dB", "Keeps the vocal above the band as the singer moves.")],
    },
    refs: [GUIDE_REFS.shure, GUIDE_REFS.dpaClose],
  },
  "Acoustic guitar": {
    source: [
      "The soundhole puts out a strong low-mid boom; the top (soundboard) and the 12th-fret area give a more balanced tone.",
      "The fingerboard and pick area carry the string detail and attack; the bridge area is warmer and fuller.",
      "Close in, fret squeaks and breathing are loud; 8–12 in back keeps them in proportion.",
    ],
    acc: [{ item: "Shock mount", level: "suggested", why: "Small condensers on boom stands pick up foot taps through the floor.", cond: true }],
    proc: {
      rec: [
        GP.hpf("80–100 Hz"),
        { kind: "EQ", set: [["Cut", "150–250 Hz, 2–4 dB, if boomy"], ["Boost", "5–10 kHz shelf, +1–2 dB, for sparkle"]], why: "Controls soundhole boom and keeps the strumming clear." },
        GP.comp("2:1–3:1", "15–30 ms", "100–200 ms", "2–4 dB", "A slow attack lets the pick attack through while evening the strumming."),
      ],
      live: [GP.hpf("100–120 Hz", "Acoustic guitars feed back first in the low mids; a higher high-pass and a narrow cut at the ringing frequency help.")],
    },
    refs: [GUIDE_REFS.shure],
  },
  "Bass amp": {
    source: [
      "The speaker cone's centre is brightest; towards the edge the tone gets darker and rounder.",
      "Bass wavelengths are long, so a mic right at the grille hears the speaker; a DI hears the instrument itself, without the amp.",
      "Mic and DI arrive at different times; line them up or the low end thins out.",
    ],
    acc: [{ item: "Single-channel DI box", level: "suggested", why: "A clean DI track alongside the amp mic is standard and gives the mix a solid low end." }],
    proc: {
      rec: [
        GP.hpf("30–40 Hz", "Removes sub-sonic rumble without thinning the bass."),
        { kind: "EQ", set: [["Cut", "200–400 Hz, 2–4 dB, if muddy"], ["Boost", "700 Hz–1 kHz, 1–3 dB, for definition on small speakers"]], why: "Keeps the bass audible on phones and laptops." },
        GP.comp("4:1", "10–30 ms", "100–200 ms", "4–6 dB", "Bass needs a steady level to anchor the mix."),
        GP.align("Amp mic and DI arrive a few milliseconds apart; aligning them keeps the low end solid."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.shure],
  },
  "Electric guitar amp": {
    source: [
      "The tone changes a lot across the speaker: dust cap = bright and harsh, halfway out = balanced, edge = dark.",
      "Tilting the mic off-axis softens the top end, like moving it toward the edge.",
      "A room mic adds space but arrives later than the close mic; check the two together.",
    ],
    acc: [{ item: "Inline pad (−20 dB)", level: "suggested", why: "A condenser room or close mic in front of a loud amp can overload the preamp; most condensers also have a built-in pad.", cond: true }],
    proc: {
      rec: [
        GP.hpf("80–100 Hz"),
        { kind: "EQ", set: [["Low-pass", "8–10 kHz, to remove fizz"], ["Cut", "2–4 kHz, narrow, if harsh"]], why: "Speakers don't produce much above 5–6 kHz; anything higher is mostly fizz and noise." },
        GP.align("Close and room mics arrive milliseconds apart; check polarity and alignment before blending."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.shure],
  },
  Trumpet: {
    source: [
      "Nearly all of the sound, and almost all of the high end, leaves the bell; the body and valves add very little.",
      "The bell beams the highs straight ahead: on-axis is brightest; aiming off-axis (up to about 45°) gives a warmer, rounder sound.",
      "Brass is very loud close up (DPA notes peaks well above 140 dB right at the bell), and valve noise grows as you get closer.",
    ],
    acc: [
      { item: "Inline pad (−20 dB)", level: "needed", why: "Within about a foot of the bell a condenser or the preamp can clip; use the mic's pad or an inline one.", cond: true },
      { item: "Foam windscreen", level: "suggested", why: "Outdoors, and for very close mics where air from the bell hits the capsule." },
    ],
    proc: {
      rec: [
        GP.hpf("100–150 Hz"),
        { kind: "EQ", set: [["Cut", "2–4 kHz, 2–3 dB, if piercing"], ["Boost", "around 250 Hz, 1–2 dB, if thin"]], why: "Softens the bell's beam of highs and gives body to a close mic." },
        GP.comp("3:1", "10–20 ms", "80–150 ms", "2–5 dB", "Brass dynamics are wide; light compression keeps solos and soft passages both audible."),
        GP.verb("hall", "20–40 ms", "Close-miked brass sounds dry; reverb puts the distance back."),
      ],
      live: [GP.comp("4:1", "5–15 ms", "80–120 ms", "4–8 dB", "Catches sudden loud notes so they don't jump out of the PA.")],
    },
    refs: [GUIDE_REFS.dpaTpt, GUIDE_REFS.atBrass, GUIDE_REFS.recBrass, GUIDE_REFS.dpaWB],
  },
  Trombone: {
    source: [
      "Like the trumpet, almost all of the sound leaves the bell, with the highs beamed forward.",
      "The bell sits lower and further forward and the slide moves: leave room so the player can't hit the mic.",
      "Aiming across the bell rather than into it gives a warmer, less blasting tone.",
    ],
    acc: [
      { item: "Inline pad (−20 dB)", level: "needed", why: "Very loud at the bell; use the mic's pad or an inline one with condensers close in.", cond: true },
      { item: "Foam windscreen", level: "suggested", why: "Air from the bell at close range, and outdoors." },
    ],
    proc: {
      rec: [
        GP.hpf("60–80 Hz"),
        { kind: "EQ", set: [["Cut", "300–500 Hz, 2–3 dB, if tubby"], ["Boost", "1–2 kHz, 1–2 dB, for edge"]], why: "Keeps the trombone's weight without muddiness." },
        GP.comp("3:1", "10–20 ms", "100–150 ms", "2–5 dB", "Evens out the wide dynamic range."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.dpaTpt, GUIDE_REFS.atBrass, GUIDE_REFS.dpaWB],
  },
  Saxophone: {
    source: [
      "Sound comes from both the bell and the open tone holes along the body; the most natural sound captures both.",
      "Aiming only into the bell gives a honky, bright sound that misses the lower notes, which come out of the keys.",
      "Key clicks and pad noise get loud close to the body; small moves (DPA: about a centimetre, or 10°) change the balance.",
    ],
    acc: [{ item: "Clip-on instrument mount", level: "suggested", why: "Keeps the mic at the same spot as the player moves (common live)." }],
    proc: {
      rec: [
        GP.hpf("80–120 Hz (alto higher, baritone lower)"),
        { kind: "EQ", set: [["Cut", "800 Hz–1.2 kHz, 2–3 dB, narrow, if honky"], ["Boost", "high shelf above 8 kHz, +1–2 dB, for breath"]], why: "Removes the 'honk' a bell-heavy position adds." },
        GP.comp("3:1–4:1", "10–20 ms", "80–150 ms", "3–6 dB", "Saxes jump in level between registers."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.dpaWB, GUIDE_REFS.recBrass],
  },
  Flute: {
    source: [
      "Much of the sound comes from the embouchure hole at the mouthpiece, plus the open tone holes along the body; little comes from the end of the tube.",
      "The player's breath at the embouchure is loud close up: aim across it from above, not straight down into the air stream.",
      "Sources differ on the exact balance, so listen and move the mic between the mouthpiece and the first keys.",
    ],
    acc: [
      { item: "Foam windscreen", level: "suggested", why: "Breath noise at the embouchure, and outdoors." },
      { item: "Pop filter", level: "suggested", why: "With a condenser close to the embouchure.", cond: true },
    ],
    proc: {
      rec: [
        GP.hpf("150–250 Hz", "The flute has almost nothing below middle C; a high high-pass removes breath thumps and room rumble."),
        { kind: "EQ", set: [["Cut", "2–4 kHz, 1–3 dB, if breathy or shrill"]], why: "Smooths a close mic." },
        GP.comp("2:1–3:1", "15–30 ms", "100–200 ms", "2–4 dB", "Gentle; flutes are quiet in the low register and loud up high."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.dpaFlute, GUIDE_REFS.dpaWB],
  },
  Clarinet: {
    source: [
      "Most of the sound comes out of the open tone holes along the body, not the bell; a mic only on the bell misses much of the range.",
      "Place the mic where it can 'see' the whole instrument, e.g. above and in front, aimed at the middle of the body.",
      "Key noise (pads and keys clicking) is loud close to the body, especially with condensers: back off to 1–2 ft if you hear it.",
    ],
    acc: [{ item: "Shock mount", level: "suggested", why: "A sensitive condenser close in also hears stand and floor noise.", cond: true }],
    proc: {
      rec: [
        GP.hpf("100–150 Hz"),
        { kind: "EQ", set: [["Cut", "300–500 Hz, 1–3 dB, if woody or boxy"], ["Gentle cut", "3–5 kHz if key clicks stand out"]], why: "Cleans up a close mic without losing the tone." },
        GP.comp("2:1", "20–30 ms", "100–200 ms", "1–3 dB", "Light: clarinets are already fairly even."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.dpaClar, GUIDE_REFS.sosClar, GUIDE_REFS.dpaWB],
  },
  "Violin / viola": {
    source: [
      "The top plate and f-holes radiate the sound, mostly upward from the top: a mic above the instrument hears it best.",
      "Close to the bridge or an f-hole the sound gets scratchy (bow noise) and boomy; a foot or two above is more natural.",
      "DPA: aim at an f-hole for the most output from a clip-on mic, at the cost of a less natural tone.",
    ],
    acc: [
      { item: "Clip-on instrument mount", level: "suggested", why: "Live, so the mic moves with the player." },
      { item: "Shock mount", level: "suggested", why: "Condensers above the player on a boom pick up stand noise.", cond: true },
    ],
    proc: {
      rec: [
        GP.hpf("150–200 Hz (viola: 100–150 Hz)"),
        { kind: "EQ", set: [["Cut", "2–4 kHz, 1–3 dB, if scratchy"], ["Cut", "around 400 Hz if boxy"]], why: "Softens bow noise and box tone." },
        GP.verb("hall", "20–40 ms", "Strings expect a room around them."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.dpaMount],
  },
  Piano: {
    source: [
      "The soundboard radiates the sound, upward and through the open lid; the hammers add the attack.",
      "Close over the hammers is bright and percussive; further back toward the tail is rounder. DPA's starting point: a spaced pair of omnis outside, low, about 12 in apart.",
      "Closing the lid or using the short stick improves separation from the band.",
    ],
    acc: [{ item: "Shock mount", level: "suggested", why: "Pedal thumps travel through the floor into stands.", cond: true }],
    proc: {
      rec: [
        GP.hpf("30–40 Hz", "Removes pedal thumps without touching the lowest notes."),
        { kind: "EQ", set: [["Cut", "200–400 Hz, 1–3 dB, if muddy"], ["Boost", "high shelf above 8 kHz, +1–2 dB"]], why: "Clarity in a mix." },
        GP.comp("2:1", "20–30 ms", "150–300 ms", "1–3 dB", "Very light, or none, for solo piano."),
        GP.align("Two mics on one piano: check them in mono for comb filtering."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.dpaPiano],
  },
  "Drum kit": {
    source: [
      "Each drum radiates from both heads; the kick's punch is at the beater head, its boom inside the shell.",
      "Overheads hear the cymbals and the whole kit; the snare should be the same distance from both overheads, or the snare thins out.",
      "Every mic hears every drum: polarity and distance between mics matter more than on any other instrument.",
    ],
    acc: [
      { item: "Inline pad (−20 dB)", level: "suggested", why: "Condensers close to snare or cymbals can overload; use the built-in pad if the mic has one.", cond: true },
      { item: "Drum clips", level: "suggested", why: "Hold snare and tom mics clear of the sticks." },
    ],
    proc: {
      rec: [
        { kind: "EQ: kick", set: [["High-pass", "30–40 Hz"], ["Cut", "300–500 Hz, 3–6 dB (cardboard tone)"], ["Boost", "60–80 Hz for weight, 3–5 kHz for beater click"]], why: "Weight plus click, without the boxy middle." },
        { kind: "EQ: snare", set: [["High-pass", "80–100 Hz"], ["Boost", "150–250 Hz for body, 5 kHz for crack"], ["Cut", "800 Hz–1 kHz if ringy"]], why: "Body and crack." },
        { kind: "EQ: overheads", set: [["High-pass", "150–300 Hz (cymbal-only) or 60–80 Hz (whole kit)"]], why: "Choose: overheads as cymbal mics, or as the main kit sound." },
        GP.comp("4:1", "10–30 ms (lets the stick attack through)", "50–100 ms", "3–6 dB", "Kick and snare: punch and steady level."),
        { kind: "Gate (toms, optional)", set: [["Threshold", "just under the softest hit"], ["Range", "10–20 dB (not fully closed)"], ["Attack", "0.1–1 ms"], ["Hold", "50–100 ms"], ["Release", "100–300 ms (with the decay)"]], why: "Cuts the bleed between tom hits." },
        GP.align("Check each close mic against the overheads; flip polarity where the low end gets thinner."),
      ],
      live: [{ kind: "Gate (kick, toms)", set: [["Threshold", "just under the softest hit"], ["Range", "15–30 dB"], ["Attack", "0.1–1 ms"], ["Hold", "50–100 ms"], ["Release", "100–200 ms"]], why: "Live, gates keep the stage bleed and ring out of the PA." }],
    },
    refs: [GUIDE_REFS.shure],
  },
  "Concert bass drum": {
    source: [
      "A big, slow low-frequency source: the sound builds up a few feet from the head, not right at it.",
      "The playing head gives attack; the opposite head and the room give the long boom.",
      "Very high level up close at low frequencies; move outward for a rounder, more natural sound.",
    ],
    acc: [{ item: "Inline pad (−20 dB)", level: "suggested", why: "Close condensers can overload on loud strokes.", cond: true }],
    proc: {
      rec: [
        GP.hpf("25–35 Hz", "Keeps the fundamental and removes sub-sonic air movement."),
        { kind: "EQ", set: [["Cut", "200–400 Hz, 2–4 dB, if boxy"]], why: "Keeps the boom without muddying the band." },
        GP.comp("2:1–3:1", "30 ms+", "200–400 ms", "2–3 dB", "Slow and light, to keep the strokes' natural attack."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.shure],
  },
  "Marching bass drum": {
    source: [
      "Each drum is tuned to a different pitch; the heads face sideways, so the sound goes left and right, not forward.",
      "The players move: mics have to stay clear of the sticks and the marching path.",
      "Outdoors the low end doesn't build up as it does in a room, so the sound gets thinner with distance.",
    ],
    acc: [{ item: "Foam windscreen", level: "needed", out: true, why: "Outdoors, wind on a microphone causes low-frequency rumble that a high-pass can't fully remove." }],
    proc: {
      rec: [
        GP.hpf("30–40 Hz"),
        { kind: "EQ", set: [["Cut", "300–600 Hz, 2–4 dB, if boxy"], ["Boost", "2–4 kHz, 1–2 dB, for stick attack"]], why: "Pitch and attack of each drum stay audible." },
        GP.comp("3:1", "20–30 ms", "100–200 ms", "2–4 dB", "Evens out players at different distances."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.shure],
  },
  "Marching baritone": {
    source: [
      "Like the other brass, the sound leaves the bell; a marching baritone's bell faces forward, so it beams toward the audience.",
      "The player moves: keep the mic off the bell's axis and out of the marching lane.",
      "Very loud close up; outdoors there's no room sound to fill in, so it can sound dry and blunt.",
    ],
    acc: [
      { item: "Foam windscreen", level: "needed", out: true, why: "Outdoors; wind noise on the capsule." },
      { item: "Inline pad (−20 dB)", level: "suggested", why: "Close condensers on a loud bell.", cond: true },
    ],
    proc: {
      rec: [
        GP.hpf("60–80 Hz"),
        { kind: "EQ", set: [["Cut", "300–500 Hz, 2–3 dB, if tubby"], ["Boost", "1–2 kHz, 1–2 dB, for definition"]], why: "Clarity without losing warmth." },
        GP.comp("3:1", "10–20 ms", "100–150 ms", "2–5 dB", "Outdoor dynamics are wide."),
        GP.verb("hall", "20–40 ms", "Puts back the space an outdoor recording lacks."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.dpaTpt, GUIDE_REFS.atBrass],
  },
};
