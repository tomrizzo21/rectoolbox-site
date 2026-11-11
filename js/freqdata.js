/* Reference data for the Frequency chart tool (js/freqchart.js). Hand-written from common published instrument
   ranges and recording references; approximate, for orientation, not measurement.
   fund: playable fundamentals [low, high] Hz (concert pitch).
   over: where overtones (harmonics) still matter, up to this Hz.
   spl:  typical level at 1 m, quiet to loud playing [dB, dB].
   extra: other sounds the instrument makes, [label, low Hz, high Hz, what it is].
   kinds: the Setup planner section kinds that use this row ("Only my layout"); guitar and voice sections are also
   matched by name in freqRowFor() (js/freqchart.js). */
const FREQ_FAMILIES = ["Woodwinds", "Brass", "Percussion", "Strings and keys", "Voice"];
const FREQ_DATA = [
  // Woodwinds
  { id: "pic", fam: "Woodwinds", name: "Piccolo", fund: [587, 4186], over: 16000, spl: [85, 110], kinds: ["pic"],
    extra: [["Breath noise", 2000, 10000, "Air across the embouchure hole; more at quiet dynamics"], ["Key clicks", 1000, 4000, "Pads and keys closing"]] },
  { id: "fl", fam: "Woodwinds", name: "Flute", fund: [262, 2093], over: 14000, spl: [70, 100], kinds: ["fl"],
    extra: [["Breath noise", 2000, 10000, "Air across the embouchure hole; a big part of the flute sound"], ["Key clicks", 1000, 4000, "Pads and keys closing"]] },
  { id: "ob", fam: "Woodwinds", name: "Oboe", fund: [233, 1760], over: 12000, spl: [70, 100], kinds: [],
    extra: [["Reed buzz", 2000, 6000, "Double-reed edge that gives the nasal colour"], ["Key clicks", 1000, 4000, "Keywork"]] },
  { id: "cl", fam: "Woodwinds", name: "Clarinet (B♭)", fund: [147, 1865], over: 12000, spl: [65, 105], kinds: ["cl"],
    extra: [["Key clicks", 1000, 4000, "Keys and pads; mics near the keys hear more"], ["Breath / reed", 3000, 8000, "Air and reed noise at soft dynamics"]] },
  { id: "bsn", fam: "Woodwinds", name: "Bassoon", fund: [58, 622], over: 8000, spl: [65, 100], kinds: [],
    extra: [["Key clicks", 800, 3000, "Long keywork mechanism"], ["Reed buzz", 1500, 5000, "Double-reed edge"]] },
  { id: "ssx", fam: "Woodwinds", name: "Soprano sax", fund: [208, 1245], over: 14000, spl: [75, 108], kinds: ["ssx"],
    extra: [["Key clicks", 1000, 4000, "Pads closing"], ["Breath / reed", 3000, 9000, "Air and reed noise"]] },
  { id: "asx", fam: "Woodwinds", name: "Alto sax", fund: [139, 831], over: 12000, spl: [75, 110], kinds: ["sax"],
    extra: [["Key clicks", 1000, 4000, "Pads closing; louder on mics aimed at the keys"], ["Breath / reed", 3000, 8000, "Air and reed noise, the 'breathy' part of subtone"]] },
  { id: "tsx", fam: "Woodwinds", name: "Tenor sax", fund: [104, 659], over: 10000, spl: [75, 110], kinds: ["tsx"],
    extra: [["Key clicks", 800, 3500, "Pads closing"], ["Breath / reed", 2500, 8000, "Air and reed noise"]] },
  { id: "bsx", fam: "Woodwinds", name: "Baritone sax", fund: [69, 415], over: 8000, spl: [75, 110], kinds: ["bsx"],
    extra: [["Key clicks", 600, 3000, "Large pads closing; can thump"], ["Breath / reed", 2000, 7000, "Air and reed noise"]] },
  // Brass
  { id: "tpt", fam: "Brass", name: "Trumpet", fund: [185, 1175], over: 15000, spl: [80, 115], kinds: ["tpt"],
    extra: [["Valve clicks", 1000, 4000, "Valves bottoming out"], ["Breath / spit", 3000, 10000, "Air and moisture noise, mostly between phrases"]] },
  { id: "mel", fam: "Brass", name: "Mellophone", fund: [185, 1047], over: 10000, spl: [80, 112], kinds: ["mel"],
    extra: [["Valve clicks", 1000, 4000, "Valves bottoming out"]] },
  { id: "hn", fam: "Brass", name: "French horn", fund: [62, 698], over: 8000, spl: [70, 110], kinds: [],
    extra: [["Valve / rotor noise", 800, 3000, "Rotary valves and levers"]] },
  { id: "tb", fam: "Brass", name: "Trombone", fund: [58, 698], over: 10000, spl: [80, 115], kinds: ["tb"],
    extra: [["Slide noise", 200, 1500, "Slide moving and stopping"], ["Breath / spit", 3000, 9000, "Air and moisture noise"]] },
  { id: "bar", fam: "Brass", name: "Baritone / euphonium", fund: [58, 466], over: 8000, spl: [75, 110], kinds: ["bar"],
    extra: [["Valve clicks", 800, 3500, "Valves bottoming out"]] },
  { id: "tba", fam: "Brass", name: "Tuba / sousaphone", fund: [37, 349], over: 6000, spl: [75, 112], kinds: ["sou"],
    extra: [["Valve clicks", 500, 3000, "Large valves"], ["Breath / air", 1500, 6000, "Air through a big mouthpiece"]] },
  // Percussion
  { id: "kck", fam: "Percussion", name: "Kick drum", fund: [45, 100], over: 6000, spl: [100, 128], kinds: ["kck"],
    extra: [["Beater click", 2000, 5000, "Beater hitting the head; the 'attack' that cuts through"], ["Boxiness", 250, 600, "Shell resonance; often cut"], ["Port / air", 20, 45, "Air pushed out of the port"]] },
  { id: "snr", fam: "Percussion", name: "Snare drum", fund: [150, 250], over: 12000, spl: [100, 128], kinds: ["snr"],
    extra: [["Stick attack", 2000, 5000, "Stick hitting the head"], ["Snare wires", 4000, 10000, "Wire buzz; also rattles when other instruments play"], ["Rimshot crack", 800, 3000, "Stick hitting rim and head together"]] },
  { id: "tom", fam: "Percussion", name: "Toms", fund: [70, 300], over: 7000, spl: [98, 125], kinds: ["tom", "drm"],
    extra: [["Stick attack", 2500, 5000, "Stick hitting the head"], ["Ring / sustain", 70, 300, "Head ringing on after the hit"]] },
  { id: "qd", fam: "Percussion", name: "Marching tenors (quads)", fund: [150, 500], over: 8000, spl: [105, 128], kinds: ["qd"],
    extra: [["Stick attack", 2000, 6000, "Tight heads make a sharp attack"], ["Rim clicks", 1500, 5000, "Shots and rim work"]] },
  { id: "bd", fam: "Percussion", name: "Marching bass drums", fund: [40, 150], over: 4000, spl: [100, 125], kinds: ["bd"],
    extra: [["Mallet attack", 800, 3000, "Mallet hitting the head"], ["Rim clicks", 1500, 5000, "Rim shots"]] },
  { id: "hh", fam: "Percussion", name: "Hi-hat", fund: [300, 600], over: 20000, spl: [90, 115], kinds: ["hh"],
    extra: [["Stick ping", 3000, 6000, "Stick tip on the bow"], ["Shimmer / air", 8000, 16000, "The sizzle of open hats"], ["Pedal chick", 500, 2000, "Hats closing with the foot"]] },
  { id: "cym", fam: "Percussion", name: "Cymbals (crash, ride, clash)", fund: [300, 600], over: 20000, spl: [95, 125], kinds: ["cym"],
    extra: [["Stick / clash attack", 2000, 6000, "Initial hit"], ["Shimmer / wash", 6000, 16000, "Long decaying wash"], ["Ride bell ping", 1000, 3000, "Bell of the ride"]] },
  { id: "tmp", fam: "Percussion", name: "Timpani", fund: [73, 262], over: 3000, spl: [80, 118], kinds: [],
    extra: [["Mallet thud", 40, 120, "Mallet and air in the kettle"], ["Mallet attack", 800, 2500, "Felt on the head"]] },
  { id: "mar", fam: "Percussion", name: "Marimba", fund: [110, 2093], over: 8000, spl: [75, 105], kinds: [],
    extra: [["Mallet knock", 1000, 4000, "Mallet hitting the bar"], ["Resonator boom", 110, 400, "Tubes under the bars"]] },
  { id: "glk", fam: "Percussion", name: "Glockenspiel / bells", fund: [784, 4186], over: 16000, spl: [80, 110], kinds: [],
    extra: [["Mallet strike", 2000, 8000, "Hard mallet on metal"]] },
  // Strings and keys
  { id: "agtr", fam: "Strings and keys", name: "Acoustic guitar", fund: [82, 1175], over: 12000, spl: [60, 90], kinds: [], // planner "gtr" sections named "acoustic"
    extra: [
      ["Body resonance", 90, 250, "The air and top resonance; the 'boom' near the sound hole"],
      ["Body tap (thump)", 60, 200, "Palm or thumb on the top: guitar as a drum"],
      ["Body tap (knock)", 800, 3000, "Knuckles or nails on the top and sides"],
      ["Pick attack", 2000, 5000, "Pick hitting the string"],
      ["String zing / fingernail", 5000, 10000, "Bright pluck detail"],
      ["Finger slide / squeak", 1000, 6000, "Fingers sliding on wound strings"],
    ] },
  { id: "egtr", fam: "Strings and keys", name: "Electric guitar (amp)", fund: [82, 1319], over: 6000, spl: [85, 115], kinds: ["gtr"],
    extra: [["Pick attack", 2000, 4000, "Pick on the string, through the amp"], ["Speaker roll-off", 5000, 8000, "Most guitar speakers fade out here"], ["Amp hum / hiss", 50, 180, "Mains hum and buzz (hiss sits above 5 kHz)"]] },
  { id: "bass", fam: "Strings and keys", name: "Bass guitar", fund: [41, 392], over: 5000, spl: [85, 112], kinds: ["bas"],
    extra: [["Finger growl", 700, 1500, "Fingers or pick on the string; makes the bass audible on small speakers"], ["Slap / pop", 2000, 5000, "Thumb slap and string pop"], ["Fret noise", 1000, 3000, "Strings against frets"]] },
  { id: "ubass", fam: "Strings and keys", name: "Upright bass", fund: [41, 392], over: 5000, spl: [65, 95], kinds: [],
    extra: [["Finger pluck", 700, 1500, "Finger pulling the string"], ["String slap", 1500, 4000, "Slap style: string hitting the fingerboard"], ["Body thump", 60, 150, "Body and floor"]] },
  { id: "pno", fam: "Strings and keys", name: "Piano", fund: [27.5, 4186], over: 12000, spl: [65, 105], kinds: ["pno"],
    extra: [["Hammer attack", 2000, 5000, "Hammers hitting the strings"], ["Pedal / damper noise", 40, 200, "Pedal thumps and dampers lifting"], ["Key noise", 500, 2000, "Keys hitting the key bed"]] },
  { id: "vln", fam: "Strings and keys", name: "Violin", fund: [196, 2637], over: 16000, spl: [60, 95], kinds: [],
    extra: [["Bow noise / rosin", 3000, 10000, "Bow hair on the string"], ["Body resonance", 250, 600, "Main body modes"]] },
  { id: "vc", fam: "Strings and keys", name: "Cello", fund: [65, 880], over: 8000, spl: [60, 95], kinds: [],
    extra: [["Bow noise / rosin", 2000, 6000, "Bow hair on the string"], ["Body resonance", 100, 250, "Main body modes"]] },
  // Voice
  { id: "vm", fam: "Voice", name: "Voice (bass to tenor)", fund: [82, 523], over: 10000, spl: [60, 105], kinds: ["vox"],
    extra: [["Plosives (p, b)", 20, 150, "Bursts of air that thump a close mic"], ["Sibilance (s, sh)", 4000, 8000, "The 'ess' sounds"], ["Breath / air", 10000, 16000, "Air and breath around the voice"]] },
  { id: "vf", fam: "Voice", name: "Voice (alto to soprano)", fund: [175, 1047], over: 12000, spl: [60, 108], kinds: ["vox"],
    extra: [["Plosives (p, b)", 20, 150, "Bursts of air that thump a close mic"], ["Sibilance (s, sh)", 5000, 10000, "The 'ess' sounds"], ["Breath / air", 10000, 16000, "Air and breath around the voice"]] },
];
