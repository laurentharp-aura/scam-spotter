# Scam Spotter by Aura

A mobile-first scam-spotting training game. This is the React implementation of the Claude Design prototype `project/Scam Spotter v6 copy.dc.html` (identical to v6).

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + production build to dist/
```

`dist/` is a static site that includes the home-screen icon and manifest, and deploys to GitHub Pages on every push to `main` (`.github/workflows/pages.yml`). To repackage the build as one self-contained page (used for the claude.ai demo link), run `node scripts/build-artifact.mjs <out.html>`.

## Structure

| Path | What |
|---|---|
| `src/data/content.ts` | 18 rounds across 6 themed levels (scam texts, fraud texts, emails, messages, ads, voicemails), 3 per level with real and fake mixed, plus the level and badge definitions. Each round has a stable `id`, which is what saved progress refers to. |
| `src/game/useGame.ts` | Game state, persistence (`localStorage`, key `scamSpotter.progress.v2`), the Decide → Flag → Learn flow, hints, scoring |
| `src/screens/` | Welcome, name and how-to-play onboarding · Home · Trail · Round (intro, message or voicemail, reveal) · Level complete · Badges · Help |
| `src/ui.tsx` | Shared colours, shadows and buttons, plus the badge medallion |
| `src/ds/` | Pieces pulled from the Aura Blueprint DS bundle: the icon subset, the `CallProtection` illustration and the token CSS. Regenerate them with `node scripts/extract-ds.mjs`, run from a checkout that has the Claude Design bundle in `../project/`. Don't edit the generated files. |

To use a new icon, add its name to `ICONS` in `scripts/extract-ds.mjs` and re-run the script.

## Testing switches

The prototype's Tweaks panel is available as URL params:

- `?unlockAll=1` opens every round on the trail.
- `?textScale=1.15` or `?textScale=1.3` enlarges the whole app.
- `?outlineTappables=1` dash-outlines every tappable phrase.

"Start over as a new player", at the bottom of the trail, resets progress.

## Known gaps (carried over from the design)

- "Talk to an Aura fraud specialist" on the help screen doesn't go anywhere yet.
- Type is set in Inter. Aura's Basel Grotesk isn't licensed into this repo.
