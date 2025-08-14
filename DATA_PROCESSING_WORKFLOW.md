# San Francisco Street Tree Data Processing Workflow

This document outlines the complete data processing pipeline used to transform the raw San Francisco Department of Public Works (DPW) street tree dataset into web-optimized formats for the interactive map application.

## Overview

The workflow takes the original CSV dataset from SF DPW and processes it through multiple stages to create optimized GeoJSON, vector tiles, and lookup files for fast web performance.

## Source Data

**Original Dataset:** `Street_Tree_List_20250323.csv`
- **Source:** San Francisco Department of Public Works (DPW)
- **Size:** ~198,386 street trees
- **Contains:** Tree species, coordinates, addresses, DBH measurements, planting dates, legal status, neighborhood codes

## Processing Pipeline

### Step 1: Initial Data Cleaning
**Script:** `data_prep/clean_trees.py`

**Purpose:** Basic data sanitization and type conversion

**Operations:**
- Convert date columns (`PlantDate`) to proper datetime format
- Clean species names (remove extra spaces, standardize case to Title Case)
- Clean address fields (`qAddress`, `SiteOrder`, `qSiteInfo`)
- Convert numeric columns to proper types:
  - `DBH` (Diameter at Breast Height)
  - `Latitude`, `Longitude`
  - `XCoord`, `YCoord`
- Remove completely empty rows

**Output:** `cleaned_trees.csv`

### Step 2: Advanced Data Cleanup
**Script:** `data_prep/cleanupData.py`

**Purpose:** Field restructuring, data validation, and species name standardization

**Operations:**
- **Column Renaming:** Improve readability
  - `TreeID` → `Tree ID`
  - `qLegalStatus` → `Legal Status`
  - `qSpecies` → `Species`
  - `qAddress` → `Address`
  - `qSiteInfo` → `Site Info`
  - `PlantDate` → `Plant Date`

- **Field Removal:** Drop unnecessary columns
  - `SiteOrder`, `PlantType`, `qCaretaker`, `qCareAssistant`
  - `PlotSize`, `PermitNotes`, `XCoord`, `YCoord`

- **DBH Data Cleaning:**
  - Replace empty values with default of 10 inches
  - Set minimum value of 1 inch for all trees
  - Convert to float type

- **Species Name Standardization:**
  - Fix common misspellings and inconsistencies
  - Standardize format from "scientific name :: common name" to "common name (scientific name)"
  - Handle edge cases like missing names, "Tree(s)", "To Be Determine"

- **Data Filtering:**
  - Remove "Potential Site" entries (not actual planted trees)

**Output:** `cleaned_street_trees.csv`

### Step 3: Neighborhood Processing
**Script:** `data_prep/extract_neighborhoods.py`

**Purpose:** Create neighborhood code-to-name mappings

**Operations:**
- Process `Analysis_Neighborhoods_20250329.csv`
- Create index-based mapping (1.0: "Bayview Hunters Point", etc.)
- Sort neighborhoods alphabetically for consistent indexing

**Output:** `neighborhood_mapping.json`

### Step 4: Species Analysis and Color Generation
**Script:** `data_prep/get_different_species.py`

**Purpose:** Analyze species diversity and generate color mappings for visualization

**Operations:**
- Extract unique species and group by genus
- Parse scientific names to identify genus (first word of scientific name)
- Generate color mappings using HSL color space:
  - Distribute hues evenly across 360° spectrum
  - Use consistent saturation (40%) and lightness (60%)
  - Sort genera alphabetically for consistent color assignment

**Outputs:**
- `genus_list.json` - List of all unique genera
- `genus_to_species.json` - Mapping of genus to all species in that genus

### Step 5: GeoJSON Conversion
**Script:** `data_prep/convert_to_geojson.py`

**Purpose:** Convert CSV data to web-friendly GeoJSON format with optimizations

**Operations:**
- **Coordinate Processing:**
  - Round latitude/longitude to 6 decimal places (~0.1m precision)
  - Skip rows with invalid coordinates

- **Species Processing:**
  - Extract common name and scientific name
  - Determine genus for color assignment
  - Apply title case formatting

- **Color Assignment:**
  - Assign hex colors based on genus using generated color map
  - Default to black (#000000) for unknown genera

- **Property Optimization:**
  - Include essential fields: id, species, address, dbh, plantDate, siteInfo, legalStatus
  - Add computed fields: color, neighborhood_name
  - Round numeric values for file size optimization

- **Data Validation:**
  - Filter out "Potential Site" entries
  - Skip rows with invalid coordinates
  - Handle missing values gracefully

**Output:** `trees.geojson` (optimized with minimal whitespace)

### Step 6: Vector Tile Generation
**Tool:** Tippecanoe

**Purpose:** Create optimized Mapbox vector tiles for fast map rendering

**Command:**
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

**Configuration:**
- **Zoom Levels:** 10-16 (city-wide to street-level detail)
- **Density Management:** Drop densest points when needed to maintain performance
- **No Limits:** Preserve all features and tile sizes for data completeness

**Output:** `trees.mbtiles`

### Step 7: Lookup Data Generation
**Script:** `data_prep/generate-trees-lookup.cjs` (Node.js)

**Purpose:** Create simplified JSON for fast client-side operations

**Operations:**
- Extract essential properties from GeoJSON features
- Remove geometry data (coordinates handled separately)
- Create flat array structure for efficient filtering/searching
- Format with readable JSON (2-space indentation)

**Output:** `trees-lookup.json`

## Final File Structure

```
data_prep/
├── Street_Tree_List_20250323.csv    # Original DPW dataset
├── cleaned_trees.csv                # Step 1 output
├── cleaned_street_trees.csv         # Step 2 output
├── neighborhood_mapping.json        # Step 3 output
├── genus_list.json                  # Step 4 output
├── genus_to_species.json           # Step 4 output
├── trees.geojson                   # Step 5 output
├── trees.mbtiles                   # Step 6 output
└── trees-lookup.json               # Step 7 output
```

## Web Application Integration

The processed files are used by the React application as follows:

- **`trees.mbtiles`:** Served as Mapbox vector tiles for map rendering
- **`trees-lookup.json`:** Loaded for filtering, search, and tree details
- **`neighborhood_mapping.json`:** Used for neighborhood filter options
- **`genus_to_species.json`:** Used for species filter options

## Performance Optimizations

1. **Coordinate Precision:** Rounded to 6 decimal places (~0.1m accuracy)
2. **Vector Tiles:** Enable fast rendering at multiple zoom levels
3. **Lookup JSON:** Separate geometry from attributes for efficient client operations
4. **Color Pre-computation:** Colors calculated during processing, not runtime
5. **Data Validation:** Invalid entries removed to reduce file sizes

## Data Quality Measures

- **Species Standardization:** 50+ manual corrections for common naming issues
- **Coordinate Validation:** Invalid coordinates filtered out
- **DBH Normalization:** Minimum/maximum bounds applied
- **Duplicate Handling:** Unique tree IDs ensure no duplicates
- **Missing Data:** Graceful handling with appropriate defaults

## Tools and Dependencies

- **Python:** pandas, numpy, json, colorsys
- **Node.js:** fs module for JSON processing
- **Tippecanoe:** Vector tile generation
- **External Data:** SF neighborhood boundaries, botanical databases
