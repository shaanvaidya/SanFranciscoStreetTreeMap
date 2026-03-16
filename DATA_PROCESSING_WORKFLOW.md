# San Francisco Street Tree Data Processing Workflow

Transforms raw SF DPW street tree CSVs into optimized GeoJSON, vector tiles, and lookup files for the interactive map.

## Source Data

Download the latest versions from SF Open Data:
- **Street trees:** [Street Tree List](https://data.sfgov.org/City-Infrastructure/Street-Tree-List/tkzw-k3nq) → save as `data_prep/Street_Tree_List_YYYYMMDD.csv`
- **Removal notifications:** [Street Tree Removal Notifications](https://data.sfgov.org/City-Infrastructure/Street-Tree-Removal-Notifications/qrwx-q4gg) → save as `data_prep/Street_Tree_Removal_Notifications_YYYYMMDD.csv`
- **Neighborhoods:** [Analysis Neighborhoods](https://data.sfgov.org/City-Infrastructure/Analysis-Neighborhoods/p5b7-5n3h) → save as `data_prep/Analysis_Neighborhoods_YYYYMMDD.csv`

## Processing Pipeline

All scripts are in `data_prep/`. Run from that directory.

### Step 1: Initial Data Cleaning
```bash
python 01_initial_clean.py Street_Tree_List_YYYYMMDD.csv
```
- Standardizes column types (dates, numerics)
- Title-cases species names
- Drops completely empty rows

**Output:** `cleaned_trees.csv`

---

### Step 2: Advanced Cleanup
```bash
python 02_advanced_clean.py
```
- Renames columns for readability (`qSpecies` → `Species`, etc.)
- Drops unused columns (`SiteOrder`, `PlantType`, `qCaretaker`, etc.)
- Normalizes DBH: fills missing → 10 inches, min 1, **cap at 60 inches** (larger values are data-entry errors that cause oversized map dots)
- Applies species name corrections (see `SPECIES_CORRECTIONS` dict)
- Deduplicates species: where the same scientific name has multiple common names, picks the most frequent (skips genus-level `Spp` entries)
- Removes "Potential Site" entries

**Output:** `cleaned_street_trees.csv`

---

### Step 3: Neighborhood Spatial Join
```bash
python 03_extract_neighborhoods.py --neighborhoods Analysis_Neighborhoods_YYYYMMDD.csv
```
- Builds `neighborhood_mapping.json` (float index → name, used by frontend filter dropdowns)
- Does a point-in-polygon spatial join to assign `neighborhood_name` to each tree (the SF dataset no longer includes this column directly)

**Output:** `neighborhood_mapping.json`, updates `cleaned_street_trees.csv` in-place

---

### Step 4: Clean Removal Notifications
```bash
python 04_clean_removals.py --input Street_Tree_Removal_Notifications_YYYYMMDD.csv
```
- Extracts clean numeric Tree IDs (handles both plain integers and `TRE-XXXXXX` format)
- Note: removal notifications mean a permit has been *filed*, not that the tree is confirmed removed

**Output:** `cleaned_removal_notifications.csv`

---

### Step 5: Species & Genus Analysis
```bash
python 05_get_species.py
```
- Groups species by genus
- Generates HSL color map (hues evenly distributed across genera, sorted alphabetically for consistency)

**Outputs:** `genus_list.json`, `genus_to_species.json`

---

### Step 6: Convert to GeoJSON
```bash
python 06_convert_to_geojson.py
```
- Tags trees with removal permit as `markedForRemoval: true` (does not remove them)
- Assigns genus-based colors
- Assigns neighborhood names from spatial join
- Rounds coordinates to 6 decimal places
- Skips trees with missing coordinates

**Output:** `trees.geojson`

---

### Step 7: Generate Vector Tiles
```bash
tippecanoe -o trees.mbtiles \
  --layer=trees \
  --minimum-zoom=10 \
  --maximum-zoom=16 \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  --no-feature-limit \
  --no-tile-size-limit \
  --force \
  trees.geojson
```
Then upload `trees.mbtiles` to Mapbox Studio → replace tileset `shaanvaidya.6gtq3t4j`. If the tileset ID changes, update `src/App.tsx`.

**Output:** `trees.mbtiles`

---

### Step 8: Generate Lookup JSON
```bash
node generate-trees-lookup.cjs
```
- Extracts flat array of tree metadata from GeoJSON (no geometry)
- Used by the frontend for filtering, search, and tree details panel

**Output:** `trees-lookup.json`

---

### Step 9: Deploy
```bash
cp data_prep/trees-lookup.json public/trees-lookup.json
npm run deploy
```

## File Structure

```
data_prep/
├── Street_Tree_List_YYYYMMDD.csv              # Raw SF DPW dataset
├── Street_Tree_Removal_Notifications_YYYYMMDD.csv
├── Analysis_Neighborhoods_YYYYMMDD.csv
├── cleaned_trees.csv                          # Step 1 output
├── cleaned_street_trees.csv                   # Steps 2 & 3 output
├── cleaned_removal_notifications.csv          # Step 4 output
├── genus_list.json                            # Step 5 output
├── genus_to_species.json                      # Step 5 output
├── trees.geojson                              # Step 6 output
├── trees.mbtiles                              # Step 7 output
└── trees-lookup.json                          # Step 8 output

public/
└── trees-lookup.json                          # Copied from data_prep, served to frontend
```

## Automated Pipeline

The full pipeline runs automatically via GitHub Actions (`.github/workflows/update-tree-data.yml`) on the 1st of every month, or manually from the Actions tab.

It handles everything: downloading fresh SF data, running steps 1–8, uploading the new tileset to Mapbox, and deploying to GitHub Pages.

**Required GitHub repository secrets** (`Settings → Secrets → Actions → New repository secret`):
- `MAPBOX_SECRET_TOKEN` — Mapbox secret token (`sk.*`). Needs scopes: `UPLOADS:READ`, `UPLOADS:LIST`, `UPLOADS:WRITE`, `TILESETS:READ`, `TILESETS:LIST`, `TILESETS:WRITE`
- `VITE_MAPBOX_TOKEN` — public Mapbox token (`pk.*`), same value as in `.env.local`

**Gotchas:**
- The Socrata API returns lowercase column names (`qspecies`, `treeid`) — `download_data.py` normalizes these to match what the processing scripts expect
- The neighborhoods dataset (`p5b7-5n3h`) returns no geometry via the Socrata API — `Analysis_Neighborhoods.csv` is committed as a static file instead and won't need updating unless SF redraws neighborhood boundaries
- Mapbox's credentials endpoint returns AWS temp credentials, not a presigned URL — the S3 upload uses `boto3` to sign the request properly
- The Mapbox upload job expects the `url` field from the credentials response directly (not a constructed `s3://` URL)

---

## Landmark Trees Dataset (`public/landmarks.json`)

A curated collection of notable SF trees compiled by **Mike Sullivan** ([sftrees.com](https://www.sftrees.com/landmark-trees)). This is separate from the city street tree dataset — it includes private, park, and street trees that Mike considers noteworthy.

> **Status (March 2026):** Prototype only. Need to contact Mike Sullivan for permission before taking live. Credit him prominently with a link to sftrees.com.

### Sources

Two complementary datasets from the same curator:

1. **BatchGeo KML export** (`public/landmarks-raw-kml.json`) — downloaded from https://batchgeo.com/map/dca3bf889d8a8ad669b487d252dc0ded
   - 238 trees with GPS coordinates, scientific name, common name, street address
   - 95 entries have personal detail notes ("only one in SF", walking directions, etc.)
   - 60 entries have photo URLs (imgur and postimg)

2. **sftrees.com text** (`public/landmarks-raw-sftrees.txt`) — scraped from https://www.sftrees.com/landmark-trees
   - ~265 entries with prose descriptions, neighborhood context, multiple location examples
   - No coordinates
   - Scraped in two passes: G–Z was in the initial scrape; A–F required a second fetch

### How `landmarks.json` was compiled

**Step 1 — Parse KML**
```python
import xml.etree.ElementTree as ET
# Parse Placemarks: extract name, Scientific Name (ExtendedData), address, coordinates,
# Detail note, Image URL, Closeup Photo
```

**Step 2 — Parse sftrees.com text**
Each line has the format `Genus species (common name): description`. Parsed with regex line-by-line. A–F and G–Z were parsed separately due to format differences and merged by scientific name key.

**Step 3 — Merge by scientific name**
Normalized scientific names (lowercase, strip non-word chars) used as join key. KML is the primary source (has GPS); sftrees.com description added where matched. ~100 entries have both GPS + description; ~145 are KML-only.

**Step 4 — Match to city street tree dataset**
For each of the 238 GPS landmarks, searched `trees-lookup.json` for the nearest street tree of the **same species** within 100m (haversine distance). Grid-indexed for speed.
- **88 confident matches** (`match_type: 'species'`) → assigned real `tree_id`
- **150 unmatched** (private/park trees, or species not in city dataset) → assigned synthetic negative IDs (-1, -2, …)

**Step 5 — Geocode no-GPS entries**
45 sftrees.com-only entries had no KML match. Addresses extracted from description text via regex, then geocoded using Nominatim (OpenStreetMap). All 283 entries now have GPS coordinates.

### Schema

```json
{
  "common_name": "monkey puzzle",
  "scientific_name": "Araucaria araucana",
  "address": "2261 Jackson Street",
  "latitude": 37.7908,
  "longitude": -122.4346,
  "detail": "Mike's personal note about this specific tree",
  "description": "Fuller sftrees.com prose with neighborhood context",
  "image_url": "https://imgur.com/EQcDKd6",
  "closeup_url": "",
  "curator": "Mike Sullivan (sftrees.com)",
  "tree_id": 12345,         // real city tree ID if species-confirmed match, else negative synthetic ID
  "match_type": "species",  // 'species' | 'nearest' | 'no_street_tree' | 'no_gps'
  "match_distance_m": 18.3
}
```

### Re-generating

To update if Mike adds new trees:
1. Re-download the BatchGeo KML (same URL, assuming Mike keeps it updated)
2. Re-scrape https://www.sftrees.com/landmark-trees (two fetches: A–F and G–Z due to page length)
3. Re-run the merge/match/geocode steps above (all logic was done in ad-hoc Python scripts in the Claude conversation — consider formalizing into `data_prep/compile_landmarks.py`)

### Modularity note

`landmarks.json` is intentionally separate from the city dataset. Future landmark collections (e.g. city-designated heritage trees, community lists) should be additional JSON files with the same schema, loaded by the frontend independently via a `useLandmarkCollections` hook.

---

## Tools and Dependencies

- **Python:** pandas, geopandas, shapely, colorsys, boto3, requests
- **Node.js:** fs module
- **Tippecanoe:** vector tile generation (`brew install tippecanoe`)
