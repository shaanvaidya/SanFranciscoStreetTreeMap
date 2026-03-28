import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { LocateFixed, Cake, X } from 'lucide-react'
import { toast } from 'sonner'
import 'mapbox-gl/dist/mapbox-gl.css'
import { ThemeProvider } from './components/theme-provider'
import { useThemeMode } from './components/theme-provider'
import { Toaster } from './components/ui/sonner'
import { Badge } from './components/ui/badge'
import { useMediaQuery } from './hooks/useMediaQuery'
import { TreeInfo } from './types/tree'
import { LandmarkInfo } from './types/landmark'
import TreeDetails from './components/TreeDetails'
import TreeSummaryBar from './components/TreeSummaryBar'
import HeaderBar from './components/HeaderBar'
import FiltersPanel from './components/Filters/FiltersPanel'
import LandmarkDetails from './components/LandmarkDetails'
import ForestStats from './components/ForestStats'
import BirthdayTreeFinder from './components/BirthdayTreeFinder'
import { useTreeData } from './hooks/useTreeData'
import { useTreeFilters } from './hooks/useTreeFilters'
import { useLandmarks } from './hooks/useLandmarks'
import { LANDMARKS_ENABLED } from './flags'
import { BirthdayResults, findBirthdayTrees, findNearestTree } from './utils/birthdayMatch'

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

  mapInstance.addSource('birthday-trees', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })

  mapInstance.addSource('birthday-exact-glow', {
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

  // Pulsing glow ring for exact-date birthday matches
  mapInstance.addLayer({
    id: 'birthday-exact-glow',
    type: 'circle',
    source: 'birthday-exact-glow',
    paint: {
      'circle-radius': 12,
      'circle-color': '#F9A825',
      'circle-opacity': 0.3,
      'circle-stroke-width': 0,
    },
    layout: { visibility: 'none' },
  })

  // Birthday tree layers — DBH-scaled dots, slightly larger than normal
  const birthdayCircleRadius = [
    'interpolate', ['linear'], ['zoom'],
    10, ['interpolate', ['linear'], ['min', ['coalesce', ['get', 'dbh'], 0], 60], 0, 3, 30, 3.5, 60, 4.5],
    16, ['interpolate', ['linear'], ['min', ['coalesce', ['get', 'dbh'], 0], 60], 0, 7, 30, 9, 60, 11],
  ]
  mapInstance.addLayer({
    id: 'birthday-tree-points',
    type: 'circle',
    source: 'birthday-trees',
    paint: {
      'circle-radius': birthdayCircleRadius as mapboxgl.Expression,
      'circle-color': ['get', 'birthdayColor'],
      'circle-opacity': 1,
      'circle-stroke-width': 2,
      'circle-stroke-color': isDark ? 'rgba(18, 18, 18, 0.8)' : '#ffffff',
      'circle-stroke-opacity': 1,
    },
    layout: { visibility: 'none' },
  })

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

function AppInner() {
  const { resolvedTheme: mode, setTheme } = useThemeMode()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null)
  const mapInitialized = useRef(false)
  const paddingInitialized = useRef(false)
  const skipNextPaddingEaseTo = useRef(false)
  const [mapReady, setMapReady] = useState(false)
  const initialTreeId = useRef<string | null>(new URLSearchParams(window.location.search).get('tree'))
  const initialBirthday = useRef<string | null>(new URLSearchParams(window.location.search).get('birthday'))

  const isMobile = useMediaQuery('(max-width:600px)')
  const modeRef = useRef(mode)
  modeRef.current = mode

  const toggleTheme = () => {
    setTheme(mode === 'light' ? 'dark' : 'light')
  }

  const { allTrees, species, neighborhoods, speciesCounts, neighborhoodCounts, loading, error } = useTreeData()
  useEffect(() => { if (error) toast.error(error) }, [error])
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
    skipNextPaddingEaseTo.current = true
    setSelectedTree(enriched)
    setPanelView('tree')
    const w = window.innerWidth
    const mobile = w < 600
    const sidebarWidth = w >= 1200 ? 600 : w >= 900 ? 500 : 400
    const padding = mobile
      ? { top: 56, right: 0, bottom: Math.round(window.innerHeight * 0.4), left: 0 }
      : { top: 56, right: sidebarWidth, bottom: 0, left: 0 }
    map.current?.flyTo({ center: [tree.longitude, tree.latitude], zoom: 18, duration: 1000, essential: true, padding })
  }, [allTrees, mapReady])

  // On load: auto-activate birthday from URL once data is ready
  useEffect(() => {
    if (allTrees.length === 0 || !mapReady) return
    const birthdayParam = initialBirthday.current
    if (!birthdayParam) return
    initialBirthday.current = null
    const parts = birthdayParam.split('-')
    if (parts.length !== 3) return
    const [y, m, d] = parts.map(Number)
    if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return
    const birthday = new Date(y, m - 1, d)
    const results = findBirthdayTrees(allTrees, m, d, y)
    handleBirthdayResults(results, birthday)
  }, [allTrees, mapReady])

  const [showFilters, setShowFilters] = useState(false)
  const [addressQuery, setAddressQuery] = useState('')
  // Toast helper — uses sonner
  const showToast = (message: string, severity: 'success' | 'error' = 'success') => {
    if (severity === 'error') toast.error(message)
    else toast.success(message)
  }

  // Birthday tree mode
  const [birthdayDialogOpen, setBirthdayDialogOpen] = useState(false)
  const [birthdayActive, setBirthdayActive] = useState(false)
  const [birthdayDate, setBirthdayDate] = useState<Date | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const birthdayFeaturesRef = useRef<any[]>([])


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

        const w = window.innerWidth
        const mobile = w < 600
        const sidebarWidth = w >= 1200 ? 600 : w >= 900 ? 500 : 400
        const padding = mobile
          ? { top: 56, right: 0, bottom: Math.round(window.innerHeight * 0.4), left: 0 }
          : { top: 56, right: sidebarWidth, bottom: 0, left: 0 }

        map.current?.flyTo({
          center: [props.longitude, props.latitude],
          zoom: 18,
          duration: 1000,
          essential: true,
          padding,
        })
      })

      // Click a birthday tree point
      map.current.on('click', 'birthday-tree-points', (e) => {
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
          permitDate: props.permitDate ?? null,
        })
        setPanelView('tree')
        setMobileExpanded(false)

        const w = window.innerWidth
        const mobile = w < 600
        const sidebarWidth = w >= 1200 ? 600 : w >= 900 ? 500 : 400
        const padding = mobile
          ? { top: 56, right: 0, bottom: Math.round(window.innerHeight * 0.4), left: 0 }
          : { top: 56, right: sidebarWidth, bottom: 0, left: 0 }

        map.current?.flyTo({
          center: [props.longitude, props.latitude],
          zoom: 18,
          duration: 1000,
          essential: true,
          padding,
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

        const w = window.innerWidth
        const mobile = w < 600
        const sidebarWidth = w >= 1200 ? 600 : w >= 900 ? 500 : 400
        const padding = mobile
          ? { top: 56, right: 0, bottom: Math.round(window.innerHeight * 0.4), left: 0 }
          : { top: 56, right: sidebarWidth, bottom: 0, left: 0 }
        map.current?.flyTo({ center: [landmark.longitude, landmark.latitude], zoom: 18, duration: 1000, essential: true, padding })
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
      map.current.on('mouseenter', 'birthday-tree-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })
      map.current.on('mouseleave', 'birthday-tree-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })
      map.current.on('mousemove', (e) => {
        if (!map.current) return
        const layers = LANDMARKS_ENABLED
          ? ['tree-points', 'landmark-points', 'birthday-tree-points']
          : ['tree-points', 'birthday-tree-points']
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
      // Restore birthday tree data after style change
      if (birthdayFeaturesRef.current.length > 0) {
        const src = map.current.getSource('birthday-trees')
        if (src && 'setData' in src) {
          (src as mapboxgl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: birthdayFeaturesRef.current,
          })
        }
        // Restore glow features (exact-date matches have gold color)
        const glowFeatures = birthdayFeaturesRef.current
          .filter((f: { properties: { birthdayColor: string } }) => f.properties.birthdayColor === '#F9A825')
          .map((f: { geometry: { coordinates: number[] } }) => ({
            type: 'Feature' as const,
            geometry: f.geometry,
            properties: {},
          }))
        const glowSrc = map.current.getSource('birthday-exact-glow')
        if (glowSrc && 'setData' in glowSrc && glowFeatures.length > 0) {
          (glowSrc as mapboxgl.GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: glowFeatures,
          })
        }
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

  // Birthday mode: hide trees, show birthday layer, pulse glow for exact matches
  useEffect(() => {
    if (!mapReady || !map.current) return
    if (map.current.getLayer('birthday-tree-points')) {
      map.current.setLayoutProperty('birthday-tree-points', 'visibility', birthdayActive ? 'visible' : 'none')
    }
    if (map.current.getLayer('birthday-exact-glow')) {
      map.current.setLayoutProperty('birthday-exact-glow', 'visibility', birthdayActive ? 'visible' : 'none')
    }
    if (map.current.getLayer('tree-points') && !showLandmarks) {
      map.current.setLayoutProperty('tree-points', 'visibility', birthdayActive ? 'none' : 'visible')
      if (!birthdayActive) {
        map.current.setPaintProperty('tree-points', 'circle-opacity',
          ['interpolate', ['linear'], ['zoom'], 10, 0.6, 15, 0.8, 20, 1])
      }
    }

    // Pulse animation for exact-date glow
    if (!birthdayActive) return
    let animId: number
    const pulse = () => {
      if (!map.current?.getLayer('birthday-exact-glow')) return
      const t = (Math.sin(Date.now() / 500) + 1) / 2 // 0-1 oscillation
      const radius = 14 + t * 10   // 14-24px
      const opacity = 0.35 - t * 0.2 // 0.35-0.15
      map.current.setPaintProperty('birthday-exact-glow', 'circle-radius', radius)
      map.current.setPaintProperty('birthday-exact-glow', 'circle-opacity', opacity)
      animId = requestAnimationFrame(pulse)
    }
    animId = requestAnimationFrame(pulse)
    return () => cancelAnimationFrame(animId)
  }, [birthdayActive, mapReady, showLandmarks])

  const handleBirthdayResults = (results: BirthdayResults, birthday: Date) => {
    if (!map.current) return
    setBirthdayDate(birthday)

    // Sync birthday to URL
    const params = new URLSearchParams(window.location.search)
    const m = birthday.getMonth() + 1
    const d = birthday.getDate()
    const y = birthday.getFullYear()
    params.set('birthday', `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState(null, '', newUrl)

    // Three bold, distinct colors per tier
    const exactColor = '#F9A825'   // amber/gold — exact birth date
    const sameDayColor = '#4caf50' // green — same month/day, any year
    const weekColor = '#29b6f6'    // blue — within 7 days

    // Build GeoJSON features with tier-based colors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const features: any[] = []
    const exactIds = new Set(results.exactDate.map(t => t.id))
    const sameDayIds = new Set(results.sameDayAnyYear.map(t => t.id))

    // Exact date matches get gold
    for (const tree of results.exactDate) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [tree.longitude, tree.latitude] },
        properties: { ...tree, birthdayColor: exactColor },
      })
    }
    // Same day (non-exact) get green
    for (const tree of results.sameDayAnyYear) {
      if (!exactIds.has(tree.id)) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [tree.longitude, tree.latitude] },
          properties: { ...tree, birthdayColor: sameDayColor },
        })
      }
    }
    // Within week get blue
    for (const tree of results.withinWeek) {
      if (!sameDayIds.has(tree.id)) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [tree.longitude, tree.latitude] },
          properties: { ...tree, birthdayColor: weekColor },
        })
      }
    }

    birthdayFeaturesRef.current = features

    const source = map.current.getSource('birthday-trees')
    if (source && 'setData' in source) {
      (source as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features,
      })
    }

    // Populate glow source with exact-date matches
    const glowSource = map.current.getSource('birthday-exact-glow')
    if (glowSource && 'setData' in glowSource) {
      (glowSource as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: results.exactDate.map(tree => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [tree.longitude, tree.latitude] },
          properties: {},
        })),
      })
    }

    setBirthdayActive(features.length > 0)

    // Auto-fly to nearest birthday tree
    if (features.length > 0) {
      // Prefer same-day trees, fall back to within-week
      const preferredTrees = results.sameDayAnyYear.length > 0 ? results.sameDayAnyYear : results.withinWeek
      // Try to find nearest to user location, otherwise pick first
      const mapCenter = map.current.getCenter()
      const nearest = findNearestTree(preferredTrees, mapCenter.lat, mapCenter.lng)
      if (nearest) {
        const w = window.innerWidth
        const sidebarWidth = w >= 1200 ? 600 : w >= 900 ? 500 : 400
        const mobile = w < 600
        const padding = mobile
          ? { top: 56, right: 0, bottom: 0, left: 0 }
          : { top: 56, right: sidebarWidth, bottom: 0, left: 0 }
        map.current.flyTo({
          center: [nearest.longitude, nearest.latitude],
          zoom: 13,
          duration: 1200,
          essential: true,
          padding,
        })
      }
    }
  }

  const handleBirthdayClear = () => {
    setBirthdayActive(false)
    setBirthdayDate(null)
    birthdayFeaturesRef.current = []
    if (map.current) {
      const source = map.current.getSource('birthday-trees')
      if (source && 'setData' in source) {
        (source as mapboxgl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] })
      }
      const glowSource = map.current.getSource('birthday-exact-glow')
      if (glowSource && 'setData' in glowSource) {
        (glowSource as mapboxgl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] })
      }
    }
    // Clear URL param
    const params = new URLSearchParams(window.location.search)
    params.delete('birthday')
    const newSearch = params.toString()
    const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }

  // Sync map padding with sidebar open/close (skip initial run — handled by Map constructor)
  useEffect(() => {
    if (!map.current || !mapReady) return
    if (!paddingInitialized.current) {
      paddingInitialized.current = true
      return
    }
    if (skipNextPaddingEaseTo.current) {
      skipNextPaddingEaseTo.current = false
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
      showToast('Geolocation is not supported by your browser.', 'error')
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
        showToast(`Location error: ${err.message}`, 'error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  }

  const isDark = mode === 'dark'

  return (
    <>
      <Toaster position="bottom-center" />
      <HeaderBar
        mode={mode}
        onToggleTheme={toggleTheme}
        onInfoClick={() => {
          setPanelView('stats')
          setMobileExpanded(true)
        }}
      />

      {loading && (
        <div className="fixed top-14 left-0 right-0 z-[1100] h-0.5 bg-primary/10">
          <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
        </div>
      )}

      <div className="h-dvh w-screen overflow-hidden relative [&_.mapboxgl-ctrl-geolocate]:hidden">
        <div
          ref={mapContainer}
          className="absolute top-14 bottom-0 w-full transition-opacity duration-300 ease-in-out"
          style={{ opacity: mapReady ? 1 : 0 }}
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

        <button
          onClick={() => {
            if (geolocateControlRef.current) {
              geolocateControlRef.current.trigger()
            } else {
              handleLocationClick()
            }
          }}
          className="absolute z-[500] w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-colors border-none cursor-pointer"
          style={{
            bottom: isMobile ? (showSummaryBar ? 120 : 30) : 40,
            right: isMobile ? 20
              : (allTrees.length > 0 && desktopPanelOpen) ? (window.innerWidth >= 1024 ? 620 : window.innerWidth >= 768 ? 520 : 420) : 20,
            backgroundColor: isDark ? '#1e1e1e' : 'white',
            color: isDark ? '#4caf50' : '#2e7d32',
          }}
        >
          <LocateFixed className="h-6 w-6" />
        </button>

        {/* Birthday tree button */}
        <button
          onClick={() => setBirthdayDialogOpen(true)}
          className="absolute z-[500] w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-colors border-none cursor-pointer"
          style={{
            bottom: isMobile ? (showSummaryBar ? 120 : 30) : 40,
            right: isMobile ? 76
              : (allTrees.length > 0 && desktopPanelOpen) ? (window.innerWidth >= 1024 ? 676 : window.innerWidth >= 768 ? 576 : 476) : 76,
            backgroundColor: birthdayActive
              ? (isDark ? '#1b5e20' : '#2e7d32')
              : (isDark ? '#1e1e1e' : 'white'),
            color: birthdayActive ? '#fff' : (isDark ? '#4caf50' : '#2e7d32'),
          }}
        >
          <Cake className="h-6 w-6" />
        </button>

        {/* Birthday mode active chip */}
        {birthdayActive && (
          <Badge
            variant="outline"
            className="absolute z-[500] h-8 gap-1.5 font-semibold backdrop-blur-[10px] shadow-md cursor-default"
            style={{
              bottom: isMobile ? (showSummaryBar ? 176 : 86) : 96,
              right: isMobile ? 20
                : (allTrees.length > 0 && desktopPanelOpen) ? (window.innerWidth >= 1024 ? 620 : window.innerWidth >= 768 ? 520 : 420) : 20,
              backgroundColor: isDark ? 'rgba(18,18,18,0.95)' : 'rgba(255,255,255,0.95)',
              color: isDark ? '#81c784' : '#2e7d32',
              borderColor: isDark ? 'rgba(76,175,80,0.25)' : 'rgba(46,125,50,0.15)',
            }}
          >
            <Cake className="h-4 w-4" />
            Birthday Trees
            <button
              onClick={handleBirthdayClear}
              className="bg-transparent border-none cursor-pointer p-0 hover:opacity-100"
              style={{ color: isDark ? 'rgba(129,199,132,0.5)' : 'rgba(46,125,50,0.4)' }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        )}

        <BirthdayTreeFinder
          open={birthdayDialogOpen}
          onClose={() => setBirthdayDialogOpen(false)}
          allTrees={allTrees}
          onResults={handleBirthdayResults}
          onClear={handleBirthdayClear}
          hasResults={birthdayActive}
          birthdayDate={birthdayDate}
        />

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
            <div
              onClick={() => setPanelView('stats')}
              className="hidden sm:flex absolute top-[calc(50%+28px)] right-0 -translate-y-1/2 z-[999] items-center justify-center w-7 h-16 rounded-l-md cursor-pointer text-xs backdrop-blur-[10px] transition-colors hover:text-[var(--heading)]"
              style={{
                backgroundColor: isDark ? 'rgba(18,18,18,0.95)' : 'rgba(248,249,250,0.95)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0'}`,
                borderRight: 'none',
                boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
                color: isDark ? '#a5d6a7' : '#4caf50',
              }}
            >
              ‹
            </div>
          )}

          <div
            className="absolute right-0 z-[1000] flex flex-col backdrop-blur-[10px] transition-all duration-300 ease-in-out
              bottom-0 sm:bottom-auto sm:top-14 left-0 sm:left-auto
              w-full sm:w-[400px] md:w-[500px] lg:w-[600px]
              h-full sm:h-[calc(100%-56px)]"
            style={{
              backgroundColor: isDark ? 'rgba(18, 18, 18, 0.95)' : 'rgba(248, 249, 250, 0.95)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderLeft: !isMobile ? `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0'}` : undefined,
              transform: isMobile
                ? (mobilePanelOpen ? 'translateY(0%)' : 'translateY(100%)')
                : (desktopPanelOpen ? 'translateX(0)' : 'translateX(100%)'),
              opacity: isMobile ? (mobilePanelOpen ? 1 : 0) : (desktopPanelOpen ? 1 : 0),
              pointerEvents: isMobile ? (mobilePanelOpen ? 'auto' : 'none') : (desktopPanelOpen ? 'auto' : 'none'),
            }}
          >
            {panelView === 'tree' && selectedTree && (
              <TreeDetails
                selectedTree={selectedTree}
                speciesCounts={speciesCounts}
                setSelectedSpecies={setSelectedSpecies}
                setSelectedNeighborhood={setSelectedNeighborhood}
                handleDrawerClose={handleDrawerClose}
                setToastMessage={(message) => showToast(message)}
                landmark={LANDMARKS_ENABLED ? (selectedLandmark ?? landmarksByTreeId.get(selectedTree.id)) : undefined}
                birthdayDate={birthdayActive ? birthdayDate : null}
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
                  if (isMobile) {
                    setMobileExpanded(false)
                    setPanelView('closed')
                  }
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
          </div>
        </>
      </div>
    </>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AppInner />
    </ThemeProvider>
  )
}

export default App
