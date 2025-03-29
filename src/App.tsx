import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Box, CssBaseline, Drawer, IconButton, TextField, Autocomplete, Typography } from '@mui/material'
import { MyLocation, Close } from '@mui/icons-material'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhYW52YWlkeWEiLCJhIjoiY20zc2FzeWtyMGV6dzJqb2oyNjcxc2k2dCJ9.kqxE189voII-7Ua8TFpVgw'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

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
        type: 'geojson',
        data: 'https://d3mh3mxgqea5sd.cloudfront.net/trees.geojson'
      })

      // Add source for user location
      map.current.addSource('user-location', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })

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

      // Extract unique species and neighborhoods, and count occurrences
      fetch('https://d3mh3mxgqea5sd.cloudfront.net/trees.geojson')
        .then(response => response.json())
        .then((data: GeoJSONResponse) => {
          // Get unique species and neighborhoods
          const uniqueSpecies = new Set<string>()
          const uniqueNeighborhoods = new Set<string>()
          const speciesCounts: Record<string, number> = {}
          const neighborhoodCounts: Record<string, number> = {}

          data.features.forEach(feature => {
            const species = feature.properties.species
            const neighborhood = feature.properties.neighborhood_name

            if (species) {
              uniqueSpecies.add(species)
              speciesCounts[species] = (speciesCounts[species] || 0) + 1
            }

            if (neighborhood) {
              uniqueNeighborhoods.add(neighborhood)
              neighborhoodCounts[neighborhood] = (neighborhoodCounts[neighborhood] || 0) + 1
            }
          })

          setSpecies(Array.from(uniqueSpecies).sort())
          setNeighborhoods(Array.from(uniqueNeighborhoods).sort())
          setSpeciesCounts(speciesCounts)
          setNeighborhoodCounts(neighborhoodCounts)
        })
        .catch(error => {
          console.error('Error loading tree data:', error)
          setError('Failed to load tree data. Please try again later.')
        })

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
        map.current?.flyTo({
          center: [props.longitude, props.latitude],
          zoom: 16,
          duration: 1000,
          essential: true
        })
      })

      // Add a layer for highlighted trees
      map.current.addLayer({
        id: 'highlighted-trees',
        type: 'circle',
        source: 'trees',
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
      if (!map.current) return

      try {
        const filters = []

        if (selectedSpecies) {
          filters.push(['==', ['get', 'species'], selectedSpecies])
        }

        if (selectedNeighborhood) {
          filters.push(['==', ['get', 'neighborhood_name'], selectedNeighborhood])
        }

        if (filters.length === 0) {
          map.current.setFilter('tree-points', null)
        } else if (filters.length === 1) {
          map.current.setFilter('tree-points', filters[0])
        } else {
          map.current.setFilter('tree-points', ['all', ...filters])
        }
      } catch (error) {
        console.error('Error applying filter:', error)
      }
    }

    // Apply filter immediately
    applyFilter()

    // Cleanup function to remove filter when component unmounts or filters change
    return () => {
      if (map.current) {
        try {
          map.current.setFilter('tree-points', null)
        } catch (error) {
          console.error('Error removing filter:', error)
        }
      }
    }
  }, [selectedSpecies, selectedNeighborhood])

  // Add this effect to update the highlight filter when selectedTreeId changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return

    map.current.setFilter('highlighted-trees', ['==', ['get', 'id'], selectedTreeId || -1])
  }, [selectedTreeId])

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
        console.error('Error getting location:', error)
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
      <Box sx={{ height: '100vh', width: '100vw', position: 'relative' }}>
        <Box ref={mapContainer} sx={{ height: '100%', width: '100%' }} />

        {/* Filters Container */}
        <Box sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          right: 20,
          display: 'flex',
          gap: 2,
          zIndex: 1
        }}>
          {/* Species Filter */}
          <Box sx={{
            width: { xs: '100%', sm: 300 },
            backgroundColor: 'white',
            borderRadius: 1,
            boxShadow: 2
          }}>
            <Autocomplete
              options={species}
              value={selectedSpecies}
              onChange={(_, newValue) => setSelectedSpecies(newValue)}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={key} {...otherProps}>
                    {option} ({speciesCounts[option]?.toLocaleString()} trees)
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Species"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {selectedSpecies && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#666',
                              mr: 1
                            }}
                          >
                            {speciesCounts[selectedSpecies]?.toLocaleString()} trees
                          </Typography>
                        )}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          {/* Neighborhood Filter */}
          <Box sx={{
            width: { xs: '100%', sm: 300 },
            backgroundColor: 'white',
            borderRadius: 1,
            boxShadow: 2
          }}>
            <Autocomplete
              options={neighborhoods}
              value={selectedNeighborhood}
              onChange={(_, newValue) => setSelectedNeighborhood(newValue)}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={key} {...otherProps}>
                    {option} ({neighborhoodCounts[option]?.toLocaleString()} trees)
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Neighborhood"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {selectedNeighborhood && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#666',
                              mr: 1
                            }}
                          >
                            {neighborhoodCounts[selectedNeighborhood]?.toLocaleString()} trees
                          </Typography>
                        )}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Location Button */}
        <IconButton
          onClick={handleLocationClick}
          sx={{
            position: 'absolute',
            bottom: 40,
            right: 20,
            backgroundColor: 'white',
            boxShadow: 2,
            '&:hover': { backgroundColor: '#f5f5f5' },
            zIndex: 1
          }}
        >
          <MyLocation />
        </IconButton>

        {/* Tree Info Drawer */}
        <Drawer
          anchor="right"
          open={!!selectedTree}
          onClose={handleDrawerClose}
          elevation={0}
          ModalProps={{
            disableScrollLock: true,
            disableEnforceFocus: true,
            sx: {
              '& .MuiBackdrop-root': {
                backgroundColor: 'transparent'
              }
            }
          }}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 400 },
              backgroundColor: '#f8f9fa',
              boxShadow: '0 0 20px rgba(0,0,0,0.1)'
            }
          }}
        >
          {selectedTree && (
            <Box sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f8f9fa'
            }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '2px solid #2e7d32'
              }}>
                <Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      color: '#2e7d32',
                      mb: 0.5
                    }}
                  >
                    {selectedTree.species}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#666',
                      mb: 0.5
                    }}
                  >
                    {speciesCounts[selectedTree.species]?.toLocaleString()} trees in San Francisco
                  </Typography>
                  <Typography
                    component="button"
                    onClick={() => setSelectedSpecies(selectedTree.species)}
                    sx={{
                      color: '#2e7d32',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      '&:hover': {
                        textDecoration: 'underline'
                      },
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  >
                    Filter by this species
                  </Typography>
                  <Typography variant="subtitle1" sx={{
                    color: '#444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontWeight: 500,
                    mt: 0.5
                  }}>
                    <span style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: selectedTree.color,
                      display: 'inline-block',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                    {selectedTree.neighborhood_name || 'Unknown Neighborhood'}
                    {selectedTree.neighborhood_name && (
                      <Typography
                        component="button"
                        onClick={() => setSelectedNeighborhood(selectedTree.neighborhood_name)}
                        sx={{
                          color: '#2e7d32',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          ml: 1,
                          '&:hover': {
                            textDecoration: 'underline'
                          },
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
                  sx={{
                    color: '#2e7d32',
                    '&:hover': {
                      backgroundColor: 'rgba(46, 125, 50, 0.08)'
                    }
                  }}
                >
                  <Close />
                </IconButton>
              </Box>

              <Box sx={{
                flex: 1,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#2e7d32',
                  borderRadius: '3px',
                },
              }}>
                <Box sx={{
                  display: 'grid',
                  gap: 2,
                  '& > div': {
                    backgroundColor: '#ffffff',
                    p: 2,
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: '1px solid #e0e0e0'
                  }
                }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{
                      color: '#2e7d32',
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 600
                    }}>
                      Nearest Location
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1, color: '#000000' }}>
                      {selectedTree.address}
                    </Typography>
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
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      View on Google Maps
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{
                      color: '#2e7d32',
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 600
                    }}>
                      Trunk Size
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#000000' }}>
                      {selectedTree.dbh ? `${selectedTree.dbh} inches` : 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{
                      color: '#2e7d32',
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 600
                    }}>
                      Additional Information
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#444', mb: 0.5 }}>
                      Planted: {selectedTree.plantDate ? new Date(selectedTree.plantDate).toLocaleDateString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#444', mb: 0.5 }}>
                      Site Info: {selectedTree.siteInfo || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#444' }}>
                      Legal Status: {selectedTree.legalStatus || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Drawer>
      </Box>
    </ThemeProvider>
  )
}

export default App
