import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { ThemeProvider } from '@mui/material/styles'
import { Box, CssBaseline, IconButton, LinearProgress, Snackbar, Alert, useMediaQuery } from '@mui/material'
import { MyLocation } from '@mui/icons-material'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createAppTheme } from './theme'
import { TreeInfo } from './types/tree'
import { LandmarkInfo } from './types/landmark'
import TreeDetails from './components/TreeDetails'
import TreeSummaryBar from './components/TreeSummaryBar'
import HeaderBar from './components/HeaderBar'
import FiltersPanel from './components/Filters/FiltersPanel'
import LandmarkDetails from './components/LandmarkDetails'
import ForestStats from './components/ForestStats'
import { useTreeData } from './hooks/useTreeData'
import { useTreeFilters } from './hooks/useTreeFilters'
import { useLandmarks } from './hooks/useLandmarks'
import { LANDMARKS_ENABLED } from './flags'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

function initMapLayers(mapInstance: mapboxgl.Map, isDark: boolean) {
  mapInstance.addSource('trees', {
    type: 'vector',
    url: 'mapbox://shaanvaidya.6gtq3t4j',
  })

  mapInstance.addSource('user-location', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })

  mapInstance.addSource('searched-location', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })

  mapInstance.addSource('filtered-trees', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })

  mapInstance.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png', (error, image) => {
    if (error || !image) return
    if (!mapInstance.hasImage('custom-marker')) {
      mapInstance.addImage('custom-marker', image)
    }
    if (!mapInstance.getLayer('searched-location-pin')) {
      mapInstance.addLayer({
        id: 'searched-location-pin',
        type: 'symbol',
        source: 'searched-location',
        layout: {
          'icon-image': 'custom-marker',
          'icon-size': 0.5,
          'icon-anchor': 'bottom',
        },
      })
    }
  })

  mapInstance.addLayer({
    id: 'user-location',
    type: 'circle',
    source: 'user-location',
    paint: {
      'circle-radius': 8,
      'circle-color': '#2196F3',
      'circle-opacity': 1,
      'circle-stroke-width': 2,
      'circle-stroke-color': isDark ? '#121212' : '#ffffff',
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
    'circle-stroke-color': isDark ? 'rgba(18, 18, 18, 0.7)' : '#ffffff',
    'circle-stroke-opacity': 0.8,
  }

  mapInstance.addLayer({ id: 'tree-points', type: 'circle', source: 'trees', 'source-layer': 'trees', paint: treeCirclePaint })
  mapInstance.addLayer({ id: 'filtered-tree-points', type: 'circle', source: 'filtered-trees', paint: treeCirclePaint })

  if (LANDMARKS_ENABLED) {
    mapInstance.addSource('landmarks', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })
    mapInstance.addLayer({
      id: 'landmark-points',
      type: 'circle',
      source: 'landmarks',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 6, 16, 12],
        'circle-color': '#FFD700',
        'circle-opacity': 0.92,
        'circle-stroke-width': 2,
        'circle-stroke-color': isDark ? '#1a1a1a' : '#fff',
        'circle-stroke-opacity': 1,
      },
      layout: { visibility: 'none' },
    })
  }

  mapInstance.addLayer({
    id: 'highlighted-trees',
    type: 'circle',
    source: 'trees',
    'source-layer': 'trees',
    paint: {
      'circle-radius': treeCircleRadius as mapboxgl.Expression,
      'circle-color': ['get', 'color'],
      'circle-opacity': 1,
      'circle-stroke-width': 5,
      'circle-stroke-color': isDark ? 'rgba(255, 220, 0, 0.9)' : 'rgba(51, 51, 0, 1)',
      'circle-stroke-opacity': 1,
      'circle-pitch-alignment': 'map',
    },
    filter: ['==', ['get', 'id'], -1],
    layout: { visibility: 'visible' },
  })
  mapInstance.moveLayer('highlighted-trees')
}

