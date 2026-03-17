# SanFranciscoStreetTreeMap

Interactive map of SF's ~195k street trees. Built with React + Vite + TypeScript + Mapbox GL JS + MUI.

## Dev

```bash
npm install   # first time only
npm run dev   # http://localhost:5173/ (or next available port)
```

## Deploy

```bash
npm run deploy
# builds via vite, pushes dist/ to gh-pages branch
# live at shaanvaidya.github.io/SanFranciscoStreetTreeMap/
```

## Architecture

- `src/App.tsx` — main map component, loads tree data, handles filters and panel state
- `src/components/` — HeaderBar, TreeDetails, TreeSummaryBar, FiltersPanel, ForestStats, LandmarkDetails
- `src/hooks/` — useTreeData, useTreeFilters, useLandmarks
- `src/types/tree.ts` — TreeInfo type
- `src/types/landmark.ts` — LandmarkInfo type
- `src/theme.ts` — MUI theme
- `src/flags.ts` — feature flags (e.g. LANDMARKS_ENABLED)

### Panel state model (`App.tsx`)

The sidebar is driven by two state variables:
- `panelView: 'stats' | 'tree' | 'landmark' | 'closed'` — what the panel displays
- `mobileExpanded: boolean` — whether the mobile bottom sheet is fully expanded

Derived: `desktopPanelOpen`, `mobilePanelOpen`, `showSummaryBar`

## Data

Two data sources:

**1. Mapbox vector tileset** — renders the tree dots on the map
- Tileset: `mapbox://shaanvaidya.6gtq3t4j`
- Source layer: `trees`
- Hosted on Mapbox (free tier)

**2. `public/trees-lookup.json`** — tree metadata (species, address, etc.)
- Fetched at runtime from GitHub Pages
- Tracked via Git LFS

## Regenerating data (if SF updates their dataset)

See `DATA_PROCESSING_WORKFLOW.md` for the full pipeline.

## Mapbox token

Configured via `VITE_MAPBOX_TOKEN` env var (falls back to a hardcoded token in `App.tsx`).
