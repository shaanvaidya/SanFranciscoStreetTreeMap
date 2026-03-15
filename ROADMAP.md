# Roadmap

Ideas and future work, roughly grouped by theme.

## Data Enrichment

- **Selectree integration** — link each species to its Selectree page for botanical info (scraper + data already in `data_prep/selectree_detailed_tree_data.json`, just needs wiring into the sidebar)
- **Landmark trees** — overlay SF's official landmark trees from [SF Environment](https://www.sfenvironment.org/landmark-trees) as special map markers; physical project to photograph each one
- **Friends of Urban Forest** — cross-reference FUF planting data for additional tree history/context
- **Etymology** — show the origin/meaning of species names in the tree details panel
- **More removal notification detail** — show the permit date, not just the flag

## Map & Visualization

- **Improve street view positioning** — current iframe sometimes misses the tree; use better heading/pitch calculation from tree coordinates
- **Color by genus legend** — make the existing genus color coding more discoverable with a visible legend
- **Iconic/popular trees** — highlight well-known individual trees (e.g. the Moreton Bay Fig in Golden Gate Park)
- **Tree walks** — curated walking routes featuring notable trees, shareable links

## Discovery & Exploration

- **Oldest trees** — surface the 100+ year old trees in the dataset
- **Rarest species** — species with only 1-5 trees in the city
- **Seasonal highlights** — cherry blossoms, fall color trees surfaced at the right time of year
- **Tree of the day/week** — featured tree on the landing page
- **"Trees near me"** — notification when a nearby tree gets a removal permit filed

## Community (needs backend: Supabase + Vercel recommended)

- **Adopt a tree** — let people claim a tree and leave public notes
- **Photos** — community-submitted photos per tree, shown in the details panel (like Google Maps)

## Features

- **Stats dashboard** — species distribution, neighborhood breakdowns, age histograms, most common trees, etc.
- **Ask questions about the data** — natural language querying ("how many oaks are in the Mission?"), could use Claude API
- **Tree ID from photo** — take a photo, identify the species

## Expansion

- **Other cities** — Palo Alto, Mountain View, San Jose, NYC trees (similar pipeline, different data sources)

## Tech

- **shadcn/ui** — evaluate replacing MUI with shadcn for lighter, more customizable components
- **Automated pipeline** — fully automated CI/CD from new SF data export → processed data → deployed map, no manual steps