function App() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null)
  const mapInitialized = useRef(false)
  const paddingInitialized = useRef(false)
  const [mapReady, setMapReady] = useState(false)
  const initialTreeId = useRef<string | null>(new URLSearchParams(window.location.search).get('tree'))

  const isMobile = useMediaQuery('(max-width:600px)')
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  const [userOverride, setUserOverride] = useState<'light' | 'dark' | null>(() => {
    const stored = localStorage.getItem('theme-mode')
    return stored === 'light' || stored === 'dark' ? stored : null
  })

  // Follow system preference when no explicit override is set
  useEffect(() => {
    if (userOverride === null) return
  }, [userOverride])

  const mode: 'light' | 'dark' = userOverride ?? (prefersDark ? 'dark' : 'light')
  const modeRef = useRef(mode)
  modeRef.current = mode

  const toggleTheme = () => {
    const next = mode === 'light' ? 'dark' : 'light'
    setUserOverride(next)
    localStorage.setItem('theme-mode', next)
  }

  const appTheme = useMemo(() => createAppTheme(mode), [mode])

  // Sync color-scheme and meta theme-color with current mode
  useEffect(() => {
    document.documentElement.style.colorScheme = mode
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', mode === 'dark' ? '#121212' : '#2e7d32')
    }
  }, [mode])

  const { allTrees, species, neighborhoods, speciesCounts, neighborhoodCounts, loading, error } = useTreeData()
  const { selectedSpecies, setSelectedSpecies, selectedNeighborhood, setSelectedNeighborhood, removalFilter, setRemovalFilter } = useTreeFilters(map, allTrees)
  const { landmarks, landmarksByTreeId } = useLandmarks(LANDMARKS_ENABLED)

  const landmarksRef = useRef<LandmarkInfo[]>([])
  landmarksRef.current = landmarks
  const allTreesRef = useRef<TreeInfo[]>([])
  allTreesRef.current = allTrees

  const [showLandmarks, setShowLandmarks] = useState(false)
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkInfo | null>(null)

  // Panel state machine: one variable controls what the panel displays
  type PanelView = 'stats' | 'tree' | 'landmark' | 'closed'
  const [panelView, setPanelView] = useState<PanelView>('stats')
  const [mobileExpanded, setMobileExpanded] = useState(false)

  const [selectedTree, setSelectedTree] = useState<TreeInfo | null>(null)
  const selectedTreeRef = useRef<TreeInfo | null>(null)
  selectedTreeRef.current = selectedTree

  // Derived state
  const desktopPanelOpen = !isMobile && panelView !== 'closed'
  const mobilePanelOpen = isMobile && mobileExpanded && panelView !== 'closed'
  const showSummaryBar = isMobile && !mobileExpanded && (panelView === 'tree' || panelView === 'landmark')

  // Sync selected tree id to URL
  useEffect(() => {
    // Don't clear the param if we haven't yet loaded the initial tree from it
    if (!selectedTree && initialTreeId.current) return
    const params = new URLSearchParams(window.location.search)
    if (selectedTree) {
      params.set('tree', String(selectedTree.id))
    } else {
      params.delete('tree')
    }
    const newSearch = params.toString()
    const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [selectedTree])

  // On load: auto-select tree from URL once data is ready
  useEffect(() => {
    if (allTrees.length === 0 || !mapReady) return
    const treeId = initialTreeId.current
    if (!treeId) return
    initialTreeId.current = null
    const tree = allTrees.find(t => String(t.id) === treeId)
    if (!tree) return
    const speciesParts = tree.species?.split('(') ?? []
    const enriched = {
      ...tree,
      common_name: tree.common_name || speciesParts[0]?.trim() || tree.species || '',
      scientific_name: tree.scientific_name || speciesParts[1]?.replace(')', '') || '',
    }
    setSelectedTree(enriched)
    setPanelView('tree')
    const mobile = window.innerWidth < 600
    const sidebarOffset: [number, number] = mobile ? [0, window.innerHeight * 0.1] : [-window.innerWidth * 0.2, 0]
    map.current?.flyTo({ center: [tree.longitude, tree.latitude], zoom: 18, duration: 1000, essential: true, offset: sidebarOffset })
  }, [allTrees, mapReady])

  const [showFilters, setShowFilters] = useState(false)
  const [addressQuery, setAddressQuery] = useState('')
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)


  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: modeRef.current === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [-122.44244459744075, 37.76038462356057],
      zoom: 11.5,
    })

    map.current.on('load', () => {
      if (!map.current) return

      // Apply sidebar padding instantly before revealing data layers
      const w = window.innerWidth
      const rightPad = w >= 1200 ? 600 : w >= 900 ? 500 : w >= 600 ? 400 : 0
      map.current.easeTo({ padding: { top: 56, right: rightPad, bottom: 0, left: 0 }, duration: 0 })

      initMapLayers(map.current, modeRef.current === 'dark')
      mapInitialized.current = true
      setMapReady(true)

      geolocateControlRef.current = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      })
      map.current.addControl(geolocateControlRef.current, 'bottom-right')

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
          caretaker: props.caretaker ?? null,
          color: props.color,
          latitude: props.latitude,
          longitude: props.longitude,
          neighborhood_name: props.neighborhood_name,
          markedForRemoval: props.markedForRemoval ?? false,
          common_name: commonName,
          scientific_name: scientificName,
        })
        setPanelView('tree')
        setMobileExpanded(false)

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

      // Click a landmark marker
      if (LANDMARKS_ENABLED) map.current.on('click', 'landmark-points', (e) => {
        if (!e.features?.[0]?.properties) return
        const { index, tree_id } = e.features[0].properties as { index: number; tree_id: number }
        const landmark = landmarksRef.current[index]
        if (!landmark) return

        setSelectedLandmark(landmark)
        setMobileExpanded(false)

        if (tree_id > 0) {
          // Linked to a real street tree — find and select it
          const tree = allTreesRef.current.find(t => t.id === tree_id)
          if (tree) {
            const speciesParts = tree.species?.split('(') ?? []
            setSelectedTree({
              ...tree,
              common_name: tree.common_name || speciesParts[0]?.trim() || tree.species || '',
              scientific_name: tree.scientific_name || speciesParts[1]?.replace(')', '') || '',
            })
            setPanelView('tree')
          }
        } else {
          // Private/park tree — clear any street tree selection
          setSelectedTree(null)
          setPanelView('landmark')
        }

        const mobile = window.innerWidth < 600
        const sidebarOffset: [number, number] = mobile ? [0, window.innerHeight * 0.1] : [-window.innerWidth * 0.2, 0]
        map.current?.flyTo({ center: [landmark.longitude, landmark.latitude], zoom: 18, duration: 1000, essential: true, offset: sidebarOffset })
      })

      map.current.on('mouseenter', 'tree-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })
      map.current.on('mouseleave', 'tree-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })
      if (LANDMARKS_ENABLED) {
        map.current.on('mouseenter', 'landmark-points', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer'
        })
        map.current.on('mouseleave', 'landmark-points', () => {
          if (map.current) map.current.getCanvas().style.cursor = ''
        })
      }
      map.current.on('mousemove', (e) => {
        if (!map.current) return
        const layers = LANDMARKS_ENABLED ? ['tree-points', 'landmark-points'] : ['tree-points']
        const features = map.current.queryRenderedFeatures(e.point, { layers })
        map.current.getCanvas().style.cursor = features.length ? 'pointer' : ''
      })
    })

    return () => { map.current?.remove() }
  }, [])

  // Switch Mapbox style when dark mode changes (after map is initialized)
  useEffect(() => {
    if (!map.current || !mapInitialized.current) return
    const style = mode === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11'
    map.current.setStyle(style)
    map.current.once('style.load', () => {
      if (!map.current) return
      initMapLayers(map.current, mode === 'dark')
      if (map.current.getLayer('highlighted-trees')) {
        map.current.setFilter('highlighted-trees', ['==', ['get', 'id'], selectedTreeRef.current?.id ?? -1])
      }
    })
  }, [mode])

  // Update highlight ring when selected tree changes
  useEffect(() => {
    if (!map.current || !map.current.getLayer('highlighted-trees')) return
    map.current.setFilter('highlighted-trees', ['==', ['get', 'id'], selectedTree?.id ?? -1])
  }, [selectedTree])

  // Populate landmark GeoJSON source when landmarks load
  useEffect(() => {
    if (!LANDMARKS_ENABLED || !mapReady || landmarks.length === 0) return
    const source = map.current?.getSource('landmarks')
    if (source && 'setData' in source) {
      (source as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: landmarks.map(l => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [l.longitude, l.latitude] },
          properties: { index: l.index, tree_id: l.tree_id },
        })),
      })
    }
  }, [landmarks, mapReady])

  // Show/hide landmark layer and dim regular trees when toggled
  useEffect(() => {
    if (!LANDMARKS_ENABLED || !mapReady || !map.current) return
    const visibility = showLandmarks ? 'visible' : 'none'
    if (map.current.getLayer('landmark-points')) {
      map.current.setLayoutProperty('landmark-points', 'visibility', visibility)
    }
    if (map.current.getLayer('tree-points')) {
      map.current.setPaintProperty('tree-points', 'circle-opacity', showLandmarks
        ? ['interpolate', ['linear'], ['zoom'], 10, 0.25, 15, 0.35, 20, 0.5]
        : ['interpolate', ['linear'], ['zoom'], 10, 0.6, 15, 0.8, 20, 1])
    }
  }, [showLandmarks, mapReady])

  // Sync map padding with sidebar open/close (skip initial run — handled by Map constructor)
  useEffect(() => {
    if (!map.current || !mapReady) return
    if (!paddingInitialized.current) {
      paddingInitialized.current = true
      return
    }
    const panelOpen = !isMobile && panelView !== 'closed'
    const w = window.innerWidth
    const sidebarWidth = w >= 1200 ? 600 : w >= 900 ? 500 : 400
    const rightPad = panelOpen ? sidebarWidth : 0
    map.current.easeTo({ padding: { top: 56, right: rightPad, bottom: 0, left: 0 }, duration: 350 })
  }, [panelView, mapReady, isMobile])

  const handleDrawerClose = () => {
    if (isMobile) {
      setMobileExpanded(false)
    } else {
      setPanelView('closed')
      setSelectedTree(null)
      setSelectedLandmark(null)
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

  const isDark = mode === 'dark'

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <HeaderBar
        mode={mode}
        onToggleTheme={toggleTheme}
        onInfoClick={() => {
          setPanelView('stats')
          setMobileExpanded(true)
        }}
      />

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
            '& .MuiLinearProgress-bar': { backgroundColor: appTheme.palette.primary.main },
          }}
        />
      )}

      <Box sx={{
        height: '100dvh', width: '100vw', overflow: 'hidden', position: 'relative',
        '& .mapboxgl-ctrl-geolocate': { display: 'none !important' },
      }}>
        <Box
          ref={mapContainer}
          sx={{
            position: 'absolute', top: 56, bottom: 0, width: '100%',
            opacity: mapReady ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />

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
          landmarksEnabled={LANDMARKS_ENABLED}
          showLandmarks={showLandmarks}
          setShowLandmarks={setShowLandmarks}
          removalFilter={removalFilter}
          setRemovalFilter={setRemovalFilter}
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
            bottom: { xs: showSummaryBar ? 120 : 30, sm: 40 },
            right: {
              xs: 20,
              sm: (allTrees.length > 0 && desktopPanelOpen) ? 420 : 20,
              md: (allTrees.length > 0 && desktopPanelOpen) ? 520 : 20,
              lg: (allTrees.length > 0 && desktopPanelOpen) ? 620 : 20,
            },
            backgroundColor: isDark ? '#1e1e1e' : 'white',
            boxShadow: 2,
            zIndex: 500,
            width: 48,
            height: 48,
            '&:hover': { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' },
          }}
        >
          <MyLocation />
        </IconButton>

        <>
          {showSummaryBar && (selectedTree || selectedLandmark) && (
            <TreeSummaryBar
              tree={selectedTree ?? {
                id: selectedLandmark!.tree_id,
                species: selectedLandmark!.scientific_name,
                address: selectedLandmark!.address,
                dbh: null,
                plantDate: null,
                siteInfo: null,
                legalStatus: null,
                caretaker: null,
                color: '#FFD700',
                latitude: selectedLandmark!.latitude,
                longitude: selectedLandmark!.longitude,
                neighborhood_name: null,
                markedForRemoval: false,
                common_name: selectedLandmark!.common_name,
                scientific_name: selectedLandmark!.scientific_name,
              }}
              onMoreDetails={() => setMobileExpanded(true)}
              onClose={() => { setPanelView('closed'); setSelectedTree(null); setSelectedLandmark(null) }}
            />
          )}

          {/* Reopen tab — shown on desktop when panel is closed */}
          {!isMobile && !desktopPanelOpen && (
            <Box
              onClick={() => setPanelView('stats')}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                position: 'absolute',
                top: 'calc(50% + 28px)',
                right: 0,
                transform: 'translateY(-50%)',
                zIndex: 999,
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 64,
                borderRadius: '6px 0 0 6px',
                backgroundColor: isDark ? 'rgba(18,18,18,0.95)' : 'rgba(248,249,250,0.95)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0'}`,
                borderRight: 'none',
                boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                color: isDark ? '#a5d6a7' : '#4caf50',
                fontSize: 12,
                backdropFilter: 'blur(10px)',
                '&:hover': { color: isDark ? '#c8e6c9' : '#1b5e20' },
                transition: 'color 0.2s',
              }}
            >
              ‹
            </Box>
          )}

          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: 0, sm: 'auto' },
              top: { xs: 'auto', sm: 56 },
              left: { xs: 0, sm: 'auto' },
              right: 0,
              width: { xs: '100%', sm: 400, md: 500, lg: 600 },
              height: { xs: '100%', sm: 'calc(100% - 56px)' },
              backgroundColor: isDark ? 'rgba(18, 18, 18, 0.95)' : 'rgba(248, 249, 250, 0.95)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderLeft: { sm: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0'}` },
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 0, sm: 0 },
              transform: {
                xs: mobilePanelOpen ? 'translateY(0%)' : 'translateY(100%)',
                sm: desktopPanelOpen ? 'translateX(0)' : 'translateX(100%)',
              },
              opacity: {
                xs: mobilePanelOpen ? 1 : 0,
                sm: desktopPanelOpen ? 1 : 0,
              },
              transition: 'transform 0.35s ease-in-out, opacity 0.3s ease-in-out',
              pointerEvents: {
                xs: mobilePanelOpen ? 'auto' : 'none',
                sm: desktopPanelOpen ? 'auto' : 'none',
              },
            }}
          >
            {panelView === 'tree' && selectedTree && (
              <TreeDetails
                selectedTree={selectedTree}
                speciesCounts={speciesCounts}
                setSelectedSpecies={setSelectedSpecies}
                setSelectedNeighborhood={setSelectedNeighborhood}
                handleDrawerClose={handleDrawerClose}
                setToastMessage={(message) => setToast({ message, severity: 'success' })}
                landmark={LANDMARKS_ENABLED ? (selectedLandmark ?? landmarksByTreeId.get(selectedTree.id)) : undefined}
              />
            )}
            {panelView === 'landmark' && selectedLandmark && (
              <LandmarkDetails
                landmark={selectedLandmark}
                onClose={() => {
                  if (isMobile) {
                    setMobileExpanded(false)
                  } else {
                    setPanelView('closed')
                    setSelectedLandmark(null)
                  }
                }}
              />
            )}
            {panelView === 'stats' && (
              <ForestStats
                totalTrees={allTrees.length}
                speciesCounts={speciesCounts}
                allTrees={allTrees}
                neighborhoodCounts={neighborhoodCounts}
                loading={loading}
                setSelectedSpecies={(s) => {
                  setSelectedSpecies(s)
                  setMobileExpanded(false)
                  setPanelView('closed')
                }}
                onClose={() => {
                  if (selectedTree) {
                    setPanelView('tree')
                    setMobileExpanded(false)
                  } else if (selectedLandmark) {
                    setPanelView('landmark')
                    setMobileExpanded(false)
                  } else {
                    setPanelView('closed')
                  }
                }}
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
              backgroundColor: appTheme.palette.primary.main,
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
