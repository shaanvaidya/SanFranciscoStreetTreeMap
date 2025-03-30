import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Box, CssBaseline, Drawer, IconButton, TextField, Autocomplete, Typography, Button, Chip } from '@mui/material'
import { MyLocation, Close } from '@mui/icons-material'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Feature, FeatureCollection, Point, GeoJsonProperties } from 'geojson';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { FilterList } from '@mui/icons-material'; // Import the filter icon

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhYW52YWlkeWEiLCJhIjoiY20zc2FzeWtyMGV6dzJqb2oyNjcxc2k2dCJ9.kqxE189voII-7Ua8TFpVgw'

const theme = createTheme({
  palette: { mode: 'light' },
  typography: {
    fontFamily: '"Manrope", "Helvetica", "Arial", sans-serif',
  },
});

interface TreeInfo {
  id: number
  species: string
  address: string
  dbh: number | null
  plantDate: string | null
  siteInfo: string | null
  legalStatus: string | null
  neighborhood: string | null
  color: string
  latitude: number
  longitude: number
  neighborhood_name: string | null
}

interface GeoJSONFeature {
  type: string
  geometry: {
    type: string
    coordinates: [number, number]
  }
  properties: {
    id: number
    species: string
    address: string
    dbh: number | null
    plantDate: string | null
    siteInfo: string | null
    legalStatus: string | null
    neighborhood: string | null
    color: string
    latitude: number
    longitude: number
    neighborhood_name: string | null
  }
}

interface GeoJSONResponse {
  type: string
  features: GeoJSONFeature[]
}

const subtitleStyle = {
  color: '#2e7d32',
  mb: 0.5,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontWeight: 600
};

const bodyStyle = {
  fontWeight: 500,
  color: '#000000'
};

const infoStyle = {
  color: '#444',
  mb: 0.5
};

