import { useState, useEffect, RefObject } from 'react'
import type { Feature, FeatureCollection, Point, GeoJsonProperties } from 'geojson'
import mapboxgl from 'mapbox-gl'
import { TreeInfo } from '../types/tree'

type RemovalFilter = 'all' | 'only' | 'hide'

export function useTreeFilters(
  map: RefObject<mapboxgl.Map | null>,
  allTrees: TreeInfo[]
) {
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null)
  const [removalFilter, setRemovalFilter] = useState<RemovalFilter>('all')

  useEffect(() => {
    if (!map.current) return

    const hasActiveFilter = !!selectedSpecies || !!selectedNeighborhood || removalFilter !== 'all'

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filters: any[] = []
      if (selectedSpecies) filters.push(['==', ['get', 'species'], selectedSpecies])
      if (selectedNeighborhood) filters.push(['==', ['get', 'neighborhood_name'], selectedNeighborhood])
      if (removalFilter === 'only') filters.push(['==', ['get', 'markedForRemoval'], true])
      if (removalFilter === 'hide') filters.push(['!=', ['get', 'markedForRemoval'], true])

      if (filters.length === 0) {
        map.current.setFilter('tree-points', null)
      } else if (filters.length === 1) {
        map.current.setFilter('tree-points', filters[0])
      } else {
        map.current.setFilter('tree-points', ['all', ...filters])
      }

      const filteredTrees = hasActiveFilter
        ? allTrees.filter(tree =>
            (!selectedSpecies || tree.species === selectedSpecies) &&
            (!selectedNeighborhood || tree.neighborhood_name === selectedNeighborhood) &&
            (removalFilter === 'all' || (removalFilter === 'only' ? tree.markedForRemoval : !tree.markedForRemoval))
          )
        : []

      const featureCollection: FeatureCollection<Point, GeoJsonProperties> = {
        type: 'FeatureCollection',
        features: filteredTrees.map(tree => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [tree.longitude, tree.latitude] },
          properties: { ...tree },
        } as Feature<Point, GeoJsonProperties>)),
      }

      const source = map.current.getSource('filtered-trees')
      if (source && 'setData' in source) {
        (source as mapboxgl.GeoJSONSource).setData(featureCollection)
      }

      if (map.current.getLayer('filtered-tree-points')) {
        map.current.setLayoutProperty(
          'filtered-tree-points',
          'visibility',
          hasActiveFilter ? 'visible' : 'none'
        )
      }
    } catch (err) {
      console.error('Error applying filter:', err)
    }

    return () => {
      if (map.current?.isStyleLoaded()) {
        try {
          if (map.current.getLayer('tree-points')) {
            map.current.setFilter('tree-points', null)
          }
          if (map.current.getLayer('filtered-tree-points')) {
            map.current.setLayoutProperty('filtered-tree-points', 'visibility', 'none')
          }
        } catch (err) {
          console.error('Error removing filter:', err)
        }
      }
    }
  }, [selectedSpecies, selectedNeighborhood, removalFilter, allTrees, map])

  return { selectedSpecies, setSelectedSpecies, selectedNeighborhood, setSelectedNeighborhood, removalFilter, setRemovalFilter }
}
