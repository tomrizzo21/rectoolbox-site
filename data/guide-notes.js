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
     proc:   { rec: [{ kind, set: [[parameter, value]], why, when }], live: [...] }   live lists only what differs;
             no `when` = a usual first step; `when` = only if you hear the problem it names ("it sounds boxy")
     mics:   [{ match: regex source, rec: [...], live: [...], note }]   optional: processing for one mic of a multi-mic
             technique, matched against the guide's slot label (e.g. "Snare bottom"); first match wins
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
  niosh: ["NIOSH Power Tools Sound and Vibration Database (CDC)", "https://wwwn.cdc.gov/niosh-sound-vibration/"],
  nioshWiki: ["NIOSH Power Tools Database (overview)", "https://en.wikipedia.org/wiki/NIOSH_Power_Tools_Database"],
  krotos: ["Krotos: Foley recording techniques", "https://krotos.studio/blog/foley-recording"],
  premium: ["PremiumBeat: Recording Foley and sound effects, the fundamentals", "https://www.premiumbeat.com/blog/recording-foley-and-sound-effects-the-fundamentals/"],
  violet: ["Violet Design: How to record your own sound effects", "https://violetrecording.com/how-to-record-sound-effects/"],
  shure: ["Shure: Making an independent recording (points to Shure's Microphone Techniques for Recording booklet)", "https://www.shure.com/en-US/insights/making-an-independent-recording-part-2"],
};
// Shared processing blocks, so the same idea reads the same everywhere.
const GP = {
  hpf: (f, why) => ({ kind: "EQ: high-pass", set: [["Frequency", f], ["Slope", "12–18 dB/oct"]], why: why || "Removes rumble, handling and stand noise below the instrument's range." }),
  comp: (ratio, atk, rel, gr, why, when) => ({
    kind: "Compressor",
    when: when || "the level jumps between quiet and loud passages and won't sit steadily in the mix",
    set: [["Threshold", `set for ${gr} of gain reduction on the loudest notes`], ["Ratio", ratio], ["Attack", atk], ["Release", rel], ["Knee", "soft"], ["Make-up gain", "match the bypassed level"]],
    why,
  }),
  verb: (type, pre, why) => ({ kind: "Reverb (send)", set: [["Type", type], ["Pre-delay", pre], ["Send level", "to taste; start low"]], why, when: "it sounds dry or too close next to the rest of the mix" }),
  align: (why) => ({ kind: "Phase / time alignment", set: [["Polarity", "check each mic against the closest one; flip if the low end thins"], ["Delay", "nudge the farther mic(s) to line up with the close mic, or leave the room mic late on purpose"]], why }),
};
const GATE = (lo, hi, why) => ({ kind: "Gate", when: "bleed from the rest of the kit muddies this channel", set: [["Threshold", "just under the softest hit"], ["Range", `${lo}–${hi} dB (not fully closed)`], ["Attack", "0.1–1 ms"], ["Hold", "50–100 ms"], ["Release", "100–300 ms (with the decay)"]], why });
/* Fixes for a problem you hear: only when it's there. */
const FIX = (when, kind, set, why) => ({ kind, set, why, when }),
  CUT = (when, f, g, q, why) => FIX(when, "EQ cut", [["Frequency", f], ["Gain", g], ["Width", q]], why),
  BOOST = (when, f, g, q, why) => FIX(when, "EQ boost", [["Frequency", f], ["Gain", g], ["Width", q]], why),
  SHELF = (when, f, g, why) => FIX(when, "EQ high shelf", [["Frequency", f], ["Gain", g]], why),
  LPF = (when, f, why) => FIX(when, "EQ low-pass", [["Frequency", f], ["Slope", "12 dB/oct"]], why),
  HP = (f, why) => ({ kind: "EQ: high-pass", set: [["Frequency", f], ["Slope", "12–18 dB/oct"]], why });
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
        CUT("it sounds boxy, muddy or too close", "200–400 Hz", "−2 to −3 dB", "wide (Q about 1)", "Proximity effect piles up low mids on a close mic."),
        BOOST("the words get lost behind the band", "3–5 kHz", "+1 to +3 dB", "medium (Q 1–2)", "The presence range carries the consonants."),
        SHELF("it sounds dull or dark", "10–12 kHz", "+1 to +3 dB", "Adds air without the harshness of a 5 kHz boost."),
        GP.comp("3:1–4:1", "5–15 ms", "50–100 ms (or auto)", "3–6 dB", "Evens out the level so every word sits in the mix."),
        { kind: "De-esser", when: "s, sh and t sounds are harsh or spitty (often worse after the presence boost and compression)", set: [["Frequency", "5–8 kHz (find the harshest 's')"], ["Reduction", "3–6 dB on s sounds only"]], why: "Tames sibilance that EQ and compression make worse." },
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
        CUT("it sounds boomy (the mic hears the soundhole)", "150–250 Hz", "−2 to −4 dB", "medium (Q 1–2)", "Controls soundhole boom."),
        SHELF("the strumming sounds dull, without sparkle", "5–10 kHz", "+1 to +2 dB", "Brings out the string detail."),
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
        CUT("it sounds muddy or the notes blur together", "200–400 Hz", "−2 to −4 dB", "wide (Q about 1)", "Clears the low mids the bass shares with everything else."),
        BOOST("the bass disappears on phones and laptops", "700 Hz–1 kHz", "+1 to +3 dB", "medium (Q 1–2)", "Small speakers can't play the fundamental; the harmonics carry the notes."),
        GP.comp("4:1", "10–30 ms", "100–200 ms", "4–6 dB", "Bass needs a steady level to anchor the mix."),
        GP.align("Amp mic and DI arrive a few milliseconds apart; aligning them keeps the low end solid."),
      ],
      live: [],
    },
    mics: [
      {
        match: "^Cab mic",
        rec: [HP("40–50 Hz", "The mic brings the amp's growl and mids; the DI can carry the deepest lows."), CUT("the cab mic sounds boomy", "250–400 Hz", "−2 to −3 dB", "wide (Q about 1)", "Speaker cabinets resonate in the low mids.")],
      },
      {
        match: "^Direct input",
        rec: [
          { kind: "Blend with the cab mic", set: [["Delay", "delay the DI by about 1–3 ms (or nudge it in the DAW) until the two line up"], ["Polarity", "flip the DI if the blend gets thinner"], ["Balance", "DI for the low end, mic for the tone; start equal and adjust"]], why: "The amp and speaker make the mic's signal arrive later than the DI." },
          HP("30 Hz", "Removes sub-sonic rumble."),
          LPF("string, fret or pickup noise is audible", "5–8 kHz", "A DI hears everything, including the fret noise the speaker would roll off."),
        ],
      },
    ],
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
        LPF("it sounds fizzy or hissy on top", "8–10 kHz", "Speakers don't produce much above 5–6 kHz; anything higher is mostly fizz and noise."),
        CUT("it sounds harsh or ice-picky", "2–4 kHz (sweep to find it)", "−2 to −4 dB", "narrow (Q 3–5)", "A narrow peak in the speaker's response; a wide cut would dull the guitar."),
        GP.align("Close and room mics arrive milliseconds apart; check polarity and alignment before blending."),
      ],
      live: [],
    },
    mics: [
      {
        match: "^Cab mic",
        rec: [{ kind: "Level", set: [["Role", "the main guitar sound; set its tone first, then add the room mic"]], why: "The close mic is the anchor; the room mic adds space around it." }],
      },
      {
        match: "^Room mic",
        rec: [
          { kind: "Time", set: [["Delay", "about 0.9 ms per foot later than the close mic"], ["Choice", "slide it back to line up for a fuller sound, or leave it late for more space"], ["Polarity", "flip it if the blend gets thinner"]], why: "Sound takes about 0.9 ms to travel a foot." },
          { kind: "EQ: high- and low-pass", set: [["High-pass", "100–150 Hz"], ["Low-pass", "8 kHz"]], why: "Keeps the low end and fizz with the close mic; the room mic is for space." },
          { kind: "Level", set: [["Blend", "6–12 dB under the close mic, to taste"]], why: "A little room goes a long way." },
        ],
        live: [{ kind: "Live sound", set: [["Room mic", "usually left out live: it mostly picks up the PA and the band"]], why: "On stage the close mic does the job." }],
      },
    ],
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
        CUT("it sounds piercing", "2–4 kHz", "−2 to −3 dB", "medium (Q 1–2)", "Softens the bell's beam of highs."),
        BOOST("it sounds thin, especially on a close mic", "around 250 Hz", "+1 to +2 dB", "wide (Q about 1)", "Gives body back to a close mic."),
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
        CUT("it sounds tubby", "300–500 Hz", "−2 to −3 dB", "wide (Q about 1)", "Keeps the trombone's weight without muddiness."),
        BOOST("it lacks edge or gets lost in the band", "1–2 kHz", "+1 to +2 dB", "medium (Q 1–2)", "Brings out the brassy edge."),
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
        CUT("it sounds honky or nasal", "800 Hz–1.2 kHz", "−2 to −3 dB", "narrow (Q 3–5)", "Removes the honk a bell-heavy position adds."),
        SHELF("it sounds dull, with no breath", "8 kHz and up", "+1 to +2 dB", "Brings back the breath and air."),
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
        CUT("it sounds breathy or shrill", "2–4 kHz", "−1 to −3 dB", "medium (Q 1–2)", "Smooths a close mic."),
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
        CUT("it sounds woody or boxy", "300–500 Hz", "−1 to −3 dB", "wide (Q about 1)", "Cleans up a close mic without losing the tone."),
        CUT("key clicks stand out", "3–5 kHz", "−1 to −2 dB", "medium (Q 1–2)", "Gentle; moving the mic back is the better fix."),
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
        CUT("it sounds scratchy (bow noise)", "2–4 kHz", "−1 to −3 dB", "medium (Q 1–2)", "Softens bow noise."),
        CUT("it sounds boxy", "around 400 Hz", "−1 to −3 dB", "wide (Q about 1)", "Reduces the box tone of a close mic."),
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
        CUT("it sounds muddy in the mix", "200–400 Hz", "−1 to −3 dB", "wide (Q about 1)", "Clarity next to bass and guitars."),
        SHELF("it sounds dull or far away", "8 kHz and up", "+1 to +2 dB", "Brings the attack and air forward."),
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
        GP.align("Check each close mic against the overheads; flip polarity where the low end gets thinner."),
        { kind: "Bus compressor (whole kit)", when: "the kit sounds like separate mics rather than one instrument", set: [["Ratio", "2:1–4:1"], ["Attack", "10–30 ms"], ["Release", "100 ms or auto"], ["Gain reduction", "2–4 dB"]], why: "Glues the close mics and overheads into one kit." },
      ],
      live: [],
    },
    mics: [
      {
        match: "^Kick out",
        rec: [
          { kind: "Blend with the kick in mic", set: [["Delay", "the out mic arrives about 0.9 ms per foot later; nudge it to line up, or leave it for depth"], ["Polarity", "flip one if the blend loses low end"], ["Balance", "in mic for click, out mic for boom"]], why: "Two mics on one drum, a foot or more apart." },
          HP("25–35 Hz", "The out mic carries the weight; leave the click to the in mic."),
          CUT("the out mic sounds boxy", "300–500 Hz", "−2 to −4 dB", "wide (Q about 1)", "The shell's resonance builds up in front of the drum."),
        ],
      },
      {
        match: "^Kick",
        rec: [
          HP("30–40 Hz", "Removes sub-sonic rumble below the drum's fundamental."),
          CUT("it sounds boxy, like cardboard", "300–500 Hz", "−3 to −6 dB", "wide (Q about 1)", "The shell's resonance; cutting it leaves weight and click."),
          BOOST("it sounds dull, with no beater click", "3–5 kHz", "+2 to +4 dB", "medium (Q 1–2)", "The beater hitting the head lives here; it lets the kick cut through."),
          BOOST("it lacks weight", "60–80 Hz", "+2 to +4 dB", "wide (Q about 1)", "The fundamental; check on full-range speakers, not only headphones."),
          GP.comp("4:1", "10–30 ms (lets the beater attack through)", "50–100 ms", "3–6 dB", "Punch and a steady level."),
        ],
        live: [GATE(15, 30, "Keeps the bleed from the rest of the kit out of the kick channel.")],
      },
      {
        match: "^Snare( top)?$",
        rec: [
          HP("80–100 Hz", "Removes kick bleed below the snare."),
          BOOST("it sounds thin, with no body", "150–250 Hz", "+2 to +3 dB", "wide (Q about 1)", "The snare's fundamental."),
          BOOST("it sounds dull, with no crack", "about 5 kHz", "+2 to +3 dB", "medium (Q 1–2)", "Stick attack and the wires' crack."),
          CUT("it rings (a pitched overtone hangs on)", "800 Hz–1 kHz (sweep to find it)", "−3 to −6 dB", "narrow (Q 3–5)", "A narrow cut removes the ring; tuning or a gel pad is the better fix."),
          GP.comp("4:1", "10–30 ms (lets the stick attack through)", "50–100 ms", "3–6 dB", "Evens out ghost notes against rim shots."),
        ],
      },
      {
        match: "^Snare bottom",
        rec: [
          { kind: "Polarity", set: [["Polarity", "flip (invert) against the snare top mic"], ["Check", "with it flipped, the two together should sound fuller, not thinner"]], why: "The bottom mic faces the top mic, so the heads move it the opposite way." },
          HP("200–400 Hz", "It's there for the snare wires; the top mic carries the body."),
          BOOST("the wires don't sizzle enough", "5–8 kHz", "+2 to +4 dB", "medium (Q 1–2)", "Where the wires' rattle sits."),
          { kind: "Level", set: [["Blend", "6–12 dB under the snare top, to taste"]], why: "A little adds sizzle; too much sounds like a hi-hat." },
        ],
      },
      {
        match: "tom",
        rec: [
          HP("60–80 Hz (floor) or 80–120 Hz (rack)", "Removes kick bleed below the tom."),
          CUT("it sounds boxy", "300–600 Hz", "−2 to −4 dB", "wide (Q about 1)", "Tone without the cardboard middle."),
          BOOST("it sounds dull, with no stick attack", "3–5 kHz", "+2 to +3 dB", "medium (Q 1–2)", "The stick on the head."),
          GATE(10, 20, "Cuts the bleed between tom hits; open enough to keep the decay natural."),
        ],
        live: [GATE(15, 30, "Live, gates keep the stage bleed and ring out of the PA.")],
      },
      {
        match: "^Hi-hat",
        rec: [HP("200–400 Hz", "Removes the snare and kick it picks up; the overheads often carry enough hi-hat that this mic stays low."), CUT("it sounds clangy", "around 1 kHz", "−2 to −3 dB", "medium (Q 1–2)", "The hi-hat's metallic clang.")],
      },
      {
        match: "^Ride",
        rec: [HP("300–500 Hz", "Keeps the ping and lets the overheads carry the wash."), CUT("it sounds harsh", "1–3 kHz", "about −2 dB", "medium (Q 1–2)", "Softens the stick's ping.")],
      },
      {
        match: "^Overhead",
        rec: [
          HP("150–300 Hz (cymbal mics) or 60–80 Hz (the main kit sound)", "Choose: overheads as cymbal mics, or as the main kit sound."),
          CUT("the cymbals sound harsh", "2–4 kHz", "−1 to −2 dB", "wide (Q about 1)", "Tames the cymbals' harshest range."),
          { kind: "Pan", set: [["Overhead L / R", "left and right, wide (drummer's or audience view; pick one and keep the toms matching)"]], why: "The pair gives the kit its stereo picture." },
        ],
      },
    ],
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
        CUT("it sounds boxy or muddies the band", "200–400 Hz", "−2 to −4 dB", "wide (Q about 1)", "Keeps the boom without muddying the band."),
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
        CUT("it sounds boxy", "300–600 Hz", "−2 to −4 dB", "wide (Q about 1)", "Lets each drum's pitch come through."),
        BOOST("the drums blur together, with no attack", "2–4 kHz", "+1 to +2 dB", "medium (Q 1–2)", "Stick attack separates the runs between drums."),
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
        CUT("it sounds tubby", "300–500 Hz", "−2 to −3 dB", "wide (Q about 1)", "Clarity without losing warmth."),
        BOOST("it lacks definition", "1–2 kHz", "+1 to +2 dB", "medium (Q 1–2)", "Brings out the attack of each note."),
        GP.comp("3:1", "10–20 ms", "100–150 ms", "2–5 dB", "Outdoor dynamics are wide."),
        GP.verb("hall", "20–40 ms", "Puts back the space an outdoor recording lacks."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.dpaTpt, GUIDE_REFS.atBrass],
  },
  /* Sound effects (BACKLOG B0a). Facts from the references; the processing is common practice, as above. */
  "Power saw (cutting wood)": {
    source: [
      "Two sources: the motor's whine and the blade in the wood. The cut is what sells the sound; aim at it, not at the motor.",
      "NIOSH measured circular saws at about 103–108 dBA of sound power while cutting, about 4 dB more than idling: roughly 100 dB at 1 m.",
      "The blade throws sawdust and chips back and out of the dust port: keep mics and cables out of that line and out of the cut-off piece's fall.",
      "Safety first: hearing protection for everyone in the room, the operator in charge of the tool, and nobody reaching in to move a mic while it runs.",
    ],
    acc: [
      { item: "Foam windscreen", level: "needed", why: "Keeps sawdust out of the grille and the capsule; easy to clean or replace." },
      { item: "Hearing protection", level: "needed", why: "Around 100 dB at 1 m is well past the 85 dBA where NIOSH recommends protection; monitor on closed headphones at a safe level." },
      { item: "Shock mount", level: "suggested", why: "The bench and sawhorses shake; keep the stand on the floor, not the work surface.", cond: true },
    ],
    proc: {
      rec: [
        GP.hpf("60–80 Hz", "Removes the rumble of the bench and the room without thinning the cut."),
        CUT("the motor whine is louder than the cut", "find the whine (often 1–4 kHz)", "−3 to −6 dB", "narrow (Q 4–8)", "A narrow cut on the motor's pitch leaves the cut itself alone."),
        FIX("the start of the cut clips or jumps out", "Limiter", [["Ceiling", "−1 dBFS"], ["Release", "50–100 ms"]], "Catches the peaks as the blade bites; better: set the gain lower and record a safety track."),
        GP.verb("small room or garage", "10–20 ms", "Puts a close, dry saw into the scene's space."),
      ],
      live: [],
    },
    mics: [
      {
        match: "^Perspective pair",
        rec: [{ kind: "Level", set: [["Blend", "with the close mic, to match the shot: more pair for a wide shot"]], why: "The pair is the saw in its room; the close mic is the detail." }],
      },
    ],
    refs: [GUIDE_REFS.niosh, GUIDE_REFS.nioshWiki, GUIDE_REFS.violet],
  },
  "Footsteps (foley)": {
    source: [
      "The sound is the shoe meeting the surface: match the shoe and the surface to the picture, and record a short sample of each surface first.",
      "A close mic (about 1–3 ft) gives dry texture and detail; a room mic further back gives space. Recording both lets the editor balance them.",
      "Keep the distance, gain and position the same through a scene so the steps match when cut together; vary heel-first, toe-first, shuffles and stops.",
      "Floor vibration reaches the mic through the stand: use a shock mount, and keep the stand off the foley board.",
    ],
    acc: [
      { item: "Shock mount", level: "needed", why: "Every step shakes the floor, and the stand passes it to the mic.", cond: true },
      { item: "Foley board (surfaces)", level: "suggested", why: "Wood, concrete, gravel or carpet panels to match the scene's floor." },
    ],
    proc: {
      rec: [
        GP.hpf("60–100 Hz", "Removes floor thumps and room rumble below the step itself."),
        CUT("the steps sound boomy or hollow", "150–300 Hz", "−2 to −4 dB", "wide (Q about 1)", "The board and the room resonate there."),
        BOOST("the steps lack detail (grit, squeak)", "3–6 kHz", "+1 to +3 dB", "medium (Q 1–2)", "The texture of the sole on the surface."),
        FIX("the room noise between steps is distracting", "Expander", [["Threshold", "just under the softest step"], ["Ratio", "1:2"], ["Range", "6–10 dB"], ["Release", "100–200 ms"]], "Lowers the noise between steps without cutting off the steps."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.krotos, GUIDE_REFS.premium, GUIDE_REFS.violet],
  },
  "Door (open, close, slam)": {
    source: [
      "A door has several parts: the handle and latch (click detail), the hinges (creaks), and the panel and frame (the body of a slam).",
      "Close mics catch the latch and handle detail; a mic further back catches the door's body and the room.",
      "Slams are sudden and loud: leave generous headroom, since a clipped peak is ruined, and use a recorder's safety track if it has one.",
      "Big slams can be built from layers (a wooden hit, a deeper thud, a metal clang) as well as recorded whole.",
    ],
    acc: [
      { item: "Inline pad (−20 dB)", level: "suggested", why: "Slams close to a condenser can reach the preamp's limit.", cond: true },
      { item: "Shock mount", level: "suggested", why: "A slam shakes the floor and the stand.", cond: true },
    ],
    proc: {
      rec: [
        GP.hpf("40–60 Hz", "Removes rumble; keep the thud of a slam."),
        BOOST("the slam lacks weight", "80–120 Hz", "+2 to +4 dB", "wide (Q about 1)", "The body of the door."),
        BOOST("the latch and handle are hard to hear", "2–5 kHz", "+1 to +3 dB", "medium (Q 1–2)", "The click detail."),
        FIX("the slam's peak clips or jumps out", "Limiter", [["Ceiling", "−1 dBFS"], ["Release", "50–100 ms"]], "Catches the transient; lower the gain first."),
      ],
      live: [],
    },
    refs: [GUIDE_REFS.krotos, GUIDE_REFS.violet],
  },
};
