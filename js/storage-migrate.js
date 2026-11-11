/* One-time move of saved settings from the old storage-key prefix to rt-fh-*. Keeps the old keys; skips keys that already exist. */ (() => {
  try {
    const ks = [];
    for (let i = 0; i < localStorage.length; i++) ks.push(localStorage.key(i));
    ks.forEach((k) => {
      const m = /^(?!rt-)[a-z]+-fh-(.+)$/.exec(k);
      if (m && localStorage.getItem("rt-fh-" + m[1]) === null)
        localStorage.setItem("rt-fh-" + m[1], localStorage.getItem(k));
    });
  } catch (e) {
    /* storage blocked: nothing to migrate */
  }
})();
