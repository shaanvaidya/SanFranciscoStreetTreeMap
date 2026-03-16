import { useState, useEffect } from 'react'
import { TreeInfo } from '../types/tree'

export type TreeDataState = {
  allTrees: TreeInfo[]
  species: string[]
  neighborhoods: string[]
  speciesCounts: Record<string, number>
  neighborhoodCounts: Record<string, number>
  loading: boolean
  error: string | null
}

export function useTreeData(): TreeDataState {
  const [allTrees, setAllTrees] = useState<TreeInfo[]>([])
  const [species, setSpecies] = useState<string[]>([])
  const [neighborhoods, setNeighborhoods] = useState<string[]>([])
  const [speciesCounts, setSpeciesCounts] = useState<Record<string, number>>({})
  const [neighborhoodCounts, setNeighborhoodCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}trees-lookup.json`)
      .then(r => r.json())
      .then((data: TreeInfo[]) => {
        const uniqueSpecies = new Set<string>()
        const uniqueNeighborhoods = new Set<string>()
        const sCounts: Record<string, number> = {}
        const nCounts: Record<string, number> = {}

        data.forEach(tree => {
          if (tree.species) {
            uniqueSpecies.add(tree.species)
            sCounts[tree.species] = (sCounts[tree.species] || 0) + 1
          }
          if (tree.neighborhood_name) {
            uniqueNeighborhoods.add(tree.neighborhood_name)
            nCounts[tree.neighborhood_name] = (nCounts[tree.neighborhood_name] || 0) + 1
          }
        })

        setAllTrees(data)
        setSpecies(Array.from(uniqueSpecies).sort())
        setNeighborhoods(Array.from(uniqueNeighborhoods).sort())
        setSpeciesCounts(sCounts)
        setNeighborhoodCounts(nCounts)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading tree metadata:', err)
        setError('Failed to load tree data. Please refresh.')
        setLoading(false)
      })
  }, [])

  return { allTrees, species, neighborhoods, speciesCounts, neighborhoodCounts, loading, error }
}
