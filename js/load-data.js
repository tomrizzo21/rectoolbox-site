/* Loads a script the first time it is needed instead of when the page opens: big data files (planner/data/<name>.js)
   and optional libraries (e.g. the Supabase client, only when you use your account).
   It adds a <script> tag rather than using fetch(), because browsers block fetch() of files opened from disk but allow scripts.
   Returns a promise; asking twice reuses the same load, and a failed load can be retried. */
const loadScript = (() => {
  const loads = {};
  return (src) =>
    (loads[src] ||= new Promise((ok, fail) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = ok;
      s.onerror = () => {
        delete loads[src];
        s.remove();
        fail(new Error(`Couldn't load ${src}`));
      };
      document.head.appendChild(s);
    }));
})();
const loadData = (name) => loadScript(`data/${name}.js`);
