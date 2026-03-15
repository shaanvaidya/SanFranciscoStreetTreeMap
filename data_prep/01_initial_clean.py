"""
Step 1: Initial Data Cleaning
------------------------------
Reads the raw SF DPW street tree CSV, performs basic sanitization
(type coercion, whitespace cleanup, dropping empty rows), and writes
the result to cleaned_trees.csv.

Usage:
    python 01_initial_clean.py Street_Tree_List_20260315.csv
"""

import argparse
import pandas as pd


def clean_trees_data(input_file: str) -> None:
    print(f"Reading {input_file}...")
    df = pd.read_csv(input_file, low_memory=False)

    print(f"Initial shape: {df.shape}")

    # Convert date columns to datetime
    if 'PlantDate' in df.columns:
        df['PlantDate'] = pd.to_datetime(df['PlantDate'], errors='coerce', format='mixed')

    # Standardize species names
    if 'qSpecies' in df.columns:
        df['qSpecies'] = df['qSpecies'].astype(str).str.strip().str.title()

    # Strip whitespace from address fields
    for col in ['qAddress', 'SiteOrder', 'qSiteInfo']:
        if col in df.columns and df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.strip()

    # Coerce numeric columns
    for col in ['DBH', 'Latitude', 'Longitude', 'XCoord', 'YCoord']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Drop completely empty rows
    df = df.dropna(how='all')

    output_file = 'cleaned_trees.csv'
    df.to_csv(output_file, index=False)
    print(f"Saved {len(df)} rows to {output_file}")
    print(f"Unique species: {df['qSpecies'].nunique()}")
    print(f"Date range: {df['PlantDate'].min()} to {df['PlantDate'].max()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Initial cleaning of SF street tree CSV.")
    parser.add_argument("input_file", help="Path to the raw CSV (e.g. Street_Tree_List_20260315.csv)")
    args = parser.parse_args()
    clean_trees_data(args.input_file)
