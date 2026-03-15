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

## Tools and Dependencies

- **Python:** pandas, geopandas, shapely, colorsys
- **Node.js:** fs module
- **Tippecanoe:** vector tile generation (`brew install tippecanoe`)
