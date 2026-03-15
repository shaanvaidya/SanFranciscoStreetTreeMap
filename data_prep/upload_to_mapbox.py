"""
Upload trees.mbtiles to Mapbox, replacing the existing tileset.

Reads MAPBOX_SECRET_TOKEN from the environment.

Steps:
  1. Request temporary S3 credentials from Mapbox
  2. PUT the .mbtiles file to the presigned S3 URL
  3. Create a Mapbox upload job pointing at the S3 object
  4. Poll until the upload is complete (or errors)

Usage:
    MAPBOX_SECRET_TOKEN=sk.xxx python upload_to_mapbox.py
"""

import os
import sys
import time

import boto3
import requests

USERNAME = "shaanvaidya"
TILESET_ID = f"{USERNAME}.6gtq3t4j"
MBTILES_PATH = "trees.mbtiles"

TOKEN = os.environ.get("MAPBOX_SECRET_TOKEN")
if not TOKEN:
    print("ERROR: MAPBOX_SECRET_TOKEN environment variable not set", file=sys.stderr)
    sys.exit(1)

BASE = "https://api.mapbox.com/uploads/v1"


def main() -> None:
    # Step 1: Get S3 credentials
    print("Requesting S3 credentials from Mapbox...")
    r = requests.post(
        f"{BASE}/{USERNAME}/credentials",
        params={"access_token": TOKEN},
        timeout=30,
    )
    r.raise_for_status()
    creds = r.json()
    print(f"  Bucket: {creds['bucket']}  Key: {creds['key']}")

    # Step 2: Upload to S3 using temporary AWS credentials
    mbtiles_size = os.path.getsize(MBTILES_PATH)
    print(f"Uploading {MBTILES_PATH} ({mbtiles_size / 1_048_576:.1f} MB) to S3...")
    s3 = boto3.client(
        "s3",
        aws_access_key_id=creds["accessKeyId"],
        aws_secret_access_key=creds["secretAccessKey"],
        aws_session_token=creds["sessionToken"],
        region_name="us-east-1",
    )
    s3.upload_file(MBTILES_PATH, creds["bucket"], creds["key"])
    print("  S3 upload complete.")

    # Step 3: Create Mapbox upload job
    print(f"Creating Mapbox upload (tileset: {TILESET_ID})...")
    r = requests.post(
        f"{BASE}/{USERNAME}",
        params={"access_token": TOKEN},
        json={"url": creds["url"], "tileset": TILESET_ID, "name": "SF Street Trees"},
        timeout=30,
    )
    r.raise_for_status()
    upload = r.json()
    upload_id = upload["id"]
    print(f"  Upload ID: {upload_id}")

    # Step 4: Poll until complete
    print("Waiting for Mapbox to process the tileset...")
    while True:
        r = requests.get(
            f"{BASE}/{USERNAME}/{upload_id}",
            params={"access_token": TOKEN},
            timeout=30,
        )
        r.raise_for_status()
        status = r.json()
        progress = int(status.get("progress", 0) * 100)
        print(f"  progress={progress}%  complete={status.get('complete')}  error={status.get('error')}")

        if status.get("error"):
            print(f"ERROR: {status['error']}", file=sys.stderr)
            sys.exit(1)
        if status.get("complete"):
            print("Mapbox tileset updated successfully.")
            break

        time.sleep(15)


if __name__ == "__main__":
    main()
