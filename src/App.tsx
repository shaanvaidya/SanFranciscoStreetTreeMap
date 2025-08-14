import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { ThemeProvider } from '@mui/material/styles'
import { Box, CssBaseline, IconButton, Snackbar, Alert } from '@mui/material'
import { MyLocation } from '@mui/icons-material'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Feature, FeatureCollection, Point, GeoJsonProperties } from 'geojson';
import { theme } from './theme'
import { TreeInfo } from './types/tree'
import TreeDetails from './components/TreeDetails'
import TreeSummaryBar from './components/TreeSummaryBar'
import HeaderBar from './components/HeaderBar'
import FiltersPanel from './components/Filters/FiltersPanel'


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1Ijoic2hhYW52YWlkeWEiLCJhIjoiY20zc2FzeWtyMGV6dzJqb2oyNjcxc2k2dCJ9.kqxE189voII-7Ua8TFpVgw'

// theme moved to ./theme
 
 
// TreeDetails and TreeSummaryBar moved to components


function App() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null)
  const [selectedTree, setSelectedTree] = useState<TreeInfo | null>(null)
  const [species, setSpecies] = useState<string[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null)
  const [neighborhoods, setNeighborhoods] = useState<string[]>([])
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null)

  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null)

  const [speciesCounts, setSpeciesCounts] = useState<Record<string, number>>({})
  const [neighborhoodCounts, setNeighborhoodCounts] = useState<Record<string, number>>({})

  const [filteredGeoJSON, setFilteredGeoJSON] = useState<FeatureCollection<Point>>({
    type: 'FeatureCollection',
    features: []
  });
  const [allTrees, setAllTrees] = useState<TreeInfo[]>([]);
  const [addressQuery, setAddressQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = window.innerWidth < 600;
  const [showFullTreeDetails, setShowFullTreeDetails] = useState(!isMobile);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

      // Initialize GeolocateControl for heading/tracking and add it (we will hide its UI)
      geolocateControlRef.current = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      });
      map.current.addControl(geolocateControlRef.current, 'bottom-right');

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
            16, [
              'interpolate',
              ['linear'],
              ['min', ['coalesce', ['get', 'dbh'], 0], 60],
              0, 6,
              30, 7,
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
            16, [
              'interpolate',
              ['linear'],
              ['min', ['coalesce', ['get', 'dbh'], 0], 60],
              0, 6,
              30, 7,
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
          ? [0, window.innerHeight * 0.1] // push tree lower on mobile, close to the bottom bar
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
            ['zoom'],
            10, [
              'interpolate',
              ['linear'],
              ['min', ['coalesce', ['get', 'dbh'], 0], 60],
              0, 2,
              30, 2.5,
              60, 3
            ],
            16, [
              'interpolate',
              ['linear'],
              ['min', ['coalesce', ['get', 'dbh'], 0], 60],
              0, 6,
              30, 7,
              60, 8
            ]
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

  // address geocoding moved into FiltersPanel


  // Add this effect to update the highlight filter when selectedTreeId changes
  useEffect(() => {
    if (!map.current || !map.current.getLayer('highlighted-trees')) return;

    map.current.setFilter('highlighted-trees', [
      '==',
      ['get', 'id'],
      selectedTreeId ?? -1
    ]);
  }, [selectedTreeId]);

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

  const handleLocationClick = () => {
    if (!map.current) return

    const updateUserLocationOnMap = (location: [number, number]) => {
      const source = map.current?.getSource('user-location');
      if (source && 'setData' in source) {
        source.setData({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: location },
            properties: {}
          }]
        });
      }
    };

    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: [number, number] = [position.coords.longitude, position.coords.latitude];
        updateUserLocationOnMap(location);
        map.current?.flyTo({ center: location, zoom: Math.max(map.current.getZoom(), 16), duration: 800 });
      },
      (error) => {
        console.error('Error getting location:', error);
        setToastMessage(`Location error (${error.code}): ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HeaderBar />

      <Box sx={{ height: '100dvh', width: '100vw', overflow: 'hidden', position: 'relative',
        '& .mapboxgl-ctrl-geolocate': { display: 'none !important' }
      }}>
        <Box ref={mapContainer} sx={{ position: 'absolute', top: 56, bottom: 0, width: '100%' }} />
        <FiltersPanel
          species={species}
          neighborhoods={neighborhoods}
          speciesCounts={speciesCounts}
          neighborhoodCounts={neighborhoodCounts}
          selectedSpecies={selectedSpecies}
          setSelectedSpecies={setSelectedSpecies}
          selectedNeighborhood={selectedNeighborhood}
          setSelectedNeighborhood={setSelectedNeighborhood}
          addressQuery={addressQuery}
          setAddressQuery={setAddressQuery}
          onGeocode={({ center, place_name }) => {
            const [lng, lat] = center
            const source = map.current?.getSource('searched-location');
            if (source && 'setData' in source) {
              source.setData({
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [lng, lat] },
                    properties: {}
                  }
                ]
              });
            }
            map.current?.flyTo({ center: [lng, lat], zoom: 17 });
            setAddressQuery(place_name);
          }}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />


        {/* Location Button */}
        <IconButton
          onClick={() => {
            // Trigger built-in geolocate with heading; falls back to custom if unavailable
            if (geolocateControlRef.current) {
              geolocateControlRef.current.trigger();
            } else {
              handleLocationClick();
            }
          }}
          sx={{
            position: 'absolute',
            bottom: { xs: 110, sm: 40 },
            right: {
              xs: 20,
              sm: selectedTree ? 420 : 20,
              md: selectedTree ? 520 : 20,
              lg: selectedTree ? 620 : 20,
            },
            backgroundColor: 'white',
            boxShadow: 2,
            zIndex: 2000, // ensure it's always on top of sidebar/summary
            width: 48,
            height: 48,
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          <MyLocation />
        </IconButton>
        {/* Hide built-in geolocate control button */}
        <Box sx={{
          '& .mapboxgl-ctrl-geolocate': { display: 'none' }
        }} />
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
                setToastMessage={setToastMessage}
              />
            )}
          </Box>
        </>
      </Box>
      
      {/* Toast Notification */}
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setToastMessage(null)} 
          severity="success" 
          sx={{ 
            width: '100%',
            backgroundColor: '#4caf50',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider >
  )
}

export default App
