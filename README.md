# San Francisco Street Tree Map

Interactive map of SF's ~195k street trees. Filter by species or neighborhood, click any tree for details including species, planting date, trunk size, street view, and removal permit status.

**[Live map →](https://shaanvaidya.com/SanFranciscoStreetTreeMap)**

## Stack

- React + TypeScript + Vite
- Mapbox GL JS (vector tiles)
- Material UI
- Python + geopandas (data pipeline)

## Dev

```bash
npm install
npm run dev   # http://localhost:5173/SanFranciscoStreetTreeMap/
```

Needs a `VITE_MAPBOX_TOKEN` env var (falls back to a hardcoded public token if not set).

## Deploy

```bash
npm run deploy  # builds and pushes dist/ to gh-pages branch
```

## Data

Tree data comes from the [SF DPW Street Tree List](https://data.sfgov.org/City-Infrastructure/Street-Tree-List/tkzw-k3nq), updated regularly. Two outputs power the map:

- **Mapbox vector tileset** (`shaanvaidya.6gtq3t4j`) — renders the tree dots
- **`public/trees-lookup.json`** — tree metadata fetched at runtime for details and filtering

See `DATA_PROCESSING_WORKFLOW.md` for the full pipeline to regenerate these from a new SF export.
