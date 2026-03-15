"""
Download SF Open Data CSVs via the Socrata API.

Outputs three files in data_prep/:
  Street_Tree_List_YYYYMMDD.csv
  Street_Tree_Removal_Notifications_YYYYMMDD.csv
  Analysis_Neighborhoods_YYYYMMDD.csv

Also writes DATA_DATE.txt so the workflow knows today's date string.

Usage:
    python download_data.py
"""

import datetime
import sys

import requests

DATE = datetime.date.today().strftime("%Y%m%d")

DATASETS = [
    (
        "https://data.sfgov.org/resource/tkzw-k3nq.csv",
        f"Street_Tree_List_{DATE}.csv",
        300_000,
    ),
    (
        "https://data.sfgov.org/resource/qrwx-q4gg.csv",
        f"Street_Tree_Removal_Notifications_{DATE}.csv",
        100_000,
    ),
    (
        "https://data.sfgov.org/resource/p5b7-5n3h.csv",
        f"Analysis_Neighborhoods_{DATE}.csv",
        1_000,
    ),
]


def download(url: str, filename: str, limit: int) -> None:
    print(f"Downloading {filename} ...")
    r = requests.get(url, params={"$limit": limit}, timeout=120)
    r.raise_for_status()
    with open(filename, "w", encoding="utf-8") as f:
        f.write(r.text)
    lines = r.text.count("\n")
    print(f"  Saved {lines - 1:,} rows to {filename}")


if __name__ == "__main__":
    for url, filename, limit in DATASETS:
        try:
            download(url, filename, limit)
        except requests.HTTPError as e:
            print(f"ERROR downloading {filename}: {e}", file=sys.stderr)
            sys.exit(1)

    with open("DATA_DATE.txt", "w") as f:
        f.write(DATE)
    print(f"\nAll datasets downloaded. DATE={DATE}")
