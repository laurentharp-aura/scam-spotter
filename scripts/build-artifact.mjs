// Inlines the production build (dist/) into one page for publishing as a claude.ai Artifact.
// Run after `npm run build`: node scripts/build-artifact.mjs <out.html>
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const out = process.argv[2];
if (!out) throw new Error('usage: node scripts/build-artifact.mjs <out.html>');
const assets = readdirSync('dist/assets');
const read = (ext) => readFileSync(`dist/assets/${assets.find(f => f.endsWith(ext))}`, 'utf8');
const css = read('.css');
const js = read('.js');
if (/<\/script/i.test(js)) throw new Error('bundle contains a closing script tag; cannot inline safely');

// The artifact host supplies <!doctype>, <head> and <body>, so this is page content only.
writeFileSync(out, `<title>Scam Spotter</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<style>
${css}
:root { color-scheme: light; }
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`);
console.log(`wrote ${out} (${Math.round((css.length + js.length) / 1024)} KB inlined)`);
