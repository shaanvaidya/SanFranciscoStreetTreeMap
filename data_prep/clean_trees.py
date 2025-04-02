import pandas as pd
import numpy as np
from datetime import datetime

def clean_trees_data():
    # Read the CSV file
    print("Reading CSV file...")
    df = pd.read_csv('Street_Tree_List_20250323.csv')
    
    # Print initial information
    print("\nInitial data shape:", df.shape)
    print("\nInitial columns and data types:")
    print(df.dtypes)
    
    # Basic cleaning steps
    print("\nCleaning data...")
    
    # Convert date columns to datetime
    date_columns = ['PlantDate']
    for col in date_columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    
    # Clean up species names (remove extra spaces and standardize case)
    if 'qSpecies' in df.columns:
        df['qSpecies'] = df['qSpecies'].astype(str).str.strip().str.title()
    
    # Clean up address fields - only if they are string type
    address_columns = ['qAddress', 'SiteOrder', 'qSiteInfo']
    for col in address_columns:
        if col in df.columns:
            if df[col].dtype == 'object':
                df[col] = df[col].astype(str).str.strip()
    
    # Clean up numeric columns
    numeric_columns = ['DBH', 'Latitude', 'Longitude', 'XCoord', 'YCoord']
    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Remove any completely empty rows
    df = df.dropna(how='all')
    
    # Save the cleaned data
    print("\nSaving cleaned data...")
    df.to_csv('cleaned_trees.csv', index=False)
    
    # Print some basic statistics
    print("\nData Cleaning Summary:")
    print(f"Total number of trees: {len(df)}")
    print(f"Number of unique species: {df['qSpecies'].nunique()}")
    print(f"Date range: {df['PlantDate'].min()} to {df['PlantDate'].max()}")
    
    # Print column names and data types
    print("\nFinal columns and their data types:")
    print(df.dtypes)
    
    # Print sample of cleaned data
    print("\nSample of cleaned data:")
    print(df.head())

if __name__ == "__main__":
    clean_trees_data() 