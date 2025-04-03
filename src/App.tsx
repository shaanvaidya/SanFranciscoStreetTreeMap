import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Box, CssBaseline, IconButton, TextField, Autocomplete, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, Slide } from '@mui/material'
import { MyLocation, Close } from '@mui/icons-material'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Feature, FeatureCollection, Point, GeoJsonProperties } from 'geojson';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BugReportIcon from '@mui/icons-material/BugReport'
import { } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef } from 'react';
import RoomIcon from '@mui/icons-material/Room';
import LaunchIcon from '@mui/icons-material/Launch';
import CloseIcon from '@mui/icons-material/Close';


mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhYW52YWlkeWEiLCJhIjoiY20zc2FzeWtyMGV6dzJqb2oyNjcxc2k2dCJ9.kqxE189voII-7Ua8TFpVgw'

const theme = createTheme({
  palette: { mode: 'light' },
  typography: {
    fontFamily: '"Manrope", "Helvetica", "Arial", sans-serif',
  },
});

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
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
  common_name: string
  scientific_name: string
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
  // textTransform: 'uppercase',
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
    p: 3, height: '100%', display: 'flex', flexDirection: 'column',
    overflowY: 'auto', // Allow scrolling of the entire sidebar
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
        <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
          #{selectedTree.id} {/* Show Tree ID here */}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32', mb: 0.5, fontSize: { xs: '1.25rem', sm: '2.0rem' }, }}>
          {selectedTree.common_name}
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: selectedTree.color,
              display: 'inline-block',
              marginLeft: 8,
              verticalAlign: 'middle',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </Typography>
        <Typography variant="body2" sx={{ color: '#2e7d32', mb: 0.5, fontSize: { xs: '1.0rem', sm: '1.2rem' } }}>
          {selectedTree.scientific_name}
        </Typography>

        <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
          {speciesCounts[selectedTree.species]?.toLocaleString()} such trees in San Francisco
        </Typography>
        <Typography
          component="button"
          onClick={() => {
            setSelectedSpecies(selectedTree.species)
            if (window.innerWidth < 600) {
              handleDrawerClose(); // collapse on mobile only
            }
          }}
          sx={{
            mt: 0.5,
            color: '#2e7d32',
            fontWeight: 500,
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
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
          View all trees of this species
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#444',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 500,
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            mt: 0.5,
          }}
        >
          {selectedTree.neighborhood_name || 'Unknown Neighborhood'}
          {selectedTree.neighborhood_name && (
            <Typography
              component="button"
              onClick={() => {
                setSelectedNeighborhood(selectedTree.neighborhood_name!)
                if (window.innerWidth < 600) {
                  handleDrawerClose(); // collapse on mobile only
                }
              }}
              sx={{
                color: '#2e7d32',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 500,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                ml: 1,
                '&:hover': { textDecoration: 'underline' },
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
            >
              View all trees in this neighborhood
            </Typography>
          )}
        </Typography>
      </Box>
      <IconButton
        onClick={handleDrawerClose}
        sx={{ color: '#2e7d32', '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' }, position: 'absolute', top: 10, right: 10 }}
      >
        <Close />
      </IconButton>
    </Box>

    <Box
      sx={{
        flex: 1,
        // overflowY: 'auto',
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
            Closest Address
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
            Additional Information
          </Typography>
          <Typography variant="body2" sx={infoStyle}>
            Trunk Size: {selectedTree.dbh ? `${selectedTree.dbh} inches` : 'N/A'}
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
        <Box>
          <Typography variant="subtitle2" sx={subtitleStyle}>
            Street View
          </Typography>
          <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', height: 350 }}>
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/streetview?key=AIzaSyDA-b6A5qwlxK2_YnNilM0XRIvMttvD7o4&location=${selectedTree.latitude},${selectedTree.longitude}&heading=0&pitch=0&fov=80`}
            ></iframe>
          </Box>
        </Box>

      </Box>
    </Box>
  </Box>
)

const TreeSummaryBar = ({
  tree,
  onMoreDetails,
  onClose,
}: {
  tree: TreeInfo;
  onMoreDetails: () => void;
  onClose: () => void;
}) => (
  <Box
    sx={{
      position: 'absolute',
      bottom: 0,
      width: '100%',
      zIndex: 1100,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderTop: '1px solid #ccc',
      px: 2,
      py: 1.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      height: 80, // 🔒 Fix the height (adjust as needed)
      overflow: 'hidden', // ✅ Prevent internal overflow
      boxSizing: 'border-box',
    }}
  >
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: '#2e7d32',
        }}
      >
        {tree.common_name}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontStyle: 'italic',
          color: '#555',
          lineHeight: 1.2,
          fontSize: '0.85rem',
        }}
      >
        {tree.scientific_name}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
        <RoomIcon fontSize="small" sx={{ color: '#2e7d32' }} />
        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#333' }}>
          {tree.address}
        </Typography>
        <IconButton
          size="small"
          href={`https://www.google.com/maps?q=${tree.latitude},${tree.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ ml: 0.5, color: '#2e7d32' }}
        >
          <LaunchIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>

    <Button
      variant="text"
      onClick={onMoreDetails}
      size="small"
      sx={{ color: '#2e7d32', whiteSpace: 'nowrap' }}
    >
      Details
    </Button>

    <IconButton onClick={onClose} sx={{ color: '#2e7d32' }}>
      <CloseIcon />
    </IconButton>
  </Box>
);


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
  const isMobile = window.innerWidth < 600;
  const [showFullTreeDetails, setShowFullTreeDetails] = useState(!isMobile);

  useEffect(() => {
    if (selectedTree) {
      setShowFullTreeDetails(!isMobile);
    }
  }, [selectedTree]);

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
        url: 'mapbox://shaanvaidya.4j2s4npu'
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
            ['zoom'],
            10, [
              'interpolate',
              ['linear'],
              ['min', ['coalesce', ['get', 'dbh'], 0], 60],
              0, 2,
              30, 2.5,
              60, 3
            ],
            14, [
              'interpolate',
              ['linear'],
              ['min', ['coalesce', ['get', 'dbh'], 0], 60],
              0, 4,
              30, 6,
              60, 8
            ]
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
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, [
              'interpolate',
              ['linear'],
              ['min', ['coalesce', ['get', 'dbh'], 0], 60],
              0, 2,
              30, 2.5,
              60, 3
            ],
            14, [
              'interpolate',
              ['linear'],
              ['min', ['coalesce', ['get', 'dbh'], 0], 60],
              0, 4,
              30, 5,
              60, 6
            ]
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
        const scientificName = props.species.split('(')[1].replace(')', '')
        const commonName = props.species.split('(')[0]
        console.log(scientificName, commonName)
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
          neighborhood_name: props.neighborhood_name,
          common_name: commonName,
          scientific_name: scientificName
        })

        // Animate to the tree location
        const isMobile = window.innerWidth < 600;

        const sidebarOffset = isMobile
          ? [0, -window.innerHeight * 0.2] // push tree 40% higher on mobile
          : [-window.innerWidth * 0.2, 0]; // push tree left on desktop

        map.current?.flyTo({
          center: [props.longitude, props.latitude],
          zoom: 18,
          duration: 1000,
          essential: true,
          offset: sidebarOffset as [number, number],
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
          'circle-stroke-width': 5,
          'circle-stroke-color': 'rgba(51, 51, 0, 1)',
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
    if (isMobile && showFullTreeDetails) {
      // Just collapse to summary on mobile
      setShowFullTreeDetails(false);
    } else {
      // Fully close on desktop or from summary
      setSelectedTree(null);
      setSelectedTreeId(null);
    }
  }

  const [openInfo, setOpenInfo] = useState(false);

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
          px: 2,
          backgroundColor: 'rgba(248, 249, 250, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e0e0e0',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Title + Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#2e7d32',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            San Francisco Street Tree Map
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpenInfo(true)}
            sx={{ color: '#2e7d32', ml: 1 }}
            aria-label="Learn more about this map"
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Box>

        {/* Feedback */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
          {/* Just icon on mobile */}
          <IconButton
            component="a"
            href="https://github.com/shaanvaidya/SanFranciscoStreetTreeMap/issues/new?title=Feedback:+&body=Please+describe+your+request+or+bug+here."
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: { xs: 'inline-flex', sm: 'none' },
              color: '#2e7d32'
            }}
          >
            <BugReportIcon />
          </IconButton>

          {/* Full button on desktop */}
          <Button
            component="a"
            href="https://github.com/shaanvaidya/SanFranciscoStreetTreeMap/issues/new?title=Feedback:+&body=Please+describe+your+request+or+bug+here."
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              color: '#2e7d32',
              borderColor: '#2e7d32',
              ml: 1,
              whiteSpace: 'nowrap'
            }}
          >
            <BugReportIcon sx={{ mr: 0.5 }} />
            Give Feedback
          </Button>
        </Box>
      </Box>
      <Dialog
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        TransitionComponent={Transition}
        keepMounted
        fullScreen // mobile-first
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2, // flat on mobile, rounded on desktop
            maxWidth: { sm: 500 },
            margin: { sm: 'auto' }
          }
        }}
        PaperProps={{
          sx: {
            maxHeight: { xs: 270, sm: 250 }, // 🔽 Controls overall height
            mx: 2, // 🔽 Small horizontal margin on mobile
            my: '20vh', // 🔽 Push it down vertically on mobile
            borderRadius: 2,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            color: 'rgba(5, 117, 36, 0.87)'
          }}
        >
          <Typography variant="h6">About This Map</Typography>
          <IconButton onClick={() => setOpenInfo(false)} size="small" aria-label="Close">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            This interactive map shows street trees in San Francisco. You can filter by species,
            neighborhood, search by address, or go to your current location. Tree data is sourced from the <a href="https://data.sfgov.org/City-Infrastructure/Street-Tree-List/tkzw-k3nq/about_data" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#2e7d32' }}>San Francisco Public Works Street Tree List</a>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Built with ❤️ using Mapbox and React.
          </Typography>
        </DialogContent>
      </Dialog>

      <Box sx={{ height: '100dvh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
        <Box ref={mapContainer} sx={{ position: 'absolute', top: 56, bottom: 0, width: '100%' }} />
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outlined"
          size="small"
          sx={{
            borderColor: '#2e7d32',
            color: '#2e7d32',
            backgroundColor: 'white',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              borderColor: '#27662c',
            },
            display: { xs: 'block', sm: 'block' },
            position: 'absolute',
            top: 70,
            left: 20,
            zIndex: 2
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
            bottom: { xs: 110, sm: 40 },
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
        <>
          {isMobile && selectedTree && !showFullTreeDetails && (
            <TreeSummaryBar
              tree={selectedTree}
              onMoreDetails={() => setShowFullTreeDetails(true)}
              onClose={() => {
                setSelectedTree(null);
                setSelectedTreeId(null);
              }}
            />
          )}

          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: 0, sm: 'auto' },
              top: { xs: 'auto', sm: 0 },
              left: { xs: 0, sm: 'auto' },
              right: 0,
              width: {
                xs: '100%',
                sm: 400,
                md: 500,
                lg: 600,
              },
              height: {
                xs: '100%',
                sm: '100%',
              },
              backgroundColor: 'rgba(248, 249, 250, 0.95)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderLeft: { sm: '1px solid #e0e0e0' },
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 0, sm: 3 },
              transform: {
                xs:
                  selectedTree && showFullTreeDetails
                    ? 'translateY(0%)'
                    : 'translateY(100%)',
                sm: selectedTree ? 'translateX(0)' : 'translateX(100%)',
              },
              opacity: {
                xs: selectedTree && showFullTreeDetails ? 1 : 0,
                sm: selectedTree ? 1 : 0,
              },
              transition: 'transform 0.35s ease-in-out, opacity 0.3s ease-in-out',
              pointerEvents: {
                xs: selectedTree && showFullTreeDetails ? 'auto' : 'none',
                sm: selectedTree ? 'auto' : 'none',
              },
            }}
          >
            {selectedTree && (
              <TreeDetails
                selectedTree={selectedTree}
                speciesCounts={speciesCounts}
                setSelectedSpecies={setSelectedSpecies}
                setSelectedNeighborhood={setSelectedNeighborhood}
                handleDrawerClose={() => {
                  setShowFullTreeDetails(false);
                  handleDrawerClose();
                }}
              />
            )}
          </Box>
        </>
      </Box>
    </ThemeProvider >
  )
}

export default App
