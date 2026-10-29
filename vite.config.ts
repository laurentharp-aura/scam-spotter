import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Short commit id + build date, shown at the bottom of home so testers can tell which version they have.
const sha = (() => { try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch { return 'dev'; } })();
const built = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
// Only ask for Basel Grotesk once its licensed files are actually in public/fonts/.
const hasBasel = ['Regular', 'Medium', 'Bold'].every(w => existsSync(`public/fonts/BaselGrotesk-${w}.woff2`));

/** Writes version.json next to the page, so open copies can notice a newer deploy and reload. */
const versionFile = (): Plugin => ({
  name: 'version-file',
  generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ sha }) }); },
});

export default defineConfig({
  plugins: [react(), versionFile()],
  base: './',
  define: {
    __BUILD__: JSON.stringify(`${sha} · ${built} ET`),
    __BUILD_SHA__: JSON.stringify(sha),
    __HAS_BASEL__: JSON.stringify(hasBasel),
  },
});
