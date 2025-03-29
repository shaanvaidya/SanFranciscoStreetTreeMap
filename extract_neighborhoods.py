import csv
import sys
import json

def extract_neighborhoods():
    # Increase the field size limit
    maxInt = sys.maxsize
    while True:
        try:
            csv.field_size_limit(maxInt)
            break
        except OverflowError:
            maxInt = int(maxInt/10)
    
    # Read the CSV file
    with open('Analysis_Neighborhoods_20250329.csv', 'r') as file:
        reader = csv.DictReader(file)
        neighborhoods = [row['nhood'] for row in reader]
    
    # Create index to neighborhood mapping (1-based index with decimals)
    # e.g. 1.0: "Bayview Hunters Point" instead of 1: "Bayview Hunters Point"
    # This allows for more precise filtering in the frontend
    neighborhood_mapping = {
        float(index + 1): neighborhood
        for index, neighborhood in enumerate(sorted(neighborhoods))
    }

    # dump to json
    with open('neighborhood_mapping.json', 'w') as file:
        json.dump(neighborhood_mapping, file, indent=2, sort_keys=True)
    
    # Write neighborhoods to a text file
    print("Created neighborhood to index mapping in neighborhood_mapping.json")

if __name__ == "__main__":
    extract_neighborhoods() 