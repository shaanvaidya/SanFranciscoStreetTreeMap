import requests
from bs4 import BeautifulSoup
from tqdm import tqdm  # for progress bar
import time

BASE_URL = "https://selectree.calpoly.edu/tree-detail/"
HEADERS = {"User-Agent": "Mozilla/5.0"}

species_links = {}

for tree_id in tqdm(range(1, 2352)):
    url = f"{BASE_URL}{tree_id}"
    response = requests.get(url, headers=HEADERS)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        # Try to find the species name in the <h2> tag
        h2 = soup.find("h2")
        print(response.text)
        print(h2)
        if h2:
            species_name = h2.text.strip()
            species_links[species_name] = url
            print(f"{species_name}: {url}")
    else:
        print(f"Error: {response.status_code} for {url}")
        continue  # skip 404s or other errors

    time.sleep(0.1)  # be polite

# Save to a file (optional)
with open("selectree_species_links.txt", "w", encoding="utf-8") as f:
    for name, link in species_links.items():
        f.write(f"{name}\t{link}\n")
