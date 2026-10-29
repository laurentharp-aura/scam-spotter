// Aura's brand face. Basel Grotesk is commercial and not in this repo: drop the licensed .woff2 files into
// public/fonts/ (names below) and they load automatically. Until then the browser falls back to Hanken Grotesk.
// Declared here rather than in CSS so the URLs follow the site's base path (e.g. /scam-spotter/ on GitHub Pages).
const base = import.meta.env.BASE_URL;
const face = (file: string, weight: string) =>
  `@font-face { font-family: 'Basel Grotesk'; src: url('${base}fonts/${file}') format('woff2'); font-weight: ${weight}; font-style: normal; font-display: swap; }`;

const style = document.createElement('style');
style.textContent = [face('BaselGrotesk-Regular.woff2', '400'), face('BaselGrotesk-Medium.woff2', '500'), face('BaselGrotesk-Bold.woff2', '600 700')].join('\n');
document.head.appendChild(style);
