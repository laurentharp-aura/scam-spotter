// GitHub Pages lets browsers (and home-screen web apps) keep an old copy for a while after a deploy.
// On open, compare this build with the deployed version.json and reload once if a newer one is live.
const KEY = 'scamSpotter.reloadedFor';

export function checkForUpdate() {
  if (__BUILD_SHA__ === 'dev') return;
  fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' })
    .then(r => (r.ok ? r.json() : null))
    .then((live: { sha?: string } | null) => {
      if (!live?.sha || live.sha === __BUILD_SHA__) return;
      // Guard against a reload loop if the CDN is still serving the old page for a moment.
      try { if (sessionStorage.getItem(KEY) === live.sha) return; sessionStorage.setItem(KEY, live.sha); } catch { /* ignore */ }
      const url = new URL(window.location.href);
      url.searchParams.set('v', live.sha);
      window.location.replace(url.toString());
    })
    .catch(() => { /* offline: keep the copy we have */ });
}
