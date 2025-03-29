import pandas as pd
import json
import numpy as np
from datetime import datetime

def clean_numeric(value):
    if pd.isna(value) or value == '' or value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def get_color_for_neighborhood(neighborhood_code):
    # Color palette for neighborhoods using various shades of green
    colors = [
        '#1b5e20',  # Dark green
        '#2e7d32',  # Forest green
        '#388e3c',  # Medium green
        '#43a047',  # Light forest green
        '#4caf50',  # Emerald green
        '#66bb6a',  # Medium light green
        '#76d275',  # Light green
        '#81c784',  # Pale green
        '#a5d6a7',  # Very light green
        '#c8e6c9',  # Lightest green
        '#1b5e20',  # Dark green
        '#2e7d32',  # Forest green
        '#388e3c',  # Medium green
        '#43a047',  # Light forest green
        '#4caf50',  # Emerald green
        '#66bb6a',  # Medium light green
        '#76d275',  # Light green
        '#81c784',  # Pale green
        '#a5d6a7',  # Very light green
        '#c8e6c9',  # Lightest green
        '#1b5e20',  # Dark green
        '#2e7d32',  # Forest green
        '#388e3c',  # Medium green
        '#43a047',  # Light forest green
        '#4caf50',  # Emerald green
        '#66bb6a',  # Medium light green
        '#76d275',  # Light green
        '#81c784',  # Pale green
        '#a5d6a7',  # Very light green
        '#c8e6c9',  # Lightest green
        '#1b5e20',  # Dark green
        '#2e7d32',  # Forest green
        '#388e3c',  # Medium green
        '#43a047',  # Light forest green
        '#4caf50',  # Emerald green
        '#66bb6a',  # Medium light green
        '#76d275',  # Light green
        '#81c784',  # Pale green
        '#a5d6a7',  # Very light green
        '#c8e6c9',  # Lightest green
        '#1b5e20',  # Dark green
        '#2e7d32',  # Forest green
        '#388e3c',  # Medium green
        '#43a047',  # Light forest green
        '#4caf50'   # Emerald green
    ]
    
    if pd.isna(neighborhood_code):
        return '#4caf50'  # Default emerald green color
    
    try:
        index = int(neighborhood_code) - 1
        if 0 <= index < len(colors):
            return colors[index]
        return '#4caf50'  # Default emerald green if index out of range
    except (ValueError, TypeError):
        return '#4caf50'  # Default emerald green for invalid values

def convert_to_geojson():
    # Read the cleaned CSV file
    print("Reading cleaned CSV file...")
    df = pd.read_csv('cleaned_street_trees.csv')

    # Load neighborhood mapping
    with open('neighborhood_mapping.json', 'r') as f:
        neighborhood_mapping = json.load(f)
    
    # Convert to GeoJSON
    print("Converting to GeoJSON...")
    features = []
    for _, row in df.iterrows():
        # Skip rows with invalid coordinates
        if pd.isna(row['Latitude']) or pd.isna(row['Longitude']):
            continue
        
        # Get neighborhood color
        neighborhood_code = row['Analysis Neighborhoods']
        color = get_color_for_neighborhood(neighborhood_code)
        
        # Clean numeric values
        latitude = clean_numeric(row['Latitude'])
        longitude = clean_numeric(row['Longitude'])
        dbh = clean_numeric(row['DBH'])
        neighborhood_name = neighborhood_mapping.get(str(float(neighborhood_code)), 'Unknown')
        
        # Skip if coordinates are invalid
        if latitude is None or longitude is None:
            continue
        
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [longitude, latitude]
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
                "latitude": latitude,
                "longitude": longitude,
                "neighborhood_name": str(neighborhood_name) if neighborhood_name is not None else None
            }
        }
        features.append(feature)
    
    # Create the final GeoJSON object
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    # Save to file
    print("Saving GeoJSON file...")
    with open('public/trees.geojson', 'w') as f:
        json.dump(geojson, f)
    
    print(f"Converted {len(features)} trees to GeoJSON format")

if __name__ == "__main__":
    convert_to_geojson() 