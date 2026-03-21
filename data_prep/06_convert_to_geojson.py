"""
Step 6: Convert to GeoJSON
----------------------------
Reads cleaned_street_trees.csv and produces trees.geojson — a compact
FeatureCollection with one point per tree, ready for Tippecanoe.

Also filters out trees listed in cleaned_removal_notifications.csv (if present).

Each feature carries: id, species, address, dbh, plantDate, siteInfo,
legalStatus, caretaker, neighborhood, neighborhood_name, color, latitude, longitude.

Usage:
    python 06_convert_to_geojson.py
"""

import argparse
import colorsys
import json

import pandas as pd


def hsl_to_hex(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return '#{:02x}{:02x}{:02x}'.format(int(r * 255), int(g * 255), int(b * 255))


def build_genus_color_map() -> dict:
    with open('genus_list.json', 'r') as f:
        genus_list = json.load(f)
    total = len(genus_list)
    return {
        genus: hsl_to_hex(int((360 * i) / total), 40, 60)
        for i, genus in enumerate(sorted(genus_list))
    }


def clean_numeric(value):
    if pd.isna(value) or value == '' or value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def convert_to_geojson(trees_file: str) -> None:
    # Load removal list
    try:
        removal_df = pd.read_csv('cleaned_removal_notifications.csv')
        removal_df = removal_df.dropna(subset=['CleanedTreeID'])
        removal_df['CleanedTreeID'] = removal_df['CleanedTreeID'].astype(int)
        tree_ids_to_remove = set(removal_df['CleanedTreeID'])
        permit_date_map = dict(zip(removal_df['CleanedTreeID'], removal_df.get('PostedDate', pd.Series(dtype=str))))
        print(f"Loaded {len(tree_ids_to_remove)} trees marked for removal")
    except FileNotFoundError:
        print("No removal notifications file found, skipping removal filter")
        tree_ids_to_remove = set()
        permit_date_map = {}

    print(f"Reading {trees_file}...")
    df = pd.read_csv(trees_file)

    df['markedForRemoval'] = df['Tree ID'].isin(tree_ids_to_remove)
    df['permitDate'] = df['Tree ID'].map(permit_date_map)
    print(f"Tagged {df['markedForRemoval'].sum()} trees as marked for removal")

    genus_color_map = build_genus_color_map()

    print("Converting to GeoJSON...")
    features = []
    skipped = 0
    for _, row in df.iterrows():
        if row['Species'] == 'Potential Site (Potential Site)':
            skipped += 1
            continue
        if pd.isna(row['Latitude']) or pd.isna(row['Longitude']):
            skipped += 1
            continue

        lat = clean_numeric(row['Latitude'])
        lng = clean_numeric(row['Longitude'])
        if lat is None or lng is None:
            skipped += 1
            continue

        species = str(row['Species']) if pd.notna(row['Species']) else ''
        scientific_name = species.split('(')[1].rstrip(')') if '(' in species else ''
        genus = scientific_name.split(' ')[0] if ' ' in scientific_name else ''
        color = genus_color_map.get(genus, '#000000')

        nhood = str(row['neighborhood_name']) if pd.notna(row.get('neighborhood_name')) else 'Unknown'

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [round(lng, 6), round(lat, 6)]
            },
            "properties": {
                "id": int(row['Tree ID']) if pd.notna(row['Tree ID']) else None,
                "species": species,
                "address": str(row['Address']) if pd.notna(row['Address']) else '',
                "dbh": clean_numeric(row['DBH']),
                "plantDate": str(row['Plant Date']) if pd.notna(row['Plant Date']) else None,
                "siteInfo": str(row['Site Info']) if pd.notna(row['Site Info']) else None,
                "legalStatus": str(row['Legal Status']) if pd.notna(row['Legal Status']) else None,
                "caretaker": str(row['qCaretaker']) if pd.notna(row.get('qCaretaker')) else None,
                "color": color,
                "latitude": round(lat, 6),
                "longitude": round(lng, 6),
                "neighborhood_name": nhood,
                "markedForRemoval": bool(row['markedForRemoval']),
                "permitDate": str(row['permitDate']) if pd.notna(row.get('permitDate')) else None,
            }
        })

    geojson = {"type": "FeatureCollection", "features": features}
    with open('trees.geojson', 'w') as f:
        json.dump(geojson, f, separators=(',', ':'))

    print(f"Saved {len(features)} trees to trees.geojson ({skipped} skipped)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert cleaned tree CSV to GeoJSON.")
    parser.add_argument("--input", default="cleaned_street_trees.csv",
                        help="Input CSV (default: cleaned_street_trees.csv)")
    args = parser.parse_args()
    convert_to_geojson(args.input)
