/* Site-wide default settings. Anything a person changes is stored on top of these (js/settings.js), so changing a
   default here reaches everyone who hasn't changed that setting themselves. Keys are "area.name". */
const RT_DEFAULTS = {
  "smartRoute.mode": "clean", // what the Smart route button runs: "clean" or "short"
  "rail.tool": "planner", // tool shown when the page opens the first time
  "rail.collapsed": false, // tool rail shows icons and names
  "ui.theme": "auto", // colour theme (js/theme.js): "auto" follows the computer's light/dark setting; "dark", "light", "isu"
  "planner.view": null, // planner view toggles and sliders ({ c: checkboxes, v: values, view: "2d" | "3d" }); null = page defaults
};
