"""
Step 5: Species & Genus Analysis
----------------------------------
Reads cleaned_street_trees.csv and produces:
  - genus_to_species.json  — mapping of genus → [species strings]
  - genus_list.json        — flat list of all genera (used for color assignment)

Usage:
    python 05_get_species.py
    python 05_get_species.py --input cleaned_street_trees.csv
"""

import argparse
import json

import pandas as pd


def get_species(input_file: str) -> None:
    print(f"Reading {input_file}...")
    df = pd.read_csv(input_file)

    genus_to_species: dict = {}

    for species in df['Species'].dropna().unique():
        if pd.isna(species):
            continue
        scientific = species.split('(')[1].rstrip(')') if '(' in species else ''
        genus = scientific.split(' ')[0] if ' ' in scientific else ''
        if genus not in genus_to_species:
            genus_to_species[genus] = set()
        genus_to_species[genus].add(species)

    # Convert sets to sorted lists for stable JSON output
    genus_to_species = {g: sorted(s) for g, s in genus_to_species.items()}

    with open('genus_to_species.json', 'w') as f:
        json.dump(genus_to_species, f, indent=4)

    with open('genus_list.json', 'w') as f:
        json.dump(list(genus_to_species.keys()), f, indent=4)

    total_species = sum(len(v) for v in genus_to_species.values())
    print(f"Saved {len(genus_to_species)} genera, {total_species} species to genus_to_species.json + genus_list.json")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build genus/species mappings from cleaned tree data.")
    parser.add_argument("--input", default="cleaned_street_trees.csv",
                        help="Input CSV (default: cleaned_street_trees.csv)")
    args = parser.parse_args()
    get_species(args.input)
