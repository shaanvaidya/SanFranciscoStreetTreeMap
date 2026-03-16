import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { ThemeProvider } from '@mui/material/styles'
import { Box, CssBaseline, IconButton, LinearProgress, Snackbar, Alert, useMediaQuery } from '@mui/material'
import { MyLocation } from '@mui/icons-material'
import 'mapbox-gl/dist/mapbox-gl.css'
import { theme } from './theme'
import { TreeInfo } from './types/tree'
import TreeDetails from './components/TreeDetails'
import TreeSummaryBar from './components/TreeSummaryBar'
import HeaderBar from './components/HeaderBar'
import FiltersPanel from './components/Filters/FiltersPanel'
import { useTreeData } from './hooks/useTreeData'
import { useTreeFilters } from './hooks/useTreeFilters'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

function App() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null)

  const isMobile = useMediaQuery('(max-width:600px)')

  const [selectedTree, setSelectedTree] = useState<TreeInfo | null>(null)
  const [showFullTreeDetails, setShowFullTreeDetails] = useState(!isMobile)
  const [showFilters, setShowFilters] = useState(false)
  const [addressQuery, setAddressQuery] = useState('')
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const { allTrees, species, neighborhoods, speciesCounts, neighborhoodCounts, loading, error } = useTreeData()
  const { selectedSpecies, setSelectedSpecies, selectedNeighborhood, setSelectedNeighborhood } = useTreeFilters(map, allTrees)

  useEffect(() => {
    if (selectedTree) {
      setShowFullTreeDetails(!isMobile)
    }
  }, [selectedTree, isMobile])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-122.44244459744075, 37.76038462356057],
      zoom: 11.5,
    })

    map.current.on('load', () => {
      if (!map.current) return

      map.current.addSource('trees', {
        type: 'vector',
        url: 'mapbox://shaanvaidya.6gtq3t4j',
      })

      map.current.addSource('user-location', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      map.current.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png', (error, image) => {
        if (error || !image) return
        if (!map.current?.hasImage('custom-marker')) {
          map.current?.addImage('custom-marker', image)
        }
        map.current?.addLayer({
          id: 'searched-location-pin',
          type: 'symbol',
          source: 'searched-location',
          layout: {
            'icon-image': 'custom-marker',
            'icon-size': 0.5,
            'icon-anchor': 'bottom',
          },
        })
      })

      map.current.addSource('searched-location', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      geolocateControlRef.current = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      })
      map.current.addControl(geolocateControlRef.current, 'bottom-right')

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
          'circle-stroke-opacity': 1,
        },
      })

      const treeCircleRadius = [
        'interpolate', ['linear'], ['zoom'],
        10, ['interpolate', ['linear'], ['min', ['coalesce', ['get', 'dbh'], 0], 60], 0, 2, 30, 2.5, 60, 3],
        16, ['interpolate', ['linear'], ['min', ['coalesce', ['get', 'dbh'], 0], 60], 0, 6, 30, 7, 60, 8],
      ]
      const treeCircleOpacity = ['interpolate', ['linear'], ['zoom'], 10, 0.6, 15, 0.8, 20, 1]
      const treeCirclePaint: mapboxgl.CirclePaint = {
        'circle-radius': treeCircleRadius as mapboxgl.Expression,
        'circle-color': ['get', 'color'],
        'circle-opacity': treeCircleOpacity as mapboxgl.Expression,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.8,
      }

      map.current.addLayer({ id: 'tree-points', type: 'circle', source: 'trees', 'source-layer': 'trees', paint: treeCirclePaint })

      map.current.addSource('filtered-trees', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.current.addLayer({ id: 'filtered-tree-points', type: 'circle', source: 'filtered-trees', paint: treeCirclePaint })

      // Click a tree to select it
      map.current.on('click', 'tree-points', (e) => {
        if (!e.features?.[0]?.properties) return
        const props = e.features[0].properties
        const speciesParts = props.species?.split('(') ?? []
        const scientificName = speciesParts[1]?.replace(')', '') ?? ''
        const commonName = speciesParts[0]?.trim() ?? props.species ?? ''

        setSelectedTree({
          id: props.id,
          species: props.species,
          address: props.address,
          dbh: props.dbh,
          plantDate: props.plantDate,
          siteInfo: props.siteInfo,
          legalStatus: props.legalStatus,
          color: props.color,
          latitude: props.latitude,
          longitude: props.longitude,
          neighborhood_name: props.neighborhood_name,
          markedForRemoval: props.markedForRemoval ?? false,
          common_name: commonName,
          scientific_name: scientificName,
        })

        const mobile = window.innerWidth < 600
        const sidebarOffset: [number, number] = mobile
          ? [0, window.innerHeight * 0.1]
          : [-window.innerWidth * 0.2, 0]

        map.current?.flyTo({
          center: [props.longitude, props.latitude],
          zoom: 18,
          duration: 1000,
          essential: true,
          offset: sidebarOffset,
        })
      })

      map.current.addLayer({
        id: 'highlighted-trees',
        type: 'circle',
        source: 'trees',
        'source-layer': 'trees',
        paint: {
          'circle-radius': treeCircleRadius as mapboxgl.Expression,
          'circle-color': ['get', 'color'],
          'circle-opacity': 1,
          'circle-stroke-width': 5,
          'circle-stroke-color': 'rgba(51, 51, 0, 1)',
          'circle-stroke-opacity': 1,
          'circle-pitch-alignment': 'map',
        },
        filter: ['==', ['get', 'id'], -1],
        layout: { visibility: 'visible' },
      })
      map.current.moveLayer('highlighted-trees')

      map.current.on('mouseenter', 'tree-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })
      map.current.on('mouseleave', 'tree-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })
      map.current.on('mousemove', (e) => {
        if (!map.current) return
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['tree-points'] })
        map.current.getCanvas().style.cursor = features.length ? 'pointer' : ''
      })
    })

    return () => { map.current?.remove() }
  }, [])

  // Update highlight ring when selected tree changes
  useEffect(() => {
    if (!map.current || !map.current.getLayer('highlighted-trees')) return
    map.current.setFilter('highlighted-trees', ['==', ['get', 'id'], selectedTree?.id ?? -1])
  }, [selectedTree])

  const handleDrawerClose = () => {
    if (isMobile && showFullTreeDetails) {
      setShowFullTreeDetails(false)
    } else {
      setSelectedTree(null)
    }
  }

  const handleLocationClick = () => {
    if (!map.current) return

    const updateUserLocationOnMap = (location: [number, number]) => {
      const source = map.current?.getSource('user-location')
      if (source && 'setData' in source) {
        (source as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: location }, properties: {} }],
        })
      }
    }

    if (!('geolocation' in navigator)) {
      setToast({ message: 'Geolocation is not supported by your browser.', severity: 'error' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: [number, number] = [position.coords.longitude, position.coords.latitude]
        updateUserLocationOnMap(location)
        map.current?.flyTo({ center: location, zoom: Math.max(map.current.getZoom(), 16), duration: 800 })
      },
      (err) => {
        console.error('Error getting location:', err)
        setToast({ message: `Location error: ${err.message}`, severity: 'error' })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HeaderBar />

      {loading && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            zIndex: 1100,
            height: 2,
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            '& .MuiLinearProgress-bar': { backgroundColor: '#2e7d32' },
          }}
        />
      )}

      <Box sx={{
        height: '100dvh', width: '100vw', overflow: 'hidden', position: 'relative',
        '& .mapboxgl-ctrl-geolocate': { display: 'none !important' },
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
            const source = map.current?.getSource('searched-location')
            if (source && 'setData' in source) {
              (source as mapboxgl.GeoJSONSource).setData({
                type: 'FeatureCollection',
                features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: {} }],
              })
            }
            map.current?.flyTo({ center: [lng, lat], zoom: 17 })
            setAddressQuery(place_name)
          }}
          onClearAll={() => {
            setAddressQuery('')
            const source = map.current?.getSource('searched-location')
            if (source && 'setData' in source) {
              (source as mapboxgl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] })
            }
          }}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        <IconButton
          onClick={() => {
            if (geolocateControlRef.current) {
              geolocateControlRef.current.trigger()
            } else {
              handleLocationClick()
            }
          }}
          sx={{
            position: 'absolute',
            bottom: { xs: selectedTree ? 120 : 30, sm: 40 },
            right: {
              xs: 20,
              sm: selectedTree ? 420 : 20,
              md: selectedTree ? 520 : 20,
              lg: selectedTree ? 620 : 20,
            },
            backgroundColor: 'white',
            boxShadow: 2,
            zIndex: 500,
            width: 48,
            height: 48,
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          <MyLocation />
        </IconButton>

        <>
          {isMobile && selectedTree && !showFullTreeDetails && (
            <TreeSummaryBar
              tree={selectedTree}
              onMoreDetails={() => setShowFullTreeDetails(true)}
              onClose={() => setSelectedTree(null)}
            />
          )}

          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: 0, sm: 'auto' },
              top: { xs: 'auto', sm: 0 },
              left: { xs: 0, sm: 'auto' },
              right: 0,
              width: { xs: '100%', sm: 400, md: 500, lg: 600 },
              height: { xs: '100%', sm: '100%' },
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
                xs: selectedTree && showFullTreeDetails ? 'translateY(0%)' : 'translateY(100%)',
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
                  setShowFullTreeDetails(false)
                  handleDrawerClose()
                }}
                setToastMessage={(message) => setToast({ message, severity: 'success' })}
              />
            )}
          </Box>
        </>
      </Box>

      {error && (
        <Snackbar open anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
        </Snackbar>
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity ?? 'success'}
          sx={{
            width: '100%',
            ...(toast?.severity === 'success' && {
              backgroundColor: '#4caf50',
              color: 'white',
              '& .MuiAlert-icon': { color: 'white' },
            }),
          }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}

export default App
