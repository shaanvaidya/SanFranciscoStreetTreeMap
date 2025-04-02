import pandas as pd
import json
import numpy as np
from datetime import datetime
import matplotlib.pyplot as plt
import colorsys

def clean_numeric(value):
    if pd.isna(value) or value == '' or value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def get_different_species():
    # Read the cleaned CSV file
    print("Reading cleaned CSV file...")
    df = pd.read_csv('cleaned_street_trees.csv')

    genus_to_species = {}
    
    for _, row in df.iterrows():
        # Skip rows with invalid coordinates
        if pd.isna(row['Latitude']) or pd.isna(row['Longitude']):
            continue
        
        # Clean and round numeric values
        lat = round(clean_numeric(row['Latitude']), 6)  # Round to 6 decimal places
        lng = round(clean_numeric(row['Longitude']), 6)  # Round to 6 decimal places
        dbh = clean_numeric(row['DBH'])
        
        # Skip if coordinates are invalid
        if lat is None or lng is None:
            continue
        
        species = str(row['Species']) if pd.notna(row['Species']) else ''
        common_name  = species.split('(')[0].strip()
        scientific_name = species.split('(')[1].strip(')') if '(' in species else ''
        genus = scientific_name.split(' ')[0] if ' ' in scientific_name else ''
        if genus not in genus_to_species:
            genus_to_species[genus] = set()
        genus_to_species[genus].add(species)
    
    number_of_species = 0
    for genus in genus_to_species:
        number_of_species += len(genus_to_species[genus])
        genus_to_species[genus] = list(genus_to_species[genus])

    print(f"Number of species: {number_of_species}")
    print("Saving genus_to_species.json file...")
    with open('genus_to_species.json', 'w') as f:
        # pretty print
        json.dump(genus_to_species, f, indent=4)

    with open('genus_list.json', 'w') as f:
        json.dump(list(genus_to_species.keys()), f, indent=4)
        
    
    print(f"Converted {len(genus_to_species)} species to genus_to_species format")

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

def visualize_genus_colors(genus_color_map, columns=5):
    print(genus_color_map)
    genuses = list(genus_color_map.keys())
    colors = [genus_color_map[genus] for genus in genuses]
    rows = (len(genuses) + columns - 1) // columns

    plt.figure(figsize=(columns * 2.5, rows * 1.2))
    for i, (genus, color) in enumerate(genus_color_map.items()):
        row = i // columns
        col = i % columns
        plt.gca().add_patch(
            plt.Rectangle((col, -row), 1, 1, color=color)
        )
        plt.text(col + 0.5, -row + 0.5, genus, ha='center', va='center', fontsize=8, color='black')

    plt.xlim(0, columns)
    plt.ylim(-rows, 0)
    plt.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    get_different_species() 
    genus_color_map = genus_to_color_map()
    visualize_genus_colors(genus_color_map)