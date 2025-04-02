import pandas as pd
import re

# Load the CSV file (replace 'street_trees.csv' with your actual CSV file path)
df = pd.read_csv('sf_street_trees.csv')

# Rename fields for better readability
rename_mapping = {
    'TreeID': 'Tree ID',
    'qLegalStatus': 'Legal Status',
    'qSpecies': 'Species',
    'qAddress': 'Address',
    'qSiteInfo': 'Site Info',
    'PlantDate': 'Plant Date',
    'Latitude': 'Latitude',
    'Longitude': 'Longitude',
    'Location': 'Location',
    # Keeping 'DBH' as is
}

corrected_values_for_posterity = {
    56697: 30,
    141190: 15,
    133419: 15,
    120977: 15
}

# Apply the renaming
df.rename(columns=rename_mapping, inplace=True)

# Drop the specified fields
drop_fields = ['SiteOrder', 'PlantType', 'qCaretaker', 'qCareAssistant', 'PlotSize', 'PermitNotes', 'XCoord', 'YCoord']
df.drop(columns=drop_fields, inplace=True)

df['DBH'] = df['DBH'].replace('', pd.NA).astype(float).fillna(10)
df['DBH'] = df['DBH'].apply(lambda x: max(x, 1))  # Set a minimum value of 1 inch

# Correct invalid species names
df['Species'] = df['Species'].replace('patanus racemosa ::', "Platanus racemosa :: California Sycamore")
df['Species'] = df['Species'].replace(':: Brisbane Box', "Lophostemon confertus :: Brisbane Box")
df['Species'] = df['Species'].replace('Chitalpa tashkentensis ::', "x Chitalpa tashkentensis :: x Chitalpa")
df['Species'] = df['Species'].replace('Olea Majestic Beauty ::', "Olea Majestic Beauty :: Majestic Beauty Olive Tree")
df['Species'] = df['Species'].replace('Privet ::', "Ligustrum lucidum :: Glossy Privet")
df['Species'] = df['Species'].replace('Ficus Spp. ::', "Ficus Spp. :: Ficus Spp.")
df['Species'] = df['Species'].replace('Ficus laurel ::', "Ficus microcarpa nitida 'Green Gem' :: Indian Laurel Fig Tree 'Green Gem'")
df['Species'] = df['Species'].replace('Corymbia calophylla ::', "Corymbia calophylla :: Marri")
df['Species'] = df['Species'].replace('Solanum rantonnetti ::', "Lycianthes rantonnetii :: Blue Potato Bush")
df['Species'] = df['Species'].replace('Tristania conferta ::', "Lophostemon confertus :: Brisbane Box")
df['Species'] = df['Species'].replace("Metrosideros excelsa 'Aurea' ::", "Metrosideros excelsa 'Aurea' :: New Zealand Xmas Tree 'Aurea'")
df['Species'] = df['Species'].replace("Chamaecyparis species ::", "Chamaecyparis species :: False Cypress species")
df['Species'] = df['Species'].replace("Tree(s) ::", "Unknown :: Unknown")
df['Species'] = df['Species'].replace("::", "Unknown :: Unknown")
df['Species'] = df['Species'].replace(":: To Be Determine", "Unknown :: Unknown")
df['Species'] = df['Species'].replace(":: Tree", "Unknown :: Unknown")
df['Species'] = df['Species'].replace("Brachychiton discolor ::", "Brachychiton discolor :: Lacebark Tree")
df['Species'] = df['Species'].replace("Metrosideros spp ::", "Metrosideros excelsa :: New Zealand Xmas Tree")
# Convert species format from "scientific name :: common name" to "common name (scientific name)"
# drop if species is Potenial Site
df = df[df['Species'] != 'Potential Site :: Potential Site']

def convert_species_format(species):
    parts = species.split(' :: ')
    if len(parts) == 2:
        return f"{parts[1]} ({parts[0]})"
    return species

df['Species'] = df['Species'].apply(convert_species_format)

# Save the cleaned data to a new CSV file
df.to_csv('cleaned_street_trees.csv', index=False)

print("Data cleaning complete. The cleaned data is saved as 'cleaned_street_trees.csv'.")

# Check for DBH values that are too large and print the Tree ID for those cases
# Assuming a DBH value larger than 300 inches is considered unusually large
# dbh_threshold = 300
# large_dbh_cases = df[df['DBH'].astype(float) > dbh_threshold]
# print("Tree IDs with DBH greater than 60 inches and their DBH values:")
# for _, row in large_dbh_cases.iterrows():
#     print(f"Tree ID: {row['Tree ID']}, DBH: {row['DBH']}")

# # Check for Species values not in the format "scientific name :: common name"
# def is_valid_species_format(species):
#     return bool(re.match(r'^.+\s::\s.+$', species))

# invalid_species_cases = df[~df['Species'].apply(is_valid_species_format)]
# with open('tree_data_output.txt', 'a') as f:
#     f.write("\nTree IDs and Species with invalid Species format:\n")
#     for _, row in invalid_species_cases.iterrows():
#         f.write(f"Tree ID: {row['Tree ID']}, Species: {row['Species']}\n")