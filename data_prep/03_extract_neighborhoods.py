"""
Step 3: Neighborhood Mapping & Spatial Join
--------------------------------------------
Two outputs:

1. neighborhood_mapping.json — float-index → name mapping (kept for
   backwards compatibility with the frontend filter dropdowns).

2. cleaned_street_trees.csv — input CSV annotated with two new columns:
     Analysis Neighborhoods  (float index, matches old dataset format)
     neighborhood_name       (human-readable name)

   The new SF dataset dropped the Analysis Neighborhoods column, so we
   derive it via a point-in-polygon spatial join against the neighborhood
   boundary polygons.

Usage:
    python 03_extract_neighborhoods.py
    python 03_extract_neighborhoods.py \\
        --neighborhoods Analysis_Neighborhoods_20260315.csv \\
        --trees cleaned_street_trees.csv
"""

import argparse
import csv
import json
import sys

import geopandas as gpd
import pandas as pd
from shapely import wkt


def build_neighborhood_mapping(neighborhoods_file: str) -> tuple:
    """
    Returns (neighborhood_mapping dict, GeoDataFrame with polygon geometry).
    neighborhood_mapping: {float_index_str -> name}
    """
    maxInt = sys.maxsize
    while True:
        try:
            csv.field_size_limit(maxInt)
            break
        except OverflowError:
            maxInt = int(maxInt // 10)

    df = pd.read_csv(neighborhoods_file)
    neighborhoods = sorted(df['nhood'].tolist())

    neighborhood_mapping = {
        str(float(i + 1)): name
        for i, name in enumerate(neighborhoods)
    }
    name_to_index = {name: float(i + 1) for i, name in enumerate(neighborhoods)}

    df['geometry'] = df['the_geom'].apply(wkt.loads)
    gdf = gpd.GeoDataFrame(df[['nhood', 'geometry']], crs="EPSG:4326")

    return neighborhood_mapping, gdf, name_to_index


def assign_neighborhoods(trees_file: str, neighborhoods_file: str) -> None:
    neighborhood_mapping, nhood_gdf, name_to_index = build_neighborhood_mapping(neighborhoods_file)

    # Save neighborhood_mapping.json for frontend filter dropdowns
    with open('neighborhood_mapping.json', 'w') as f:
        json.dump(neighborhood_mapping, f, indent=2, sort_keys=True)
    print(f"Saved {len(neighborhood_mapping)} neighborhoods to neighborhood_mapping.json")

    print(f"Reading {trees_file}...")
    trees_df = pd.read_csv(trees_file)

    # Spatial join: assign each tree to the neighborhood polygon it falls in
    print("Running spatial join (this may take a moment)...")
    valid = trees_df[['Latitude', 'Longitude']].notna().all(axis=1)
    trees_gdf = gpd.GeoDataFrame(
        trees_df[valid].copy(),
        geometry=gpd.points_from_xy(trees_df[valid]['Longitude'], trees_df[valid]['Latitude']),
        crs="EPSG:4326"
    )

    joined = gpd.sjoin(trees_gdf, nhood_gdf[['nhood', 'geometry']], how='left', predicate='within')
    trees_df.loc[valid, 'neighborhood_name'] = joined['nhood'].values
    trees_df['neighborhood_name'] = trees_df['neighborhood_name'].fillna('Unknown')
    trees_df['Analysis Neighborhoods'] = trees_df['neighborhood_name'].map(
        lambda n: name_to_index.get(n, None)
    )

    trees_df.to_csv(trees_file, index=False)
    assigned = trees_df['neighborhood_name'].ne('Unknown').sum()
    print(f"Assigned neighborhoods to {assigned}/{len(trees_df)} trees, saved to {trees_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build neighborhood mapping and spatially join to tree data.")
    parser.add_argument("--neighborhoods", default="Analysis_Neighborhoods_20260315.csv",
                        help="Neighborhoods CSV with WKT geometry (default: Analysis_Neighborhoods_20260315.csv)")
    parser.add_argument("--trees", default="cleaned_street_trees.csv",
                        help="Tree CSV to annotate in-place (default: cleaned_street_trees.csv)")
    args = parser.parse_args()
    assign_neighborhoods(args.trees, args.neighborhoods)
