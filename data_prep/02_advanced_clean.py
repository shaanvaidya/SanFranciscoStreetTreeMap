"""
Step 2: Advanced Data Cleanup
------------------------------
Reads cleaned_trees.csv (output of 01_initial_clean.py) and applies:
- Column renaming for readability
- Dropping unused fields
- DBH normalization: fill missing → 10, minimum 1, cap at DBH_MAX_INCHES
  (large values are data entry errors that cause oversized map dots)
- Species name corrections and format standardization
  ("scientific :: common" → "common (scientific)")
- Species deduplication: where the same scientific name has multiple common
  names, the most frequent common name wins
- Removal of "Potential Site" entries (not real trees)

Usage:
    python 02_advanced_clean.py
    python 02_advanced_clean.py --input cleaned_trees.csv
"""

import argparse
from collections import defaultdict

import pandas as pd

# DBH values above this are treated as data-entry errors and capped.
# 60 inches (~5 ft diameter) is already an exceptionally large street tree;
# anything higher causes oversized dots on the map.
DBH_MAX_INCHES = 60

SPECIES_CORRECTIONS = {
    # Keys must match title-cased species strings (step 1 title-cases qSpecies before step 2 runs)
    'Patanus Racemosa ::': 'Platanus racemosa :: California Sycamore',
    ':: Brisbane Box': 'Lophostemon confertus :: Brisbane Box',
    'Chitalpa Tashkentensis ::': 'x Chitalpa tashkentensis :: x Chitalpa',
    'Olea Majestic Beauty ::': 'Olea Majestic Beauty :: Majestic Beauty Olive Tree',
    'Privet ::': 'Ligustrum lucidum :: Glossy Privet',
    'Ficus Spp. ::': 'Ficus Spp. :: Ficus Spp.',
    'Ficus Laurel ::': "Ficus microcarpa nitida 'Green Gem' :: Indian Laurel Fig Tree 'Green Gem'",
    'Corymbia Calophylla ::': 'Corymbia calophylla :: Marri',
    'Solanum Rantonnetti ::': 'Lycianthes rantonnetii :: Blue Potato Bush',
    'Tristania Conferta ::': 'Lophostemon confertus :: Brisbane Box',
    "Metrosideros Excelsa 'Aurea' ::": "Metrosideros excelsa 'Aurea' :: New Zealand Xmas Tree 'Aurea'",
    'Chamaecyparis Species ::': 'Chamaecyparis species :: False Cypress species',
    'Tree(S) ::': 'Unknown :: Unknown',
    'Tree :: Tree': 'Unknown :: Unknown',
    '::': 'Unknown :: Unknown',
    ':: To Be Determine': 'Unknown :: Unknown',
    ':: Tree': 'Unknown :: Unknown',
    'Brachychiton Discolor ::': 'Brachychiton discolor :: Lacebark Tree',
    'Metrosideros Spp ::': 'Metrosideros excelsa :: New Zealand Xmas Tree',
}


def convert_species_format(species: str) -> str:
    """Convert 'scientific :: common' to 'common (scientific)'."""
    parts = species.split(' :: ')
    if len(parts) == 2:
        return f"{parts[1]} ({parts[0]})"
    return species


def build_species_canonical_map(df: pd.DataFrame) -> dict:
    """
    For each scientific name that appears with multiple common names,
    pick the most frequent common name as canonical.
    Returns a mapping of non-canonical species strings → canonical species string.
    """
    sci_to_counts: dict = defaultdict(lambda: defaultdict(int))
    for species in df['Species'].dropna():
        if '(' in species:
            common = species.split('(')[0].strip()
            scientific = species.split('(')[1].rstrip(')')
            sci_to_counts[scientific][common] += 1

    remapping = {}
    for scientific, counts in sci_to_counts.items():
        if len(counts) <= 1:
            continue
        # Skip genus-level placeholders (e.g. "Prunus Spp") — the common name
        # is the meaningful identifier there; these aren't naming inconsistencies.
        words = scientific.strip().split()
        if len(words) < 2 or words[-1].lower() == 'spp':
            continue
        canonical_common = max(counts, key=lambda c: counts[c])
        canonical = f"{canonical_common} ({scientific})"
        for common in counts:
            if common != canonical_common:
                remapping[f"{common} ({scientific})"] = canonical

    if remapping:
        print(f"Species deduplication — {len(remapping)} non-canonical name(s) remapped:")
        for old, new in sorted(remapping.items()):
            print(f"  '{old}' → '{new}'")

    return remapping


def advanced_clean(input_file: str) -> None:
    print(f"Reading {input_file}...")
    df = pd.read_csv(input_file, low_memory=False)
    print(f"Input shape: {df.shape}")

    df.rename(columns={
        'TreeID': 'Tree ID',
        'qLegalStatus': 'Legal Status',
        'qSpecies': 'Species',
        'qAddress': 'Address',
        'qSiteInfo': 'Site Info',
        'PlantDate': 'Plant Date',
    }, inplace=True)

    drop_fields = ['SiteOrder', 'PlantType', 'qCaretaker', 'qCareAssistant', 'PlotSize', 'PermitNotes', 'XCoord', 'YCoord']
    df.drop(columns=[c for c in drop_fields if c in df.columns], inplace=True)

    # Normalize DBH: fill missing → 10, enforce min 1, cap at DBH_MAX_INCHES
    df['DBH'] = df['DBH'].replace('', pd.NA).astype(float).fillna(10)
    df['DBH'] = df['DBH'].clip(lower=1, upper=DBH_MAX_INCHES)
    capped = (df['DBH'] == DBH_MAX_INCHES).sum()
    if capped:
        print(f"DBH: capped {capped} value(s) at {DBH_MAX_INCHES} inches")

    # Apply known species corrections (pre-format-conversion)
    df['Species'] = df['Species'].replace(SPECIES_CORRECTIONS)

    # Drop potential sites (not real trees)
    df = df[df['Species'] != 'Potential Site :: Potential Site']

    # Reformat species names: "scientific :: common" → "common (scientific)"
    df['Species'] = df['Species'].apply(convert_species_format)

    # Deduplicate species: same scientific name, pick most frequent common name
    remapping = build_species_canonical_map(df)
    if remapping:
        df['Species'] = df['Species'].replace(remapping)

    output_file = 'cleaned_street_trees.csv'
    df.to_csv(output_file, index=False)
    print(f"Saved {len(df)} rows to {output_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Advanced cleanup of SF street tree data.")
    parser.add_argument("--input", default="cleaned_trees.csv", help="Input CSV (default: cleaned_trees.csv)")
    args = parser.parse_args()
    advanced_clean(args.input)