const TreeDetails = ({
  selectedTree,
  speciesCounts,
  setSelectedSpecies,
  setSelectedNeighborhood,
  handleDrawerClose
}: {
  selectedTree: TreeInfo
  speciesCounts: Record<string, number>
  setSelectedSpecies: (val: string) => void
  setSelectedNeighborhood: (val: string) => void
  handleDrawerClose: () => void
}) => (
  <Box sx={{
    transition: 'transform 0.3s ease-in-out',
    transform: selectedTree ? 'translateX(0)' : 'translateX(100%)',
    p: 3, height: '100%', display: 'flex', flexDirection: 'column'
  }}>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        pb: 2,
        borderBottom: '2px solid #2e7d32'
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32', mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' }, }}>
          {selectedTree.species}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
          {speciesCounts[selectedTree.species]?.toLocaleString()} trees in San Francisco
        </Typography>
        <Typography
          component="button"
          onClick={() => setSelectedSpecies(selectedTree.species)}
          sx={{
            mt: 0.5,
            color: '#2e7d32',
            fontWeight: 500,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Filter by this species
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: '#444',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 500,
            mt: 0.5
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: selectedTree.color,
              display: 'inline-block',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          />
          {selectedTree.neighborhood_name || 'Unknown Neighborhood'}
          {selectedTree.neighborhood_name && (
            <Typography
              component="button"
              onClick={() => setSelectedNeighborhood(selectedTree.neighborhood_name!)}
              sx={{
                color: '#2e7d32',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 500,
                fontSize: '0.875rem',
                ml: 1,
                '&:hover': { textDecoration: 'underline' },
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
            >
              Filter by this neighborhood
            </Typography>
          )}
        </Typography>
      </Box>
      <IconButton
        onClick={handleDrawerClose}
        sx={{ color: '#2e7d32', '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' } }}
      >
        <Close />
      </IconButton>
    </Box>

    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { background: '#2e7d32', borderRadius: '3px' }
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          '& > div': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(4px)',
            p: 2,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            border: '1px solid #ddd'
          }
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={subtitleStyle}>
            Nearest Location
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, color: '#000000', mr: 1 }}
            >
              {selectedTree.address}
            </Typography>
            <IconButton
              size="small"
              onClick={() => navigator.clipboard.writeText(selectedTree.address)}
              sx={{
                color: '#2e7d32',
                '&:hover': { backgroundColor: 'rgba(46,125,50,0.1)' },
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography
            component="a"
            href={`https://www.google.com/maps?q=${selectedTree.latitude},${selectedTree.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#2e7d32',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 500,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            View on Google Maps
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={subtitleStyle}>
            Trunk Size
          </Typography>
          <Typography variant="body1" sx={bodyStyle}>
            {selectedTree.dbh ? `${selectedTree.dbh} inches` : 'N/A'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={subtitleStyle}>
            Additional Information
          </Typography>
          <Typography variant="body2" sx={infoStyle}>
            Planted: {selectedTree.plantDate ? new Date(selectedTree.plantDate).toLocaleDateString() : 'N/A'}
          </Typography>
          <Typography variant="body2" sx={infoStyle}>
            Site Info: {selectedTree.siteInfo || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={infoStyle}>
            Legal Status: {selectedTree.legalStatus || 'N/A'}
          </Typography>
        </Box>
      </Box>
    </Box>
  </Box>
)


function App() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [selectedTree, setSelectedTree] = useState<TreeInfo | null>(null)
  const [species, setSpecies] = useState<string[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null)
  const [neighborhoods, setNeighborhoods] = useState<string[]>([])
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null)
  const [zoom, setZoom] = useState(12)
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [speciesCounts, setSpeciesCounts] = useState<Record<string, number>>({})
  const [neighborhoodCounts, setNeighborhoodCounts] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [filteredGeoJSON, setFilteredGeoJSON] = useState<FeatureCollection<Point>>({
    type: 'FeatureCollection',
    features: []
  });
  const [allTrees, setAllTrees] = useState<TreeInfo[]>([]);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-122.44244459744075, 37.76038462356057],
      zoom: 11.5
    })

    map.current.on('load', () => {
      if (!map.current) return

      // Add the GeoJSON source
      map.current.addSource('trees', {
        type: 'vector',
        url: 'mapbox://shaanvaidya.4hee68hi'
      })

      // Add source for user location
      map.current.addSource('user-location', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })

      map.current.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png', (error, image) => {
        if (error || !image) return;
        if (!map.current?.hasImage('custom-marker')) {
          map.current?.addImage('custom-marker', image);
        }

        map.current?.addLayer({
          id: 'searched-location-pin',
          type: 'symbol',
          source: 'searched-location',
          layout: {
            'icon-image': 'custom-marker',
            'icon-size': 0.5,
            'icon-anchor': 'bottom',
          }
        });
      });

      map.current.addSource('searched-location', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add layer for user location
      map.current.addLayer({
        id: 'user-location',
        type: 'circle',
        source: 'user-location',
        paint: {
          'circle-radius': 8,
          'circle-color': '#2196F3',
          'circle-opacity': 1,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 1
        }
      })

      // Add the tree layer
      map.current.addLayer({
        id: 'tree-points',
        type: 'circle',
        source: 'trees',
        'source-layer': 'trees',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'dbh'],
            0, 4,
            10, 5,
            20, 6,
            30, 7,
            40, 8,
            50, 9
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.6,
            15, 0.8,
            20, 1
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.8
        }
      })

      map.current.addSource('filtered-trees', {
        type: 'geojson',
        data: filteredGeoJSON
      });

      map.current.addLayer({
        id: 'filtered-tree-points',
        type: 'circle',
        source: 'filtered-trees',
        paint: {
          'circle-radius': 6,
          'circle-color': ['get', 'color'], // ✅ dynamic color from tree data
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.9
        }
      });

      // Extract unique species and neighborhoods, and count occurrences
      fetch('trees-lookup.json')
        .then(response => response.json())
        .then((data: TreeInfo[]) => {
          setAllTrees(data);
          const uniqueSpecies = new Set<string>();
          const uniqueNeighborhoods = new Set<string>();
          const speciesCounts: Record<string, number> = {};
          const neighborhoodCounts: Record<string, number> = {};

          data.forEach(tree => {
            if (tree.species) {
              uniqueSpecies.add(tree.species);
              speciesCounts[tree.species] = (speciesCounts[tree.species] || 0) + 1;
            }

            if (tree.neighborhood_name) {
              uniqueNeighborhoods.add(tree.neighborhood_name);
              neighborhoodCounts[tree.neighborhood_name] = (neighborhoodCounts[tree.neighborhood_name] || 0) + 1;
            }
          });

          setSpecies(Array.from(uniqueSpecies).sort());
          setNeighborhoods(Array.from(uniqueNeighborhoods).sort());
          setSpeciesCounts(speciesCounts);
          setNeighborhoodCounts(neighborhoodCounts);
        })
        .catch(error => {
          console.error('Error loading tree metadata:', error);
          setError('Failed to load tree metadata. Please try again later.');
        });

      // Add click event
      map.current.on('click', 'tree-points', (e) => {
        if (!e.features?.[0]?.properties) return

        const props = e.features[0].properties

        // Set the selected tree ID for highlighting
        setSelectedTreeId(props.id)

        // Set the selected tree for the sidebar
        setSelectedTree({
          id: props.id,
          species: props.species,
          address: props.address,
          dbh: props.dbh,
          plantDate: props.plantDate,
          siteInfo: props.siteInfo,
          legalStatus: props.legalStatus,
          neighborhood: props.neighborhood,
          color: props.color,
          latitude: props.latitude,
          longitude: props.longitude,
          neighborhood_name: props.neighborhood_name
        })

        // Animate to the tree location
        const offsetLat = -0.0005; // ~50 meters; tweak as needed
        const isMobile = window.innerWidth < 600;

        map.current?.flyTo({
          center: isMobile
            ? [props.longitude, props.latitude + offsetLat]
            : [props.longitude, props.latitude],
          zoom: 18,
          duration: 1000,
          essential: true
        });
      })

      // // Add a layer for highlighted trees
      map.current.addLayer({
        id: 'highlighted-trees',
        type: 'circle',
        source: 'trees',
        'source-layer': 'trees',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'dbh'],
            0, 5,
            10, 6,
            20, 7,
            30, 8,
            40, 9,
            50, 10
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 1,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#000000',
          'circle-stroke-opacity': 1,
          'circle-pitch-alignment': 'map'
        },
        filter: ['==', ['get', 'id'], selectedTreeId || -1],
        layout: {
          visibility: 'visible'
        }
      })

      // Move the highlighted layer to the top
      map.current.moveLayer('highlighted-trees')

      // Change cursor on hover
      map.current.on('mouseenter', 'tree-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })

      map.current.on('mouseleave', 'tree-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })

      // Reset cursor when moving over non-tree areas
      map.current.on('mousemove', (e) => {
        if (!map.current) return

        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['tree-points']
        })

        map.current.getCanvas().style.cursor = features.length ? 'pointer' : ''
      })

      // Track zoom level
      map.current.on('zoom', () => {
        if (map.current) setZoom(map.current.getZoom())
      })
    })

    return () => {
      map.current?.remove()
    }
  }, [])

  // Handle species and neighborhood filter changes
  useEffect(() => {
    if (!map.current) return

    const applyFilter = () => {
      if (!map.current) return;

      try {
        const filters = []

        if (selectedSpecies) {
          filters.push(['==', ['get', 'species'], selectedSpecies])
        }

        if (selectedNeighborhood) {
          filters.push(['==', ['get', 'neighborhood_name'], selectedNeighborhood])
        }

        const hasActiveFilter = !!selectedSpecies || !!selectedNeighborhood;

        if (filters.length === 0) {
          map.current.setFilter('tree-points', null)
        } else if (filters.length === 1) {
          map.current.setFilter('tree-points', filters[0])
        } else {
          map.current.setFilter('tree-points', ['all', ...filters])
        }

        const filteredTrees = hasActiveFilter
          ? allTrees.filter(tree => {
            return (
              (!selectedSpecies || tree.species === selectedSpecies) &&
              (!selectedNeighborhood || tree.neighborhood_name === selectedNeighborhood)
            );
          }).slice(0, 500)
          : [];

        const features: Feature<Point, GeoJsonProperties>[] = filteredTrees.map(tree => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [tree.longitude, tree.latitude]
          },
          properties: { ...tree }
        }));

        const featureCollection: FeatureCollection<Point, GeoJsonProperties> = {
          type: "FeatureCollection",
          features
        };

        setFilteredGeoJSON(featureCollection);

        const source = map.current.getSource('filtered-trees');
        if (source && 'setData' in source) {
          source.setData(featureCollection);
        }
        // ✅ Set overlay visibility only if there's an active filter
        if (map.current.getLayer('filtered-tree-points')) {
          map.current.setLayoutProperty(
            'filtered-tree-points',
            'visibility',
            hasActiveFilter ? 'visible' : 'none'
          );
        }
      } catch (error) {
        console.error('Error applying filter:', error)
      }
    }

    // Apply filter immediately
    applyFilter();

    // Cleanup function to remove filter when component unmounts or filters change
    return () => {
      if (map.current && map.current.isStyleLoaded()) {
        try {
          if (map.current.getLayer('tree-points')) {
            map.current.setFilter('tree-points', null);
          }
          if (map.current.getLayer('filtered-tree-points')) {
            map.current.setLayoutProperty('filtered-tree-points', 'visibility', 'none');
          }
        } catch (error) {
          console.error('Error removing filter:', error);
        }
      }
    };
  }, [selectedSpecies, selectedNeighborhood, allTrees]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!addressQuery) {
        setAddressResults([]);
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            addressQuery
          )}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5&bbox=-123.1738,37.6398,-122.2818,37.9298`
        );
        const data = await response.json();
        setAddressResults(data.features || []);
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [addressQuery]);


  // Add this effect to update the highlight filter when selectedTreeId changes
  useEffect(() => {
    if (!map.current || !map.current.getLayer('highlighted-trees')) return;

    map.current.setFilter('highlighted-trees', [
      '==',
      ['get', 'id'],
      selectedTreeId ?? -1
    ]);
  }, [selectedTreeId]);

  const handleLocationClick = () => {
    if (!map.current) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: [number, number] = [position.coords.longitude, position.coords.latitude]
        setUserLocation(location)

        // Update the user location source
        const source = map.current?.getSource('user-location')
        if (source && 'setData' in source) {
          source.setData({
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: location
              },
              properties: {}
            }]
          })
        }

        // Fly to location
        map.current?.flyTo({
          center: location,
          zoom: 16,
          duration: 1000
        })
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(`Location error (${error.code}): ${error.message}`);
      }
    )
  }

  // Update the drawer close handler to clear the highlight
  const handleDrawerClose = () => {
    setSelectedTree(null)
    setSelectedTreeId(null)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          backgroundColor: 'rgba(248, 249, 250, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e0e0e0',
          zIndex: 3
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#2e7d32'
          }}
        >
          San Francisco Street Tree Map
        </Typography>
      </Box>
      <Box sx={{ height: '100vh', width: '100vw', position: 'relative' }}>
        <Box ref={mapContainer} sx={{ position: 'absolute', top: 56, bottom: 0, width: '100%' }} />
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="contained"
          size="small"
          sx={{
            display: { xs: 'block', sm: 'block' },
            position: 'absolute',
            top: 70,
            left: 20,
            zIndex: 2,
            backgroundColor: '#2e7d32', // ✅ Green background
            color: 'white',
            '&:hover': {
              backgroundColor: '#27662c', // ✅ Slightly darker green on hover
            }
          }}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
        {/* Conditionally show applied filters if filters are hidden */}
        {!showFilters && (selectedSpecies || selectedNeighborhood || addressQuery) && (
          <Box
            sx={{
              position: 'absolute',
              top: 70,
              left: 'calc(20px + 140px)', // Adjust to place the badge next to the "Show Filters" button
              backgroundColor: 'rgba(29, 120, 80, 0.2)', // Transparent dark green
              color: 'gray',
              padding: '5px 10px',
              borderRadius: '15px',
              fontSize: '14px',
            }}
          >
            {selectedSpecies ? `Species: ${selectedSpecies}` : ''}
            {selectedNeighborhood ? `, Neighborhood: ${selectedNeighborhood}` : ''}
            {addressQuery ? `, Address: ${addressQuery}` : ''}
          </Box>
        )}
        {showFilters && (
          <Box
            sx={{
              position: 'absolute',
              top: 110,
              left: 20,
              right: 20,
              maxWidth: { xs: '100%', sm: 300 },
              p: { xs: 2, sm: 1 },
              backgroundColor: 'rgba(248, 249, 250, 0.9)', // light blur-glass look
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: 2,
              boxShadow: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              zIndex: 2,
            }}
          >

            {/* Species Filter */}
            <Autocomplete
              options={species}
              value={selectedSpecies}
              onChange={(_, newValue) => setSelectedSpecies(newValue)}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{option}</span>
                    <Chip label={`${speciesCounts[option]?.toLocaleString() || 0}`} size="small" />
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Species"
                  variant="outlined"
                  size="small"
                />
              )}
            />

            {/* Neighborhood Filter */}
            <Autocomplete
              options={neighborhoods}
              value={selectedNeighborhood}
              onChange={(_, newValue) => setSelectedNeighborhood(newValue)}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{option}</span>
                    <Chip label={`${neighborhoodCounts[option]?.toLocaleString() || 0}`} size="small" />
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Neighborhood"
                  variant="outlined"
                  size="small"
                />
              )}
            />

            {/* Go to Address */}
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                size="small"
                label="Go to Address"
                variant="outlined"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
              />
              {addressResults.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    boxShadow: 2,
                    borderRadius: 1,
                    maxHeight: 200,
                    overflowY: 'auto',
                    zIndex: 3
                  }}
                >
                  {addressResults.map((result) => (
                    <Box
                      key={result.id}
                      sx={{
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f0f0f0' }
                      }}
                      onClick={() => {
                        const [lng, lat] = result.center;
                        // Update the searched location pin
                        const source = map.current?.getSource('searched-location');
                        if (source && 'setData' in source) {
                          source.setData({
                            type: 'FeatureCollection',
                            features: [
                              {
                                type: 'Feature',
                                geometry: {
                                  type: 'Point',
                                  coordinates: [lng, lat]
                                },
                                properties: {}
                              }
                            ]
                          });
                        }
                        map.current?.flyTo({ center: [lng, lat], zoom: 17 });
                        setAddressQuery(result.place_name);
                        setAddressResults([]);
                      }}
                    >
                      {result.place_name}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>



            {/* Clear All Button */}
            <Button
              onClick={() => {
                setSelectedSpecies(null);
                setSelectedNeighborhood(null);
                setAddressQuery('');
                const searchedSource = map.current?.getSource('searched-location');
                if (searchedSource && 'setData' in searchedSource) {
                  searchedSource.setData({
                    type: 'FeatureCollection',
                    features: []
                  });
                }
              }}
              variant="outlined"
              size="small"
              fullWidth
              disabled={!selectedSpecies && !selectedNeighborhood && !addressQuery}
            >
              Clear All
            </Button>
          </Box>
        )}


        {/* Location Button */}
        <IconButton
          onClick={handleLocationClick}
          sx={{
            position: 'absolute',
            bottom: { xs: 120, sm: 40 },
            right: 20,
            backgroundColor: 'white',
            boxShadow: 2,
            zIndex: 1000, // ensure it's always on top
            width: 48,
            height: 48,
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          <MyLocation />
        </IconButton>
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 0, sm: 'auto' },
            top: { xs: 'auto', sm: 0 },
            left: { xs: 0, sm: 'auto' },
            right: 0,
            width: { xs: '100%', sm: 400 },
            height: { xs: '50%', sm: '100%' },
            backgroundColor: 'rgba(248, 249, 250, 0.9)', // light blur-glass look
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            // backgroundColor: '#f8f9fa',
            // boxShadow: '0 0 30px rgba(0,0,0,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Instead of 0.05
            borderLeft: '1px solid #e0e0e0',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            p: 3,
            borderTopLeftRadius: { xs: 16, sm: 0 },
            borderTopRightRadius: { xs: 16, sm: 0 },
            transform: {
              xs: selectedTree ? 'translateY(0)' : 'translateY(100%)',
              sm: selectedTree ? 'translateX(0)' : 'translateX(100%)'
            },
            transition: 'transform 0.3s ease',
            pointerEvents: selectedTree ? 'auto' : 'none',
            opacity: selectedTree ? 1 : 0
          }}
        >
          {selectedTree && (
            <TreeDetails
              selectedTree={selectedTree}
              speciesCounts={speciesCounts}
              setSelectedSpecies={setSelectedSpecies}
              setSelectedNeighborhood={setSelectedNeighborhood}
              handleDrawerClose={handleDrawerClose}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider >
  )
}

export default App
