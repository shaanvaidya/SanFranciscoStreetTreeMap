"""
Download SF Open Data CSVs via the Socrata API and normalize column names
to match what the processing scripts expect.

Outputs in data_prep/:
  Street_Tree_List_YYYYMMDD.csv
  Street_Tree_Removal_Notifications_YYYYMMDD.csv

Note: Analysis_Neighborhoods.csv is committed as a static file since
the Socrata API does not return geometry for that dataset and SF
neighborhood boundaries rarely change.

Also writes DATA_DATE.txt so the workflow knows today's date string.

Usage:
    python download_data.py
"""

import datetime
import sys
from io import StringIO

import pandas as pd
import requests

DATE = datetime.date.today().strftime("%Y%m%d")

# Socrata API returns lowercase column names; map them to what the
# processing scripts expect.
TREES_COLUMNS = {
    "treeid": "TreeID",
    "qlegalstatus": "qLegalStatus",
    "qspecies": "qSpecies",
    "qaddress": "qAddress",
    "siteorder": "SiteOrder",
    "qsiteinfo": "qSiteInfo",
    "planttype": "PlantType",
    "qcaretaker": "qCaretaker",
    "qcareassistant": "qCareAssistant",
    "plantdate": "PlantDate",
    "dbh": "DBH",
    "plotsize": "PlotSize",
    "permitnotes": "PermitNotes",
    "xcoord": "XCoord",
    "ycoord": "YCoord",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "location": "Location",
}

# The current Street Tree List renamed these fields. Prefer the original
# fields if both versions are present in an export.
TREES_COLUMN_ALIASES = {
    "legalstatus": "qLegalStatus",
    "species": "qSpecies",
    "description": "qAddress",
    "siteinfo": "qSiteInfo",
    "planteddate": "PlantDate",
    "mapdbh": "DBH",
    "point": "Location",
}

REQUIRED_TREE_COLUMNS = {
    "TreeID", "qLegalStatus", "qSpecies", "qAddress", "qSiteInfo",
    "PlantDate", "DBH", "Latitude", "Longitude",
}

REMOVALS_COLUMNS = {
    "postedtype": "PostedType",
    "posteddate": "PostedDate",
    "treeid": "TreeID",
    "supervisor_district": "Supervisor_District",
    "description": "Description",
    "siteorder": "SiteOrder",
    "legalstatus": "LegalStatus",
    "planter": "Planter",
    "location": "Location",
    "sitetype": "SiteType",
    "planttype": "PlantType",
    "species": "Species",
    "x": "X",
    "y": "Y",
    "lat": "Lat",
    "long": "Long",
    "point": "Point",
    "analysis_neighborhood": "Analysis_Neighborhood",
}

DATASETS = [
    (
        "https://data.sf.gov/resource/tkzw-k3nq.csv",
        f"Street_Tree_List_{DATE}.csv",
        300_000,
        TREES_COLUMNS,
        REQUIRED_TREE_COLUMNS,
        TREES_COLUMN_ALIASES,
    ),
    (
        "https://data.sf.gov/resource/qrwx-q4gg.csv",
        f"Street_Tree_Removal_Notifications_{DATE}.csv",
        100_000,
        REMOVALS_COLUMNS,
        {"TreeID", "PostedDate"},
        {},
    ),
]


def download(url: str, filename: str, limit: int, col_map: dict,
             required_columns: set, aliases: dict) -> None:
    print(f"Downloading {filename} ...")
    r = requests.get(url, params={"$limit": limit}, timeout=120)
    r.raise_for_status()

    df = pd.read_csv(StringIO(r.text), low_memory=False)

    # Rename known columns; drop Socrata computed-region columns (:@...)
    df = df.rename(columns=col_map)
    df = df.rename(columns={source: target for source, target in aliases.items()
                            if target not in df.columns})
    df = df[[c for c in df.columns if not c.startswith(":@")]]

    missing = required_columns.difference(df.columns)
    if missing:
        raise ValueError(f"missing required CSV columns: {', '.join(sorted(missing))}")

    df.to_csv(filename, index=False)
    print(f"  Saved {len(df):,} rows, {len(df.columns)} columns to {filename}")


if __name__ == "__main__":
    for dataset in DATASETS:
        try:
            download(*dataset)
        except (requests.RequestException, ValueError) as e:
            print(f"ERROR downloading {dataset[1]}: {e}", file=sys.stderr)
            sys.exit(1)

    with open("DATA_DATE.txt", "w") as f:
        f.write(DATE)
    print(f"\nAll datasets downloaded. DATE={DATE}")
