# San Francisco Street Tree Map

An interactive web map showcasing the street trees of San Francisco, built with React and Mapbox GL JS. Explore over 200,000 street trees across the city, filter by species and neighborhoods, and discover detailed information about each tree including its scientific name, planting date, and size.

## 🔗 Live Demo

**[🌳 Explore the Interactive Map →](https://shaanvaidya.com/SanFranciscoStreetTreeMap)**

## 🌳 About This Project

This project visualizes San Francisco's urban forest using official data from the city's Department of Public Works (DPW). The map provides an intuitive way to explore the diversity and distribution of street trees throughout San Francisco's neighborhoods, from towering eucalyptus trees to decorative flowering species.

## 📊 Data Source

The tree data comes from the **San Francisco Department of Public Works (DPW) Street Tree List**, specifically the dataset dated March 23, 2025. This comprehensive dataset includes:

- **Tree Species**: Scientific and common names for each tree
- **Location Data**: Precise GPS coordinates and street addresses
- **Physical Attributes**: Diameter at Breast Height (DBH) measurements
- **Administrative Info**: Planting dates, legal status, and site information
- **Neighborhood Mapping**: Association with San Francisco's official neighborhood boundaries

### Data Processing

The raw DPW data undergoes several processing steps to optimize it for web mapping:

1. **Data Cleaning**: Species names are standardized, missing values are handled, and data quality issues are corrected
2. **Neighborhood Enrichment**: Trees are mapped to neighborhood boundaries using spatial analysis
3. **GeoJSON Conversion**: Data is converted to web-friendly GeoJSON format
4. **Vector Tile Generation**: Using Tippecanoe to create optimized Mapbox vector tiles for fast rendering
5. **Species Metadata**: Additional information is enriched using botanical databases

## ✨ Features

- **Interactive Map**: Pan, zoom, and explore street trees across San Francisco
- **Tree Details**: Click any tree to view detailed information including species, size, planting date, and location
- **Advanced Filtering**: Filter trees by species or neighborhood with real-time count updates
- **Address Search**: Search for specific addresses to locate nearby trees
- **Responsive Design**: Optimized for both desktop and mobile viewing
- **Location Services**: Find trees near your current location
- **Species Discovery**: Learn about San Francisco's diverse urban forest with links to botanical information

## 🛠 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Mapping**: Mapbox GL JS with custom vector tiles
- **UI Framework**: Material-UI (MUI) with custom theming
- **Build Tool**: Vite for fast development and optimized builds
- **Data Processing**: Python scripts with pandas for data cleaning
- **Deployment**: GitHub Pages with automated CI/CD

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Mapbox API token (for map tiles)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shaanvaidya/SanFranciscoStreetTreeMap.git
cd SanFranciscoStreetTreeMap
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Mapbox token:
```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) to view the application

### Building for Production

```bash
npm run build
```

### Deployment

The project is configured for deployment to GitHub Pages:

```bash
npm run deploy
```

## 📁 Project Structure

```
SanFranciscoStreetTreeMap/
├── src/                    # React application source code
│   ├── components/         # Reusable UI components
│   ├── types/             # TypeScript type definitions
│   └── App.tsx            # Main application component
├── data_prep/             # Data processing scripts and raw data
│   ├── Street_Tree_List_20250323.csv  # Original DPW dataset
│   ├── cleanupData.py     # Data cleaning script
│   ├── convert_to_geojson.py  # GeoJSON conversion
│   └── trees.mbtiles      # Mapbox vector tiles
├── public/                # Static assets
└── trees-lookup.json     # Processed tree metadata
```

## 🤝 Contributing

Contributions are welcome! Here are some ways you can contribute:

- **Data Updates**: Help process newer versions of the DPW street tree dataset
- **Feature Enhancements**: Add new filtering options or visualizations
- **Bug Fixes**: Report and fix issues you encounter
- **Documentation**: Improve documentation and add code comments
- **Performance**: Optimize map rendering and data loading

Please feel free to submit issues and pull requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **San Francisco Department of Public Works**: For providing the comprehensive street tree dataset
- **Mapbox**: For excellent mapping tools and vector tile hosting
- **San Francisco Urban Forest**: For maintaining the city's incredible tree canopy
- **Open Source Community**: For the tools and libraries that make this project possible

## 📧 Contact

Created by [Shaan Vaidya](https://github.com/shaanvaidya) - feel free to reach out with questions or suggestions!

---

*Help us keep San Francisco green! 🌲 Consider volunteering with local tree planting and maintenance organizations.*
