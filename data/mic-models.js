/* 3D mic models (planner/models/mics/<key>.glb, from Meshy; see BACKLOG A-mic3d) and how each one is used in 3D.
   Coordinates are FRACTIONS of the model's bounding box (0..1 on x, y, z; y is up, +z is the model's front, the side
   Meshy was shown first), so they survive any rescale. Directions are unit-ish vectors in the same frame.
     address  "side" (talk into the side, the "this side toward source" face: LDCs, ribbons), "end" (talk into the tip:
              handhelds, pencils, shotguns, clip-ons), "boundary" (lies on a surface, picks up from above).
     capsule  where the diaphragm sits;  aim  the direction the capsule faces (toward the source).
     rear     true when the back is a live face too (figure-8 ribbons, multi-pattern LDCs).
     mount    where a stand, clip or boom attaches;  mountDir  the direction the stand comes from (out of the mic).
     pivot    for mics with a built-in clamp or clip that tilts: where the hinge is, the hinge axis, and how far it tilts
              in degrees either way from as-shown ({ at, axis, range: [min, max] }). The mic swings about it; the clamp
              stays with the stand.
     db       the Mic database name when it differs from the model's key;  noSite  no site copy yet (TLM 103, on hold).
     ok       false until Tom has checked the markers in mic-refs/_compare.html (?meta=1).
   Not yet scaled to a published size (no length in mic-refs/dims.json): ATM350a, e 904, e604. */
const MIC_MODELS = {
  "AKG C414 XLII": { address: "side", capsule: [0.5, 0.8, 0.5], aim: [0, 0, 1], rear: true, mount: [0.5, 0, 0.5], mountDir: [0, -1, 0], ok: false },
  "Neumann TLM 103": { noSite: true, address: "side", capsule: [0.5, 0.78, 0.5], aim: [0, 0, 1], mount: [0.5, 0, 0.5], mountDir: [0, -1, 0], ok: false },
  "Neumann U 47 fet": { address: "side", capsule: [0.5, 0.82, 0.5], aim: [0, 0, 1], mount: [0.5, 0, 0.5], mountDir: [0, -1, 0], ok: false },
  "Royer R-10": { address: "side", capsule: [0.5, 0.75, 0.5], aim: [0, 0, 1], rear: true, mount: [0.5, 0, 0.5], mountDir: [0, -1, 0], ok: false },
  "Royer R-121": { address: "side", capsule: [0.5, 0.75, 0.5], aim: [0, 0, 1], rear: true, mount: [0.5, 0, 0.5], mountDir: [0, -1, 0], ok: false },
  "Neumann KMS 105": { address: "end", capsule: [0.5, 0.95, 0.5], aim: [0, 1, 0], mount: [0.5, 0.25, 0.5], mountDir: [0, -1, 0], ok: false },
  "Shure KSM9": { address: "end", capsule: [0.5, 0.95, 0.5], aim: [0, 1, 0], mount: [0.5, 0.25, 0.5], mountDir: [0, -1, 0], ok: false },
  "Shure SM58": { address: "end", capsule: [0.5, 0.95, 0.5], aim: [0, 1, 0], mount: [0.5, 0.25, 0.5], mountDir: [0, -1, 0], ok: false },
  "Electro-Voice RE20": { address: "end", capsule: [0.5, 0.95, 0.5], aim: [0, 1, 0], mount: [0.5, 0.2, 0.5], mountDir: [0, -1, 0], ok: false },
  "Sennheiser MD 441-U": { address: "end", capsule: [0.5, 0.95, 0.5], aim: [0, 1, 0], mount: [0.5, 0.22, 0], mountDir: [0, 0, -1], pivot: { at: [0.5, 0.22, 0], axis: [1, 0, 0], range: [-90, 90] }, ok: false },
  "Sennheiser MKH 416": { address: "end", capsule: [0.5, 0.97, 0.5], aim: [0, 1, 0], mount: [0.5, 0.35, 0.5], mountDir: [0, -1, 0], ok: false },
  "Rode NT4": { address: "end", capsule: [0.5, 0.95, 0.5], aim: [0, 1, 0], mount: [0.5, 0.2, 0.5], mountDir: [0, -1, 0], ok: false },
  "Audio Technica ATM350a": { address: "end", capsule: [0.5, 0.95, 0.5], aim: [0, 1, 0], mount: [0.5, 0, 0.5], mountDir: [0, -1, 0], ok: false },
  "Sennheiser e 908 B": { address: "end", capsule: [0.5, 0.97, 0.5], aim: [0, 1, 0], mount: [0.5, 0.05, 0.5], mountDir: [0, -1, 0], ok: false },
  "AKG D112 MkII": { address: "end", capsule: [0.5, 0.75, 0.75], aim: [0, 0.6, 0.8], mount: [0.5, 0, 0.5], mountDir: [0, -1, 0], pivot: { at: [0.5, 0.3, 0.5], axis: [1, 0, 0], range: [-90, 90] }, ok: false },
  "Shure Beta 52A": { address: "end", capsule: [0.5, 0.75, 0.75], aim: [0, 0.6, 0.8], mount: [0.5, 0, 0.5], mountDir: [0, -1, 0], pivot: { at: [0.5, 0.3, 0.5], axis: [1, 0, 0], range: [-90, 90] }, ok: false },
  "Sennheiser e 904": { db: "Sennheiser e904", address: "end", capsule: [0.5, 0.8, 0.7], aim: [0, 0.6, 0.8], mount: [0.5, 0, 0.5], mountDir: [0, -1, 0], pivot: { at: [0.5, 0.3, 0.5], axis: [1, 0, 0], range: [-60, 60] }, ok: false },
  "Sennheiser e604": { address: "end", capsule: [0.5, 0.8, 0.7], aim: [0, 0.6, 0.8], mount: [0.5, 0, 0.5], mountDir: [0, -1, 0], pivot: { at: [0.5, 0.3, 0.5], axis: [1, 0, 0], range: [-60, 60] }, ok: false },
  "Sennheiser MD 421-II": { address: "end", capsule: [0.1, 0.8, 0.5], aim: [-1, 0.3, 0], mount: [0.6, 0, 0.5], mountDir: [0, -1, 0], pivot: { at: [0.6, 0.15, 0.5], axis: [0, 0, 1], range: [-90, 90] }, ok: false },
  "Shure SM7B": { address: "end", capsule: [0.95, 0.35, 0.5], aim: [1, 0, 0], mount: [0.5, 1, 0.5], mountDir: [0, 1, 0], ok: false },
  "Shure Beta 91A": { address: "boundary", capsule: [0.5, 1, 0.5], aim: [0, 1, 0], mount: [0.5, 0, 0.5], mountDir: [0, -1, 0], ok: false },
};
/* The model entry for a Mic database / locker name, or null. */
function micModelFor(name) {
  if (typeof MIC_MODELS !== "object" || !name) return null;
  const n = String(name).replace(" (XY stereo)", "");
  if (MIC_MODELS[n]) return Object.assign({ key: n }, MIC_MODELS[n]);
  for (const k in MIC_MODELS) if (MIC_MODELS[k].db === n) return Object.assign({ key: k }, MIC_MODELS[k]);
  return null;
}
