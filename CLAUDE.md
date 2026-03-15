# SanFranciscoStreetTreeMap

Interactive map of SF's ~220k street trees. Built with React + Vite + TypeScript + Mapbox GL JS + MUI.

## Dev

```bash
npm install   # first time only
npm run dev   # http://localhost:5173/SanFranciscoStreetTreeMap/
```

## Deploy

```bash
npm run deploy
# builds via vite, pushes dist/ to gh-pages branch
# live at shaanvaidya.github.io/SanFranciscoStreetTreeMap/
```

Uses a specific SSH key (`~/.ssh/id_ed25519_github_personal`) — if deploy fails with SSH error, check that key exists.

## Architecture

- `src/App.tsx` — main map component, loads tree data, handles filters
- `src/components/` — HeaderBar, TreeDetails, TreeSummaryBar, FiltersPanel
- `src/types/tree.ts` — TreeInfo type
- `src/theme.ts` — MUI theme

## Data

Two data sources:

**1. Mapbox vector tileset** — renders the ~220k tree dots on the map
- Tileset: `mapbox://shaanvaidya.a9iy9ch2`
- Source layer: `trees`
- Hosted on Mapbox (free tier)

**2. `public/trees-lookup.json`** — tree metadata (species, address, etc.)
- Fetched at runtime from GitHub Pages
- Tracked via Git LFS in the `gh-pages` branch

## Regenerating data (if SF updates their dataset)

1. Download latest data from SF Open Data → `data_prep/sf_street_trees.csv`
2. Run pipeline scripts in `data_prep/` (see `DATA_PROCESSING_WORKFLOW.md`)
3. Upload new `data_prep/trees.mbtiles` to Mapbox → Tilesets → Replace
4. If the tileset ID changes, update `src/App.tsx` line 73
5. Copy new `data_prep/trees-lookup.json` → `public/trees-lookup.json`
6. `npm run deploy`

## Mapbox token

Configured via `VITE_MAPBOX_TOKEN` env var (falls back to a hardcoded token in `App.tsx`).
