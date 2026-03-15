"""
Step 4: Clean Removal Notifications
-------------------------------------
Reads the SF tree removal notifications CSV and extracts clean numeric Tree IDs,
handling both plain integers and "TRE-XXXXXX" prefixed formats.

Output (cleaned_removal_notifications.csv) is consumed by 05_convert_to_geojson.py
to filter out trees that have been removed.

Usage:
    python 04_clean_removals.py
    python 04_clean_removals.py --input Street_Tree_Removal_Notifications_20250814.csv
"""

import argparse

import pandas as pd


def extract_numeric_tree_id(tree_id):
    if pd.isna(tree_id):
        return None
    s = str(tree_id).strip()
    if s.startswith('TRE-'):
        s = s[4:]
    try:
        return int(float(s))
    except ValueError:
        print(f"Warning: could not parse TreeID '{tree_id}'")
        return None


def clean_removals(input_file: str) -> None:
    print(f"Reading {input_file}...")
    df = pd.read_csv(input_file)
    print(f"Initial records: {len(df)}")

    df['CleanedTreeID'] = df['TreeID'].apply(extract_numeric_tree_id)
    df = df.dropna(subset=['CleanedTreeID'])
    df['CleanedTreeID'] = df['CleanedTreeID'].astype(int)

    output_file = 'cleaned_removal_notifications.csv'
    df.to_csv(output_file, index=False)
    print(f"Saved {len(df)} cleaned removal records to {output_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean SF tree removal notifications CSV.")
    parser.add_argument("--input", default="Street_Tree_Removal_Notifications_20260315.csv",
                        help="Input CSV (default: Street_Tree_Removal_Notifications_20260315.csv)")
    args = parser.parse_args()
    clean_removals(args.input)
