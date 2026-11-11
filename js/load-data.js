/* Loads a big data file (planner/data/<name>.js) the first time it is needed instead of when the page opens.
   It adds a <script> tag rather than using fetch(), because browsers block fetch() of files opened from disk but allow scripts.
   Returns a promise; asking twice reuses the same load, and a failed load can be retried. */
const loadData = (() => {
  const loads = {};
  return (name) =>
    (loads[name] ||= new Promise((ok, fail) => {
      const s = document.createElement("script");
      s.src = `data/${name}.js`;
      s.onload = ok;
      s.onerror = () => {
        delete loads[name];
        s.remove();
        fail(new Error(`Couldn't load data/${name}.js`));
      };
      document.head.appendChild(s);
    }));
})();
