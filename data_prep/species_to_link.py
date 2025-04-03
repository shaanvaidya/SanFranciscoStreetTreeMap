from playwright.sync_api import sync_playwright
from tqdm import tqdm
import json
import time

tree_data = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    for i in tqdm(range(1, 2352), desc="Scraping Selectree"):
        url = f"https://selectree.calpoly.edu/tree-detail/{i}"
        try:
            page.goto(url, timeout=10000)
            page.wait_for_selector("div.tree-name-info", timeout=3000)
            info = page.query_selector("div.tree-name-info")

            common_name = info.query_selector("h2.label-demibold")
            scientific_name = info.query_selector("p.tree-name-info-science-name span")
            family = info.query_selector("span.tree-name-info-family")

            synonyms_div = info.query_selector("div.tree-name-info-middle-text")
            synonyms = [el.inner_text().strip() for el in synonyms_div.query_selector_all("p.font-italic")] if synonyms_div else []

            alt_names_div = info.query_selector("div.tree-name-info-right-text")
            alt_names = [el.inner_text().strip() for el in alt_names_div.query_selector_all("p") if not el.get_attribute("class")] if alt_names_div else []

            tree_data[i] = {
                "common_name": common_name.inner_text().strip() if common_name else None,
                "scientific_name": scientific_name.inner_text().strip() if scientific_name else None,
                "family": family.inner_text().strip() if family else None,
                "synonyms": synonyms,
                "additional_common_names": alt_names,
                "url": url
            }
            print(tree_data[i])
        except Exception as e:
            # You can log or collect failed IDs here if needed
            pass
        time.sleep(0.05)

    browser.close()

# Save to file
with open("selectree_detailed_tree_data.json", "w") as f:
    json.dump(tree_data, f, indent=2)
