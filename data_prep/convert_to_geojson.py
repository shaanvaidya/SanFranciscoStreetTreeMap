import pandas as pd
import json
import numpy as np
from datetime import datetime
import colorsys

def clean_numeric(value):
    if pd.isna(value) or value == '' or value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None
    
def hsl_to_hex(h, s, l):
    """
    Convert HSL (degrees, %, %) to HEX color.
    """
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return '#{:02x}{:02x}{:02x}'.format(int(r * 255), int(g * 255), int(b * 255))

def genus_to_color_map():
    """
    Generate a {genus: hex_color} mapping.
    """
    with open('genus_list.json', 'r') as f:
        genus_list = json.load(f)
    total = len(genus_list)
    sorted_genuses = sorted(genus_list)
    genus_colors = {}

    for i, genus in enumerate(sorted_genuses):
        hue = int((360 * i) / total)
        saturation = 40
        lightness = 60
        hex_color = hsl_to_hex(hue, saturation, lightness)
        genus_colors[genus] = hex_color

    return genus_colors

def convert_to_geojson():
    # Read the cleaned CSV file
    print("Reading cleaned CSV file...")
    df = pd.read_csv('cleaned_street_trees.csv')
    genus_color_map = genus_to_color_map()

    # Load neighborhood mapping
    with open('neighborhood_mapping.json', 'r') as f:
        neighborhood_mapping = json.load(f)
    
    # Convert to GeoJSON
    print("Converting to GeoJSON...")
    features = []
    for _, row in df.iterrows():
        # Skip rows with invalid coordinates
        if row['Species'] == 'Potential Site (Potential Site)':
            continue
        if pd.isna(row['Latitude']) or pd.isna(row['Longitude']):
            continue
        
        # Get neighborhood color
        neighborhood_code = row['Analysis Neighborhoods']
        common_name = row['Species'].split('(')[0].strip()
        scientific_name = row['Species'].split('(')[1].strip(')') if '(' in row['Species'] else ''
        genus = scientific_name.split(' ')[0] if ' ' in scientific_name else ''
        color = genus_color_map.get(genus, '#000000')
        
        # Clean and round numeric values
        lat = round(clean_numeric(row['Latitude']), 6)  # Round to 6 decimal places
        lng = round(clean_numeric(row['Longitude']), 6)  # Round to 6 decimal places
        dbh = clean_numeric(row['DBH'])
        nhood = neighborhood_mapping.get(str(float(neighborhood_code)), 'Unknown')
        
        # Skip if coordinates are invalid
        if lat is None or lng is None:
            continue

        species = row['Species']
        # camel case species
        if '(' in species:
            common, scientific = species.split('(', 1)
            common = ' '.join(word.capitalize() for word in common.strip().split(' '))
            species = f"{common} ({scientific.strip()}"
        else:
            species = ' '.join(word.capitalize() for word in species.split(' '))
        
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
            },
            "properties": {
                "id": int(row['Tree ID']) if pd.notna(row['Tree ID']) else None,
                "species": str(row['Species']) if pd.notna(row['Species']) else '',
                "address": str(row['Address']) if pd.notna(row['Address']) else '',
                "dbh": dbh,
                "plantDate": str(row['Plant Date']) if pd.notna(row['Plant Date']) else None,
                "siteInfo": str(row['Site Info']) if pd.notna(row['Site Info']) else None,
                "legalStatus": str(row['Legal Status']) if pd.notna(row['Legal Status']) else None,
                "neighborhood": str(neighborhood_code) if pd.notna(neighborhood_code) else None,
                "color": color,
                "latitude": lat,
                "longitude": lng,
                "neighborhood_name": str(nhood) if nhood is not None else None
            }
        }
        features.append(feature)
    
    # Create the final GeoJSON object
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    # Save to file with minimal whitespace
    print("Saving GeoJSON file...")
    with open('trees.geojson', 'w') as f:
        json.dump(geojson, f, separators=(',', ':'))  # Use minimal separators
    
    print(f"Converted {len(features)} trees to GeoJSON format")

if __name__ == "__main__":
    convert_to_geojson() 