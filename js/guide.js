/* ---------- mic technique cheat guide ---------- */
/* Replacement guide: source-first search, accurate orientations and a clearer 3D scene. */
(function () {
  /* Retired first-pass guide data retained here only for historical reference.
 const G=[
  {n:'Vocalist',k:'vocal',tags:'voice jazz rock',post:'standing',t:[['Close vocal','Sing 2–4 in from the grille; keep the rear rejection zone aimed at monitors.',[['Vocal mic','Shure Beta 58A',[0,5.05,-1.35],[0,5.05,-.5],'2–4 in','Supercardioid; work the mic on loud notes.']]]]},
  {n:'Acoustic guitar',k:'guitar',tags:'guitar college jazz rock',post:'sitting',t:[['12th-fret spot','Aim across the strings at the 12th fret, not into the soundhole.',[['Fret mic','Rode NT5',[.35,3.25,-1.65],[.12,3.05,-.72],'8–12 in','Cardioid; HPF only if body boom builds.']]]]},
  {n:'Electric guitar amp',k:'amp',tags:'guitar amp jazz rock',post:'standing',t:[['Close dynamic','Start just off the grille, halfway from dust cap to cone edge.',[['Cab mic','Sennheiser e609',[0,1.15,-1.48],[0,1.15,-1.18],'0–2 in','Supercardioid; off-axis.']]],['Close + room','Keep the close mic as the anchor; check delay and polarity before mixing.',[['Cab mic','Shure SM57',[0,1.15,-1.48],[0,1.15,-1.18],'0–2 in','Cardioid; off-axis.'],['Room mic','AKG C414 XLII',[1.8,4.2,-4],[0,1.2,-1.1],'3–6 ft','Cardioid; pad if loud.']]]]},
  {n:'Trumpet',k:'trumpet',tags:'brass college jazz',post:'standing',t:[['Bell spot','Aim slightly off the bell axis and leave room for the player to lean back.',[['Bell mic','Shure SM57',[.45,3.95,-2.15],[0,3.85,-1.08],'12–24 in','Cardioid; start off-axis.']]]]},
  {n:'Trombone',k:'trombone',tags:'brass college jazz',post:'standing',t:[['Bell spot','Aim across the bell from above and leave room for slide movement.',[['Bell mic','Shure SM57',[.55,3.85,-2.8],[.95,3.55,-1.15],'18–30 in','Cardioid; stay clear of slide.']]]]},
  {n:'Saxophone',k:'sax',tags:'woodwind college jazz',post:'standing',t:[['Bell and keys','Aim between bell and lower keys, not only into the bell.',[['Horn mic','Sennheiser e614',[.5,2.7,-1.75],[.15,2.25,-.78],'8–16 in','Supercardioid; aim across bell and keys.']]]]},
  {n:'Flute',k:'flute',tags:'woodwind college jazz',post:'standing',t:[['Embouchure spot','Aim across the embouchure from above, never directly down it.',[['Flute mic','Rode NT5',[.45,3.65,-1.75],[0,3.35,-.9],'6–12 in','Cardioid; high-pass only for rumble.']]]]},
  {n:'Clarinet',k:'clarinet',tags:'woodwind college jazz',post:'standing',t:[['Keys and upper joint','Point toward the upper joint/keys; the bell alone misses much of the range.',[['Clarinet mic','Rode NT5',[.42,3.05,-1.7],[.08,2.7,-.82],'8–16 in','Cardioid; position above key noise if desired.']]]]},
  {n:'Violin / viola',k:'violin',tags:'strings college jazz',post:'standing',t:[['Bridge-side spot','Aim down toward the bridge from above, avoiding a direct line at the f-hole.',[['String mic','Rode NT5',[.6,4.1,-1.7],[.18,3.42,-.72],'12–20 in','Cardioid; use a boom stand.']]]]},
  {n:'Piano',k:'piano',tags:'keys college jazz rock',post:'sitting',t:[['XY inside lid','Place the pair 8–16 in above the strings around the hammers.',[['XY pair','Rode NT4 (XY stereo)',[0,2.8,-1.1],[0,1.75,-.65],'8–16 in','XY pair; phantom or battery.']]]]},
  {n:'Drum kit',k:'drums',tags:'drums kit jazz rock kick bass drum',post:'sitting',t:[['Four-mic kit','Kick, snare, and matched Rode NT5 overheads. Match each overhead distance to the snare and check polarity.',[['Kick','Shure Beta 52A',[0,1.05,-2.05],[0,1.05,-1.15],'inside / 2–6 in','Supercardioid; aim for beater attack.'],['Snare','Shure SM57',[-.9,1.65,-1.5],[-.65,1.22,-.45],'1–3 in','Cardioid; angle away from hi-hat.'],['Overhead L','Rode NT5',[-2.3,4.4,-1.55],[-.55,1.25,-.35],'3–4 ft','Cardioid; equal distance to snare.'],['Overhead R','Rode NT5',[2.3,4.4,-1.55],[-.55,1.25,-.35],'3–4 ft','Cardioid; equal distance to snare.']]]],['Five-piece close + overheads','Eight starting channels: kick, snare, two rack toms, two floor toms, and a matched overhead pair. Check every close/overhead pair for polarity and 3:1 spacing.',[['Kick','Shure Beta 52A',[0,1.05,-2.05],[0,1.05,-1.15],'inside / 2–6 in','Supercardioid.'],['Snare top','Shure SM57',[-.9,1.65,-1.5],[-.65,1.22,-.45],'1–3 in','Cardioid.'],['Rack tom 1','Shure SM57',[.15,2.15,-1.45],[.15,1.55,-.2],'1–3 in','Cardioid.'],['Rack tom 2','Shure SM57',[.92,2.05,-1.32],[.82,1.48,-.12],'1–3 in','Cardioid.'],['Floor tom L','Shure SM57',[-1.75,1.8,-1.35],[-1.45,1.2,-.15],'1–3 in','Cardioid.'],['Floor tom R','Shure SM57',[1.85,1.8,-1.35],[1.55,1.2,-.15],'1–3 in','Cardioid.'],['Overhead L','Rode NT5',[-2.3,4.4,-1.55],[-.55,1.25,-.35],'3–4 ft','Cardioid; match distance.'],['Overhead R','Rode NT5',[2.3,4.4,-1.55],[-.55,1.25,-.35],'3–4 ft','Cardioid; match distance.']]]],['Expanded rock kit','Adds hi-hat, ride and second-snare coverage to show close-mic bleed, polarity and spacing conflicts before you commit to the channel count.',[['Kick','Shure Beta 52A',[0,1.05,-2.05],[0,1.05,-1.15],'inside / 2–6 in','Supercardioid.'],['Snare top','Shure SM57',[-.9,1.65,-1.5],[-.65,1.22,-.45],'1–3 in','Cardioid.'],['Snare bottom','Shure SM57',[-.85,.8,-1.42],[-.65,1.15,-.45],'1–3 in','Cardioid; reverse polarity to compare.'],['Rack toms','Shure SM57',[.55,2.2,-1.5],[.45,1.55,-.2],'1–3 in','Cardioid.'],['Floor toms','Shure SM57',[1.85,1.8,-1.35],[1.55,1.2,-.15],'1–3 in','Cardioid.'],['Hi-hat','Sennheiser e614',[-2.0,2.35,-1.45],[-1.35,1.75,-.15],'4–8 in','Supercardioid; reject snare.'],['Ride','Sennheiser e614',[2.15,2.65,-1.42],[1.5,2.0,-.1],'6–12 in','Supercardioid.'],['Overhead L','Rode NT5',[-2.3,4.4,-1.55],[-.55,1.25,-.35],'3–4 ft','Cardioid; match distance.'],['Overhead R','Rode NT5',[2.3,4.4,-1.55],[-.55,1.25,-.35],'3–4 ft','Cardioid; match distance.']]]]},
  {n:'Concert bass drum',k:'concertBass',tags:'percussion college concert bass drum',post:'standing',t:[['Front-head spot','Aim a dynamic 4–12 in from the playing head; move outward for more room.',[['Bass drum mic','Shure Beta 52A',[0,1.7,-1.8],[0,1.65,-.68],'4–12 in','Supercardioid; use a short boom.']]]]},
  {n:'Marching bass drum',k:'marchBass',tags:'percussion marching bass drum',post:'standing',t:[['Player-carried drum','Place a small dynamic near the rim and leave clear marching movement.',[['Drum mic','Shure SM57',[.5,2.8,-1.5],[0,2.75,-.7],'6–12 in','Cardioid; clamp or short boom.']]]]},
  {n:'Marching baritone',k:'marchBari',tags:'brass marching baritone euphonium',post:'standing',t:[['Bell spot','Aim slightly off the forward bell, with a clear lane for movement.',[['Bell mic','Shure SM57',[.45,3.35,-2.05],[0,3.25,-.92],'12–24 in','Cardioid; keep the stand out of the marcher path.']]]]}
 ]; */
  const P = (label, mic, p, q, dist, note) => [label, mic, p, q, dist, note],
    T = (name, advice, ...mics) => [name, advice, mics],
    G = [
      {
        n: "Vocalist",
        k: "vocal",
        tags: "voice jazz rock",
        post: "standing",
        t: [
          T(
            "Close vocal",
            "Sing 2–4 in from the grille; keep the rear rejection zone aimed at monitors.",
            P(
              "Vocal mic",
              "Shure Beta 58A",
              [0, 5.05, -1.35],
              [0, 5.05, -0.5],
              "2–4 in",
              "Supercardioid; work the mic on loud notes.",
            ),
          ),
        ],
      },
      {
        n: "Acoustic guitar",
        k: "guitar",
        tags: "guitar college jazz rock",
        post: "sitting",
        t: [
          T(
            "12th-fret spot",
            "Aim across the strings at the 12th fret, not into the soundhole.",
            P(
              "Fret mic",
              "Rode NT5",
              [0.35, 3.25, -1.65],
              [0.12, 3.05, -0.72],
              "8–12 in",
              "Cardioid; use a boom stand.",
            ),
          ),
        ],
      },
      {
        n: "Bass amp",
        k: "amp",
        tags: "bass guitar amp jazz rock",
        post: "standing",
        t: [
          T(
            "Cabinet low end",
            "Aim just off-centre at the speaker; record DI too when available.",
            P(
              "Cab mic",
              "Shure Beta 52A",
              [0, 1.15, -1.48],
              [0, 1.15, -1.18],
              "0–3 in",
              "Supercardioid; watch low-end buildup.",
            ),
          ),
        ],
      },
      {
        n: "Electric guitar amp",
        k: "amp",
        tags: "guitar amp jazz rock",
        post: "standing",
        t: [
          T(
            "Close + room",
            "Keep the close mic as the anchor; check delay and polarity before mixing.",
            P("Cab mic", "Sennheiser e609", [0, 1.15, -1.48], [0, 1.15, -1.18], "0–2 in", "Supercardioid; off-axis."),
            P("Room mic", "AKG C414 XLII", [1.8, 4.2, -4], [0, 1.2, -1.1], "3–6 ft", "Cardioid; pad if loud."),
          ),
        ],
      },
      {
        n: "Trumpet",
        k: "trumpet",
        tags: "brass college jazz",
        post: "standing",
        t: [
          T(
            "Bell spot",
            "Aim slightly off the bell axis and leave room for the player to lean back.",
            P("Bell mic", "Shure SM57", [0.45, 3.95, -2.15], [0, 3.85, -1.08], "12–24 in", "Cardioid; start off-axis."),
          ),
        ],
      },
      {
        n: "Trombone",
        k: "trombone",
        tags: "brass college jazz",
        post: "standing",
        t: [
          T(
            "Bell spot",
            "Aim across the bell from above and leave room for slide movement.",
            P(
              "Bell mic",
              "Shure SM57",
              [0.55, 3.85, -2.8],
              [0.95, 3.55, -1.15],
              "18–30 in",
              "Cardioid; stay clear of slide.",
            ),
          ),
        ],
      },
      {
        n: "Saxophone",
        k: "sax",
        tags: "woodwind college jazz",
        post: "standing",
        t: [
          T(
            "Bell and keys",
            "Aim between bell and lower keys, not only into the bell.",
            P(
              "Horn mic",
              "Sennheiser e614",
              [0.5, 2.7, -1.75],
              [0.15, 2.25, -0.78],
              "8–16 in",
              "Supercardioid; aim across bell and keys.",
            ),
          ),
        ],
      },
      {
        n: "Flute",
        k: "flute",
        tags: "woodwind college jazz",
        post: "standing",
        t: [
          T(
            "Embouchure spot",
            "Aim across the embouchure from above, never directly down it.",
            P(
              "Flute mic",
              "Rode NT5",
              [0.45, 3.65, -1.75],
              [0, 3.3, -0.9],
              "6–12 in",
              "Cardioid; high-pass only for rumble.",
            ),
          ),
        ],
      },
      {
        n: "Clarinet",
        k: "clarinet",
        tags: "woodwind college jazz",
        post: "standing",
        t: [
          T(
            "Keys and upper joint",
            "Point toward the upper joint/keys; the bell alone misses much of the range.",
            P(
              "Clarinet mic",
              "Rode NT5",
              [0.42, 3.05, -1.7],
              [0.08, 2.7, -0.82],
              "8–16 in",
              "Cardioid; position above key noise if desired.",
            ),
          ),
        ],
      },
      {
        n: "Violin / viola",
        k: "violin",
        tags: "strings college jazz",
        post: "standing",
        t: [
          T(
            "Bridge-side spot",
            "Aim down toward the bridge from above, avoiding a direct line at the f-hole.",
            P(
              "String mic",
              "Rode NT5",
              [0.6, 4.1, -1.7],
              [0.18, 3.42, -0.72],
              "12–20 in",
              "Cardioid; use a boom stand.",
            ),
          ),
        ],
      },
      {
        n: "Piano",
        k: "piano",
        tags: "keys college jazz rock",
        post: "sitting",
        t: [
          T(
            "XY inside lid",
            "Place the pair 8–16 in above the strings around the hammers.",
            P(
              "XY pair",
              "Rode NT4 (XY stereo)",
              [0, 2.8, -1.1],
              [0, 1.75, -0.65],
              "8–16 in",
              "XY pair; phantom or battery.",
            ),
          ),
        ],
      },
      {
        n: "Drum kit",
        k: "drums",
        tags: "drums kit jazz rock kick bass drum",
        post: "sitting",
        t: [
          T(
            "Four-mic kit",
            "Kick, snare, and matched Rode NT5 overheads. Match each overhead distance to the snare and check polarity.",
            P(
              "Kick",
              "Shure Beta 52A",
              [0, 1.05, -2.05],
              [0, 1.05, -1.15],
              "inside / 2–6 in",
              "Supercardioid; beater attack.",
            ),
            P(
              "Snare",
              "Shure SM57",
              [-0.9, 1.65, -1.5],
              [-0.65, 1.22, -0.45],
              "1–3 in",
              "Cardioid; angle away from hi-hat.",
            ),
            P(
              "Overhead L",
              "Rode NT5",
              [-2.3, 4.4, -1.55],
              [-0.55, 1.25, -0.35],
              "3–4 ft",
              "Cardioid; match snare distance.",
            ),
            P(
              "Overhead R",
              "Rode NT5",
              [2.3, 4.4, -1.55],
              [-0.55, 1.25, -0.35],
              "3–4 ft",
              "Cardioid; match snare distance.",
            ),
          ),
          T(
            "Five-piece close + overheads",
            "Eight starting channels: kick, snare, two rack toms, two floor toms, and a matched overhead pair.",
            P("Kick", "Shure Beta 52A", [0, 1.05, -2.05], [0, 1.05, -1.15], "inside / 2–6 in", "Supercardioid."),
            P("Snare top", "Shure SM57", [-0.9, 1.65, -1.5], [-0.65, 1.22, -0.45], "1–3 in", "Cardioid."),
            P("Rack tom 1", "Shure SM57", [0.15, 2.15, -1.45], [0.15, 1.55, -0.2], "1–3 in", "Cardioid."),
            P("Rack tom 2", "Shure SM57", [0.92, 2.05, -1.32], [0.82, 1.48, -0.12], "1–3 in", "Cardioid."),
            P("Floor tom L", "Shure SM57", [-1.75, 1.8, -1.35], [-1.45, 1.2, -0.15], "1–3 in", "Cardioid."),
            P("Floor tom R", "Shure SM57", [1.85, 1.8, -1.35], [1.55, 1.2, -0.15], "1–3 in", "Cardioid."),
            P(
              "Overhead L",
              "Rode NT5",
              [-2.3, 4.4, -1.55],
              [-0.55, 1.25, -0.35],
              "3–4 ft",
              "Cardioid; match snare distance.",
            ),
            P(
              "Overhead R",
              "Rode NT5",
              [2.3, 4.4, -1.55],
              [-0.55, 1.25, -0.35],
              "3–4 ft",
              "Cardioid; match snare distance.",
            ),
          ),
          T(
            "Expanded rock kit",
            "Adds hi-hat, ride and second-snare coverage to expose close-mic bleed, polarity and spacing conflicts.",
            P("Kick", "Shure Beta 52A", [0, 1.05, -2.05], [0, 1.05, -1.15], "inside / 2–6 in", "Supercardioid."),
            P("Snare top", "Shure SM57", [-0.9, 1.65, -1.5], [-0.65, 1.22, -0.45], "1–3 in", "Cardioid."),
            P(
              "Snare bottom",
              "Shure SM57",
              [-0.85, 0.8, -1.42],
              [-0.65, 1.15, -0.45],
              "1–3 in",
              "Cardioid; reverse polarity to compare.",
            ),
            P("Rack toms", "Shure SM57", [0.55, 2.2, -1.5], [0.45, 1.55, -0.2], "1–3 in", "Cardioid."),
            P("Floor toms", "Shure SM57", [1.85, 1.8, -1.35], [1.55, 1.2, -0.15], "1–3 in", "Cardioid."),
            P(
              "Hi-hat",
              "Sennheiser e614",
              [-2.0, 2.35, -1.45],
              [-1.35, 1.75, -0.15],
              "4–8 in",
              "Supercardioid; reject snare.",
            ),
            P("Ride", "Sennheiser e614", [2.15, 2.65, -1.42], [1.5, 2.0, -0.1], "6–12 in", "Supercardioid."),
            P(
              "Overhead L",
              "Rode NT5",
              [-2.3, 4.4, -1.55],
              [-0.55, 1.25, -0.35],
              "3–4 ft",
              "Cardioid; match snare distance.",
            ),
            P(
              "Overhead R",
              "Rode NT5",
              [2.3, 4.4, -1.55],
              [-0.55, 1.25, -0.35],
              "3–4 ft",
              "Cardioid; match snare distance.",
            ),
          ),
        ],
      },
      {
        n: "Concert bass drum",
        k: "concertBass",
        tags: "percussion college concert bass drum",
        post: "standing",
        t: [
          T(
            "Front-head spot",
            "Aim a dynamic 4–12 in from the playing head; move outward for more room.",
            P(
              "Bass drum mic",
              "Shure Beta 52A",
              [0, 1.7, -1.8],
              [0, 1.65, -0.68],
              "4–12 in",
              "Supercardioid; use a short boom.",
            ),
          ),
        ],
      },
      {
        n: "Marching bass drum",
        k: "marchBass",
        tags: "percussion marching bass drum",
        post: "standing",
        t: [
          T(
            "Player-carried drum",
            "Place a small dynamic near the rim and leave clear marching movement.",
            P("Drum mic", "Shure SM57", [0.5, 2.8, -1.5], [0, 2.75, -0.7], "6–12 in", "Cardioid; clamp or short boom."),
          ),
        ],
      },
      {
        n: "Marching baritone",
        k: "marchBari",
        tags: "brass marching baritone euphonium",
        post: "standing",
        t: [
          T(
            "Bell spot",
            "Aim slightly off the forward bell, with a clear lane for movement.",
            P(
              "Bell mic",
              "Shure SM57",
              [0.45, 3.35, -2.05],
              [0, 3.25, -0.92],
              "12–24 in",
              "Cardioid; keep the stand out of the marcher path.",
            ),
          ),
        ],
      },
      /* Sound effects (BACKLOG B0a, Tom 2026-10-29): non-musical sources for game / foley recording, with the same
         placement, pattern, bleed and pad checks. `spl`: dB SPL at 1 m when no planner source level exists (the
         saw's from NIOSH's sound power figures, about 103–108 dBA cutting, less about 8 dB at 1 m). */
      {
        n: "Power saw (cutting wood)",
        k: "saw",
        tags: "effects sound effects foley power tool saw",
        post: "standing",
        spl: 100,
        t: [
          T(
            "Close + perspective",
            "Close mic to the side of the cut, away from the blade line and the dust port; a stereo pair farther back for the room. Hearing protection for everyone.",
            P("Close mic", "Shure SM57", [-1.4, 3.0, -2.2], [0.25, 2.45, -1.45], "2–3 ft", "Cardioid dynamic; out of the blade line and the sawdust."),
            P("Perspective pair", "Rode NT4 (XY stereo)", [-1.5, 5.0, -8], [0.25, 2.45, -1.45], "6–10 ft", "XY stereo; the saw in its space."),
          ),
          T(
            "Single mic",
            "One cardioid 3–4 ft to the side of the cut, at bench height; move back if the motor whine drowns the cut.",
            P("Saw mic", "Shure SM57", [-2.3, 2.9, -3.0], [0.25, 2.45, -1.45], "3–4 ft", "Cardioid; aim at the cut, not the motor."),
          ),
        ],
      },
      {
        n: "Footsteps (foley)",
        k: "steps",
        tags: "effects sound effects foley footsteps",
        post: "standing",
        t: [
          T(
            "Close foley mic",
            "One mic in front of the feet, 1–3 ft away and a foot or two off the floor, on a shock mount; keep the distance the same for every take.",
            P("Feet mic", "AKG C414 XLII", [0, 1.6, -2.2], [0, 0.1, -0.2], "1–3 ft", "Cardioid; shock-mounted; aim between the feet."),
          ),
          T(
            "Close + room",
            "The close mic for texture, a room mic 6–10 ft back for space; blend to match the picture.",
            P("Feet mic", "AKG C414 XLII", [0, 1.6, -2.2], [0, 0.1, -0.2], "1–3 ft", "Cardioid; shock-mounted."),
            P("Room mic", "Rode NT1", [2.5, 5, -7.5], [0, 0.2, -0.2], "6–10 ft", "Cardioid; the space around the steps."),
          ),
        ],
      },
      {
        n: "Door (open, close, slam)",
        k: "door",
        tags: "effects sound effects foley door",
        post: "standing",
        t: [
          T(
            "Latch + room",
            "A close mic on the latch side for the click and the slam, a room mic for the body of the door; both on the performer's side.",
            P("Latch mic", "Shure SM57", [1.3, 3.8, -0.9], [0.3, 3.2, -1.55], "1–2 ft", "Cardioid; the latch and handle detail."),
            P("Room mic", "AKG C414 XLII", [5, 5.5, -0.6], [-1, 3.3, -1.6], "6–8 ft", "Cardioid; pad on for slams."),
          ),
        ],
      },
      /* More sound effects (BACKLOG B0a). `spl` is the planner's own estimate of the peak level at 1 m (no measured
         source for these): hammer on an anvil about 105, a car's exhaust about 95, pouring water about 70, a small
         group applauding about 85. The pad check uses it, so it compares setups rather than measuring. */
      {
        n: "Impacts (hammer on metal)",
        k: "hit",
        tags: "effects sound effects foley impact hammer metal",
        post: "standing",
        spl: 105,
        t: [
          T(
            "Close + perspective",
            "A close dynamic to the side of the strike, out of the line of flying chips, and a stereo pair back for the space; leave plenty of headroom.",
            P("Close mic", "Shure SM57", [-1.3, 3.1, -2.3], [0, 2.75, -1.4], "2–3 ft", "Cardioid dynamic; out of the strike's line."),
            P("Perspective pair", "Rode NT4 (XY stereo)", [-1.5, 5.0, -8], [0, 2.75, -1.4], "6–10 ft", "XY stereo; the hit in its room."),
          ),
          T(
            "Single mic",
            "One cardioid 3 ft to the side and a little above the anvil; move back for a rounder sound.",
            P("Impact mic", "Shure SM57", [-2.1, 3.6, -2.4], [0, 2.75, -1.4], "3 ft", "Cardioid; aim at the striking spot."),
          ),
        ],
      },
      {
        n: "Car engine and exhaust",
        k: "car",
        tags: "effects sound effects foley vehicle car engine exhaust",
        post: "standing",
        spl: 95,
        frame: [2.5, -9, 28], // camera target y, z and distance: the car is long
        t: [
          T(
            "Tailpipe + body",
            "The exhaust mic goes off to the side of the pipe, never in the exhaust stream; a second mic farther back picks up the body and pipe howl. Keep wind protection on both.",
            P("Exhaust mic", "Shure SM57", [3.2, 1.3, -3.6], [0.9, 0.9, -5.4], "about 3 ft", "Cardioid dynamic; about 50° off the pipe's axis, windscreen on."),
            P("Body mic", "AKG C414 XLII", [-4, 4.5, -1], [0, 2.5, -8.5], "10–12 ft", "Cardioid; the car as a whole."),
          ),
          T(
            "Single mic",
            "One mic to the side of the rear bumper at about waist height, angled across the tailpipe, not at it.",
            P("Car mic", "Shure SM57", [3.4, 2.6, -2.8], [0.5, 1.5, -5.6], "4 ft", "Cardioid; off-axis, windscreen on."),
          ),
        ],
      },
      {
        n: "Water pouring",
        k: "water",
        tags: "effects sound effects foley water pour splash",
        post: "standing",
        spl: 70,
        t: [
          T(
            "Close mic",
            "A condenser 1–2 ft away at the side of the bucket, with a windscreen against splashes; plastic and towels on the floor.",
            P("Water mic", "Rode NT1", [-1.4, 3.4, -2.3], [0.1, 2.4, -1.5], "1–2 ft", "Cardioid; windscreen on; out of the splash zone."),
          ),
          T(
            "Close + room",
            "The close mic for the texture and a room mic farther back for the space around the pour.",
            P("Water mic", "Rode NT1", [-1.4, 3.4, -2.3], [0.1, 2.4, -1.5], "1–2 ft", "Cardioid; windscreen on."),
            P("Room mic", "AKG C414 XLII", [2.6, 5.0, -6.5], [0.1, 2.4, -1.5], "6–8 ft", "Cardioid; the room around the pour."),
          ),
        ],
      },
      {
        n: "Applause (small group)",
        k: "clap",
        tags: "effects sound effects foley applause crowd claps",
        post: "standing",
        spl: 85,
        frame: [3.5, -3.5, 19],
        t: [
          T(
            "Spaced pair above the group",
            "Two cardioids high above and in front of the group, aimed down at it, away from any PA.",
            P("Crowd mic L", "AKG C414 XLII", [-3.5, 8.5, -1.5], [-1.4, 3.4, -5.5], "about 10 ft", "Cardioid; high and angled down."),
            P("Crowd mic R", "AKG C414 XLII", [3.5, 8.5, -1.5], [1.4, 3.4, -5.5], "about 10 ft", "Cardioid; matches the left mic."),
          ),
          T(
            "Single mic",
            "One mic high in front of the group, aimed at its middle.",
            P("Crowd mic", "AKG C414 XLII", [0, 8.5, -1.5], [0, 3.4, -5.5], "about 10 ft", "Cardioid; high and angled down."),
          ),
        ],
      },
    ];
  G.find((x) => x.n === "Bass amp").t[0].di = "Single-channel DI box";
  let R,
    sc,
    cam,
    tar,
    orb = { r: 14, th: -0.72, ph: 1.05 },
    twoD = { h: 22, rot: 0 },
    view = "3d",
    pick = {};
  const cv = $("mgCanvas"),
    V = (x, y, z) => new THREE.Vector3(x, y, z);
  const mat = (c, o = 1) =>
    new THREE.MeshStandardMaterial({
      color: c,
      roughness: 0.58,
      metalness: 0.08,
      transparent: o < 1,
      opacity: o,
      side: THREE.DoubleSide,
      depthWrite: o > 0.5,
    });
  /* First review set: CC0 GLBs. The two reviewed fixes below are embedded, so opening the
    planner from disk cannot silently substitute a different remote asset. */
  const MODEL_URL = {
    clarinet: "https://cdn.3dassets.dev/assets/39289/v1/model.glb",
    trumpet: "https://cdn.3dassets.dev/assets/39290/v1/model.glb",
    kickToms: "https://cdn.3dassets.dev/assets/33793/v1/model.glb",
    snare: "https://cdn.3dassets.dev/assets/33794/v1/model.glb",
    floorTom: "https://cdn.3dassets.dev/assets/33792/v1/model.glb",
    crash: "https://cdn.3dassets.dev/assets/33791/v1/model.glb",
    hihat: "https://cdn.3dassets.dev/assets/33795/v1/model.glb",
    throne: "https://cdn.3dassets.dev/assets/33828/v1/model.glb",
    boomMic: "https://cdn.3dassets.dev/assets/33801/v1/model.glb",
  };
  const modelCache = {},
    modelLoading = {},
    modelAnimations = {};
  function model(key, place) {
    const source = modelCache[key];
    if (source) {
      const o = key === "performer" && THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(source) : source.clone(true);
      place(o);
      sc.add(o);
      return true;
    }
    if (!modelLoading[key] && window.THREE && THREE.GLTFLoader) {
      modelLoading[key] = true;
      // Say what's happening while a model downloads, so an empty scene doesn't look broken.
      const label = { performer: "the 3D performer", sax: "the saxophone" }[key];
      if (label) loadingMsg(key, `Loading ${label}…`);
      const done = (g) => {
          modelCache[key] = g.scene;
          modelAnimations[key] = g.animations || [];
          loadingMsg(key, null);
          setTimeout(build, 0);
        },
        failed = () => {
          modelLoading[key] = "failed";
          loadingMsg(key, null);
        },
        loader = new THREE.GLTFLoader(),
        parse = () => {
          const embedded = { performer: window.GUIDE_PERFORMER_B64, sax: window.GUIDE_ALTO_SAX_B64 }[key];
          if (embedded) {
            try {
              const text = atob(embedded),
                bytes = new Uint8Array(text.length);
              for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
              loader.parse(bytes.buffer, "", done, failed);
            } catch (e) {
              console.warn("[guide] model", key, e);
              failed();
            }
          } else loader.load(MODEL_URL[key], done, undefined, failed);
        };
      // The performer (~4 MB since 2026-11-11, was 21 MB) and sax load the first time the guide needs them (js/load-data.js).
      const file = { performer: "guide-performer", sax: "guide-alto-sax" }[key];
      if (file) loadData(file).then(parse, parse);
      else parse();
    }
    return false;
  }
  const loadingNow = {};
  function loadingMsg(key, text) {
    if (text) loadingNow[key] = text;
    else delete loadingNow[key];
    const box = $("mgLoading"),
      msgs = Object.values(loadingNow);
    box.hidden = !msgs.length;
    box.textContent = msgs.join(" ");
  }
  function putModel(key, pos, rot, scale = 3.28084) {
    return model(key, (o) => {
      o.scale.multiplyScalar(scale);
      o.rotation.set(rot[0], rot[1], rot[2]);
      o.position.copy(pos);
      o.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
        }
      });
    });
  }
  function performerBone(o, name) {
    let found;
    o.traverse((n) => {
      if (n.isBone && n.name.replace(/^mixamorig:?/, "") === name) found = n;
    });
    return found;
  }
  function performerBounds(o, accept = () => true) {
    o.updateMatrixWorld(true);
    const box = new THREE.Box3(),
      p = new THREE.Vector3();
    o.traverse((n) => {
      if (!n.isMesh) return;
      if (n.isSkinnedMesh) n.skeleton.update();
      const a = n.geometry.attributes.position;
      for (let i = 0; i < a.count; i++) {
        p.fromBufferAttribute(a, i);
        if (n.isSkinnedMesh) n.boneTransform(i, p);
        p.applyMatrix4(n.matrixWorld);
        if (accept(p)) box.expandByPoint(p);
      }
    });
    return box;
  }
  function pointArm(o, side, elbow, hand) {
    const upper = performerBone(o, side + "Arm"),
      fore = performerBone(o, side + "ForeArm"),
      p = new THREE.Vector3(),
      c = new THREE.Vector3(),
      want = new THREE.Vector3(),
      world = new THREE.Quaternion(),
      parent = new THREE.Quaternion(),
      delta = new THREE.Quaternion();
    const point = (bone, child, target) => {
      if (!bone || !child) return;
      bone.updateWorldMatrix(true, true);
      bone.getWorldPosition(p);
      child.getWorldPosition(c);
      const rest = c.sub(p).normalize();
      want.copy(target).sub(p).normalize();
      bone.getWorldQuaternion(world);
      delta.setFromUnitVectors(rest, want);
      world.premultiply(delta);
      if (bone.parent) bone.parent.getWorldQuaternion(parent).invert();
      else parent.identity();
      bone.quaternion.copy(parent.multiply(world));
      bone.updateWorldMatrix(true, true);
    };
    if (upper && fore) {
      const wrist = performerBone(o, side + "Hand");
      o.updateMatrixWorld(true);
      const a = upper.getWorldPosition(V(0, 0, 0)),
        b = fore.getWorldPosition(V(0, 0, 0)),
        w = wrist.getWorldPosition(V(0, 0, 0)),
        l1 = a.distanceTo(b),
        l2 = b.distanceTo(w),
        axis = hand.clone().sub(a),
        d = Math.max(Math.abs(l1 - l2) + 0.001, Math.min(axis.length(), l1 + l2 - 0.001));
      axis.normalize();
      hand = a.clone().addScaledVector(axis, d);
      const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d),
        bend = elbow.clone().sub(a);
      bend.addScaledVector(axis, -bend.dot(axis));
      if (bend.lengthSq() < 0.0001) bend.set(0, 0, 1).addScaledVector(axis, -axis.z);
      bend.normalize();
      elbow = a
        .clone()
        .addScaledVector(axis, along)
        .addScaledVector(bend, Math.sqrt(Math.max(0, l1 * l1 - along * along)));
    }
    point(upper, fore, elbow);
    point(fore, performerBone(o, side + "Hand"), hand);
  }
  /* Rotate one bone so its child points at target (world space). */
  function pointBone(bone, child, target) {
    bone.updateWorldMatrix(true, true);
    const p = bone.getWorldPosition(V(0, 0, 0)),
      rest = child.getWorldPosition(V(0, 0, 0)).sub(p).normalize(),
      want = target.clone().sub(p).normalize(),
      world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(new THREE.Quaternion().setFromUnitVectors(rest, want)),
      parent = bone.parent ? bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert() : new THREE.Quaternion();
    bone.quaternion.copy(parent.multiply(world));
    bone.updateWorldMatrix(true, true);
  }
  function naturalRestPose(o) {
    for (const side of ["Left", "Right"]) {
      const shoulder = performerBone(o, side + "Arm").getWorldPosition(V(0, 0, 0)),
        s = side === "Left" ? -1 : 1;
      pointArm(
        o,
        side,
        shoulder.clone().add(V(s * 0.08, -0.85, 0.02)),
        shoulder.clone().add(V(s * 0.13, -1.65, -0.08)),
      );
    }
    o.updateMatrixWorld(true);
  }
  let guideSeatY = 1.43;
  function modelPlayer(post, k) {
    return model("performer", (o) => {
      const seated = post === "sitting";
      o.name = "guide-performer";
      o.userData.asset = "performer-meshy-v1";
      // Pose an independent skeleton. Never reuse the old seated person or bend knees by guessed Euler angles.
      o.traverse((n) => {
        if (n.isSkinnedMesh) n.skeleton.pose();
      });
      o.updateMatrixWorld(true);
      const height = performerBounds(o).getSize(V(0, 0, 0)).y;
      o.scale.setScalar((5 + 8 / 12) / height);
      o.rotation.y = Math.PI;
      if (seated) {
        const clip = (modelAnimations.performer || []).find((a) => a.name === "Chair_Sit_Idle_M");
        if (clip) {
          const mixer = new THREE.AnimationMixer(o);
          mixer.clipAction(clip).play();
          mixer.setTime(0.1);
        }
      }
      o.updateMatrixWorld(true);
      const hips = performerBone(o, "Hips").getWorldPosition(V(0, 0, 0));
      o.position.x -= hips.x;
      o.position.z += (seated ? 1.05 : 0) - hips.z;
      o.position.y += 0.01 - performerBounds(o).min.y;
      o.updateMatrixWorld(true);
      if (seated) {
        const h = performerBone(o, "Hips").getWorldPosition(V(0, 0, 0));
        const seat = performerBounds(
          o,
          (p) => Math.abs(p.x) < 0.36 && p.z > h.z - 0.08 && p.z < h.z + 0.3 && p.y < h.y,
        );
        guideSeatY = seat.isEmpty() ? 1.43 : seat.min.y - 0.07;
      }
      const g = rig(k);
      if (g)
        ["Left", "Right"].forEach((side, i) => {
          const shoulder = performerBone(o, side + "Arm").getWorldPosition(V(0, 0, 0));
          pointArm(o, side, g.elbows ? g.elbows[i] : shoulder.clone().add(V(i ? 0.45 : -0.45, -0.75, 0.1)), g.hands[i]);
          // Turn the hand toward the instrument (its nearest point), so the fingers wrap it instead of pointing up.
          const hand = performerBone(o, side + "Hand"),
            finger = performerBone(o, side + "HandMiddle1");
          if (hand && finger) {
            o.updateMatrixWorld(true);
            const w = hand.getWorldPosition(V(0, 0, 0)),
              grip = g.d ? at(g.a, g.d, Math.max(0, Math.min(g.len, w.clone().sub(g.a).dot(g.d)))) : g.c || w.clone().add(V(0, 0, -1));
            if (grip.distanceTo(w) > 0.05) pointBone(hand, finger, w.clone().add(grip.sub(w).normalize().multiplyScalar(0.4)));
          }
        });
      else if (k === "vocal" || k === "amp" || k === "steps") naturalRestPose(o);
      else if (k === "saw" || k === "door" || k === "hit" || k === "water" || k === "clap" || k === "car") {
        // saw: both hands on the saw's handles; door: right hand on the handle, left at rest; hit: hammer raised in the
        // right hand; water: both hands on the jug; clap: hands together; car: at rest
        const hands =
          k === "saw" ? [V(0.05, 2.75, -1.25), V(0.45, 2.85, -1.05)]
          : k === "hit" ? [null, V(0.35, 3.5, -1.35)]
          : k === "water" ? [V(-0.05, 3.0, -1.1), V(0.3, 3.05, -1.15)]
          : k === "clap" ? [V(-0.12, 3.5, -0.95), V(0.12, 3.5, -0.95)]
          : k === "car" ? [null, null]
          : [null, V(0.3, 3.2, -1.45)];
        ["Left", "Right"].forEach((side, i) => {
          const shoulder = performerBone(o, side + "Arm").getWorldPosition(V(0, 0, 0));
          if (!hands[i]) return pointArm(o, side, shoulder.clone().add(V(-0.08, -0.85, 0.02)), shoulder.clone().add(V(-0.13, -1.65, -0.08)));
          pointArm(o, side, shoulder.clone().add(V(i ? 0.35 : -0.35, -0.7, -0.35)), hands[i]);
        });
      }
      else if (["clarinet", "sax", "trumpet", "flute", "violin"].includes(k)) {
        const hands =
          k === "sax"
            ? [
                [-0.18, 3.47, -0.73],
                [0.2, 2.88, -0.73],
              ]
            : k === "clarinet"
              ? [
                  [-0.22, 3.55, -0.74],
                  [0.22, 3.02, -0.74],
                ]
              : k === "trumpet"
                ? [
                    [-0.22, 3.67, -0.84],
                    [0.24, 3.67, -0.84],
                  ]
                : k === "flute"
                  ? [
                      [-0.7, 3.55, -0.75],
                      [0.55, 3.55, -0.75],
                    ]
                  : [
                      [-0.45, 3.85, -0.7],
                      [0.5, 3.48, -0.82],
                    ];
        ["Left", "Right"].forEach((side, i) => {
          const shoulder = performerBone(o, side + "Arm").getWorldPosition(V(0, 0, 0));
          pointArm(o, side, shoulder.clone().add(V(i ? 0.3 : -0.3, -0.65, -0.3)), V(...hands[i]));
        });
      } else if (k === "drums" || k === "piano") {
        const h = performerBone(o, "Hips").getWorldPosition(V(0, 0, 0));
        for (const side of ["Left", "Right"]) {
          const s = side === "Left" ? -1 : 1;
          pointArm(o, side, V(s * 0.85, h.y + 0.7, h.z - 0.35), V(s * 0.7, h.y + 0.55, h.z - 1.25));
        }
      }
      o.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
          n.frustumCulled = false;
        }
      });
    });
  }
  /* Build your own drum kit (BACKLOG B1): the last Drum kit setup is generated from these choices, so the channel
     count, bleed (3:1), polarity and overhead checks work on the exact kit before it goes into the planner.
     Coordinates follow the guide's kit: drummer seated at z ≈ 1.05 facing −z, the drummer's left is −x. */
  const KIT_DEFAULT = { snares: 1, racks: 1, floors: 1, hh: 1, ride: 1, crashes: 1, splash: 0, kick: "out", snareBottom: 0, tomMics: 1, hhMic: 0, rideMic: 0, oh: "spaced", room: 0, aux: 0, auxMic: 0 },
    KIT_KEY = "rt-fh-guide-kit-v1",
    KIT_TECH = ["Build your own kit", "", []];
  let kit = { ...KIT_DEFAULT };
  try {
    kit = { ...KIT_DEFAULT, ...(store.getJSON(KIT_KEY, null, "custom drum kit") || {}) };
  } catch (e) {
    kit = { ...KIT_DEFAULT };
  }
  const isKit = (t) => t === KIT_TECH;
  let KIT_DIST = null; // distances in inches for the current kit (see kitDistances)
  window.KIT_DIST_FOR_TEST = () => KIT_DIST; // test hook
  /* The pieces: drums carry c (shell centre), r, h; cymbals carry c (centre) and r. top = where a mic aims. */
  function kitPieces() {
    const P = [],
      drum = (id, label, c, r, h) => P.push({ id, label, kind: "drum", c, r, h, top: c.clone().add(V(0, h / 2, 0)) }),
      cym = (id, label, c, r) => P.push({ id, label, kind: "cym", c, r, top: c.clone() });
    P.push({ id: "kick", label: "Kick", kind: "kick", c: V(0, 0.96, -0.72), r: 0.94, h: 0.7, top: V(0, 0.96, -1.07) });
    drum("sn1", "Snare", V(-0.72, 1.48, -0.08), 0.42, 0.3);
    if (kit.snares > 1) drum("sn2", "Snare 2", V(-1.08, 1.78, -0.88), 0.33, 0.22);
    const racks = kit.racks === 2 ? [V(-0.3, 2.05, -0.5), V(0.45, 2.05, -0.45)] : kit.racks === 1 ? [V(0.08, 2.05, -0.48)] : [];
    racks.forEach((c, i) => drum("rt" + i, racks.length > 1 ? `Rack tom ${i + 1}` : "Rack tom", c, 0.38, 0.3));
    const floors = kit.floors === 2 ? [V(1.32, 1.16, 0.0), V(1.95, 1.1, 0.85)] : kit.floors === 1 ? [V(1.42, 1.16, 0.18)] : [];
    floors.forEach((c, i) => drum("ft" + i, floors.length > 1 ? `Floor tom ${i + 1}` : "Floor tom", c, i ? 0.6 : 0.55, 0.76));
    if (kit.hh) cym("hh", "Hi-hat", V(-1.72, 2.16, -0.52), 0.42);
    if (kit.ride) cym("ride", "Ride", V(1.72, 2.65, -0.06), 0.62);
    const crashes = kit.crashes === 2 ? [V(-1.2, 3.0, -0.95), V(1.05, 3.15, -0.95)] : kit.crashes === 1 ? [V(-1.2, 3.0, -0.95)] : [];
    crashes.forEach((c, i) => cym("cr" + i, crashes.length > 1 ? `Crash ${i + 1}` : "Crash", c, 0.5));
    if (kit.splash) cym("sp", "Splash", V(0.2, 2.95, -1.05), 0.28);
    /* Aux percussion (clamped near the hi-hat): 1 = cowbell and tambourine, 2 = adds a wood block. Small sources the
       overheads cover; they count for bleed, and can have a mic of their own. */
    const aux = (id, label, c, r) => P.push({ id, label, kind: "aux", c, r, top: c.clone() });
    if (kit.aux >= 1) {
      aux("cb", "Cowbell", V(-1.95, 2.7, -1.12), 0.14);
      aux("tb", "Tambourine", V(-1.55, 2.55, -1.28), 0.2);
    }
    if (kit.aux >= 2) aux("wb", "Wood block", V(-0.95, 2.62, -1.2), 0.12);
    return P;
  }
  /* The mics for the current choices, as guide slots: [label, model, p, q, distance, note], plus the piece each close
     mic belongs to (for the 3:1 check). */
  function kitMics(P) {
    const M = [],
      a = (v) => v.toArray().map((x) => +x.toFixed(2)),
      add = (label, model, p, q, dist, note, piece) => {
        const s = [label, model, a(p), a(q), dist, note];
        s.piece = piece;
        M.push(s);
      },
      close = (pc, label, note) => {
        const T = pc.top;
        add(label, "Shure SM57", T.clone().add(V(0, 0.15, -pc.r - 0.06)), T.clone().add(V(0, 0, -pc.r * 0.45)), "2–4 in", note, pc);
      };
    const kick = P[0];
    if (kit.kick === "in" || kit.kick === "both")
      add("Kick in", "Shure Beta 52A", V(0.05, 0.98, -0.85), V(0, 0.96, -0.4), "inside, 4–8 in from the beater", "Supercardioid; attack and click.", kick);
    if (kit.kick === "out" || kit.kick === "both")
      add(kit.kick === "both" ? "Kick out" : "Kick", "Shure Beta 52A", V(0, 1.0, -1.75), V(0, 0.96, -1.07), "6–12 in outside the front head", "Supercardioid; more boom and shell.", kick);
    const sn = P.find((x) => x.id === "sn1");
    close(sn, "Snare top", "Cardioid; aim away from the hi-hat.");
    if (kit.snareBottom) {
      const B = sn.c.clone().add(V(0, -sn.h / 2, 0));
      add("Snare bottom", "Shure SM57", B.clone().add(V(0, -0.18, -sn.r - 0.05)), B.clone().add(V(0, 0, -sn.r * 0.45)), "2–4 in", "Flip polarity against the snare top mic.", sn);
    }
    P.filter((x) => x.id === "sn2").forEach((pc) => close(pc, "Snare 2", "Cardioid."));
    if (kit.tomMics) P.filter((x) => /^(rt|ft)/.test(x.id)).forEach((pc) => close(pc, pc.label, "Cardioid; clip-on or short boom."));
    const hh = P.find((x) => x.id === "hh"),
      ride = P.find((x) => x.id === "ride");
    if (kit.hhMic && hh) add("Hi-hat", "Sennheiser e614", hh.c.clone().add(V(0.15, 0.5, -0.45)), hh.c.clone().add(V(0, 0, -0.18)), "4–8 in", "Aim away from the snare.", hh);
    if (kit.rideMic && ride) add("Ride", "Sennheiser e614", ride.c.clone().add(V(0.1, 0.55, -0.55)), ride.c.clone().add(V(0, 0, -0.3)), "6–12 in", "From above, toward the bell.", ride);
    if (kit.oh === "spaced") {
      // Both overheads exactly the same distance from the snare: the right one is lowered until it matches.
      const T = sn.top,
        L = V(-1.6, 4.5, -0.6),
        dL = L.distanceTo(T),
        R0 = V(1.5, 0, -0.6),
        dy = Math.sqrt(Math.max(0.5, dL * dL - (R0.x - T.x) ** 2 - (R0.z - T.z) ** 2));
      add("Overhead L", "Rode NT5", L, T, "3–4 ft", "Same distance to the snare as Overhead R.");
      add("Overhead R", "Rode NT5", V(R0.x, T.y + dy, R0.z), T, "3–4 ft", "Same distance to the snare as Overhead L.");
    } else if (kit.oh === "glyn") {
      /* Glyn Johns: one mic about 3.5 ft straight above the snare, the other on the drummer's right (near the floor
         tom) at exactly the same distance from the snare (use a tape measure), both aimed at the snare. */
      const T = sn.top,
        d1 = 3.5,
        M1 = T.clone().add(V(0, d1, 0)),
        y2 = 2.25,
        x2 = 2.3,
        dz = Math.sqrt(Math.max(0.2, d1 * d1 - (x2 - T.x) ** 2 - (y2 - T.y) ** 2));
      add("Overhead 1 (above snare)", "Rode NT5", M1, T, "3½ ft above the snare", "Cardioid; straight down at the snare. Same distance to the snare as Overhead 2.");
      add("Overhead 2 (Glyn Johns)", "Rode NT5", V(x2, y2, T.z - dz), T, "3½ ft from the snare", "Cardioid; level with the floor tom's rim, aimed at the snare. Measure it to the snare.");
    } else if (kit.oh === "xy")
      add("XY overhead", "Rode NT4 (XY stereo)", V(sn.top.x + 0.7, 4.8, -0.2), V(0.1, 1.6, -0.4), "3–4 ft above the kit", "XY pair; mono-safe stereo image.");
    const auxP = P.filter((x) => x.kind === "aux");
    if (kit.auxMic && auxP.length) {
      const c = auxP.reduce((a, x) => a.add(x.c), V(0, 0, 0)).multiplyScalar(1 / auxP.length);
      add("Aux percussion", "Shure SM57", c.clone().add(V(-0.1, 0.7, -0.7)), c, "6–10 in", "Cardioid; one mic for the aux pieces, aimed away from the hi-hat.", auxP[0]);
    }
    if (kit.room) add("Room mic", "AKG C414 XLII", V(0.5, 5.0, -7), V(0, 2, -0.5), "6–10 ft", "Blend under the kit for size; check its delay.");
    return M;
  }
  /* 3:1 rule: a close mic should be at least three times as far from any other source as from its own. */
  function kitBleed(P, M) {
    const out = [];
    for (const s of M) {
      if (!s.piece || /^Overhead|XY|Room|Aux/.test(s[0])) continue;
      const p = V(...s[2]),
        own = p.distanceTo(V(...s[3]));
      for (const o of P) {
        if (o.id === s.piece.id || (o.id === "hh" && /Snare bottom/.test(s[0]))) continue;
        const ratio = p.distanceTo(o.top) / own;
        if (ratio < 3) out.push({ ratio, text: `${s[0]} is only ${ratio.toFixed(1)}× as far from the ${o.label.toLowerCase()} as from its own source (3:1): expect bleed; aim it away${/tom|Kick/.test(s[0]) ? " or gate it" : ""}.` });
      }
    }
    return out.sort((a, b) => a.ratio - b.ratio);
  }
  const feetIn = (ft) => {
    const t = Math.round(ft * 12);
    return t >= 12 ? `${Math.floor(t / 12)} ft ${t % 12} in` : `${t} in`;
  };
  /* Overhead-to-snare distances and each close mic's distance to its own piece, in feet and inches. */
  function kitDistances(P, M) {
    const sn = P.find((x) => x.id === "sn1"),
      oh = M.filter((s) => /^Overhead/.test(s[0])),
      rows = [];
    oh.forEach((s) => rows.push({ mic: s[0], to: "snare", ft: V(...s[2]).distanceTo(sn.top), overhead: true }));
    M.filter((s) => s.piece && !/^Overhead|XY|Room/.test(s[0])).forEach((s) => rows.push({ mic: s[0], to: s.piece.label.toLowerCase(), ft: V(...s[2]).distanceTo(V(...s[3])) }));
    const d = oh.map((s) => V(...s[2]).distanceTo(sn.top)),
      gap = d.length === 2 ? Math.abs(d[0] - d[1]) : null;
    return { rows, gap, glyn: kit.oh === "glyn", height: oh[0] && kit.oh === "glyn" ? oh[0][2][1] - sn.top.y : null };
  }
  function kitRefresh() {
    const P = kitPieces(),
      M = kitMics(P),
      n = M.length + (M.some((s) => /XY/.test(s[0])) ? 1 : 0);
    KIT_TECH[2] = M;
    KIT_DIST = kitDistances(P, M);
    const pol = [kit.snareBottom && "snare top and bottom", kit.kick === "both" && "kick in and out"].filter(Boolean);
    KIT_TECH[1] =
      `${n} channel${n === 1 ? "" : "s"} for ${P.length} pieces. ` +
      (pol.length ? `Check polarity between ${pol.join(" and ")}. ` : "") +
      (kit.oh === "spaced" ? "The overheads are placed the same distance from the snare. " : kit.oh === "glyn" ? "Glyn Johns: both overheads the same distance from the snare (measure with a tape). " : kit.oh === "none" ? "No overheads: the cymbals have no mic of their own unless you add hi-hat or ride mics. " : "") +
      "Warnings below flag close mics that break the 3:1 rule.";
    return { P, M };
  }
  function kitDistHtml() {
    const D = KIT_DIST;
    if (!D || !D.rows.length) return "";
    const ok = D.gap == null || D.gap <= 1 / 12 + 1e-6;
    return (
      `<table class="mgKitDist" aria-label="Distances in feet and inches"><tr><th>Mic</th><th>to</th><th>distance</th></tr>` +
      D.rows.map((r) => `<tr><td>${r.mic}</td><td>${r.to}</td><td>${feetIn(r.ft)}</td></tr>`).join("") +
      `</table>` +
      (D.gap != null ? `<div class="${ok ? "m" : "err"}" id="mgOhGap">Overheads differ by ${feetIn(D.gap)} from the snare${ok ? ": matched (within 1 in)." : ": move one until they match (aim for within 1 in)."}</div>` : "") +
      (D.glyn && D.height != null ? `<div class="m">Glyn Johns: the first mic is ${feetIn(D.height)} above the snare${D.height >= 3 && D.height <= 4 ? "" : " (3–4 ft is the usual starting point)"}.</div>` : "")
    );
  }
  function kitUI(show) {
    const box = $("mgKit");
    if (!box) return;
    box.hidden = !show;
    if (!show) return;
    const sel = (key, label, opts) =>
      `<label class="m">${label} <select data-kit="${key}">${opts.map(([v, t]) => `<option value="${v}"${String(kit[key]) === String(v) ? " selected" : ""}>${t}</option>`).join("")}</select></label>`;
    const n = (a) => a.map((v) => [v, String(v)]),
      yn = [[1, "Yes"], [0, "No"]];
    box.innerHTML =
      `<div class="row">${sel("snares", "Snares", n([1, 2]))}${sel("racks", "Rack toms", n([0, 1, 2]))}${sel("floors", "Floor toms", n([0, 1, 2]))}</div>` +
      `<div class="row">${sel("hh", "Hi-hat", yn)}${sel("ride", "Ride", yn)}${sel("crashes", "Crashes", n([0, 1, 2]))}${sel("splash", "Splash", yn)}</div>` +
      `<div class="row">${sel("kick", "Kick mic", [["out", "Outside"], ["in", "Inside"], ["both", "In and out"]])}${sel("snareBottom", "Snare bottom mic", yn)}${sel("tomMics", "Tom mics", yn)}</div>` +
      `<div class="row">${sel("hhMic", "Hi-hat mic", yn)}${sel("rideMic", "Ride mic", yn)}${sel("oh", "Overheads", [["spaced", "Spaced pair"], ["glyn", "Glyn Johns"], ["xy", "XY pair"], ["none", "None"]])}${sel("room", "Room mic", yn)}</div>` +
      `<div class="row">${sel("aux", "Aux percussion", [[0, "None"], [1, "Cowbell + tambourine"], [2, "Cowbell, tambourine, wood block"]])}${sel("auxMic", "Aux mic", yn)}</div>` +
      kitDistHtml();
    box.querySelectorAll("[data-kit]").forEach(
      (e) =>
        (e.onchange = () => {
          const v = e.value;
          kit[e.dataset.kit] = /^\d+$/.test(v) ? +v : v;
          try {
            store.setJSON(KIT_KEY, kit);
          } catch (err) {
            /* settings stay for this session */
          }
          pick = {};
          slots();
          build();
        }),
    );
  }
  function customKit() {
    const red = 0xb93634,
      head = 0xf4f0e8,
      metal = 0x7d8993,
      black = 0x1d2329,
      leg = (a, b) => seg(a, b, metal, 0.028);
    for (const pc of kitPieces()) {
      if (pc.kind === "kick") {
        const k = add(new THREE.CylinderGeometry(pc.r, pc.r, pc.h, 28), red, pc.c);
        k.rotation.x = Math.PI / 2;
        [-1, 1].forEach((s) => {
          const face = add(new THREE.CircleGeometry(pc.r * 0.93, 28), head, pc.c.clone().add(V(0, 0, s * (pc.h / 2 + 0.01))));
          face.rotation.y = s < 0 ? Math.PI : 0;
        });
        [-0.62, 0.62].forEach((x) => leg(V(x, 0.54, -0.42), V(x, 0.04, -0.12)));
      } else if (pc.kind === "drum") {
        add(new THREE.CylinderGeometry(pc.r, pc.r, pc.h, 24), red, pc.c);
        add(new THREE.CylinderGeometry(pc.r * 0.93, pc.r * 0.93, 0.042, 24), head, pc.top.clone().add(V(0, 0.022, 0)));
        [-0.7, 0.7].forEach((s) => leg(V(pc.c.x + s * pc.r, pc.c.y - pc.h / 2, pc.c.z), V(pc.c.x + s * pc.r, Math.max(0.02, pc.c.y - pc.h / 2 - 0.55), pc.c.z + 0.08)));
      } else {
        if (pc.id === "hh") [-0.055, 0.055].forEach((dy) => add(new THREE.CylinderGeometry(pc.r, pc.r, 0.025, 24), 0xc5a64c, pc.c.clone().add(V(0, dy, 0))));
        else add(new THREE.CylinderGeometry(pc.r, pc.r, 0.035, 28), 0xc5a64c, pc.c);
        leg(pc.c.clone().add(V(0, -0.03, 0)), V(pc.c.x, 0.14, pc.c.z));
      }
    }
    add(new THREE.CylinderGeometry(0.58, 0.48, 0.14, 20), black, V(0, guideSeatY, 1.05));
    add(new THREE.CylinderGeometry(0.1, 0.1, Math.max(0.1, guideSeatY - 0.12), 12), metal, V(0, (guideSeatY + 0.12) / 2, 1.05));
    for (let a = 0; a < 3; a++) leg(V(0, 0.12, 1.05), V(Math.cos(a * 2.094) * 0.48, 0.02, 1.05 + Math.sin(a * 2.094) * 0.48));
    /* Hardware: tripod bases under the stands, a snare basket, the hi-hat pedal, a kick pedal and beater, tom arms. */
    const tripod = (x, z, r = 0.5) => [0, 1, 2].forEach((a) => leg(V(x, 0.14, z), V(x + Math.cos(a * 2.094 + 0.4) * r, 0.02, z + Math.sin(a * 2.094 + 0.4) * r)));
    const P = kitPieces();
    P.filter((pc) => pc.kind === "cym").forEach((pc) => tripod(pc.c.x, pc.c.z, pc.r > 0.45 ? 0.55 : 0.42));
    const sn = P.find((x) => x.id === "sn1");
    // snare stand: a post and three arms holding the shell
    leg(V(sn.c.x, sn.c.y - sn.h / 2 - 0.04, sn.c.z), V(sn.c.x, 0.16, sn.c.z));
    tripod(sn.c.x, sn.c.z, 0.45);
    [0, 1, 2].forEach((a) => leg(V(sn.c.x, sn.c.y - sn.h / 2 - 0.04, sn.c.z), V(sn.c.x + Math.cos(a * 2.094 + 1.2) * sn.r * 0.95, sn.c.y - sn.h / 2 - 0.02, sn.c.z + Math.sin(a * 2.094 + 1.2) * sn.r * 0.95)));
    // hi-hat pedal and the drummer's right kick pedal with its beater
    const hh = P.find((x) => x.id === "hh");
    if (hh) add(new THREE.BoxGeometry(0.22, 0.05, 0.5), black, V(hh.c.x + 0.05, 0.05, hh.c.z + 0.55));
    add(new THREE.BoxGeometry(0.2, 0.05, 0.5), black, V(0, 0.05, 0.1));
    seg(V(0, 0.1, -0.12), V(0, 0.9, -0.42), metal, 0.022); // beater shaft toward the head
    add(new THREE.SphereGeometry(0.06, 10, 8), 0xe8e4da, V(0, 0.9, -0.42));
    // rack tom arms: from the bass drum up to each rack tom
    P.filter((pc) => /^rt/.test(pc.id)).forEach((pc) => seg(V(pc.c.x, 1.62, -0.78), V(pc.c.x, pc.c.y - pc.h / 2, pc.c.z - pc.r * 0.2), metal, 0.03));
    // boom arms on the crashes and the ride
    P.filter((pc) => pc.kind === "cym" && pc.id !== "hh").forEach((pc) => seg(V(pc.c.x + (pc.c.x > 0 ? 0.4 : -0.4), pc.c.y - 0.22, pc.c.z + 0.2), pc.c.clone().add(V(0, -0.02, 0)), metal, 0.022));
    // aux percussion: a bell, a tambourine ring and a block on a clamped arm
    P.filter((pc) => pc.kind === "aux").forEach((pc) => {
      if (pc.id === "cb") add(new THREE.CylinderGeometry(pc.r * 0.55, pc.r, pc.r * 1.6, 14), 0xb8860b, pc.c);
      else if (pc.id === "tb") add(new THREE.TorusGeometry(pc.r, 0.025, 8, 24), 0xd8b47a, pc.c).rotation.x = Math.PI / 2;
      else add(new THREE.BoxGeometry(pc.r * 2, pc.r, pc.r * 1.2), 0x8a5a2b, pc.c);
      leg(pc.c.clone().add(V(0, -0.1, 0)), V(pc.c.x, 1.5, pc.c.z - 0.3));
    });
    return true;
  }
  function guideDrumKit() {
    if (isKit(source().t[+$("mgTechnique").value])) return customKit();
    const red = 0xb93634,
      head = 0xf4f0e8,
      metal = 0x7d8993,
      black = 0x1d2329,
      leg = (a, b) => seg(a, b, metal, 0.028),
      top = (x, y, z, r) => {
        add(new THREE.CylinderGeometry(r * 0.93, r * 0.93, 0.042, 24), head, V(x, y, z));
      };
    const upright = (x, y, z, r, h) => {
      add(new THREE.CylinderGeometry(r, r, h, 24), red, V(x, y, z));
      top(x, y + h / 2 + 0.022, z, r);
      [-0.7, 0.7].forEach((s) => leg(V(x + s * r, y - h / 2, z), V(x + s * r, y - h / 2 - 0.55, z + 0.08)));
    };
    const kick = add(new THREE.CylinderGeometry(0.94, 0.94, 0.7, 28), red, V(0, 0.96, -0.72));
    kick.rotation.x = Math.PI / 2;
    [-1, 1].forEach((s) => {
      const face = add(new THREE.CircleGeometry(0.87, 28), head, V(0, 0.96, -0.72 + s * 0.36));
      face.rotation.y = s < 0 ? Math.PI : 0;
    });
    [-0.62, 0.62].forEach((x) => leg(V(x, 0.54, -0.42), V(x, 0.04, -0.12)));
    upright(-0.72, 1.48, -0.08, 0.42, 0.3);
    upright(0.45, 1.52, -0.05, 0.38, 0.3);
    upright(1.42, 1.16, 0.18, 0.55, 0.76);
    upright(-1.36, 1.28, 0.02, 0.5, 0.24);
    const cymbal = (x, y, z, r) => {
      add(new THREE.CylinderGeometry(r, r, 0.035, 28), 0xc5a64c, V(x, y, z));
      leg(V(x, y - 0.02, z), V(x, 0.16, z), metal, 0.026);
    };
    cymbal(-1.72, 2.4, -0.16, 0.48);
    cymbal(1.72, 2.65, -0.06, 0.62);
    cymbal(0.08, 2.9, 0.18, 0.5);
    /* Hi-hat pair and a proper round throne behind the kit. */ [-0.055, 0.055].forEach((dy) =>
      add(new THREE.CylinderGeometry(0.42, 0.42, 0.025, 24), 0xc5a64c, V(-1.72, 2.16 + dy, -0.52)),
    );
    leg(V(-1.72, 2.1, -0.52), V(-1.72, 0.12, -0.52), metal, 0.025);
    add(new THREE.CylinderGeometry(0.58, 0.48, 0.14, 20), black, V(0, guideSeatY, 1.05));
    add(
      new THREE.CylinderGeometry(0.1, 0.1, Math.max(0.1, guideSeatY - 0.12), 12),
      metal,
      V(0, (guideSeatY + 0.12) / 2, 1.05),
    );
    for (let a = 0; a < 3; a++)
      leg(V(0, 0.12, 1.05), V(Math.cos(a * 2.094) * 0.48, 0.02, 1.05 + Math.sin(a * 2.094) * 0.48));
    return true;
  }
  /* Held instruments (BACKLOG B-models): one table says where each instrument sits on the performer, measured from
     the performer model (standing mouth about 5 ft up; seated lap for the guitar). The instrument, the hands, the
     sound-source marker and the mics all come from it, so they can't drift apart: the technique's mic positions in G
     keep their distance and angle to the source and move with the instrument (rigShift).
     Fields: a = start (mouthpiece, chin rest, neck joint), d = direction, len = length in ft, hands = [left, right]
     wrist targets, elbows = optional elbow hints, aim = where the mics point, src = [point, direction] of the marker. */
  const MOUTH = V(0, 4.98, -0.36),
    unit = (x, y, z) => V(x, y, z).normalize(),
    at = (a, d, t) => a.clone().addScaledVector(d, t);
  function rig(k) {
    if (k === "trumpet" || k === "marchBari") {
      const big = k === "marchBari",
        d = unit(0, big ? -0.06 : -0.17, -1),
        len = big ? 2.1 : 1.6,
        bell = at(MOUTH, d, len);
      return {
        a: MOUTH,
        d,
        len,
        bell,
        hands: [at(MOUTH, d, len * 0.55).add(V(-0.16, -0.14, 0.12)), at(MOUTH, d, len * 0.42).add(V(0.1, 0.12, 0.16))],
        aim: bell,
        src: [bell, d],
      };
    }
    if (k === "trombone") {
      const d = unit(0, -0.1, -1),
        bell = MOUTH.clone().add(V(-0.34, -0.06, -1.45));
      return {
        a: MOUTH,
        d,
        len: 2.4,
        bell,
        hands: [MOUTH.clone().add(V(-0.2, -0.32, -0.28)), at(MOUTH, d, 1.35).add(V(0.12, -0.28, 0.12))],
        aim: bell,
        src: [bell, V(0, 0, -1)],
      };
    }
    if (k === "clarinet") {
      const d = unit(0, -0.82, -0.57),
        len = 2.15;
      return {
        a: MOUTH,
        d,
        len,
        hands: [at(MOUTH, d, 0.62).add(V(-0.16, 0.02, 0.2)), at(MOUTH, d, 1.3).add(V(0.15, 0.02, 0.2))],
        aim: at(MOUTH, d, 1.35),
        src: [at(MOUTH, d, len), d],
        holes: [0.9, 1.25, 1.6].map((t) => at(MOUTH, d, t)),
      };
    }
    if (k === "flute") {
      const lip = MOUTH.clone().add(V(0, -0.07, -0.08)),
        d = unit(1, -0.18, -0.3),
        a = at(lip, d, -0.28);
      return {
        a,
        d,
        len: 2.2,
        lip,
        hands: [at(lip, d, 0.42).add(V(-0.05, -0.12, 0.18)), at(lip, d, 1.25).add(V(0.02, -0.12, 0.18))],
        elbows: [V(-0.9, 4.1, -0.5), V(1.3, 3.9, 0.1)],
        aim: at(lip, d, 0.3),
        src: [lip, V(0, 0.35, -0.6)],
      };
    }
    if (k === "sax") {
      const top = MOUTH.clone().add(V(0, -0.04, -0.06));
      return {
        a: top,
        d: V(0, -1, 0),
        len: 2.25,
        hands: [top.clone().add(V(-0.12, -0.75, -0.18)), top.clone().add(V(0.08, -1.3, -0.2))],
        aim: top.clone().add(V(0.1, -1.55, -0.55)),
        src: [top.clone().add(V(0.12, -1.25, -0.72)), unit(0.1, 0.25, -1)],
      };
    }
    if (k === "violin") {
      const chin = V(-0.32, 4.62, -0.32),
        d = unit(-0.5, 0.12, -0.86),
        body = at(chin, d, 0.55);
      return {
        a: chin,
        d,
        len: 1.95,
        body,
        hands: [at(chin, d, 1.6).add(V(0.05, -0.15, 0.12)), body.clone().add(V(1.05, -0.3, 0.05))],
        aim: body.clone().add(V(0, 0.1, 0)),
        src: [body.clone().add(V(0, 0.12, 0)), V(0, 1, -0.3)],
      };
    }
    if (k === "guitar") {
      const body = V(0.32, 2.38, 0.12),
        neck0 = V(-0.25, 2.62, 0.1),
        d = unit(-1, 0.38, -0.05);
      return {
        a: neck0,
        d,
        len: 1.55,
        body,
        hands: [at(neck0, d, 0.95).add(V(0.05, -0.25, 0.2)), body.clone().add(V(0.15, 0.32, 0.12))],
        elbows: [V(-1.0, 2.9, 0.5), V(0.9, 3.0, 0.7)],
        aim: neck0.clone().add(V(0.05, 0.02, -0.18)),
        src: [body.clone().add(V(-0.12, 0.08, -0.2)), V(0, 0, -1)],
      };
    }
    if (k === "marchBass") {
      const c = V(0, 3.45, -1.2);
      return {
        c,
        r: 0.85,
        w: 0.75,
        hands: [c.clone().add(V(-0.62, 0.1, 0.15)), c.clone().add(V(0.62, 0.1, 0.15))],
        elbows: [V(-0.9, 3.7, -0.3), V(0.9, 3.7, -0.3)],
        aim: c.clone().add(V(0, 0, -0.85)),
        src: [c.clone().add(V(0.38, 0, 0)), V(1, 0, 0)],
      };
    }
    if (k === "concertBass") {
      const c = V(0, 2.2, -1.25);
      return {
        c,
        r: 1.3,
        w: 0.8,
        hands: [V(-0.75, 2.75, -0.15), V(0.45, 2.9, -0.55)],
        aim: c.clone().add(V(0, 0, -0.4)),
        src: [c.clone().add(V(0, 0, -0.4)), V(0, 0, -1)],
      };
    }
    return null;
  }
  /* Moves a technique's mics with the rigged instrument: the first mic's aim point lands on the rig's aim point, and
     every mic keeps its distance and angle to the source. */
  function rigShift(k, t) {
    const g = rig(k);
    if (!g || !t[2].length) return V(0, 0, 0);
    return g.aim.clone().sub(V(...t[2][0][3]));
  }
  /* Point a downloaded model's bell axis along d with its mouthpiece end at a, scaled to len.
     bellL / upL: the model's own bell and up directions; upW: which way "up" should face in the scene. */
  function fitModel(o, a, d, len, bellL, upL, upW = V(0, 1, 0)) {
    o.rotation.set(0, 0, 0);
    o.position.set(0, 0, 0);
    o.scale.setScalar(1);
    o.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(o),
      size = box.getSize(V(0, 0, 0)),
      ctr = box.getCenter(V(0, 0, 0)),
      along = Math.abs(bellL.x) * size.x + Math.abs(bellL.y) * size.y + Math.abs(bellL.z) * size.z,
      f = len / along,
      mp = ctr.clone().addScaledVector(bellL, -along / 2); // mouthpiece end: the box face opposite the bell
    const side = (u, b) => u.clone().cross(b).normalize(),
      L = new THREE.Matrix4().makeBasis(bellL, upL, side(upL, bellL)),
      up2 = upW.clone().addScaledVector(d, -upW.dot(d)).normalize(),
      W = new THREE.Matrix4().makeBasis(d, up2, side(up2, d)),
      q = new THREE.Quaternion().setFromRotationMatrix(W.multiply(L.transpose()));
    o.quaternion.copy(q);
    o.scale.setScalar(f);
    o.position.copy(a).sub(mp.multiplyScalar(f).applyQuaternion(q));
    o.updateMatrixWorld(true);
  }
  const brassC = 0xd7aa42,
    silverC = 0xcbd3d9;
  function cone(mouth, d, r, len, c) {
    // open cone whose wide end sits at `mouth`, opening along d
    const m = add(new THREE.ConeGeometry(r, len, 20, 1, true), c, at(mouth, d, -len / 2));
    m.quaternion.setFromUnitVectors(V(0, -1, 0), d);
    m.material.side = THREE.DoubleSide;
    return m;
  }
  const lastAdded = () => sc.children[sc.children.length - 1];
  function rigInstrument(k) {
    const g = rig(k);
    if (k === "trumpet") {
      if (!putModel("trumpet", V(0, 0, 0), [0, 0, 0], 1)) return false;
      fitModel(lastAdded(), g.a, g.d, g.len, V(0, 0, 1), V(0, 1, 0));
      return true;
    }
    if (k === "clarinet") {
      if (!putModel("clarinet", V(0, 0, 0), [0, 0, 0], 1)) return false;
      fitModel(lastAdded(), g.a, g.d, g.len, V(-1, 0, 0), V(0, 1, 0), V(0, 0, 1));
      return true;
    }
    if (k === "sax") {
      if (!putModel("sax", V(0, 0, 0), [0, 0, 0], 1)) return false;
      const o = lastAdded();
      o.rotation.set(0, 0, 0);
      o.position.set(0, 0, 0);
      o.scale.setScalar(1);
      o.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(o),
        f = g.len / (box.max.y - box.min.y);
      // The bell opening faces +x in the model: turn it forward and a little to the player's right, tilt slightly.
      o.rotation.set(0.12, Math.PI / 2 - 0.25, 0, "YXZ");
      o.scale.setScalar(f);
      o.updateMatrixWorld(true);
      // Mouthpiece tip: the top of the neck, on the side away from the bell.
      const tip = V(box.min.x + (box.max.x - box.min.x) * 0.06, box.max.y, (box.min.z + box.max.z) / 2).applyMatrix4(o.matrixWorld);
      o.position.add(g.a.clone().sub(tip));
      o.updateMatrixWorld(true);
      // The model comes on a floor stand: clip off everything below the bottom of the bow.
      const cut = new THREE.Box3().setFromObject(o).min.y + g.len * 0.17;
      R.localClippingEnabled = true;
      o.traverse((n) => {
        if (n.isMesh) {
          n.material = n.material.clone();
          n.material.clippingPlanes = [new THREE.Plane(V(0, 1, 0), -cut)];
        }
      });
      return true;
    }
    return false;
  }
  /* Simple shapes for the rigged instruments without a downloaded model (and while a model is still loading). */
  function rigProcedural(k) {
    const g = rig(k);
    if (k === "trumpet" || k === "marchBari") {
      const big = k === "marchBari",
        rB = big ? 0.42 : 0.22,
        flare = big ? 0.75 : 0.5,
        v = at(g.a, g.d, g.len * 0.45);
      seg(g.a, at(g.a, g.d, g.len - flare), brassC, big ? 0.07 : 0.045);
      cone(g.bell, g.d, rB, flare, brassC);
      seg(at(g.a, g.d, g.len * 0.2).add(V(0, -0.14, 0)), at(g.a, g.d, g.len * 0.7).add(V(0, -0.14, 0)), brassC, big ? 0.06 : 0.04);
      [-0.12, 0, 0.12].forEach((o) => seg(at(v, g.d, o).add(V(0, -0.16, 0)), at(v, g.d, o).add(V(0, 0.16, 0)), brassC, big ? 0.05 : 0.035));
      return true;
    }
    if (k === "trombone") {
      const slideEnd = at(g.a, g.d, g.len),
        back = g.a.clone().add(V(-0.34, -0.06, 0.6));
      [-0.07, 0.07].forEach((x) => seg(g.a.clone().add(V(x, -0.02, 0)), slideEnd.clone().add(V(x, -0.02, 0)), brassC, 0.03));
      seg(slideEnd.clone().add(V(-0.07, -0.02, 0)), slideEnd.clone().add(V(0.07, -0.02, 0)), brassC, 0.035);
      seg(g.a.clone().add(V(0, 0, 0.05)), back, brassC, 0.035);
      seg(back, at(g.bell, V(0, 0, -1), -0.8), brassC, 0.05);
      cone(g.bell, V(0, 0, -1), 0.36, 0.8, brassC);
      return true;
    }
    if (k === "clarinet") {
      seg(g.a, at(g.a, g.d, g.len - 0.3), 0x14171c, 0.06);
      cone(at(g.a, g.d, g.len), g.d, 0.13, 0.3, 0x14171c);
      g.holes.forEach((p) => add(new THREE.SphereGeometry(0.035, 8, 6), silverC, p.clone().add(V(0, 0.02, -0.06))));
      return true;
    }
    if (k === "flute") {
      seg(g.a, at(g.a, g.d, g.len), silverC, 0.055);
      add(new THREE.BoxGeometry(0.12, 0.02, 0.08), silverC, g.lip.clone().add(V(0, 0, -0.03)));
      for (let i = 0; i < 7; i++) add(new THREE.SphereGeometry(0.035, 8, 6), 0xf7f8f9, at(g.lip, g.d, 0.5 + i * 0.2).add(V(0, 0.05, 0)));
      return true;
    }
    if (k === "sax") {
      const b = g.a.clone().add(V(0.05, -0.35, -0.18));
      seg(g.a, b, brassC, 0.04);
      seg(b, b.clone().add(V(0, -1.45, -0.05)), brassC, 0.13);
      seg(b.clone().add(V(0, -1.5, -0.05)), g.src[0].clone().add(V(0, -0.45, 0.2)), brassC, 0.15);
      cone(g.src[0], g.src[1], 0.3, 0.5, brassC);
      return true;
    }
    if (k === "violin") {
      const body = add(new THREE.SphereGeometry(0.4, 16, 10), 0x91522c, g.body),
        bow = g.hands[1].clone().add(V(-0.1, 0.12, -0.1));
      body.scale.set(0.75, 0.22, 1.05);
      body.quaternion.setFromUnitVectors(V(0, 0, 1), g.d.clone().setY(0).normalize().negate());
      seg(at(g.a, g.d, 0.95), at(g.a, g.d, g.len), 0x593820, 0.045);
      seg(bow, at(bow, g.body.clone().add(V(0, 0.15, 0)).sub(bow).normalize(), 2.2), 0x754521, 0.02);
      return true;
    }
    if (k === "guitar") {
      const body = add(new THREE.SphereGeometry(0.62, 18, 12), 0x91522c, g.body),
        head = add(new THREE.BoxGeometry(0.42, 0.2, 0.06), 0x3a2414, at(g.a, g.d, g.len + 0.18));
      body.scale.set(1, 1.15, 0.42);
      add(new THREE.CircleGeometry(0.17, 18), 0x2a1a10, g.body.clone().add(V(-0.12, 0.08, -0.27))).rotation.y = Math.PI;
      seg(g.a, at(g.a, g.d, g.len), 0x51351f, 0.075);
      head.rotation.z = Math.atan2(g.d.y, g.d.x) + Math.PI;
      return true;
    }
    if (k === "marchBass" || k === "concertBass") {
      const axis = k === "marchBass" ? V(1, 0, 0) : V(0, 0, 1),
        shell = add(new THREE.CylinderGeometry(g.r, g.r, g.w, 28), 0xb53735, g.c);
      shell.quaternion.setFromUnitVectors(V(0, 1, 0), axis);
      [-1, 1].forEach((s) => {
        const h = add(new THREE.CircleGeometry(g.r * 0.95, 28), 0xf5f2e9, at(g.c, axis, s * (g.w / 2 + 0.005)));
        h.quaternion.setFromUnitVectors(V(0, 0, 1), axis.clone().multiplyScalar(s));
        h.material.side = THREE.DoubleSide;
      });
      if (k === "marchBass") g.hands.forEach((h, i) => seg(h, h.clone().add(V(i ? -0.2 : 0.2, 0.55, -0.55)), 0x8a6a45, 0.025));
      else {
        seg(g.hands[1], g.hands[1].clone().add(V(-0.1, 0.1, -0.6)), 0x8a6a45, 0.03);
        [-1, 1].forEach((s) => seg(at(g.c, V(1, 0, 0), s * g.r * 0.7).add(V(0, -g.r * 0.7, 0)), V(s * g.r, 0.02, g.c.z), 0x7d8993, 0.03));
      }
      return true;
    }
    return false;
  }
  function modelInstrument(k, post) {
    if (rig(k)) return rigInstrument(k) || rigProcedural(k);
    if (k === "drums") return guideDrumKit();
    return false;
  }
  /* Deliberately modeled as a simple, adult-height, gender-neutral T-shirt-and-jeans figure.
    The prior downloaded character was not a credible player and could sit below the floor. */

  const legacyPlayer = player,
    legacyInstrument = instrument;
  /* Do not show the old procedural figure while the embedded performer is loading. build() reruns as soon as the GLB is ready. */
  player = (post, k) => modelPlayer(post, k);
  instrument = (k, post) => modelInstrument(k, post) || legacyInstrument(k, post);
  function isDark() {
    return getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() === "#151513";
  }
  function init() {
    if (R) return true;
    if (!window.THREE) {
      $("mgAdvice").textContent = "The 3D guide couldn't load its 3D library (vendor/three-r128).";
      return false;
    }
    const dark = isDark();
    R = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    R.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    R.setClearColor(dark ? 0x1c1c19 : 0xf3f1ec);
    sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight(0xffffff, 0x77808a, 1.8));
    const l = new THREE.DirectionalLight(0xffffff, 1.8);
    l.position.set(5, 9, 6);
    sc.add(l);
    cam = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    tar = V(0, 2.5, -0.25);
    const f0 = source().frame;
    if (f0) {
      tar.set(0, f0[0], f0[1]);
      orb.r = f0[2];
      framed = true;
    }
    bind();
    return true;
  }
  function add(g, c, p, o = 1) {
    const m = new THREE.Mesh(g, mat(c, o));
    m.position.copy(p);
    sc.add(m);
    return m;
  }
  function seg(a, b, c = 0.35, r = 0.06) {
    const d = b.clone().sub(a),
      m = add(new THREE.CylinderGeometry(r, r, d.length(), 10), c, a.clone().add(b).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    return m;
  }
  function line(a, b, c = theme.hex("--mic")) {
    const x = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([a, b]),
      new THREE.LineDashedMaterial({ color: c, dashSize: 0.12, gapSize: 0.08 }),
    );
    x.computeLineDistances();
    sc.add(x);
  }
  function player(post, k) {
    const sit = post === "sitting",
      skin = 0xc7ced5,
      body = 0x8b969f,
      y = sit ? 1.4 : 2.1,
      sh = sit ? 3.15 : 3.72;
    add(new THREE.CylinderGeometry(0.38, 0.47, sit ? 1.38 : 2.12, 14), body, V(0, y + 0.67, 0));
    add(new THREE.SphereGeometry(0.42, 18, 14), skin, V(0, sit ? 4.05 : 4.9, 0));
    add(new THREE.CylinderGeometry(0.15, 0.15, 0.48, 10), body, V(0, sit ? 3.55 : 4.38, 0));
    if (sit) {
      add(new THREE.BoxGeometry(1.35, 0.13, 1.18), 0x65717b, V(0, 1.22, 0.25));
      [-0.38, 0.38].forEach((x) => {
        seg(V(x, 1.18, 0.3), V(x, 0.1, 0.6), body, 0.12);
        add(new THREE.SphereGeometry(0.16, 10, 8), skin, V(x, 0.1, 0.6));
      });
    } else
      [-0.22, 0.22].forEach((x) => {
        seg(V(x, 2.03, 0), V(x, 0.12, 0.1), body, 0.13);
        add(new THREE.SphereGeometry(0.16, 10, 8), skin, V(x, 0.1, 0.12));
      });
    let h =
      k === "flute"
        ? [V(-0.7, 3.28, -0.72), V(0.55, 3.28, -0.72)]
        : k === "violin"
          ? [V(-0.45, 3.65, -0.7), V(0.5, 3.3, -0.82)]
          : k === "drums" || k === "piano"
            ? [V(-0.7, 2.55, -0.95), V(0.7, 2.55, -0.95)]
            : [V(-0.38, sh - 0.6, -0.75), V(0.43, sh - 0.72, -0.75)];
    h.forEach((q, i) => {
      const s = V(i ? -0.35 : 0.35, sh, 0),
        e = s.clone().lerp(q, 0.52);
      e.z -= 0.22;
      seg(s, e, body, 0.11);
      seg(e, q, body, 0.1);
      add(new THREE.SphereGeometry(0.13, 10, 8), skin, q);
    });
  }
  function horn(len, y, brass, k) {
    const tube = add(new THREE.CylinderGeometry(0.08, 0.13, len, 12), brass, V(0, y, -0.83));
    tube.rotation.z = Math.PI / 2;
    add(new THREE.ConeGeometry(0.28, 0.6, 16, 1, true), brass, V(len / 2 + 0.27, y, -0.83)).rotation.z = -Math.PI / 2;
    if (k === "trumpet")
      [-0.2, 0, 0.2].forEach((x) =>
        add(new THREE.CylinderGeometry(0.055, 0.055, 0.3, 10), brass, V(x, y + 0.22, -0.82)),
      );
  }
  function drum(x, y, z, r, h = 0.55) {
    add(new THREE.CylinderGeometry(r, r, h, 20), 0xb53735, V(x, y, z));
    const hd = add(new THREE.CylinderGeometry(r * 0.92, r * 0.92, 0.04, 20), 0xf5f2e9, V(x, y + h / 2 + 0.025, z));
    [-0.7, 0.7].forEach((s) => seg(V(x + s * r, y - h / 2, z), V(x + s * r, y - h / 2 - 0.6, z), 0x9aa4ad, 0.025));
  }
  const CLAPPERS = [[-1.8, -4.6], [0, -4.4], [1.8, -4.6], [-0.9, -6.4], [0.9, -6.4], [-2.6, -6.6], [2.6, -6.6]];
  function instrument(k, post) {
    const y = post === "sitting" ? 2.45 : 3.0,
      brass = 0xd7aa42,
      silver = 0xcbd3d9,
      wood = 0x91522c;
    if (k === "guitar") {
      add(new THREE.SphereGeometry(0.58, 16, 12), wood, V(0.35, y, -0.47));
      const n = add(new THREE.BoxGeometry(0.16, 0.12, 1.9), 0x51351f, V(0.35, y + 0.85, -0.46));
      n.rotation.x = 0.25;
      for (let i = -2; i < 3; i++)
        line(V(0.35 + i * 0.035, y - 0.35, -0.99), V(0.35 + i * 0.035, y + 1.72, -0.65), 0xd9d9d5);
    } else if (k === "trumpet") horn(1.65, 3.82, brass, k);
    else if (k === "trombone") {
      horn(2.2, 3.55, brass, k);
      seg(V(-1.15, 3.35, -0.86), V(1.15, 3.35, -0.86), brass, 0.04);
    } else if (k === "sax") {
      add(new THREE.CylinderGeometry(0.14, 0.18, 1.55, 12), brass, V(0.15, 2.75, -0.7));
      add(new THREE.TorusGeometry(0.35, 0.08, 8, 16, Math.PI), brass, V(0.15, 2.05, -0.7));
      for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.045, 8, 6), silver, V(0.02, 2.25 + i * 0.23, -0.85));
    } else if (k === "flute") {
      const f = add(new THREE.CylinderGeometry(0.07, 0.07, 2.05, 12), silver, V(0, 3.3, -0.78));
      f.rotation.z = Math.PI / 2;
      for (let i = -3; i < 4; i++) add(new THREE.SphereGeometry(0.04, 8, 6), 0xf7f8f9, V(i * 0.24, 3.3, -0.78));
    } else if (k === "clarinet") {
      const c = add(new THREE.CylinderGeometry(0.08, 0.13, 1.75, 12), 0x14171c, V(0.08, 2.55, -0.7));
      c.rotation.x = -0.16;
      for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.04, 8, 6), silver, V(0.08, 1.98 + i * 0.24, -0.81));
    } else if (k === "violin") {
      add(new THREE.SphereGeometry(0.36, 14, 10), wood, V(0.22, 3.32, -0.5));
      const n = add(new THREE.BoxGeometry(0.1, 0.1, 1.12), 0x593820, V(0.22, 3.74, -0.5));
      n.rotation.x = 0.4;
      seg(V(-0.75, 3.22, -0.9), V(0.8, 3.48, -0.7), 0x754521, 0.03);
    } else if (k === "piano") {
      add(new THREE.BoxGeometry(3.2, 1.05, 1.55), 0x24272b, V(0.45, 1.15, -0.65));
      add(new THREE.BoxGeometry(3.35, 0.13, 1.65), 0x33383e, V(0.45, 1.72, -0.65));
      for (let x = -1; x <= 1; x += 0.18) add(new THREE.BoxGeometry(0.12, 0.04, 0.5), 0xf6f5ef, V(0.45 + x, 1.8, -1.1));
    } else if (k === "amp") {
      add(new THREE.BoxGeometry(1.9, 2, 1), 0x26282b, V(0, 1, -0.85));
      const g = add(new THREE.CircleGeometry(0.5, 18), 0x59616a, V(0, 1, -1.37));
      g.rotation.x = -Math.PI / 2;
    } else if (k === "drums") {
      drum(0, 1, -0.55, 0.78, 0.85);
      drum(-0.7, 1.4, -0.05, 0.42, 0.28);
      drum(0.45, 1.45, -0.05, 0.42, 0.28);
      drum(-1.45, 1.1, 0.1, 0.52, 0.65);
      drum(1.45, 1.1, 0.1, 0.52, 0.65);
      [-1.65, -1.1, 1.1, 1.75].forEach((x, i) => {
        const c = add(
          new THREE.CylinderGeometry(i === 1 ? 0.3 : 0.55, i === 1 ? 0.3 : 0.55, 0.05, 18),
          0xc6ccd1,
          V(x, 2.2 + (i % 2) * 0.28, -0.18),
        );
        seg(V(x, c.position.y, -0.18), V(x, 1.1, -0.18), 0x89939b, 0.025);
      });
    } else if (k === "concertBass" || k === "marchBass") {
      add(
        new THREE.CylinderGeometry(0.82, 0.82, 0.65, 20),
        0xb53735,
        V(0, k === "marchBass" ? 2.75 : 1.65, -0.55),
      ).rotation.z = Math.PI / 2;
      add(new THREE.CircleGeometry(0.72, 20), 0xf5f2e9, V(0, k === "marchBass" ? 2.75 : 1.65, -0.89)).rotation.x =
        -Math.PI / 2;
    } else if (k === "marchBari") horn(1.6, 3.25, brass, "trumpet");
    else if (k === "saw") {
      // two sawhorses, a board across them, the saw on the board with its blade in the cut
      [-1.6, 1.6].forEach((x) => {
        add(new THREE.BoxGeometry(0.25, 0.2, 1.4), 0xb0864f, V(x, 2.2, -1.45));
        [-0.5, 0.5].forEach((z) => [-0.15, 0.15].forEach((dx) => seg(V(x + dx, 2.1, -1.45 + z * 1.1), V(x + dx * 3, 0.02, -1.45 + z * 1.3), 0xb0864f, 0.04)));
      });
      add(new THREE.BoxGeometry(4.2, 0.12, 1.0), 0xd8b47a, V(0, 2.36, -1.45));
      add(new THREE.BoxGeometry(0.42, 0.3, 0.7), 0x2b6fd6, V(0.35, 2.62, -1.3));
      const blade = add(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24), 0xc9ced3, V(0.25, 2.45, -1.45));
      blade.rotation.z = Math.PI / 2;
      add(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), 0x222222, V(0.05, 2.75, -1.25)).rotation.x = Math.PI / 2;
    } else if (k === "hit") {
      add(new THREE.BoxGeometry(2.4, 0.15, 1.4), 0xb0864f, V(0, 2.3, -1.4)); // bench
      [-1, 1].forEach((x) => [-1, 1].forEach((z) => seg(V(x * 1.1, 2.3, -1.4 + z * 0.6), V(x * 1.1, 0.02, -1.4 + z * 0.6), 0xb0864f, 0.05)));
      add(new THREE.BoxGeometry(0.9, 0.35, 0.45), 0x4a4f57, V(0, 2.55, -1.4)); // anvil block
      seg(V(0.35, 3.5, -1.35), V(0.05, 2.78, -1.4), 0x8a6a45, 0.03); // hammer handle
      add(new THREE.BoxGeometry(0.28, 0.14, 0.14), 0x6b7280, V(0.36, 3.55, -1.35));
    } else if (k === "car") {
      add(new THREE.BoxGeometry(6, 2.4, 15), 0x5b7aa6, V(0, 2.0, -13)); // body
      add(new THREE.BoxGeometry(5.2, 1.3, 7), 0x8fb0d6, V(0, 3.9, -13.5)); // cabin
      [-3.1, 3.1].forEach((x) =>
        [-9, -17].forEach((z) => {
          const w = add(new THREE.CylinderGeometry(1.1, 1.1, 0.7, 18), 0x222428, V(x, 1.1, z));
          w.rotation.z = Math.PI / 2;
        }),
      );
      add(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12), 0x9aa0a8, V(0.9, 0.9, -5.2)).rotation.x = Math.PI / 2; // tailpipe
    } else if (k === "water") {
      add(new THREE.BoxGeometry(2.4, 0.15, 1.4), 0xb0864f, V(0, 2.0, -1.5));
      [-1, 1].forEach((x) => [-1, 1].forEach((z) => seg(V(x * 1.1, 2.0, -1.5 + z * 0.6), V(x * 1.1, 0.02, -1.5 + z * 0.6), 0xb0864f, 0.05)));
      add(new THREE.CylinderGeometry(0.5, 0.42, 0.7, 20), 0x2b6fd6, V(0.1, 2.45, -1.5)); // bucket
      add(new THREE.CylinderGeometry(0.46, 0.46, 0.02, 20), 0x7fb8ff, V(0.1, 2.75, -1.5), 0.8); // the water
      add(new THREE.CylinderGeometry(0.15, 0.15, 0.4, 12), 0xd9e6f2, V(0.12, 3.1, -1.15)); // jug
    } else if (k === "clap") {
      CLAPPERS.forEach(([x, z]) => {
        add(new THREE.CylinderGeometry(0.3, 0.38, 2.2, 12), 0x8b969f, V(x, 1.2, z));
        add(new THREE.SphereGeometry(0.34, 12, 10), 0xc7ced5, V(x, 2.55, z));
      });
    } else if (k === "steps") {
      add(new THREE.BoxGeometry(3, 0.1, 3), 0x9a6b3c, V(0, 0.05, -0.3));
      for (let z = -1.6; z <= 1.0; z += 0.5) line(V(-1.5, 0.11, z), V(1.5, 0.11, z), 0x6b4626);
    } else if (k === "door") {
      // a prop door in a frame, latch side at x ≈ 0.4, hinges at x ≈ −2.5
      add(new THREE.BoxGeometry(0.2, 7, 0.3), 0x7a5a3a, V(-2.6, 3.5, -1.6));
      add(new THREE.BoxGeometry(0.2, 7, 0.3), 0x7a5a3a, V(0.5, 3.5, -1.6));
      add(new THREE.BoxGeometry(3.3, 0.2, 0.3), 0x7a5a3a, V(-1.05, 7.0, -1.6));
      add(new THREE.BoxGeometry(2.9, 6.8, 0.15), 0x9c7350, V(-1.05, 3.45, -1.62));
      add(new THREE.SphereGeometry(0.08, 10, 8), 0xc9b26a, V(0.2, 3.2, -1.5));
      [-0.8, 0.8].forEach((x) => add(new THREE.BoxGeometry(0.3, 0.2, 1.2), 0x7a5a3a, V(-1.05 + x * 1.6, 0.1, -1.6)));
    }
  }
  /* Pickup field (BACKLOG B0, js/pickup3d.js): smooth, fading with distance and off-axis angle from the capsule;
     the aim line is its own toggle. dref 0.25 ft = 0 dB; 24 dB shown (out to about 4 ft). */
  function polar(p, q, m) {
    const axis = q.clone().sub(p).normalize(),
      cap = p.clone().add(axis.clone().multiplyScalar(0.25)),
      type = (MODELS[m] || {}).pat || "cardioid";
    if ($("mgPattern").checked)
      sc.add(pickupField(THREE, { p: cap, axis, type, dref: 0.25, range: 20, n: 2600, size: 0.16, accent: theme.hex("--mic") }));
    if ($("mgAim") && $("mgAim").checked) sc.add(pickupAim(THREE, cap, axis, 3.5, theme.hex("--mic")));
  }
  function mic(p, q, m, s) {
    const d = q.clone().sub(p).normalize(),
      metal = 0x30373e,
      head = 0x68727c,
      label = ((s && s[0]) || "").toLowerCase(),
      clip = /snare|tom/.test(label),
      low = /kick|cab/.test(label);
    if ($("mgStand").checked) {
      if (clip) {
        const clamp = add(
          new THREE.TorusGeometry(0.19, 0.045, 8, 14, Math.PI * 1.55),
          0x1f252b,
          q.clone().add(V(0, 0.12, 0.08)),
        );
        clamp.rotation.x = Math.PI / 2;
        seg(q.clone().add(V(0.1, 0.15, 0.05)), p.clone().sub(d.clone().multiplyScalar(0.08)), metal, 0.035);
      } else {
        const base = V(p.x, 0, p.z + 0.38),
          top = V(p.x, low ? Math.min(0.75, p.y - 0.2) : Math.max(1.25, p.y - 0.78), p.z + 0.38);
        for (let a = 0; a < 3; a++) {
          const e = base.clone().add(V(Math.cos(a * 2.094) * 0.42, 0.02, Math.sin(a * 2.094) * 0.42));
          seg(base.clone().add(V(0, 0.04, 0)), e, metal, 0.032);
        }
        add(new THREE.CylinderGeometry(0.11, 0.15, 0.1, 10), 0x20272d, base.clone().add(V(0, 0.05, 0)));
        seg(base.clone().add(V(0, 0.1, 0)), top, metal, 0.04);
        const boomEnd = p.clone().sub(d.clone().multiplyScalar(0.08));
        seg(top, boomEnd, metal, 0.035);
        add(new THREE.SphereGeometry(0.075, 10, 8), 0x1d242a, top);
      }
    }
    const body = add(new THREE.CylinderGeometry(0.075, 0.09, 0.46, 14), metal, p);
    body.quaternion.setFromUnitVectors(V(0, 1, 0), d);
    const cap = add(new THREE.SphereGeometry(0.105, 12, 8), head, p.clone().add(d.clone().multiplyScalar(0.25)));
    if ($("mgDist").checked) line(p, q);
    polar(p, q, m);
  }
  /* The guide is a planning sandbox. Its locker is deliberately independent from mics currently assigned on the main field canvas. */
  function guideStock(k) {
    if (!micInventoryDefined()) return 99; // no inventory yet: any mic may be picked, nothing is counted
    return Math.max(0, avail(k));
  }
  function role(s) {
    const n = (s[0] + " " + s[5]).toLowerCase();
    if (/xy/.test(n)) return "xy";
    if (/overhead|flute|clarinet|string|fret|horn/.test(n)) return "pencil";
    if (/kick|bass drum/.test(n)) return "kick";
    if (/snare|tom/.test(n)) return "drum";
    if (/cab/.test(n)) return "cab";
    if (/vocal/.test(n)) return "vocal";
    return "general";
  }
  const SCORE = {
    "Rode NT5": 100,
    "Sennheiser e614": 92,
    "AKG C414 XLII": 91,
    "Samson CO2": 72,
    "Behringer C2": 52,
    "Behringer CM1200": 48,
    "Shure Beta 52A": 100,
    "Behringer KM1200": 55,
    "Shure SM57": 96,
    "Audix i5": 88,
    "Sennheiser e609": 100,
    "Sennheiser e906": 96,
    "Shure Beta 58A": 100,
    "Rode NT4 (XY stereo)": 100,
  };
  function paired(t, s) {
    const r = role(s);
    return r === "xy" || t[2].filter((x) => role(x) === r).length > 1;
  }
  function choose(s, i, t) {
    if (pick[i]) return pick[i];
    const r = role(s),
      need = paired(t, s) ? t[2].filter((x) => role(x) === r).length : 1;
    const ok = (k) => {
      const m = MODELS[k] || {},
        type = m.type || "";
      if (guideStock(k) < need) return false;
      if (r === "xy") return m.pat === "xy" || m.ch === 2;
      if (r === "pencil") return /SDC/.test(type);
      if (r === "kick") return /Beta 52|KM1200/.test(k);
      if (r === "drum") return /SM57|Audix i5|TM1200/.test(k);
      if (r === "cab") return /e609|e906|SM57/.test(k);
      if (r === "vocal") return /Beta 58|NT1|U87/.test(k);
      return true;
    };
    return (
      Object.keys(MODELS)
        .filter(ok)
        .sort((a, b) => (SCORE[b] || 0) - (SCORE[a] || 0) || b.localeCompare(a))[0] || s[1]
    );
  }
  function guideChoices(t) {
    return t[2].map((s, i) => choose(s, i, t));
  }
  function guideWarnings(t) {
    const out = [],
      chosen = guideChoices(t),
      pairs = {};
    t[2].forEach((s, i) => {
      const r = role(s);
      if (paired(t, s)) {
        (pairs[r] ||= []).push(i);
      }
    });
    for (const [r, ix] of Object.entries(pairs)) {
      const models = [...new Set(ix.map((i) => chosen[i]))];
      if (models.length > 1)
        out.push(
          "Stereo " +
            r +
            " positions use different models (" +
            models.join(" / ") +
            "). Use a matched same-model pair where possible.",
        );
      const m = models[0],
        need = ix.length;
      if (guideStock(m) < need)
        out.push(
          m +
            " has only " +
            guideStock(m) +
            " free in the locker, but this matched setup needs " +
            need +
            ". Choose the next suitable matched pair.",
        );
    }
    Object.keys(MODELS).forEach((k) => {
      const count = chosen.filter((x) => x === k).length;
      if (count > guideStock(k))
        out.push("This setup assigns " + count + " × " + k + ", but the locker contains " + guideStock(k) + ".");
    });
    const overhead = t[2].map((s, i) => (/overhead/i.test(s[0]) ? i : null)).filter((i) => i != null);
    if (overhead.length === 2) {
      const d = overhead.map((i) =>
        Math.hypot(t[2][i][2][0] - t[2][i][3][0], t[2][i][2][1] - t[2][i][3][1], t[2][i][2][2] - t[2][i][3][2]),
      );
      if (Math.abs(d[0] - d[1]) > (isKit(t) ? 1 / 12 : 0.2))
        out.push(
          "The overheads are not equally distant from their target. Re-measure from the snare before judging polarity.",
        );
    }
    if (isKit(t)) {
      const b = kitBleed(kitPieces(), t[2]);
      b.slice(0, 5).forEach((x) => out.push(x.text));
      if (b.length > 5) out.push(`…and ${b.length - 5} more close-mic pairs under 3:1.`);
    }
    t[2].forEach((s) => {
      if (s[2][2] > 0.35)
        out.push(s[0] + " is behind the player/source. Move it to the front or side of the source, then re-aim it.");
    });
    $("mgWarn").innerHTML = out.map((x) => "<div>⚠ " + x + "</div>").join("");
  }
  function floorGrid(w, d, c) {
    const pts = [];
    for (let x = -w / 2; x <= w / 2 + 0.01; x++) pts.push(x, 0.016, -d / 2, x, 0.016, d / 2);
    for (let z = -d / 2; z <= d / 2 + 0.01; z++) pts.push(-w / 2, 0.016, z, w / 2, 0.016, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    sc.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.72 })));
  }
  /* A fine floor grid under a drum kit (Tom, backlog): a line every 6 inches, every 12 inches a little stronger, so
     distances in the kit's table can be read off the floor. Shown with the floor grid. */
  function kitGrid(c) {
    const pts = [],
      strong = [],
      R = 6;
    for (let i = -R * 2; i <= R * 2; i++) {
      const v = i / 2,
        target = Number.isInteger(v) ? strong : pts;
      target.push(v, 0.02, -R, v, 0.02, R, -R, 0.02, v, R, 0.02, v);
    }
    [[pts, 0.35], [strong, 0.6]].forEach(([a, o]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(a, 3));
      sc.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o })));
    });
  }
  function sourceHeat(k, post) {
    if (!$("mgSource").checked) return;
    const hot = (p, r = 0.26) => {
      add(new THREE.SphereGeometry(r, 16, 12), 0xff712f, p, 0.7);
      add(new THREE.SphereGeometry(r * 2.3, 16, 12), 0xffa13b, p, 0.12);
    };
    const plume = (p, d, len = 0.9, r = 0.34) => {
      const o = add(
        new THREE.ConeGeometry(r, len, 18, 1, true),
        0xff8b37,
        p.clone().add(d.clone().multiplyScalar(len * 0.32)),
        0.2,
      );
      o.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
      hot(p, r * 0.45);
    };
    const g = rig(k);
    if (g) {
      if (k === "clarinet") g.holes.forEach((p) => hot(p.clone().add(V(0, 0, -0.08)), 0.1));
      if (k === "marchBass") plume(g.src[0].clone().setX(-g.src[0].x), V(-1, 0, 0), 0.6, 0.6);
      plume(g.src[0], g.src[1].clone().normalize(), /trumpet|trombone|marchBari|Bass/.test(k) ? 1.0 : 0.6, /Bass/.test(k) ? 0.6 : /marchBari|trombone/.test(k) ? 0.42 : 0.3);
      return;
    }
    if (/trumpet|trombone|marchBari/.test(k)) plume(V(1.05, 3.55, -1.05), V(0.15, 0, -1), 1.15, 0.38);
    else if (k === "sax") plume(V(0.18, 2.0, -1.0), V(0.12, -0.18, -1), 0.8, 0.3);
    else if (k === "clarinet") {
      [2.05, 2.45, 2.85].forEach((y) => hot(V(0.08, y, -0.9), 0.1));
      plume(V(0.08, 1.7, -0.92), V(0, -0.35, -1), 0.55, 0.2);
    } else if (k === "flute") {
      hot(V(0, 3.38, -0.86), 0.16);
      plume(V(0, 3.43, -0.86), V(0, 0.3, -0.55), 0.45, 0.18);
    } else if (k === "guitar") hot(V(0.35, post === "sitting" ? 2.6 : 3.0, -1.08), 0.25);
    else if (k === "violin") hot(V(0.22, 3.32, -0.88), 0.22);
    else if (k === "piano") plume(V(0.45, 1.85, -0.55), V(0, 0.75, 0), 0.7, 0.8);
    else if (k === "amp") plume(V(0, 1, -1.42), V(0, 0, -1), 0.75, 0.55);
    else if (k === "drums" && isKit(source().t[+$("mgTechnique").value]))
      kitPieces().forEach((pc) => hot(pc.kind === "kick" ? pc.top : pc.top.clone().add(V(0, 0.05, 0)), pc.kind === "kick" ? 0.4 : pc.kind === "cym" ? 0.16 : 0.22));
    else if (k === "drums") {
      hot(V(0, 1.85, -0.55), 0.45);
      [-0.7, 0.45, -1.45, 1.45].forEach((x) => hot(V(x, 1.75, -0.12), 0.22));
    } else if (k === "saw") {
      plume(V(0.25, 2.45, -1.45), V(0, 0.4, 1), 0.8, 0.35); // the cut throws sound and dust back and up
      hot(V(0.35, 2.62, -1.3), 0.2); // the motor
    } else if (k === "hit") {
      hot(V(0.05, 2.78, -1.4), 0.25);
      plume(V(0.05, 2.78, -1.4), V(0, 0.5, 0.8), 0.7, 0.4);
    } else if (k === "car") {
      plume(V(0.9, 0.9, -5.4), V(0, 0, 1), 1.2, 0.35); // exhaust stream, toward the rear
      hot(V(0, 2.4, -19), 0.6); // the engine at the front
    } else if (k === "water") {
      hot(V(0.1, 2.78, -1.5), 0.25);
      plume(V(0.1, 2.78, -1.5), V(0, 0.4, 0.5), 0.55, 0.45);
    } else if (k === "clap") CLAPPERS.forEach(([x, z]) => hot(V(x, 3.1, z), 0.2));
    else if (k === "steps") [-0.22, 0.22].forEach((x) => hot(V(x, 0.12, 0.05), 0.2));
    else if (k === "door") {
      hot(V(0.3, 3.2, -1.55), 0.16); // latch
      plume(V(-1.05, 3.45, -1.55), V(0, 0, 1), 0.7, 0.9); // the panel
    } else if (/Bass/.test(k)) plume(V(0, k === "marchBass" ? 2.75 : 1.65, -0.92), V(0, 0, -1), 0.7, 0.65);
    else hot(V(0, 3.9, -0.85), 0.28);
  }
  function diBox() {
    add(new THREE.BoxGeometry(0.8, 0.28, 0.55), 0x252b32, V(-1.4, 0.32, -1.15));
    add(new THREE.CircleGeometry(0.06, 10), 0xc4a55d, V(-1.4, 0.46, -1.44)).rotation.x = -Math.PI / 2;
    seg(V(-1.4, 0.34, -1.42), V(-0.3, 1.05, -1.15), 0x20272d, 0.018);
  }
  function tripodBoom(p, d, low) {
    const metal = 0x1f252b,
      boomLen = low ? 0.72 : 1.8,
      pivot = p.clone().sub(d.clone().multiplyScalar(boomLen));
    pivot.y = low ? Math.max(0.42, Math.min(0.7, pivot.y)) : Math.max(1.25, Math.min(5.4, pivot.y));
    const base = V(pivot.x, 0, pivot.z),
      hub = base.clone().add(V(0, 0.1, 0));
    for (let a = 0; a < 3; a++) {
      const ang = a * 2.094 + 0.35,
        e = base.clone().add(V(Math.cos(ang) * (low ? 0.52 : 0.78), 0.02, Math.sin(ang) * (low ? 0.52 : 0.78)));
      seg(hub, e, metal, 0.036);
    }
    add(new THREE.CylinderGeometry(0.14, 0.17, 0.12, 10), metal, hub);
    seg(hub, pivot, metal, 0.045);
    add(new THREE.CylinderGeometry(0.075, 0.09, 0.26, 10), 0x30383f, pivot.clone().add(V(0, -0.13, 0)));
    const arm = p.clone().sub(pivot),
      rear = pivot.clone().sub(arm.normalize().multiplyScalar(low ? 0.28 : 0.5));
    seg(pivot, p, metal, 0.043);
    seg(pivot, rear, metal, 0.037);
    const weight = add(new THREE.CylinderGeometry(0.09, 0.09, 0.24, 12), 0x11161b, rear);
    weight.quaternion.setFromUnitVectors(V(0, 1, 0), pivot.clone().sub(rear).normalize());
    add(new THREE.SphereGeometry(0.105, 12, 8), 0x151a20, pivot);
    add(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), 0x3a434b, pivot.clone().add(V(0, 0.03, 0)));
  }

  /* Mic bodies: one softened cylinder per mic (feet), sized and coloured by type and model, with the capsule
     (the lighter grille/basket at the front) set apart from the body by a thin accent ring. */
  function roundedCyl(r, len, rad) {
    const pts = [new THREE.Vector2(0, -len)],
      k = Math.min(rad, r * 0.9, len / 2);
    for (let i = 0; i <= 4; i++) {
      const a = (i / 4) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - k + Math.sin(a) * k, -len + k - Math.cos(a) * k));
    }
    for (let i = 0; i <= 4; i++) {
      const a = (i / 4) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - k + Math.cos(a) * k, -k + Math.sin(a) * k));
    }
    pts.push(new THREE.Vector2(0, 0));
    return new THREE.LatheGeometry(pts, 20);
  }
  function micLook(key, type) {
    const k = key || "";
    let l = { r: 0.03, len: 0.55, cap: 0.1, capR: 1.05, body: 0x2a3036, grille: 0x9aa3ab, ring: 0xc9a24b };
    if (/LDC/.test(type)) l = { r: 0.09, len: 0.62, cap: 0.26, capR: 1.0, body: 0x2a3036, grille: 0xaab2b9, ring: 0xc9a24b };
    else if (/Ribbon/.test(type)) l = { r: 0.07, len: 0.8, cap: 0.35, capR: 1.0, body: 0x3b3f44, grille: 0xb4b9be, ring: 0x8b949d };
    else if (/Shotgun/.test(type)) l = { r: 0.022, len: 1.3, cap: 0.5, capR: 1.0, body: 0x23292e, grille: 0x6b7680, ring: 0x8b949d };
    else if (/Boundary|Clip|Miniature/.test(type)) l = { r: 0.02, len: 0.2, cap: 0.07, capR: 1.0, body: 0x23292e, grille: 0x9aa3ab, ring: 0x8b949d };
    else if (/SDC/.test(type)) l = { r: 0.028, len: 0.55, cap: 0.12, capR: 1.0, body: 0x2a3036, grille: 0xb4b9be, ring: 0x8b949d };
    else if (/Condenser \(handheld\)/.test(type)) l = { r: 0.035, len: 0.6, cap: 0.28, capR: 1.35, body: 0x2a3036, grille: 0x9aa3ab, ring: 0x8b949d };
    else if (/58|Beta 5[28]|e8\d\d|Beta 87|v7|M88|D112|D6/.test(k) && !/Beta 52/.test(k))
      l = { r: 0.032, len: 0.55, cap: 0.2, capR: 1.5, body: 0x2a3036, grille: 0x8f98a0, ring: 0x8b949d };
    else if (/Beta 52|D112|D6|kick/i.test(k)) l = { r: 0.07, len: 0.45, cap: 0.12, capR: 1.0, body: 0x23292e, grille: 0x8f98a0, ring: 0x8b949d };
    else if (/Dynamic/.test(type)) l = { r: 0.028, len: 0.5, cap: 0.1, capR: 1.15, body: 0x2a3036, grille: 0x8f98a0, ring: 0x8b949d };
    if (/C414|C 414/.test(k)) l.ring = 0xd4af37;
    const hex = typeof MICLOOK === "object" && MICLOOK[k.replace(" (XY stereo)", "")];
    if (hex) {
      // body colour from the mic's own photo; the capsule is the same colour lifted (dark mics) or dimmed (light ones)
      const c = new THREE.Color("#" + hex),
        lum = c.r * 0.3 + c.g * 0.59 + c.b * 0.11;
      l.body = c.getHex();
      l.grille = c.clone().lerp(new THREE.Color(lum < 0.5 ? 0xc4cbd1 : 0x6b6f73), lum < 0.5 ? 0.45 : 0.22).getHex();
    }
    return l;
  }
  function guideMicBody(p, d, key) {
    const spec = MODELS[key] || {},
      l = micLook(key, spec.type || "Dynamic"),
      q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d),
      soft = Math.min(l.r * 0.5, 0.03),
      body = add(roundedCyl(l.r, l.len - l.cap, soft), l.body, p.clone().sub(d.clone().multiplyScalar(l.cap)));
    body.quaternion.copy(q);
    const head = add(roundedCyl(l.r * l.capR, l.cap, soft * 1.2), l.grille, p);
    head.quaternion.copy(q);
    const ring = add(new THREE.CylinderGeometry(l.r * l.capR * 1.04, l.r * l.capR * 1.04, 0.014, 20), l.ring, p.clone().sub(d.clone().multiplyScalar(l.cap)));
    ring.quaternion.copy(q);
  }
  const plainMic = mic;
  mic = (p, q, m, s) => {
    const d = q.clone().sub(p).normalize(),
      metal = 0x30373e,
      label = ((s && s[0]) || "").toLowerCase(),
      clip = /snare|tom/.test(label),
      low = /kick|cab/.test(label);
    if ($("mgStand").checked) {
      if (clip) {
        const mount = p.clone().sub(d.clone().multiplyScalar(0.28));
        const clamp = add(new THREE.TorusGeometry(0.19, 0.045, 8, 14, Math.PI * 1.55), 0x1f252b, mount);
        clamp.rotation.x = Math.PI / 2;
        seg(mount, p.clone().sub(d.clone().multiplyScalar(0.05)), metal, 0.035);
      } else tripodBoom(p, d, low);
    }
    guideMicBody(p, d, m);
    if ($("mgDist").checked) line(p, q);
    polar(p, q, m);
  };
  /* Build only while the guide is on screen, so a closed guide doesn't load its ~22 MB of models at start-up.
     A build asked for while hidden runs as soon as the canvas gets a size. */
  let buildWaiting = false;
  new ResizeObserver(() => {
    if (buildWaiting && cv.getClientRects().length) build();
  }).observe(cv);
  function build() {
    if (!cv.getClientRects().length) {
      buildWaiting = true;
      return;
    }
    buildWaiting = false;
    if (!init()) return;
    while (sc.children.length > 2) sc.remove(sc.children[2]);
    const dark = isDark(),
      src = source(),
      t = src.t[+$("mgTechnique").value],
      w = Math.max(8, Math.min(80, +$("mgFloorW").value || 32)),
      d = Math.max(8, Math.min(80, +$("mgFloorD").value || 26)),
      floor = add(new THREE.PlaneGeometry(w, d), dark ? 0x292926 : 0xe7e5df, V(0, 0, -0.3));
    $("mgFloorW").value = w;
    $("mgFloorD").value = d;
    R.setClearColor(dark ? 0x1c1c19 : 0xf3f1ec);
    floor.rotation.x = -Math.PI / 2;
    if ($("mgGrid").checked) {
      floorGrid(w, d, dark ? 0x4a4944 : 0xb4b0a6);
      if (src.k === "drums") kitGrid(dark ? 0x6a6962 : 0x9a968c);
    }
    player(src.post, src.k);
    instrument(src.k, src.post);
    sourceHeat(src.k, src.post);
    if (t.di) diBox();
    const shift = rigShift(src.k, t);
    t[2].forEach((s, i) => mic(V(...s[2]).add(shift), V(...s[3]).add(shift), choose(s, i, t), s));
    guideWarnings(t);
    saveGuide();
    render();
  }
  G.find((x) => x.k === "drums").t.push(KIT_TECH);
  let wantedGuideInstrument = "";
  function source() {
    return G.find((x) => x.n === $("mgInstrument").value) || G[0];
  }
  function searchResults() {
    const box = $("mgSearchResults"),
      q = $("mgSearch").value.trim().toLowerCase(),
      f = $("mgFamily").value;
    if (!q) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    const list = G.filter((x) => (f === "all" || x.tags.includes(f)) && (x.n + " " + x.tags).toLowerCase().includes(q));
    box.innerHTML = list.length
      ? list
          .map(
            (x) =>
              '<button class="mgSearchResult" role="option" data-mgsource="' +
              x.n +
              '">' +
              x.n +
              "<small>" +
              x.tags.replaceAll(" ", ", ") +
              "</small></button>",
          )
          .join("")
      : '<div class="m" style="padding:6px">No matching instruments in this filter.</div>';
    box.hidden = false;
    box.querySelectorAll("[data-mgsource]").forEach(
      (b) =>
        (b.onmousedown = (e) => {
          e.preventDefault();
          $("mgInstrument").value = b.dataset.mgsource;
          $("mgSearch").value = "";
          box.hidden = true;
          tech();
        }),
    );
  }
  /* Sound source, accessories and processing for the instrument (data/guide-notes.js; docs/MIC_TECHNIQUES_NOTES_PLAN.md).
     Open sections and the Recording / Live choice are remembered for the session. */
  let notesCtx = "rec";
  const notesOpen = { src: true, acc: false, proc: false };
  const isCond = (k) => /DC/.test((MODELS[k] || {}).type || "");
  /* Pad check (Tom, 2026-11-12): the loudest peak each chosen mic will see against its max SPL in the mic database.
     Source levels are the planner's own (KIND in js/app.js: dB SPL at 1 m, plus 12 dB for peaks, as the planner's
     overload warning does); the distance is the closest one the technique gives (e.g. "2–4 in" → 2 in), inverse-square
     from 1 m and never closer than 2 in. An estimate, like the planner's: it compares, it doesn't measure.
     A mic's built-in pad raises its max SPL; an inline pad (between mic and preamp) only protects the preamp. */
  const GUIDE_KIND = { Vocalist: "vox", "Bass amp": "bas", "Electric guitar amp": "gtr", Trumpet: "tpt", Trombone: "tb", Saxophone: "sax", Flute: "fl", Clarinet: "cl", Piano: "pno", "Concert bass drum": "bd", "Marching bass drum": "bd", "Marching baritone": "bar" };
  const PREAMP_DBU = 10; // many interface mic inputs clip around +10 dBu at minimum gain (check yours)
  function kindFor(name, label) {
    if (name !== "Drum kit") return GUIDE_KIND[name];
    return /kick/i.test(label) ? "kck" : /snare/i.test(label) ? "snr" : /tom/i.test(label) ? "tom" : /hi-?hat/i.test(label) ? "hh" : /ride|overhead|crash|cymbal|splash/i.test(label) ? "cym" : "drm";
  }
  function closestFt(txt, p, q) {
    const m = /(\d+(?:\.\d+)?)\s*(?:[–-]\s*\d+(?:\.\d+)?)?\s*(in|ft|cm|m)\b/.exec(txt || "");
    if (m) return +m[1] * { in: 1 / 12, ft: 1, cm: 1 / 30.48, m: 1 / 0.3048 }[m[2]];
    return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  }
  /* What the check means for an *inline* pad, which only protects the preamp: needed when a mic's output would clip
     it; otherwise not needed (with the reason). null when no condenser could be checked. */
  function padLevel(pads) {
    const c = pads.filter((x) => x.cond);
    if (!c.length) return null;
    if (c.some((x) => x.pre)) return { level: "needed", lvl: "needed", why: "A mic's output here can clip the preamp; see the pad check below." };
    if (c.some((x) => x.level === "needed" && !x.withPad))
      return { level: "", lvl: "won't help", why: "The mic itself overloads here, and an inline pad only protects the preamp: move the mic back (see the pad check below)." };
    if (c.some((x) => x.level === "needed")) return { level: "", lvl: "not needed", why: "Use the mic's own built-in pad instead (see the pad check below); the preamp has room." };
    if (c.some((x) => x.level === "suggested")) return { level: "suggested", lvl: "suggested", why: "A mic is close to its limit here; see the pad check below." };
    return { level: "", lvl: "not needed with these mics", why: "The pad check below finds these mics and the preamp have room to spare here." };
  }
  function padCheck(name, chosen) {
    if (typeof KIND !== "object" || typeof dbFor !== "function") return [];
    const t = source().t[+$("mgTechnique").value];
    return t[2]
      .map((sl, i) => {
        const k = kindFor(name, sl[0]),
          model = chosen[i] || sl[1],
          r = dbFor(model);
        const L0 = source().spl != null ? source().spl : k && KIND[k] ? KIND[k].L : null;
        if (L0 == null || !r || !r.x) return null;
        const ft = closestFt(sl[4], sl[2], sl[3]),
          L1 = L0 + 12,
          peak = Math.round(L1 + 20 * Math.log10(1 / Math.max(0.05, ft * 0.3048))),
          lim = r.x,
          withPad = r.xp && r.xp > lim ? r.xp : 0,
          out = r.s ? Math.round(20 * Math.log10(((r.s / 1000) * 10 ** ((Math.min(peak, withPad || lim) - 94) / 20)) / 0.775)) : null,
          safeFt = 10 ** ((L1 - lim + 3) / 20) / 0.3048, // where the peak is 3 dB under the limit
          dist = ft < 1 ? `${Math.round(ft * 12)} in` : `${+ft.toFixed(1)} ft`;
        let level, say;
        if (peak > lim && withPad >= peak) (level = "needed"), (say = `use its built-in pad (max ${withPad} dB with it)`);
        else if (peak > lim)
          (level = "needed"), (say = `too loud for this mic here${withPad ? ", even with its pad" : ""}: move it back to about ${safeFt < 1 ? Math.ceil(safeFt * 12) + " in" : safeFt.toFixed(1) + " ft"} or use a mic with a higher limit`);
        else if (peak > lim - 6) (level = "suggested"), (say = `within 6 dB of its limit${withPad ? "; engage its pad if it distorts" : "; back off if it distorts"}`);
        else (level = "ok"), (say = `no pad needed for the mic (about ${lim - peak} dB to spare)`);
        let pre = "";
        if (out != null && out > PREAMP_DBU) pre = ` Its output peaks near ${out > 0 ? "+" : ""}${out} dBu: many interface inputs clip above about +${PREAMP_DBU} dBu even at minimum gain, so an inline pad helps the preamp.`;
        return { label: sl[0], model, peak, lim, withPad, dist, level, say, pre, out, cond: isCond(model) };
      })
      .filter(Boolean);
  }
  function notes(name, chosen) {
    const N = typeof GUIDE_NOTES === "object" && GUIDE_NOTES[name],
      box = $("mgNotes");
    if (!box) return;
    if (!N) {
      box.innerHTML = "";
      return;
    }
    const e = (v) => (typeof esc === "function" ? esc(v) : String(v)),
      cond = chosen.some(isCond),
      draft = GUIDE_NOTES_STATUS === "draft" ? ' <span class="mgDraft" title="Written from the references below; not reviewed yet">draft</span>' : "";
    const pads = padCheck(name, chosen),
      padLvl = padLevel(pads);
    const acc = N.acc
      .map((a) => {
        let off = a.cond && !cond,
          level = a.level,
          lvl = off ? "only with a condenser" : a.out ? "needed outdoors" : a.level,
          why = a.why;
        // the pad check below knows these mics' limits: it decides whether the pad is needed
        if (!off && /inline pad/i.test(a.item) && padLvl) {
          ({ level, lvl } = padLvl);
          off = !level;
          why = padLvl.why;
        }
        return `<li class="${off ? "m" : ""}" data-item="${e(a.item)}"><b>${e(a.item)}</b> <span class="mgLvl ${off ? "" : level}">${lvl}</span><br><span class="m">${e(why)}</span></li>`;
      })
      .join("");
    const padHtml = pads.length
        ? `<h4 class="mgSub">Pad check for these mics</h4><ul class="mgPad">${pads
            .map(
              (x) =>
                `<li data-mic="${e(x.label)}" data-level="${x.level}"><b>${e(x.label)}</b> <span class="m">${e(x.model)}</span> <span class="mgLvl ${x.level === "ok" ? "" : x.level}">${x.level === "ok" ? "fine" : x.level}</span><br><span class="m">Peaks about ${x.peak} dB SPL at ${e(x.dist)}; its max is ${x.lim} dB. ${e(x.say[0].toUpperCase() + x.say.slice(1))}.${e(x.pre)}</span></li>`,
            )
            .join("")}</ul><p class="m">Estimates from typical loud playing and the mic database; the closest distance the technique gives.</p>`
        : "";
    const card = (p) =>
      `<div class="mgProc${p.when ? " mgIf" : ""}">${p.when ? `<div class="mgWhen">If ${e(p.when)}</div>` : ""}<b>${e(p.kind)}</b><table>${p.set.map(([k, v]) => `<tr><td>${e(k)}</td><td>${e(v)}</td></tr>`).join("")}</table><div class="m">${e(p.why)}</div></div>`,
      cards = (list) => procGroups(list, card);
    const live = N.proc.live || [],
      perMic = micNotes(N, chosen)
        .map(({ label, model, M }) => {
          const list = notesCtx === "rec" ? M.rec || [] : M.live || [];
          return `<div class="mgMicNote" data-mic="${e(label)}"><b>${e(label)}</b>${model ? ` <span class="m">${e(model)}</span>` : ""}${
            list.length ? cards(list) : `<div class="m">${notesCtx === "rec" ? "No mic-specific changes." : "As for recording."}</div>`
          }</div>`;
        })
        .join(""),
      proc =
        (notesCtx === "rec"
          ? cards(N.proc.rec)
          : `<p class="m">${live.length ? "Live sound: as for recording, with these changes." : "Live sound: the recording starting points work; raise the high-pass a little if the PA rumbles or feeds back."}</p>${cards(live)}`) +
        (perMic ? `<h4 class="mgSub">Per mic in this setup</h4>${perMic}` : "");
    // Keep what's open now: the toggle event that records it arrives later than a quick redraw (e.g. a mic change).
    box.querySelectorAll("details[data-notes]").forEach((d) => (notesOpen[d.dataset.notes] = d.open));
    const sec = (id, title, body) => `<details data-notes="${id}"${notesOpen[id] ? " open" : ""}><summary>${title}</summary>${body}</details>`;
    box.innerHTML =
      sec("src", "Where the sound comes from" + draft, `<ul>${N.source.map((x) => `<li>${e(x)}</li>`).join("")}</ul>`) +
      sec("acc", "Accessories", `<ul class="mgAcc">${acc}</ul>${padHtml}<p class="m">Suggested accessories for the sections in your layout are also listed in Inventory › Accessories.</p>`) +
      sec(
        "proc",
        "Processing starting points",
        `<div class="row" role="radiogroup" aria-label="Processing for"><label><input type="radio" name="mgCtx" value="rec"${notesCtx === "rec" ? " checked" : ""}> Recording / mix</label><label><input type="radio" name="mgCtx" value="live"${notesCtx === "live" ? " checked" : ""}> Live sound</label></div><p class="m">Plugin-neutral starting points: use them in any DAW plugin or outboard unit and adjust by ear. Not every track needs every step: the ones marked <i>If…</i> are only for when you hear that problem.</p>${proc}`,
      ) +
      `<div class="mgRefs m">Sources: ${N.refs.map(([t, u]) => `<a href="${e(u)}" target="_blank" rel="noopener">${e(t)}</a>`).join(" · ")}</div>` +
      `<div class="row"><button id="mgPrint" title="A one-page sheet: the 3D view, mics, placement and these notes. Choose Save as PDF in the print dialog to keep a file.">Print / save as PDF</button></div>`;
    $("mgPrint").onclick = () => printSheet(name, chosen);
    box.querySelectorAll("details").forEach((d) => d.addEventListener("toggle", () => (notesOpen[d.dataset.notes] = d.open)));
    box.querySelectorAll('input[name="mgCtx"]').forEach(
      (r) =>
        (r.onchange = () => {
          notesCtx = r.value;
          notes(name, chosen);
        }),
    );
  }
  /* Usual first steps, then the fixes that are only for a problem you hear ("If it sounds boxy"). */
  function procGroups(list, card) {
    const usual = list.filter((p) => !p.when),
      ifs = list.filter((p) => p.when);
    return (
      (usual.length ? `<div class="mgGrp" data-grp="usual"><h5>Start with</h5>${usual.map(card).join("")}</div>` : "") +
      (ifs.length ? `<div class="mgGrp" data-grp="if"><h5>Only if you hear it</h5>${ifs.map(card).join("")}</div>` : "")
    );
  }
  /* The technique's mics (and its DI, if any) with the per-mic notes that match their slot labels. */
  function micNotes(N, chosen) {
    if (!N.mics) return [];
    const t = source().t[+$("mgTechnique").value],
      slots = t[2].map((s, i) => ({ label: s[0], model: chosen[i] }));
    if (t.di) slots.push({ label: "Direct input", model: t.di });
    return slots.map((x) => ({ ...x, M: N.mics.find((m) => new RegExp(m.match, "i").test(x.label)) })).filter((x) => x.M);
  }
  /* Print / save as PDF: a sheet for the chosen technique, opened in a new window (no scripts in it; the page's
     Content Security Policy carries over). The 3D view is captured right after a render. */
  function printSheet(name, chosen) {
    const s = source(),
      t = s.t[+$("mgTechnique").value],
      N = GUIDE_NOTES[name],
      e = (v) => (typeof esc === "function" ? esc(v) : String(v)),
      cond = chosen.some(isCond);
    let shot = "";
    try {
      render();
      shot = cv.toDataURL("image/png");
    } catch (err) {
      shot = "";
    }
    const card = (p) =>
      `<div class="card">${p.when ? `<div class="when">If ${e(p.when)}</div>` : ""}<b>${e(p.kind)}</b><table>${p.set.map(([k, v]) => `<tr><td>${e(k)}</td><td>${e(v)}</td></tr>`).join("")}</table><div class="m">${e(p.why)}</div></div>`;
    const ctx = notesCtx === "rec" ? "Recording / mix" : "Live sound",
      general = notesCtx === "rec" ? N.proc.rec : N.proc.live || [],
      mics = t[2]
        .map((x, i) => `<tr><td><b>${e(x[0])}</b></td><td>${e(chosen[i] || x[1])}</td><td>${e(x[4])}</td><td>${e(x[5])}</td></tr>`)
        .join("") + (t.di ? `<tr><td><b>Direct input</b></td><td>${e(t.di)}</td><td></td><td></td></tr>` : ""),
      acc = N.acc
        .filter((a) => !a.cond || cond)
        .map((a) => `<li><b>${e(a.item)}</b> (${a.out ? "needed outdoors" : a.level}): ${e(a.why)}</li>`)
        .join(""),
      per = micNotes(N, chosen)
        .map(({ label, M }) => {
          const list = notesCtx === "rec" ? M.rec || [] : M.live || [];
          return list.length ? `<h3>${e(label)}</h3>${procGroups(list, card)}` : "";
        })
        .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${e(name)}: ${e(t[0])}</title><style>
body{font:13px/1.45 system-ui,sans-serif;color:#111;background:#fff;max-width:780px;margin:0 auto;padding:16px}
h1{font-size:20px;margin:0}h2{font-size:15px;margin:14px 0 4px;border-bottom:1px solid #ccc}h3{font-size:13px;margin:8px 0 2px}
.m{color:#555}img{width:100%;max-height:300px;object-fit:contain;border:1px solid #ddd;margin:8px 0}
table{border-collapse:collapse}td{padding:1px 10px 1px 0;vertical-align:top}.mics td{border-bottom:1px solid #eee;padding:3px 10px 3px 0}
.card{border-left:3px solid #888;padding:2px 8px;margin:5px 0;break-inside:avoid}.card td:first-child{color:#555;white-space:nowrap}
ul{margin:4px 0;padding-left:18px}h5{font-size:12px;margin:6px 0 2px;color:#555}.when{font-style:italic;color:#333}.draft{border:1px dashed #888;border-radius:6px;padding:0 5px;font-size:11px;color:#555}
</style></head><body>
<h1>${e(name)}: ${e(t[0])}</h1><div class="m">${s.post === "sitting" ? "Sitting" : "Standing"} · processing for ${ctx}${
      GUIDE_NOTES_STATUS === "draft" ? ' · <span class="draft">draft notes</span>' : ""
    } · Rec Toolbox</div>
${shot ? `<img src="${shot}" alt="3D view of the setup">` : ""}
<p>${e(t[1])}</p>
<h2>Mics</h2><table class="mics"><tr class="m"><td>Slot</td><td>Mic</td><td>Distance</td><td>Notes</td></tr>${mics}</table>
<h2>Where the sound comes from</h2><ul>${N.source.map((x) => `<li>${e(x)}</li>`).join("")}</ul>
${acc ? `<h2>Accessories</h2><ul>${acc}</ul>` : ""}${(() => {
      const pads = padCheck(name, chosen).filter((x) => x.level !== "ok");
      return pads.length ? `<h3>Pad check</h3><ul>${pads.map((x) => `<li><b>${e(x.label)}</b> (${e(x.model)}): peaks about ${x.peak} dB SPL at ${e(x.dist)}, max ${x.lim} dB; ${e(x.say)}.${e(x.pre)}</li>`).join("")}</ul>` : "";
    })()}
<h2>Processing starting points (${ctx})</h2><div class="m">Plugin-neutral; adjust by ear. Steps marked "If…" are only for when you hear that problem.</div>${procGroups(general, card) || '<div class="m">As for recording.</div>'}${per}
<p class="m">Sources: ${N.refs.map(([x]) => e(x)).join(" · ")}</p></body></html>`;
    const w = window.open("", "_blank");
    if (!w) {
      $("mgWarn").textContent = "The print sheet was blocked by a pop-up blocker; allow pop-ups for this page and try again.";
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }
  function options() {
    const old = wantedGuideInstrument || $("mgInstrument").value;
    $("mgInstrument").innerHTML = G.map((x) => "<option>" + x.n + "</option>").join("");
    $("mgInstrument").value = G.some((x) => x.n === old) ? old : G[0].n;
    wantedGuideInstrument = "";
    tech();
  }
  function tech() {
    const s = source();
    $("mgPosture").innerHTML =
      '<option value="' + s.post + '">' + (s.post === "sitting" ? "Sitting" : "Standing") + "</option>";
    $("mgPosture").disabled = true;
    $("mgTechnique").innerHTML = s.t.map((x, i) => '<option value="' + i + '">' + x[0] + "</option>").join("");
    pick = {};
    // Large scenes (a car, a crowd) frame the camera on the whole scene; the next ordinary source puts it back
    if (tar) {
      if (s.frame) {
        tar.set(0, s.frame[0], s.frame[1]);
        orb.r = s.frame[2];
        framed = true;
      } else if (framed) {
        tar.set(0, 2.5, -0.25);
        orb.r = 14;
        framed = false;
      }
    }
    slots();
    build();
  }
  let framed = false;
  function slots() {
    const t0 = source().t[+$("mgTechnique").value];
    if (isKit(t0)) kitRefresh();
    kitUI(isKit(t0));
    const t = t0,
      chosen = guideChoices(t);
    $("mgAdvice").textContent = t[1];
    notes(source().n, chosen);
    const di = t.di
      ? '<div class="mgSlot"><b>Direct input</b><div class="m">' +
        t.di +
        " · owned " +
        (inv().acc.find((x) => x.name === t.di) || {}).owned +
        "</div></div>"
      : "";
    $("mgMics").innerHTML =
      t[2]
        .map((s, i) => {
          const selected = chosen[i];
          return (
            '<div class="mgSlot"><b>' +
            s[0] +
            '</b><div class="m">' +
            s[4] +
            " · " +
            s[5] +
            '</div><select data-mg="' +
            i +
            '">' +
            Object.keys(MODELS)
              .map((k) => {
                const available = guideStock(k) - chosen.filter((x, j) => x === k && j !== i).length;
                return (
                  '<option value="' +
                  k +
                  '" ' +
                  (k === selected ? "selected" : "") +
                  " " +
                  (available <= 0 && k !== selected ? "disabled" : "") +
                  ">" +
                  k +
                  (micInventoryDefined() ? " · free " + guideStock(k) : "") +
                  "</option>"
                );
              })
              .join("") +
            "</select></div>"
          );
        })
        .join("") + di;
    $("mgMics")
      .querySelectorAll("[data-mg]")
      .forEach(
        (e) =>
          (e.onchange = () => {
            pick[+e.dataset.mg] = e.value;
            build();
            notes(source().n, guideChoices(source().t[+$("mgTechnique").value])); // condenser-only accessories follow the mic
          }),
      );
  }
  let guideSaveTimer = 0;
  function saveGuideSoon() {
    clearTimeout(guideSaveTimer);
    guideSaveTimer = setTimeout(saveGuide, 220);
  }
  function render() {
    if (!R) return;
    const w = cv.clientWidth,
      h = cv.clientHeight;
    if (!w || !h) return;
    const rw = Math.round(w * R.getPixelRatio()),
      rh = Math.round(h * R.getPixelRatio());
    if (cv.width !== rw || cv.height !== rh) {
      R.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    }
    tar.y = Math.max(0, tar.y);
    if (view === "2d") {
      twoD.h = Math.max(6, Math.min(60, twoD.h));
      cam.position.set(tar.x, twoD.h, tar.z);
      cam.up.set(Math.sin(twoD.rot), 0, -Math.cos(twoD.rot));
      cam.lookAt(tar);
    } else {
      cam.up.set(0, 1, 0);
      orb.ph = Math.max(0.04, Math.min(Math.PI / 2 - 0.03, orb.ph));
      orb.r = Math.max(4, Math.min(34, orb.r));
      cam.position.set(
        tar.x + orb.r * Math.sin(orb.ph) * Math.cos(orb.th),
        tar.y + orb.r * Math.cos(orb.ph),
        tar.z + orb.r * Math.sin(orb.ph) * Math.sin(orb.th),
      );
      cam.position.y = Math.max(0.5, cam.position.y);
      cam.lookAt(tar);
    }
    R.render(sc, cam);
  }
  /* For tests and screenshots: camera access (orbit radius / angle / tilt and target). */
  window.__guideCam = (r, th, ph, ty) => {
    Object.assign(orb, { r, th, ph });
    if (ty != null) tar.set(0, ty, -0.4);
    render();
  };
  window.__guideScene = () => sc;
  window.__guideRig = (k) => rig(k);
  function bind() {
    let d;
    cv.addEventListener("contextmenu", (e) => e.preventDefault());
    cv.addEventListener("pointerdown", (e) => {
      d = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey };
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener("pointermove", (e) => {
      if (!d) return;
      const dx = e.clientX - d.x,
        dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      if (view === "2d") {
        const f = twoD.h / 650,
          c = Math.cos(twoD.rot),
          s = Math.sin(twoD.rot);
        tar.x -= (c * dx - s * dy) * f;
        tar.z += (s * dx + c * dy) * f;
        render();
        return;
      }
      if (d.pan) {
        const f = orb.r / 600,
          right = new THREE.Vector3(),
          up = new THREE.Vector3();
        cam.matrix.extractBasis(right, up, new THREE.Vector3());
        tar.x -= (right.x * dx - up.x * dy) * f;
        tar.z -= (right.z * dx - up.z * dy) * f;
        tar.y = Math.max(0, tar.y + up.y * dy * f);
      } else {
        orb.th += dx * 0.006;
        orb.ph = Math.max(0.04, Math.min(Math.PI / 2 - 0.03, orb.ph - dy * 0.006));
      }
      render();
    });
    cv.addEventListener("pointerup", () => {
      d = null;
      saveGuideSoon();
    });
    cv.addEventListener("pointercancel", () => {
      d = null;
      saveGuideSoon();
    });
    cv.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        if (d) return;
        if (view === "2d") twoD.h *= Math.exp(e.deltaY * 0.0024);
        else orb.r *= Math.exp(e.deltaY * 0.0024);
        render();
        saveGuideSoon();
      },
      { passive: false },
    );
    window.addEventListener("resize", render);
    document.querySelectorAll("[data-mgv]").forEach(
      (b) =>
        (b.onclick = () => {
          view = b.dataset.mgv;
          document.querySelectorAll("[data-mgv]").forEach((x) => x.classList.toggle("on", x === b));
          render();
          saveGuideSoon();
        }),
    );
    document.querySelectorAll("[data-mga]").forEach(
      (b) =>
        (b.onclick = () => {
          const a = b.dataset.mga;
          if (view === "2d") {
            if (a === "in") twoD.h /= 1.35;
            if (a === "out") twoD.h *= 1.35;
            if (a === "fit") {
              tar.set(0, 0, -0.25);
              twoD = { h: 22, rot: 0 };
            }
            if (a === "ccw") twoD.rot -= Math.PI / 2;
            if (a === "cw") twoD.rot += Math.PI / 2;
          } else {
            if (a === "in") orb.r /= 1.35;
            if (a === "out") orb.r *= 1.35;
            if (a === "fit") {
              tar.set(0, 2.5, -0.25);
              orb = { r: 14, th: -0.72, ph: 1.05 };
            }
            if (a === "ccw") orb.th -= Math.PI / 2;
            if (a === "cw") orb.th += Math.PI / 2;
          }
          render();
          saveGuideSoon();
        }),
    );
  }
  const guideIds = [
    "mgFamily",
    "mgSearch",
    "mgInstrument",
    "mgTechnique",
    "mgPosture",
    "mgFloorW",
    "mgFloorD",
    "mgDist",
    "mgPattern",
    "mgSource",
    "mgAim",
    "mgStand",
    "mgGrid",
  ];
  function saveGuide() {
    try {
      const o = { orb, twoD, tar: tar && [tar.x, tar.y, tar.z], view };
      guideIds.forEach((id) => {
        const e = $(id);
        o[id] = e.type === "checkbox" ? e.checked : e.value;
      });
      store.setJSON("rt-fh-guide-v1", o);
    } catch (e) {
      console.warn("Guide settings not saved", e);
    }
  }
  function loadGuide() {
    try {
      const o = store.getJSON("rt-fh-guide-v1", null, "technique guide settings");
      if (!o) return;
      guideIds.forEach((id) => {
        const e = $(id);
        if (o[id] !== undefined) {
          if (e.type === "checkbox") e.checked = o[id];
          else {
            e.value = o[id];
            if (id === "mgInstrument") wantedGuideInstrument = o[id];
          }
        }
      });
      if (o.orb) orb = o.orb;
      if (o.twoD) twoD = o.twoD;
      if (o.tar && tar) tar.set(...o.tar);
      if (o.view) view = o.view;
    } catch (e) {
      console.warn("Saved guide settings partly ignored", e);
    }
  }
  loadGuide();
  $("mgFamily").onchange = searchResults;
  $("mgSearch").oninput = searchResults;
  $("mgSearch").onblur = () =>
    setTimeout(() => {
      $("mgSearchResults").hidden = true;
    }, 150);
  $("mgInstrument").onchange = tech;
  window.addEventListener("rt:themechange", () => R && build()); // accents and background follow the theme
  window.addEventListener("rt:inventorychange", () => { slots(); if (R) build(); }); // the mic list and "free N" follow the locker
  $("mgTechnique").onchange = () => {
    pick = {};
    slots();
    build();
  };
  ["mgFloorW", "mgFloorD", "mgDist", "mgPattern", "mgAim", "mgSource", "mgStand", "mgGrid"].forEach(
    (id) => ($(id).onchange = build),
  );
  options();
})();
